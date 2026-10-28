import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { AuthService } from '@/application/auth/auth-service';
import { loginSchema } from '@/shared/validators/auth-validators';
import { authRateLimiter } from '@/shared/utils/rate-limiter';
import {
  getClientIp,
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { sanitizeUser } from '@/shared/utils/sanitize-user';
import { AuthenticationError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const authService = new AuthService();

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();
  const clientIp = getClientIp(req);

  try {
    authRateLimiter.check(clientIp);

    const body = await parseAndValidateBody(req, loginSchema);
    const loginIdentifier = body.identifier || body.email || body.phoneNumber;

    if (!loginIdentifier) {
      throw new AuthenticationError('Please enter your email or phone number');
    }

    const userAgent = req.headers.get('user-agent') || undefined;

    const { user, tokens } = await authService.login(
      loginIdentifier,
      body.password,
      userAgent,
      clientIp,
    );

    const response = jsonResponse(
      {
        user: sanitizeUser(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      requestId,
      200,
    );

    response.cookies.set('sadza_access_token', tokens.accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    response.cookies.set('sadza_refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
