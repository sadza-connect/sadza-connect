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
  ValidationError,
} from '@/shared/errors/AppError';

export const runtime = 'nodejs';

const updateBusinessSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  sector: z.string().optional(),
  business_type: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  website: z.string().optional(),
  logo_url: z.string().optional(),
  cover_url: z.string().optional(),
  gallery: z.array(z.any()).optional(),
  operating_hours: z.record(z.any()).optional(),
  kyc_documents: z.array(z.any()).optional(),
  is_featured: z.boolean().optional(),
  onboarding_track: z.string().optional(),
  legal_form: z.string().optional(),
  applicant_role: z.string().optional(),
  verification_badge: z.string().optional(),
  registration_number: z.string().optional(),
  custom_monthly_price_usd: z.number().nonnegative().nullable().optional(),
  product_limit: z.number().int().positive().optional(),
  catalog_tier: z.string().optional(),
  custom_product_limit: z.number().int().positive().nullable().optional(),
  is_verified: z.boolean().optional(),
  verification_status: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { slug } = await params;
    const details = await businessRepository.findBusinessWithDetails(slug);

    if (!details) {
      throw new NotFoundError(`Business listing '${slug}' was not found`);
    }

    const user = await getAuthenticatedUser(req, false);
    const isOwnerOrAdmin =
      user?.role === 'admin' || (user && details.business.user_id === user.id);

    // Active Storefront Rule: If 30-day grace period expired without payment, invisible to public visitors
    const createdTime = details.business.created_at ? new Date(details.business.created_at).getTime() : Date.now();
    const daysPassed = Math.floor((Date.now() - createdTime) / (1000 * 60 * 60 * 24));
    const isExpired =
      (details.business as any).subscription_status === 'Expired' ||
      ((details.business as any).subscription_status !== 'Paid Subscriber' && daysPassed >= 30);

    if (isExpired && !isOwnerOrAdmin) {
      throw new NotFoundError('This business listing is temporarily inactive pending subscription renewal.');
    }

    const sanitizedBusiness = { ...details.business };
    if (!isOwnerOrAdmin) {
      delete (sanitizedBusiness as any).kyc_documents;
    }

    return jsonResponse(
      {
        ...details,
        business: sanitizedBusiness,
      },
      requestId,
      200
    );
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

    const existing = await businessRepository.findBySlug(slug);
    if (!existing) {
      throw new NotFoundError(`Business listing '${slug}' was not found`);
    }

    // Permission check: must be owner or admin
    const isAdmin = user.role === 'admin';
    const isOwner = existing.user_id === user.id;

    if (!isAdmin && !isOwner) {
      throw new AuthorizationError('You do not have permission to edit this business listing');
    }

    const body = await parseAndValidateBody(req, updateBusinessSchema);

    // CRITICAL SECURITY RULE: Non-admins cannot alter primary locked identity fields
    if (!isAdmin) {
      if (body.name && body.name !== existing.name) {
        throw new ValidationError('Registered Business Name is permanently locked for KYC compliance.');
      }
      if (body.email && body.email !== existing.email) {
        throw new ValidationError('Registration Email is permanently locked for KYC compliance.');
      }
      if (body.phone && body.phone !== existing.phone) {
        throw new ValidationError('Primary Registration Phone is permanently locked for KYC compliance.');
      }
      if (body.custom_product_limit !== undefined && body.custom_product_limit !== existing.custom_product_limit) {
        throw new AuthorizationError('Custom product limit overrides can only be configured by Platform Administrators.');
      }
      if (body.custom_monthly_price_usd !== undefined && body.custom_monthly_price_usd !== existing.custom_monthly_price_usd) {
        throw new AuthorizationError('Custom monthly price overrides can only be configured by Platform Administrators.');
      }
      if (body.is_verified !== undefined && body.is_verified !== existing.is_verified) {
        throw new AuthorizationError('KYC verification status can only be modified by Platform Administrators.');
      }
      if (body.verification_status !== undefined && body.verification_status !== existing.verification_status) {
        throw new AuthorizationError('KYC verification status can only be modified by Platform Administrators.');
      }
    }

    const updated = await businessRepository.update(existing.id, body);

    return jsonResponse(
      {
        message: 'Business listing updated successfully.',
        business: updated,
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

    const existing = await businessRepository.findBySlug(slug);
    if (!existing) {
      throw new NotFoundError(`Business listing '${slug}' was not found`);
    }

    const isAdmin = user.role === 'admin';
    const isOwner = existing.user_id === user.id;

    if (!isAdmin && !isOwner) {
      throw new AuthorizationError('You do not have permission to delete this business listing');
    }

    await businessRepository.delete(existing.id);

    return jsonResponse(
      {
        message: 'Business listing deleted successfully.',
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
