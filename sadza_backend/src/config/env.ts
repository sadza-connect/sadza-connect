import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // ─── Server ──────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().positive().max(65535).default(5000),
  HOST: z.string().default('0.0.0.0'),
  API_PREFIX: z.string().default('/api/v1'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // ─── CORS ────────────────────────────────────────────
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://127.0.0.1:3000')
    .transform((v) => v.split(',').map((s) => s.trim().replace(/\/$/, ''))),

  // ─── Rate Limiting ───────────────────────────────────
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().positive().default(100),

  // ─── Authentication & JWT ────────────────────────────
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters')
    .default('sadza_connect_super_secret_jwt_access_key_development_32chars'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters')
    .default('sadza_connect_super_secret_jwt_refresh_key_development_32chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_ISSUER: z.string().default('sadza-connect'),
  JWT_AUDIENCE: z.string().default('sadza-app'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().min(4).max(16).default(12),

  // ─── Database ────────────────────────────────────────
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().positive().max(65535).default(5432),
  DB_NAME: z.string().default('postgres'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default(''),
  DB_SSL: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
  DB_POOL_MIN: z.coerce.number().min(0).default(2),
  DB_POOL_MAX: z.coerce.number().min(1).default(20),
  DATABASE_URL: z.string().optional(),

  // ─── Supabase ─────────────────────────────────────────
  SUPABASE_URL: z.string().default(''),
  SUPABASE_ANON_KEY: z.string().default(''),
  SUPABASE_SERVICE_KEY: z.string().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default(''),

  // ─── Email (Resend) ───────────────────────────────────
  RESEND_API_KEY: z.string().default(''),
  EMAIL_FROM: z.string().default('Sadza Connect <noreply@sadzaconnect.co.zw>'),

  // ─── Logging ─────────────────────────────────────────
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('pretty'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
