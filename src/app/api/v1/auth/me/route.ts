import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { JwtService } from '@/application/auth/jwt-service';
import { UserRepository } from '@/infrastructure/database/repositories/user-repository';
import {
  jsonResponse,
  errorResponse,
} from '@/shared/utils/route-handler';
import { sanitizeUser } from '@/shared/utils/sanitize-user';
import { AuthenticationError, NotFoundError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';

const jwtService = new JwtService();
const userRepo = new UserRepository();

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    let token = '';
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else {
      token = req.cookies.get('sadza_access_token')?.value || '';
    }

    if (!token) {
      throw new AuthenticationError('Missing or invalid Authorization');
    }
    let payload;
    try {
      payload = jwtService.verifyAccessToken(token);
    } catch {
      throw new AuthenticationError('Invalid or expired access token');
    }

    const user = await userRepo.findById(payload.sub);
    if (!user) {
      throw new NotFoundError('User');
    }

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
