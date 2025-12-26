import express from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/surveys/:surveyId/responses - Get all responses for a survey (Admin)
router.get('/:surveyId/responses', authenticateToken, async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { training_id } = req.query;

    const responses = await prisma.surveyResponse.findMany({
      where: {
        survey_id: surveyId,
        ...(training_id && { training_id: training_id as string }),
      },
      include: {
        beneficiary: {
          select: {
            teacher_id: true,
            name: true,
            name_english: true,
          },
        },
        question_responses: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { submitted_at: 'desc' },
    });

    res.json(responses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

// GET /api/surveys/:surveyId/start/:beneficiaryId - Start a new survey attempt
router.get('/:surveyId/start/:beneficiaryId', authenticateToken, async (req, res) => {
  try {
    const { surveyId, beneficiaryId } = req.params;
    const { training_id } = req.query;

    if (!training_id) {
      return res.status(400).json({ error: 'training_id is required' });
    }

    // Get survey with questions
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        questions: {
          orderBy: { sort_order: 'asc' },
        },
      },
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Check existing responses
    const existingResponses = await prisma.surveyResponse.findMany({
      where: {
        survey_id: surveyId,
        beneficiary_id: beneficiaryId,
        training_id: training_id as string,
      },
    });

    // Check if retakes are allowed
    if (existingResponses.length > 0 && !survey.allow_retake) {
      return res.status(400).json({ error: 'Survey already completed. Retakes not allowed.' });
    }

    // Check max attempts
    if (survey.max_attempts && existingResponses.length >= survey.max_attempts) {
      return res.status(400).json({ error: `Maximum attempts (${survey.max_attempts}) reached` });
    }

    // Create or get draft response
    const attemptNumber = existingResponses.length + 1;

    let response = await prisma.surveyResponse.findFirst({
      where: {
        survey_id: surveyId,
        beneficiary_id: beneficiaryId,
        training_id: training_id as string,
        attempt_number: attemptNumber,
        is_complete: false,
      },
      include: {
        question_responses: true,
      },
    });

    if (!response) {
      response = await prisma.surveyResponse.create({
        data: {
          survey_id: surveyId,
          beneficiary_id: beneficiaryId,
          training_id: training_id as string,
          attempt_number: attemptNumber,
          started_at: new Date(),
        },
        include: {
          question_responses: true,
        },
      });
    }

    res.json({
      survey,
      response,
    });
  } catch (error) {
    console.error('Error starting survey:', error);
    res.status(500).json({ error: 'Failed to start survey' });
  }
});

// POST /api/surveys/:surveyId/responses - Submit survey response
router.post('/:surveyId/responses', authenticateToken, async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { beneficiary_id, training_id, answers, time_spent_seconds } = req.body;

    if (!beneficiary_id || !training_id || !answers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get survey with questions
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: { questions: true },
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Check existing attempts
    const existingResponses = await prisma.surveyResponse.findMany({
      where: {
        survey_id: surveyId,
        beneficiary_id,
        training_id,
      },
    });

    const attemptNumber = existingResponses.length + 1;

    // Calculate score for tests
    let totalScore = 0;
    let maxScore = 0;
    const questionResponses = [];

    for (const answer of answers) {
      const question = survey.questions.find((q) => q.id === answer.question_id);
      if (!question) continue;

      let points_earned = null;
      let is_correct = null;

      if (question.points && question.correct_answer) {
        maxScore += question.points;
        // Simple comparison for now (can be enhanced for complex grading)
        is_correct = answer.answer_value === question.correct_answer;
        points_earned = is_correct ? question.points : 0;
        totalScore += points_earned;
      }

      questionResponses.push({
        question_id: answer.question_id,
        answer_value: answer.answer_value,
        answer_text: answer.answer_text,
        points_earned,
        is_correct,
      });
    }

    // Calculate percentage and pass/fail
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : null;
    const passed =
      percentage !== null && survey.passing_score
        ? percentage >= survey.passing_score
        : null;

    // Create response
    const response = await prisma.surveyResponse.create({
      data: {
        survey_id: surveyId,
        beneficiary_id,
        training_id,
        attempt_number: attemptNumber,
        started_at: new Date(),
        submitted_at: new Date(),
        is_complete: true,
        total_score: totalScore,
        max_score: maxScore > 0 ? maxScore : null,
        percentage,
        passed,
        time_spent_seconds,
        question_responses: {
          create: questionResponses,
        },
      },
      include: {
        question_responses: {
          include: {
            question: true,
          },
        },
      },
    });

    res.status(201).json(response);
  } catch (error) {
    console.error('Error submitting survey:', error);
    res.status(500).json({ error: 'Failed to submit survey' });
  }
});

// GET /api/surveys/:surveyId/results - Get aggregated results (Admin)
router.get('/:surveyId/results', authenticateToken, async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { training_id } = req.query;

    const responses = await prisma.surveyResponse.findMany({
      where: {
        survey_id: surveyId,
        is_complete: true,
        ...(training_id && { training_id: training_id as string }),
      },
      include: {
        question_responses: true,
      },
    });

    const totalResponses = responses.length;
    const avgScore = totalResponses > 0
      ? responses.reduce((sum, r) => sum + (r.percentage || 0), 0) / totalResponses
      : 0;
    const passedCount = responses.filter((r) => r.passed).length;

    res.json({
      total_responses: totalResponses,
      average_score: avgScore,
      pass_rate: totalResponses > 0 ? (passedCount / totalResponses) * 100 : 0,
      responses,
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// GET /api/beneficiaries/:beneficiaryId/surveys - Get surveys for beneficiary
router.get('/beneficiaries/:beneficiaryId/surveys', authenticateToken, async (req, res) => {
  try {
    const { beneficiaryId } = req.params;

    // Get all trainings beneficiary is enrolled in
    const enrollments = await prisma.beneficiaryTraining.findMany({
      where: { beneficiary_id: beneficiaryId },
      select: { training_id: true },
    });

    const trainingIds = enrollments.map((e) => e.training_id);

    // Get all surveys linked to those trainings
    const surveyLinks = await prisma.trainingSurveyLink.findMany({
      where: {
        training_id: { in: trainingIds },
      },
      include: {
        survey: {
          include: {
            _count: {
              select: { questions: true },
            },
          },
        },
        training: {
          select: {
            id: true,
            training_code: true,
            training_name: true,
            training_name_english: true,
          },
        },
      },
    });

    // Get responses for this beneficiary
    const responses = await prisma.surveyResponse.findMany({
      where: {
        beneficiary_id: beneficiaryId,
      },
    });

    // Combine data
    const surveysWithStatus = surveyLinks.map((link) => {
      const response = responses.find(
        (r) => r.survey_id === link.survey_id && r.training_id === link.training_id
      );

      return {
        ...link,
        completed: response?.is_complete || false,
        score: response?.percentage,
        passed: response?.passed,
        submitted_at: response?.submitted_at,
      };
    });

    res.json(surveysWithStatus);
  } catch (error) {
    console.error('Error fetching beneficiary surveys:', error);
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
});

export default router;
