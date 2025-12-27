import express from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';
import { createNotification, getUserIdByUsername } from '../utils/notificationService';

const router = express.Router();

// POST /api/enrollments - Enroll beneficiary in training(s)
router.post('/', async (req, res) => {
  try {
    const { beneficiary_id, training_ids, registration_method } = req.body;

    // Validate beneficiary exists
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { teacher_id: beneficiary_id },
    });
    if (!beneficiary) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    // Create enrollments for each training
    const enrollments = await Promise.all(
      training_ids.map(async (training_id: string) => {
        // Check for existing enrollment
        const existing = await prisma.beneficiaryTraining.findUnique({
          where: {
            beneficiary_id_training_id: { beneficiary_id, training_id },
          },
        });

        if (existing) {
          throw new Error(`Already enrolled in training ${training_id}`);
        }

        // Check capacity
        const training = await prisma.training.findUnique({
          where: { id: training_id },
        });

        if (!training) {
          throw new Error(`Training ${training_id} not found`);
        }

        if (training.current_participants >= training.max_participants) {
          throw new Error(`Training ${training_id} is full`);
        }

        // Create enrollment
        const enrollment = await prisma.beneficiaryTraining.create({
          data: {
            beneficiary_id,
            training_id,
            registration_date: new Date(),
            registration_method: registration_method || 'MANUAL',
            attendance_status: 'REGISTERED',
            training_role: 'PARTICIPANT',
            enrollment_type: 'SELF',
            beneficiary_training_status: 'ACTIVE',
          },
        });

        // Increment participant count
        await prisma.training.update({
          where: { id: training_id },
          data: {
            current_participants: { increment: 1 },
          },
        });

        // Send notification to beneficiary about successful enrollment
        try {
          const user = await prisma.user.findUnique({
            where: { teacher_id: beneficiary_id },
            select: { id: true },
          });
          
          if (user) {
            await createNotification({
              user_id: user.id,
              title: 'ការចុះឈ្មោះជោគជ័យ',
              message: `អ្នកត្រូវបានចុះឈ្មោះចូលរួមកម្មវិធីបណ្តុះបណ្តាល ${training.training_name} ដោយជោគជ័យ`,
              type: 'SUCCESS',
              priority: 'NORMAL',
              related_entity_type: 'training',
              related_entity_id: training_id,
              action_url: `/portal/trainings`,
            });
          }
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
          // Don't fail enrollment if notification fails
        }

        return enrollment;
      })
    );

    res.status(201).json(enrollments);
  } catch (error: any) {
    console.error('Error creating enrollment:', error);
    res.status(500).json({ error: error.message || 'Failed to create enrollment' });
  }
});

// GET /api/enrollments/beneficiary/:beneficiaryId - Get all enrollments for a beneficiary
router.get('/beneficiary/:beneficiaryId', async (req, res) => {
  try {
    const enrollments = await prisma.beneficiaryTraining.findMany({
      where: { beneficiary_id: req.params.beneficiaryId },
      include: {
        training: true,
      },
      orderBy: { registration_date: 'desc' },
    });
    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// GET /api/enrollments/training/:trainingId - Get all enrollments for a training
router.get('/training/:trainingId', authenticateToken, async (req, res) => {
  try {
    const enrollments = await prisma.beneficiaryTraining.findMany({
      where: { training_id: req.params.trainingId },
      include: {
        beneficiary: true,
      },
      orderBy: { registration_date: 'desc' },
    });
    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// PUT /api/enrollments/:id - Update enrollment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const enrollment = await prisma.beneficiaryTraining.update({
      where: { beneficiary_training_id: req.params.id },
      data: req.body,
    });
    res.json(enrollment);
  } catch (error) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({ error: 'Failed to update enrollment' });
  }
});

// DELETE /api/enrollments/:id - Cancel enrollment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const enrollment = await prisma.beneficiaryTraining.delete({
      where: { beneficiary_training_id: req.params.id },
    });

    // Decrement participant count
    await prisma.training.update({
      where: { id: enrollment.training_id },
      data: {
        current_participants: { decrement: 1 },
      },
    });

    res.json(enrollment);
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    res.status(500).json({ error: 'Failed to delete enrollment' });
  }
});

export default router;
