import express from 'express';
import prisma from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// GET /api/trainings - Get all trainings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const trainings = await prisma.training.findMany({
      where: {
        training_is_deleted: false,
      },
      orderBy: {
        training_created_at: 'desc',
      },
    });
    res.json(trainings);
  } catch (error) {
    console.error('Error fetching trainings:', error);
    res.status(500).json({ error: 'Failed to fetch trainings' });
  }
});

// GET /api/trainings/:id - Get single training
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const training = await prisma.training.findUnique({
      where: { id: req.params.id },
      include: {
        beneficiary_trainings: {
          include: {
            beneficiary: true,
          },
        },
      },
    });

    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    res.json(training);
  } catch (error) {
    console.error('Error fetching training:', error);
    res.status(500).json({ error: 'Failed to fetch training' });
  }
});

// POST /api/trainings - Create new training
router.post('/', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const training = await prisma.training.create({
      data: {
        ...req.body,
        training_start_date: new Date(req.body.training_start_date),
        training_end_date: new Date(req.body.training_end_date),
        registration_deadline: req.body.registration_deadline ? new Date(req.body.registration_deadline) : undefined,
      },
    });
    res.status(201).json(training);
  } catch (error) {
    console.error('Error creating training:', error);
    res.status(500).json({ error: 'Failed to create training' });
  }
});

// PUT /api/trainings/:id - Update training
router.put('/:id', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const training = await prisma.training.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        training_start_date: req.body.training_start_date ? new Date(req.body.training_start_date) : undefined,
        training_end_date: req.body.training_end_date ? new Date(req.body.training_end_date) : undefined,
        registration_deadline: req.body.registration_deadline ? new Date(req.body.registration_deadline) : undefined,
        training_updated_at: new Date(),
      },
    });
    res.json(training);
  } catch (error) {
    console.error('Error updating training:', error);
    res.status(500).json({ error: 'Failed to update training' });
  }
});

// DELETE /api/trainings/:id - Soft delete training
router.delete('/:id', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const training = await prisma.training.update({
      where: { id: req.params.id },
      data: {
        training_is_deleted: true,
        training_updated_at: new Date(),
      },
    });
    res.json(training);
  } catch (error) {
    console.error('Error deleting training:', error);
    res.status(500).json({ error: 'Failed to delete training' });
  }
});

// POST /api/trainings/bulk-delete - Bulk soft delete trainings
router.post('/bulk-delete', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty ids array' });
    }

    const result = await prisma.training.updateMany({
      where: { id: { in: ids } },
      data: {
        training_is_deleted: true,
        training_updated_at: new Date(),
      },
    });

    res.json({ count: result.count, message: `${result.count} trainings deleted` });
  } catch (error) {
    console.error('Error bulk deleting trainings:', error);
    res.status(500).json({ error: 'Failed to bulk delete trainings' });
  }
});

// GET /api/trainings/enrolled/:beneficiaryId - Get trainings enrolled by a beneficiary
router.get('/enrolled/:beneficiaryId', authenticateToken, async (req, res) => {
  try {
    const { beneficiaryId } = req.params;

    const enrolledTrainings = await prisma.beneficiaryTraining.findMany({
      where: {
        beneficiary_id: beneficiaryId,
      },
      include: {
        training: true,
      },
    });

    // Map to include enrollment details with training data
    const trainings = enrolledTrainings.map((enrollment) => ({
      ...enrollment.training,
      enrollment_status: enrollment.attendance_status,
      enrollment_role: enrollment.training_role,
      attendance_percentage: enrollment.attendance_percentage,
      registration_date: enrollment.registration_date,
    }));

    res.json(trainings);
  } catch (error) {
    console.error('Error fetching enrolled trainings:', error);
    res.status(500).json({ error: 'Failed to fetch enrolled trainings' });
  }
});

// GET /api/trainings/available/:beneficiaryId - Get available trainings for a beneficiary
router.get('/available/:beneficiaryId', authenticateToken, async (req, res) => {
  try {
    const { beneficiaryId } = req.params;

    // Get IDs of trainings the beneficiary is already enrolled in
    const enrolledTrainings = await prisma.beneficiaryTraining.findMany({
      where: { beneficiary_id: beneficiaryId },
      select: { training_id: true },
    });

    const enrolledIds = enrolledTrainings.map((e) => e.training_id);

    // Get all ONGOING trainings that the beneficiary is NOT enrolled in
    const availableTrainings = await prisma.training.findMany({
      where: {
        training_is_deleted: false,
        training_status: {
          in: ['ONGOING', 'DRAFT'],
        },
        id: {
          notIn: enrolledIds,
        },
      },
      orderBy: {
        training_start_date: 'asc',
      },
    });

    res.json(availableTrainings);
  } catch (error) {
    console.error('Error fetching available trainings:', error);
    res.status(500).json({ error: 'Failed to fetch available trainings' });
  }
});

// GET /api/trainings/:id/export-participants - Export participants with attendance records
router.get('/:id/export-participants', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get training details
    const training = await prisma.training.findUnique({
      where: { id },
      include: {
        beneficiary_trainings: {
          include: {
            beneficiary: true,
          },
        },
        attendance_records: {
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    // Get all attendance records grouped by beneficiary and date
    const attendanceByBeneficiary = new Map();

    training.attendance_records.forEach((record) => {
      if (!attendanceByBeneficiary.has(record.beneficiary_id)) {
        attendanceByBeneficiary.set(record.beneficiary_id, []);
      }
      attendanceByBeneficiary.get(record.beneficiary_id).push(record);
    });

    // Build export data
    const exportData = {
      training,
      participants: training.beneficiary_trainings.map((enrollment) => ({
        ...enrollment,
        beneficiary: enrollment.beneficiary,
        attendanceRecords: attendanceByBeneficiary.get(enrollment.beneficiary_id) || [],
      })),
    };

    res.json(exportData);
  } catch (error) {
    console.error('Error fetching export data:', error);
    res.status(500).json({ error: 'Failed to fetch export data' });
  }
});

// POST /api/trainings/:id/clone - Clone a training
router.post('/:id/clone', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { includeEnrollments = false } = req.body;

    // Get the original training with all related data
    const originalTraining = await prisma.training.findUnique({
      where: { id },
      include: {
        beneficiary_trainings: true,
        agendas: true,
        material_links: true,
        survey_links: true,
      },
    });

    if (!originalTraining) {
      return res.status(404).json({ error: 'Training not found' });
    }

    // Generate a unique training code
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const newTrainingCode = `${originalTraining.training_code}-CLONE-${timestamp}-${random}`;

    // Create the cloned training with DRAFT status
    const clonedTraining = await prisma.training.create({
      data: {
        training_code: newTrainingCode,
        training_name: `${originalTraining.training_name} (Clone)`,
        training_name_english: originalTraining.training_name_english
          ? `${originalTraining.training_name_english} (Clone)`
          : undefined,
        training_description: originalTraining.training_description,
        training_type: originalTraining.training_type,
        training_category: originalTraining.training_category,
        training_level: originalTraining.training_level,
        training_status: 'DRAFT',
        training_start_date: originalTraining.training_start_date,
        training_end_date: originalTraining.training_end_date,
        registration_deadline: originalTraining.registration_deadline,
        training_location: originalTraining.training_location,
        training_venue: originalTraining.training_venue,
        venue_latitude: originalTraining.venue_latitude,
        venue_longitude: originalTraining.venue_longitude,
        geofence_radius: originalTraining.geofence_radius,
        province_name: originalTraining.province_name,
        district_name: originalTraining.district_name,
        commune_name: originalTraining.commune_name,
        school_name: originalTraining.school_name,
        cluster_schools: originalTraining.cluster_schools,
        max_participants: originalTraining.max_participants,
        current_participants: includeEnrollments ? originalTraining.beneficiary_trainings.length : 0,
        qr_code_data: originalTraining.qr_code_data,
        gps_validation_required: originalTraining.gps_validation_required,
        geofence_validation_required: originalTraining.geofence_validation_required,
        is_published: false,
        training_created_by: originalTraining.training_created_by,
        training_is_deleted: false,
      },
    });

    // Clone agendas
    if (originalTraining.agendas && originalTraining.agendas.length > 0) {
      await prisma.trainingAgenda.createMany({
        data: originalTraining.agendas.map((agenda) => ({
          training_id: clonedTraining.id,
          day_number: agenda.day_number,
          start_time: agenda.start_time,
          end_time: agenda.end_time,
          topic_en: agenda.topic_en,
          topic_km: agenda.topic_km,
          description_en: agenda.description_en,
          description_km: agenda.description_km,
          instructor_name: agenda.instructor_name,
          instructor_name_km: agenda.instructor_name_km,
          sort_order: agenda.sort_order,
        })),
      });
    }

    // Clone material links
    if (originalTraining.material_links && originalTraining.material_links.length > 0) {
      await prisma.trainingMaterialLink.createMany({
        data: originalTraining.material_links.map((link) => ({
          training_id: clonedTraining.id,
          material_id: link.material_id,
        })),
      });
    }

    // Clone survey links
    if (originalTraining.survey_links && originalTraining.survey_links.length > 0) {
      await prisma.trainingSurveyLink.createMany({
        data: originalTraining.survey_links.map((link) => ({
          training_id: clonedTraining.id,
          survey_id: link.survey_id,
          timing: link.timing,
        })),
      });
    }

    // Clone enrollments if requested
    if (includeEnrollments && originalTraining.beneficiary_trainings.length > 0) {
      await prisma.beneficiaryTraining.createMany({
        data: originalTraining.beneficiary_trainings.map((enrollment) => ({
          beneficiary_id: enrollment.beneficiary_id,
          training_id: clonedTraining.id,
          registration_date: new Date(),
          registration_method: 'MANUAL',
          attendance_status: 'REGISTERED',
          training_role: enrollment.training_role,
          attendance_percentage: 0,
          enrollment_type: 'CLONE',
          beneficiary_training_status: 'ACTIVE',
        })),
      });
    }

    res.status(201).json({
      message: 'Training cloned successfully',
      originalTrainingId: id,
      clonedTrainingId: clonedTraining.id,
      training: clonedTraining,
    });
  } catch (error) {
    console.error('Error cloning training:', error);
    res.status(500).json({ error: 'Failed to clone training' });
  }
});

export default router;
