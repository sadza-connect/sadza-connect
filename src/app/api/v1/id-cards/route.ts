import { NextRequest } from 'next/server';
import { randomUUID, randomInt } from 'node:crypto';
import { z } from 'zod';
import { idCardRepository } from '@/infrastructure/database/repositories/id-card-repository';
import { businessRepository } from '@/infrastructure/database/repositories/business-repository';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import {
  ValidationError,
  AuthorizationError,
} from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createIdCardSchema = z.object({
  card_number: z.string().optional(),
  prefix: z.enum(['HQ', 'VER']).default('VER'),
  business_id: z.string().uuid().optional(),
  business_name: z.string().optional(),
  member_name: z.string().min(2, 'Member name is required'),
  member_role: z.string().min(2, 'Role / Designation is required'),
  national_id: z.string().optional(),
  photo_url: z.string().optional(),
  status: z.enum(['Active', 'Suspended', 'Expired']).default('Active'),
});

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const businessId = searchParams.get('business_id') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const result = await idCardRepository.findCards({
      search,
      status,
      businessId,
      page,
      limit,
    });

    const stats = await idCardRepository.getSummaryStats();

    const user = await getAuthenticatedUser(req, false);
    const isAdmin = user?.role === 'admin';
    const sanitizedCards = result.cards.map((c) => ({
      ...c,
      national_id: isAdmin ? c.national_id : (c.national_id ? 'ENCRYPTED-ZW-ADMIN-VAULT' : null),
    }));

    return jsonResponse(
      {
        ...result,
        cards: sanitizedCards,
        stats,
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const user = await getAuthenticatedUser(req, true);
    if (!user) {
      throw new AuthorizationError('Authentication required to issue PVC membership ID cards');
    }

    const body = await parseAndValidateBody(req, createIdCardSchema);

    let enterpriseName = body.business_name;
    let targetBizId = body.business_id;

    if (targetBizId) {
      const biz = await businessRepository.findById(targetBizId);
      if (biz) enterpriseName = biz.name;
    } else if (!enterpriseName) {
      const myBiz = await businessRepository.findByUserId(user.id);
      if (myBiz.length > 0) {
        targetBizId = myBiz[0].id;
        enterpriseName = myBiz[0].name;
      } else {
        enterpriseName = 'Sadza Connect Commercial Member';
      }
    }

    const prefix = body.prefix || 'VER';
    const uniqueNum = randomInt(1000, 10000);
    const cardNumber = body.card_number || `SC-${prefix}-2026-${uniqueNum}`;

    const verificationUrl = `https://sadzaconnect.co.zw/verify-id/${cardNumber}`;

    const created = await idCardRepository.create({
      card_number: cardNumber,
      business_id: targetBizId,
      business_name: enterpriseName || 'Sadza Connect Commercial Registry',
      member_name: body.member_name.trim(),
      member_role: body.member_role.trim(),
      national_id: body.national_id?.trim() || null,
      status: body.status || 'Active',
      qr_code_payload: verificationUrl,
      photo_url: body.photo_url?.trim() || null,
    });

    return jsonResponse(
      {
        message: 'Official PVC ID Card registered successfully.',
        card: created,
        verification_url: verificationUrl,
      },
      requestId,
      201
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
