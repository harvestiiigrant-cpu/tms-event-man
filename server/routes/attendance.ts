import express from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';
import { addDays, differenceInDays, format, parseISO } from 'date-fns';

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

// GET /api/attendance/grid/:trainingId - Get full attendance grid data
router.get('/grid/:trainingId', authenticateToken, async (req, res) => {
  try {
    const { trainingId } = req.params;

    // Get training details
    const training = await prisma.training.findUnique({
      where: { id: trainingId },
    });

    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    // Calculate days from training start to end
    const startDate = new Date(training.training_start_date);
    const endDate = new Date(training.training_end_date);
    const totalDays = differenceInDays(endDate, startDate) + 1;

    // Generate days array
    const days = [];
    for (let i = 0; i < totalDays; i++) {
      const dayDate = addDays(startDate, i);
      days.push({
        day_number: i + 1,
        date: format(dayDate, 'yyyy-MM-dd'),
      });
    }

    // Get all enrolled participants
    const enrollments = await prisma.beneficiaryTraining.findMany({
      where: { training_id: trainingId },
      include: {
        beneficiary: true,
      },
      orderBy: {
        beneficiary: { name: 'asc' },
      },
    });

    // Get all attendance records for this training
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { training_id: trainingId },
    });

    // Build attendance map: beneficiary_id -> date -> record
    const attendanceMap: Record<string, Record<string, any>> = {};
    for (const record of attendanceRecords) {
      const beneficiaryId = record.beneficiary_id;
      const dateStr = format(new Date(record.date), 'yyyy-MM-dd');

      if (!attendanceMap[beneficiaryId]) {
        attendanceMap[beneficiaryId] = {};
      }

      attendanceMap[beneficiaryId][dateStr] = {
        id: record.id,
        morning_in: record.morning_in ? format(new Date(record.morning_in), 'HH:mm') : null,
        morning_out: record.morning_out ? format(new Date(record.morning_out), 'HH:mm') : null,
        afternoon_in: record.afternoon_in ? format(new Date(record.afternoon_in), 'HH:mm') : null,
        afternoon_out: record.afternoon_out ? format(new Date(record.afternoon_out), 'HH:mm') : null,
        status: record.session_attendance_status,
      };
    }

    // Build participants array
    const participants = enrollments.map((enrollment) => ({
      beneficiary_id: enrollment.beneficiary_id,
      name: enrollment.beneficiary.name,
      name_english: enrollment.beneficiary.name_english,
      teacher_id: enrollment.beneficiary.teacher_id,
      training_role: enrollment.training_role,
      attendance: attendanceMap[enrollment.beneficiary_id] || {},
    }));

    res.json({
      training: {
        id: training.id,
        training_code: training.training_code,
        training_name: training.training_name,
        training_name_english: training.training_name_english,
        training_start_date: format(startDate, 'yyyy-MM-dd'),
        training_end_date: format(endDate, 'yyyy-MM-dd'),
        training_status: training.training_status,
      },
      days,
      participants,
    });
  } catch (error) {
    console.error('Error fetching attendance grid:', error);
    res.status(500).json({ error: 'Failed to fetch attendance grid' });
  }
});

// POST /api/attendance/bulk - Bulk create/update attendance records
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { training_id, records, manual_entry_reason } = req.body;
    const userId = req.user?.userId;
    const userName = req.user?.name;

    if (!training_id || !records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Missing training_id or records' });
    }

    // Verify training exists
    const training = await prisma.training.findUnique({
      where: { id: training_id },
    });

    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    const results = [];

    for (const record of records) {
      const { beneficiary_id, date, morning_in, morning_out, afternoon_in, afternoon_out, session_attendance_status } = record;

      if (!beneficiary_id || !date) {
        continue;
      }

      const recordDate = new Date(date);
      recordDate.setHours(0, 0, 0, 0);

      // Helper to parse time string to Date
      const parseTime = (timeStr: string | null, baseDate: Date): Date | null => {
        if (!timeStr) return null;
        const [hours, minutes] = timeStr.split(':').map(Number);
        const result = new Date(baseDate);
        result.setHours(hours, minutes, 0, 0);
        return result;
      };

      const data = {
        session_attendance_status: session_attendance_status || 'PRESENT',
        morning_in: parseTime(morning_in, recordDate),
        morning_out: parseTime(morning_out, recordDate),
        afternoon_in: parseTime(afternoon_in, recordDate),
        afternoon_out: parseTime(afternoon_out, recordDate),
        manual_entry: true,
        manual_marked_by: userId,
        manual_marked_by_name: userName,
        manual_entry_reason: manual_entry_reason || 'Bulk entry via attendance grid',
        updated_at: new Date(),
      };

      // Upsert: create if not exists, update if exists
      const result = await prisma.attendanceRecord.upsert({
        where: {
          training_id_beneficiary_id_date: {
            training_id,
            beneficiary_id,
            date: recordDate,
          },
        },
        create: {
          training_id,
          beneficiary_id,
          date: recordDate,
          ...data,
        },
        update: data,
      });

      results.push(result);
    }

    res.json({
      message: `Successfully updated ${results.length} attendance records`,
      count: results.length,
    });
  } catch (error) {
    console.error('Error bulk updating attendance:', error);
    res.status(500).json({ error: 'Failed to bulk update attendance' });
  }
});

export default router;
