import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { jobRepository } from '@/infrastructure/database/repositories/job-repository';
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

const updateStatusSchema = z.object({
  status: z.enum(['Submitted', 'Under Review', 'Shortlisted', 'Rejected']),
});

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

    const application = await jobRepository.findApplicationById(id);
    if (!application) {
      throw new NotFoundError(`Job application '${id}' was not found`);
    }

    const isAdmin = user.role === 'admin';
    let isOwner = false;

    if (application.business_id) {
      const business = await businessRepository.findById(application.business_id);
      if (business && business.user_id === user.id) {
        isOwner = true;
      }
    }

    if (!isAdmin && !isOwner) {
      throw new AuthorizationError('You do not have permission to manage this applicant');
    }

    const body = await parseAndValidateBody(req, updateStatusSchema);
    const updated = await jobRepository.updateApplicationStatus(id, body.status);

    return jsonResponse(
      {
        message: `Applicant status updated to '${body.status}'.`,
        application: updated,
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
