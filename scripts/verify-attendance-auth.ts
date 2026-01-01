import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function verifyAttendanceAndAuth() {
  console.log('🔍 Verifying attendance records and authentication methods...');
  console.log('');

  try {
    // Check attendance records
    const attendanceResult = await pool.query('SELECT COUNT(*) as count FROM attendance_records');
    console.log(`📊 Total attendance records: ${attendanceResult.rows[0].count}`);

    if (attendanceResult.rows[0].count > 0) {
      const sampleAttendance = await pool.query('SELECT * FROM attendance_records LIMIT 5');
      console.log('📋 Sample attendance records:');
      sampleAttendance.rows.forEach((row: any, i: number) => {
        console.log(`  ${i+1}. Training: ${row.training_id}, Beneficiary: ${row.beneficiary_id}, Date: ${row.date}, Status: ${row.session_attendance_status}`);
      });
    }

    console.log('');

    // Check beneficiaries and their phone numbers
    const beneficiaryResult = await pool.query('SELECT COUNT(*) as count FROM beneficiaries');
    console.log(`👥 Total beneficiaries: ${beneficiaryResult.rows[0].count}`);

    if (beneficiaryResult.rows[0].count > 0) {
      const sampleBeneficiaries = await pool.query('SELECT teacher_id, phone, name FROM beneficiaries WHERE phone IS NOT NULL LIMIT 5');
      console.log('📋 Sample beneficiaries with phone numbers:');
      sampleBeneficiaries.rows.forEach((row: any, i: number) => {
        console.log(`  ${i+1}. ID: ${row.teacher_id}, Name: ${row.name}, Phone: ${row.phone}`);
      });
    }

    console.log('');

    // Check if there are beneficiaries with passcodes (for authentication)
    const passcodeResult = await pool.query('SELECT COUNT(*) as count FROM beneficiaries WHERE passcode IS NOT NULL AND passcode != \'\'');
    console.log(`🔑 Beneficiaries with passcodes: ${passcodeResult.rows[0].count}`);

    if (passcodeResult.rows[0].count > 0) {
      const samplePasscodes = await pool.query('SELECT teacher_id, phone, passcode, name FROM beneficiaries WHERE passcode IS NOT NULL AND passcode != \'\' LIMIT 5');
      console.log('📋 Sample beneficiaries with passcodes:');
      samplePasscodes.rows.forEach((row: any, i: number) => {
        console.log(`  ${i+1}. ID: ${row.teacher_id}, Name: ${row.name}, Phone: ${row.phone}, Passcode: ${row.passcode}`);
      });
    }

    console.log('');
    console.log('✅ Verification completed successfully');

  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

verifyAttendanceAndAuth()
  .then(() => {
    console.log('Verification script completed');
  })
  .catch((error) => {
    console.error('Verification script failed:', error);
  });