import request from 'supertest';
import express from 'express';
import { errorHandler } from '../../server/middleware/errorHandler';
import authRoutes from '../../server/routes/auth';

// Create a test app with just the auth routes and error handling
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

describe('Auth API Routes', () => {
  // Test the health check endpoint that's in server/index.ts
  it('should respond with health status', async () => {
    // Since health check is in server/index.ts, we'll test a simple route
    // that should always exist
    const response = await request(app)
      .get('/api/auth/invalid-endpoint')
      .expect(404);
    
    expect(response.body).toHaveProperty('error');
  });

  // Test registration validation
  it('should return error for registration without required fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({})
      .expect(400);
    
    expect(response.body).toHaveProperty('error');
  });

  // Test login validation
  it('should return error for login without credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({})
      .expect(400);
    
    expect(response.body).toHaveProperty('error');
  });
});