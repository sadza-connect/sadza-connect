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
import { ValidationError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';

const createBusinessSchema = z.object({
  name: z.string().min(2, 'Business name must have at least 2 characters'),
  province: z.string().min(2, 'Province is required'),
  city: z.string().optional(),
  address: z.string().optional(),
  sector: z.string().optional(),
  business_type: z.string().optional(),
  onboarding_track: z.string().optional(),
  legal_form: z.string().optional(),
  applicant_role: z.string().optional(),
  verification_badge: z.string().optional(),
  registration_number: z.string().optional(),
  custom_monthly_price_usd: z.number().nonnegative().nullable().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  logo_url: z.string().optional(),
  cover_url: z.string().optional(),
  gallery: z.array(z.any()).optional(),
  operating_hours: z.record(z.any()).optional(),
  kyc_documents: z.array(z.any()).optional(),
});

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { searchParams } = new URL(req.url);

    // Check if requesting merchant's own business
    const myBusiness = searchParams.get('my_business') === 'true';
    if (myBusiness) {
      const user = await getAuthenticatedUser(req, true);
      if (!user) {
        throw new ValidationError('Authentication required to view your registered business');
      }
      const businesses = await businessRepository.findByUserId(user.id);
      return jsonResponse(
        {
          businesses,
          primaryBusiness: businesses[0] || null,
        },
        requestId,
        200
      );
    }

    // Directory Query
    const search = searchParams.get('search') || undefined;
    const province = searchParams.get('province') || undefined;
    const sector = searchParams.get('sector') || searchParams.get('category') || undefined;
    const businessType = searchParams.get('business_type') || searchParams.get('businessType') || undefined;
    const isVerifiedParam = searchParams.get('is_verified') || searchParams.get('verifiedOnly');
    const isVerified = isVerifiedParam === 'true' ? true : undefined;
    const verificationStatus = searchParams.get('verification_status') || undefined;
    const isFeaturedParam = searchParams.get('is_featured');
    const isFeatured = isFeaturedParam === 'true' ? true : undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const sort = (searchParams.get('sort') as any) || 'featured';

    const user = await getAuthenticatedUser(req, false);
    const isAdmin = user?.role === 'admin';
    const includeExpiredParam = searchParams.get('include_expired');
    const includeExpired = isAdmin || includeExpiredParam === 'true';

    const result = await businessRepository.findBusinesses({
      search,
      province,
      sector,
      businessType,
      isVerified,
      verificationStatus,
      isFeatured,
      includeExpired,
      page,
      limit,
      sort,
    });

    const sanitizedBusinesses = result.businesses.map((b) => {
      if (isAdmin) return b;
      const { kyc_documents, ...safeFields } = b;
      return safeFields;
    });

    return jsonResponse(
      {
        ...result,
        businesses: sanitizedBusinesses,
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const user = await getAuthenticatedUser(req, false);
    const body = await parseAndValidateBody(req, createBusinessSchema);

    const business = await businessRepository.create({
      user_id: user?.id || null,
      name: body.name.trim(),
      province: body.province.trim(),
      city: body.city?.trim() || null,
      address: body.address?.trim() || null,
      sector: body.sector?.trim() || 'General Business',
      business_type: body.business_type || 'Registered Company (Pvt Ltd)',
      onboarding_track: body.onboarding_track || 'registered_entity',
      legal_form: body.legal_form || 'pvt_ltd',
      applicant_role: body.applicant_role || 'owner',
      verification_badge: body.verification_badge || 'Verified Registered Company',
      registration_number: body.registration_number?.trim() || null,
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      whatsapp: body.whatsapp?.trim() || null,
      website: body.website?.trim() || null,
      description: body.description?.trim() || null,
      logo_url: body.logo_url || null,
      cover_url: body.cover_url || null,
      gallery: body.gallery || [],
      operating_hours: body.operating_hours || {},
      kyc_documents: body.kyc_documents || [],
      is_verified: false,
      verification_status: 'Pending',
    });

    return jsonResponse(
      {
        message: 'Business listing created successfully and submitted for verification.',
        business,
      },
      requestId,
      201
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
