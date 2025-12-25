# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Training Management System (TMS)** - a full-stack application for managing teacher trainings, beneficiaries (teachers), attendance tracking, and enrollment. Built with React, TypeScript, Vite, Express.js, Prisma, PostgreSQL, and shadcn/ui. Supports both admin dashboard and beneficiary portal with role-based access control.

## Common Commands

```bash
# Development
npm run dev              # Start Vite frontend dev server (port 8080)
npm run server           # Start Express backend server (port 3000)
npm run dev:all          # Start both frontend and backend concurrently

# Database (Prisma + PostgreSQL)
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with initial data
npm run db:studio        # Open Prisma Studio (database GUI)

# Building
npm run build            # Production build
npm run build:dev        # Development build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint

# Docker (Full Stack)
docker-compose up        # Start all services (frontend, PostgreSQL, pgAdmin)
docker-compose up -d     # Start services in detached mode
docker-compose down      # Stop all services
```

## Architecture

### Tech Stack
- **Frontend**: React 18.3.1 + TypeScript 5.8.3 + Vite
- **Backend**: Express.js with TypeScript (server/index.ts)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens + bcryptjs password hashing
- **UI Library**: shadcn/ui (Radix UI primitives) + Tailwind CSS
- **State**: TanStack React Query + React Hook Form
- **Routing**: React Router DOM
- **Charts**: Recharts
- **QR Codes**: qrcode.react

### Directory Structure
```
src/
├── pages/              # Route-level pages
│   ├── Dashboard.tsx, Trainings.tsx, Beneficiaries.tsx, Attendance.tsx, Settings.tsx
│   ├── PublicEnrollment.tsx, EnrollmentLanding.tsx, TrainingBrowser.tsx
│   ├── auth/           # Login, Register pages
│   └── portal/         # Beneficiary portal pages (MyTrainings, TrainingDetails, AttendanceCheckin, etc.)
├── components/
│   ├── layout/         # DashboardLayout, Sidebar, Header, BeneficiaryPortalLayout
│   ├── ui/             # shadcn/ui components (50+ primitives)
│   ├── auth/           # ProtectedRoute component
│   ├── trainings/      # Training feature components (dialogs, QR codes, sharing)
│   ├── beneficiaries/  # Beneficiary feature components
│   ├── branding/       # Branding/settings components
│   └── settings/       # Settings page components
├── contexts/           # React contexts (AuthContext, SidebarContext, FontContext)
├── types/              # TypeScript interfaces (training.ts)
├── data/               # Mock data for development
├── hooks/              # Custom hooks (use-toast, use-mobile)
├── lib/                # Utility functions (cn for classname merging)
└── utils/              # Helper functions
server/
├── index.ts            # Express app entry point
├── db.ts               # Prisma client configuration
├── routes/             # API route handlers (auth, trainings, beneficiaries, attendance, enrollments)
└── middleware/         # Auth middleware, error handling
prisma/
├── schema.prisma       # Database schema
├── seed.ts             # Database seeding script
└── migrations/         # Prisma migrations
```

### Routing
Routes are defined in `src/App.tsx`. When adding new routes:
- Protected routes use `<ProtectedRoute allowedRoles={[...]}>` wrapper
- Add all custom routes before the catch-all `"*"` route

**Public Routes**: `/login`, `/register`, `/enroll/start`, `/trainings/browse`, `/enroll`

**Admin Dashboard Routes** (requires ADMIN/SUPER_ADMIN): `/`, `/trainings`, `/beneficiaries`, `/attendance`, `/settings`

**Beneficiary Portal Routes** (requires BENEFICIARY): `/portal/trainings`, `/portal/attendance`, `/portal/history`, `/portal/profile`

### Core Domain Models

Database schema defined in `prisma/schema.prisma`. Key models:

- **User**: Authentication with roles (ADMIN, SUPER_ADMIN, BENEFICIARY), JWT-based auth
- **Beneficiary**: Teacher/beneficiary records with location data (province, district, commune, village), school info, status (ACTIVE/INACTIVE)
- **Training**: Training programs with GPS validation, geofencing, bilingual support (English/Khmer), status (DRAFT/ONGOING/COMPLETED/CANCELLED)
- **BeneficiaryTraining**: Enrollment records with attendance tracking, certificates, feedback
- **AttendanceRecord**: Time-based check-in/out (morning/afternoon sessions), GPS location validation
- **SystemSettings**: Dynamic configuration storage for branding, localization, etc.
- **TrainingCategory/TypeConfig/LevelConfig**: Dynamic metadata configurations

User roles: ADMIN, SUPER_ADMIN, BENEFICIARY
Training status: DRAFT, ONGOING, COMPLETED, CANCELLED
Training levels: NATIONAL, PROVINCIAL, CLUSTER

### Component Patterns

1. **Feature-based organization**: Components are grouped by domain (trainings/, beneficiaries/, enrollment/)
2. **Dialog pattern**: CRUD operations use dialog components (CreateTrainingDialog, BeneficiaryFormDialog, etc.)
3. **Form handling**: React Hook Form + Zod schema validation for all forms
4. **UI separation**: Reusable shadcn/ui components in `components/ui/`, feature-specific components in domain folders

### State Management
- React Query: Server state (infrastructure in place)
- React Hook Form: Form state
- Local useState: UI state (filters, modals, collapsed state)
- Context API: AuthContext, SidebarContext, FontProvider for app-wide state

### Backend API Architecture

Express.js server in `server/` with RESTful API endpoints:

**Authentication**: `/api/auth/*` - Login, register, JWT token generation/validation
- Middleware: JWT verification in `server/middleware/auth.ts`
- Password hashing with bcryptjs

**Trainings**: `/api/trainings/*` - CRUD operations, enrollment management
**Beneficiaries**: `/api/beneficiaries/*` - Teacher management, profile updates
**Attendance**: `/api/attendance/*` - Check-in/out, GPS validation, manual entry
**Enrollments**: `/api/enrollments/*` - Registration, QR code enrollment

Database access via Prisma client (`server/db.ts`). All routes use error handling middleware (`server/middleware/errorHandler.ts`).

### Styling
- Tailwind CSS utility classes
- CSS variable-based theming (HSL colors) defined in `src/index.css`
- Dark mode support via `dark` class
- Responsive breakpoints: base (mobile-first), sm: 640px, md: 768px, lg: 1024px, 2xl: 1400px

### Database & Data Layer

**PostgreSQL + Prisma ORM** with schema in `prisma/schema.prisma`. After schema changes:
1. Run `npm run db:migrate` to create migration
2. Run `npm run db:generate` to regenerate Prisma client
3. Optionally run `npm run db:seed` to populate with test data

**Docker Compose** setup for local development:
- PostgreSQL database (port 5433 on host)
- pgAdmin for database GUI (port 5050)
- Frontend served via Nginx (port 80)
- Environment variables in `.env` (see `.env.example`)

**Environment Configuration**:
- `DATABASE_URL`: PostgreSQL connection string
- `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Database credentials
- `VITE_API_URL`: Backend API URL for frontend
- `PORT`: Express server port (default 3000)

### Dual Portal Architecture

The application serves two distinct user portals:

**Admin Dashboard** (`/` - Layout: `DashboardLayout`)
- For ADMIN and SUPER_ADMIN roles
- Manages trainings, beneficiaries, attendance, system settings
- Full CRUD operations with geofencing, QR codes, cascading

**Beneficiary Portal** (`/portal/*` - Layout: `BeneficiaryPortalLayout`)
- For BENEFICIARY role (teachers)
- Self-service enrollment, attendance check-in, view history
- Simplified mobile-first interface

Both portals share the same React Context providers (AuthContext, FontProvider, SidebarProvider) but have separate navigation and UI components.

### Special Features

**QR Code Generation**: Uses `qrcode.react` library. Components in `components/trainings/TrainingQRCode.tsx` support SVG generation and PNG download.

**Geolocation & Attendance**: GPS validation, geofence validation with radius, latitude/longitude storage, GPS accuracy tracking.

**Multilingual Support**: English and Khmer language support for training names and UI text. Khmer text is in the design system (`src/index.css`).

### Design System Colors
Primary: Teal/Green (161 93% 30%)
Secondary: Dark Gray (0 0% 32%)
Accent: Light Cyan (166 76% 96%)
Destructive: Red (0 72% 50%)

### Path Alias
The `@` alias maps to `./src`. Use this for imports throughout the codebase.