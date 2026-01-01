import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function checkCurrentData() {
  console.log('📊 Checking current data in new platform...');
  
  try {
    const beneficiaries = await prisma.beneficiary.count();
    const trainings = await prisma.training.count();
    const enrollments = await prisma.beneficiaryTraining.count();
    const attendance = await prisma.attendanceRecord.count();
    
    console.log(`   Beneficiaries: ${beneficiaries}`);
    console.log(`   Trainings: ${trainings}`);
    console.log(`   Enrollments: ${enrollments}`);
    console.log(`   Attendance: ${attendance}`);
    
    return { beneficiaries, trainings, enrollments, attendance };
  } catch (error) {
    console.error('Error checking current data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentData()
  .then(data => {
    console.log('✅ Data check completed successfully');
  })
  .catch(error => {
    console.error('❌ Data check failed:', error);
  });