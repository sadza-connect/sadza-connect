import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { AuthService } from '@/application/auth/auth-service';
import { logoutSchema } from '@/shared/validators/auth-validators';
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

    const body = await parseAndValidateBody(req, logoutSchema).catch(() => ({ refreshToken: undefined }));
    let tokenToRevoke = body.refreshToken;
    if (!tokenToRevoke) {
      tokenToRevoke = req.cookies.get('sadza_refresh_token')?.value;
    }

    if (tokenToRevoke) {
      try {
        await authService.logout(tokenToRevoke);
      } catch {
        // Silently continue logout cleanup even if token revocation fails
      }
    }

    const response = jsonResponse(null, requestId, 200);
    response.cookies.delete('sadza_access_token');
    response.cookies.delete('sadza_refresh_token');
    return response;
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
