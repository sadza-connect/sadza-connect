# Sadza Connect Zimbabwe 🇿🇼

> Zimbabwe's Premier Digital Commercial Operating Platform & Super-App — Connecting Businesses, Marketplaces, Jobs, Bill Payments, and Civic Verification.

---

## 🏗️ Unified Application Architecture

Sadza Connect is consolidated into a single production-ready **Next.js 14 App Router** application that handles both the rich user interface and full server-side functionality (Domain Entities, Authentication, JWT Token Family Rotation, Knex PostgreSQL pool, and transactional email):

```
Sadza_Conneect/
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── (22 Core Pages)       # Storefronts, Directory, Marketplace, Jobs, Utilities, Admin Shell
│   │   └── api/                  # Server-side Route Handlers
│   │       ├── route.ts          # GET /api (API metadata)
│   │       └── v1/
│   │           ├── health/       # GET /api/v1/health (DB connectivity check)
│   │           └── auth/         # Complete Authentication API
│   │               ├── register/ # POST /api/v1/auth/register
│   │               ├── login/    # POST /api/v1/auth/login
│   │               ├── refresh/  # POST /api/v1/auth/refresh
│   │               ├── verify-email/
│   │               ├── resend-verification/
│   │               ├── forgot-password/
│   │               ├── verify-reset-otp/
│   │               ├── reset-password/
│   │               ├── logout/
│   │               └── me/       # GET /api/v1/auth/me (Bearer token protected)
│   ├── domain/                   # Clean Architecture Domain Layer (User, Value Objects)
│   ├── application/              # Business Logic (AuthService, JwtService)
│   ├── infrastructure/           # Knex PostgreSQL pool, Repositories, Resend Mailer
│   ├── shared/                   # Shared Validators, Errors, Logger, Rate Limiter
│   ├── components/               # MATECH UI Design System & Component Library
│   ├── context/                  # Theme & Client State
│   └── lib/                      # Supabase SSR helpers & client utilities
├── scripts/
│   └── test-auth-smoke.ts        # Unit & smoke test runner
├── render.yaml                   # Unified single-service Render Blueprint
├── .env.example                  # Consolidated environment variable reference template
├── package.json                  # Unified dependencies & npm scripts
├── sadza_frontend/               # [Original frontend preserved untouched]
└── sadza_backend/                # [Original backend preserved untouched]
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### Run the Application
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Start development server (UI + API)
npm run dev
# Running at http://localhost:3000
# API endpoints at http://localhost:3000/api/v1
# Health check at http://localhost:3000/api/v1/health
```

---

## 🧪 Testing & Production Validation

```bash
# 1. Run Unit & Smoke Tests
npm test
# Executes domain value object, entity, JWT token rotation, and Zod validator smoke tests

# 2. Type-Checking
npx tsc --noEmit

# 3. Linting
npm run lint

# 4. Production Build
npm run build
# Compiles both the 22 frontend routes and all 12 server API route handlers

# 5. Start Production Server
npm start
```

---

## 💾 Database Migrations (PostgreSQL / Knex)

```bash
# Run latest migrations
npm run db:migrate

# Rollback migrations
npm run db:rollback
```

---

## 🌐 Production Deployment on Render

This repository is configured for automated single-service deployment via **Render Blueprints** (`render.yaml`):

1. In the [Render Dashboard](https://dashboard.render.com), click **New +** → **Blueprint**.
2. Connect your GitHub repository.
3. Render automatically provisions the unified **`sadza-connect`** web service running Node 20.
4. Set required secrets (`JWT_ACCESS_SECRET`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `RESEND_API_KEY`, etc.) in the Render dashboard.

---

## 🔒 Security & Environment Variables

- Never commit `.env` or `.env.local` files containing live secrets.
- Refer to `.env.example` for the required configuration parameters.
- Secrets (`JWT_ACCESS_SECRET`, `DB_PASSWORD`, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are kept strictly server-side and never exposed with `NEXT_PUBLIC_` prefixes.
