import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { AuthService } from '@/application/auth/auth-service';
import { registerSchema } from '@/shared/validators/auth-validators';
import { authRateLimiter } from '@/shared/utils/rate-limiter';
import {
  getClientIp,
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { sanitizeUser } from '@/shared/utils/sanitize-user';
import { notificationRepository } from '@/infrastructure/database/repositories/notification-repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const authService = new AuthService();

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();
  const clientIp = getClientIp(req);

  try {
    authRateLimiter.check(clientIp);

    const body = await parseAndValidateBody(req, registerSchema);

    const { user } = await authService.register({
      accountType: body.accountType ?? 'personal',
      fullName: body.fullName,
      email: body.email,
      password: body.password,
      phoneNumber: body.phoneNumber,
      province: body.province,
      businessName: body.businessName,
      sector: body.sector,
      businessStructure: body.businessStructure,
    });

    await notificationRepository.createSafely({
      userId: user.id,
      title: 'Welcome to MySadza Connect',
      message:
        'Your account has been created. Verify your email, complete your profile and explore the marketplace.',
      category: 'system',
      severity: 'success',
      actionUrl: '/dashboard/user',
      actionLabel: 'Open Dashboard',
    });

    return jsonResponse(
      {
        user: sanitizeUser(user),
      },
      requestId,
      201,
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
