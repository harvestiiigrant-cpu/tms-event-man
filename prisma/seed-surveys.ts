import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new pg.Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
});

async function seedSurveys() {
  console.log('📋 Starting surveys seed...');

  try {
    // Clear existing surveys and questions
    console.log('🗑️  Clearing existing surveys...');
    await prisma.surveyQuestionResponse.deleteMany();
    await prisma.surveyResponse.deleteMany();
    await prisma.surveyQuestion.deleteMany();
    await prisma.trainingSurveyLink.deleteMany();
    await prisma.survey.deleteMany();

    console.log('✍️  Seeding 3 sample surveys...');

    // Survey 1: Pre-Test (Knowledge Assessment)
    const preTest = await prisma.survey.create({
      data: {
        title_en: 'Pre-Training Knowledge Assessment',
        title_km: 'ការវាយតម្លៃចំណេះដឹងមុនបណ្តុះបណ្តាល',
        description_en: 'Assessment of baseline knowledge before the training begins',
        description_km: 'ការវាយតម្លៃចំណេះដឹងជាមូលដ្ឋានមុនពេលបណ្តុះបណ្តាលចាប់ផ្តើម',
        survey_type: 'PRE_TEST',
        is_template: false,
        is_required: true,
        passing_score: 70,
        time_limit: 30,
        allow_retake: true,
        max_attempts: 3,
        show_results_to_beneficiary: true,
        show_correct_answers: false,
        is_active: true,
        created_by: 'admin',
      },
    });

    // Add questions to pre-test
    await prisma.surveyQuestion.createMany({
      data: [
        {
          survey_id: preTest.id,
          question_text_en: 'What is the primary goal of this training?',
          question_text_km: 'តើគោលលក្ษ្ណ៍ចម្បងនៃការបណ្តុះបណ្តាលនេះគឺជាអ្វី?',
          question_type: 'MULTIPLE_CHOICE',
          is_required: true,
          sort_order: 1,
          points: 10,
          correct_answer: 'To improve teaching methodologies',
          options_en: [
            'To improve teaching methodologies',
            'To increase salary',
            'To reduce workload',
            'To obtain a certificate'
          ],
          options_km: [
            'ដើម្បីធានាសម្រាប់ការបង្រៀន',
            'ដើម្បីបង្កើនលុយឈរ',
            'ដើម្បីបន្ថយបន្ទុកការងារ',
            'ដើម្បីទទួលបានវិញ្ញាបនបត្រ'
          ],
        },
        {
          survey_id: preTest.id,
          question_text_en: 'Have you participated in similar training before?',
          question_text_km: 'តើលោកអ្នកបានចូលរួមក្នុងការបណ្តុះបណ្តាលប្រភេទស្រដៀងគ្នាពីមុនដែរឬទេ?',
          question_type: 'TRUE_FALSE',
          is_required: true,
          sort_order: 2,
          points: 5,
          correct_answer: 'No',
        },
        {
          survey_id: preTest.id,
          question_text_en: 'Rate your current knowledge level (1=Very Low, 5=Very High)',
          question_text_km: 'វាយតម្លៃកម្រិតចំណេះដឹងបច្ចុប្បន្នរបស់អ្នក (១=ទាបបំផុត, ៥=ខ្ពស់បំផុត)',
          question_type: 'LIKERT_SCALE',
          is_required: true,
          sort_order: 3,
          points: 10,
          scale_min: 1,
          scale_max: 5,
          scale_labels_en: ['Very Low', 'Low', 'Medium', 'High', 'Very High'],
          scale_labels_km: ['ទាបបំផុត', 'ទាប', 'មធ្យម', 'ខ្ពស់', 'ខ្ពស់បំផុត'],
        },
      ],
    });

    console.log('✅ Pre-Test Survey created with 3 questions');

    // Survey 2: Post-Test (Knowledge Assessment)
    const postTest = await prisma.survey.create({
      data: {
        title_en: 'Post-Training Knowledge Assessment',
        title_km: 'ការវាយតម្លៃចំណេះដឹងក្រោយបណ្តុះបណ្តាល',
        description_en: 'Assessment of knowledge gained after the training',
        description_km: 'ការវាយតម្លៃចំណេះដឹងដែលបានទទួលបន្ទាប់ពីការបណ្តុះបណ្តាល',
        survey_type: 'POST_TEST',
        is_template: false,
        is_required: true,
        passing_score: 75,
        time_limit: 45,
        allow_retake: true,
        max_attempts: 2,
        show_results_to_beneficiary: true,
        show_correct_answers: true,
        is_active: true,
        created_by: 'admin',
      },
    });

    // Add questions to post-test
    await prisma.surveyQuestion.createMany({
      data: [
        {
          survey_id: postTest.id,
          question_text_en: 'Which of the following is a key strategy learned in this training?',
          question_text_km: 'តើលក្ខណៈសម្បត្តិដូចខាងក្រោមណាដែលជាយុទ្ធសាស្ត្របូលបាននៃការបង្រៀនក្នុងការបណ្តុះបណ្តាលនេះ?',
          question_type: 'MULTIPLE_CHOICE',
          is_required: true,
          sort_order: 1,
          points: 15,
          correct_answer: 'Student-centered learning approach',
          options_en: [
            'Student-centered learning approach',
            'Traditional lecture only',
            'No classroom engagement',
            'Memorization only'
          ],
          options_km: [
            'វិធីសាស្រ្តរៀនដែលផ្តោតលើសិស្ស',
            'បង្រៀនលម្អិតប៉ុណ្ណាក្នុងតែប្រពៃណ',
            'គ្មានការចូលរួមក្នុងថ្នាក់រៀនលើច',
            'ការទន្ទេញដោយម៉ាកក្នុងតែ'
          ],
        },
        {
          survey_id: postTest.id,
          question_text_en: 'Do you feel confident applying the skills learned in your classroom?',
          question_text_km: 'តើលោកអ្នកមានទំនុកចិត្តក្នុងការប្រើប្រាស់សមត្ថភាពដែលរៀនមាននៅក្នុងថ្នាក់រៀនរបស់លោកអ្នកដែរឬទេ?',
          question_type: 'TRUE_FALSE',
          is_required: true,
          sort_order: 2,
          points: 10,
          correct_answer: 'Yes',
        },
        {
          survey_id: postTest.id,
          question_text_en: 'Select all key competencies you have acquired',
          question_text_km: 'ជ្រើសរើសលក្ខណៈសម្បត្តិសូចនាកម្មសកលសម្រាប់ដែលលោកអ្នកបានទទួល',
          question_type: 'MULTIPLE_SELECT',
          is_required: true,
          sort_order: 3,
          points: 15,
          options_en: [
            'Classroom management',
            'Student engagement',
            'Critical thinking promotion',
            'Assessment techniques',
            'Use of technology'
          ],
          options_km: [
            'ការគ្រប់គ្រងថ្នាក់រៀន',
            'ការចូលរួមនៃសិស្ស',
            'ការលើកកម្ពស់ការគិតស្ថូបនឹង',
            'បច្ចេកទេសវាយតម្លៃ',
            'ការប្រើប្រាស់បច្ចេកវិទ្យា'
          ],
        },
        {
          survey_id: postTest.id,
          question_text_en: 'Rate your confidence level in implementing new methodologies (1=Not confident, 5=Very confident)',
          question_text_km: 'វាយតម្លៃកម្រិតទំនុកចិត្តរបស់អ្នកក្នុងការអនុវត្ត (១=មិនមានទំនុកចិត្ត, ៥=មានទំនុកចិត្តខ្លាំង)',
          question_type: 'LIKERT_SCALE',
          is_required: true,
          sort_order: 4,
          points: 10,
          scale_min: 1,
          scale_max: 5,
          scale_labels_en: ['Not confident', 'Somewhat confident', 'Neutral', 'Confident', 'Very confident'],
          scale_labels_km: ['មិនមានទំនុកចិត្ត', 'មានទំនុកចិត្តខ្លះ', 'ព័ត៌មាន', 'មានទំនុកចិត្ត', 'មានទំនុកចិត្តខ្លាំង'],
        },
      ],
    });

    console.log('✅ Post-Test Survey created with 4 questions');

    // Survey 3: Feedback Survey
    const feedback = await prisma.survey.create({
      data: {
        title_en: 'Training Feedback & Evaluation',
        title_km: 'មតិយោបល់ និងការវាយតម្លៃការបណ្តុះបណ្តាល',
        description_en: 'Gather feedback about the training experience and suggest improvements',
        description_km: 'ប្រមូលមតិយោបល់អំពីបទពិសោធន៍ការបណ្តុះបណ្តាល និងស្នើរឱ្យមានការកែលម្អ',
        survey_type: 'FEEDBACK',
        is_template: false,
        is_required: false,
        allow_retake: false,
        show_results_to_beneficiary: true,
        show_correct_answers: false,
        is_active: true,
        created_by: 'admin',
      },
    });

    // Add questions to feedback survey
    await prisma.surveyQuestion.createMany({
      data: [
        {
          survey_id: feedback.id,
          question_text_en: 'How would you rate the trainer\'s delivery and presentation?',
          question_text_km: 'តើលោកអ្នកវាយតម្លៃយ៉ាងដូចម្តេចទៅលើការបង្ហាញយោបល់របស់គ្រូបង្រៀន?',
          question_type: 'RATING',
          is_required: true,
          sort_order: 1,
          scale_min: 1,
          scale_max: 5,
          scale_labels_en: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
          scale_labels_km: ['អាក្រក់', 'ល្អប្រៃណ', 'ល្អ', 'ល្អបង្គប់', 'ល្អប៉ុលាប់'],
        },
        {
          survey_id: feedback.id,
          question_text_en: 'Was the training content relevant and practical?',
          question_text_km: 'តើមាតិកាបណ្តុះបណ្តាលនឹងមានលក្ខណៈស្ថេរភាព ហើយមានលក្ខណៈជាក់ស្តែងដែរឬទេ?',
          question_type: 'TRUE_FALSE',
          is_required: true,
          sort_order: 2,
        },
        {
          survey_id: feedback.id,
          question_text_en: 'Rate the training venue and facilities',
          question_text_km: 'វាយតម្លៃលក្ខណៈបរិក្ខារដ្ឋាននិងផ្ទាំងបង្ហាញ',
          question_type: 'RATING',
          is_required: true,
          sort_order: 3,
          scale_min: 1,
          scale_max: 5,
          scale_labels_en: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'],
          scale_labels_km: ['អាក្រក់ខ្លាំង', 'អាក្រក់', 'មធ្យម', 'ល្អ', 'ល្អប៉ុលាប់'],
        },
        {
          survey_id: feedback.id,
          question_text_en: 'What aspects of the training could be improved?',
          question_text_km: 'ទិដ្ឋភាពណាដែលបង្រៀនអាចកែលម្អបានវេ?',
          question_type: 'LONG_TEXT',
          help_text_en: 'Please provide detailed suggestions',
          help_text_km: 'សូមផ្តល់ឱ្យនូវលម្អិតលម្អិត',
          is_required: false,
          sort_order: 4,
        },
        {
          survey_id: feedback.id,
          question_text_en: 'Would you recommend this training to other teachers?',
          question_text_km: 'តើលោកអ្នកនឹងដាក់ស្នើឱ្យគ្រូបង្រៀនដទៃទៀតប្រើប្រាស់ការបណ្តុះបណ្តាលនេះដែរឬទេ?',
          question_type: 'TRUE_FALSE',
          is_required: true,
          sort_order: 5,
        },
      ],
    });

    console.log('✅ Feedback Survey created with 5 questions');

    console.log('\n📊 Surveys Summary:');
    console.log('  ✓ Survey 1: Pre-Training Knowledge Assessment (3 questions)');
    console.log('    - Multiple Choice, True/False, Likert Scale');
    console.log('    - Passing Score: 70%, Time Limit: 30 min');
    console.log('');
    console.log('  ✓ Survey 2: Post-Training Knowledge Assessment (4 questions)');
    console.log('    - Multiple Choice, True/False, Multiple Select, Likert Scale');
    console.log('    - Passing Score: 75%, Time Limit: 45 min');
    console.log('');
    console.log('  ✓ Survey 3: Training Feedback & Evaluation (5 questions)');
    console.log('    - Rating, True/False, Long Text');
    console.log('    - Optional, No time limit');
    console.log('');
    console.log('✨ All surveys are active and ready to use!');

    await pool.end();
  } catch (error) {
    console.error('❌ Error seeding surveys:', error);
    await pool.end();
    process.exit(1);
  }
}

seedSurveys();
