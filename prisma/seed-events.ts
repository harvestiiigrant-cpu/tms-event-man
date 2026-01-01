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
});

async function seedEvents() {
  console.log('🎉 Starting events seed...');

  try {
    // Clear existing events
    console.log('🗑️  Clearing existing events...');
    await prisma.eventSessionRegistration.deleteMany();
    await prisma.eventSessionSpeaker.deleteMany();
    await prisma.eventSession.deleteMany();
    await prisma.eventAttendanceRecord.deleteMany();
    await prisma.eventRegistration.deleteMany();
    await prisma.eventSpeaker.deleteMany();
    await prisma.eventMaterialLink.deleteMany();
    await prisma.event.deleteMany();

    console.log('📅 Seeding 7 events...');

    const events = await prisma.event.createMany({
      data: [
        {
          event_code: 'EVT-2025-001',
          event_name: 'សម្មេលច្បាប់ប្រឆាំងនឹងអាក្រក់ក្នុងថ្នាក់រៀន',
          event_name_english: 'National Education Reform Symposium',
          event_description: 'ការសម្មេលដ៏ធំមួយដែលឧទ្ទិស ដល់ការលើកកម្ពស់គុណភាពអប់រំនៅក្នុងប្រទេសកម្ពុជា',
          event_type: 'CONFERENCE',
          event_category: 'Education',
          event_format: 'IN_PERSON',
          event_status: 'UPCOMING',
          event_start_date: new Date('2025-01-15T08:00:00'),
          event_end_date: new Date('2025-01-17T17:00:00'),
          registration_deadline: new Date('2025-01-10T23:59:59'),
          registration_start: new Date('2024-12-20T00:00:00'),
          event_location: 'មជ្ឈមណ្ឌលសន្និសីទដ៏ធំ',
          event_venue: 'Phnom Penh Convention Center',
          venue_latitude: 11.5564,
          venue_longitude: 104.9282,
          geofence_radius: 200,
          province_name: 'Phnom Penh',
          max_attendees: 500,
          allow_public_registration: true,
          is_published: true,
          tags: ['education', 'reform', 'conference'],
          created_by: 'admin',
        },
        {
          event_code: 'EVT-2025-002',
          event_name: 'ការងារស៊ីមីណារ៍ស្របពេលលើការបង្រៀន',
          event_name_english: 'Digital Teaching Methods Workshop',
          event_description: 'ការងារស៊ីមីណារ៍ស៉ូលុយស៊ីយ៍ដែលរៀបរៀងឡើងដើម្បីបង្រៀនគ្រូរៀងរាល់ថ្ងៃ',
          event_type: 'WORKSHOP',
          event_category: 'Training',
          event_format: 'HYBRID',
          event_status: 'UPCOMING',
          event_start_date: new Date('2025-01-20T09:00:00'),
          event_end_date: new Date('2025-01-22T16:00:00'),
          registration_deadline: new Date('2025-01-15T23:59:59'),
          registration_start: new Date('2024-12-25T00:00:00'),
          event_location: 'រាជធានីភ្នំពេញ',
          event_venue: 'Ministry of Education Building',
          venue_latitude: 11.5679,
          venue_longitude: 104.9282,
          virtual_platform: 'Zoom',
          virtual_meeting_url: 'https://zoom.us/j/workshop2025',
          max_attendees: 300,
          allow_public_registration: true,
          is_published: true,
          tags: ['workshop', 'teaching', 'digital'],
          created_by: 'admin',
        },
        {
          event_code: 'EVT-2025-003',
          event_name: 'ដំណើរស្វាគមន៍ស៊ីមីណារ៍ឧស្សាហ៍កម្ម',
          event_name_english: 'Industry Networking Seminar',
          event_description: 'ឱកាសដ៏ល្អឥតខ្ចោះដែលឲ្យប្រឹក្សដ្ឋាននិងមន្ត្រីក្រសួងអប់រំបង្កើតទំនាក់ទំនង',
          event_type: 'SEMINAR',
          event_category: 'Networking',
          event_format: 'IN_PERSON',
          event_status: 'UPCOMING',
          event_start_date: new Date('2025-02-01T10:00:00'),
          event_end_date: new Date('2025-02-01T18:00:00'),
          registration_deadline: new Date('2025-01-25T23:59:59'),
          registration_start: new Date('2025-01-01T00:00:00'),
          event_location: 'សាលនិងមជ្ឈមណ្ឌល',
          event_venue: 'Royal Palace Gardens',
          venue_latitude: 11.5539,
          venue_longitude: 104.9282,
          max_attendees: 250,
          allow_public_registration: true,
          is_published: true,
          tags: ['networking', 'industry', 'seminar'],
          created_by: 'admin',
        },
        {
          event_code: 'EVT-2025-004',
          event_name: 'ប្រឹក្សាយោបល់ការងារលើការឧស្សាហ៍ក្នុងបរិស្ថាន',
          event_name_english: 'Environmental Sustainability Workshop',
          event_description: 'ការងារស៊ីមីណារ៍មួយដែលឧទ្ទិស ដល់ការរក្សាសិទ្ធិបរិស្ថាននៅក្នុងសាលាផ្សារ',
          event_type: 'WORKSHOP',
          event_category: 'Sustainability',
          event_format: 'HYBRID',
          event_status: 'UPCOMING',
          event_start_date: new Date('2025-02-10T08:30:00'),
          event_end_date: new Date('2025-02-12T16:30:00'),
          registration_deadline: new Date('2025-02-05T23:59:59'),
          registration_start: new Date('2025-01-10T00:00:00'),
          event_location: 'ភូមិសាលនៃសាលារាជ',
          event_venue: 'National Training Center',
          venue_latitude: 11.5500,
          venue_longitude: 104.9300,
          virtual_platform: 'Google Meet',
          virtual_meeting_url: 'https://meet.google.com/sustainability2025',
          max_attendees: 400,
          allow_public_registration: true,
          is_published: true,
          tags: ['environment', 'sustainability', 'workshop'],
          created_by: 'admin',
        },
        {
          event_code: 'EVT-2025-005',
          event_name: 'គម្រូបង្រៀនលើការស្វាគមន៍កូនសិស្ស',
          event_name_english: 'Student Welcome & Orientation Program',
          event_description: 'ព្រឹត្តិការណ៍ស៊ីមីណារ៍ដែលរៀបរៀងឡើងដើម្បីស្វាគមន៍កូនសិស្សថ្មីទៅក្នុងឪូបិលកម្ម',
          event_type: 'CEREMONY',
          event_category: 'Academic',
          event_format: 'IN_PERSON',
          event_status: 'UPCOMING',
          event_start_date: new Date('2025-03-01T07:00:00'),
          event_end_date: new Date('2025-03-01T12:00:00'),
          registration_deadline: new Date('2025-02-20T23:59:59'),
          registration_start: new Date('2025-02-01T00:00:00'),
          event_location: 'សាលរៀនរាជា',
          event_venue: 'School Main Hall',
          venue_latitude: 11.5600,
          venue_longitude: 104.9250,
          geofence_radius: 150,
          max_attendees: 600,
          allow_public_registration: false,
          is_published: true,
          tags: ['orientation', 'ceremony', 'welcome'],
          created_by: 'admin',
        },
        {
          event_code: 'EVT-2025-006',
          event_name: 'វេបីណារ៍ការពារសុខភាពផ្លូវចិត្ត',
          event_name_english: 'Mental Health Awareness Webinar',
          event_description: 'ព្រឹត្តិការណ៍អនឡាញដែលឧទ្ទិស ដល់ការលើកកម្ពស់ការយល់ដឹងអំពីសុខភាពផ្លូវចិត្ត',
          event_type: 'WEBINAR',
          event_category: 'Health',
          event_format: 'VIRTUAL',
          event_status: 'UPCOMING',
          event_start_date: new Date('2025-03-10T14:00:00'),
          event_end_date: new Date('2025-03-10T16:00:00'),
          registration_deadline: new Date('2025-03-08T23:59:59'),
          registration_start: new Date('2025-02-15T00:00:00'),
          virtual_platform: 'Zoom',
          virtual_meeting_url: 'https://zoom.us/j/mentalhealth2025',
          virtual_meeting_id: 'mentalhealth2025',
          max_attendees: 1000,
          allow_public_registration: true,
          is_published: true,
          tags: ['webinar', 'health', 'mental-wellness'],
          created_by: 'admin',
        },
        {
          event_code: 'EVT-2025-007',
          event_name: 'ការប្រឹក្សាធ្វើឡើងលើបច្ចេកវិទ្យាក្នុងអប់រំ',
          event_name_english: 'EdTech Innovation Forum',
          event_description: 'ឱកាសដែលឲ្យប្រឹក្សដ្ឋាននិងស្ថាប័នប្រឹក្សាស្វាគមន៍និងការលើកកម្ពស់បច្ចេកវិទ្យា',
          event_type: 'CONFERENCE',
          event_category: 'Technology',
          event_format: 'HYBRID',
          event_status: 'UPCOMING',
          event_start_date: new Date('2025-03-15T09:00:00'),
          event_end_date: new Date('2025-03-17T17:00:00'),
          registration_deadline: new Date('2025-03-10T23:59:59'),
          registration_start: new Date('2025-02-20T00:00:00'),
          event_location: 'ផ្ទាំងបង្ហាញបច្ចេកវិទ្យា',
          event_venue: 'Tech Innovation Hub',
          venue_latitude: 11.5450,
          venue_longitude: 104.9350,
          virtual_platform: 'Teams',
          virtual_meeting_url: 'https://teams.microsoft.com/edtech2025',
          max_attendees: 450,
          allow_public_registration: true,
          is_published: true,
          tags: ['technology', 'innovation', 'edtech', 'conference'],
          created_by: 'admin',
        },
      ],
    });

    console.log(`✅ ${events.count} events created successfully!`);

    console.log('\n📊 Events Summary:');
    console.log('  - 1 Conference (National Education Reform Symposium)');
    console.log('  - 2 Workshops (Digital Teaching & Environmental Sustainability)');
    console.log('  - 1 Seminar (Industry Networking)');
    console.log('  - 1 Ceremony (Student Welcome)');
    console.log('  - 1 Webinar (Mental Health Awareness)');
    console.log('  - 1 Conference (EdTech Innovation Forum)');
    console.log('\n✨ All events are set to UPCOMING status and PUBLISHED');
    console.log('✨ All events have registration enabled');

    await pool.end();
  } catch (error) {
    console.error('❌ Error seeding events:', error);
    await pool.end();
    process.exit(1);
  }
}

seedEvents();
