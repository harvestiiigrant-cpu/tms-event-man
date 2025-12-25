import express from 'express';
import prisma from '../db';

const router = express.Router();

// GET /api/trainings - Get all trainings
router.get('/', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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
router.post('/', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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

// GET /api/trainings/enrolled/:beneficiaryId - Get trainings enrolled by a beneficiary
router.get('/enrolled/:beneficiaryId', async (req, res) => {
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
router.get('/available/:beneficiaryId', async (req, res) => {
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

export default router;
