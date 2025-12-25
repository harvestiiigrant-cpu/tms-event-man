-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SUPER_ADMIN', 'BENEFICIARY');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "BeneficiaryStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TrainingType" AS ENUM ('WORKSHOP', 'COURSE', 'SEMINAR');

-- CreateEnum
CREATE TYPE "TrainingLevel" AS ENUM ('NATIONAL', 'PROVINCIAL', 'CLUSTER');

-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('DRAFT', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RegistrationMethod" AS ENUM ('QR', 'MANUAL', 'IMPORT');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('REGISTERED', 'ATTENDED', 'COMPLETED', 'DROPPED');

-- CreateEnum
CREATE TYPE "TrainingRole" AS ENUM ('PARTICIPANT', 'TRAINER', 'COORDINATOR');

-- CreateEnum
CREATE TYPE "SessionAttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "profile_image_url" TEXT,
    "teacher_id" TEXT,
    "school" TEXT,
    "school_id" TEXT,
    "province_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficiaries" (
    "teacher_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_english" TEXT,
    "phone" TEXT,
    "sex" "Sex",
    "role" TEXT,
    "passcode" TEXT,
    "province_name" TEXT,
    "district_name" TEXT,
    "commune_name" TEXT,
    "village_name" TEXT,
    "school" TEXT,
    "school_id" TEXT,
    "position" TEXT,
    "subject" TEXT,
    "grade" INTEGER,
    "profile_image_url" TEXT,
    "signature_url" TEXT,
    "status" "BeneficiaryStatus" NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "profile_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "beneficiaries_pkey" PRIMARY KEY ("teacher_id")
);

-- CreateTable
CREATE TABLE "trainings" (
    "id" TEXT NOT NULL,
    "training_code" TEXT NOT NULL,
    "training_name" TEXT NOT NULL,
    "training_name_english" TEXT,
    "training_description" TEXT,
    "training_type" "TrainingType",
    "training_category" TEXT,
    "training_level" "TrainingLevel",
    "training_status" "TrainingStatus" NOT NULL,
    "training_start_date" TIMESTAMP(3) NOT NULL,
    "training_end_date" TIMESTAMP(3) NOT NULL,
    "registration_deadline" TIMESTAMP(3),
    "training_location" TEXT NOT NULL,
    "training_venue" TEXT,
    "venue_latitude" DOUBLE PRECISION,
    "venue_longitude" DOUBLE PRECISION,
    "geofence_radius" INTEGER NOT NULL DEFAULT 100,
    "province_name" TEXT,
    "district_name" TEXT,
    "commune_name" TEXT,
    "school_name" TEXT,
    "cluster_schools" TEXT[],
    "max_participants" INTEGER NOT NULL,
    "current_participants" INTEGER NOT NULL DEFAULT 0,
    "qr_code_data" TEXT,
    "gps_validation_required" BOOLEAN NOT NULL DEFAULT false,
    "geofence_validation_required" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "training_is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "training_created_by" TEXT,
    "training_updated_by" TEXT,
    "training_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "training_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficiary_trainings" (
    "beneficiary_training_id" TEXT NOT NULL,
    "beneficiary_id" TEXT NOT NULL,
    "training_id" TEXT NOT NULL,
    "registration_date" TIMESTAMP(3) NOT NULL,
    "registration_method" "RegistrationMethod",
    "attendance_status" "AttendanceStatus" NOT NULL,
    "attendance_percentage" DOUBLE PRECISION,
    "training_role" "TrainingRole" NOT NULL,
    "enrollment_type" TEXT NOT NULL,
    "certificate_issued" BOOLEAN NOT NULL DEFAULT false,
    "certificate_number" TEXT,
    "certificate_issue_date" TIMESTAMP(3),
    "feedback_submitted" BOOLEAN NOT NULL DEFAULT false,
    "feedback_score" DOUBLE PRECISION,
    "feedback_comments" TEXT,
    "beneficiary_training_status" TEXT NOT NULL,
    "beneficiary_training_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "beneficiary_training_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficiary_trainings_pkey" PRIMARY KEY ("beneficiary_training_id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" TEXT NOT NULL,
    "training_id" TEXT NOT NULL,
    "beneficiary_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "morning_in" TIMESTAMP(3),
    "morning_out" TIMESTAMP(3),
    "afternoon_in" TIMESTAMP(3),
    "afternoon_out" TIMESTAMP(3),
    "session_attendance_status" "SessionAttendanceStatus" NOT NULL,
    "manual_entry" BOOLEAN NOT NULL DEFAULT false,
    "manual_marked_by" TEXT,
    "manual_marked_by_name" TEXT,
    "manual_entry_reason" TEXT,
    "location_lat" DOUBLE PRECISION,
    "location_lng" DOUBLE PRECISION,
    "location_accuracy" DOUBLE PRECISION,
    "device" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "trainings_training_code_key" ON "trainings"("training_code");

-- CreateIndex
CREATE UNIQUE INDEX "beneficiary_trainings_beneficiary_id_training_id_key" ON "beneficiary_trainings"("beneficiary_id", "training_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_training_id_beneficiary_id_date_key" ON "attendance_records"("training_id", "beneficiary_id", "date");

-- AddForeignKey
ALTER TABLE "beneficiary_trainings" ADD CONSTRAINT "beneficiary_trainings_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiaries"("teacher_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_trainings" ADD CONSTRAINT "beneficiary_trainings_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiaries"("teacher_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
