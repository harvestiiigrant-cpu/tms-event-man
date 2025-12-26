// Training Management System Types

export interface Beneficiary {
  teacher_id: string;
  name: string;
  name_english?: string;
  phone?: string;
  sex?: 'M' | 'F';
  role?: string;
  passcode?: string;
  province_name?: string;
  district_name?: string;
  commune_name?: string;
  village_name?: string;
  school?: string;
  school_id?: string;
  position?: string;
  subject?: string;
  grade?: number;
  profile_image_url?: string;
  signature_url?: string;
  status: 'ACTIVE' | 'INACTIVE';
  is_deleted: boolean;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Training {
  id: string;
  training_code: string;
  training_name: string;
  training_name_english?: string;
  training_description?: string;
  training_type?: 'WORKSHOP' | 'COURSE' | 'SEMINAR';
  training_category?: string;
  training_level?: 'NATIONAL' | 'PROVINCIAL' | 'CLUSTER';
  training_status: 'DRAFT' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  training_start_date: string;
  training_end_date: string;
  registration_deadline?: string;
  training_location: string;
  training_venue?: string;
  venue_latitude?: number;
  venue_longitude?: number;
  geofence_radius: number;
  province_name?: string;
  district_name?: string;
  commune_name?: string;
  school_name?: string;
  cluster_schools?: string[];
  max_participants: number;
  current_participants: number;
  qr_code_data?: string;
  gps_validation_required: boolean;
  geofence_validation_required: boolean;
  is_published: boolean;
  training_is_deleted: boolean;
  training_created_by?: string;
  training_updated_by?: string;
  training_created_at: string;
  training_updated_at: string;
}

export interface BeneficiaryTraining {
  beneficiary_training_id: string;
  beneficiary_id: string;
  training_id: string;
  registration_date: string;
  registration_method?: 'QR' | 'MANUAL' | 'IMPORT';
  attendance_status: 'REGISTERED' | 'ATTENDED' | 'COMPLETED' | 'DROPPED';
  attendance_percentage?: number;
  training_role: 'PARTICIPANT' | 'TRAINER' | 'COORDINATOR';
  enrollment_type: string;
  certificate_issued: boolean;
  certificate_number?: string;
  certificate_issue_date?: string;
  feedback_submitted: boolean;
  feedback_score?: number;
  feedback_comments?: string;
  beneficiary_training_status: string;
  beneficiary_training_created_at: string;
  beneficiary_training_updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  training_id: string;
  beneficiary_id: string;
  date: string;
  morning_in?: string;
  morning_out?: string;
  afternoon_in?: string;
  afternoon_out?: string;
  session_attendance_status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  manual_entry: boolean;
  manual_marked_by?: string;
  manual_marked_by_name?: string;
  manual_entry_reason?: string;
  location?: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  device?: string;
  created_at: string;
  updated_at: string;
}

export type TrainingCategory = 'KHMER' | 'MATH' | 'IT' | 'PEDAGOGY' | 'LEADERSHIP';

export const TRAINING_CATEGORIES: { code: TrainingCategory; name_en: string; name_km: string }[] = [
  { code: 'KHMER', name_en: 'Khmer Language', name_km: 'ភាសាខ្មែរ' },
  { code: 'MATH', name_en: 'Mathematics', name_km: 'គណិតវិទ្យា' },
  { code: 'IT', name_en: 'Information Technology', name_km: 'ព័ត៌មានវិទ្យា' },
  { code: 'PEDAGOGY', name_en: 'Teaching Methods', name_km: 'វិធីសាស្រ្តបង្រៀន' },
  { code: 'LEADERSHIP', name_en: 'Leadership', name_km: 'ភាពជាអ្នកដឹកនាំ' },
];

export type TrainingType = 'WORKSHOP' | 'COURSE' | 'SEMINAR';

export const TRAINING_TYPES: { code: TrainingType; name_en: string; name_km: string }[] = [
  { code: 'WORKSHOP', name_en: 'Workshop', name_km: 'សិក្ខាសាលា' },
  { code: 'COURSE', name_en: 'Course', name_km: 'វគ្គសិក្សា' },
  { code: 'SEMINAR', name_en: 'Seminar', name_km: 'សិក្ខាសាលាពិគ្រោះយោបល់' },
];

export type TrainingLevel = 'NATIONAL' | 'PROVINCIAL' | 'CLUSTER';

export type TrainingStatus = 'DRAFT' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export const TRAINING_STATUSES: { code: TrainingStatus; name_en: string; name_km: string }[] = [
  { code: 'DRAFT', name_en: 'Draft', name_km: 'សេចក្តីព្រាង' },
  { code: 'ONGOING', name_en: 'Ongoing', name_km: 'កំពុងដំណើរការ' },
  { code: 'COMPLETED', name_en: 'Completed', name_km: 'បានបញ្ចប់' },
  { code: 'CANCELLED', name_en: 'Cancelled', name_km: 'បានលុបចោល' },
];

export const TRAINING_LEVELS: { code: TrainingLevel; name_en: string; name_km: string; description_en: string; description_km: string }[] = [
  {
    code: 'NATIONAL',
    name_en: 'National Level',
    name_km: 'កម្រិតជាតិ',
    description_en: 'Training conducted at national level',
    description_km: 'ការបណ្តុះបណ្តាលកម្រិតជាតិ'
  },
  {
    code: 'PROVINCIAL',
    name_en: 'Provincial Level',
    name_km: 'កម្រិតខេត្ត',
    description_en: 'Training conducted at provincial level',
    description_km: 'ការបណ្តុះបណ្តាលកម្រិតខេត្ត'
  },
  {
    code: 'CLUSTER',
    name_en: 'Cluster Level',
    name_km: 'កម្រិតកម្រង',
    description_en: 'Training distributed across multiple schools in a cluster',
    description_km: 'ការបណ្តុះបណ្តាលចែកចាយក្នុងសាលារៀនច្រើន'
  },
];

// Training Agenda (per-training schedule items)
export interface TrainingAgenda {
  id: string;
  training_id: string;
  day_number: number;
  start_time: string;
  end_time: string;
  topic_en: string;
  topic_km: string;
  description_en?: string;
  description_km?: string;
  instructor_name?: string;
  instructor_name_km?: string;
  sort_order: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// Training Material (central library item)
export type MaterialType = 'FILE' | 'URL';

export interface TrainingMaterial {
  id: string;
  title_en: string;
  title_km: string;
  description_en?: string;
  description_km?: string;
  material_type: MaterialType;
  file_url?: string;
  external_url?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  category?: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  linked_trainings_count?: number;
}

// Training-Material Link (junction for many-to-many)
export interface TrainingMaterialLink {
  id: string;
  training_id: string;
  material_id: string;
  sort_order: number;
  is_required: boolean;
  linked_at: string;
  linked_by?: string;
  material?: TrainingMaterial;
}

// Material Categories
export type MaterialCategory = 'HANDOUT' | 'PRESENTATION' | 'VIDEO' | 'REFERENCE' | 'TEMPLATE';

export const MATERIAL_CATEGORIES: { code: MaterialCategory; name_en: string; name_km: string }[] = [
  { code: 'HANDOUT', name_en: 'Handout', name_km: 'ឯកសារចែក' },
  { code: 'PRESENTATION', name_en: 'Presentation', name_km: 'បទបង្ហាញ' },
  { code: 'VIDEO', name_en: 'Video', name_km: 'វីដេអូ' },
  { code: 'REFERENCE', name_en: 'Reference', name_km: 'ឯកសារយោង' },
  { code: 'TEMPLATE', name_en: 'Template', name_km: 'គំរូ' },
];

// ============================================
// Attendance Grid Types
// ============================================

export type SessionAttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface AttendanceGridDay {
  day_number: number;
  date: string;
}

export interface AttendanceGridRecord {
  id?: string;
  morning_in?: string | null;
  morning_out?: string | null;
  afternoon_in?: string | null;
  afternoon_out?: string | null;
  status: SessionAttendanceStatus;
}

export interface AttendanceGridParticipant {
  beneficiary_id: string;
  name: string;
  name_english?: string;
  teacher_id: string;
  training_role: string;
  attendance: Record<string, AttendanceGridRecord>; // date -> record
}

export interface AttendanceGridData {
  training: {
    id: string;
    training_code: string;
    training_name: string;
    training_name_english?: string;
    training_start_date: string;
    training_end_date: string;
    training_status: string;
  };
  days: AttendanceGridDay[];
  participants: AttendanceGridParticipant[];
}

export interface BulkAttendanceRecord {
  beneficiary_id: string;
  date: string;
  morning_in?: string | null;
  morning_out?: string | null;
  afternoon_in?: string | null;
  afternoon_out?: string | null;
  session_attendance_status: SessionAttendanceStatus;
}

export interface BulkAttendanceRequest {
  training_id: string;
  records: BulkAttendanceRecord[];
  manual_entry_reason?: string;
}

// ============================================
// Transfer Types
// ============================================

export interface TransferRequest {
  beneficiary_id: string;
  source_training_id: string;
  target_training_id: string;
}

export interface TransferDayMapping {
  day_number: number;
  source_date: string;
  target_date: string;
  will_transfer: boolean;
}

export interface TransferPreview {
  participant: {
    name: string;
    name_english?: string;
    teacher_id: string;
  };
  source_training: {
    id: string;
    training_code: string;
    training_name: string;
    training_name_english?: string;
    start_date: string;
    end_date: string;
  };
  target_training: {
    id: string;
    training_code: string;
    training_name: string;
    training_name_english?: string;
    start_date: string;
    end_date: string;
  };
  attendance_records_count: number;
  records_that_will_transfer: number;
  day_mapping: TransferDayMapping[];
}

export interface TransferResult {
  message: string;
  transferred_attendance_records: number;
  total_original_records: number;
}

export interface AvailableTraining {
  id: string;
  training_code: string;
  training_name: string;
  training_name_english?: string;
  training_start_date: string;
  training_end_date: string;
  training_status: string;
  max_participants: number;
  current_participants: number;
}

// ============================================
// Survey & Test Types
// ============================================

export type SurveyType = 'PRE_TEST' | 'POST_TEST' | 'FEEDBACK' | 'EVALUATION' | 'COMMON_TEST';
export type SurveyTiming = 'BEFORE_TRAINING' | 'DURING_TRAINING' | 'AFTER_TRAINING';
export type QuestionType = 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECT' | 'TRUE_FALSE' | 'LIKERT_SCALE' | 'RATING' | 'SHORT_TEXT' | 'LONG_TEXT';

export interface Survey {
  id: string;
  title_en: string;
  title_km: string;
  description_en?: string;
  description_km?: string;
  survey_type: SurveyType;
  is_template: boolean;
  is_required: boolean;
  passing_score?: number;
  time_limit?: number;
  allow_retake: boolean;
  max_attempts?: number;
  show_results_to_beneficiary: boolean;
  show_correct_answers: boolean;
  available_from?: string;
  available_until?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  questions?: SurveyQuestion[];
  _count?: {
    questions: number;
    responses: number;
  };
}

export interface SurveyQuestion {
  id: string;
  survey_id: string;
  question_text_en: string;
  question_text_km: string;
  help_text_en?: string;
  help_text_km?: string;
  question_type: QuestionType;
  is_required: boolean;
  sort_order: number;
  points?: number;
  correct_answer?: string;
  options_en: string[];
  options_km: string[];
  scale_min?: number;
  scale_max?: number;
  scale_labels_en: string[];
  scale_labels_km: string[];
  created_at: string;
  updated_at: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  beneficiary_id: string;
  training_id: string;
  started_at?: string;
  submitted_at?: string;
  is_complete: boolean;
  attempt_number: number;
  total_score?: number;
  max_score?: number;
  percentage?: number;
  passed?: boolean;
  time_spent_seconds?: number;
  created_at: string;
  updated_at: string;
  question_responses?: SurveyQuestionResponse[];
}

export interface SurveyQuestionResponse {
  id: string;
  response_id: string;
  question_id: string;
  answer_value: string;
  answer_text?: string;
  points_earned?: number;
  is_correct?: boolean;
  answered_at: string;
}

export interface TrainingSurveyLink {
  id: string;
  training_id: string;
  survey_id: string;
  timing: SurveyTiming;
  is_required: boolean;
  sort_order: number;
  custom_deadline?: string;
  linked_at: string;
  linked_by?: string;
  survey?: Survey;
}

export const SURVEY_TYPES: { value: SurveyType; label_en: string; label_km: string }[] = [
  { value: 'PRE_TEST', label_en: 'Pre-Training Test', label_km: 'តេស្តមុនបណ្តុះបណ្តាល' },
  { value: 'POST_TEST', label_en: 'Post-Training Test', label_km: 'តេស្តបន្ទាប់ពីបណ្តុះបណ្តាល' },
  { value: 'FEEDBACK', label_en: 'Feedback Survey', label_km: 'ការស្ទង់មតិកែលម្អ' },
  { value: 'EVALUATION', label_en: 'Skills Evaluation', label_km: 'ការវាយតម្លៃជំនាញ' },
  { value: 'COMMON_TEST', label_en: 'Common Test', label_km: 'តេស្តទូទៅ' },
];

export const QUESTION_TYPES: { value: QuestionType; label_en: string; label_km: string }[] = [
  { value: 'MULTIPLE_CHOICE', label_en: 'Multiple Choice', label_km: 'ពហុជ្រើសរើស' },
  { value: 'MULTIPLE_SELECT', label_en: 'Multiple Select', label_km: 'ជ្រើសរើសច្រើន' },
  { value: 'TRUE_FALSE', label_en: 'True/False', label_km: 'ពិត/មិនពិត' },
  { value: 'LIKERT_SCALE', label_en: 'Likert Scale (1-5)', label_km: 'មាត្រដ្ឋានតម្លៃ (១-៥)' },
  { value: 'RATING', label_en: 'Star Rating', label_km: 'ផ្កាយវាយតម្លៃ' },
  { value: 'SHORT_TEXT', label_en: 'Short Answer', label_km: 'ចម្លើយខ្លី' },
  { value: 'LONG_TEXT', label_en: 'Essay/Long Answer', label_km: 'ចម្លើយវែង' },
];
