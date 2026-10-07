import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { AuthService } from '@/application/auth/auth-service';
import { verifyEmailSchema } from '@/shared/validators/auth-validators';
import { authRateLimiter } from '@/shared/utils/rate-limiter';
import {
  getClientIp,
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { sanitizeUser } from '@/shared/utils/sanitize-user';

export const runtime = 'nodejs';

const authService = new AuthService();

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();
  const clientIp = getClientIp(req);

  try {
    authRateLimiter.check(clientIp);

    const body = await parseAndValidateBody(req, verifyEmailSchema);
    const { user } = await authService.verifyEmail(body.token);

    return jsonResponse(
      {
        user: sanitizeUser(user),
      },
      requestId,
      200,
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
