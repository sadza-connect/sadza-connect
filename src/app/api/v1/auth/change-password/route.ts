import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import { userRepository } from '@/infrastructure/database/repositories/user-repository';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { AuthenticationError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const caller = await getAuthenticatedUser(req, true);
    if (!caller) {
      throw new AuthenticationError('Authentication required');
    }

    const { currentPassword, newPassword } = await parseAndValidateBody(
      req,
      changePasswordSchema
    );

    const isMatch = await bcrypt.compare(
      currentPassword,
      caller.passwordHash.getValue()
    );
    if (!isMatch) {
      throw new AuthenticationError('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    const updated = await userRepository.updatePasswordHash(caller.id, newHash);
    if (!updated) {
      throw new Error('Failed to update password in database');
    }

    return jsonResponse(
      {
        success: true,
        message: 'Password rotated successfully',
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
