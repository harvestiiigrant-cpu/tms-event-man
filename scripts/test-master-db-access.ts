import 'dotenv/config';
import pg from 'pg';

// Master database connection with potential timeout adjustments
const masterConnectionString = 'postgresql://admin_moeys:testing-123@192.168.155.122:5432/ped_training_app';

async function testMasterDBAccess() {
  console.log('🔍 Testing master database access with extended timeout...');

  const config = {
    connectionString: masterConnectionString,
    connectionTimeoutMillis: 10000, // 10 seconds timeout
    idleTimeoutMillis: 10000,
    max: 1 // Only one connection
  };

  const masterPool = new pg.Pool(config);

  try {
    // Test the connection with a simple query
    console.log('📡 Attempting to connect to master database...');
    const result = await masterPool.query('SELECT version();');
    console.log('✅ Successfully connected to master database!');
    console.log('📋 Version:', result.rows[0].version);

    // Check if the database has the same structure as the production database
    console.log('\n📊 Checking for key tables in master database...');
    
    const tablesToCheck = ['beneficiaries', 'trainings', 'beneficiary_trainings', 'attendance_records'];
    
    for (const table of tablesToCheck) {
      try {
        const existsResult = await masterPool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          ) as exists;
        `, [table]);
        
        if (existsResult.rows[0].exists) {
          const countResult = await masterPool.query(`SELECT COUNT(*) FROM ${table};`);
          console.log(`   📊 ${table}: ${countResult.rows[0].count} records`);
        } else {
          console.log(`   ❌ ${table}: Table does not exist`);
        }
      } catch (err) {
        console.log(`   ⚠️ ${table}: Error checking - ${err.message}`);
      }
    }

    // If we can connect, let's get a count of all tables
    console.log('\n📋 All tables in master database:');
    const allTablesResult = await masterPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    const allTableNames = allTablesResult.rows.map((row: any) => row.table_name);
    console.log(`   Total tables: ${allTableNames.length}`);
    console.log(`   Tables: ${allTableNames.join(', ')}`);

    return true;
  } catch (error) {
    console.error('❌ Connection to master database failed:', error.message);
    
    // Check if it's a timeout or network issue
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
      console.log('\n⚠️ Network connectivity issue detected:');
      console.log(`   - Host: 192.168.155.122`);
      console.log(`   - Port: 5432`);
      console.log(`   - Database: ped_training_app`);
      console.log(`   - This may require VPN or network access configuration`);
    }
    
    return false;
  } finally {
    await masterPool.end();
  }
}

// Run the test
testMasterDBAccess()
  .then((success) => {
    if (success) {
      console.log('\n🎉 Master database is accessible!');
      console.log('The database consolidation can proceed.');
    } else {
      console.log('\n❌ Master database is not accessible.');
      console.log('Please check your network connection to 192.168.155.122');
    }
  })
  .catch((error) => {
    console.error('Script failed:', error);
  });