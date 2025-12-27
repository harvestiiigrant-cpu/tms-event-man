-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('CONFERENCE', 'WORKSHOP', 'SEMINAR', 'WEBINAR', 'MEETING', 'CEREMONY', 'TRAINING', 'NETWORKING', 'EXHIBITION', 'OTHER');

-- CreateEnum
CREATE TYPE "EventFormat" AS ENUM ('IN_PERSON', 'VIRTUAL', 'HYBRID');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('PRESENTATION', 'WORKSHOP', 'PANEL_DISCUSSION', 'KEYNOTE', 'BREAKOUT_SESSION', 'Q_AND_A', 'NETWORKING', 'BREAK', 'MEAL');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('REGISTERED', 'CONFIRMED', 'CANCELLED', 'WAITLISTED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AttendeeRole" AS ENUM ('PARTICIPANT', 'SPEAKER', 'PANELIST', 'MODERATOR', 'ORGANIZER', 'VOLUNTEER', 'VIP', 'SPONSOR', 'MEDIA');

-- CreateEnum
CREATE TYPE "SpeakerType" AS ENUM ('SPEAKER', 'PANELIST', 'MODERATOR', 'FACILITATOR', 'TRAINER');

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "event_code" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "event_name_english" TEXT,
    "event_description" TEXT,
    "event_type" "EventType" NOT NULL,
    "event_category" TEXT,
    "event_format" "EventFormat" NOT NULL DEFAULT 'IN_PERSON',
    "event_status" "EventStatus" NOT NULL,
    "event_start_date" TIMESTAMP(3) NOT NULL,
    "event_end_date" TIMESTAMP(3) NOT NULL,
    "registration_deadline" TIMESTAMP(3),
    "registration_start" TIMESTAMP(3),
    "event_location" TEXT,
    "event_venue" TEXT,
    "venue_latitude" DOUBLE PRECISION,
    "venue_longitude" DOUBLE PRECISION,
    "geofence_radius" INTEGER NOT NULL DEFAULT 100,
    "province_name" TEXT,
    "district_name" TEXT,
    "virtual_platform" TEXT,
    "virtual_meeting_url" TEXT,
    "virtual_meeting_id" TEXT,
    "virtual_passcode" TEXT,
    "max_attendees" INTEGER NOT NULL,
    "current_attendees" INTEGER NOT NULL DEFAULT 0,
    "allow_public_registration" BOOLEAN NOT NULL DEFAULT true,
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "is_multi_track" BOOLEAN NOT NULL DEFAULT false,
    "qr_code_data" TEXT,
    "gps_validation_required" BOOLEAN NOT NULL DEFAULT false,
    "geofence_validation_required" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "banner_image_url" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_sessions" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "session_code" TEXT NOT NULL,
    "session_name" TEXT NOT NULL,
    "session_name_english" TEXT,
    "session_description" TEXT,
    "session_date" TIMESTAMP(3) NOT NULL,
    "session_start_time" TIMESTAMP(3) NOT NULL,
    "session_end_time" TIMESTAMP(3) NOT NULL,
    "session_location" TEXT,
    "session_room" TEXT,
    "venue_latitude" DOUBLE PRECISION,
    "venue_longitude" DOUBLE PRECISION,
    "virtual_meeting_url" TEXT,
    "track_name" TEXT,
    "track_color" TEXT,
    "max_attendees" INTEGER NOT NULL,
    "current_attendees" INTEGER NOT NULL DEFAULT 0,
    "session_type" "SessionType" NOT NULL DEFAULT 'PRESENTATION',
    "is_cancelled" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "event_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "registration_code" TEXT NOT NULL,
    "beneficiary_id" TEXT,
    "attendee_name" TEXT,
    "attendee_name_english" TEXT,
    "attendee_email" TEXT,
    "attendee_phone" TEXT,
    "attendee_organization" TEXT,
    "attendee_position" TEXT,
    "attendee_province" TEXT,
    "attendee_district" TEXT,
    "registration_date" TIMESTAMP(3) NOT NULL,
    "registration_method" "RegistrationMethod" NOT NULL,
    "registration_source" TEXT,
    "registration_status" "RegistrationStatus" NOT NULL,
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "check_in_time" TIMESTAMP(3),
    "check_out_time" TIMESTAMP(3),
    "attendance_status" TEXT,
    "attendee_role" "AttendeeRole" NOT NULL DEFAULT 'PARTICIPANT',
    "dietary_requirements" TEXT,
    "accessibility_needs" TEXT,
    "special_requests" TEXT,
    "qr_code_data" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_session_registrations" (
    "id" TEXT NOT NULL,
    "registration_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checked_in" BOOLEAN NOT NULL DEFAULT false,
    "check_in_time" TIMESTAMP(3),

    CONSTRAINT "event_session_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attendance_records" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "beneficiary_id" TEXT,
    "registration_id" TEXT,
    "date" DATE NOT NULL,
    "morning_in" TIMESTAMP(3),
    "morning_out" TIMESTAMP(3),
    "afternoon_in" TIMESTAMP(3),
    "afternoon_out" TIMESTAMP(3),
    "attendance_status" "SessionAttendanceStatus" NOT NULL,
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

    CONSTRAINT "event_attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_speakers" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "speaker_name" TEXT NOT NULL,
    "speaker_name_english" TEXT,
    "speaker_title" TEXT,
    "speaker_position" TEXT,
    "speaker_organization" TEXT,
    "speaker_bio" TEXT,
    "speaker_photo_url" TEXT,
    "speaker_email" TEXT,
    "speaker_phone" TEXT,
    "linkedin_url" TEXT,
    "twitter_url" TEXT,
    "website_url" TEXT,
    "speaker_type" "SpeakerType" NOT NULL DEFAULT 'SPEAKER',
    "is_keynote_speaker" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_session_speakers" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "speaker_id" TEXT NOT NULL,
    "role" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_session_speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_material_links" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "linked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "linked_by" TEXT,

    CONSTRAINT "event_material_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_event_code_key" ON "events"("event_code");

-- CreateIndex
CREATE UNIQUE INDEX "event_sessions_session_code_key" ON "event_sessions"("session_code");

-- CreateIndex
CREATE INDEX "event_sessions_event_id_idx" ON "event_sessions"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_registration_code_key" ON "event_registrations"("registration_code");

-- CreateIndex
CREATE INDEX "event_registrations_event_id_idx" ON "event_registrations"("event_id");

-- CreateIndex
CREATE INDEX "event_registrations_beneficiary_id_idx" ON "event_registrations"("beneficiary_id");

-- CreateIndex
CREATE INDEX "event_session_registrations_registration_id_idx" ON "event_session_registrations"("registration_id");

-- CreateIndex
CREATE INDEX "event_session_registrations_session_id_idx" ON "event_session_registrations"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_session_registrations_registration_id_session_id_key" ON "event_session_registrations"("registration_id", "session_id");

-- CreateIndex
CREATE INDEX "event_attendance_records_event_id_idx" ON "event_attendance_records"("event_id");

-- CreateIndex
CREATE INDEX "event_attendance_records_beneficiary_id_idx" ON "event_attendance_records"("beneficiary_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendance_records_event_id_beneficiary_id_date_key" ON "event_attendance_records"("event_id", "beneficiary_id", "date");

-- CreateIndex
CREATE INDEX "event_speakers_event_id_idx" ON "event_speakers"("event_id");

-- CreateIndex
CREATE INDEX "event_session_speakers_session_id_idx" ON "event_session_speakers"("session_id");

-- CreateIndex
CREATE INDEX "event_session_speakers_speaker_id_idx" ON "event_session_speakers"("speaker_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_session_speakers_session_id_speaker_id_key" ON "event_session_speakers"("session_id", "speaker_id");

-- CreateIndex
CREATE INDEX "event_material_links_event_id_idx" ON "event_material_links"("event_id");

-- CreateIndex
CREATE INDEX "event_material_links_material_id_idx" ON "event_material_links"("material_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_material_links_event_id_material_id_key" ON "event_material_links"("event_id", "material_id");

-- AddForeignKey
ALTER TABLE "event_sessions" ADD CONSTRAINT "event_sessions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiaries"("teacher_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_session_registrations" ADD CONSTRAINT "event_session_registrations_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "event_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_session_registrations" ADD CONSTRAINT "event_session_registrations_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "event_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendance_records" ADD CONSTRAINT "event_attendance_records_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendance_records" ADD CONSTRAINT "event_attendance_records_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiaries"("teacher_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_speakers" ADD CONSTRAINT "event_speakers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_session_speakers" ADD CONSTRAINT "event_session_speakers_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "event_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_session_speakers" ADD CONSTRAINT "event_session_speakers_speaker_id_fkey" FOREIGN KEY ("speaker_id") REFERENCES "event_speakers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_material_links" ADD CONSTRAINT "event_material_links_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_material_links" ADD CONSTRAINT "event_material_links_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "training_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
