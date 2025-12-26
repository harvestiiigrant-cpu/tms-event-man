-- CreateEnum
CREATE TYPE "SurveyType" AS ENUM ('PRE_TEST', 'POST_TEST', 'FEEDBACK', 'EVALUATION', 'COMMON_TEST');

-- CreateEnum
CREATE TYPE "SurveyTiming" AS ENUM ('BEFORE_TRAINING', 'DURING_TRAINING', 'AFTER_TRAINING');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'LIKERT_SCALE', 'RATING', 'SHORT_TEXT', 'LONG_TEXT');

-- CreateTable
CREATE TABLE "training_agendas" (
    "id" TEXT NOT NULL,
    "training_id" TEXT NOT NULL,
    "day_number" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "topic_en" TEXT NOT NULL,
    "topic_km" TEXT NOT NULL,
    "description_en" TEXT,
    "description_km" TEXT,
    "instructor_name" TEXT,
    "instructor_name_km" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "training_agendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_materials" (
    "id" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_km" TEXT NOT NULL,
    "description_en" TEXT,
    "description_km" TEXT,
    "material_type" TEXT NOT NULL,
    "file_url" TEXT,
    "external_url" TEXT,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "category" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "training_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_material_links" (
    "id" TEXT NOT NULL,
    "training_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "linked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "linked_by" TEXT,

    CONSTRAINT "training_material_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surveys" (
    "id" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_km" TEXT NOT NULL,
    "description_en" TEXT,
    "description_km" TEXT,
    "survey_type" "SurveyType" NOT NULL,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "passing_score" INTEGER,
    "time_limit" INTEGER,
    "allow_retake" BOOLEAN NOT NULL DEFAULT false,
    "max_attempts" INTEGER,
    "show_results_to_beneficiary" BOOLEAN NOT NULL DEFAULT true,
    "show_correct_answers" BOOLEAN NOT NULL DEFAULT false,
    "available_from" TIMESTAMP(3),
    "available_until" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_survey_links" (
    "id" TEXT NOT NULL,
    "training_id" TEXT NOT NULL,
    "survey_id" TEXT NOT NULL,
    "timing" "SurveyTiming" NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "custom_deadline" TIMESTAMP(3),
    "linked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "linked_by" TEXT,

    CONSTRAINT "training_survey_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_questions" (
    "id" TEXT NOT NULL,
    "survey_id" TEXT NOT NULL,
    "question_text_en" TEXT NOT NULL,
    "question_text_km" TEXT NOT NULL,
    "help_text_en" TEXT,
    "help_text_km" TEXT,
    "question_type" "QuestionType" NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER,
    "correct_answer" TEXT,
    "options_en" TEXT[],
    "options_km" TEXT[],
    "scale_min" INTEGER,
    "scale_max" INTEGER,
    "scale_labels_en" TEXT[],
    "scale_labels_km" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_responses" (
    "id" TEXT NOT NULL,
    "survey_id" TEXT NOT NULL,
    "beneficiary_id" TEXT NOT NULL,
    "training_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "is_complete" BOOLEAN NOT NULL DEFAULT false,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "total_score" DOUBLE PRECISION,
    "max_score" DOUBLE PRECISION,
    "percentage" DOUBLE PRECISION,
    "passed" BOOLEAN,
    "time_spent_seconds" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_question_responses" (
    "id" TEXT NOT NULL,
    "response_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "answer_value" TEXT NOT NULL,
    "answer_text" TEXT,
    "points_earned" DOUBLE PRECISION,
    "is_correct" BOOLEAN,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_question_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_agendas_training_id_idx" ON "training_agendas"("training_id");

-- CreateIndex
CREATE INDEX "training_material_links_training_id_idx" ON "training_material_links"("training_id");

-- CreateIndex
CREATE INDEX "training_material_links_material_id_idx" ON "training_material_links"("material_id");

-- CreateIndex
CREATE UNIQUE INDEX "training_material_links_training_id_material_id_key" ON "training_material_links"("training_id", "material_id");

-- CreateIndex
CREATE INDEX "training_survey_links_training_id_idx" ON "training_survey_links"("training_id");

-- CreateIndex
CREATE INDEX "training_survey_links_survey_id_idx" ON "training_survey_links"("survey_id");

-- CreateIndex
CREATE UNIQUE INDEX "training_survey_links_training_id_survey_id_key" ON "training_survey_links"("training_id", "survey_id");

-- CreateIndex
CREATE INDEX "survey_questions_survey_id_idx" ON "survey_questions"("survey_id");

-- CreateIndex
CREATE INDEX "survey_responses_survey_id_idx" ON "survey_responses"("survey_id");

-- CreateIndex
CREATE INDEX "survey_responses_beneficiary_id_idx" ON "survey_responses"("beneficiary_id");

-- CreateIndex
CREATE INDEX "survey_responses_training_id_idx" ON "survey_responses"("training_id");

-- CreateIndex
CREATE UNIQUE INDEX "survey_responses_survey_id_beneficiary_id_training_id_attem_key" ON "survey_responses"("survey_id", "beneficiary_id", "training_id", "attempt_number");

-- CreateIndex
CREATE INDEX "survey_question_responses_response_id_idx" ON "survey_question_responses"("response_id");

-- CreateIndex
CREATE INDEX "survey_question_responses_question_id_idx" ON "survey_question_responses"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "survey_question_responses_response_id_question_id_key" ON "survey_question_responses"("response_id", "question_id");

-- AddForeignKey
ALTER TABLE "training_agendas" ADD CONSTRAINT "training_agendas_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_material_links" ADD CONSTRAINT "training_material_links_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_material_links" ADD CONSTRAINT "training_material_links_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "training_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_survey_links" ADD CONSTRAINT "training_survey_links_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_survey_links" ADD CONSTRAINT "training_survey_links_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_questions" ADD CONSTRAINT "survey_questions_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiaries"("teacher_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_question_responses" ADD CONSTRAINT "survey_question_responses_response_id_fkey" FOREIGN KEY ("response_id") REFERENCES "survey_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_question_responses" ADD CONSTRAINT "survey_question_responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "survey_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
