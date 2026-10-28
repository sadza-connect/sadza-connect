import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { AuthService } from '@/application/auth/auth-service';
import { verifyResetOtpSchema } from '@/shared/validators/auth-validators';
import { otpRateLimiter } from '@/shared/utils/rate-limiter';
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
    otpRateLimiter.check(clientIp);

    const body = await parseAndValidateBody(req, verifyResetOtpSchema);
    const target = (body.identifier || body.email)!.trim();
    const { resetToken } = await authService.verifyResetOtp(target, body.otp);

    return jsonResponse(
      {
        resetToken,
      },
      requestId,
      200,
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
