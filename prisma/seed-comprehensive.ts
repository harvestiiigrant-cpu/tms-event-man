import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new pg.Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['warn', 'error'],
});

async function main() {
  console.log('🌱 Starting comprehensive database seed...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.attendanceRecord.deleteMany();
  await prisma.beneficiaryTraining.deleteMany();
  await prisma.training.deleteMany();
  await prisma.beneficiary.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSettings.deleteMany();
  await prisma.trainingCategory.deleteMany();
  await prisma.trainingTypeConfig.deleteMany();
  await prisma.trainingLevelConfig.deleteMany();
  
  console.log('✅ Data cleared\n');

  //SEED_EOF
