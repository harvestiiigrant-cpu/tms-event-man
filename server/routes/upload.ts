import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Ensure upload directories exist
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
const profilesDir = path.join(uploadsDir, 'profiles');
const signaturesDir = path.join(uploadsDir, 'signatures');

[uploadsDir, profilesDir, signaturesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for different upload types
const createStorage = (folder: string) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(uploadsDir, folder));
    },
    filename: (req, file, cb) => {
      const userId = req.user?.userId || 'unknown';
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      cb(null, `user-${userId}-${timestamp}${ext}`);
    },
  });

const profileUpload = multer({
  storage: createStorage('profiles'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, JPG, WEBP allowed.'));
    }
  },
});

const signatureUpload = multer({
  storage: createStorage('signatures'),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, JPG, WEBP allowed.'));
    }
  },
});

// POST /api/upload/profile-image - Upload profile image
router.post('/profile-image', authenticateToken, profileUpload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const url = `/uploads/profiles/${req.file.filename}`;

    res.json({
      success: true,
      url,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
});

// POST /api/upload/signature - Upload signature
router.post('/signature', authenticateToken, signatureUpload.single('signature'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const url = `/uploads/signatures/${req.file.filename}`;

    res.json({
      success: true,
      url,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error('Signature upload error:', error);
    res.status(500).json({ error: 'Failed to upload signature' });
  }
});

// DELETE /api/upload - Delete uploaded file
router.delete('/', authenticateToken, (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !url.startsWith('/uploads/')) {
      return res.status(400).json({ error: 'Invalid file URL' });
    }

    const filePath = path.join(process.cwd(), 'public', url);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'File deleted' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
