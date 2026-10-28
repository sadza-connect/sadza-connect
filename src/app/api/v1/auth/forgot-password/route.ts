import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { AuthService } from '@/application/auth/auth-service';
import { forgotPasswordSchema } from '@/shared/validators/auth-validators';
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

    const body = await parseAndValidateBody(req, forgotPasswordSchema);
    const target = (body.identifier || body.email)!.trim();
    await authService.forgotPassword(target);

    return jsonResponse(null, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
