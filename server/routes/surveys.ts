import express from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/surveys - Get all surveys
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, search } = req.query;

    const surveys = await prisma.survey.findMany({
      where: {
        is_active: true,
        ...(type && { survey_type: type as string }),
        ...(search && {
          OR: [
            { title_en: { contains: search as string, mode: 'insensitive' } },
            { title_km: { contains: search as string } },
          ],
        }),
      },
      include: {
        _count: {
          select: {
            questions: true,
            responses: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(surveys);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
});

// GET /api/surveys/:id - Get survey with questions
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { sort_order: 'asc' },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    res.json(survey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({ error: 'Failed to fetch survey' });
  }
});

// POST /api/surveys - Create new survey
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title_en,
      title_km,
      description_en,
      description_km,
      survey_type,
      is_template,
      is_required,
      passing_score,
      time_limit,
      allow_retake,
      max_attempts,
      show_results_to_beneficiary,
      show_correct_answers,
      available_from,
      available_until,
      questions,
    } = req.body;

    const userId = req.user?.userId;

    const survey = await prisma.survey.create({
      data: {
        title_en,
        title_km,
        description_en,
        description_km,
        survey_type,
        is_template: is_template || false,
        is_required: is_required || false,
        passing_score,
        time_limit,
        allow_retake: allow_retake || false,
        max_attempts,
        show_results_to_beneficiary: show_results_to_beneficiary !== false,
        show_correct_answers: show_correct_answers || false,
        available_from: available_from ? new Date(available_from) : null,
        available_until: available_until ? new Date(available_until) : null,
        created_by: userId,
        questions: questions
          ? {
              create: questions.map((q: any, index: number) => ({
                question_text_en: q.question_text_en,
                question_text_km: q.question_text_km,
                help_text_en: q.help_text_en,
                help_text_km: q.help_text_km,
                question_type: q.question_type,
                is_required: q.is_required !== false,
                sort_order: q.sort_order || index,
                points: q.points,
                correct_answer: q.correct_answer,
                options_en: q.options_en || [],
                options_km: q.options_km || [],
                scale_min: q.scale_min,
                scale_max: q.scale_max,
                scale_labels_en: q.scale_labels_en || [],
                scale_labels_km: q.scale_labels_km || [],
              })),
            }
          : undefined,
      },
      include: {
        questions: true,
      },
    });

    res.status(201).json(survey);
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({ error: 'Failed to create survey' });
  }
});

// PUT /api/surveys/:id - Update survey
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title_en,
      title_km,
      description_en,
      description_km,
      survey_type,
      is_template,
      is_required,
      passing_score,
      time_limit,
      allow_retake,
      max_attempts,
      show_results_to_beneficiary,
      show_correct_answers,
      available_from,
      available_until,
    } = req.body;

    const userId = req.user?.userId;

    const survey = await prisma.survey.update({
      where: { id },
      data: {
        title_en,
        title_km,
        description_en,
        description_km,
        survey_type,
        is_template,
        is_required,
        passing_score,
        time_limit,
        allow_retake,
        max_attempts,
        show_results_to_beneficiary,
        show_correct_answers,
        available_from: available_from ? new Date(available_from) : null,
        available_until: available_until ? new Date(available_until) : null,
        updated_by: userId,
      },
      include: {
        questions: {
          orderBy: { sort_order: 'asc' },
        },
      },
    });

    res.json(survey);
  } catch (error) {
    console.error('Error updating survey:', error);
    res.status(500).json({ error: 'Failed to update survey' });
  }
});

// DELETE /api/surveys/:id - Soft delete survey
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await prisma.survey.update({
      where: { id },
      data: { is_active: false },
    });

    res.json(survey);
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({ error: 'Failed to delete survey' });
  }
});

// POST /api/surveys/:id/questions - Add question to survey
router.post('/:id/questions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const questionData = req.body;

    const question = await prisma.surveyQuestion.create({
      data: {
        survey_id: id,
        question_text_en: questionData.question_text_en,
        question_text_km: questionData.question_text_km,
        help_text_en: questionData.help_text_en,
        help_text_km: questionData.help_text_km,
        question_type: questionData.question_type,
        is_required: questionData.is_required !== false,
        sort_order: questionData.sort_order || 0,
        points: questionData.points,
        correct_answer: questionData.correct_answer,
        options_en: questionData.options_en || [],
        options_km: questionData.options_km || [],
        scale_min: questionData.scale_min,
        scale_max: questionData.scale_max,
        scale_labels_en: questionData.scale_labels_en || [],
        scale_labels_km: questionData.scale_labels_km || [],
      },
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// PUT /api/surveys/:id/questions/:questionId - Update question
router.put('/:id/questions/:questionId', authenticateToken, async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await prisma.surveyQuestion.update({
      where: { id: questionId },
      data: req.body,
    });

    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// DELETE /api/surveys/:id/questions/:questionId - Delete question
router.delete('/:id/questions/:questionId', authenticateToken, async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await prisma.surveyQuestion.delete({
      where: { id: questionId },
    });

    res.json(question);
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// GET /api/trainings/:trainingId/surveys - Get surveys for training
router.get('/trainings/:trainingId/surveys', authenticateToken, async (req, res) => {
  try {
    const { trainingId } = req.params;

    const links = await prisma.trainingSurveyLink.findMany({
      where: { training_id: trainingId },
      include: {
        survey: {
          include: {
            _count: {
              select: { questions: true },
            },
          },
        },
      },
      orderBy: { sort_order: 'asc' },
    });

    res.json(links);
  } catch (error) {
    console.error('Error fetching training surveys:', error);
    res.status(500).json({ error: 'Failed to fetch training surveys' });
  }
});

// POST /api/trainings/:trainingId/surveys - Attach survey to training
router.post('/trainings/:trainingId/surveys', authenticateToken, async (req, res) => {
  try {
    const { trainingId } = req.params;
    const { survey_id, timing, is_required, custom_deadline } = req.body;
    const userId = req.user?.userId;

    const link = await prisma.trainingSurveyLink.create({
      data: {
        training_id: trainingId,
        survey_id,
        timing,
        is_required: is_required || false,
        custom_deadline: custom_deadline ? new Date(custom_deadline) : null,
        linked_by: userId,
      },
      include: {
        survey: true,
      },
    });

    res.status(201).json(link);
  } catch (error) {
    console.error('Error attaching survey:', error);
    res.status(500).json({ error: 'Failed to attach survey' });
  }
});

// DELETE /api/trainings/:trainingId/surveys/:linkId - Detach survey
router.delete('/trainings/:trainingId/surveys/:linkId', authenticateToken, async (req, res) => {
  try {
    const { linkId } = req.params;

    const link = await prisma.trainingSurveyLink.delete({
      where: { id: linkId },
    });

    res.json(link);
  } catch (error) {
    console.error('Error detaching survey:', error);
    res.status(500).json({ error: 'Failed to detach survey' });
  }
});

export default router;
