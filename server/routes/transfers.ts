import express from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';
import { addDays, differenceInDays, format } from 'date-fns';

const router = express.Router();

// POST /api/transfers/preview - Preview transfer (show day mapping)
router.post('/preview', authenticateToken, async (req, res) => {
  try {
    const { beneficiary_id, source_training_id, target_training_id } = req.body;

    if (!beneficiary_id || !source_training_id || !target_training_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get beneficiary
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { teacher_id: beneficiary_id },
    });

    if (!beneficiary) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    // Get source training
    const sourceTraining = await prisma.training.findUnique({
      where: { id: source_training_id },
    });

    if (!sourceTraining) {
      return res.status(404).json({ error: 'Source training not found' });
    }

    // Get target training
    const targetTraining = await prisma.training.findUnique({
      where: { id: target_training_id },
    });

    if (!targetTraining) {
      return res.status(404).json({ error: 'Target training not found' });
    }

    // Check if already enrolled in target
    const existingEnrollment = await prisma.beneficiaryTraining.findUnique({
      where: {
        beneficiary_id_training_id: {
          beneficiary_id,
          training_id: target_training_id,
        },
      },
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Participant is already enrolled in target training' });
    }

    // Get attendance records count
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        training_id: source_training_id,
        beneficiary_id,
      },
      orderBy: { date: 'asc' },
    });

    // Build day mapping
    const sourceStartDate = new Date(sourceTraining.training_start_date);
    const targetStartDate = new Date(targetTraining.training_start_date);
    const targetEndDate = new Date(targetTraining.training_end_date);
    const targetTotalDays = differenceInDays(targetEndDate, targetStartDate) + 1;

    const dayMapping = attendanceRecords.map((record) => {
      const recordDate = new Date(record.date);
      const dayNumber = differenceInDays(recordDate, sourceStartDate) + 1;
      const targetDate = addDays(targetStartDate, dayNumber - 1);
      const willFit = dayNumber <= targetTotalDays;

      return {
        day_number: dayNumber,
        source_date: format(recordDate, 'yyyy-MM-dd'),
        target_date: format(targetDate, 'yyyy-MM-dd'),
        will_transfer: willFit,
      };
    });

    res.json({
      participant: {
        name: beneficiary.name,
        name_english: beneficiary.name_english,
        teacher_id: beneficiary.teacher_id,
      },
      source_training: {
        id: sourceTraining.id,
        training_code: sourceTraining.training_code,
        training_name: sourceTraining.training_name,
        training_name_english: sourceTraining.training_name_english,
        start_date: format(new Date(sourceTraining.training_start_date), 'yyyy-MM-dd'),
        end_date: format(new Date(sourceTraining.training_end_date), 'yyyy-MM-dd'),
      },
      target_training: {
        id: targetTraining.id,
        training_code: targetTraining.training_code,
        training_name: targetTraining.training_name,
        training_name_english: targetTraining.training_name_english,
        start_date: format(new Date(targetTraining.training_start_date), 'yyyy-MM-dd'),
        end_date: format(new Date(targetTraining.training_end_date), 'yyyy-MM-dd'),
      },
      attendance_records_count: attendanceRecords.length,
      records_that_will_transfer: dayMapping.filter((d) => d.will_transfer).length,
      day_mapping: dayMapping,
    });
  } catch (error) {
    console.error('Error previewing transfer:', error);
    res.status(500).json({ error: 'Failed to preview transfer' });
  }
});

// POST /api/transfers/participant - Execute transfer
router.post('/participant', authenticateToken, async (req, res) => {
  try {
    const { beneficiary_id, source_training_id, target_training_id } = req.body;

    if (!beneficiary_id || !source_training_id || !target_training_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get source and target trainings
    const [sourceTraining, targetTraining] = await Promise.all([
      prisma.training.findUnique({ where: { id: source_training_id } }),
      prisma.training.findUnique({ where: { id: target_training_id } }),
    ]);

    if (!sourceTraining || !targetTraining) {
      return res.status(404).json({ error: 'Training not found' });
    }

    // Check if already enrolled in target
    const existingEnrollment = await prisma.beneficiaryTraining.findUnique({
      where: {
        beneficiary_id_training_id: {
          beneficiary_id,
          training_id: target_training_id,
        },
      },
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Participant is already enrolled in target training' });
    }

    // Get the enrollment from source training
    const sourceEnrollment = await prisma.beneficiaryTraining.findUnique({
      where: {
        beneficiary_id_training_id: {
          beneficiary_id,
          training_id: source_training_id,
        },
      },
    });

    if (!sourceEnrollment) {
      return res.status(404).json({ error: 'Enrollment not found in source training' });
    }

    // Calculate date offset
    const sourceStartDate = new Date(sourceTraining.training_start_date);
    const targetStartDate = new Date(targetTraining.training_start_date);
    const targetEndDate = new Date(targetTraining.training_end_date);
    const targetTotalDays = differenceInDays(targetEndDate, targetStartDate) + 1;

    // Get all attendance records
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        training_id: source_training_id,
        beneficiary_id,
      },
    });

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update enrollment record to target training
      await tx.beneficiaryTraining.update({
        where: {
          beneficiary_training_id: sourceEnrollment.beneficiary_training_id,
        },
        data: {
          training_id: target_training_id,
          beneficiary_training_updated_at: new Date(),
        },
      });

      // 2. Delete old attendance records (we'll create new ones with correct dates)
      await tx.attendanceRecord.deleteMany({
        where: {
          training_id: source_training_id,
          beneficiary_id,
        },
      });

      // 3. Create new attendance records with mapped dates
      for (const record of attendanceRecords) {
        const recordDate = new Date(record.date);
        const dayNumber = differenceInDays(recordDate, sourceStartDate) + 1;

        // Only transfer if day fits in target training
        if (dayNumber <= targetTotalDays) {
          const newDate = addDays(targetStartDate, dayNumber - 1);
          newDate.setHours(0, 0, 0, 0);

          // Check if there's already a record for this date in target (shouldn't happen but safety check)
          const existingRecord = await tx.attendanceRecord.findUnique({
            where: {
              training_id_beneficiary_id_date: {
                training_id: target_training_id,
                beneficiary_id,
                date: newDate,
              },
            },
          });

          if (!existingRecord) {
            await tx.attendanceRecord.create({
              data: {
                training_id: target_training_id,
                beneficiary_id,
                date: newDate,
                morning_in: record.morning_in,
                morning_out: record.morning_out,
                afternoon_in: record.afternoon_in,
                afternoon_out: record.afternoon_out,
                session_attendance_status: record.session_attendance_status,
                manual_entry: true,
                manual_marked_by: req.user?.userId,
                manual_marked_by_name: req.user?.name,
                manual_entry_reason: `Transferred from ${sourceTraining.training_code}`,
                location_lat: record.location_lat,
                location_lng: record.location_lng,
                location_accuracy: record.location_accuracy,
                device: record.device,
              },
            });
          }
        }
      }

      // 4. Update participant counts
      await tx.training.update({
        where: { id: source_training_id },
        data: {
          current_participants: {
            decrement: 1,
          },
        },
      });

      await tx.training.update({
        where: { id: target_training_id },
        data: {
          current_participants: {
            increment: 1,
          },
        },
      });
    });

    res.json({
      message: 'Transfer completed successfully',
      transferred_attendance_records: attendanceRecords.filter((r) => {
        const dayNumber = differenceInDays(new Date(r.date), sourceStartDate) + 1;
        return dayNumber <= targetTotalDays;
      }).length,
      total_original_records: attendanceRecords.length,
    });
  } catch (error) {
    console.error('Error executing transfer:', error);
    res.status(500).json({ error: 'Failed to execute transfer' });
  }
});

// GET /api/transfers/available-trainings - Get trainings available for transfer
router.get('/available-trainings', authenticateToken, async (req, res) => {
  try {
    const { exclude_training_id } = req.query;

    const trainings = await prisma.training.findMany({
      where: {
        training_is_deleted: false,
        training_status: {
          in: ['ONGOING', 'DRAFT'],
        },
        id: {
          not: exclude_training_id as string,
        },
      },
      select: {
        id: true,
        training_code: true,
        training_name: true,
        training_name_english: true,
        training_start_date: true,
        training_end_date: true,
        training_status: true,
        max_participants: true,
        current_participants: true,
      },
      orderBy: { training_start_date: 'desc' },
    });

    res.json(trainings);
  } catch (error) {
    console.error('Error fetching available trainings:', error);
    res.status(500).json({ error: 'Failed to fetch available trainings' });
  }
});

export default router;
