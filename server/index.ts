import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import trainingRoutes from './routes/trainings';
import beneficiaryRoutes from './routes/beneficiaries';
import authRoutes from './routes/auth';
import attendanceRoutes from './routes/attendance';
import enrollmentRoutes from './routes/enrollments';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/enrollments', enrollmentRoutes);

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
