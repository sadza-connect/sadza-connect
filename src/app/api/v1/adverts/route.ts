import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { advertRepository } from '@/infrastructure/database/repositories/advert-repository';
import { businessRepository } from '@/infrastructure/database/repositories/business-repository';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createAdvertSchema = z.object({
  business_id: z.string().uuid().optional(),
  business_slug: z.string().optional(),
  business_name: z.string().min(2, 'Business name is required'),
  business_type: z.string().optional(),
  province: z.string().min(2, 'Province is required'),
  category: z.string().min(2, 'Category is required'),
  offer_type: z.string().min(2, 'Offer type is required'),
  headline: z.string().min(3, 'Headline is required'),
  offer_text: z.string().min(5, 'Offer description is required'),
  promo_badge: z.string().optional(),
  original_price_usd: z.number().positive().optional(),
  promo_price_usd: z.number().positive().optional(),
  price_zig: z.number().optional(),
  valid_until: z.string().optional(),
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  image: z.string().optional(),
  featured_on_home: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const province = searchParams.get('province') || undefined;
    const offerType = searchParams.get('offer_type') || undefined;
    const businessId = searchParams.get('business_id') || undefined;
    const featuredOnHomeParam = searchParams.get('featured_on_home');
    const featuredOnHome =
      featuredOnHomeParam !== null ? featuredOnHomeParam === 'true' : undefined;
    const isActiveParam = searchParams.get('is_active');
    const isActive = isActiveParam !== null ? isActiveParam === 'true' : undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await advertRepository.findAdverts({
      search,
      category,
      province,
      offerType,
      businessId,
      featuredOnHome,
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
    const body = await parseAndValidateBody(req, createAdvertSchema);

    // Optional user authentication (supports both authenticated & guest submission)
    const user = await getAuthenticatedUser(req, false);

    let targetBusinessId = body.business_id;

    if (!targetBusinessId && body.business_slug) {
      const biz = await businessRepository.findBySlug(body.business_slug);
      if (biz) targetBusinessId = biz.id;
    }

    if (!targetBusinessId && user) {
      const myBusinesses = await businessRepository.findByUserId(user.id);
      if (myBusinesses.length > 0) {
        targetBusinessId = myBusinesses[0].id;
      }
    }

    const advert = await advertRepository.create({
      business_id: targetBusinessId || null,
      business_name: body.business_name.trim(),
      business_type: body.business_type || 'Registered Company (Pvt Ltd)',
      province: body.province,
      category: body.category,
      offer_type: body.offer_type,
      headline: body.headline.trim(),
      offer_text: body.offer_text.trim(),
      promo_badge: body.promo_badge?.trim() || 'SPECIAL OFFER',
      original_price_usd: body.original_price_usd || null,
      promo_price_usd: body.promo_price_usd || null,
      price_zig: body.price_zig || null,
      valid_until: body.valid_until || 'Valid this month',
      whatsapp: body.whatsapp || null,
      phone: body.phone || null,
      image: body.image || null,
      featured_on_home: body.featured_on_home ?? true,
      is_active: body.is_active ?? true,
    });

    return jsonResponse(
      {
        message: 'Sponsored promotion campaign published successfully.',
        advert,
      },
      requestId,
      201
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
