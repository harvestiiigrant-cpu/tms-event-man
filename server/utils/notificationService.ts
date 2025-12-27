import prisma from '../db';

export interface CreateNotificationData {
  user_id: string;
  title: string;
  message: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'TRAINING' | 'EVENT' | 'SURVEY' | 'ATTENDANCE' | 'CERTIFICATE' | 'SYSTEM';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  related_entity_type?: string;
  related_entity_id?: string;
  action_url?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(data: CreateNotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        user_id: data.user_id,
        title: data.title,
        message: data.message,
        type: data.type || 'INFO',
        priority: data.priority || 'NORMAL',
        related_entity_type: data.related_entity_type,
        related_entity_id: data.related_entity_id,
        action_url: data.action_url,
      },
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(users: string[], data: Omit<CreateNotificationData, 'user_id'>) {
  try {
    const notifications = await prisma.notification.createMany({
      data: users.map(user_id => ({
        user_id,
        title: data.title,
        message: data.message,
        type: data.type || 'INFO',
        priority: data.priority || 'NORMAL',
        related_entity_type: data.related_entity_type,
        related_entity_id: data.related_entity_id,
        action_url: data.action_url,
      })),
    });
    return notifications;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
}

/**
 * Get user by username (for creating notifications)
 */
export async function getUserIdByUsername(username: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    return user?.id || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Notify all admins
 */
export async function notifyAllAdmins(data: Omit<CreateNotificationData, 'user_id'>) {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN'],
        },
      },
      select: { id: true },
    });

    const adminIds = admins.map(admin => admin.id);
    return createBulkNotifications(adminIds, data);
  } catch (error) {
    console.error('Error notifying admins:', error);
    throw error;
  }
}
