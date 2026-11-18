import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { subscriptionLifecycleService } from '@/application/subscriptions/subscription-lifecycle-service';
import { jsonResponse, errorResponse } from '@/shared/utils/route-handler';
import { AuthorizationError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Daily subscription lifecycle job (see vercel.json).
 * Vercel Cron automatically sends `Authorization: Bearer ${CRON_SECRET}`.
 * External schedulers (GitHub Actions, cron-job.org) can use the same header.
 */
export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
      throw new AuthorizationError('CRON_SECRET is not configured');
    }
    if (req.headers.get('authorization') !== `Bearer ${secret}`) {
      throw new AuthorizationError('Invalid cron credentials');
    }

    const summary = await subscriptionLifecycleService.run();
    return jsonResponse(summary, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
