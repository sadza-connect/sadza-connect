import pino from 'pino';
import { env } from '../../config/env.js';

/**
 * Serverless-safe Pino logger.
 * Avoids worker-thread transports (pino-pretty) which crash inside
 * Netlify / AWS Lambda serverless functions due to bundled path resolution.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.token',
      'body.refreshToken',
      'body.resetToken',
    ],
    censor: '[REDACTED]',
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      requestId: req.requestId,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});
