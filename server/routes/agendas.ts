import express from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/trainings/:trainingId/agendas - Get all agenda items for a training
router.get('/trainings/:trainingId/agendas', async (req, res) => {
  try {
    const { trainingId } = req.params;

    const agendas = await prisma.trainingAgenda.findMany({
      where: {
        training_id: trainingId,
        is_deleted: false,
      },
      orderBy: [
        { day_number: 'asc' },
        { sort_order: 'asc' },
        { start_time: 'asc' },
      ],
    });

    res.json(agendas);
  } catch (error) {
    console.error('Error fetching agendas:', error);
    res.status(500).json({ error: 'Failed to fetch agendas' });
  }
});

// POST /api/trainings/:trainingId/agendas - Create agenda item
router.post('/trainings/:trainingId/agendas', authenticateToken, async (req, res) => {
  try {
    const { trainingId } = req.params;

    const agenda = await prisma.trainingAgenda.create({
      data: {
        ...req.body,
        training_id: trainingId,
        created_by: req.user?.userId,
      },
    });

    res.status(201).json(agenda);
  } catch (error) {
    console.error('Error creating agenda:', error);
    res.status(500).json({ error: 'Failed to create agenda' });
  }
});

// POST /api/trainings/:trainingId/agendas/bulk - Bulk create/update agendas
router.post('/trainings/:trainingId/agendas/bulk', authenticateToken, async (req, res) => {
  try {
    const { trainingId } = req.params;
    const { agendas } = req.body;

    if (!Array.isArray(agendas)) {
      return res.status(400).json({ error: 'Invalid agendas array' });
    }

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      const results = [];

      for (const agenda of agendas) {
        if (agenda.id) {
          // Update existing
          const updated = await tx.trainingAgenda.update({
            where: { id: agenda.id },
            data: {
              ...agenda,
              updated_by: req.user?.userId,
            },
          });
          results.push(updated);
        } else {
          // Create new
          const created = await tx.trainingAgenda.create({
            data: {
              ...agenda,
              training_id: trainingId,
              created_by: req.user?.userId,
            },
          });
          results.push(created);
        }
      }

      return results;
    });

    res.json(result);
  } catch (error) {
    console.error('Error bulk updating agendas:', error);
    res.status(500).json({ error: 'Failed to bulk update agendas' });
  }
});

// PUT /api/agendas/:id - Update agenda item
router.put('/agendas/:id', authenticateToken, async (req, res) => {
  try {
    const agenda = await prisma.trainingAgenda.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        updated_by: req.user?.userId,
      },
    });

    res.json(agenda);
  } catch (error) {
    console.error('Error updating agenda:', error);
    res.status(500).json({ error: 'Failed to update agenda' });
  }
});

// DELETE /api/agendas/:id - Soft delete agenda item
router.delete('/agendas/:id', authenticateToken, async (req, res) => {
  try {
    const agenda = await prisma.trainingAgenda.update({
      where: { id: req.params.id },
      data: {
        is_deleted: true,
        updated_by: req.user?.userId,
      },
    });

    res.json(agenda);
  } catch (error) {
    console.error('Error deleting agenda:', error);
    res.status(500).json({ error: 'Failed to delete agenda' });
  }
});

// POST /api/trainings/:trainingId/agendas/copy-from/:sourceTrainingId - Copy agendas from another training
router.post('/trainings/:trainingId/agendas/copy-from/:sourceTrainingId', authenticateToken, async (req, res) => {
  try {
    const { trainingId, sourceTrainingId } = req.params;

    // Get source agendas
    const sourceAgendas = await prisma.trainingAgenda.findMany({
      where: {
        training_id: sourceTrainingId,
        is_deleted: false,
      },
    });

    if (sourceAgendas.length === 0) {
      return res.json({ count: 0, message: 'No agendas to copy' });
    }

    // Create copies for target training
    const result = await prisma.trainingAgenda.createMany({
      data: sourceAgendas.map((agenda) => ({
        training_id: trainingId,
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
        created_by: req.user?.userId,
      })),
    });

    res.status(201).json({ count: result.count, message: `Copied ${result.count} agenda items` });
  } catch (error) {
    console.error('Error copying agendas:', error);
    res.status(500).json({ error: 'Failed to copy agendas' });
  }
});

export default router;
