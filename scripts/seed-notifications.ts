import prisma from '../server/db';

async function seedNotifications() {
  console.log('🔔 Seeding sample notifications...');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true },
    });

    if (users.length === 0) {
      console.log('❌ No users found. Please seed users first.');
      return;
    }

    // Sample notifications for each user
    const notifications: any[] = [];

    for (const user of users) {
      if (user.role === 'BENEFICIARY') {
        // Beneficiary notifications
        notifications.push(
          {
            user_id: user.id,
            title: 'ការបណ្តុះបណ្តាលនឹងចាប់ផ្តើមឆាប់ៗ',
            message: 'វគ្គបណ្តុះបណ្តាលគណិតវិទ្យានឹងចាប់ផ្តើមក្នុងរយៈពេល ២ ម៉ោង',
            type: 'TRAINING',
            priority: 'HIGH',
          },
          {
            user_id: user.id,
            title: 'វិញ្ញាបនប័ត្រអាចប្រើបាន',
            message: 'វិញ្ញាបនប័ត្ររបស់អ្នកសម្រាប់គរុកោសល្យភាសាខ្មែររួចរាល់ហើយ',
            type: 'CERTIFICATE',
            priority: 'NORMAL',
          },
          {
            user_id: user.id,
            title: 'ការរំលឹកអំពីការចូលរួម',
            message: 'កុំភ្លេចចុះឈ្មោះចូលរួមសម្រាប់វគ្គថ្ងៃនេះ',
            type: 'ATTENDANCE',
            priority: 'NORMAL',
            is_read: true,
            read_at: new Date(),
          }
        );
      } else {
        // Admin notifications
        notifications.push(
          {
            user_id: user.id,
            title: 'New Training Enrollment',
            message: '5 new participants enrolled in Mathematics Training',
            type: 'TRAINING',
            priority: 'NORMAL',
          },
          {
            user_id: user.id,
            title: 'System Update',
            message: 'Database backup completed successfully',
            type: 'SYSTEM',
            priority: 'LOW',
            is_read: true,
            read_at: new Date(),
          },
          {
            user_id: user.id,
            title: 'Attendance Alert',
            message: 'Low attendance rate detected in Workshop ABC',
            type: 'WARNING',
            priority: 'HIGH',
          }
        );
      }
    }

    // Create all notifications
    const result = await prisma.notification.createMany({
      data: notifications,
    });

    console.log(`✅ Created ${result.count} notifications for ${users.length} users`);
    console.log('🎉 Notification seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedNotifications();
