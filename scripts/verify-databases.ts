import 'dotenv/config';
import pg from 'pg';

// Master database connection
const masterConnectionString = 'postgresql://admin_moeys:testing-123@192.168.155.122:5432/ped_training_app';

// New database connection (from .env)
const newConnectionString = process.env.DATABASE_URL;

if (!newConnectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const newPool = new pg.Pool({
  connectionString: newConnectionString,
});

const masterPool = new pg.Pool({
  connectionString: masterConnectionString,
  connectionTimeoutMillis: 30000, // 30 seconds timeout
  idleTimeoutMillis: 30000,
  max: 5
});

async function verifyDatabases() {
  console.log('🔍 Verifying database connections and data...');
  console.log('');

  try {
    // Test master database
    console.log('📡 Testing master database connection...');
    const masterResult = await masterPool.query('SELECT version();');
    console.log('✅ Master database connected successfully');
    console.log(`   Version: ${masterResult.rows[0].version.substring(0, 50)}...`);
    
    // Test new database
    console.log('');
    console.log('📡 Testing new database connection...');
    const newResult = await newPool.query('SELECT version();');
    console.log('✅ New database connected successfully');
    console.log(`   Version: ${newResult.rows[0].version.substring(0, 50)}...`);
    
    // Check data in master database
    console.log('');
    console.log('📊 Checking data in master database...');
    
    const masterCounts = {
      beneficiaries: 0,
      trainings: 0,
      beneficiary_trainings: 0,
      attendance_records: 0
    };
    
    try {
      const beneficiariesResult = await masterPool.query('SELECT COUNT(*) FROM beneficiaries');
      masterCounts.beneficiaries = parseInt(beneficiariesResult.rows[0].count);
      console.log(`   Beneficiaries: ${masterCounts.beneficiaries}`);
    } catch (e) {
      console.log(`   Beneficiaries: Error - ${e.message}`);
    }
    
    try {
      const trainingsResult = await masterPool.query('SELECT COUNT(*) FROM trainings');
      masterCounts.trainings = parseInt(trainingsResult.rows[0].count);
      console.log(`   Trainings: ${masterCounts.trainings}`);
    } catch (e) {
      console.log(`   Trainings: Error - ${e.message}`);
    }
    
    try {
      const beneficiaryTrainingsResult = await masterPool.query('SELECT COUNT(*) FROM beneficiary_trainings');
      masterCounts.beneficiary_trainings = parseInt(beneficiaryTrainingsResult.rows[0].count);
      console.log(`   Beneficiary Trainings: ${masterCounts.beneficiary_trainings}`);
    } catch (e) {
      console.log(`   Beneficiary Trainings: Error - ${e.message}`);
    }
    
    try {
      const attendanceResult = await masterPool.query('SELECT COUNT(*) FROM attendance_records');
      masterCounts.attendance_records = parseInt(attendanceResult.rows[0].count);
      console.log(`   Attendance Records: ${masterCounts.attendance_records}`);
    } catch (e) {
      console.log(`   Attendance Records: Error - ${e.message}`);
    }
    
    // Check data in new database
    console.log('');
    console.log('📊 Checking data in new database...');
    
    const newCounts = {
      beneficiaries: 0,
      trainings: 0,
      beneficiary_trainings: 0,
      attendance_records: 0
    };
    
    try {
      const beneficiariesResult = await newPool.query('SELECT COUNT(*) FROM beneficiaries');
      newCounts.beneficiaries = parseInt(beneficiariesResult.rows[0].count);
      console.log(`   Beneficiaries: ${newCounts.beneficiaries}`);
    } catch (e) {
      console.log(`   Beneficiaries: Error - ${e.message}`);
    }
    
    try {
      const trainingsResult = await newPool.query('SELECT COUNT(*) FROM trainings');
      newCounts.trainings = parseInt(trainingsResult.rows[0].count);
      console.log(`   Trainings: ${newCounts.trainings}`);
    } catch (e) {
      console.log(`   Trainings: Error - ${e.message}`);
    }
    
    try {
      const beneficiaryTrainingsResult = await newPool.query('SELECT COUNT(*) FROM beneficiary_trainings');
      newCounts.beneficiary_trainings = parseInt(beneficiaryTrainingsResult.rows[0].count);
      console.log(`   Beneficiary Trainings: ${newCounts.beneficiary_trainings}`);
    } catch (e) {
      console.log(`   Beneficiary Trainings: Error - ${e.message}`);
    }
    
    try {
      const attendanceResult = await newPool.query('SELECT COUNT(*) FROM attendance_records');
      newCounts.attendance_records = parseInt(attendanceResult.rows[0].count);
      console.log(`   Attendance Records: ${newCounts.attendance_records}`);
    } catch (e) {
      console.log(`   Attendance Records: Error - ${e.message}`);
    }
    
    console.log('');
    console.log('🎉 Database verification completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   Master Database Total: ${Object.values(masterCounts).reduce((a, b) => a + b, 0)} records`);
    console.log(`   New Database Total: ${Object.values(newCounts).reduce((a, b) => a + b, 0)} records`);
    
  } catch (error) {
    console.error('❌ Error during database verification:', error);
    throw error;
  } finally {
    await masterPool.end();
    await newPool.end();
  }
}

verifyDatabases()
  .then(() => {
    console.log('\n✅ Database verification script completed successfully');
  })
  .catch((error) => {
    console.error('❌ Database verification script failed:', error);
  });