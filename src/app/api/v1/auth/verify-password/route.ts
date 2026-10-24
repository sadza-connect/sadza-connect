import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { AuthenticationError, AuthorizationError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';

const verifyPasswordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const caller = await getAuthenticatedUser(req, true);
    if (!caller || caller.role !== 'admin') {
      throw new AuthorizationError('Administrative privileges required');
    }

    const { password } = await parseAndValidateBody(req, verifyPasswordSchema);

    const isValid = await bcrypt.compare(password, caller.passwordHash.getValue());
    if (!isValid) {
      throw new AuthenticationError('Invalid administrator credentials');
    }

    return jsonResponse(
      {
        valid: true,
        message: 'Administrator password verified successfully',
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
