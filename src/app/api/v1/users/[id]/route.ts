import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { userRepository } from '@/infrastructure/database/repositories/user-repository';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { AuthorizationError, NotFoundError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const updateUserSchema = z.object({
  role: z.enum(['admin', 'merchant', 'customer']).optional(),
  status: z.enum(['active', 'suspended', 'pending_verification']).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();
  const { id } = await params;

  try {
    const caller = await getAuthenticatedUser(req, true);
    if (!caller || caller.role !== 'admin') {
      throw new AuthorizationError('Administrative privileges required');
    }

    const data = await parseAndValidateBody(req, updateUserSchema);

    let updated = null;
    if (data.role) {
      updated = await userRepository.updateRole(id, data.role);
    }
    if (data.status) {
      updated = await userRepository.updateStatus(id, data.status);
    }

    if (!updated) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    return jsonResponse(
      {
        user: updated,
        message: 'User account updated successfully',
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();
  const { id } = await params;

  try {
    const caller = await getAuthenticatedUser(req, true);
    if (!caller || caller.role !== 'admin') {
      throw new AuthorizationError('Administrative privileges required');
    }

    if (caller.id === id) {
      throw new AuthorizationError('Administrators cannot delete their own active account');
    }

    const deleted = await userRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    return jsonResponse(
      {
        message: 'User account deleted successfully',
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
