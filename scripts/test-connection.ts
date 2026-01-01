import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Production database connection
const prodConnectionString = 'postgresql://admin_moeys:testing-123@192.168.155.122:5432/ped_training_app_dev';

// New database connection (from .env)
const newConnectionString = process.env.DATABASE_URL;

if (!newConnectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const prodPool = new pg.Pool({
  connectionString: prodConnectionString,
});

const newPool = new pg.Pool({
  connectionString: newConnectionString,
});

const newAdapter = new PrismaPg(newPool);
const prisma = new PrismaClient({
  adapter: newAdapter,
});

async function testConnection() {
  console.log('🔍 Testing connections...');

  try {
    // Test production database connection
    console.log('📡 Connecting to production database...');
    const prodResult = await prodPool.query('SELECT version();');
    console.log('✅ Production database connected:', prodResult.rows[0].version.substring(0, 50) + '...');

    // Test new database connection
    console.log('📡 Connecting to new database...');
    const newResult = await newPool.query('SELECT version();');
    console.log('✅ New database connected:', newResult.rows[0].version.substring(0, 50) + '...');

    // Test if beneficiaries table exists in production
    console.log('📋 Checking for beneficiaries table...');
    try {
      const beneficiariesCheck = await prodPool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'beneficiaries'
        );
      `);
      console.log('📊 Beneficiaries table exists:', beneficiariesCheck.rows[0].exists);
      
      if (beneficiariesCheck.rows[0].exists) {
        // Count beneficiaries
        const countResult = await prodPool.query('SELECT COUNT(*) FROM beneficiaries;');
        console.log('👥 Beneficiaries count:', countResult.rows[0].count);
        
        // Get sample record to see column names
        const sampleResult = await prodPool.query('SELECT * FROM beneficiaries LIMIT 1;');
        if (sampleResult.rows.length > 0) {
          console.log('📋 Beneficiaries columns:', Object.keys(sampleResult.rows[0]));
        }
      }
    } catch (error) {
      console.log('⚠️ Beneficiaries table check failed:', error.message);
    }

    // Test if trainings table exists in production
    console.log('📋 Checking for trainings table...');
    try {
      const trainingsCheck = await prodPool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'trainings'
        );
      `);
      console.log('📊 Trainings table exists:', trainingsCheck.rows[0].exists);
      
      if (trainingsCheck.rows[0].exists) {
        // Count trainings
        const countResult = await prodPool.query('SELECT COUNT(*) FROM trainings;');
        console.log('📚 Trainings count:', countResult.rows[0].count);
        
        // Get sample record to see column names
        const sampleResult = await prodPool.query('SELECT * FROM trainings LIMIT 1;');
        if (sampleResult.rows.length > 0) {
          console.log('📋 Trainings columns:', Object.keys(sampleResult.rows[0]));
        }
      }
    } catch (error) {
      console.log('⚠️ Trainings table check failed:', error.message);
    }

    // Test if beneficiary_trainings table exists in production
    console.log('📋 Checking for beneficiary_trainings table...');
    try {
      const enrollmentsCheck = await prodPool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'beneficiary_trainings'
        );
      `);
      console.log('📊 Beneficiary trainings table exists:', enrollmentsCheck.rows[0].exists);
      
      if (enrollmentsCheck.rows[0].exists) {
        // Count enrollments
        const countResult = await prodPool.query('SELECT COUNT(*) FROM beneficiary_trainings;');
        console.log('📝 Beneficiary trainings count:', countResult.rows[0].count);
        
        // Get sample record to see column names
        const sampleResult = await prodPool.query('SELECT * FROM beneficiary_trainings LIMIT 1;');
        if (sampleResult.rows.length > 0) {
          console.log('📋 Beneficiary trainings columns:', Object.keys(sampleResult.rows[0]));
        }
      }
    } catch (error) {
      console.log('⚠️ Beneficiary trainings table check failed:', error.message);
    }

    // Test if attendance_records table exists in production
    console.log('📋 Checking for attendance_records table...');
    try {
      const attendanceCheck = await prodPool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'attendance_records'
        );
      `);
      console.log('📊 Attendance records table exists:', attendanceCheck.rows[0].exists);
      
      if (attendanceCheck.rows[0].exists) {
        // Count attendance records
        const countResult = await prodPool.query('SELECT COUNT(*) FROM attendance_records;');
        console.log('✅ Attendance records count:', countResult.rows[0].count);
        
        // Get sample record to see column names
        const sampleResult = await prodPool.query('SELECT * FROM attendance_records LIMIT 1;');
        if (sampleResult.rows.length > 0) {
          console.log('📋 Attendance records columns:', Object.keys(sampleResult.rows[0]));
        }
      }
    } catch (error) {
      console.log('⚠️ Attendance records table check failed:', error.message);
    }

    console.log('\n🎉 Connection test completed successfully!');
    console.log('📋 You have the following data to migrate:');
    console.log('   - Beneficiaries: Check above count');
    console.log('   - Trainings: Check above count'); 
    console.log('   - Beneficiary Trainings (Enrollments): Check above count');
    console.log('   - Attendance Records: Check above count');
    
  } catch (error) {
    console.error('❌ Error during connection test:', error);
    throw error;
  } finally {
    await prodPool.end();
    await newPool.end();
    await prisma.$disconnect();
  }
}

testConnection()
  .then(() => {
    console.log('Connection test script completed successfully');
  })
  .catch((error) => {
    console.error('Connection test script failed:', error);
  });