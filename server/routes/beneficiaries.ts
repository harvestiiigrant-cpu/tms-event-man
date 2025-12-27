import express from 'express';
import prisma from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// GET /api/beneficiaries - Get all beneficiaries
router.get('/', authenticateToken, async (req, res) => {
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
router.get('/:id', authenticateToken, async (req, res) => {
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

// POST /api/beneficiaries/bulk-import - Bulk import beneficiaries
router.post('/bulk-import', authenticateToken, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { beneficiaries } = req.body;

    if (!Array.isArray(beneficiaries) || beneficiaries.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty beneficiaries array' });
    }

    const userId = req.user?.userId;
    const results = { created: 0, updated: 0, errors: [] as any[] };

    for (const ben of beneficiaries) {
      try {
        const existing = await prisma.beneficiary.findUnique({
          where: { teacher_id: ben.teacher_id },
        });

        if (existing) {
          // Update existing
          await prisma.beneficiary.update({
            where: { teacher_id: ben.teacher_id },
            data: {
              name: ben.name,
              name_english: ben.name_english,
              phone: ben.phone,
              sex: ben.sex,
              province_name: ben.province_name,
              district_name: ben.district_name,
              commune_name: ben.commune_name,
              village_name: ben.village_name,
              school: ben.school,
              school_id: ben.school_id,
              position: ben.position,
              subject: ben.subject,
              grade: ben.grade,
              updated_by: userId,
            },
          });
          results.updated++;
        } else {
          // Create new
          await prisma.beneficiary.create({
            data: {
              teacher_id: ben.teacher_id,
              name: ben.name,
              name_english: ben.name_english,
              phone: ben.phone,
              sex: ben.sex,
              province_name: ben.province_name,
              district_name: ben.district_name,
              commune_name: ben.commune_name,
              village_name: ben.village_name,
              school: ben.school,
              school_id: ben.school_id,
              position: ben.position,
              subject: ben.subject,
              grade: ben.grade,
              status: 'ACTIVE',
              created_by: userId,
            },
          });
          results.created++;
        }
      } catch (error: any) {
        results.errors.push({
          teacher_id: ben.teacher_id,
          error: error.message,
        });
      }
    }

    res.json({
      message: `Import completed: ${results.created} created, ${results.updated} updated, ${results.errors.length} errors`,
      ...results,
    });
  } catch (error) {
    console.error('Error bulk importing beneficiaries:', error);
    res.status(500).json({ error: 'Failed to bulk import beneficiaries' });
  }
});

// POST /api/beneficiaries/bulk-delete - Bulk soft delete beneficiaries
router.post('/bulk-delete', authenticateToken, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty ids array' });
    }

    const result = await prisma.beneficiary.updateMany({
      where: { teacher_id: { in: ids } },
      data: {
        is_deleted: true,
        updated_by: req.user?.userId,
        updated_at: new Date(),
      },
    });

    res.json({ count: result.count, message: `${result.count} beneficiaries deleted` });
  } catch (error) {
    console.error('Error bulk deleting beneficiaries:', error);
    res.status(500).json({ error: 'Failed to bulk delete beneficiaries' });
  }
});

export default router;
