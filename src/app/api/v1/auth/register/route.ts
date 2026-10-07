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

export const runtime = 'nodejs';

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
