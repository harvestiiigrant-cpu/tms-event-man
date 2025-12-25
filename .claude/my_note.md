BeneficiaryPortalLayout.tsx

DashboardLayout.tsx


  Fully Docker Centralized Setup Complete

  Files created:
  | File               | Purpose                                              |
  |--------------------|------------------------------------------------------|
  | Dockerfile         | Multi-stage build (Node.js → Nginx)                  |
  | nginx/nginx.conf   | Main Nginx configuration with gzip, security headers |
  | nginx/default.conf | Server config with SPA routing, caching              |
  | docker-compose.yml | All services orchestration                           |
  | .dockerignore      | Excludes unnecessary files from build                |
  | .env.example       | Environment variables template                       |

  How to Run

  # Start all services (frontend + database)
  docker-compose up -d

  # Start with pgAdmin for database management
  docker-compose --profile tools up -d

  # View logs
  docker-compose logs -f

  # Stop all services
  docker-compose down

  Access Points

  | Service  | URL                   | Credentials              |
  |----------|-----------------------|--------------------------|
  | Frontend | http://localhost      | admin/admin123           |
  | Database | localhost:5433        | plp_user/plp_password    |
  | pgAdmin  | http://localhost:5050 | admin@plp.local/admin123 |

  Architecture

  ┌────────────────────────────────────────┐
  │            docker-compose              │
  ├────────────────────────────────────────┤
  │  ┌──────────────┐   ┌──────────────┐   │
  │  │   Frontend   │   │  PostgreSQL  │   │
  │  │  (Nginx:80)  │───│   (:5432)    │   │
  │  └──────────────┘   └──────────────┘   │
  │          │                             │
  │  ┌──────────────┐                      │
  │  │   pgAdmin    │  (optional)          │
  │  │   (:5050)    │                      │
  │  └──────────────┘                      │
  └────────────────────────────────────────┘