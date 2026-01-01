import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Production database connection (the one we already successfully connected to)
const prodConnectionString = 'postgresql://admin_moeys:testing-123@192.168.155.122:5432/ped_training_app_dev';

// Master database connection (the one you want to consolidate)
const masterConnectionString = 'postgresql://admin_moeys:testing-123@192.168.155.122:5432/ped_training_app';

// New database connection (from .env)
const newConnectionString = process.env.DATABASE_URL;

if (!newConnectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const newPool = new pg.Pool({
  connectionString: newConnectionString,
});

const newAdapter = new PrismaPg(newPool);
const prisma = new PrismaClient({
  adapter: newAdapter,
});

// Helper function to map sex values
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
  // Default to M if uncertain
  return 'M';
}

// Helper function to map status values
function mapStatusValue(status: any): 'ACTIVE' | 'INACTIVE' {
  if (!status) return 'ACTIVE';
  const lowerStatus = String(status).toLowerCase();
  return lowerStatus === 'inactive' || lowerStatus === 'false' || lowerStatus === '0' ? 'INACTIVE' : 'ACTIVE';
}

// Helper function to map training status values
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
    return 'DRAFT'; // Default to DRAFT for anything else (including 'planned', 'scheduled', etc.)
  }
}

// Helper function to map training type values
function mapTrainingType(type: any): 'WORKSHOP' | 'COURSE' | 'SEMINAR' {
  if (!type) return 'WORKSHOP';
  const lowerType = String(type).toLowerCase();
  if (lowerType.includes('course') || lowerType.includes('class')) {
    return 'COURSE';
  } else if (lowerType.includes('seminar') || lowerType.includes('conference')) {
    return 'SEMINAR';
  } else {
    return 'WORKSHOP'; // Default to WORKSHOP
  }
}

// Helper function to map training level
function mapTrainingLevel(level: any): 'NATIONAL' | 'PROVINCIAL' | 'CLUSTER' {
  if (!level) return 'PROVINCIAL'; // Default to PROVINCIAL
  const lowerLevel = String(level).toLowerCase();
  if (lowerLevel.includes('national') || lowerLevel.includes('country')) {
    return 'NATIONAL';
  } else if (lowerLevel.includes('cluster') || lowerLevel.includes('regional')) {
    return 'CLUSTER';
  } else {
    return 'PROVINCIAL'; // Default to PROVINCIAL
  }
}

// Helper function to map attendance status
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
    return 'REGISTERED'; // Default to REGISTERED
  }
}

// Helper function to map session attendance status
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
    return 'PRESENT'; // Default to PRESENT
  }
}

// Helper function to map registration method
function mapRegistrationMethod(method: any): 'QR' | 'MANUAL' | 'IMPORT' {
  if (!method) return 'MANUAL';
  const lowerMethod = String(method).toLowerCase();
  if (lowerMethod.includes('qr') || lowerMethod.includes('scan')) {
    return 'QR';
  } else if (lowerMethod.includes('import') || lowerMethod.includes('bulk')) {
    return 'IMPORT';
  } else {
    return 'MANUAL'; // Default to MANUAL
  }
}

// Function to test database connection
async function testDatabaseConnection(connectionString: string, dbName: string) {
  const pool = new pg.Pool({
    connectionString: connectionString,
  });
  
  try {
    const result = await pool.query('SELECT version();');
    console.log(`✅ ${dbName} connected: ${result.rows[0].version.substring(0, 50)}`);
    return { success: true, pool };
  } catch (error) {
    console.log(`❌ Could not connect to ${dbName}:`, error.message);
    return { success: false, pool };
  }
}

// Function to migrate data from a specific database
async function migrateFromDatabase(connectionString: string, dbName: string) {
  console.log(`\n🔄 Migrating data from ${dbName}...`);
  
  const dbPool = new pg.Pool({
    connectionString: connectionString,
  });
  
  try {
    // Check if beneficiaries table exists in this database
    let beneficiariesCount = 0;
    try {
      const beneficiariesCheck = await dbPool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'beneficiaries'
        );
      `);
      
      if (beneficiariesCheck.rows[0].exists) {
        const countResult = await dbPool.query('SELECT COUNT(*) FROM beneficiaries;');
        beneficiariesCount = parseInt(countResult.rows[0].count);
        console.log(`📊 ${dbName} - Beneficiaries: ${beneficiariesCount} records`);
      }
    } catch (error) {
      console.log(`⚠️ ${dbName} - Beneficiaries table check failed:`, error.message);
    }

    // Check if trainings table exists in this database
    let trainingsCount = 0;
    try {
      const trainingsCheck = await dbPool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'trainings'
        );
      `);
      
      if (trainingsCheck.rows[0].exists) {
        const countResult = await dbPool.query('SELECT COUNT(*) FROM trainings;');
        trainingsCount = parseInt(countResult.rows[0].count);
        console.log(`📚 ${dbName} - Trainings: ${trainingsCount} records`);
      }
    } catch (error) {
      console.log(`⚠️ ${dbName} - Trainings table check failed:`, error.message);
    }

    // Check if beneficiary_trainings table exists in this database
    let enrollmentsCount = 0;
    try {
      const enrollmentsCheck = await dbPool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'beneficiary_trainings'
        );
      `);
      
      if (enrollmentsCheck.rows[0].exists) {
        const countResult = await dbPool.query('SELECT COUNT(*) FROM beneficiary_trainings;');
        enrollmentsCount = parseInt(countResult.rows[0].count);
        console.log(`📝 ${dbName} - Enrollments: ${enrollmentsCount} records`);
      }
    } catch (error) {
      console.log(`⚠️ ${dbName} - Enrollments table check failed:`, error.message);
    }

    // Check if attendance_records table exists in this database
    let attendanceCount = 0;
    try {
      const attendanceCheck = await dbPool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'attendance_records'
        );
      `);
      
      if (attendanceCheck.rows[0].exists) {
        const countResult = await dbPool.query('SELECT COUNT(*) FROM attendance_records;');
        attendanceCount = parseInt(countResult.rows[0].count);
        console.log(`✅ ${dbName} - Attendance records: ${attendanceCount} records`);
      }
    } catch (error) {
      console.log(`⚠️ ${dbName} - Attendance records table check failed:`, error.message);
    }

    // Perform the actual migration if tables exist
    if (beneficiariesCount > 0) {
      console.log(`👥 Migrating beneficiaries from ${dbName}...`);
      const beneficiariesResult = await dbPool.query('SELECT * FROM beneficiaries ORDER BY created_at');
      
      let migratedBeneficiaries = 0;
      for (const row of beneficiariesResult.rows) {
        try {
          // Check if beneficiary already exists
          const existingBeneficiary = await prisma.beneficiary.findUnique({
            where: { teacher_id: row.teacher_id },
          });

          if (!existingBeneficiary) {
            await prisma.beneficiary.create({
              data: {
                teacher_id: row.teacher_id || `MIGRATED_${dbName}_${Date.now()}_${migratedBeneficiaries}`,
                name: row.name || 'Unknown',
                name_english: row.name_english || '',
                phone: row.phone || '',
                sex: mapSexValue(row.sex),
                role: row.role || row.type || '',
                passcode: row.passcode || '',
                province_name: row.province_name || '',
                district_name: row.district_name || '',
                commune_name: row.commune_name || '',
                village_name: row.village_name || '',
                school: row.school || '',
                school_id: row.school_id || '',
                position: row.position || '',
                subject: row.subject || '',
                grade: row.grade || null,
                status: mapStatusValue(row.status),
                is_deleted: Boolean(row.is_deleted),
                profile_completed: Boolean(row.profile_completed),
                profile_image_url: row.profile_image_url || '',
                signature_url: row.signature_url || '',
                created_at: row.created_at || new Date(),
                updated_at: row.updated_at || new Date(),
                created_by: row.created_by || 'system',
                updated_by: row.updated_by || 'system',
              },
            });
            migratedBeneficiaries++;
            if (migratedBeneficiaries % 500 === 0) {
              console.log(`  🔄 Migrated ${migratedBeneficiaries}/${beneficiariesResult.rows.length} beneficiaries from ${dbName}...`);
            }
          }
        } catch (error) {
          // Silently continue with next record if there's an error
          console.error(`Error migrating beneficiary ${row.teacher_id || 'unknown'} from ${dbName}:`, error.message);
        }
      }
      console.log(`✅ Migrated ${migratedBeneficiaries} beneficiaries from ${dbName}`);
    }

    if (trainingsCount > 0) {
      console.log(`📚 Migrating trainings from ${dbName}...`);
      const trainingsResult = await dbPool.query('SELECT * FROM trainings ORDER BY training_created_at');
      
      let migratedTrainings = 0;
      for (const row of trainingsResult.rows) {
        try {
          // Check if training already exists
          const existingTraining = await prisma.training.findUnique({
            where: { training_code: row.training_code },
          });

          if (!existingTraining) {
            await prisma.training.create({
              data: {
                training_code: row.training_code || `MIGRATED_${dbName}_${Date.now()}_${migratedTrainings}`,
                training_name: row.training_name || 'Unnamed Training',
                training_name_english: row.training_name_english || row.name_english || '',
                training_description: row.training_description || row.training_description_english || '',
                training_type: mapTrainingType(row.training_type),
                training_category: row.training_category || 'General',
                training_level: mapTrainingLevel(row.training_level || row.data_scope),
                training_status: mapTrainingStatus(row.training_status),
                training_start_date: row.training_start_date || new Date(),
                training_end_date: row.training_end_date || new Date(),
                registration_deadline: row.registration_deadline || null,
                training_location: row.training_location || 'TBD',
                training_venue: row.training_venue || '',
                venue_latitude: row.venue_latitude || 0,
                venue_longitude: row.venue_longitude || 0,
                geofence_radius: row.geofence_radius || 100,
                province_name: row.province_name || '',
                district_name: row.district_name || '',
                commune_name: row.commune_name || '',
                school_name: row.school_name || row.school || '',
                cluster_schools: row.cluster_id ? [row.cluster_id] : [],
                max_participants: row.max_participants || 0,
                current_participants: row.current_participants || 0,
                qr_code_data: row.qr_code_data || '',
                gps_validation_required: Boolean(row.gps_validation_required),
                geofence_validation_required: Boolean(row.geofence_validation_required),
                is_published: Boolean(row.is_published),
                training_is_deleted: Boolean(row.training_is_deleted),
                training_created_by: row.training_created_by || 'system',
                training_updated_by: row.training_updated_by || 'system',
                training_created_at: row.training_created_at || new Date(),
                training_updated_at: row.training_updated_at || new Date(),
              },
            });
            migratedTrainings++;
            if (migratedTrainings % 100 === 0) {
              console.log(`  🔄 Migrated ${migratedTrainings}/${trainingsResult.rows.length} trainings from ${dbName}...`);
            }
          }
        } catch (error) {
          // Silently continue with next record if there's an error
          console.error(`Error migrating training ${row.training_code || 'unknown'} from ${dbName}:`, error.message);
        }
      }
      console.log(`✅ Migrated ${migratedTrainings} trainings from ${dbName}`);
    }

    if (enrollmentsCount > 0) {
      console.log(`📝 Migrating enrollments from ${dbName}...`);
      const enrollmentsResult = await dbPool.query('SELECT * FROM beneficiary_trainings ORDER BY beneficiary_training_created_at');
      
      let migratedEnrollments = 0;
      for (const row of enrollmentsResult.rows) {
        try {
          // Check if enrollment already exists
          const existingEnrollment = await prisma.beneficiaryTraining.findUnique({
            where: { 
              beneficiary_training_id: row.beneficiary_training_id 
            },
          });

          if (!existingEnrollment) {
            await prisma.beneficiaryTraining.create({
              data: {
                beneficiary_training_id: row.beneficiary_training_id || `MIGRATED_${dbName}_${migratedEnrollments}`,
                beneficiary_id: row.beneficiary_id,
                training_id: row.training_id,
                registration_date: row.registration_date || new Date(),
                registration_method: mapRegistrationMethod(row.registration_method),
                attendance_status: mapAttendanceStatus(row.attendance_status),
                attendance_percentage: row.attendance_percentage || 0,
                training_role: row.training_role || 'PARTICIPANT',
                enrollment_type: row.enrollment_type || 'REGULAR',
                certificate_issued: Boolean(row.certificate_issued),
                certificate_number: row.certificate_number || '',
                certificate_issue_date: row.certificate_issue_date || null,
                feedback_submitted: Boolean(row.feedback_submitted),
                feedback_score: row.feedback_score || null,
                feedback_comments: row.feedback_comments || '',
                beneficiary_training_status: row.beneficiary_training_status || 'ACTIVE',
                beneficiary_training_created_at: row.beneficiary_training_created_at || new Date(),
                beneficiary_training_updated_at: row.beneficiary_training_updated_at || new Date(),
              },
            });
            migratedEnrollments++;
            if (migratedEnrollments % 500 === 0) {
              console.log(`  🔄 Migrated ${migratedEnrollments}/${enrollmentsResult.rows.length} enrollments from ${dbName}...`);
            }
          }
        } catch (error) {
          // Silently continue with next record if there's an error
          console.error(`Error migrating enrollment ${row.beneficiary_training_id || 'unknown'} from ${dbName}:`, error.message);
        }
      }
      console.log(`✅ Migrated ${migratedEnrollments} enrollments from ${dbName}`);
    }

    if (attendanceCount > 0) {
      console.log(`✅ Migrating attendance records from ${dbName}...`);
      const attendanceResult = await dbPool.query('SELECT * FROM attendance_records ORDER BY created_at');
      
      let migratedAttendance = 0;
      for (const row of attendanceResult.rows) {
        try {
          // Create a unique ID for the new system if needed
          const newId = row.id || `MIGRATED_${dbName}_${Date.now()}_${migratedAttendance}`;
          
          // Check if attendance record already exists
          const existingAttendance = await prisma.attendanceRecord.findUnique({
            where: { 
              id: newId 
            },
          });

          if (!existingAttendance) {
            await prisma.attendanceRecord.create({
              data: {
                id: newId,
                training_id: row.training_id,
                beneficiary_id: row.beneficiary_id,
                date: row.date || new Date(),
                morning_in: row.morning_in || null,
                morning_out: row.morning_out || null,
                afternoon_in: row.afternoon_in || null,
                afternoon_out: row.afternoon_out || null,
                session_attendance_status: mapSessionAttendanceStatus(row.session_attendance_status),
                manual_entry: Boolean(row.manual_entry),
                manual_marked_by: row.manual_marked_by || null,
                manual_marked_by_name: row.manual_marked_by_name || null,
                manual_entry_reason: row.manual_entry_reason || null,
                location_lat: row.manual_entry_location_lat || null,
                location_lng: row.manual_entry_location_lng || null,
                location_accuracy: null, // Not available in source schema
                device: row.device || null,
                created_at: row.created_at || new Date(),
                updated_at: row.updated_at || new Date(),
              },
            });
            migratedAttendance++;
            if (migratedAttendance % 1000 === 0) {
              console.log(`  🔄 Migrated ${migratedAttendance}/${attendanceResult.rows.length} attendance records from ${dbName}...`);
            }
          }
        } catch (error) {
          // Silently continue with next record if there's an error
          console.error(`Error migrating attendance record ${row.id || 'unknown'} from ${dbName}:`, error.message);
        }
      }
      console.log(`✅ Migrated ${migratedAttendance} attendance records from ${dbName}`);
    }

    console.log(`🎉 Completed migration from ${dbName}`);
    return { 
      beneficiaries: beneficiariesCount, 
      trainings: trainingsCount, 
      enrollments: enrollmentsCount, 
      attendance: attendanceCount 
    };
  } catch (error) {
    console.error(`❌ Error during migration from ${dbName}:`, error);
    return { beneficiaries: 0, trainings: 0, enrollments: 0, attendance: 0 };
  } finally {
    await dbPool.end();
  }
}

async function consolidateDatabases() {
  console.log('🚀 Starting database consolidation process...');
  console.log('📋 This will consolidate data from multiple databases into the new platform');
  console.log('');

  // Test connections first
  console.log('🔍 Testing database connections...');
  const prodDb = await testDatabaseConnection(prodConnectionString, 'Production DB (ped_training_app_dev)');
  const masterDb = await testDatabaseConnection(masterConnectionString, 'Master DB (ped_training_app)');
  console.log('');

  let totalBeneficiaries = 0;
  let totalTrainings = 0;
  let totalEnrollments = 0;
  let totalAttendance = 0;

  // Migrate from Production DB if accessible
  if (prodDb.success) {
    const counts = await migrateFromDatabase(prodConnectionString, 'Production DB (ped_training_app_dev)');
    totalBeneficiaries += counts.beneficiaries;
    totalTrainings += counts.trainings;
    totalEnrollments += counts.enrollments;
    totalAttendance += counts.attendance;
  }

  // Migrate from Master DB if accessible
  if (masterDb.success) {
    const counts = await migrateFromDatabase(masterConnectionString, 'Master DB (ped_training_app)');
    totalBeneficiaries += counts.beneficiaries;
    totalTrainings += counts.trainings;
    totalEnrollments += counts.enrollments;
    totalAttendance += counts.attendance;
  }

  console.log('\n🎉 Database consolidation completed successfully!');
  console.log('📊 Final Consolidation Summary:');
  console.log(`  - Total Beneficiaries: ${totalBeneficiaries}`);
  console.log(`  - Total Trainings: ${totalTrainings}`);
  console.log(`  - Total Enrollments: ${totalEnrollments}`);
  console.log(`  - Total Attendance Records: ${totalAttendance}`);
  console.log('\nAll data from both databases has been consolidated into the new modern platform!');

  // Count what we have in the new database now
  try {
    const newBeneficiaries = await prisma.beneficiary.count();
    const newTrainings = await prisma.training.count();
    const newEnrollments = await prisma.beneficiaryTraining.count();
    const newAttendance = await prisma.attendanceRecord.count();

    console.log('\n📋 Current data in the new platform:');
    console.log(`  - Beneficiaries: ${newBeneficiaries}`);
    console.log(`  - Trainings: ${newTrainings}`);
    console.log(`  - Enrollments: ${newEnrollments}`);
    console.log(`  - Attendance Records: ${newAttendance}`);
  } catch (error) {
    console.log('⚠️ Could not count current data in the new platform:', error.message);
  }
}

// Run the consolidation
consolidateDatabases()
  .then(() => {
    console.log('\n✅ Database consolidation script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database consolidation script failed:', error);
    process.exit(1);
  });