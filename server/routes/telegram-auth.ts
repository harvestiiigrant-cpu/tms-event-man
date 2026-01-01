import express from 'express';
import prisma from '../db';
import { generateToken } from '../utils/jwt';
import { validateInitData, parseInitData } from '../utils/telegram';

const router = express.Router();

/**
 * POST /api/auth/telegram-login
 * Authenticate user via Telegram WebApp
 *
 * Request body:
 * {
 *   "initData": "string from Telegram.WebApp.initData"
 *   "teacher_id": "optional - for linking to existing beneficiary"
 * }
 */
router.post('/telegram-login', async (req, res) => {
  try {
    const { initData, teacher_id } = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!initData || !botToken) {
      return res.status(400).json({
        error: 'Missing initData or bot token not configured'
      });
    }

    // Validate Telegram initData signature
    const isValid = validateInitData(initData, botToken);
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid Telegram data signature'
      });
    }

    // Parse Telegram user data
    const telegramUser = parseInitData(initData);
    if (!telegramUser) {
      return res.status(400).json({
        error: 'Failed to parse Telegram user data'
      });
    }

    // Find or create TelegramUser
    let telegramUserRecord = await prisma.telegramUser.findUnique({
      where: { telegram_id: BigInt(telegramUser.telegram_id) },
      include: { beneficiary: true },
    });

    if (!telegramUserRecord) {
      // If no existing record, check if teacher_id is provided
      if (!teacher_id) {
        return res.status(400).json({
          error: 'New Telegram user detected. Please provide teacher_id to link account.',
          telegram_id: telegramUser.telegram_id,
          username: telegramUser.username,
          first_name: telegramUser.first_name,
        });
      }

      // Verify the beneficiary exists
      const beneficiary = await prisma.beneficiary.findUnique({
        where: { teacher_id },
      });

      if (!beneficiary) {
        return res.status(404).json({
          error: 'Beneficiary not found',
          teacher_id,
        });
      }

      // Create new TelegramUser
      telegramUserRecord = await prisma.telegramUser.create({
        data: {
          telegram_id: BigInt(telegramUser.telegram_id),
          teacher_id,
          username: telegramUser.username,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          language_code: telegramUser.language_code,
        },
        include: { beneficiary: true },
      });
    }

    if (!telegramUserRecord.beneficiary) {
      return res.status(404).json({
        error: 'Associated beneficiary not found',
      });
    }

    // Generate JWT token for API access
    const token = generateToken({
      userId: `telegram_${telegramUserRecord.id}`,
      username: telegramUserRecord.username || `telegram_user_${telegramUserRecord.telegram_id}`,
      email: `telegram_${telegramUserRecord.telegram_id}@tms.local`,
      role: 'BENEFICIARY',
      teacherId: telegramUserRecord.teacher_id,
    });

    // Return token and user info
    res.json({
      success: true,
      token,
      user: {
        id: telegramUserRecord.id,
        telegram_id: telegramUserRecord.telegram_id.toString(),
        teacher_id: telegramUserRecord.teacher_id,
        username: telegramUserRecord.username,
        first_name: telegramUserRecord.first_name,
        last_name: telegramUserRecord.last_name,
        beneficiary: {
          teacher_id: telegramUserRecord.beneficiary.teacher_id,
          name: telegramUserRecord.beneficiary.name,
          name_english: telegramUserRecord.beneficiary.name_english,
          phone: telegramUserRecord.beneficiary.phone,
          school: telegramUserRecord.beneficiary.school,
          province_name: telegramUserRecord.beneficiary.province_name,
          profile_image_url: telegramUserRecord.beneficiary.profile_image_url,
        },
      },
    });
  } catch (error) {
    console.error('Telegram login error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/auth/telegram-link
 * Link an existing Telegram user to a beneficiary account
 * Called when a new Telegram user tries to login
 */
router.post('/telegram-link', async (req, res) => {
  try {
    const { telegram_id, teacher_id, phone, email } = req.body;

    if (!telegram_id) {
      return res.status(400).json({
        error: 'telegram_id is required'
      });
    }

    // Try to find beneficiary by teacher_id, phone, or email
    let beneficiary;

    if (teacher_id) {
      beneficiary = await prisma.beneficiary.findUnique({
        where: { teacher_id },
      });
    } else if (phone || email) {
      beneficiary = await prisma.beneficiary.findFirst({
        where: {
          OR: [
            phone ? { phone } : undefined,
            email ? { phone: email } : undefined, // Email might be stored in phone field
          ].filter(Boolean),
        },
      });
    }

    if (!beneficiary) {
      return res.status(404).json({
        error: 'No matching beneficiary found',
        hint: 'Try providing teacher_id, phone, or email',
      });
    }

    // Create the link
    const telegramUserRecord = await prisma.telegramUser.upsert({
      where: { telegram_id: BigInt(telegram_id) },
      create: {
        telegram_id: BigInt(telegram_id),
        teacher_id: beneficiary.teacher_id,
      },
      update: {
        teacher_id: beneficiary.teacher_id,
      },
      include: { beneficiary: true },
    });

    res.json({
      success: true,
      message: 'Account linked successfully',
      user: {
        telegram_id: telegramUserRecord.telegram_id.toString(),
        teacher_id: telegramUserRecord.teacher_id,
        beneficiary: beneficiary.name,
      },
    });
  } catch (error) {
    console.error('Telegram link error:', error);
    res.status(500).json({
      error: 'Failed to link account',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
