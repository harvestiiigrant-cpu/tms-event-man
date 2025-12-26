import express from 'express';
import prisma from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// GET /api/departments - Get all departments
router.get('/', async (req, res) => {
  try {
    const departments = await prisma.beneficiaryDepartment.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// POST /api/departments - Create department (Admin only)
router.post('/', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { code, name_en, name_km, description, sort_order } = req.body;
    const userId = req.user?.userId;

    const department = await prisma.beneficiaryDepartment.create({
      data: {
        code,
        name_en,
        name_km,
        description,
        sort_order: sort_order || 0,
        created_by: userId,
      },
    });

    res.json(department);
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// PUT /api/departments/:id - Update department (Admin only)
router.put('/:id', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name_en, name_km, description, sort_order, is_active } = req.body;
    const userId = req.user?.userId;

    const department = await prisma.beneficiaryDepartment.update({
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

    res.json(department);
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ error: 'Failed to update department' });
  }
});

// DELETE /api/departments/:id - Soft delete department (Admin only)
router.delete('/:id', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const department = await prisma.beneficiaryDepartment.update({
      where: { id },
      data: { is_active: false },
    });

    res.json(department);
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

export default router;
