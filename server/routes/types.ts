import express from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/types - Get all training types
router.get('/', async (req, res) => {
  try {
    const types = await prisma.trainingTypeConfig.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });
    res.json(types);
  } catch (error) {
    console.error('Error fetching types:', error);
    res.status(500).json({ error: 'Failed to fetch types' });
  }
});

// POST /api/types - Create new type (Admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { code, name_en, name_km, description, icon, color, sort_order } = req.body;
    const userId = req.user?.userId;

    const type = await prisma.trainingTypeConfig.create({
      data: {
        code,
        name_en,
        name_km,
        description,
        icon,
        color,
        sort_order: sort_order || 0,
        created_by: userId,
      },
    });

    res.json(type);
  } catch (error) {
    console.error('Error creating type:', error);
    res.status(500).json({ error: 'Failed to create type' });
  }
});

// PUT /api/types/:id - Update type (Admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name_en, name_km, description, icon, color, sort_order, is_active } = req.body;
    const userId = req.user?.userId;

    const type = await prisma.trainingTypeConfig.update({
      where: { id },
      data: {
        code,
        name_en,
        name_km,
        description,
        icon,
        color,
        sort_order,
        is_active,
        updated_by: userId,
      },
    });

    res.json(type);
  } catch (error) {
    console.error('Error updating type:', error);
    res.status(500).json({ error: 'Failed to update type' });
  }
});

// DELETE /api/types/:id - Soft delete type (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const type = await prisma.trainingTypeConfig.update({
      where: { id },
      data: { is_active: false },
    });

    res.json(type);
  } catch (error) {
    console.error('Error deleting type:', error);
    res.status(500).json({ error: 'Failed to delete type' });
  }
});

export default router;
