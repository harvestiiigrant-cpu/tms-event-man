import express from 'express';
import prisma from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// GET /api/event-sessions/event/:eventId - Get all sessions for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const sessions = await prisma.eventSession.findMany({
      where: {
        event_id: req.params.eventId,
        is_deleted: false,
      },
      include: {
        speakers: {
          include: {
            speaker: true,
          },
        },
        _count: {
          select: {
            session_registrations: true,
          },
        },
      },
      orderBy: [
        { session_date: 'asc' },
        { session_start_time: 'asc' },
        { sort_order: 'asc' },
      ],
    });
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET /api/event-sessions/:id - Get single session
router.get('/:id', async (req, res) => {
  try {
    const session = await prisma.eventSession.findUnique({
      where: { id: req.params.id },
      include: {
        event: true,
        speakers: {
          include: {
            speaker: true,
          },
        },
        session_registrations: {
          include: {
            registration: {
              include: {
                beneficiary: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// POST /api/event-sessions - Create new session
router.post('/', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const session = await prisma.eventSession.create({
      data: {
        ...req.body,
        session_date: new Date(req.body.session_date),
        session_start_time: new Date(req.body.session_start_time),
        session_end_time: new Date(req.body.session_end_time),
      },
    });
    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// PUT /api/event-sessions/:id - Update session
router.put('/:id', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const session = await prisma.eventSession.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        session_date: req.body.session_date ? new Date(req.body.session_date) : undefined,
        session_start_time: req.body.session_start_time ? new Date(req.body.session_start_time) : undefined,
        session_end_time: req.body.session_end_time ? new Date(req.body.session_end_time) : undefined,
        updated_at: new Date(),
      },
    });
    res.json(session);
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// DELETE /api/event-sessions/:id - Soft delete session
router.delete('/:id', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const session = await prisma.eventSession.update({
      where: { id: req.params.id },
      data: {
        is_deleted: true,
        updated_at: new Date(),
      },
    });
    res.json(session);
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// POST /api/event-sessions/:id/speakers - Add speaker to session
router.post('/:id/speakers', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { speaker_id, role } = req.body;

    const link = await prisma.eventSessionSpeaker.create({
      data: {
        session_id: req.params.id,
        speaker_id,
        role,
      },
      include: {
        speaker: true,
      },
    });

    res.status(201).json(link);
  } catch (error) {
    console.error('Error adding speaker to session:', error);
    res.status(500).json({ error: 'Failed to add speaker to session' });
  }
});

// DELETE /api/event-sessions/:id/speakers/:speakerId - Remove speaker from session
router.delete('/:id/speakers/:speakerId', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    await prisma.eventSessionSpeaker.deleteMany({
      where: {
        session_id: req.params.id,
        speaker_id: req.params.speakerId,
      },
    });

    res.json({ message: 'Speaker removed from session' });
  } catch (error) {
    console.error('Error removing speaker from session:', error);
    res.status(500).json({ error: 'Failed to remove speaker from session' });
  }
});

// POST /api/event-sessions/bulk - Bulk create sessions
router.post('/bulk', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { sessions } = req.body;

    if (!Array.isArray(sessions) || sessions.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty sessions array' });
    }

    const createdSessions = await prisma.$transaction(
      sessions.map((session: any) =>
        prisma.eventSession.create({
          data: {
            ...session,
            session_date: new Date(session.session_date),
            session_start_time: new Date(session.session_start_time),
            session_end_time: new Date(session.session_end_time),
          },
        })
      )
    );

    res.status(201).json(createdSessions);
  } catch (error) {
    console.error('Error bulk creating sessions:', error);
    res.status(500).json({ error: 'Failed to bulk create sessions' });
  }
});

export default router;
