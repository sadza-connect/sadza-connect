import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { jobRepository } from '@/infrastructure/database/repositories/job-repository';
import { businessRepository } from '@/infrastructure/database/repositories/business-repository';
import { storageService } from '@/infrastructure/storage/storage-service';
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

    // Allow admin, employer, or the applicant email holder to delete the application
    const isApplicant = user.email.getValue().toLowerCase() === application.applicant_email.toLowerCase();

    if (!isAdmin && !isOwner && !isApplicant) {
      throw new AuthorizationError('You do not have permission to delete this job application');
    }

    await jobRepository.deleteApplication(id);

    // Cascading purge of attached CV from Cloudflare R2
    if (application.cv_url) {
      storageService.delete(application.cv_url).catch((err) =>
        console.error('Failed to purge application CV from storage:', err)
      );
    }

    return jsonResponse(
      {
        message: 'Job application deleted successfully and attached CV purged from storage.',
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
