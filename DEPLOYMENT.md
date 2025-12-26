# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration

**Generate Secure JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Create `.env.production`:**
```env
NODE_ENV=production

# Database (Production PostgreSQL)
DATABASE_URL=postgresql://user:password@production-host:5432/database_name

# JWT Security
JWT_SECRET=<paste-64-char-random-hex-here>
JWT_EXPIRES_IN=7d

# Backend API
PORT=3000

# Frontend API URL (must match your domain)
VITE_API_URL=https://api.yourdomain.com/api

# CORS - Add your production domains
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

### 2. Database Setup

**Run migrations:**
```bash
npm run db:migrate
```

**Seed initial data:**
```bash
npm run db:seed
```

This will create:
- Training categories (MATH, KHMER, IT, PEDAGOGY, LEADERSHIP)
- Training types (WORKSHOP, COURSE, SEMINAR)
- Training levels (NATIONAL, PROVINCIAL, CLUSTER)
- Admin user accounts
- Sample trainings (optional)

---

### 3. Security Configuration

**Update JWT Secret in Auth Routes:**

The JWT secret is currently hardcoded in `server/routes/auth.ts`. Replace:
```typescript
const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
```

With proper environment variable usage (already done, but verify).

**Install Security Packages:**
```bash
npm install helmet express-rate-limit
```

**Add to `server/index.ts`:**
```typescript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);
```

---

### 4. Build for Production

**Frontend:**
```bash
npm run build
```

Output will be in `dist/` directory. Serve with Nginx or similar.

**Backend:**
```bash
# Compile TypeScript (if needed)
npx tsc server/**/*.ts --outDir dist/server

# Or run with tsx in production
npm run server
```

---

### 5. Database Backups

**Set up automated backups:**
```bash
# Example: Daily PostgreSQL backup
pg_dump -U username -h hostname database_name > backup_$(date +%Y%m%d).sql
```

**Backup schedule recommendations:**
- Daily full backups
- Weekly archival
- Retain 30 days minimum

---

### 6. Deployment Architecture

**Recommended Setup:**

```
┌─────────────────┐
│   Nginx/CDN     │ → Frontend (dist/)
│   (Port 80/443) │
└────────┬────────┘
         │
    ┌────▼────────────────┐
    │  Express Backend    │
    │    (Port 3000)      │
    └────────┬────────────┘
             │
    ┌────────▼────────────┐
    │   PostgreSQL DB     │
    │    (Port 5432)      │
    └─────────────────────┘
```

**Using Docker Compose:**
```bash
# Production mode
docker-compose --profile production up -d
```

---

### 7. Environment-Specific Settings

**Development:**
- CORS: Allow localhost origins
- Debug: Console logging enabled
- Auth: Relaxed token expiry (7d)

**Production:**
- CORS: Restrict to production domains only
- Debug: Remove console.log, use Winston/Pino
- Auth: Strict token expiry (1d recommended)
- HTTPS: Force HTTPS redirects
- Rate Limiting: Enable on all routes

---

### 8. Health Checks & Monitoring

**Health endpoint:**
```
GET http://localhost:3000/health
```

Returns:
```json
{
  "status": "ok",
  "timestamp": "2025-12-26T..."
}
```

**Set up monitoring:**
1. Database connection status
2. API response times
3. Error rates
4. Memory usage
5. Disk space (for uploads)

---

### 9. File Upload Configuration

**Ensure upload directory exists:**
```bash
mkdir -p public/uploads/materials
mkdir -p public/uploads/profiles
chmod 755 public/uploads
```

**Nginx configuration for serving uploads:**
```nginx
location /uploads {
    alias /path/to/app/public/uploads;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

### 10. SSL/TLS Configuration

**For production, enforce HTTPS:**

In `server/index.ts`, add:
```typescript
// Redirect HTTP to HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
      return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
  });
}
```

---

### 11. Production Checklist

**Before going live:**

- [ ] Generate secure JWT_SECRET (64-char random hex)
- [ ] Update DATABASE_URL to production PostgreSQL
- [ ] Configure ALLOWED_ORIGINS for production domains
- [ ] Run database migrations (`npm run db:migrate`)
- [ ] Seed initial data (`npm run db:seed`)
- [ ] Build frontend (`npm run build`)
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure Nginx/reverse proxy
- [ ] Enable rate limiting
- [ ] Add security headers (helmet)
- [ ] Set up database backups
- [ ] Configure monitoring/alerts
- [ ] Test all CRUD operations
- [ ] Test role-based access (ADMIN, BENEFICIARY)
- [ ] Test file uploads
- [ ] Test authentication flows
- [ ] Remove debug code (authDebug.ts import)
- [ ] Set up error tracking (optional: Sentry)

---

### 12. Post-Deployment Verification

**Test these critical paths:**

1. **Admin Login** → Create Training → Add Participants
2. **Beneficiary Login** → Enroll in Training → Check Attendance
3. **Survey Creation** → Attach to Training → Beneficiary Takes Survey
4. **Attendance Grid** → Bulk Mark Attendance → Export
5. **Materials Upload** → Attach to Training → Download
6. **Participant Transfer** → Verify attendance records moved

---

### 13. Rollback Plan

**If deployment fails:**

1. **Database**: Restore from latest backup
   ```bash
   psql -U username -h hostname database_name < backup_20251226.sql
   ```

2. **Code**: Revert to previous Git commit
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Immediate fix**: Roll forward with hotfix
   ```bash
   git checkout -b hotfix/issue-name
   # Make fixes
   git commit -m "Hotfix: description"
   git push origin hotfix/issue-name
   ```

---

### 14. Monitoring & Logs

**Set up logging:**
```bash
# Install Winston
npm install winston

# Configure in server/index.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

---

### 15. Performance Optimization

**Production optimizations:**

1. **Enable Prisma Query Logging** (development only)
2. **Enable Gzip Compression:**
   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```

3. **Database Connection Pooling:**
   Already configured in Prisma with pg adapter.

4. **Frontend Caching:**
   Configure Nginx cache headers for static assets.

---

### 16. Backup & Disaster Recovery

**Automated backup script:**
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backups"
DB_NAME="san_training_app"

# Database backup
pg_dump -U san_user -h localhost -p 5433 $DB_NAME > "$BACKUP_DIR/db_$DATE.sql"

# Uploads backup
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" public/uploads/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

**Schedule with cron:**
```cron
0 2 * * * /path/to/backup.sh
```

---

## Quick Start Commands

**Development:**
```bash
npm run dev:all
```

**Production:**
```bash
# Backend
npm run server

# Frontend (serve dist/)
npx serve dist -p 8080

# Or use Docker
docker-compose --profile production up -d
```

---

## Support & Maintenance

**Regular maintenance tasks:**
- Weekly: Review error logs
- Monthly: Update dependencies (`npm update`)
- Quarterly: Security audit (`npm audit`)
- Annually: Review and archive old training data

**Critical monitoring:**
- Database size growth
- Upload directory size
- API response times
- Authentication failures
- Failed attendance check-ins

---

## Contact & Emergency

**For critical production issues:**
1. Check error logs: `logs/error.log`
2. Check database connectivity
3. Verify API health endpoint
4. Review recent deployments/changes
5. Restore from backup if needed

**System Health Dashboard:**
- API Health: `http://your-domain.com/health`
- Database: Check pgAdmin at port 5050
- Logs: `tail -f logs/combined.log`
