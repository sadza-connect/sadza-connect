import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env.js';
import { requestContext } from './interfaces/http/middleware/request-context.js';
import { ErrorHandler } from './interfaces/http/middleware/error-handler.js';
import { globalRateLimiter } from './interfaces/http/middleware/rate-limiter.js';
import { pingDb } from './infrastructure/database/connection.js';
import authRouter from './interfaces/http/routes/auth-routes.js';
import { NotFoundError } from './shared/errors/index.js';

const app = express();

// ─── Security ───────────────────────────────────────────
app.set('trust proxy', 1);
app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (env.CORS_ORIGINS.indexOf(origin) !== -1 || env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in development for local frontend testing
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  }),
);

// ─── Performance ────────────────────────────────────────
app.use(compression());

// ─── Rate Limiting ──────────────────────────────────────
app.use(globalRateLimiter);

// ─── Body Parsing ───────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Request Context & Tracing ──────────────────────────
app.use(requestContext);

// ─── Root Info ──────────────────────────────────────────
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'Sadza Connect Backend API',
      version: '1.0.0',
      description: "Zimbabwe's Commercial Super-App & Authentication Service",
      status: 'operational',
      health: `${env.API_PREFIX}/health`,
      auth: `${env.API_PREFIX}/auth`,
    },
  });
});

// ─── Health Check ───────────────────────────────────────
app.get(`${env.API_PREFIX}/health`, async (_req, res) => {
  const dbOk = await pingDb();
  const status = dbOk ? 'healthy' : 'degraded';

  res.status(dbOk ? 200 : 503).json({
    success: dbOk,
    data: {
      status,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbOk ? 'connected' : 'disconnected',
    },
  });
});

// ─── API Routes ─────────────────────────────────────────
app.use(`${env.API_PREFIX}/auth`, authRouter);

// ─── 404 Catch-All ──────────────────────────────────────
app.use((_req, _res, next) => {
  next(new NotFoundError('API endpoint'));
});

// ─── Global Error Handler ───────────────────────────────
app.use(ErrorHandler.handle);

export default app;
