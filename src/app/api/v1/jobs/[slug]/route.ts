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

const updateJobSchema = z.object({
  title: z.string().min(3).optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  job_type: z.string().optional(),
  salary_usd: z.string().optional(),
  category: z.string().optional(),
  whatsapp: z.string().optional(),
  description: z.string().min(10).optional(),
  requirements: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { slug } = await params;
    const job = await jobRepository.findBySlug(slug);

    if (!job) {
      throw new NotFoundError(`Job opening '${slug}' was not found`);
    }

    return jsonResponse({ job }, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { slug } = await params;
    const user = await getAuthenticatedUser(req, true);
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    const existing = await jobRepository.findBySlug(slug);
    if (!existing) {
      throw new NotFoundError(`Job opening '${slug}' was not found`);
    }

    const business = await businessRepository.findById(existing.business_id);
    const isAdmin = user.role === 'admin';
    const isOwner = business && business.user_id === user.id;

    if (!isAdmin && !isOwner) {
      throw new AuthorizationError('You do not have permission to modify this job vacancy');
    }

    const body = await parseAndValidateBody(req, updateJobSchema);
    const updated = await jobRepository.update(existing.id, body);

    return jsonResponse(
      {
        message: 'Job opening updated successfully.',
        job: updated,
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
  { params }: { params: Promise<{ slug: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { slug } = await params;
    const user = await getAuthenticatedUser(req, true);
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    const existing = await jobRepository.findBySlug(slug);
    if (!existing) {
      throw new NotFoundError(`Job opening '${slug}' was not found`);
    }

    const business = await businessRepository.findById(existing.business_id);
    const isAdmin = user.role === 'admin';
    const isOwner = business && business.user_id === user.id;

    if (!isAdmin && !isOwner) {
      throw new AuthorizationError('You do not have permission to delete this job vacancy');
    }

    await jobRepository.delete(existing.id);

    return jsonResponse(
      {
        message: 'Job vacancy deleted successfully.',
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
