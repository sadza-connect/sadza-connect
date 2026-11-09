import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { userRepository } from '@/infrastructure/database/repositories/user-repository';
import { storageService } from '@/infrastructure/storage/storage-service';
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
  avatar_url: z.string().nullable().optional(),
  full_name: z.string().optional(),
  phone_number: z.string().optional(),
  province: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();
  const { id } = await params;

  try {
    const caller = await getAuthenticatedUser(req, true);
    if (!caller) {
      throw new AuthorizationError('Authentication required');
    }

    const isSelf = caller.id === id;
    const isAdmin = caller.role === 'admin';

    if (!isSelf && !isAdmin) {
      throw new AuthorizationError('Unauthorized to modify this profile');
    }

    const data = await parseAndValidateBody(req, updateUserSchema);

    // Only administrators can change account roles and statuses
    if ((data.role || data.status) && !isAdmin) {
      throw new AuthorizationError('Administrative privileges required to modify user role or status');
    }

    // Track old avatar if avatar is being modified or removed
    let oldAvatarToPurge: string | null = null;
    if (data.avatar_url !== undefined) {
      const existingUser = await userRepository.findById(id);
      if (existingUser?.avatarUrl && existingUser.avatarUrl !== data.avatar_url) {
        oldAvatarToPurge = existingUser.avatarUrl;
      }
    }

    let updated = null;
    if (data.role && isAdmin) {
      updated = await userRepository.updateRole(id, data.role);
    }
    if (data.status && isAdmin) {
      updated = await userRepository.updateStatus(id, data.status);
    }
    if (
      data.avatar_url !== undefined ||
      data.full_name !== undefined ||
      data.phone_number !== undefined ||
      data.province !== undefined
    ) {
      updated = await userRepository.updateProfile(id, {
        avatar_url: data.avatar_url,
        full_name: data.full_name,
        phone_number: data.phone_number,
        province: data.province,
      });
    }

    if (!updated) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    // Purge replaced avatar from Cloudflare R2
    if (oldAvatarToPurge) {
      storageService.delete(oldAvatarToPurge).catch((err) =>
        console.error('Failed to purge previous avatar from storage:', err)
      );
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

    const existingUser = await userRepository.findById(id);
    const deleted = await userRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    // Purge avatar from Cloudflare R2
    if (existingUser?.avatarUrl) {
      storageService.delete(existingUser.avatarUrl).catch((err) =>
        console.error('Failed to purge deleted user avatar from storage:', err)
      );
    }

    return jsonResponse(
      {
        message: 'User account deleted successfully and avatar purged from storage',
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
