import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import trainingRoutes from './routes/trainings';
import beneficiaryRoutes from './routes/beneficiaries';
import authRoutes from './routes/auth';
import attendanceRoutes from './routes/attendance';
import enrollmentRoutes from './routes/enrollments';
import agendaRoutes from './routes/agendas';
import materialRoutes from './routes/materials';
import transferRoutes from './routes/transfers';
import categoryRoutes from './routes/categories';
import typeRoutes from './routes/types';
import positionRoutes from './routes/positions';
import departmentRoutes from './routes/departments';
import surveyRoutes from './routes/surveys';
import surveyResponseRoutes from './routes/survey-responses';
import uploadRoutes from './routes/upload';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
// Development: Allow all origins
// Production: Set ALLOWED_ORIGINS in environment
if (process.env.NODE_ENV === 'production' && process.env.ALLOWED_ORIGINS) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
  }));
} else {
  // Development: Allow all
  app.use(cors());
}

app.use(express.json());

// Serve static files from public directory (for uploaded materials)
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api', agendaRoutes);  // Handles /api/trainings/:id/agendas and /api/agendas
app.use('/api', materialRoutes);  // Handles /api/materials and /api/trainings/:id/materials
app.use('/api/transfers', transferRoutes);  // Handles participant transfers
app.use('/api/categories', categoryRoutes);  // Training categories management
app.use('/api/types', typeRoutes);  // Training types management
app.use('/api/positions', positionRoutes);  // Beneficiary positions management
app.use('/api/departments', departmentRoutes);  // Beneficiary departments management
app.use('/api/surveys', surveyRoutes);  // Survey and test management
app.use('/api/surveys', surveyResponseRoutes);  // Survey responses and results
app.use('/api/upload', uploadRoutes);  // File uploads (profiles, signatures)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling (must be after routes)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
});
