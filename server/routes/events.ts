import express from 'express';
import prisma from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// GET /api/events - Get all events
router.get('/', authenticateToken, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        is_deleted: false,
      },
      include: {
        _count: {
          select: {
            registrations: true,
            sessions: true,
            speakers: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/public - Get published events (no auth required)
router.get('/public', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        is_deleted: false,
        is_published: true,
        event_status: {
          in: ['DRAFT', 'UPCOMING', 'ONGOING'],
        },
      },
      include: {
        sessions: {
          where: {
            is_deleted: false,
            is_cancelled: false,
          },
          select: {
            id: true,
            session_name: true,
            session_name_english: true,
            session_date: true,
            session_start_time: true,
            session_end_time: true,
            track_name: true,
            session_type: true,
          },
        },
        speakers: {
          where: {
            is_deleted: false,
          },
          select: {
            id: true,
            speaker_name: true,
            speaker_name_english: true,
            speaker_position: true,
            speaker_organization: true,
            speaker_photo_url: true,
            is_keynote_speaker: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        event_start_date: 'asc',
      },
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching public events:', error);
    res.status(500).json({ error: 'Failed to fetch public events' });
  }
});

// GET /api/events/:id - Get single event
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        sessions: {
          where: {
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
          ],
        },
        speakers: {
          where: {
            is_deleted: false,
          },
          orderBy: {
            sort_order: 'asc',
          },
        },
        registrations: {
          where: {
            is_deleted: false,
          },
          include: {
            beneficiary: true,
          },
        },
        material_links: {
          include: {
            material: true,
          },
        },
        _count: {
          select: {
            registrations: true,
            sessions: true,
            speakers: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// GET /api/events/:id/public - Get single public event (no auth)
router.get('/:id/public', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        sessions: {
          where: {
            is_deleted: false,
            is_cancelled: false,
          },
          include: {
            speakers: {
              include: {
                speaker: {
                  select: {
                    id: true,
                    speaker_name: true,
                    speaker_name_english: true,
                    speaker_title: true,
                    speaker_position: true,
                    speaker_organization: true,
                    speaker_photo_url: true,
                    speaker_bio: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { session_date: 'asc' },
            { session_start_time: 'asc' },
          ],
        },
        speakers: {
          where: {
            is_deleted: false,
          },
          orderBy: {
            sort_order: 'asc',
          },
        },
        material_links: {
          where: {
            material: {
              is_active: true,
              is_deleted: false,
            },
          },
          include: {
            material: true,
          },
        },
      },
    });

    if (!event || event.is_deleted || !event.is_published) {
      return res.status(404).json({ error: 'Event not found or not published' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching public event:', error);
    res.status(500).json({ error: 'Failed to fetch public event' });
  }
});

// POST /api/events - Create new event
router.post('/', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const event = await prisma.event.create({
      data: {
        ...req.body,
        event_start_date: new Date(req.body.event_start_date),
        event_end_date: new Date(req.body.event_end_date),
        registration_deadline: req.body.registration_deadline ? new Date(req.body.registration_deadline) : undefined,
        registration_start: req.body.registration_start ? new Date(req.body.registration_start) : undefined,
      },
    });
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:id - Update event
router.put('/:id', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        event_start_date: req.body.event_start_date ? new Date(req.body.event_start_date) : undefined,
        event_end_date: req.body.event_end_date ? new Date(req.body.event_end_date) : undefined,
        registration_deadline: req.body.registration_deadline ? new Date(req.body.registration_deadline) : undefined,
        registration_start: req.body.registration_start ? new Date(req.body.registration_start) : undefined,
        updated_at: new Date(),
      },
    });
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id - Soft delete event
router.delete('/:id', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        is_deleted: true,
        updated_at: new Date(),
      },
    });
    res.json(event);
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// POST /api/events/bulk-delete - Bulk soft delete events
router.post('/bulk-delete', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty ids array' });
    }

    const result = await prisma.event.updateMany({
      where: { id: { in: ids } },
      data: {
        is_deleted: true,
        updated_at: new Date(),
      },
    });

    res.json({ count: result.count, message: `${result.count} events deleted` });
  } catch (error) {
    console.error('Error bulk deleting events:', error);
    res.status(500).json({ error: 'Failed to bulk delete events' });
  }
});

// GET /api/events/:id/export-participants - Export event participants
router.get('/:id/export-participants', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: {
          where: {
            is_deleted: false,
          },
          include: {
            beneficiary: true,
            session_registrations: {
              include: {
                session: true,
              },
            },
          },
        },
        attendance_records: {
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Group attendance by registration
    const attendanceByAttendee = new Map();

    event.attendance_records.forEach((record) => {
      const key = record.beneficiary_id || record.registration_id;
      if (!attendanceByAttendee.has(key)) {
        attendanceByAttendee.set(key, []);
      }
      attendanceByAttendee.get(key).push(record);
    });

    // Build export data
    const exportData = {
      event,
      participants: event.registrations.map((registration) => ({
        ...registration,
        attendanceRecords: attendanceByAttendee.get(registration.beneficiary_id || registration.id) || [],
      })),
    };

    res.json(exportData);
  } catch (error) {
    console.error('Error fetching export data:', error);
    res.status(500).json({ error: 'Failed to fetch export data' });
  }
});

export default router;
