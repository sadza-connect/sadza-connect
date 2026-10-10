import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Strips accidental surrounding quotes and whitespace from environment variables
 * configured in cloud dashboards (Netlify, Render, etc.).
 */
function cleanEnvValue(val: unknown): string | undefined {
  if (typeof val !== 'string') return undefined;
  const trimmed = val.trim().replace(/^['"]+|['"]+$/g, '').trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const sanitizedEnv: Record<string, string | undefined> = {};
if (typeof process !== 'undefined' && process.env) {
  for (const [key, value] of Object.entries(process.env)) {
    sanitizedEnv[key] = cleanEnvValue(value);
  }
}

// Normalize NODE_ENV variations (e.g. 'prod' -> 'production', 'dev' -> 'development')
if (sanitizedEnv.NODE_ENV) {
  const lower = sanitizedEnv.NODE_ENV.toLowerCase();
  if (lower === 'prod' || lower === 'production') {
    sanitizedEnv.NODE_ENV = 'production';
  } else if (lower === 'dev' || lower === 'development') {
    sanitizedEnv.NODE_ENV = 'development';
  } else if (lower === 'test') {
    sanitizedEnv.NODE_ENV = 'test';
  }
}

const envSchema = z.object({
  // ─── Server ──────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).catch('production'),
  PORT: z.coerce.number().positive().max(65535).catch(3000),
  HOST: z.string().default('0.0.0.0').catch('0.0.0.0'),
  API_PREFIX: z.string().default('/api/v1').catch('/api/v1'),
  FRONTEND_URL: z.string().default('http://localhost:3000').catch('http://localhost:3000'),

  // ─── CORS ────────────────────────────────────────────
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://127.0.0.1:3000')
    .transform((v) => v.split(',').map((s) => s.trim().replace(/\/$/, '')))
    .catch(['http://localhost:3000', 'http://127.0.0.1:3000']),

  // ─── Rate Limiting ───────────────────────────────────
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().catch(900000),
  RATE_LIMIT_MAX: z.coerce.number().positive().catch(100),

  // ─── Authentication & JWT ────────────────────────────
  JWT_ACCESS_SECRET: z
    .string()
    .min(1)
    .catch('sadza_connect_super_secret_jwt_access_key_development_32chars'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(1)
    .catch('sadza_connect_super_secret_jwt_refresh_key_development_32chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m').catch('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d').catch('7d'),
  JWT_ISSUER: z.string().default('sadza-connect').catch('sadza-connect'),
  JWT_AUDIENCE: z.string().default('sadza-app').catch('sadza-app'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().min(4).max(16).catch(12),

  // ─── Database ────────────────────────────────────────
  DB_HOST: z.string().default('localhost').catch('localhost'),
  DB_PORT: z.coerce.number().positive().max(65535).catch(5432),
  DB_NAME: z.string().default('postgres').catch('postgres'),
  DB_USER: z.string().default('postgres').catch('postgres'),
  DB_PASSWORD: z.string().default('').catch(''),
  DB_SSL: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1')
    .catch(true),
  DB_POOL_MIN: z.coerce.number().min(0).catch(0),
  DB_POOL_MAX: z.coerce.number().min(1).catch(5),
  DATABASE_URL: z.string().optional().catch(undefined),

  // ─── Supabase ─────────────────────────────────────────
  SUPABASE_URL: z.string().default('').catch(''),
  SUPABASE_ANON_KEY: z.string().default('').catch(''),
  SUPABASE_SERVICE_KEY: z.string().default('').catch(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default('').catch(''),

  // ─── Email (Resend) ───────────────────────────────────
  RESEND_API_KEY: z.string().default('').catch(''),
  EMAIL_FROM: z
    .string()
    .default('Sadza Connect <noreply@mail.shelterfaithapps.xyz>')
    .catch('Sadza Connect <noreply@mail.shelterfaithapps.xyz>'),

  // ─── Logging ─────────────────────────────────────────
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).catch('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).catch('json'),
});

export const env = envSchema.parse(sanitizedEnv);
