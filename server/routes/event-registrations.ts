import express from 'express';
import prisma from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// POST /api/event-registrations/public - Public registration (no auth required)
router.post('/public', async (req, res) => {
  try {
    const {
      event_id,
      attendee_name,
      attendee_name_english,
      attendee_email,
      attendee_phone,
      attendee_organization,
      attendee_position,
      attendee_province,
      attendee_district,
      dietary_requirements,
      accessibility_needs,
      special_requests,
      selected_sessions, // Array of session IDs
    } = req.body;

    // Check if event exists and allows public registration
    const event = await prisma.event.findUnique({
      where: { id: event_id },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event.allow_public_registration) {
      return res.status(403).json({ error: 'Public registration is not allowed for this event' });
    }

    if (!event.is_published) {
      return res.status(403).json({ error: 'Event is not published yet' });
    }

    // Check capacity
    if (event.current_attendees >= event.max_attendees) {
      return res.status(400).json({ error: 'Event is fully booked' });
    }

    // Generate unique registration code
    const registrationCode = `REG-${event.event_code}-${Date.now()}`;

    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        event_id,
        registration_code: registrationCode,
        attendee_name,
        attendee_name_english,
        attendee_email,
        attendee_phone,
        attendee_organization,
        attendee_position,
        attendee_province,
        attendee_district,
        dietary_requirements,
        accessibility_needs,
        special_requests,
        registration_date: new Date(),
        registration_method: 'MANUAL',
        registration_source: 'WEB',
        registration_status: 'REGISTERED',
        approval_status: event.requires_approval ? 'PENDING' : 'APPROVED',
        attendee_role: 'PARTICIPANT',
        qr_code_data: registrationCode,
      },
    });

    // Register for selected sessions
    if (Array.isArray(selected_sessions) && selected_sessions.length > 0) {
      await prisma.eventSessionRegistration.createMany({
        data: selected_sessions.map((session_id: string) => ({
          registration_id: registration.id,
          session_id,
        })),
      });
    }

    // Update event attendee count
    await prisma.event.update({
      where: { id: event_id },
      data: {
        current_attendees: {
          increment: 1,
        },
      },
    });

    res.status(201).json(registration);
  } catch (error) {
    console.error('Error creating public registration:', error);
    res.status(500).json({ error: 'Failed to create registration' });
  }
});

// POST /api/event-registrations - Create registration (authenticated)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      event_id,
      beneficiary_id,
      attendee_name,
      attendee_email,
      attendee_phone,
      attendee_organization,
      attendee_position,
      attendee_role,
      selected_sessions,
    } = req.body;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: event_id },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check capacity
    if (event.current_attendees >= event.max_attendees) {
      return res.status(400).json({ error: 'Event is fully booked' });
    }

    // Check if already registered
    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: {
        event_id,
        beneficiary_id,
        is_deleted: false,
      },
    });

    if (existingRegistration) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    // Generate unique registration code
    const registrationCode = `REG-${event.event_code}-${Date.now()}`;

    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        event_id,
        beneficiary_id,
        registration_code: registrationCode,
        attendee_name,
        attendee_email,
        attendee_phone,
        attendee_organization,
        attendee_position,
        registration_date: new Date(),
        registration_method: 'MANUAL',
        registration_source: 'ADMIN',
        registration_status: 'CONFIRMED',
        approval_status: 'APPROVED',
        attendee_role: attendee_role || 'PARTICIPANT',
        qr_code_data: registrationCode,
      },
    });

    // Register for selected sessions
    if (Array.isArray(selected_sessions) && selected_sessions.length > 0) {
      await prisma.eventSessionRegistration.createMany({
        data: selected_sessions.map((session_id: string) => ({
          registration_id: registration.id,
          session_id,
        })),
      });
    }

    // Update event attendee count
    await prisma.event.update({
      where: { id: event_id },
      data: {
        current_attendees: {
          increment: 1,
        },
      },
    });

    res.status(201).json(registration);
  } catch (error) {
    console.error('Error creating registration:', error);
    res.status(500).json({ error: 'Failed to create registration' });
  }
});

// GET /api/event-registrations/event/:eventId - Get all registrations for an event
router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: {
        event_id: req.params.eventId,
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
      orderBy: {
        registration_date: 'desc',
      },
    });
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// GET /api/event-registrations/:id - Get single registration
router.get('/:id', async (req, res) => {
  try {
    const registration = await prisma.eventRegistration.findUnique({
      where: { id: req.params.id },
      include: {
        event: true,
        beneficiary: true,
        session_registrations: {
          include: {
            session: true,
          },
        },
      },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json(registration);
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ error: 'Failed to fetch registration' });
  }
});

// GET /api/event-registrations/code/:code - Get registration by code (public)
router.get('/code/:code', async (req, res) => {
  try {
    const registration = await prisma.eventRegistration.findUnique({
      where: { registration_code: req.params.code },
      include: {
        event: true,
        beneficiary: true,
        session_registrations: {
          include: {
            session: true,
          },
        },
      },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json(registration);
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ error: 'Failed to fetch registration' });
  }
});

// PUT /api/event-registrations/:id - Update registration
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const registration = await prisma.eventRegistration.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        updated_at: new Date(),
      },
    });
    res.json(registration);
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({ error: 'Failed to update registration' });
  }
});

// PUT /api/event-registrations/:id/approve - Approve registration
router.put('/:id/approve', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { userId } = req.body;

    const registration = await prisma.eventRegistration.update({
      where: { id: req.params.id },
      data: {
        approval_status: 'APPROVED',
        registration_status: 'CONFIRMED',
        approved_by: userId,
        approved_at: new Date(),
        updated_at: new Date(),
      },
    });

    res.json(registration);
  } catch (error) {
    console.error('Error approving registration:', error);
    res.status(500).json({ error: 'Failed to approve registration' });
  }
});

// PUT /api/event-registrations/:id/reject - Reject registration
router.put('/:id/reject', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { userId } = req.body;

    const registration = await prisma.eventRegistration.update({
      where: { id: req.params.id },
      data: {
        approval_status: 'REJECTED',
        registration_status: 'CANCELLED',
        approved_by: userId,
        approved_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Decrement event attendee count
    await prisma.event.update({
      where: { id: registration.event_id },
      data: {
        current_attendees: {
          decrement: 1,
        },
      },
    });

    res.json(registration);
  } catch (error) {
    console.error('Error rejecting registration:', error);
    res.status(500).json({ error: 'Failed to reject registration' });
  }
});

// POST /api/event-registrations/:id/sessions - Add session to registration
router.post('/:id/sessions', async (req, res) => {
  try {
    const { session_id } = req.body;

    // Check if already registered for session
    const existing = await prisma.eventSessionRegistration.findFirst({
      where: {
        registration_id: req.params.id,
        session_id,
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Already registered for this session' });
    }

    // Check session capacity
    const session = await prisma.eventSession.findUnique({
      where: { id: session_id },
      include: {
        _count: {
          select: {
            session_registrations: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session._count.session_registrations >= session.max_attendees) {
      return res.status(400).json({ error: 'Session is fully booked' });
    }

    const sessionRegistration = await prisma.eventSessionRegistration.create({
      data: {
        registration_id: req.params.id,
        session_id,
      },
    });

    // Update session attendee count
    await prisma.eventSession.update({
      where: { id: session_id },
      data: {
        current_attendees: {
          increment: 1,
        },
      },
    });

    res.status(201).json(sessionRegistration);
  } catch (error) {
    console.error('Error adding session to registration:', error);
    res.status(500).json({ error: 'Failed to add session to registration' });
  }
});

// DELETE /api/event-registrations/:id/sessions/:sessionId - Remove session from registration
router.delete('/:id/sessions/:sessionId', async (req, res) => {
  try {
    await prisma.eventSessionRegistration.deleteMany({
      where: {
        registration_id: req.params.id,
        session_id: req.params.sessionId,
      },
    });

    // Update session attendee count
    await prisma.eventSession.update({
      where: { id: req.params.sessionId },
      data: {
        current_attendees: {
          decrement: 1,
        },
      },
    });

    res.json({ message: 'Session removed from registration' });
  } catch (error) {
    console.error('Error removing session from registration:', error);
    res.status(500).json({ error: 'Failed to remove session from registration' });
  }
});

// DELETE /api/event-registrations/:id - Cancel registration
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const registration = await prisma.eventRegistration.update({
      where: { id: req.params.id },
      data: {
        registration_status: 'CANCELLED',
        is_deleted: true,
        updated_at: new Date(),
      },
    });

    // Decrement event attendee count
    await prisma.event.update({
      where: { id: registration.event_id },
      data: {
        current_attendees: {
          decrement: 1,
        },
      },
    });

    res.json(registration);
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({ error: 'Failed to cancel registration' });
  }
});

export default router;
