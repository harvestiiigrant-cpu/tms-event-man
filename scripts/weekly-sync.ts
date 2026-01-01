import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';
import pg from 'pg';
import fs from 'fs';

// Source database connection
const sourceConnectionString = 'postgresql://admin_moeys:testing-123@192.168.155.122:5433/ped_training_app?pgbouncer=true';

// Target database connection (from environment)
const targetConnectionString = process.env.DATABASE_URL;

if (!targetConnectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sourcePool = new pg.Pool({
  connectionString: sourceConnectionString,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 5
});

const prisma = new PrismaClient();

// Track last sync timestamp
const LAST_SYNC_FILE = './.last-sync-timestamp';

async function getLastSyncTimestamp(): Promise<Date | null> {
  try {
    const timestamp = fs.readFileSync(LAST_SYNC_FILE, 'utf8');
    return new Date(timestamp);
  } catch (error) {
    // If no sync file exists, return null to sync all records
    return null;
  }
}

async function saveLastSyncTimestamp(timestamp: Date): Promise<void> {
  fs.writeFileSync(LAST_SYNC_FILE, timestamp.toISOString());
}

// Helper functions for data mapping (same as used in consolidation)
function mapSexValue(sex: any): 'M' | 'F' {
  if (!sex) return 'M';
  if (typeof sex === 'string') {
    const lowerSex = sex.toLowerCase();
    if (lowerSex.includes('f') || lowerSex.includes('female')) {
      return 'F';
    } else if (lowerSex.includes('m') || lowerSex.includes('male')) {
      return 'M';
    }
  }
  return 'M';
}

function mapStatusValue(status: any): 'ACTIVE' | 'INACTIVE' {
  if (!status) return 'ACTIVE';
  const lowerStatus = String(status).toLowerCase();
  return lowerStatus === 'inactive' || lowerStatus === 'false' || lowerStatus === '0' ? 'INACTIVE' : 'ACTIVE';
}

function mapTrainingStatus(status: any): 'DRAFT' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' {
  if (!status) return 'DRAFT';
  const lowerStatus = String(status).toLowerCase();
  if (lowerStatus.includes('ongoing') || lowerStatus.includes('active') || lowerStatus.includes('running')) {
    return 'ONGOING';
  } else if (lowerStatus.includes('completed') || lowerStatus.includes('finished') || lowerStatus.includes('done')) {
    return 'COMPLETED';
  } else if (lowerStatus.includes('cancelled') || lowerStatus.includes('canceled')) {
    return 'CANCELLED';
  } else {
    return 'DRAFT';
  }
}

function mapTrainingType(type: any): 'WORKSHOP' | 'COURSE' | 'SEMINAR' {
  if (!type) return 'WORKSHOP';
  const lowerType = String(type).toLowerCase();
  if (lowerType.includes('course') || lowerType.includes('class')) {
    return 'COURSE';
  } else if (lowerType.includes('seminar') || lowerType.includes('conference')) {
    return 'SEMINAR';
  } else {
    return 'WORKSHOP';
  }
}

function mapTrainingLevel(level: any): 'NATIONAL' | 'PROVINCIAL' | 'CLUSTER' {
  if (!level) return 'PROVINCIAL';
  const lowerLevel = String(level).toLowerCase();
  if (lowerLevel.includes('national') || lowerLevel.includes('country')) {
    return 'NATIONAL';
  } else if (lowerLevel.includes('cluster') || lowerLevel.includes('regional')) {
    return 'CLUSTER';
  } else {
    return 'PROVINCIAL';
  }
}

function mapAttendanceStatus(status: any): 'REGISTERED' | 'ATTENDED' | 'COMPLETED' | 'DROPPED' {
  if (!status) return 'REGISTERED';
  const lowerStatus = String(status).toLowerCase();
  if (lowerStatus.includes('attended') || lowerStatus.includes('present')) {
    return 'ATTENDED';
  } else if (lowerStatus.includes('completed') || lowerStatus.includes('finished')) {
    return 'COMPLETED';
  } else if (lowerStatus.includes('dropped') || lowerStatus.includes('withdrawn') || lowerStatus.includes('left')) {
    return 'DROPPED';
  } else {
    return 'REGISTERED';
  }
}

function mapSessionAttendanceStatus(status: any): 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' {
  if (!status) return 'PRESENT';
  const lowerStatus = String(status).toLowerCase();
  if (lowerStatus.includes('absent') || lowerStatus.includes('missed')) {
    return 'ABSENT';
  } else if (lowerStatus.includes('late') || lowerStatus.includes('delayed')) {
    return 'LATE';
  } else if (lowerStatus.includes('excused') || lowerStatus.includes('excusal')) {
    return 'EXCUSED';
  } else {
    return 'PRESENT';
  }
}

function mapRegistrationMethod(method: any): 'QR' | 'MANUAL' | 'IMPORT' {
  if (!method) return 'MANUAL';
  const lowerMethod = String(method).toLowerCase();
  if (lowerMethod.includes('qr') || lowerMethod.includes('scan')) {
    return 'QR';
  } else if (lowerMethod.includes('import') || lowerMethod.includes('bulk')) {
    return 'IMPORT';
  } else {
    return 'MANUAL';
  }
}

async function syncBeneficiaries(): Promise<void> {
  console.log('🔄 Syncing beneficiaries...');
  
  const lastSync = await getLastSyncTimestamp();
  const lastSyncCondition = lastSync ? `WHERE updated_at > '${lastSync.toISOString()}'` : '';
  
  const sourceQuery = `SELECT * FROM beneficiaries ${lastSyncCondition} ORDER BY updated_at`;
  const sourceResult = await sourcePool.query(sourceQuery);
  
  let syncedCount = 0;
  for (const row of sourceResult.rows) {
    try {
      await prisma.beneficiary.upsert({
        where: { teacher_id: row.teacher_id },
        update: {
          name: row.name,
          name_english: row.name_english,
          phone: row.phone,
          sex: mapSexValue(row.sex),
          role: row.role || row.type,
          passcode: row.passcode,
          province_name: row.province_name,
          district_name: row.district_name,
          commune_name: row.commune_name,
          village_name: row.village_name,
          school: row.school,
          school_id: row.school_id,
          position: row.position,
          subject: row.subject,
          grade: row.grade,
          status: mapStatusValue(row.status),
          is_deleted: Boolean(row.is_deleted),
          profile_completed: Boolean(row.profile_completed),
          profile_image_url: row.profile_image_url,
          signature_url: row.signature_url,
          updated_at: row.updated_at,
          updated_by: row.updated_by || 'system',
        },
        create: {
          teacher_id: row.teacher_id,
          name: row.name,
          name_english: row.name_english,
          phone: row.phone,
          sex: mapSexValue(row.sex),
          role: row.role || row.type,
          passcode: row.passcode,
          province_name: row.province_name,
          district_name: row.district_name,
          commune_name: row.commune_name,
          village_name: row.village_name,
          school: row.school,
          school_id: row.school_id,
          position: row.position,
          subject: row.subject,
          grade: row.grade,
          status: mapStatusValue(row.status),
          is_deleted: Boolean(row.is_deleted),
          profile_completed: Boolean(row.profile_completed),
          profile_image_url: row.profile_image_url,
          signature_url: row.signature_url,
          created_at: row.created_at,
          updated_at: row.updated_at,
          created_by: row.created_by || 'system',
          updated_by: row.updated_by || 'system',
        },
      });
      syncedCount++;
    } catch (error) {
      console.error(`Error syncing beneficiary ${row.teacher_id}:`, error.message);
    }
  }
  
  console.log(`✅ Synced ${syncedCount} beneficiaries`);
}

async function syncTrainings(): Promise<void> {
  console.log('🔄 Syncing trainings...');
  
  const lastSync = await getLastSyncTimestamp();
  const lastSyncCondition = lastSync ? `WHERE training_updated_at > '${lastSync.toISOString()}'` : '';
  
  const sourceQuery = `SELECT * FROM trainings ${lastSyncCondition} ORDER BY training_updated_at`;
  const sourceResult = await sourcePool.query(sourceQuery);
  
  let syncedCount = 0;
  for (const row of sourceResult.rows) {
    try {
      await prisma.training.upsert({
        where: { training_code: row.training_code },
        update: {
          training_name: row.training_name,
          training_name_english: row.training_name_english || row.name_english,
          training_description: row.training_description || row.training_description_english,
          training_type: mapTrainingType(row.training_type),
          training_category: row.training_category,
          training_level: mapTrainingLevel(row.training_level || row.data_scope),
          training_status: mapTrainingStatus(row.training_status),
          training_start_date: row.training_start_date,
          training_end_date: row.training_end_date,
          registration_deadline: row.registration_deadline,
          training_location: row.training_location,
          training_venue: row.training_venue,
          venue_latitude: row.venue_latitude,
          venue_longitude: row.venue_longitude,
          geofence_radius: row.geofence_radius,
          province_name: row.province_name,
          district_name: row.district_name,
          commune_name: row.commune_name,
          school_name: row.school_name || row.school,
          cluster_schools: row.cluster_id ? [row.cluster_id] : [],
          max_participants: row.max_participants,
          current_participants: row.current_participants,
          qr_code_data: row.qr_code_data,
          gps_validation_required: Boolean(row.gps_validation_required),
          geofence_validation_required: Boolean(row.geofence_validation_required),
          is_published: Boolean(row.is_published),
          training_is_deleted: Boolean(row.training_is_deleted),
          training_updated_at: row.training_updated_at,
          training_updated_by: row.training_updated_by || 'system',
        },
        create: {
          training_code: row.training_code,
          training_name: row.training_name,
          training_name_english: row.training_name_english || row.name_english,
          training_description: row.training_description || row.training_description_english,
          training_type: mapTrainingType(row.training_type),
          training_category: row.training_category,
          training_level: mapTrainingLevel(row.training_level || row.data_scope),
          training_status: mapTrainingStatus(row.training_status),
          training_start_date: row.training_start_date,
          training_end_date: row.training_end_date,
          registration_deadline: row.registration_deadline,
          training_location: row.training_location,
          training_venue: row.training_venue,
          venue_latitude: row.venue_latitude,
          venue_longitude: row.venue_longitude,
          geofence_radius: row.geofence_radius,
          province_name: row.province_name,
          district_name: row.district_name,
          commune_name: row.commune_name,
          school_name: row.school_name || row.school,
          cluster_schools: row.cluster_id ? [row.cluster_id] : [],
          max_participants: row.max_participants,
          current_participants: row.current_participants,
          qr_code_data: row.qr_code_data,
          gps_validation_required: Boolean(row.gps_validation_required),
          geofence_validation_required: Boolean(row.geofence_validation_required),
          is_published: Boolean(row.is_published),
          training_is_deleted: Boolean(row.training_is_deleted),
          training_created_by: row.training_created_by || 'system',
          training_updated_by: row.training_updated_by || 'system',
          training_created_at: row.training_created_at,
          training_updated_at: row.training_updated_at,
        },
      });
      syncedCount++;
    } catch (error) {
      console.error(`Error syncing training ${row.training_code}:`, error.message);
    }
  }
  
  console.log(`✅ Synced ${syncedCount} trainings`);
}

async function syncEnrollments(): Promise<void> {
  console.log('🔄 Syncing beneficiary training enrollments...');
  
  const lastSync = await getLastSyncTimestamp();
  const lastSyncCondition = lastSync ? `WHERE beneficiary_training_updated_at > '${lastSync.toISOString()}'` : '';
  
  const sourceQuery = `SELECT * FROM beneficiary_trainings ${lastSyncCondition} ORDER BY beneficiary_training_updated_at`;
  const sourceResult = await sourcePool.query(sourceQuery);
  
  let syncedCount = 0;
  for (const row of sourceResult.rows) {
    try {
      await prisma.beneficiaryTraining.upsert({
        where: { beneficiary_training_id: row.beneficiary_training_id },
        update: {
          beneficiary_id: row.beneficiary_id,
          training_id: row.training_id,
          registration_date: row.registration_date,
          registration_method: mapRegistrationMethod(row.registration_method),
          attendance_status: mapAttendanceStatus(row.attendance_status),
          attendance_percentage: row.attendance_percentage,
          training_role: row.training_role || 'PARTICIPANT',
          enrollment_type: row.enrollment_type || 'REGULAR',
          certificate_issued: Boolean(row.certificate_issued),
          certificate_number: row.certificate_number,
          certificate_issue_date: row.certificate_issue_date,
          feedback_submitted: Boolean(row.feedback_submitted),
          feedback_score: row.feedback_score,
          feedback_comments: row.feedback_comments,
          beneficiary_training_status: row.beneficiary_training_status || 'ACTIVE',
          beneficiary_training_updated_at: row.beneficiary_training_updated_at,
        },
        create: {
          beneficiary_training_id: row.beneficiary_training_id,
          beneficiary_id: row.beneficiary_id,
          training_id: row.training_id,
          registration_date: row.registration_date,
          registration_method: mapRegistrationMethod(row.registration_method),
          attendance_status: mapAttendanceStatus(row.attendance_status),
          attendance_percentage: row.attendance_percentage,
          training_role: row.training_role || 'PARTICIPANT',
          enrollment_type: row.enrollment_type || 'REGULAR',
          certificate_issued: Boolean(row.certificate_issued),
          certificate_number: row.certificate_number,
          certificate_issue_date: row.certificate_issue_date,
          feedback_submitted: Boolean(row.feedback_submitted),
          feedback_score: row.feedback_score,
          feedback_comments: row.feedback_comments,
          beneficiary_training_status: row.beneficiary_training_status || 'ACTIVE',
          beneficiary_training_created_at: row.beneficiary_training_created_at,
          beneficiary_training_updated_at: row.beneficiary_training_updated_at,
        },
      });
      syncedCount++;
    } catch (error) {
      console.error(`Error syncing enrollment ${row.beneficiary_training_id}:`, error.message);
    }
  }
  
  console.log(`✅ Synced ${syncedCount} enrollments`);
}

async function syncAttendance(): Promise<void> {
  console.log('🔄 Syncing attendance records...');
  
  const lastSync = await getLastSyncTimestamp();
  const lastSyncCondition = lastSync ? `WHERE updated_at > '${lastSync.toISOString()}'` : '';
  
  const sourceQuery = `SELECT * FROM attendance_records ${lastSyncCondition} ORDER BY updated_at`;
  const sourceResult = await sourcePool.query(sourceQuery);
  
  let syncedCount = 0;
  for (const row of sourceResult.rows) {
    try {
      await prisma.attendanceRecord.upsert({
        where: { id: row.id },
        update: {
          training_id: row.training_id,
          beneficiary_id: row.beneficiary_id,
          date: row.date,
          morning_in: row.morning_in,
          morning_out: row.morning_out,
          afternoon_in: row.afternoon_in,
          afternoon_out: row.afternoon_out,
          session_attendance_status: mapSessionAttendanceStatus(row.session_attendance_status),
          manual_entry: Boolean(row.manual_entry),
          manual_marked_by: row.manual_marked_by,
          manual_marked_by_name: row.manual_marked_by_name,
          manual_entry_reason: row.manual_entry_reason,
          location_lat: row.manual_entry_location_lat,
          location_lng: row.manual_entry_location_lng,
          location_accuracy: null, // Not available in source schema
          device: row.device,
          updated_at: row.updated_at,
        },
        create: {
          id: row.id,
          training_id: row.training_id,
          beneficiary_id: row.beneficiary_id,
          date: row.date,
          morning_in: row.morning_in,
          morning_out: row.morning_out,
          afternoon_in: row.afternoon_in,
          afternoon_out: row.afternoon_out,
          session_attendance_status: mapSessionAttendanceStatus(row.session_attendance_status),
          manual_entry: Boolean(row.manual_entry),
          manual_marked_by: row.manual_marked_by,
          manual_marked_by_name: row.manual_marked_by_name,
          manual_entry_reason: row.manual_entry_reason,
          location_lat: row.manual_entry_location_lat,
          location_lng: row.manual_entry_location_lng,
          location_accuracy: null, // Not available in source schema
          device: row.device,
          created_at: row.created_at,
          updated_at: row.updated_at,
        },
      });
      syncedCount++;
    } catch (error) {
      console.error(`Error syncing attendance record ${row.id}:`, error.message);
    }
  }
  
  console.log(`✅ Synced ${syncedCount} attendance records`);
}

async function runSync(): Promise<void> {
  console.log('🔄 Starting weekly data sync...');
  
  try {
    const startTime = new Date();
    console.log(`📅 Sync started at: ${startTime.toISOString()}`);
    
    await syncBeneficiaries();
    await syncTrainings();
    await syncEnrollments();
    await syncAttendance();
    
    // Save the sync timestamp after successful completion
    await saveLastSyncTimestamp(new Date());
    
    const endTime = new Date();
    console.log(`✅ Sync completed at: ${endTime.toISOString()}`);
    console.log(`⏱️ Total sync time: ${(endTime.getTime() - startTime.getTime()) / 1000} seconds`);
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    throw error;
  } finally {
    await sourcePool.end();
    await prisma.$disconnect();
  }
}

// Run the sync if called directly
if (require.main === module) {
  runSync()
    .then(() => {
      console.log('Weekly sync completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Weekly sync failed:', error);
      process.exit(1);
    });
}

export { runSync };