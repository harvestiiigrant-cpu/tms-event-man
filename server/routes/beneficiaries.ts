import express from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/beneficiaries - Get all beneficiaries
router.get('/', async (req, res) => {
  try {
    const beneficiaries = await prisma.beneficiary.findMany({
      where: {
        is_deleted: false,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    res.json(beneficiaries);
  } catch (error) {
    console.error('Error fetching beneficiaries:', error);
    res.status(500).json({ error: 'Failed to fetch beneficiaries' });
  }
});

// GET /api/beneficiaries/:id - Get single beneficiary
router.get('/:id', async (req, res) => {
  try {
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { teacher_id: req.params.id },
      include: {
        trainings: {
          include: {
            training: true,
          },
        },
      },
    });

    if (!beneficiary) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    res.json(beneficiary);
  } catch (error) {
    console.error('Error fetching beneficiary:', error);
    res.status(500).json({ error: 'Failed to fetch beneficiary' });
  }
});

// POST /api/beneficiaries - Create beneficiary
router.post('/', authenticateToken, async (req, res) => {
  try {
    const beneficiary = await prisma.beneficiary.create({
      data: {
        ...req.body,
        created_by: req.user?.userId,
      },
    });
    res.status(201).json(beneficiary);
  } catch (error) {
    console.error('Error creating beneficiary:', error);
    res.status(500).json({ error: 'Failed to create beneficiary' });
  }
});

// PUT /api/beneficiaries/:id - Update beneficiary
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const beneficiary = await prisma.beneficiary.update({
      where: { teacher_id: req.params.id },
      data: {
        ...req.body,
        updated_by: req.user?.userId,
        updated_at: new Date(),
      },
    });
    res.json(beneficiary);
  } catch (error) {
    console.error('Error updating beneficiary:', error);
    res.status(500).json({ error: 'Failed to update beneficiary' });
  }
});

// DELETE /api/beneficiaries/:id - Soft delete
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const beneficiary = await prisma.beneficiary.update({
      where: { teacher_id: req.params.id },
      data: {
        is_deleted: true,
        updated_by: req.user?.userId,
        updated_at: new Date(),
      },
    });
    res.json(beneficiary);
  } catch (error) {
    console.error('Error deleting beneficiary:', error);
    res.status(500).json({ error: 'Failed to delete beneficiary' });
  }
});

// POST /api/beneficiaries/bulk-import - CSV/Excel import
router.post('/bulk-import', authenticateToken, async (req, res) => {
  // TODO: Implement CSV parsing and bulk insert
  res.status(501).json({ error: 'Bulk import not yet implemented' });
});

export default router;
