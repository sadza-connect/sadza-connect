import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { analyticsRepository } from '@/infrastructure/database/repositories/analytics-repository';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import { jsonResponse, errorResponse } from '@/shared/utils/route-handler';
import { AuthorizationError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    // 1. Strict Role-Level Security: Only Super Admin can view global analytics
    const user = await getAuthenticatedUser(req, true);
    if (!user || user.role !== 'admin') {
      throw new AuthorizationError('Super Admin authority required to access platform traffic analytics');
    }

    // 2. Parse timeframe
    const { searchParams } = new URL(req.url);
    const rawDays = searchParams.get('days');
    const days = rawDays ? Math.max(1, Math.min(365, parseInt(rawDays, 10) || 30)) : 30;

    // 3. Aggregate metrics from PostgreSQL
    const overview = await analyticsRepository.getAggregatedOverview(days);

    return jsonResponse(overview, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
