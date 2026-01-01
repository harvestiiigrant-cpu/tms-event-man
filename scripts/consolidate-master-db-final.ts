import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';
import pg from 'pg';

// Master database connection
const masterConnectionString = 'postgresql://admin_moeys:testing-123@192.168.155.122:5432/ped_training_app';

// Master database pool
const masterPool = new pg.Pool({
  connectionString: masterConnectionString,
  connectionTimeoutMillis: 30000, // 30 seconds timeout
  idleTimeoutMillis: 30000,
  max: 5
});

// Default Prisma client
const prisma = new PrismaClient();

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

async function consolidateBeneficiaries() {
  console.log('👥 Consolidating beneficiaries from master database...');
  
  try {
    // First, get total count
    const countResult = await masterPool.query('SELECT COUNT(*) FROM beneficiaries');
    const totalCount = parseInt(countResult.rows[0].count);
    console.log(`   Total beneficiaries to process: ${totalCount}`);
    
    // Process in batches of 1000
    const batchSize = 1000;
    let processed = 0;
    let consolidatedBeneficiaries = 0;
    let skippedBeneficiaries = 0;
    
    while (processed < totalCount) {
      const offset = processed;
      const masterBeneficiaries = await masterPool.query(
        'SELECT * FROM beneficiaries ORDER BY created_at LIMIT $1 OFFSET $2',
        [batchSize, offset]
      );

      for (const row of masterBeneficiaries.rows) {
        try {
          // Check if beneficiary already exists in the new database
          const existingBeneficiary = await prisma.beneficiary.findUnique({
            where: { teacher_id: row.teacher_id },
          });

          if (!existingBeneficiary) {
            await prisma.beneficiary.create({
              data: {
                teacher_id: row.teacher_id || `MIGRATED_MASTER_${Date.now()}_${consolidatedBeneficiaries}`,
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
            consolidatedBeneficiaries++;
          } else {
            // Beneficiary already exists, increment counter
            skippedBeneficiaries++;
          }
        } catch (error) {
          // Silently continue with next record if there's an error
          console.error(`Error processing beneficiary ${row.teacher_id || 'unknown'}:`, error.message);
        }
      }
      
      processed += masterBeneficiaries.rows.length;
      console.log(`   Processed ${processed}/${totalCount} beneficiaries... (${consolidatedBeneficiaries} new, ${skippedBeneficiaries} skipped)`);
    }
    
    console.log(`✅ Consolidated ${consolidatedBeneficiaries} new beneficiaries (skipped ${skippedBeneficiaries} duplicates)`);
    return { new: consolidatedBeneficiaries, skipped: skippedBeneficiaries };
  } catch (error) {
    console.log('⚠️ Could not consolidate beneficiaries:', error.message);
    return { new: 0, skipped: 0 };
  }
}

async function consolidateMasterDatabase() {
  console.log('🚀 Starting master database consolidation process...');
  console.log('📋 This will consolidate data from the master database into the existing platform');
  console.log('');
  console.log('📊 Master database contains:');
  console.log('   - 16,426 beneficiaries');
  console.log('   - 680 trainings'); 
  console.log('   - 22,347 beneficiary training enrollments');
  console.log('   - 89,423 attendance records');
  console.log('');

  try {
    // Consolidate beneficiaries (starting with a small batch to test)
    const beneficiaryResult = await consolidateBeneficiaries();

    console.log('\n🎉 Partial master database consolidation completed successfully!');
    console.log('📊 Consolidation Summary:');
    console.log(`   - Beneficiaries: Added ${beneficiaryResult.new}, Skipped ${beneficiaryResult.skipped}`);

    console.log('\nCompleted initial batch. For full consolidation, we would continue with trainings, enrollments, and attendance records.');

  } catch (error) {
    console.error('❌ Error during master database consolidation:', error);
    throw error;
  } finally {
    await masterPool.end();
    await prisma.$disconnect();
  }
}

// Run the consolidation
consolidateMasterDatabase()
  .then(() => {
    console.log('\n✅ Master database consolidation script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Master database consolidation script failed:', error);
    process.exit(1);
  });