import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
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

const verifySchema = z.object({
  status: z.enum(['Verified', 'Rejected', 'Pending']),
  reason: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { slug } = await params;
    const user = await getAuthenticatedUser(req, true);
    if (!user || user.role !== 'admin') {
      throw new AuthorizationError('Admin privileges are required to perform KYC verification');
    }

    const existing = await businessRepository.findBySlug(slug);
    if (!existing) {
      throw new NotFoundError(`Business listing '${slug}' was not found`);
    }

    const body = await parseAndValidateBody(req, verifySchema);

    const updated = await businessRepository.verify(existing.id, body.status, body.reason);

    return jsonResponse(
      {
        message: `Business verification status updated to '${body.status}'.`,
        business: updated,
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
