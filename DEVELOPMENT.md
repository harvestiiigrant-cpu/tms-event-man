# Development Ecosystem Guide

This guide explains how to run the PLP Training Management System as a connected development ecosystem.

## Quick Start

### Option 1: Local Development (Recommended)

Start all services locally on your machine:

```bash
# Start database with Docker (if not already running)
npm run docker:db

# Start frontend + backend + database together
npm run dev:db

# Or start just frontend + backend (database already running)
npm run dev:all
```

**Access Points:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- Database: localhost:5433

---

### Option 2: Full Docker Development

Run everything in Docker containers:

```bash
# Start all services in Docker (frontend, backend, database)
npm run docker:dev

# Or start full stack with profiles
npm run docker:full
```

**Access Points:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- Database: localhost:5433 (internal only)
- pgAdmin: http://localhost:5050 (optional, run `npm run docker:tools`)

---

## Available Commands

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite frontend dev server only (port 8080) |
| `npm run server` | Start Express backend server only (port 3000) |
| `npm run dev:all` | Start frontend + backend concurrently with colored output |
| `npm run dev:db` | Start frontend + backend + PostgreSQL database together |

### Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma client from schema |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:reset` | Reset database (WARNING: deletes all data) |
| `npm run db:setup` | Full setup: generate + migrate + seed |

### Docker Commands

| Command | Description |
|---------|-------------|
| `npm run docker:db` | Start PostgreSQL database in Docker |
| `npm run docker:tools` | Start database + pgAdmin tools |
| `npm run docker:dev` | Start backend + frontend + database in Docker |
| `npm run docker:full` | Start full stack with all profiles |
| `npm run docker:prod` | Start production build with Nginx |
| `npm run docker:down` | Stop all Docker containers |
| `npm run docker:clean` | Stop containers + remove volumes |

### Build Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Production build |
| `npm run build:dev` | Development build |
| `npm run preview` | Preview production build locally |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Development Ecosystem                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   Frontend   │◄────►│   Backend    │◄────►│ PostgreSQL│ │
│  │  (React/Vite)│      │  (Express)   │      │ Database  │ │
│  │   Port 8080  │      │   Port 3000  │      │  Port 5433│ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│                                                               │
│  ┌──────────────┐                                            │
│  │   pgAdmin    │◄─────(Optional Database Management)───────►│
│  │   Port 5050  │                                            │
│  └──────────────┘                                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Configuration

The `.env` file controls the configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://san_user:san_password@localhost:5433/san_training_app
POSTGRES_USER=san_user
POSTGRES_PASSWORD=san_password
POSTGRES_DB=san_training_app
POSTGRES_PORT=5433

# Backend Server Configuration
PORT=3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Frontend Configuration
VITE_API_URL=http://localhost:3000/api

# Optional: pgAdmin
PGADMIN_EMAIL=admin@plp.local
PGADMIN_PASSWORD=admin123
```

---

## Docker Compose Profiles

Docker Compose uses profiles for flexible deployment:

| Profile | Services | Use Case |
|---------|----------|----------|
| `default` | postgres | Database only |
| `backend` | postgres, backend | API server + database |
| `frontend` | postgres, backend, frontend | Full dev stack |
| `full` | postgres, backend, frontend | Complete development |
| `production` | postgres, frontend-prod | Production with Nginx |
| `tools` | postgres, pgadmin | Database management tools |

---

## Development Workflows

### 1. First-Time Setup

```bash
# Clone and install dependencies
npm install

# Start database
npm run docker:db

# Setup database
npm run db:setup

# Start development servers
npm run dev:all
```

### 2. Daily Development

```bash
# Quick start (database already running)
npm run dev:all

# Or with everything including database
npm run dev:db
```

### 3. Making Schema Changes

```bash
# After modifying prisma/schema.prisma
npm run db:generate  # Regenerate Prisma client
npm run db:migrate   # Create and apply migration
```

### 4. Debugging Database Issues

```bash
# Open Prisma Studio to view/edit data
npm run db:studio

# Or use pgAdmin
npm run docker:tools
# Access at http://localhost:5050
```

### 5. Reset Everything

```bash
# Stop all services and clean Docker
npm run docker:clean

# Start fresh
npm run docker:db
npm run db:setup
npm run dev:all
```

---

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
netstat -ano | findstr "8080 3000 5433"

# Kill process (Windows)
taskkill /PID <PID> /F
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Backend Not Starting

```bash
# Check if Prisma client is generated
npm run db:generate

# Check backend logs
docker-compose logs backend
```

---

## Production Deployment

For production deployment:

```bash
# Build production images
docker-compose --profile production build

# Start production stack
npm run docker:prod
```

This will serve the frontend through Nginx on port 80 with a production build.

---

## Additional Resources

- [CLAUDE.md](./CLAUDE.md) - Project overview and architecture
- [README.md](./README.md) - Main project documentation
- [DATABASE_CONNECTION.md](./DATABASE_CONNECTION.md) - Database configuration guide
