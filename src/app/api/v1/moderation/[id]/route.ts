import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { moderationRepository } from '@/infrastructure/database/repositories/moderation-repository';
import { businessRepository } from '@/infrastructure/database/repositories/business-repository';
import { notificationRepository } from '@/infrastructure/database/repositories/notification-repository';
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

    if (updated.business_id && body.action !== 'dismiss') {
      const biz = await businessRepository.findById(updated.business_id);
      if (biz?.user_id) {
        await notificationRepository.createSafely({
          userId: biz.user_id,
          title: body.action === 'suspend' ? 'Business Suspended' : 'Listing Hidden',
          message:
            body.action === 'suspend'
              ? `Your business was suspended following a moderation report ("${updated.reason}"). Contact support to appeal.`
              : `Your listing "${updated.listing_title}" was hidden following a moderation report ("${updated.reason}").`,
          category: 'system',
          severity: 'urgent',
          actionUrl: '/contact',
          actionLabel: 'Contact Support',
        });
      }
    }

    if (updated.reporter_email) {
      await notificationRepository.createForEmailSafely(updated.reporter_email, {
        title: 'Your Report Was Reviewed',
        message: `Your report about "${updated.listing_title}" has been reviewed. Outcome: ${updated.status}.`,
        category: 'system',
        severity: 'info',
      });
    }

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
