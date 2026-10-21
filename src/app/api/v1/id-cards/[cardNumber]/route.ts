import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { idCardRepository } from '@/infrastructure/database/repositories/id-card-repository';
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

const updateIdCardSchema = z.object({
  status: z.enum(['Active', 'Suspended', 'Expired']).optional(),
  member_name: z.string().min(2).optional(),
  member_role: z.string().min(2).optional(),
  national_id: z.string().optional(),
  photo_url: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cardNumber: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { cardNumber } = await params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cardNumber);

    let card = null;
    if (isUuid) {
      card = await idCardRepository.findById(cardNumber);
    }
    if (!card) {
      card = await idCardRepository.findByCardNumber(cardNumber);
    }

    if (!card) {
      throw new NotFoundError(`PVC ID Card '${cardNumber}' was not found`);
    }

    // Shield National Identity Document number unless authenticated administrator
    const user = await getAuthenticatedUser(req, false);
    const isAdmin = user?.role === 'admin';
    const sanitizedCard = {
      ...card,
      national_id: isAdmin ? card.national_id : (card.national_id ? 'ENCRYPTED-ZW-ADMIN-VAULT' : null),
    };

    return jsonResponse({ card: sanitizedCard }, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ cardNumber: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const user = await getAuthenticatedUser(req, true);
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    const { cardNumber } = await params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cardNumber);

    let card = null;
    if (isUuid) {
      card = await idCardRepository.findById(cardNumber);
    }
    if (!card) {
      card = await idCardRepository.findByCardNumber(cardNumber);
    }

    if (!card) {
      throw new NotFoundError(`PVC ID Card '${cardNumber}' was not found`);
    }

    const body = await parseAndValidateBody(req, updateIdCardSchema);
    const updated = await idCardRepository.update(card.id, body);

    return jsonResponse(
      {
        message: 'PVC ID Card record updated successfully.',
        card: updated,
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
  { params }: { params: Promise<{ cardNumber: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const user = await getAuthenticatedUser(req, true);
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    const { cardNumber } = await params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cardNumber);

    let card = null;
    if (isUuid) {
      card = await idCardRepository.findById(cardNumber);
    }
    if (!card) {
      card = await idCardRepository.findByCardNumber(cardNumber);
    }

    if (!card) {
      throw new NotFoundError(`PVC ID Card '${cardNumber}' was not found`);
    }

    await idCardRepository.delete(card.id);

    return jsonResponse(
      {
        message: 'PVC ID Card revoked and removed successfully.',
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
