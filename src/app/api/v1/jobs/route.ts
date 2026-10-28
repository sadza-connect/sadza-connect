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
  ValidationError,
  AuthorizationError,
  NotFoundError,
} from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createJobSchema = z.object({
  business_id: z.string().uuid().optional(),
  business_slug: z.string().optional(),
  title: z.string().min(3, 'Job title is required'),
  province: z.string().min(2, 'Province is required'),
  city: z.string().optional(),
  job_type: z.string().optional(),
  salary_usd: z.string().optional(),
  category: z.string().optional(),
  whatsapp: z.string().optional(),
  description: z.string().min(10, 'Job description is required'),
  requirements: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const province = searchParams.get('province') || undefined;
    const jobType = searchParams.get('job_type') || searchParams.get('type') || undefined;
    const businessId = searchParams.get('business_id') || undefined;
    const isFeaturedParam = searchParams.get('is_featured');
    const isFeatured = isFeaturedParam !== null ? isFeaturedParam === 'true' : undefined;
    const isActiveParam = searchParams.get('is_active');
    const isActive = isActiveParam !== null ? isActiveParam === 'true' : undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await jobRepository.findJobs({
      search,
      category,
      province,
      jobType,
      businessId,
      isFeatured,
      isActive,
      page,
      limit,
    });

    return jsonResponse(result, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const user = await getAuthenticatedUser(req, true);
    if (!user) {
      throw new AuthorizationError('Authentication required to post job vacancies');
    }

    const body = await parseAndValidateBody(req, createJobSchema);

    let targetBusinessId = body.business_id;

    if (!targetBusinessId && body.business_slug) {
      const biz = await businessRepository.findBySlug(body.business_slug);
      if (biz) targetBusinessId = biz.id;
    }

    if (!targetBusinessId) {
      const myBusinesses = await businessRepository.findByUserId(user.id);
      if (myBusinesses.length > 0) {
        targetBusinessId = myBusinesses[0].id;
      }
    }

    if (!targetBusinessId) {
      throw new ValidationError('A valid business ID or slug is required to post a job');
    }

    const business = await businessRepository.findById(targetBusinessId);
    if (!business) {
      throw new NotFoundError('Target hiring enterprise was not found');
    }

    const isAdmin = user.role === 'admin';
    const isOwner = business.user_id === user.id;

    if (!isAdmin && !isOwner) {
      throw new AuthorizationError('You can only post jobs for your own registered enterprise');
    }

    const job = await jobRepository.create({
      business_id: targetBusinessId,
      company_name: business.name,
      title: body.title.trim(),
      province: body.province || business.province,
      city: body.city || business.city || business.province,
      job_type: body.job_type || 'Full-time',
      salary_usd: body.salary_usd || 'Negotiable USD',
      category: body.category || business.sector || 'General Commercial',
      whatsapp: body.whatsapp || business.whatsapp || null,
      description: body.description.trim(),
      requirements: body.requirements || [],
      is_featured: body.is_featured ?? false,
      is_active: body.is_active ?? true,
    });

    return jsonResponse(
      {
        message: 'Job vacancy published successfully.',
        job,
      },
      requestId,
      201
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
