# Sadza Connect Zimbabwe — Backend API & Authentication Service

Core backend service for **Sadza Connect Zimbabwe**, powering high-trust commercial verification, authentication, and session security.

---

## 🏛️ Architecture Overview

The architecture follows the clean, domain-driven structure adapted from the proven **ShelterFaithapps** backend reference:

```
sadza_backend/
├── src/
│   ├── config/                       # Runtime configuration & schema validation
│   │   ├── env.ts                    # Zod-validated environment variables
│   │   └── database.ts               # Knex PostgreSQL / Supabase pool configuration
│   ├── domain/                       # Core business entities & value objects
│   │   ├── value-objects/            # Email, PasswordHash, UserRole, AccountStatus
│   │   └── entities/                 # User domain entity
│   ├── infrastructure/               # External adapters & persistence
│   │   ├── database/                 # Knex connection pool, migrations & repositories
│   │   │   ├── migrations/           # PostgreSQL migration for auth & audit tables
│   │   │   └── repositories/         # UserRepository, RefreshTokenRepository, OTP repositories
│   │   └── messaging/                # Resend email delivery service & templates
│   ├── application/                  # Business logic orchestration
│   │   └── auth/                     # AuthService & JwtService (token family rotation)
│   ├── interfaces/http/              # Presentation layer (REST API)
│   │   ├── controllers/              # AuthController
│   │   ├── middleware/               # Rate limiters, request context, error handler, JWT auth
│   │   ├── routes/                   # Express auth routes
│   │   └── validators/               # Zod validation schemas matching frontend inputs
│   ├── app.ts                        # Express application & middleware assembly
│   └── server.ts                     # HTTP server entrypoint with graceful shutdown
├── scripts/                          # Utility & smoke test scripts
├── .env.example                      # Documented environment variable template
├── package.json
└── tsconfig.json
```

---

## 🔐 Implemented Authentication Endpoints

All endpoints are mounted under `/api/v1/auth`:

| Method | Endpoint | Description | Rate Limit | Protection |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register Personal or Business user; dispatches email OTP | 20 / 15m | Public |
| `POST` | `/api/v1/auth/login` | Authenticate using Email **OR** Zimbabwean Phone (`+263...`) | 20 / 15m | Public |
| `POST` | `/api/v1/auth/refresh` | Rotate access token with token family reuse detection | 20 / 15m | Public |
| `POST` | `/api/v1/auth/verify-email` | Verify email address using 6-digit OTP code | 20 / 15m | Public |
| `POST` | `/api/v1/auth/resend-verification` | Invalidate previous OTP and dispatch new verification code | 20 / 15m | Public |
| `POST` | `/api/v1/auth/forgot-password` | Request 6-digit password recovery OTP | 20 / 15m | Public |
| `POST` | `/api/v1/auth/verify-reset-otp` | Verify recovery OTP & issue temporary password-reset token | 10 / 15m | Public |
| `POST` | `/api/v1/auth/reset-password` | Complete password reset & invalidate all active sessions | 20 / 15m | Public |
| `POST` | `/api/v1/auth/logout` | Revoke active refresh token session | 20 / 15m | Public |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Global | `Bearer` JWT |

---

## 📋 API Request & Response Contracts

### 1. Registration (`POST /api/v1/auth/register`)

**Personal Account Body:**
```json
{
  "accountType": "personal",
  "fullName": "Tinashe Sibanda",
  "email": "tinashe@example.co.zw",
  "password": "SadzaConnect2026!",
  "phoneNumber": "+263 71 890 1234",
  "province": "Bulawayo Province (Bulawayo Metro)"
}
```

**Business Account Body:**
```json
{
  "accountType": "business",
  "fullName": "Kudzai Moyo",
  "businessName": "Midlands Solar & Agro Solutions",
  "sector": "Solar & Renewable Energy",
  "businessStructure": "corporate",
  "email": "kudzai@midlandssolar.co.zw",
  "password": "SadzaConnect2026!",
  "phoneNumber": "+263 77 345 6789",
  "province": "Midlands Province (Gweru, Kwekwe)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-v4",
      "accountType": "business",
      "role": "merchant",
      "fullName": "Kudzai Moyo",
      "email": "kudzai@midlandssolar.co.zw",
      "phoneNumber": "+263 77 345 6789",
      "province": "Midlands Province (Gweru, Kwekwe)",
      "businessName": "Midlands Solar & Agro Solutions",
      "sector": "Solar & Renewable Energy",
      "businessStructure": "corporate",
      "accountStatus": "active",
      "isVerified": false,
      "avatarUrl": null,
      "lastLoginAt": null,
      "createdAt": "2026-10-04T13:00:00.000Z",
      "updatedAt": "2026-10-04T13:00:00.000Z"
    }
  },
  "meta": {
    "requestId": "uuid-v4",
    "timestamp": "2026-10-04T13:00:00.000Z"
  }
}
```

---

### 2. Login (`POST /api/v1/auth/login`)

Supports login via **Email** or **Zimbabwean Phone Number** (`+263...` or local `07...`):

```json
{
  "identifier": "+263 77 245 9811",
  "password": "SadzaConnect2026!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-v4",
      "accountType": "personal",
      "role": "customer",
      "fullName": "Tendai Moyo",
      "email": "tendai@example.co.zw",
      "phoneNumber": "+263772459811",
      "isVerified": true
    },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  },
  "meta": {
    "requestId": "uuid-v4",
    "timestamp": "2026-10-04T13:00:00.000Z"
  }
}
```

---

### 3. Token Rotation (`POST /api/v1/auth/refresh`)

```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

---

### 4. Password Recovery Flow

1. **Request Reset OTP:** `POST /api/v1/auth/forgot-password` with `{ "email": "user@example.co.zw" }`
2. **Verify OTP:** `POST /api/v1/auth/verify-reset-otp` with `{ "email": "user@example.co.zw", "otp": "123456" }` -> Returns `{ "resetToken": "jwt..." }`
3. **Set New Password:** `POST /api/v1/auth/reset-password` with `{ "resetToken": "jwt...", "password": "NewSecurePassword2026!" }` (Revokes all active sessions).

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` and fill in your values when available:

```bash
cp .env.example .env
```

Key variables:
- `PORT`: HTTP port (default `5000`)
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`: Minimum 32-character secure secret keys
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: PostgreSQL connection settings
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`: Supabase API credentials
- `RESEND_API_KEY`: API key for email delivery via Resend
- `EMAIL_FROM`: Sender email identity (e.g. `Sadza Connect <noreply@sadzaconnect.co.zw>`)

---

## 🚀 Available Scripts

```bash
# Install dependencies
npm install

# Run automated unit & smoke test suite
npm test

# Build production bundle (TypeScript compiler)
npm run build

# Start local development server with hot-reloading
npm run dev

# Run database migrations against PostgreSQL / Supabase
npm run db:migrate

# Rollback last migration batch
npm run db:rollback
```
