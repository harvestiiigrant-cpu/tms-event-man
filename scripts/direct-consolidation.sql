-- Direct SQL script to consolidate master database into new database
-- This script will insert records that don't already exist in the new database

-- First, let's backup the current state (optional)
-- CREATE TABLE beneficiaries_backup AS SELECT * FROM beneficiaries;
-- CREATE TABLE trainings_backup AS SELECT * FROM trainings;
-- CREATE TABLE beneficiary_trainings_backup AS SELECT * FROM beneficiary_trainings;
-- CREATE TABLE attendance_records_backup AS SELECT * FROM attendance_records;

-- Insert beneficiaries that don't exist in the new database
INSERT INTO beneficiaries (
    teacher_id,
    name,
    name_english,
    phone,
    sex,
    role,
    passcode,
    province_name,
    district_name,
    commune_name,
    village_name,
    school,
    school_id,
    position,
    subject,
    grade,
    status,
    is_deleted,
    profile_completed,
    profile_image_url,
    signature_url,
    created_at,
    updated_at,
    created_by,
    updated_by
)
SELECT 
    b.teacher_id,
    b.name,
    COALESCE(b.name_english, ''),
    COALESCE(b.phone, ''),
    CASE 
        WHEN LOWER(COALESCE(b.sex, '')) LIKE '%f%' OR LOWER(COALESCE(b.sex, '')) LIKE '%female%' THEN 'F'
        WHEN LOWER(COALESCE(b.sex, '')) LIKE '%m%' OR LOWER(COALESCE(b.sex, '')) LIKE '%male%' THEN 'M'
        ELSE 'M'
    END,
    COALESCE(b.role, b.type, ''),
    COALESCE(b.passcode, ''),
    COALESCE(b.province_name, ''),
    COALESCE(b.district_name, ''),
    COALESCE(b.commune_name, ''),
    COALESCE(b.village_name, ''),
    COALESCE(b.school, ''),
    COALESCE(b.school_id, ''),
    COALESCE(b.position, ''),
    COALESCE(b.subject, ''),
    b.grade,
    CASE 
        WHEN LOWER(COALESCE(b.status, '')) IN ('inactive', 'false', '0') THEN 'INACTIVE'
        ELSE 'ACTIVE'
    END,
    COALESCE(b.is_deleted, false),
    COALESCE(b.profile_completed, false),
    COALESCE(b.profile_image_url, ''),
    COALESCE(b.signature_url, ''),
    COALESCE(b.created_at, CURRENT_TIMESTAMP),
    COALESCE(b.updated_at, CURRENT_TIMESTAMP),
    COALESCE(b.created_by, 'system'),
    COALESCE(b.updated_by, 'system')
FROM dblink('host=192.168.155.122 port=5432 dbname=ped_training_app user=admin_moeys password=testing-123',
           'SELECT teacher_id, name, name_english, phone, sex, role, type, passcode, province_name, district_name, commune_name, village_name, school, school_id, position, subject, grade, status, is_deleted, profile_completed, profile_image_url, signature_url, created_at, updated_at, created_by, updated_by FROM beneficiaries ORDER BY created_at')
AS b(
    teacher_id text,
    name text,
    name_english text,
    phone text,
    sex text,
    role text,
    type text,
    passcode text,
    province_name text,
    district_name text,
    commune_name text,
    village_name text,
    school text,
    school_id text,
    position text,
    subject text,
    grade integer,
    status text,
    is_deleted boolean,
    profile_completed boolean,
    profile_image_url text,
    signature_url text,
    created_at timestamp,
    updated_at timestamp,
    created_by text,
    updated_by text
)
WHERE NOT EXISTS (
    SELECT 1 FROM beneficiaries WHERE beneficiaries.teacher_id = b.teacher_id
);

-- Insert trainings that don't exist in the new database
INSERT INTO trainings (
    id,
    training_code,
    training_name,
    training_name_english,
    training_description,
    training_type,
    training_category,
    training_level,
    training_status,
    training_start_date,
    training_end_date,
    registration_deadline,
    training_location,
    training_venue,
    venue_latitude,
    venue_longitude,
    geofence_radius,
    province_name,
    district_name,
    commune_name,
    school_name,
    cluster_schools,
    max_participants,
    current_participants,
    qr_code_data,
    gps_validation_required,
    geofence_validation_required,
    is_published,
    training_is_deleted,
    training_created_by,
    training_updated_by,
    training_created_at,
    training_updated_at
)
SELECT 
    gen_random_uuid()::text,
    t.training_code,
    t.training_name,
    COALESCE(t.training_name_english, t.name_english, ''),
    COALESCE(t.training_description, t.training_description_english, ''),
    CASE 
        WHEN LOWER(COALESCE(t.training_type, '')) LIKE '%course%' OR LOWER(COALESCE(t.training_type, '')) LIKE '%class%' THEN 'COURSE'
        WHEN LOWER(COALESCE(t.training_type, '')) LIKE '%seminar%' OR LOWER(COALESCE(t.training_type, '')) LIKE '%conference%' THEN 'SEMINAR'
        ELSE 'WORKSHOP'
    END,
    COALESCE(t.training_category, 'General'),
    CASE 
        WHEN LOWER(COALESCE(t.training_level, t.data_scope, '')) LIKE '%national%' OR LOWER(COALESCE(t.training_level, t.data_scope, '')) LIKE '%country%' THEN 'NATIONAL'
        WHEN LOWER(COALESCE(t.training_level, t.data_scope, '')) LIKE '%cluster%' OR LOWER(COALESCE(t.training_level, t.data_scope, '')) LIKE '%regional%' THEN 'CLUSTER'
        ELSE 'PROVINCIAL'
    END,
    CASE 
        WHEN LOWER(COALESCE(t.training_status, '')) LIKE '%ongoing%' OR LOWER(COALESCE(t.training_status, '')) LIKE '%active%' OR LOWER(COALESCE(t.training_status, '')) LIKE '%running%' THEN 'ONGOING'
        WHEN LOWER(COALESCE(t.training_status, '')) LIKE '%completed%' OR LOWER(COALESCE(t.training_status, '')) LIKE '%finished%' OR LOWER(COALESCE(t.training_status, '')) LIKE '%done%' THEN 'COMPLETED'
        WHEN LOWER(COALESCE(t.training_status, '')) LIKE '%cancelled%' OR LOWER(COALESCE(t.training_status, '')) LIKE '%canceled%' THEN 'CANCELLED'
        ELSE 'DRAFT'
    END,
    COALESCE(t.training_start_date, CURRENT_TIMESTAMP),
    COALESCE(t.training_end_date, CURRENT_TIMESTAMP),
    t.registration_deadline,
    COALESCE(t.training_location, 'TBD'),
    COALESCE(t.training_venue, ''),
    COALESCE(t.venue_latitude, 0),
    COALESCE(t.venue_longitude, 0),
    COALESCE(t.geofence_radius, 100),
    COALESCE(t.province_name, ''),
    COALESCE(t.district_name, ''),
    COALESCE(t.commune_name, ''),
    COALESCE(t.school_name, t.school, ''),
    COALESCE(t.cluster_id, '{}'),
    COALESCE(t.max_participants, 0),
    COALESCE(t.current_participants, 0),
    COALESCE(t.qr_code_data, ''),
    COALESCE(t.gps_validation_required, false),
    COALESCE(t.geofence_validation_required, false),
    COALESCE(t.is_published, false),
    COALESCE(t.training_is_deleted, false),
    COALESCE(t.training_created_by, 'system'),
    COALESCE(t.training_updated_by, 'system'),
    COALESCE(t.training_created_at, CURRENT_TIMESTAMP),
    COALESCE(t.training_updated_at, CURRENT_TIMESTAMP)
FROM dblink('host=192.168.155.122 port=5432 dbname=ped_training_app user=admin_moeys password=testing-123',
           'SELECT training_code, training_name, training_name_english, training_description, training_type, training_category, training_level, training_status, training_start_date, training_end_date, registration_deadline, training_location, training_venue, venue_latitude, venue_longitude, geofence_radius, province_name, district_name, commune_name, school_name, school, cluster_id, max_participants, current_participants, qr_code_data, gps_validation_required, geofence_validation_required, is_published, training_is_deleted, training_created_by, training_updated_by, training_created_at, training_updated_at, training_description_english, name_english, data_scope FROM trainings ORDER BY training_created_at')
AS t(
    training_code text,
    training_name text,
    training_name_english text,
    training_description text,
    training_type text,
    training_category text,
    training_level text,
    training_status text,
    training_start_date timestamp,
    training_end_date timestamp,
    registration_deadline timestamp,
    training_location text,
    training_venue text,
    venue_latitude double precision,
    venue_longitude double precision,
    geofence_radius integer,
    province_name text,
    district_name text,
    commune_name text,
    school_name text,
    school text,
    cluster_id text[],
    max_participants integer,
    current_participants integer,
    qr_code_data text,
    gps_validation_required boolean,
    geofence_validation_required boolean,
    is_published boolean,
    training_is_deleted boolean,
    training_created_by text,
    training_updated_by text,
    training_created_at timestamp,
    training_updated_at timestamp,
    training_description_english text,
    name_english text,
    data_scope text
)
WHERE NOT EXISTS (
    SELECT 1 FROM trainings WHERE trainings.training_code = t.training_code
);

-- Insert beneficiary_trainings that don't exist in the new database
INSERT INTO beneficiary_trainings (
    beneficiary_training_id,
    beneficiary_id,
    training_id,
    registration_date,
    registration_method,
    attendance_status,
    attendance_percentage,
    training_role,
    enrollment_type,
    certificate_issued,
    certificate_number,
    certificate_issue_date,
    feedback_submitted,
    feedback_score,
    feedback_comments,
    beneficiary_training_status,
    beneficiary_training_created_at,
    beneficiary_training_updated_at
)
SELECT 
    gen_random_uuid()::text,
    bt.beneficiary_id,
    bt.training_id,
    COALESCE(bt.registration_date, CURRENT_TIMESTAMP),
    CASE 
        WHEN LOWER(COALESCE(bt.registration_method, '')) LIKE '%qr%' OR LOWER(COALESCE(bt.registration_method, '')) LIKE '%scan%' THEN 'QR'
        WHEN LOWER(COALESCE(bt.registration_method, '')) LIKE '%import%' OR LOWER(COALESCE(bt.registration_method, '')) LIKE '%bulk%' THEN 'IMPORT'
        ELSE 'MANUAL'
    END,
    CASE 
        WHEN LOWER(COALESCE(bt.attendance_status, '')) LIKE '%attended%' OR LOWER(COALESCE(bt.attendance_status, '')) LIKE '%present%' THEN 'ATTENDED'
        WHEN LOWER(COALESCE(bt.attendance_status, '')) LIKE '%completed%' OR LOWER(COALESCE(bt.attendance_status, '')) LIKE '%finished%' THEN 'COMPLETED'
        WHEN LOWER(COALESCE(bt.attendance_status, '')) LIKE '%dropped%' OR LOWER(COALESCE(bt.attendance_status, '')) LIKE '%withdrawn%' OR LOWER(COALESCE(bt.attendance_status, '')) LIKE '%left%' THEN 'DROPPED'
        ELSE 'REGISTERED'
    END,
    COALESCE(bt.attendance_percentage, 0),
    COALESCE(bt.training_role, 'PARTICIPANT'),
    COALESCE(bt.enrollment_type, 'REGULAR'),
    COALESCE(bt.certificate_issued, false),
    COALESCE(bt.certificate_number, ''),
    bt.certificate_issue_date,
    COALESCE(bt.feedback_submitted, false),
    bt.feedback_score,
    COALESCE(bt.feedback_comments, ''),
    COALESCE(bt.beneficiary_training_status, 'ACTIVE'),
    COALESCE(bt.beneficiary_training_created_at, CURRENT_TIMESTAMP),
    COALESCE(bt.beneficiary_training_updated_at, CURRENT_TIMESTAMP)
FROM dblink('host=192.168.155.122 port=5432 dbname=ped_training_app user=admin_moeys password=testing-123',
           'SELECT beneficiary_training_id, beneficiary_id, training_id, registration_date, registration_method, attendance_status, attendance_percentage, training_role, enrollment_type, certificate_issued, certificate_number, certificate_issue_date, feedback_submitted, feedback_score, feedback_comments, beneficiary_training_status, beneficiary_training_created_at, beneficiary_training_updated_at FROM beneficiary_trainings ORDER BY beneficiary_training_created_at')
AS bt(
    beneficiary_training_id text,
    beneficiary_id text,
    training_id text,
    registration_date timestamp,
    registration_method text,
    attendance_status text,
    attendance_percentage double precision,
    training_role text,
    enrollment_type text,
    certificate_issued boolean,
    certificate_number text,
    certificate_issue_date timestamp,
    feedback_submitted boolean,
    feedback_score double precision,
    feedback_comments text,
    beneficiary_training_status text,
    beneficiary_training_created_at timestamp,
    beneficiary_training_updated_at timestamp
)
WHERE NOT EXISTS (
    SELECT 1 FROM beneficiary_trainings WHERE beneficiary_trainings.beneficiary_training_id = bt.beneficiary_training_id
);

-- Insert attendance_records that don't exist in the new database
INSERT INTO attendance_records (
    id,
    training_id,
    beneficiary_id,
    date,
    morning_in,
    morning_out,
    afternoon_in,
    afternoon_out,
    session_attendance_status,
    manual_entry,
    manual_marked_by,
    manual_marked_by_name,
    manual_entry_reason,
    location_lat,
    location_lng,
    location_accuracy,
    device,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid()::text,
    ar.training_id,
    ar.beneficiary_id,
    COALESCE(ar.date, CURRENT_DATE),
    ar.morning_in,
    ar.morning_out,
    ar.afternoon_in,
    ar.afternoon_out,
    CASE 
        WHEN LOWER(COALESCE(ar.session_attendance_status, '')) LIKE '%absent%' OR LOWER(COALESCE(ar.session_attendance_status, '')) LIKE '%missed%' THEN 'ABSENT'
        WHEN LOWER(COALESCE(ar.session_attendance_status, '')) LIKE '%late%' OR LOWER(COALESCE(ar.session_attendance_status, '')) LIKE '%delayed%' THEN 'LATE'
        WHEN LOWER(COALESCE(ar.session_attendance_status, '')) LIKE '%excused%' OR LOWER(COALESCE(ar.session_attendance_status, '')) LIKE '%excusal%' THEN 'EXCUSED'
        ELSE 'PRESENT'
    END,
    COALESCE(ar.manual_entry, false),
    ar.manual_marked_by,
    ar.manual_marked_by_name,
    ar.manual_entry_reason,
    ar.manual_entry_location_lat,
    ar.manual_entry_location_lng,
    NULL, -- location_accuracy not available in source
    ar.device,
    COALESCE(ar.created_at, CURRENT_TIMESTAMP),
    COALESCE(ar.updated_at, CURRENT_TIMESTAMP)
FROM dblink('host=192.168.155.122 port=5432 dbname=ped_training_app user=admin_moeys password=testing-123',
           'SELECT id, training_id, beneficiary_id, date, morning_in, morning_out, afternoon_in, afternoon_out, session_attendance_status, manual_entry, manual_marked_by, manual_marked_by_name, manual_entry_reason, manual_entry_location_lat, manual_entry_location_lng, device, created_at, updated_at FROM attendance_records ORDER BY created_at')
AS ar(
    id text,
    training_id text,
    beneficiary_id text,
    date date,
    morning_in timestamp,
    morning_out timestamp,
    afternoon_in timestamp,
    afternoon_out timestamp,
    session_attendance_status text,
    manual_entry boolean,
    manual_marked_by text,
    manual_marked_by_name text,
    manual_entry_reason text,
    manual_entry_location_lat double precision,
    manual_entry_location_lng double precision,
    device text,
    created_at timestamp,
    updated_at timestamp
)
WHERE NOT EXISTS (
    SELECT 1 FROM attendance_records WHERE attendance_records.id = ar.id
);

-- Report final counts
SELECT 
    'Final Counts' as summary,
    (SELECT COUNT(*) FROM beneficiaries) as beneficiaries,
    (SELECT COUNT(*) FROM trainings) as trainings,
    (SELECT COUNT(*) FROM beneficiary_trainings) as beneficiary_trainings,
    (SELECT COUNT(*) FROM attendance_records) as attendance_records;