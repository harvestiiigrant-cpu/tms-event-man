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
