# Sadza Connect Zimbabwe 🇿🇼

> Zimbabwe's Premier Digital Commercial Operating Platform & Super-App — Connecting Businesses, Marketplaces, Jobs, Bill Payments, and Civic Verification.

---

## 🏗️ Repository Architecture

Sadza Connect is architected as a modular multi-tier application designed for high resilience, offline-first readiness, and production-grade security:

```
├── sadza_frontend/       # Next.js 14 App Router, React 18, Tailwind CSS, Framer Motion
│   ├── src/app/          # Core pages: Storefronts, Directory, Marketplace, Jobs, Utilities
│   ├── src/components/   # Component design system (Onboarding, Header, Footer, Hero)
│   ├── src/lib/supabase/ # Client, Server & Admin Supabase integration points
│   └── supabase/         # Phase 2 SQL migrations, schemas, RLS policies & seed data
├── sadza_backend/        # Express REST API microservice in TypeScript (Node 20+)
│   ├── src/domain/       # Clean Architecture Domain layer (User, Email, Password, Value Objects)
│   ├── src/application/  # Use cases, JWT service & cryptographic rotation
│   ├── src/infrastructure/# Knex/Postgres pool, Resend mailer, Supabase client
│   └── scripts/          # Unit & smoke test test runner
├── render.yaml           # Render Infrastructure-as-Code Blueprint
├── .env.example          # Environment variable reference template
└── ARCHITECTURE.md       # Technical architecture specification
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### 1. Frontend Setup
```bash
cd sadza_frontend
npm install
npm run dev
# Running at http://localhost:3000
```

### 2. Backend Setup
```bash
cd sadza_backend
npm install
npm run dev
# API running at http://localhost:5000/api/v1
# Health check: http://localhost:5000/api/v1/health
```

---

## 🧪 Testing & Production Builds

### Frontend Build
```bash
cd sadza_frontend
npm run build
```
*Validates TypeScript compilation, static site generation for all 22 core routes, and asset optimization.*

### Backend Build & Smoke Tests
```bash
cd sadza_backend
npm test         # Executes domain value object, entity, JWT & Zod validator smoke tests
npm run build    # Compiles TypeScript into dist/
```

---

## 🌐 Production Deployment on Render

This repository is configured for automated deployment via **Render Blueprints** (`render.yaml`).

### Deployment Steps:
1. Push this repository to your GitHub organization.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** → **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect `render.yaml` and provision both:
   - **`sadza-backend`** (Web Service, Node runtime)
   - **`sadza-frontend`** (Web Service, Next.js runtime)
5. Fill in the required environment variables in the Render dashboard:
   - `NEXT_PUBLIC_SITE_URL`: Your production frontend domain (e.g. `https://sadzaconnect.co.zw`).
   - `NEXT_PUBLIC_API_URL`: Your Render backend service URL (e.g. `https://sadza-backend.onrender.com/api/v1`).
   - `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase production credentials.
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`: Direct Postgres credentials for Knex migrations.
   - `RESEND_API_KEY`: Your transactional email API key.

---

## 🔒 Security & Environment Variables

- Never commit `.env` or `.env.local` files containing live secrets.
- Refer to `.env.example`, `sadza_frontend/.env.example`, and `sadza_backend/.env.example` for the required configuration parameters.
- All secrets are excluded via `.gitignore`.
