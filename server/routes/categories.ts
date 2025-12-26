import express from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/categories - Get all training categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.trainingCategory.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories - Create new category (Admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { code, name_en, name_km, description, icon, color, sort_order } = req.body;
    const userId = req.user?.userId;

    const category = await prisma.trainingCategory.create({
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

    res.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/categories/:id - Update category (Admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name_en, name_km, description, icon, color, sort_order, is_active } = req.body;
    const userId = req.user?.userId;

    const category = await prisma.trainingCategory.update({
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

    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/categories/:id - Soft delete category (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.trainingCategory.update({
      where: { id },
      data: { is_active: false },
    });

    res.json(category);
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
