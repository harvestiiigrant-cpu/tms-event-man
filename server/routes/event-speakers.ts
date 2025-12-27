import express from 'express';
import prisma from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// GET /api/event-speakers/event/:eventId - Get all speakers for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const speakers = await prisma.eventSpeaker.findMany({
      where: {
        event_id: req.params.eventId,
        is_deleted: false,
      },
      include: {
        sessions: {
          include: {
            session: {
              select: {
                id: true,
                session_name: true,
                session_name_english: true,
                session_date: true,
                session_start_time: true,
                session_end_time: true,
              },
            },
          },
        },
      },
      orderBy: [
        { is_keynote_speaker: 'desc' },
        { is_featured: 'desc' },
        { sort_order: 'asc' },
      ],
    });
    res.json(speakers);
  } catch (error) {
    console.error('Error fetching speakers:', error);
    res.status(500).json({ error: 'Failed to fetch speakers' });
  }
});

// GET /api/event-speakers/:id - Get single speaker
router.get('/:id', async (req, res) => {
  try {
    const speaker = await prisma.eventSpeaker.findUnique({
      where: { id: req.params.id },
      include: {
        event: true,
        sessions: {
          include: {
            session: true,
          },
        },
      },
    });

    if (!speaker) {
      return res.status(404).json({ error: 'Speaker not found' });
    }

    res.json(speaker);
  } catch (error) {
    console.error('Error fetching speaker:', error);
    res.status(500).json({ error: 'Failed to fetch speaker' });
  }
});

// POST /api/event-speakers - Create new speaker
router.post('/', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const speaker = await prisma.eventSpeaker.create({
      data: req.body,
    });
    res.status(201).json(speaker);
  } catch (error) {
    console.error('Error creating speaker:', error);
    res.status(500).json({ error: 'Failed to create speaker' });
  }
});

// PUT /api/event-speakers/:id - Update speaker
router.put('/:id', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const speaker = await prisma.eventSpeaker.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        updated_at: new Date(),
      },
    });
    res.json(speaker);
  } catch (error) {
    console.error('Error updating speaker:', error);
    res.status(500).json({ error: 'Failed to update speaker' });
  }
});

// DELETE /api/event-speakers/:id - Soft delete speaker
router.delete('/:id', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const speaker = await prisma.eventSpeaker.update({
      where: { id: req.params.id },
      data: {
        is_deleted: true,
        updated_at: new Date(),
      },
    });
    res.json(speaker);
  } catch (error) {
    console.error('Error deleting speaker:', error);
    res.status(500).json({ error: 'Failed to delete speaker' });
  }
});

export default router;
