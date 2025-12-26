import express from 'express';
import prisma from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// GET /api/positions - Get all positions
router.get('/', async (req, res) => {
  try {
    const positions = await prisma.beneficiaryPosition.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });
    res.json(positions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
});

// POST /api/positions - Create position (Admin only)
router.post('/', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { code, name_en, name_km, description, sort_order } = req.body;
    const userId = req.user?.userId;

    const position = await prisma.beneficiaryPosition.create({
      data: {
        code,
        name_en,
        name_km,
        description,
        sort_order: sort_order || 0,
        created_by: userId,
      },
    });

    res.json(position);
  } catch (error) {
    console.error('Error creating position:', error);
    res.status(500).json({ error: 'Failed to create position' });
  }
});

// PUT /api/positions/:id - Update position (Admin only)
router.put('/:id', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name_en, name_km, description, sort_order, is_active } = req.body;
    const userId = req.user?.userId;

    const position = await prisma.beneficiaryPosition.update({
      where: { id },
      data: {
        code,
        name_en,
        name_km,
        description,
        sort_order,
        is_active,
        updated_by: userId,
      },
    });

    res.json(position);
  } catch (error) {
    console.error('Error updating position:', error);
    res.status(500).json({ error: 'Failed to update position' });
  }
});

// DELETE /api/positions/:id - Soft delete position (Admin only)
router.delete('/:id', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const position = await prisma.beneficiaryPosition.update({
      where: { id },
      data: { is_active: false },
    });

    res.json(position);
  } catch (error) {
    console.error('Error deleting position:', error);
    res.status(500).json({ error: 'Failed to delete position' });
  }
});

export default router;
