import express from 'express';
import prisma from '../db';
import { hashPassword, verifyPassword } from '../utils/auth';
import { generateToken } from '../utils/jwt';

const router = express.Router();

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      teacherId: user.teacher_id || undefined,
    });

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/register - User registration (admin only)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, name, phone, teacher_id, school, school_id, province_name } = req.body;

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Validate password
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role || 'BENEFICIARY',
        name,
        phone,
        teacher_id,
        school,
        school_id,
        province_name,
      },
    });

    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      teacherId: user.teacher_id || undefined,
    });

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/verify - Verify token validity
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // We'll let the authenticateToken middleware handle this
    // But for this endpoint, we need to verify manually
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    try {
      const decoded = jwt.verify(token, secret);
      res.json({ valid: true, user: decoded });
    } catch (error) {
      res.status(401).json({ valid: false, error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', async (req, res) => {
  try {
    // This should be protected by authenticateToken middleware
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    const decoded = jwt.verify(token, secret) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        name: true,
        phone: true,
        profile_image_url: true,
        teacher_id: true,
        school: true,
        school_id: true,
        province_name: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

export default router;
