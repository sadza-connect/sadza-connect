import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { moderationRepository } from '@/infrastructure/database/repositories/moderation-repository';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import { jsonResponse, errorResponse, parseAndValidateBody } from '@/shared/utils/route-handler';
import { AuthorizationError, NotFoundError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const enforcementSchema = z.object({
  action: z.enum(['dismiss', 'hide', 'suspend']),
  admin_notes: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const caller = await getAuthenticatedUser(req, true);
    if (!caller || caller.role !== 'admin') {
      throw new AuthorizationError('Administrative privileges required');
    }

    const { id } = await params;
    const report = await moderationRepository.findById(id);
    if (!report) {
      throw new NotFoundError(`Moderation report '${id}' was not found`);
    }

    return jsonResponse(report, requestId, 200);
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
    const caller = await getAuthenticatedUser(req, true);
    if (!caller || caller.role !== 'admin') {
      throw new AuthorizationError('Administrative privileges required');
    }

    const { id } = await params;
    const body = await parseAndValidateBody(req, enforcementSchema);

    const updated = await moderationRepository.applyEnforcement(
      id,
      body.action,
      body.admin_notes
    );

    return jsonResponse(
      {
        message: `Moderation report enforcement action '${body.action}' successfully executed.`,
        report: updated,
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
