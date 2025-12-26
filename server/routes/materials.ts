import express from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'materials');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `material-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// =====================
// MATERIAL LIBRARY CRUD
// =====================

// GET /api/materials - List all materials
router.get('/materials', async (req, res) => {
  try {
    const { category, search } = req.query;

    const where: any = {
      is_deleted: false,
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title_en: { contains: search as string, mode: 'insensitive' } },
        { title_km: { contains: search as string } },
        { description_en: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const materials = await prisma.trainingMaterial.findMany({
      where,
      include: {
        training_links: {
          select: {
            training_id: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Add linked trainings count
    const result = materials.map((m) => ({
      ...m,
      linked_trainings_count: m.training_links.length,
      training_links: undefined,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// GET /api/materials/:id - Get single material
router.get('/materials/:id', async (req, res) => {
  try {
    const material = await prisma.trainingMaterial.findUnique({
      where: { id: req.params.id },
      include: {
        training_links: {
          include: {
            training: {
              select: {
                id: true,
                training_code: true,
                training_name: true,
                training_status: true,
              },
            },
          },
        },
      },
    });

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(material);
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ error: 'Failed to fetch material' });
  }
});

// POST /api/materials - Create material (URL type or metadata only)
router.post('/materials', authenticateToken, async (req, res) => {
  try {
    const material = await prisma.trainingMaterial.create({
      data: {
        ...req.body,
        created_by: req.user?.userId,
      },
    });

    res.status(201).json(material);
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({ error: 'Failed to create material' });
  }
});

// POST /api/materials/upload - Upload file and create material
router.post('/materials/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};

    const material = await prisma.trainingMaterial.create({
      data: {
        title_en: metadata.title_en || req.file.originalname,
        title_km: metadata.title_km || req.file.originalname,
        description_en: metadata.description_en,
        description_km: metadata.description_km,
        material_type: 'FILE',
        file_url: `/uploads/materials/${req.file.filename}`,
        file_name: req.file.originalname,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        category: metadata.category,
        created_by: req.user?.userId,
      },
    });

    res.status(201).json(material);
  } catch (error) {
    console.error('Error uploading material:', error);
    res.status(500).json({ error: 'Failed to upload material' });
  }
});

// PUT /api/materials/:id - Update material
router.put('/materials/:id', authenticateToken, async (req, res) => {
  try {
    const material = await prisma.trainingMaterial.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        updated_by: req.user?.userId,
      },
    });

    res.json(material);
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ error: 'Failed to update material' });
  }
});

// DELETE /api/materials/:id - Soft delete material
router.delete('/materials/:id', authenticateToken, async (req, res) => {
  try {
    const material = await prisma.trainingMaterial.update({
      where: { id: req.params.id },
      data: {
        is_deleted: true,
        updated_by: req.user?.userId,
      },
    });

    res.json(material);
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

// ==============================
// TRAINING-MATERIAL LINKING
// ==============================

// GET /api/trainings/:trainingId/materials - Get materials linked to a training
router.get('/trainings/:trainingId/materials', async (req, res) => {
  try {
    const { trainingId } = req.params;

    const links = await prisma.trainingMaterialLink.findMany({
      where: {
        training_id: trainingId,
        material: {
          is_deleted: false,
        },
      },
      include: {
        material: true,
      },
      orderBy: { sort_order: 'asc' },
    });

    res.json(links);
  } catch (error) {
    console.error('Error fetching training materials:', error);
    res.status(500).json({ error: 'Failed to fetch training materials' });
  }
});

// POST /api/trainings/:trainingId/materials - Link materials to training
router.post('/trainings/:trainingId/materials', authenticateToken, async (req, res) => {
  try {
    const { trainingId } = req.params;
    const { materialIds } = req.body;

    if (!Array.isArray(materialIds) || materialIds.length === 0) {
      return res.status(400).json({ error: 'Invalid materialIds array' });
    }

    // Get current max sort_order
    const maxSort = await prisma.trainingMaterialLink.findFirst({
      where: { training_id: trainingId },
      orderBy: { sort_order: 'desc' },
      select: { sort_order: true },
    });

    let sortOrder = (maxSort?.sort_order || 0) + 1;

    // Create links (ignore duplicates)
    const links = [];
    for (const materialId of materialIds) {
      try {
        const link = await prisma.trainingMaterialLink.create({
          data: {
            training_id: trainingId,
            material_id: materialId,
            sort_order: sortOrder++,
            linked_by: req.user?.userId,
          },
          include: { material: true },
        });
        links.push(link);
      } catch (e: any) {
        // Ignore unique constraint violations (already linked)
        if (e.code !== 'P2002') throw e;
      }
    }

    res.status(201).json(links);
  } catch (error) {
    console.error('Error linking materials:', error);
    res.status(500).json({ error: 'Failed to link materials' });
  }
});

// DELETE /api/trainings/:trainingId/materials/:materialId - Unlink material from training
router.delete('/trainings/:trainingId/materials/:materialId', authenticateToken, async (req, res) => {
  try {
    const { trainingId, materialId } = req.params;

    await prisma.trainingMaterialLink.delete({
      where: {
        training_id_material_id: {
          training_id: trainingId,
          material_id: materialId,
        },
      },
    });

    res.json({ message: 'Material unlinked successfully' });
  } catch (error) {
    console.error('Error unlinking material:', error);
    res.status(500).json({ error: 'Failed to unlink material' });
  }
});

// PUT /api/trainings/:trainingId/materials/reorder - Reorder linked materials
router.put('/trainings/:trainingId/materials/reorder', authenticateToken, async (req, res) => {
  try {
    const { trainingId } = req.params;
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'Invalid orderedIds array' });
    }

    await prisma.$transaction(
      orderedIds.map((materialId: string, index: number) =>
        prisma.trainingMaterialLink.update({
          where: {
            training_id_material_id: {
              training_id: trainingId,
              material_id: materialId,
            },
          },
          data: { sort_order: index },
        })
      )
    );

    res.json({ message: 'Materials reordered successfully' });
  } catch (error) {
    console.error('Error reordering materials:', error);
    res.status(500).json({ error: 'Failed to reorder materials' });
  }
});

// POST /api/trainings/:trainingId/materials/copy-from/:sourceTrainingId - Copy material links from another training
router.post('/trainings/:trainingId/materials/copy-from/:sourceTrainingId', authenticateToken, async (req, res) => {
  try {
    const { trainingId, sourceTrainingId } = req.params;

    // Get source material links
    const sourceLinks = await prisma.trainingMaterialLink.findMany({
      where: { training_id: sourceTrainingId },
    });

    if (sourceLinks.length === 0) {
      return res.json({ count: 0, message: 'No materials to copy' });
    }

    // Create copies for target training (ignore duplicates)
    let count = 0;
    for (const link of sourceLinks) {
      try {
        await prisma.trainingMaterialLink.create({
          data: {
            training_id: trainingId,
            material_id: link.material_id,
            sort_order: link.sort_order,
            is_required: link.is_required,
            linked_by: req.user?.userId,
          },
        });
        count++;
      } catch (e: any) {
        // Ignore unique constraint violations
        if (e.code !== 'P2002') throw e;
      }
    }

    res.status(201).json({ count, message: `Copied ${count} material links` });
  } catch (error) {
    console.error('Error copying material links:', error);
    res.status(500).json({ error: 'Failed to copy material links' });
  }
});

export default router;
