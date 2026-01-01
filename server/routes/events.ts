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
        registrations: {
          where: {
            is_deleted: false,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        event_start_date: 'asc',
      },
    });
    
    // Add registration count to each event
    const eventsWithCount = events.map(event => ({
      ...event,
      _count: {
        registrations: event.registrations.length
      }
    }));
    
    res.json(eventsWithCount);
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

// POST /api/events/:id/clone - Clone an event
router.post('/:id/clone', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { includeRegistrations = false } = req.body;

    // Get the original event with all related data
    const originalEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: true,
        sessions: true,
        speakers: true,
        material_links: true,
      },
    });

    if (!originalEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Generate a unique event code
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const newEventCode = `${originalEvent.event_code}-CLONE-${timestamp}-${random}`;

    // Create the cloned event with DRAFT status
    const clonedEvent = await prisma.event.create({
      data: {
        event_code: newEventCode,
        event_name: `${originalEvent.event_name} (Clone)`,
        event_name_english: originalEvent.event_name_english
          ? `${originalEvent.event_name_english} (Clone)`
          : undefined,
        event_description: originalEvent.event_description,
        event_type: originalEvent.event_type,
        event_category: originalEvent.event_category,
        event_format: originalEvent.event_format,
        event_status: 'DRAFT',
        event_start_date: originalEvent.event_start_date,
        event_end_date: originalEvent.event_end_date,
        registration_deadline: originalEvent.registration_deadline,
        registration_start: originalEvent.registration_start,
        event_location: originalEvent.event_location,
        event_venue: originalEvent.event_venue,
        venue_latitude: originalEvent.venue_latitude,
        venue_longitude: originalEvent.venue_longitude,
        geofence_radius: originalEvent.geofence_radius,
        province_name: originalEvent.province_name,
        district_name: originalEvent.district_name,
        virtual_platform: originalEvent.virtual_platform,
        virtual_meeting_url: originalEvent.virtual_meeting_url,
        virtual_meeting_id: originalEvent.virtual_meeting_id,
        virtual_passcode: originalEvent.virtual_passcode,
        max_attendees: originalEvent.max_attendees,
        current_attendees: includeRegistrations ? originalEvent.registrations.length : 0,
        allow_public_registration: originalEvent.allow_public_registration,
        requires_approval: originalEvent.requires_approval,
        is_multi_track: originalEvent.is_multi_track,
        qr_code_data: originalEvent.qr_code_data,
        gps_validation_required: originalEvent.gps_validation_required,
        geofence_validation_required: originalEvent.geofence_validation_required,
        is_published: false,
        banner_image_url: originalEvent.banner_image_url,
        tags: originalEvent.tags,
        created_by: originalEvent.created_by,
        is_deleted: false,
      },
    });

    // Clone sessions
    if (originalEvent.sessions && originalEvent.sessions.length > 0) {
      const newSessions = await prisma.eventSession.createMany({
        data: originalEvent.sessions.map((session) => ({
          event_id: clonedEvent.id,
          session_name: session.session_name,
          session_name_english: session.session_name_english,
          session_description: session.session_description,
          session_date: session.session_date,
          session_start_time: session.session_start_time,
          session_end_time: session.session_end_time,
          track_name: session.track_name,
          room_name: session.room_name,
          session_type: session.session_type,
          capacity: session.capacity,
          current_attendees: 0,
          is_cancelled: false,
          is_deleted: false,
        })),
      });
    }

    // Clone speakers
    if (originalEvent.speakers && originalEvent.speakers.length > 0) {
      await prisma.eventSpeaker.createMany({
        data: originalEvent.speakers.map((speaker) => ({
          event_id: clonedEvent.id,
          speaker_name: speaker.speaker_name,
          speaker_name_english: speaker.speaker_name_english,
          speaker_position: speaker.speaker_position,
          speaker_organization: speaker.speaker_organization,
          speaker_photo_url: speaker.speaker_photo_url,
          speaker_bio: speaker.speaker_bio,
          is_keynote_speaker: speaker.is_keynote_speaker,
          is_deleted: false,
        })),
      });
    }

    // Clone material links
    if (originalEvent.material_links && originalEvent.material_links.length > 0) {
      await prisma.eventMaterialLink.createMany({
        data: originalEvent.material_links.map((link) => ({
          event_id: clonedEvent.id,
          material_id: link.material_id,
        })),
      });
    }

    // Clone registrations if requested
    if (includeRegistrations && originalEvent.registrations.length > 0) {
      await prisma.eventRegistration.createMany({
        data: originalEvent.registrations.map((registration) => ({
          event_id: clonedEvent.id,
          beneficiary_id: registration.beneficiary_id,
          registration_code: `${registration.registration_code}-CLONE`,
          registration_date: new Date(),
          registration_status: 'REGISTERED',
          attendance_status: 'NOT_STARTED',
          notes: registration.notes,
        })),
      });
    }

    res.status(201).json({
      message: 'Event cloned successfully',
      originalEventId: id,
      clonedEventId: clonedEvent.id,
      event: clonedEvent,
    });
  } catch (error) {
    console.error('Error cloning event:', error);
    res.status(500).json({ error: 'Failed to clone event' });
  }
});

export default router;
