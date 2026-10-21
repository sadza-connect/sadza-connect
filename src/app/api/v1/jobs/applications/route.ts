import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { jobRepository } from '@/infrastructure/database/repositories/job-repository';
import { businessRepository } from '@/infrastructure/database/repositories/business-repository';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import {
  jsonResponse,
  errorResponse,
} from '@/shared/utils/route-handler';
import { AuthorizationError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const user = await getAuthenticatedUser(req, true);
    if (!user) {
      throw new AuthorizationError('Authentication required to view candidate job applications');
    }

    const { searchParams } = new URL(req.url);

    const jobId = searchParams.get('job_id') || undefined;
    let businessId = searchParams.get('business_id') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (user.role !== 'admin') {
      const myBusinesses = await businessRepository.findByUserId(user.id);
      const myBusinessIds = myBusinesses.map((b) => b.id);

      // A business user can only query applications for their own businesses
      if (businessId && !myBusinessIds.includes(businessId)) {
        throw new AuthorizationError('You do not have permission to view applications for this business');
      }
      if (!businessId) {
        businessId = myBusinessIds[0] || '00000000-0000-0000-0000-000000000000';
      }
    }

    const result = await jobRepository.findApplications({
      jobId,
      businessId,
      status,
      page,
      limit,
    });

    return jsonResponse(result, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
