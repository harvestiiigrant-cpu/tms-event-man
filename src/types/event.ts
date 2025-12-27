export type EventType =
  | 'CONFERENCE'
  | 'WORKSHOP'
  | 'SEMINAR'
  | 'WEBINAR'
  | 'MEETING'
  | 'CEREMONY'
  | 'TRAINING'
  | 'NETWORKING'
  | 'EXHIBITION'
  | 'OTHER';

export type EventFormat = 'IN_PERSON' | 'VIRTUAL' | 'HYBRID';

export type EventStatus = 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export type SessionType =
  | 'PRESENTATION'
  | 'WORKSHOP'
  | 'PANEL_DISCUSSION'
  | 'KEYNOTE'
  | 'BREAKOUT_SESSION'
  | 'Q_AND_A'
  | 'NETWORKING'
  | 'BREAK'
  | 'MEAL';

export type RegistrationStatus = 'REGISTERED' | 'CONFIRMED' | 'CANCELLED' | 'WAITLISTED';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type AttendeeRole =
  | 'PARTICIPANT'
  | 'SPEAKER'
  | 'PANELIST'
  | 'MODERATOR'
  | 'ORGANIZER'
  | 'VOLUNTEER'
  | 'VIP'
  | 'SPONSOR'
  | 'MEDIA';

export type SpeakerType = 'SPEAKER' | 'PANELIST' | 'MODERATOR' | 'FACILITATOR' | 'TRAINER';

export interface Event {
  id: string;
  event_code: string;
  event_name: string;
  event_name_english?: string | null;
  event_description?: string | null;
  event_type: EventType;
  event_category?: string | null;
  event_format: EventFormat;
  event_status: EventStatus;
  event_start_date: string;
  event_end_date: string;
  registration_deadline?: string | null;
  registration_start?: string | null;
  event_location?: string | null;
  event_venue?: string | null;
  venue_latitude?: number | null;
  venue_longitude?: number | null;
  geofence_radius: number;
  province_name?: string | null;
  district_name?: string | null;
  virtual_platform?: string | null;
  virtual_meeting_url?: string | null;
  virtual_meeting_id?: string | null;
  virtual_passcode?: string | null;
  max_attendees: number;
  current_attendees: number;
  allow_public_registration: boolean;
  requires_approval: boolean;
  is_multi_track: boolean;
  qr_code_data?: string | null;
  gps_validation_required: boolean;
  geofence_validation_required: boolean;
  is_published: boolean;
  banner_image_url?: string | null;
  tags: string[];
  is_deleted: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventSession {
  id: string;
  event_id: string;
  session_code: string;
  session_name: string;
  session_name_english?: string | null;
  session_description?: string | null;
  session_date: string;
  session_start_time: string;
  session_end_time: string;
  session_location?: string | null;
  session_room?: string | null;
  venue_latitude?: number | null;
  venue_longitude?: number | null;
  virtual_meeting_url?: string | null;
  track_name?: string | null;
  track_color?: string | null;
  max_attendees: number;
  current_attendees: number;
  session_type: SessionType;
  is_cancelled: boolean;
  is_deleted: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface EventSpeaker {
  id: string;
  event_id: string;
  speaker_name: string;
  speaker_name_english?: string | null;
  speaker_title?: string | null;
  speaker_position?: string | null;
  speaker_organization?: string | null;
  speaker_bio?: string | null;
  speaker_photo_url?: string | null;
  speaker_email?: string | null;
  speaker_phone?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  website_url?: string | null;
  speaker_type: SpeakerType;
  is_keynote_speaker: boolean;
  is_featured: boolean;
  sort_order: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  registration_code: string;
  beneficiary_id?: string | null;
  attendee_name?: string | null;
  attendee_name_english?: string | null;
  attendee_email?: string | null;
  attendee_phone?: string | null;
  attendee_organization?: string | null;
  attendee_position?: string | null;
  attendee_province?: string | null;
  attendee_district?: string | null;
  registration_date: string;
  registration_method: string;
  registration_source?: string | null;
  registration_status: RegistrationStatus;
  approval_status: ApprovalStatus;
  approved_by?: string | null;
  approved_at?: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  attendance_status?: string | null;
  attendee_role: AttendeeRole;
  dietary_requirements?: string | null;
  accessibility_needs?: string | null;
  special_requests?: string | null;
  qr_code_data?: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// Constants for UI
export const EVENT_TYPES: { code: EventType; name_en: string; name_km: string }[] = [
  { code: 'CONFERENCE', name_en: 'Conference', name_km: 'សន្និសីទ' },
  { code: 'WORKSHOP', name_en: 'Workshop', name_km: 'សិក្ខាសាលា' },
  { code: 'SEMINAR', name_en: 'Seminar', name_km: 'សិក្ខាសាលា' },
  { code: 'WEBINAR', name_en: 'Webinar', name_km: 'វេបសិក្ខាសាលា' },
  { code: 'MEETING', name_en: 'Meeting', name_km: 'ការប្រជុំ' },
  { code: 'CEREMONY', name_en: 'Ceremony', name_km: 'ពិធី' },
  { code: 'TRAINING', name_en: 'Training', name_km: 'ការបណ្តុះបណ្តាល' },
  { code: 'NETWORKING', name_en: 'Networking', name_km: 'ការបង្កើតបណ្តាញ' },
  { code: 'EXHIBITION', name_en: 'Exhibition', name_km: 'ពិព័រណ៍' },
  { code: 'OTHER', name_en: 'Other', name_km: 'ផ្សេងៗ' },
];

export const EVENT_FORMATS: { code: EventFormat; name_en: string; name_km: string }[] = [
  { code: 'IN_PERSON', name_en: 'In Person', name_km: 'ចូលរួមផ្ទាល់' },
  { code: 'VIRTUAL', name_en: 'Virtual', name_km: 'តាមអនឡាញ' },
  { code: 'HYBRID', name_en: 'Hybrid', name_km: 'ចូលរួមផ្សំ' },
];

export const SESSION_TYPES: { code: SessionType; name_en: string; name_km: string }[] = [
  { code: 'PRESENTATION', name_en: 'Presentation', name_km: 'បទបង្ហាញ' },
  { code: 'WORKSHOP', name_en: 'Workshop', name_km: 'សិក្ខាសាលា' },
  { code: 'PANEL_DISCUSSION', name_en: 'Panel Discussion', name_km: 'ការពិភាក្សាក្រុម' },
  { code: 'KEYNOTE', name_en: 'Keynote', name_km: 'សុន្ទរកថាសំខាន់' },
  { code: 'BREAKOUT_SESSION', name_en: 'Breakout Session', name_km: 'វគ្គប្រជុំក្រុម' },
  { code: 'Q_AND_A', name_en: 'Q&A', name_km: 'សំណួរ និង ចម្លើយ' },
  { code: 'NETWORKING', name_en: 'Networking', name_km: 'ការបង្កើតបណ្តាញ' },
  { code: 'BREAK', name_en: 'Break', name_km: 'សម្រាក' },
  { code: 'MEAL', name_en: 'Meal', name_km: 'អាហារ' },
];
