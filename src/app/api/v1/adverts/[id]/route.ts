import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { advertRepository } from '@/infrastructure/database/repositories/advert-repository';
import { businessRepository } from '@/infrastructure/database/repositories/business-repository';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import {
  NotFoundError,
  AuthorizationError,
} from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const updateAdvertSchema = z.object({
  business_name: z.string().min(2).optional(),
  business_type: z.string().optional(),
  province: z.string().optional(),
  category: z.string().optional(),
  offer_type: z.string().optional(),
  headline: z.string().min(3).optional(),
  offer_text: z.string().min(5).optional(),
  promo_badge: z.string().optional(),
  original_price_usd: z.number().positive().optional(),
  promo_price_usd: z.number().positive().optional(),
  price_zig: z.number().optional(),
  valid_until: z.string().optional(),
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  image: z.string().optional(),
  featured_on_home: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { id } = await params;
    const advert = await advertRepository.findById(id);

    if (!advert) {
      throw new NotFoundError(`Advert '${id}' was not found`);
    }

    return jsonResponse({ advert }, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(req, true);
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    const existing = await advertRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Advert '${id}' was not found`);
    }

    const isAdmin = user.role === 'admin';
    let isOwner = false;

    if (existing.business_id) {
      const business = await businessRepository.findById(existing.business_id);
      if (business && business.user_id === user.id) {
        isOwner = true;
      }
    }

    if (!isAdmin && !isOwner) {
      throw new AuthorizationError('You do not have permission to edit this promotion');
    }

    const body = await parseAndValidateBody(req, updateAdvertSchema);
    const updated = await advertRepository.update(id, body);

    return jsonResponse(
      {
        message: 'Sponsored campaign updated successfully.',
        advert: updated,
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

  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(req, true);
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    const existing = await advertRepository.findById(id);
    if (!existing) {
      if (user.role === 'admin') {
        return jsonResponse(
          {
            message: 'Advert was not found or has already been deleted.',
          },
          requestId,
          200
        );
      }
      throw new NotFoundError(`Advert '${id}' was not found`);
    }

    const isAdmin = user.role === 'admin';
    let isOwner = false;

    if (existing.business_id) {
      const business = await businessRepository.findById(existing.business_id);
      if (business && business.user_id === user.id) {
        isOwner = true;
      }
    }

    if (!isAdmin && !isOwner) {
      throw new AuthorizationError('You do not have permission to delete this promotion');
    }

    await advertRepository.delete(id);

    return jsonResponse(
      {
        message: 'Sponsored campaign deleted successfully.',
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
