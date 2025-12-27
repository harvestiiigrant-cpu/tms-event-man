import express from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/notifications - Get user's notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { limit = 50, unreadOnly = 'false' } = req.query;

    const where: any = {
      user_id: userId,
      is_deleted: false,
    };

    if (unreadOnly === 'true') {
      where.is_read = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { created_at: 'desc' }
      ],
      take: Number(limit),
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/unread-count - Get unread count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const count = await prisma.notification.count({
      where: {
        user_id: userId,
        is_read: false,
        is_deleted: false,
      },
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// POST /api/notifications - Create notification (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      user_id,
      title,
      message,
      type,
      priority,
      related_entity_type,
      related_entity_id,
      action_url,
    } = req.body;

    const notification = await prisma.notification.create({
      data: {
        user_id,
        title,
        message,
        type: type || 'INFO',
        priority: priority || 'NORMAL',
        related_entity_type,
        related_entity_id,
        action_url,
      },
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// PUT /api/notifications/:id/read - Mark as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: {
        id,
        user_id: userId,
      },
      data: {
        is_read: true,
        read_at: new Date(),
        updated_at: new Date(),
      },
    });

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// PUT /api/notifications/mark-all-read - Mark all as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const result = await prisma.notification.updateMany({
      where: {
        user_id: userId,
        is_read: false,
        is_deleted: false,
      },
      data: {
        is_read: true,
        read_at: new Date(),
        updated_at: new Date(),
      },
    });

    res.json({ count: result.count });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: {
        id,
        user_id: userId,
      },
      data: {
        is_deleted: true,
        updated_at: new Date(),
      },
    });

    res.json(notification);
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// DELETE /api/notifications - Clear all notifications
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const result = await prisma.notification.updateMany({
      where: {
        user_id: userId,
        is_deleted: false,
      },
      data: {
        is_deleted: true,
        updated_at: new Date(),
      },
    });

    res.json({ count: result.count });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

export default router;
