import type { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../../application/auth/jwt-service.js';
import { AuthenticationError } from '../../../shared/errors/index.js';
import { logger } from '../../../shared/logging/logger.js';

const jwtService = new JwtService();

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: string;
    email: string;
    accountType: string;
  };
}

export function softAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwtService.verifyAccessToken(token);
    (req as AuthenticatedRequest).user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
      accountType: payload.accountType,
    };
  } catch (err) {
    logger.debug({ err }, 'softAuthenticate: invalid or expired token — proceeding as unauthenticated');
  }
  next();
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthenticationError('Missing or invalid Authorization header'));
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwtService.verifyAccessToken(token);
    (req as AuthenticatedRequest).user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
      accountType: payload.accountType,
    };
    next();
  } catch {
    return next(new AuthenticationError('Invalid or expired access token'));
  }
}
