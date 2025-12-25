# 🗄️ PostgreSQL Database Connection Guide

## HeidiSQL Connection Settings

### Step 1: Start PostgreSQL Container

First, make sure the PostgreSQL Docker container is running:

```bash
# Start the database
docker-compose up -d

# Verify it's running
docker ps
```

You should see a container named `san_training_db` running.

---

## Step 2: HeidiSQL Connection Settings

### 📋 Connection Details

Open HeidiSQL and create a new connection with these settings:

| Setting | Value |
|---------|-------|
| **Network Type** | `PostgreSQL (TCP/IP)` |
| **Library** | `libpq` (default) |
| **Hostname / IP** | `localhost` or `127.0.0.1` |
| **User** | `san_user` |
| **Password** | `san_password` |
| **Port** | `5433` |
| **Database** | `san_training_app` |

### 🖼️ HeidiSQL Configuration Screenshot

**Session Manager → New:**

```
Session name: San Training DB
─────────────────────────────────
Network type: PostgreSQL (TCP/IP)
Library: libpq
─────────────────────────────────
Settings:
  Hostname/IP: localhost
  User: san_user
  Password: san_password
  Port: 5433
  Databases: san_training_app
─────────────────────────────────
[x] Compressed client/server protocol
[ ] Use SSL
─────────────────────────────────
```

---

## Step 3: Test Connection

1. Click "Open" in HeidiSQL
2. If successful, you'll see:
   - Database: `san_training_app`
   - Schema: `public`
   - Tables (once you run migrations)

---

## 🔧 Alternative Connection Methods

### Using pgAdmin 4

If you prefer pgAdmin instead of HeidiSQL:

**Server Settings:**
- Name: `San Training DB`
- Host: `localhost`
- Port: `5433`
- Maintenance database: `san_training_app`
- Username: `san_user`
- Password: `san_password`

### Using DBeaver

**PostgreSQL Connection:**
- Host: `localhost`
- Port: `5433`
- Database: `san_training_app`
- Username: `san_user`
- Password: `san_password`

### Using Command Line (psql)

```bash
# Connect via Docker
docker exec -it san_training_db psql -U san_user -d san_training_app

# Or via local psql (if installed)
psql -h localhost -p 5433 -U san_user -d san_training_app
```

---

## 📝 Connection String Format

### PostgreSQL Connection URL
```
postgresql://san_user:san_password@localhost:5433/san_training_app
```

### For Node.js / Prisma
```env
DATABASE_URL="postgresql://san_user:san_password@localhost:5433/san_training_app"
```

### For Python / SQLAlchemy
```python
DATABASE_URL = "postgresql://san_user:san_password@localhost:5433/san_training_app"
```

### For Java / JDBC
```
jdbc:postgresql://localhost:5433/san_training_app
```

---

## 🐛 Troubleshooting

### Issue: "Connection refused" or "Can't connect"

**Check if Docker is running:**
```bash
docker ps
```

**If container is not running, start it:**
```bash
docker-compose up -d
```

**Check container logs:**
```bash
docker logs san_training_db
```

---

### Issue: "Port 5433 already in use"

**Find what's using the port:**
```bash
# Windows
netstat -ano | findstr :5433

# Check if another PostgreSQL is running
docker ps -a
```

**Solution 1: Stop other PostgreSQL instance**
```bash
# Stop the container
docker stop san_training_db

# Remove it
docker rm san_training_db

# Start fresh
docker-compose up -d
```

**Solution 2: Change the port in docker-compose.yml**
```yaml
ports:
  - "5434:5432"  # Change to 5434
```

Then update HeidiSQL to use port `5434`.

---

### Issue: "Password authentication failed"

**Reset the database:**
```bash
# Stop and remove container
docker-compose down

# Remove volume (WARNING: This deletes all data!)
docker volume rm pixel-perfect-replica_postgres_data

# Start fresh
docker-compose up -d
```

The credentials will be:
- User: `san_user`
- Password: `san_password`

---

### Issue: "Database does not exist"

The database `san_training_app` should be created automatically when the container starts.

**Verify:**
```bash
docker exec -it san_training_db psql -U san_user -c "\l"
```

**Manually create if needed:**
```bash
docker exec -it san_training_db psql -U san_user -c "CREATE DATABASE san_training_app;"
```

---

## 🚀 Docker Commands Cheat Sheet

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# Stop but keep data
docker-compose stop

# View logs
docker logs san_training_db

# Follow logs (real-time)
docker logs -f san_training_db

# Check container status
docker ps

# Access PostgreSQL shell
docker exec -it san_training_db psql -U san_user -d san_training_app

# Restart database
docker-compose restart

# View all containers (including stopped)
docker ps -a

# Remove container and volume (DELETES ALL DATA)
docker-compose down -v
```

---

## 📊 Database Schema (After Migration)

Once you run your database migrations, you should see tables like:

- `beneficiaries` - Teacher/beneficiary records
- `trainings` - Training programs
- `beneficiary_trainings` - Enrollment records
- `attendance_records` - Attendance tracking
- `users` - Authentication
- And more...

---

## 🔐 Security Notes

**Current Settings (Development Only):**
- ⚠️ Weak password (`san_password`)
- ⚠️ Exposed port (5433)
- ⚠️ No SSL/TLS

**For Production:**
- Use strong passwords (min 32 characters)
- Use environment variables
- Enable SSL/TLS
- Restrict network access
- Use PostgreSQL authentication methods
- Regular backups
- Don't expose port publicly

---

## 📁 Environment Variables Setup

Create a `.env` file in your project root:

```bash
# Copy example
cp .env.example .env
```

Your `.env` should contain:
```env
# Database Configuration
DATABASE_URL=postgresql://san_user:san_password@localhost:5433/san_training_app

# PostgreSQL Docker Configuration
POSTGRES_USER=san_user
POSTGRES_PASSWORD=san_password
POSTGRES_DB=san_training_app
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
```

---

## ✅ Quick Start Checklist

- [ ] Docker Desktop installed and running
- [ ] Run `docker-compose up -d`
- [ ] Verify container running: `docker ps`
- [ ] Open HeidiSQL
- [ ] Create new PostgreSQL connection
- [ ] Enter connection details (see table above)
- [ ] Port: **5433** (not 5432!)
- [ ] Click "Open"
- [ ] Connection successful!

---

## 🎯 Next Steps

After connecting to the database:

1. **Run Database Migrations**
   ```bash
   # If using Prisma
   npx prisma migrate dev

   # If using other ORM
   npm run migrate
   ```

2. **Seed Initial Data**
   ```bash
   npm run seed
   ```

3. **Verify Tables**
   - Refresh HeidiSQL
   - Expand `san_training_app`
   - Expand `public`
   - You should see all tables

---

## 📞 Need Help?

**Container won't start?**
```bash
docker logs san_training_db
```

**Can't connect from HeidiSQL?**
```bash
# Test from command line first
docker exec -it san_training_db psql -U san_user -d san_training_app
```

**Want to reset everything?**
```bash
docker-compose down -v
docker-compose up -d
```

---

## 🎉 You're All Set!

Your PostgreSQL database is ready to use with HeidiSQL!

**Connection Summary:**
- 🏠 Host: `localhost:5433`
- 👤 User: `san_user`
- 🔑 Password: `san_password`
- 🗄️ Database: `san_training_app`
