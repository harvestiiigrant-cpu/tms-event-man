import express from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/attendance?trainingId=xxx&date=2025-01-20
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { trainingId, date } = req.query;
    const records = await prisma.attendanceRecord.findMany({
      where: {
        training_id: trainingId as string,
        date: date ? new Date(date as string) : undefined,
      },
      include: {
        beneficiary: true,
      },
      orderBy: { date: 'desc' },
    });
    res.json(records);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// POST /api/attendance/check-in - Record attendance
router.post('/check-in', authenticateToken, async (req, res) => {
  try {
    const { training_id, beneficiary_id, session_type, location } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create attendance record for today
    let record = await prisma.attendanceRecord.findUnique({
      where: {
        training_id_beneficiary_id_date: {
          training_id,
          beneficiary_id,
          date: today,
        },
      },
    });

    const updateData: any = {};
    const now = new Date();

    if (session_type === 'morning_in') updateData.morning_in = now;
    else if (session_type === 'morning_out') updateData.morning_out = now;
    else if (session_type === 'afternoon_in') updateData.afternoon_in = now;
    else if (session_type === 'afternoon_out') updateData.afternoon_out = now;

    if (location) {
      updateData.location_lat = location.latitude;
      updateData.location_lng = location.longitude;
      updateData.location_accuracy = location.accuracy;
    }

    if (record) {
      record = await prisma.attendanceRecord.update({
        where: { id: record.id },
        data: updateData,
      });
    } else {
      record = await prisma.attendanceRecord.create({
        data: {
          training_id,
          beneficiary_id,
          date: today,
          session_attendance_status: 'PRESENT',
          ...updateData,
        },
      });
    }

    res.json(record);
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

// GET /api/attendance/my-records/:beneficiaryId
router.get('/my-records/:beneficiaryId', authenticateToken, async (req, res) => {
  try {
    const records = await prisma.attendanceRecord.findMany({
      where: { beneficiary_id: req.params.beneficiaryId },
      include: { training: true },
      orderBy: { date: 'desc' },
    });
    res.json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// GET /api/attendance/training/:trainingId - Get attendance for a specific training
router.get('/training/:trainingId', authenticateToken, async (req, res) => {
  try {
    const records = await prisma.attendanceRecord.findMany({
      where: { training_id: req.params.trainingId },
      include: { beneficiary: true },
      orderBy: [{ date: 'desc' }, { beneficiary: { name: 'asc' } }],
    });
    res.json(records);
  } catch (error) {
    console.error('Error fetching training attendance:', error);
    res.status(500).json({ error: 'Failed to fetch training attendance' });
  }
});

// PUT /api/attendance/:id - Update attendance record (manual entry)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { manual_entry_reason, manual_marked_by_name } = req.body;
    const record = await prisma.attendanceRecord.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        manual_entry: true,
        manual_marked_by: req.user?.userId,
        manual_marked_by_name: manual_marked_by_name || req.user?.name,
        manual_entry_reason: manual_entry_reason || 'Manual update',
        updated_at: new Date(),
      },
    });
    res.json(record);
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

// DELETE /api/attendance/:id - Delete attendance record
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const record = await prisma.attendanceRecord.delete({
      where: { id: req.params.id },
    });
    res.json(record);
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ error: 'Failed to delete attendance' });
  }
});

export default router;
