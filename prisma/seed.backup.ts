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
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in correct order due to foreign keys)
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

  // Seed System Settings
  console.log('⚙️  Seeding system settings...');
  await prisma.systemSettings.createMany({
    data: [
      // General Settings
      {
        key: 'app_name',
        value: 'San Training Management System',
        type: 'STRING',
        category: 'general',
        label: 'Application Name',
        description: 'The name of the application displayed in the header',
        is_public: true,
      },
      {
        key: 'app_name_km',
        value: 'ប្រព័ន្ធគ្រប់គ្រងការបណ្តុះបណ្តាល',
        type: 'STRING',
        category: 'general',
        label: 'Application Name (Khmer)',
        description: 'Khmer name of the application',
        is_public: true,
      },
      // Localization Settings
      {
        key: 'default_language',
        value: 'km',
        type: 'SELECT',
        category: 'localization',
        label: 'Default Language',
        description: 'Default language for the application',
        options: ['en', 'km'],
        is_public: true,
      },
      {
        key: 'timezone',
        value: 'Asia/Phnom_Penh',
        type: 'STRING',
        category: 'localization',
        label: 'Timezone',
        description: 'Default timezone for the application',
        is_public: false,
      },
      {
        key: 'date_format',
        value: 'DD/MM/YYYY',
        type: 'SELECT',
        category: 'localization',
        label: 'Date Format',
        description: 'Default date format',
        options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
        is_public: true,
      },
      {
        key: 'time_format',
        value: '24h',
        type: 'SELECT',
        category: 'localization',
        label: 'Time Format',
        description: 'Default time format',
        options: ['12h', '24h'],
        is_public: true,
      },
      // Appearance Settings
      {
        key: 'default_font',
        value: 'Noto Sans Khmer',
        type: 'SELECT',
        category: 'appearance',
        label: 'Default Font',
        description: 'Default font for Khmer text',
        options: ['Noto Sans Khmer', 'Battambang', 'Dangrek', 'Khmer OS Battambang'],
        is_public: true,
      },
      {
        key: 'theme',
        value: 'light',
        type: 'SELECT',
        category: 'appearance',
        label: 'Theme',
        description: 'Default color theme',
        options: ['light', 'dark', 'auto'],
        is_public: true,
      },
      // Training Settings
      {
        key: 'default_geofence_radius',
        value: '100',
        type: 'NUMBER',
        category: 'training',
        label: 'Default Geofence Radius (meters)',
        description: 'Default geofence radius for attendance validation',
        is_public: false,
      },
      {
        key: 'attendance_sessions_per_day',
        value: '4',
        type: 'NUMBER',
        category: 'training',
        label: 'Attendance Sessions Per Day',
        description: 'Number of check-in/out sessions per day',
        is_public: false,
      },
      {
        key: 'enable_gps_validation',
        value: 'true',
        type: 'BOOLEAN',
        category: 'training',
        label: 'Enable GPS Validation',
        description: 'Require GPS validation for attendance',
        is_public: false,
      },
      {
        key: 'enable_qr_enrollment',
        value: 'true',
        type: 'BOOLEAN',
        category: 'training',
        label: 'Enable QR Code Enrollment',
        description: 'Allow enrollment via QR code scanning',
        is_public: false,
      },
    ],
  });

  // Seed Training Categories
  console.log('📚 Seeding training categories...');
  await prisma.trainingCategory.createMany({
    data: [
      {
        code: 'KHMER',
        name_en: 'Khmer Language',
        name_km: 'ភាសាខ្មែរ',
        description: 'Khmer language teaching and literacy programs',
        icon: 'BookOpen',
        color: '#3b82f6',
        sort_order: 1,
      },
      {
        code: 'MATH',
        name_en: 'Mathematics',
        name_km: 'គណិតវិទ្យា',
        description: 'Mathematics teaching methods and concepts',
        icon: 'Calculator',
        color: '#8b5cf6',
        sort_order: 2,
      },
      {
        code: 'IT',
        name_en: 'Information Technology',
        name_km: 'ព័ត៌មានវិទ្យា',
        description: 'Computer literacy and technology integration',
        icon: 'Monitor',
        color: '#06b6d4',
        sort_order: 3,
      },
      {
        code: 'PEDAGOGY',
        name_en: 'Teaching Methods',
        name_km: 'វិធីសាស្រ្តបង្រៀន',
        description: 'Modern teaching methodologies and classroom management',
        icon: 'GraduationCap',
        color: '#10b981',
        sort_order: 4,
      },
      {
        code: 'LEADERSHIP',
        name_en: 'Leadership',
        name_km: 'ភាពជាអ្នកដឹកនាំ',
        description: 'Leadership and management skills for educators',
        icon: 'Users',
        color: '#f59e0b',
        sort_order: 5,
      },
    ],
  });

  // Seed Training Types
  console.log('🎓 Seeding training types...');
  await prisma.trainingTypeConfig.createMany({
    data: [
      {
        code: 'WORKSHOP',
        name_en: 'Workshop',
        name_km: 'សិក្ខាសាលា',
        description: 'Interactive, hands-on training sessions',
        icon: 'Wrench',
        color: '#3b82f6',
        sort_order: 1,
      },
      {
        code: 'COURSE',
        name_en: 'Course',
        name_km: 'វគ្គសិក្សា',
        description: 'Structured, comprehensive training programs',
        icon: 'BookOpen',
        color: '#8b5cf6',
        sort_order: 2,
      },
      {
        code: 'SEMINAR',
        name_en: 'Seminar',
        name_km: 'សិក្ខាសាលាពិគ្រោះយោបល់',
        description: 'Informational sessions and discussions',
        icon: 'Presentation',
        color: '#10b981',
        sort_order: 3,
      },
    ],
  });

  // Seed Training Levels
  console.log('📊 Seeding training levels...');
  await prisma.trainingLevelConfig.createMany({
    data: [
      {
        code: 'NATIONAL',
        name_en: 'National Level',
        name_km: 'កម្រិតជាតិ',
        description_en: 'Training conducted at national level',
        description_km: 'ការបណ្តុះបណ្តាលកម្រិតជាតិ',
        icon: 'Flag',
        color: '#ef4444',
        sort_order: 1,
      },
      {
        code: 'PROVINCIAL',
        name_en: 'Provincial Level',
        name_km: 'កម្រិតខេត្ត',
        description_en: 'Training conducted at provincial level',
        description_km: 'ការបណ្តុះបណ្តាលកម្រិតខេត្ត',
        icon: 'MapPin',
        color: '#f59e0b',
        sort_order: 2,
      },
      {
        code: 'CLUSTER',
        name_en: 'Cluster Level',
        name_km: 'កម្រិតកម្រង',
        description_en: 'Training distributed across multiple schools in a cluster',
        description_km: 'ការបណ្តុះបណ្តាលចែកចាយក្នុងសាលារៀនច្រើន',
        icon: 'Network',
        color: '#3b82f6',
        sort_order: 3,
      },
    ],
  });

  // Seed Users (Authentication)
  console.log('👥 Seeding users...');
  await prisma.user.createMany({
    data: [
      {
        id: 'admin-001',
        username: 'admin',
        email: 'admin@moeys.gov.kh',
        password: 'admin123', // In production, hash this!
        role: 'ADMIN',
        name: 'System Administrator',
        phone: '012345678',
        profile_image_url: '',
      },
      {
        id: 'superadmin-001',
        username: 'superadmin',
        email: 'superadmin@moeys.gov.kh',
        password: 'super123', // In production, hash this!
        role: 'SUPER_ADMIN',
        name: 'Super Administrator',
        phone: '012987654',
        profile_image_url: '',
      },
      {
        id: 'teacher-001',
        username: 'teacher001',
        email: 'sok.sovannak@moeys.gov.kh',
        password: 'teacher123', // In production, hash this!
        role: 'BENEFICIARY',
        name: 'សុខ សុវណ្ណា',
        phone: '012345678',
        teacher_id: 'T001',
        school: 'Phnom Penh Primary School',
        school_id: 'SCH-001',
        province_name: 'Phnom Penh',
        profile_image_url: '',
      },
    ],
  });

  // Seed Beneficiaries (Teachers)
  console.log('👨‍🏫 Seeding beneficiaries...');
  await prisma.beneficiary.createMany({
    data: [
      {
        teacher_id: 'T001',
        name: 'សុខ សុវណ្ណា',
        name_english: 'Sok Sovannak',
        phone: '012345678',
        sex: 'M',
        province_name: 'Phnom Penh',
        district_name: 'Chamkar Mon',
        commune_name: 'Tuol Svay Prey',
        village_name: 'Tuol Svay Prey 1',
        school: 'Phnom Penh Primary School',
        school_id: 'SCH-001',
        position: 'Primary Teacher',
        subject: 'Mathematics',
        grade: 3,
        status: 'ACTIVE',
        profile_completed: true,
      },
      {
        teacher_id: 'T002',
        name: 'ចន្ទ្រា មករា',
        name_english: 'Chantha Makara',
        phone: '012987654',
        sex: 'F',
        province_name: 'Kandal',
        district_name: 'Kandal Stueng',
        commune_name: 'Preaek Aeng',
        village_name: 'Preaek Aeng 1',
        school: 'Kandal Primary School',
        school_id: 'SCH-002',
        position: 'Primary Teacher',
        subject: 'Khmer Language',
        grade: 2,
        status: 'ACTIVE',
        profile_completed: true,
      },
      {
        teacher_id: 'T003',
        name: 'វិរៈ សុខា',
        name_english: 'Virak Sokha',
        phone: '012234567',
        sex: 'M',
        province_name: 'Siem Reap',
        district_name: 'Siem Reap',
        commune_name: 'Sala Kamraeuk',
        village_name: 'Sala Kamraeuk 2',
        school: 'Angkor Primary School',
        school_id: 'SCH-003',
        position: 'Vice Principal',
        subject: 'Science',
        grade: 5,
        status: 'ACTIVE',
        profile_completed: true,
      },
    ],
  });

  // Seed Trainings
  console.log('📚 Seeding trainings...');
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.training.createMany({
    data: [
      {
        id: 'TRN-001',
        training_code: 'MATH-2024-001',
        training_name: 'ការបណ្តុះបណ្តាលគណិតវិទ្យាកម្រិតបឋមសិក្សា',
        training_name_english: 'Primary Mathematics Teaching Methods',
        training_description: 'Comprehensive training on modern mathematics teaching methods for primary school teachers',
        training_type: 'WORKSHOP',
        training_category: 'MATH',
        training_level: 'PROVINCIAL',
        training_status: 'ONGOING',
        training_start_date: now,
        training_end_date: nextWeek,
        registration_deadline: tomorrow,
        training_location: 'Phnom Penh Teacher Training Center',
        training_venue: 'Room 101, Building A',
        venue_latitude: 11.5564,
        venue_longitude: 104.9282,
        geofence_radius: 100,
        province_name: 'Phnom Penh',
        district_name: 'Chamkar Mon',
        max_participants: 50,
        current_participants: 3,
        gps_validation_required: true,
        geofence_validation_required: true,
        is_published: true,
      },
      {
        id: 'TRN-002',
        training_code: 'KHMER-2024-002',
        training_name: 'ការបណ្តុះបណ្តាលភាសាខ្មែរ',
        training_name_english: 'Khmer Language Teaching Skills',
        training_description: 'Advanced training for Khmer language instruction',
        training_type: 'COURSE',
        training_category: 'KHMER',
        training_level: 'NATIONAL',
        training_status: 'DRAFT',
        training_start_date: nextMonth,
        training_end_date: new Date(nextMonth.getTime() + 14 * 24 * 60 * 60 * 1000),
        registration_deadline: nextWeek,
        training_location: 'National Institute of Education',
        training_venue: 'Main Hall',
        venue_latitude: 11.5449,
        venue_longitude: 104.8922,
        geofence_radius: 150,
        province_name: 'Phnom Penh',
        max_participants: 100,
        current_participants: 0,
        gps_validation_required: true,
        geofence_validation_required: true,
        is_published: false,
      },
    ],
  });

  // Seed Beneficiary Trainings (Enrollments)
  console.log('📝 Seeding enrollments...');
  await prisma.beneficiaryTraining.createMany({
    data: [
      {
        beneficiary_training_id: 'BT-001',
        beneficiary_id: 'T001',
        training_id: 'TRN-001',
        registration_date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        registration_method: 'QR',
        attendance_status: 'ATTENDED',
        attendance_percentage: 85.5,
        training_role: 'PARTICIPANT',
        enrollment_type: 'REGULAR',
        certificate_issued: false,
        feedback_submitted: false,
        beneficiary_training_status: 'ACTIVE',
      },
      {
        beneficiary_training_id: 'BT-002',
        beneficiary_id: 'T002',
        training_id: 'TRN-001',
        registration_date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        registration_method: 'MANUAL',
        attendance_status: 'ATTENDED',
        attendance_percentage: 92.0,
        training_role: 'PARTICIPANT',
        enrollment_type: 'REGULAR',
        certificate_issued: false,
        feedback_submitted: false,
        beneficiary_training_status: 'ACTIVE',
      },
      {
        beneficiary_training_id: 'BT-003',
        beneficiary_id: 'T003',
        training_id: 'TRN-001',
        registration_date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        registration_method: 'QR',
        attendance_status: 'ATTENDED',
        attendance_percentage: 78.0,
        training_role: 'PARTICIPANT',
        enrollment_type: 'REGULAR',
        certificate_issued: false,
        feedback_submitted: false,
        beneficiary_training_status: 'ACTIVE',
      },
    ],
  });

  // Seed Attendance Records
  console.log('✅ Seeding attendance records...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  await prisma.attendanceRecord.createMany({
    data: [
      // Today's attendance for T001
      {
        training_id: 'TRN-001',
        beneficiary_id: 'T001',
        date: today,
        morning_in: new Date(today.getTime() + 8 * 60 * 60 * 1000), // 8:00 AM
        morning_out: new Date(today.getTime() + 12 * 60 * 60 * 1000), // 12:00 PM
        afternoon_in: new Date(today.getTime() + 13 * 60 * 60 * 1000), // 1:00 PM
        session_attendance_status: 'PRESENT',
        location_lat: 11.5564,
        location_lng: 104.9282,
        location_accuracy: 10.5,
        device: 'Mobile Chrome',
      },
      // Yesterday's attendance for T001
      {
        training_id: 'TRN-001',
        beneficiary_id: 'T001',
        date: yesterday,
        morning_in: new Date(yesterday.getTime() + 8 * 60 * 60 * 1000),
        morning_out: new Date(yesterday.getTime() + 12 * 60 * 60 * 1000),
        afternoon_in: new Date(yesterday.getTime() + 13 * 60 * 60 * 1000),
        afternoon_out: new Date(yesterday.getTime() + 17 * 60 * 60 * 1000),
        session_attendance_status: 'PRESENT',
        location_lat: 11.5564,
        location_lng: 104.9282,
        location_accuracy: 8.2,
        device: 'Mobile Chrome',
      },
      // Today's attendance for T002
      {
        training_id: 'TRN-001',
        beneficiary_id: 'T002',
        date: today,
        morning_in: new Date(today.getTime() + 8.1 * 60 * 60 * 1000), // 8:06 AM (late)
        morning_out: new Date(today.getTime() + 12 * 60 * 60 * 1000),
        afternoon_in: new Date(today.getTime() + 13 * 60 * 60 * 1000),
        session_attendance_status: 'LATE',
        location_lat: 11.5565,
        location_lng: 104.9283,
        location_accuracy: 12.0,
        device: 'Mobile Safari',
      },
    ],
  });

  console.log('✨ Seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log('  - 12 system settings created');
  console.log('  - 5 training categories created (Khmer, Math, IT, Pedagogy, Leadership)');
  console.log('  - 3 training types created (Workshop, Course, Seminar)');
  console.log('  - 3 training levels created (National, Provincial, Cluster)');
  console.log('  - 3 users created (admin, superadmin, teacher001)');
  console.log('  - 3 beneficiaries created');
  console.log('  - 2 trainings created');
  console.log('  - 3 enrollments created');
  console.log('  - 3 attendance records created');
  console.log('');
  console.log('🔐 Demo Login Credentials:');
  console.log('  Admin: admin / admin123');
  console.log('  Super Admin: superadmin / super123');
  console.log('  Teacher: teacher001 / teacher123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
