import { RateLimitError } from '../errors/AppError.js';
import { env } from '../../config/env.js';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

class MemoryRateLimiter {
  private store = new Map<string, RateLimitRecord>();

  constructor(
    private readonly windowMs: number,
    private readonly maxRequests: number,
    private readonly message = 'Too many requests. Please try again later.',
  ) {
    // Periodic cleanup every 5 minutes to avoid memory leaks
    if (typeof setInterval !== 'undefined') {
      const interval = setInterval(() => {
        const now = Date.now();
        this.store.forEach((record, key) => {
          if (now > record.resetAt) {
            this.store.delete(key);
          }
        });
      }, 5 * 60 * 1000);
      if (interval.unref) interval.unref();
    }
  }

  check(identifier: string): void {
    if (env.NODE_ENV === 'test') return;

    const now = Date.now();
    const record = this.store.get(identifier);

    if (!record || now > record.resetAt) {
      this.store.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return;
    }

    if (record.count >= this.maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      throw new RateLimitError(retryAfterSeconds, this.message);
    }

    record.count += 1;
  }
}

export const globalRateLimiter = new MemoryRateLimiter(
  env.RATE_LIMIT_WINDOW_MS,
  env.RATE_LIMIT_MAX,
);

export const authRateLimiter = new MemoryRateLimiter(
  15 * 60 * 1000,
  20,
  'Too many authentication attempts. Please try again in 15 minutes.',
);

export const otpRateLimiter = new MemoryRateLimiter(
  15 * 60 * 1000,
  10,
  'Too many OTP attempts. Please request a new code or try again later.',
);
