# Training Management System - Production Roadmap

## Executive Summary
**Current State:** 70% UI Complete, 30% Backend Complete
**Production Ready:** Estimated 6-9 weeks (340-520 hours)
**Critical Blockers:** Database not deployed, Mock data dependency, No authentication security

---

## 🚨 CRITICAL PRIORITIES (Week 1-2)

### 1. Database Migration & Seeding ⏱️ 3-5 days
**Status:** Schema defined in Prisma but migrations not run

**Tasks:**
- [ ] Run `npx prisma migrate dev --name init` to create initial migration
- [ ] Verify PostgreSQL connection in Docker
- [ ] Create seed data for:
  - [ ] Training categories (MATH, KHMER, IT, PEDAGOGY, LEADERSHIP)
  - [ ] Training types (WORKSHOP, COURSE, SEMINAR)
  - [ ] Training levels (NATIONAL, PROVINCIAL, DISTRICT, CLUSTER, SCHOOL)
  - [ ] Demo beneficiaries (at least 50 teachers)
  - [ ] Demo trainings (at least 10-15 ongoing trainings)
  - [ ] Demo enrollments and attendance records
- [ ] Test seed script: `npx prisma db seed`
- [ ] Verify data in database with Prisma Studio

**Files to Update:**
- `prisma/seed.ts` - Complete seed implementation
- `.env` - Ensure DATABASE_URL is correct

---

### 2. Authentication Security ⏱️ 4-6 days
**Status:** ❌ PLAINTEXT PASSWORDS (Development only)

**Tasks:**
- [ ] Install bcrypt: `npm install bcryptjs @types/bcryptjs`
- [ ] Install JWT: `npm install jsonwebtoken @types/jsonwebtoken`
- [ ] Create password hashing utilities in `server/utils/auth.ts`:
  ```typescript
  export const hashPassword = async (password: string) => {
    return bcrypt.hash(password, 10);
  };
  export const verifyPassword = async (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
  };
  ```
- [ ] Create JWT middleware in `server/middleware/auth.ts`:
  ```typescript
  export const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      req.user = user;
      next();
    });
  };
  ```
- [ ] Update login endpoint to return JWT token
- [ ] Update register endpoint to hash passwords
- [ ] Add JWT verification to all protected routes
- [ ] Update frontend to store JWT token (not plain session)
- [ ] Add token refresh mechanism
- [ ] Add password requirements validation (min 8 chars, uppercase, number, special char)

**Environment Variables:**
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

---

### 3. Complete Beneficiary API Endpoints ⏱️ 3-4 days
**Status:** ❌ Only GET endpoints exist (No CREATE/UPDATE/DELETE)

**Tasks:**
- [ ] Add to `server/routes/beneficiaries.ts`:

```typescript
// POST /api/beneficiaries - Create beneficiary
router.post('/', authenticateToken, async (req, res) => {
  try {
    const beneficiary = await prisma.beneficiary.create({
      data: {
        ...req.body,
        created_by: req.user.teacher_id,
      },
    });
    res.status(201).json(beneficiary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create beneficiary' });
  }
});

// PUT /api/beneficiaries/:id - Update beneficiary
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const beneficiary = await prisma.beneficiary.update({
      where: { teacher_id: req.params.id },
      data: {
        ...req.body,
        updated_by: req.user.teacher_id,
        updated_at: new Date(),
      },
    });
    res.json(beneficiary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update beneficiary' });
  }
});

// DELETE /api/beneficiaries/:id - Soft delete
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const beneficiary = await prisma.beneficiary.update({
      where: { teacher_id: req.params.id },
      data: {
        is_deleted: true,
        updated_by: req.user.teacher_id,
        updated_at: new Date(),
      },
    });
    res.json(beneficiary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete beneficiary' });
  }
});

// POST /api/beneficiaries/bulk-import - CSV/Excel import
router.post('/bulk-import', authenticateToken, async (req, res) => {
  // TODO: Implement CSV parsing and bulk insert
});
```

- [ ] Update `src/lib/api.ts` to include new methods
- [ ] Update `src/pages/Beneficiaries.tsx` to use real API calls
- [ ] Remove mock data dependency

---

### 4. Complete Attendance API Endpoints ⏱️ 4-5 days
**Status:** ❌ NO API ENDPOINTS (100% mock data)

**Tasks:**
- [ ] Create `server/routes/attendance.ts`:

```typescript
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
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

export default router;
```

- [ ] Add route to `server/index.ts`: `app.use('/api/attendance', attendanceRoutes);`
- [ ] Update `src/lib/api.ts` with attendance methods
- [ ] Update `src/pages/Attendance.tsx` to use API
- [ ] Update `src/pages/portal/AttendanceCheckin.tsx` to POST to API
- [ ] Test GPS location capture and storage

---

### 5. Enrollment API & Workflow ⏱️ 3-4 days
**Status:** ❌ Form submits but data is lost

**Tasks:**
- [ ] Create `server/routes/enrollments.ts`:

```typescript
// POST /api/enrollments - Enroll beneficiary in training(s)
router.post('/', async (req, res) => {
  try {
    const { beneficiary_id, training_ids, registration_method } = req.body;

    // Validate beneficiary exists
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { teacher_id: beneficiary_id },
    });
    if (!beneficiary) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    // Create enrollments for each training
    const enrollments = await Promise.all(
      training_ids.map(async (training_id: string) => {
        // Check for existing enrollment
        const existing = await prisma.beneficiaryTraining.findUnique({
          where: {
            beneficiary_id_training_id: { beneficiary_id, training_id },
          },
        });

        if (existing) {
          throw new Error(`Already enrolled in training ${training_id}`);
        }

        // Check capacity
        const training = await prisma.training.findUnique({
          where: { id: training_id },
        });

        if (!training) {
          throw new Error(`Training ${training_id} not found`);
        }

        if (training.current_participants >= training.max_participants) {
          throw new Error(`Training ${training_id} is full`);
        }

        // Create enrollment
        const enrollment = await prisma.beneficiaryTraining.create({
          data: {
            beneficiary_id,
            training_id,
            registration_date: new Date(),
            registration_method: registration_method || 'MANUAL',
            attendance_status: 'REGISTERED',
            training_role: 'PARTICIPANT',
            enrollment_type: 'SELF',
            beneficiary_training_status: 'ACTIVE',
          },
        });

        // Increment participant count
        await prisma.training.update({
          where: { id: training_id },
          data: {
            current_participants: { increment: 1 },
          },
        });

        return enrollment;
      })
    );

    res.status(201).json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

- [ ] Add route to server
- [ ] Update `src/pages/PublicEnrollment.tsx` to POST to API
- [ ] Add success/error notifications with real feedback

---

## 📊 HIGH PRIORITIES (Week 3-4)

### 6. File Upload System ⏱️ 3-5 days
**Status:** ❌ Data URLs only (temporary, in-memory)

**Options:**

**Option A: Local File Storage (Simpler)**
- [ ] Install multer: `npm install multer @types/multer`
- [ ] Create upload middleware in `server/middleware/upload.ts`
- [ ] Create `public/uploads/` directory structure:
  - `/profiles/` - Profile photos
  - `/signatures/` - Digital signatures
  - `/certificates/` - Generated certificates
- [ ] Add endpoint `POST /api/upload/profile`
- [ ] Add endpoint `POST /api/upload/signature`
- [ ] Update Beneficiary model to store file paths
- [ ] Serve static files via Express

**Option B: Cloud Storage (Recommended for Production)**
- [ ] Choose cloud provider (AWS S3, Google Cloud Storage, Cloudinary)
- [ ] Install SDK (e.g., `@aws-sdk/client-s3`)
- [ ] Create upload service in `server/services/storage.ts`
- [ ] Add pre-signed URL generation for secure downloads
- [ ] Store URLs in database

**Tasks:**
- [ ] Add virus scanning (ClamAV or cloud service)
- [ ] Add image optimization (sharp library)
- [ ] Add file size limits (2MB for profile, 500KB for signature)
- [ ] Add file type validation (JPEG, PNG only)
- [ ] Update frontend upload components to use real endpoints

---

### 7. Error Handling & Validation ⏱️ 3-4 days

**Tasks:**
- [ ] Create global error handler middleware:

```typescript
// server/middleware/errorHandler.ts
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
```

- [ ] Add input validation middleware (express-validator or Zod)
- [ ] Add request logging (morgan)
- [ ] Create custom error classes (NotFoundError, ValidationError, etc.)
- [ ] Add error boundary in React (react-error-boundary)
- [ ] Add retry logic in API client
- [ ] Add timeout handling (10s default)

---

### 8. Settings Management API ⏱️ 2-3 days
**Status:** ❌ UI works but saves to localStorage only

**Tasks:**
- [ ] Create `server/routes/settings.ts`:
  - `GET /api/settings` - Get all settings
  - `GET /api/settings/:key` - Get specific setting
  - `PUT /api/settings/:key` - Update setting
  - `POST /api/settings/categories` - CRUD for training categories
  - `POST /api/settings/types` - CRUD for training types
  - `POST /api/settings/levels` - CRUD for training levels
- [ ] Update `src/pages/Settings.tsx` to use API
- [ ] Remove localStorage dependency
- [ ] Add permission checks (SUPER_ADMIN only)

---

## 🎯 MEDIUM PRIORITIES (Week 5-6)

### 9. Notification System ⏱️ 4-6 days

**Email Notifications:**
- [ ] Choose email service (SendGrid, AWS SES, Mailgun, Nodemailer)
- [ ] Install email SDK
- [ ] Create email templates:
  - Welcome email
  - Training enrollment confirmation
  - Training reminder (1 day before)
  - Attendance reminder
  - Certificate ready
  - Password reset
- [ ] Create email service in `server/services/email.ts`
- [ ] Add email queue (Bull + Redis for background jobs)
- [ ] Add email notification preferences to User model

**SMS Notifications (Important for Cambodia):**
- [ ] Research Cambodian SMS providers (Smart Axiata, Cellcard, Metfone)
- [ ] Integrate SMS API
- [ ] Create SMS templates (shorter versions of emails)
- [ ] Add phone number verification

**In-App Notifications:**
- [ ] Create Notification model in Prisma schema
- [ ] Add bell icon with unread count
- [ ] Create notification panel
- [ ] Add real-time updates (Socket.io or polling)

---

### 10. Reporting & Analytics ⏱️ 4-5 days

**Export Functionality:**
- [ ] Install excel library: `npm install exceljs`
- [ ] Install PDF library: `npm install pdfkit`
- [ ] Create export endpoints:
  - `GET /api/reports/trainings/export?format=csv` - Export trainings list
  - `GET /api/reports/beneficiaries/export?format=csv` - Export beneficiaries
  - `GET /api/reports/attendance/export?trainingId=xxx&format=pdf` - Attendance sheet
  - `GET /api/reports/certificates/:enrollmentId/pdf` - Certificate PDF
- [ ] Add export buttons to Trainings, Beneficiaries, Attendance pages
- [ ] Design PDF templates (use pdfkit or puppeteer)

**Analytics Dashboard:**
- [ ] Create real analytics queries:
  - Training completion rate by category
  - Average attendance percentage
  - Beneficiary growth over time
  - Province-wise distribution
  - Training capacity utilization
- [ ] Replace mock charts with real data
- [ ] Add date range filters
- [ ] Add drill-down capabilities

---

### 11. Testing Infrastructure ⏱️ 5-7 days
**Status:** ❌ ZERO test coverage

**Backend Testing:**
- [ ] Install testing tools: `npm install --save-dev jest @types/jest ts-jest supertest @types/supertest`
- [ ] Configure Jest for Node.js
- [ ] Create test database configuration
- [ ] Write API tests for:
  - [ ] Auth endpoints (login, register, token refresh)
  - [ ] Training CRUD
  - [ ] Beneficiary CRUD
  - [ ] Enrollment flow
  - [ ] Attendance check-in
- [ ] Add test coverage threshold (>80%)

**Frontend Testing:**
- [ ] Install: `npm install --save-dev vitest @testing-library/react @testing-library/jest-dom`
- [ ] Write component tests:
  - [ ] Login form
  - [ ] Training form
  - [ ] Beneficiary form
  - [ ] Attendance check-in
- [ ] Write integration tests for critical flows
- [ ] Add E2E tests with Playwright or Cypress

**CI/CD:**
- [ ] Create `.github/workflows/test.yml` for automated testing
- [ ] Run tests on every PR
- [ ] Add build status badge to README

---

### 12. Certificate Generation ⏱️ 3-4 days

**Tasks:**
- [ ] Design certificate template (PDF)
- [ ] Create certificate generator service using pdfkit or puppeteer
- [ ] Add fields: Name, Training Name, Dates, Certificate Number, QR Code
- [ ] Store certificate metadata in BeneficiaryTraining model
- [ ] Create endpoint: `POST /api/certificates/generate/:enrollmentId`
- [ ] Create endpoint: `GET /api/certificates/:certificateNumber/verify` (public)
- [ ] Add "Download Certificate" button to training history
- [ ] Add Khmer font support for certificates

---

## 🔧 IMPROVEMENTS & POLISH (Week 7-8)

### 13. Multi-language Support (i18n) ⏱️ 3-4 days

**Tasks:**
- [ ] Install react-i18next: `npm install react-i18next i18next`
- [ ] Create translation files:
  - `public/locales/en/translation.json`
  - `public/locales/km/translation.json`
- [ ] Extract all hardcoded strings
- [ ] Replace strings with `t()` function
- [ ] Add language switcher to header
- [ ] Store language preference in user settings
- [ ] Add date/time localization (date-fns with locales)

---

### 14. Performance Optimization ⏱️ 3-4 days

**Frontend:**
- [ ] Add React.memo() to expensive components
- [ ] Implement virtual scrolling for large tables (react-virtual)
- [ ] Add pagination to all lists (100 items per page)
- [ ] Lazy load images (react-lazy-load-image-component)
- [ ] Code splitting for routes (React.lazy)
- [ ] Optimize bundle size (analyze with vite-bundle-visualizer)

**Backend:**
- [ ] Add database indexes on frequently queried fields:
  - Beneficiary: teacher_id, phone, province_name
  - Training: training_status, training_start_date
  - AttendanceRecord: training_id + date
- [ ] Add Redis caching for:
  - Training categories, types, levels
  - User sessions
  - Dashboard statistics
- [ ] Add API rate limiting (express-rate-limit)
- [ ] Add compression middleware (compression)
- [ ] Add database query optimization (use Prisma's select to fetch only needed fields)

---

### 15. Mobile App Enhancements ⏱️ 2-3 days

**Progressive Web App (PWA):**
- [ ] Add service worker for offline support
- [ ] Add manifest.json for "Add to Home Screen"
- [ ] Add offline page
- [ ] Cache static assets
- [ ] Add push notification support

**Mobile-Specific Features:**
- [ ] Test GPS accuracy on various devices
- [ ] Add camera integration for profile photo (instead of file picker)
- [ ] Add QR code scanner for check-in (html5-qrcode)
- [ ] Optimize touch targets (minimum 44x44px)
- [ ] Test on iOS and Android devices

---

### 16. Security Hardening ⏱️ 3-4 days

**Tasks:**
- [ ] Add helmet.js for security headers
- [ ] Add CSRF protection (csurf)
- [ ] Add CORS whitelist (restrict to specific domains)
- [ ] Add SQL injection protection (Prisma ORM already helps, but validate)
- [ ] Add XSS protection (sanitize HTML inputs)
- [ ] Add rate limiting on login endpoint (5 attempts per 15 minutes)
- [ ] Add password reset flow:
  - Request reset (email verification)
  - Generate secure token (crypto.randomBytes)
  - Send reset email with expiring link
  - Verify token and update password
- [ ] Add 2FA/MFA (optional, using speakeasy + qrcode)
- [ ] Add audit logging:
  - Log all login attempts
  - Log all data modifications (who, what, when)
  - Store in separate audit_logs table
- [ ] Add HTTPS enforcement (redirect HTTP → HTTPS)
- [ ] Add Content Security Policy headers
- [ ] Run security scan (npm audit, Snyk)

---

### 17. Monitoring & Logging ⏱️ 2-3 days

**Application Monitoring:**
- [ ] Add Winston logger for structured logging
- [ ] Log to files (error.log, combined.log)
- [ ] Add request ID to all logs
- [ ] Add error tracking (Sentry or Rollbar)
- [ ] Add performance monitoring (New Relic or Datadog)

**Infrastructure Monitoring:**
- [ ] Add health check endpoint: `GET /health`
- [ ] Add readiness probe: `GET /ready`
- [ ] Monitor database connection pool
- [ ] Add uptime monitoring (UptimeRobot or Pingdom)
- [ ] Set up alerts for:
  - API errors >10/min
  - Database connection failures
  - Disk space >80%
  - Memory usage >90%

---

### 18. Documentation ⏱️ 2-3 days

**API Documentation:**
- [ ] Install Swagger: `npm install swagger-ui-express swagger-jsdoc`
- [ ] Document all API endpoints with JSDoc comments
- [ ] Generate Swagger UI at `/api-docs`
- [ ] Add request/response examples
- [ ] Add authentication instructions

**User Documentation:**
- [ ] Create admin user guide (how to create trainings, manage beneficiaries)
- [ ] Create beneficiary user guide (how to enroll, check attendance)
- [ ] Create FAQ page
- [ ] Add in-app help tooltips

**Developer Documentation:**
- [ ] Update README.md with:
  - Setup instructions
  - Environment variables
  - Database schema diagram
  - Architecture overview
  - Contributing guidelines
- [ ] Add CHANGELOG.md
- [ ] Add LICENSE file

---

## 🚀 DEPLOYMENT (Week 9)

### 19. Production Deployment ⏱️ 3-5 days

**Environment Setup:**
- [ ] Create production environment variables
- [ ] Set up production database (managed PostgreSQL on AWS RDS, Google Cloud SQL, or DigitalOcean)
- [ ] Set up Redis instance (managed or ElastiCache)
- [ ] Configure production email service
- [ ] Configure production file storage (S3 or equivalent)

**Docker & Kubernetes (if using):**
- [ ] Optimize Dockerfile (multi-stage build)
- [ ] Create docker-compose.prod.yml
- [ ] Create Kubernetes manifests:
  - Deployment
  - Service
  - Ingress
  - ConfigMap
  - Secrets
- [ ] Set up Helm charts (optional)

**CI/CD Pipeline:**
- [ ] Create GitHub Actions workflow:
  ```yaml
  name: Deploy to Production
  on:
    push:
      branches: [main]
  jobs:
    test:
      - Run tests
      - Run linting
    build:
      - Build Docker image
      - Push to registry
    deploy:
      - Deploy to production
      - Run database migrations
      - Health check
  ```

**Domain & SSL:**
- [ ] Purchase domain name
- [ ] Configure DNS records
- [ ] Set up SSL certificate (Let's Encrypt or cloud provider)
- [ ] Configure HTTPS redirect

**Backup & Disaster Recovery:**
- [ ] Set up automated database backups (daily)
- [ ] Test backup restoration process
- [ ] Document disaster recovery plan
- [ ] Set up database replication (optional, for high availability)

---

## 📈 POST-LAUNCH (Ongoing)

### 20. Monitoring & Iteration

**Week 1-2 Post-Launch:**
- [ ] Monitor error rates closely
- [ ] Monitor user feedback
- [ ] Fix critical bugs
- [ ] Optimize slow queries
- [ ] Add missing features based on user requests

**Month 1:**
- [ ] Analyze usage patterns
- [ ] Optimize based on metrics
- [ ] Add requested features
- [ ] Improve performance bottlenecks

**Month 3:**
- [ ] Review security audit
- [ ] Scale infrastructure if needed
- [ ] Plan feature roadmap
- [ ] Gather user satisfaction surveys

---

## 📊 EFFORT SUMMARY

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Critical (Week 1-2)** | 2 weeks | Database, Auth, Core APIs |
| **High Priority (Week 3-4)** | 2 weeks | Files, Errors, Settings |
| **Medium Priority (Week 5-6)** | 2 weeks | Notifications, Reports, Tests |
| **Improvements (Week 7-8)** | 2 weeks | i18n, Performance, Security |
| **Deployment (Week 9)** | 1 week | Production setup, CI/CD |
| **TOTAL** | **9 weeks** | **340-520 hours** |

---

## 🎯 SUCCESS METRICS

**Before Launch:**
- [ ] All critical bugs fixed
- [ ] Test coverage >80%
- [ ] All API endpoints functional
- [ ] Security audit passed
- [ ] Performance targets met (page load <3s)
- [ ] Mobile responsive verified
- [ ] User acceptance testing completed

**Post-Launch (30 days):**
- [ ] Uptime >99.9%
- [ ] API error rate <0.1%
- [ ] Average page load <2s
- [ ] User satisfaction >4.5/5
- [ ] Zero critical security incidents

---

## 🔑 KEY DECISIONS NEEDED

1. **File Storage:** Local filesystem or cloud storage (S3)?
2. **Email Provider:** SendGrid, AWS SES, Mailgun, or Nodemailer?
3. **SMS Provider:** Which Cambodian SMS gateway?
4. **Hosting:** AWS, Google Cloud, DigitalOcean, Heroku?
5. **Monitoring:** Sentry + New Relic, or Datadog all-in-one?
6. **Certificate Design:** Template needed from stakeholders
7. **i18n Scope:** Full translation or Khmer UI labels only?

---

## 🛠️ IMMEDIATE NEXT STEPS (This Week)

1. **Run database migrations:** `npx prisma migrate dev --name init`
2. **Seed database:** Complete `prisma/seed.ts` and run `npx prisma db seed`
3. **Install security packages:**
   ```bash
   npm install bcryptjs jsonwebtoken
   npm install @types/bcryptjs @types/jsonwebtoken
   ```
4. **Implement JWT authentication** in login/register endpoints
5. **Test end-to-end flow:** Register → Login → View Trainings → Enroll → Check Attendance

---

**Last Updated:** 2025-12-25
**Version:** 1.0
**Maintained By:** Development Team
