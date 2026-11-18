import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { userRepository } from '@/infrastructure/database/repositories/user-repository';
import { businessRepository } from '@/infrastructure/database/repositories/business-repository';
import { productRepository } from '@/infrastructure/database/repositories/product-repository';
import { RefreshTokenRepository } from '@/infrastructure/database/repositories/refresh-token-repository';
import { getDb } from '@/infrastructure/database/connection';
import { storageService } from '@/infrastructure/storage/storage-service';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import { invalidateBusinessDirectoryCache } from '@/app/api/v1/businesses/route';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { AuthorizationError, NotFoundError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const refreshTokenRepo = new RefreshTokenRepository();

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
      if (data.status === 'suspended') {
        await refreshTokenRepo.revokeAllForUser(id);
      }
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
    if (!existingUser) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    const db = getDb();
    const filesToPurge: string[] = [];
    if (existingUser.avatarUrl) filesToPurge.push(existingUser.avatarUrl);

    // 1. Collect & delete all businesses owned by this user (cascades products, jobs, adverts, id_cards, moderation_reports)
    const ownedBusinesses = await businessRepository.findByUserId(id);
    for (const biz of ownedBusinesses) {
      if (biz.logo_url) filesToPurge.push(biz.logo_url);
      if (biz.cover_url) filesToPurge.push(biz.cover_url);
      if (Array.isArray(biz.gallery)) {
        for (const item of biz.gallery) {
          if (typeof item === 'string') filesToPurge.push(item);
          else if (item?.url) filesToPurge.push(item.url);
        }
      }
      if (Array.isArray(biz.kyc_documents)) {
        for (const doc of biz.kyc_documents) {
          if (typeof doc === 'string') filesToPurge.push(doc);
          else if (doc?.url) filesToPurge.push(doc.url);
        }
      }
      try {
        const products = await productRepository.findByBusinessId(biz.id);
        for (const prod of products) {
          if (Array.isArray(prod.images)) filesToPurge.push(...prod.images);
        }
      } catch {}
    }

    let deletedBusinesses = 0;
    if (ownedBusinesses.length > 0) {
      deletedBusinesses = await db('businesses').where({ user_id: id }).del();
      invalidateBusinessDirectoryCache();
    }

    // 2. Delete user-owned property & tourism listings so nothing orphaned remains active
    await db('properties').where({ user_id: id }).del();
    await db('tourism_listings').where({ user_id: id }).del();

    // 3. Hard-delete user row (cascades refresh_tokens, email_verification_tokens, password_reset_tokens, notifications)
    const deleted = await userRepository.hardDelete(id);
    if (!deleted) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    // 4. Purge collected assets from storage asynchronously
    for (const keyOrUrl of filesToPurge) {
      storageService.delete(keyOrUrl).catch((err) =>
        console.error('Failed to purge deleted user asset from storage:', err)
      );
    }

    return jsonResponse(
      {
        message: `User account and ${deletedBusinesses} associated business(es) permanently deleted.`,
        deletedBusinesses,
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
