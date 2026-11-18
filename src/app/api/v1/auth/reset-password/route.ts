import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { notificationRepository } from '@/infrastructure/database/repositories/notification-repository';
import { AuthService } from '@/application/auth/auth-service';
import { resetPasswordSchema } from '@/shared/validators/auth-validators';
import { authRateLimiter } from '@/shared/utils/rate-limiter';
import {
  getClientIp,
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const authService = new AuthService();

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();
  const clientIp = getClientIp(req);

  try {
    authRateLimiter.check(clientIp);

    const body = await parseAndValidateBody(req, resetPasswordSchema);
    const userId = await authService.resetPassword(body.resetToken, body.password);

    await notificationRepository.createSafely({
      userId,
      title: 'Password Reset',
      message:
        'Your password was reset and all other sessions were signed out. If this was not you, contact support immediately.',
      category: 'system',
      severity: 'warning',
      actionUrl: '/contact',
      actionLabel: 'Contact Support',
    });

    return jsonResponse(null, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
