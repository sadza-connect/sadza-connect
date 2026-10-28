import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { productRepository } from '@/infrastructure/database/repositories/product-repository';
import { businessRepository } from '@/infrastructure/database/repositories/business-repository';
import { settingsRepository } from '@/infrastructure/database/repositories/settings-repository';
import { getDb } from '@/infrastructure/database/connection';
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

const createProductSchema = z.object({
  business_id: z.string().uuid().optional(),
  business_slug: z.string().optional(),
  name: z.string().min(2, 'Product title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  price_usd: z.number().positive('Price must be greater than 0'),
  price_zig: z.number().optional(),
  images: z.array(z.string()).max(5, 'Maximum of 5 images allowed per product').optional(),
  in_stock: z.boolean().optional(),
  stock_quantity: z.number().int().nonnegative().optional(),
  condition: z.string().optional(),
  is_featured: z.boolean().optional(),
});

interface ProductsCacheEntry {
  data: any;
  expiresAt: number;
}
const productsCache = new Map<string, ProductsCacheEntry>();

export function invalidateProductsCache(): void {
  productsCache.clear();
}

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || searchParams.get('sector') || undefined;
    const province = searchParams.get('province') || undefined;
    const condition = searchParams.get('condition') || undefined;
    const businessId = searchParams.get('business_id') || undefined;
    const isFeaturedParam = searchParams.get('is_featured');
    const isFeatured = isFeaturedParam !== null ? isFeaturedParam === 'true' : undefined;
    const isActiveParam = searchParams.get('is_active');
    const isActive = isActiveParam !== null ? isActiveParam === 'true' : undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const sort = (searchParams.get('sort') as any) || 'featured';

    const cacheKey = `${search || ''}|${category || ''}|${province || ''}|${condition || ''}|${businessId || ''}|${isFeaturedParam || ''}|${isActiveParam || ''}|${page}|${limit}|${sort}`;
    const cached = productsCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return jsonResponse(cached.data, requestId, 200, {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      });
    }

    const result = await productRepository.findProducts({
      search,
      category,
      province,
      condition,
      businessId,
      isFeatured,
      isActive,
      page,
      limit,
      sort,
    });

    productsCache.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + 20_000,
    });

    return jsonResponse(result, requestId, 200, {
      'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
    });
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const user = await getAuthenticatedUser(req, true);
    if (!user) {
      throw new AuthorizationError('Authentication required to upload products');
    }

    const body = await parseAndValidateBody(req, createProductSchema);

    // Resolve business
    let targetBusinessId = body.business_id;

    if (!targetBusinessId && body.business_slug) {
      const biz = await businessRepository.findBySlug(body.business_slug);
      if (biz) targetBusinessId = biz.id;
    }

    if (!targetBusinessId) {
      // Find user's owned business
      const myBusinesses = await businessRepository.findByUserId(user.id);
      if (myBusinesses.length > 0) {
        targetBusinessId = myBusinesses[0].id;
      }
    }

    if (!targetBusinessId) {
      throw new ValidationError('A valid business ID or slug is required to publish a product');
    }

    // Verify ownership or admin permission
    const business = await businessRepository.findById(targetBusinessId);
    if (!business) {
      throw new NotFoundError('Target business was not found');
    }

    const isAdmin = user.role === 'admin';
    const isOwner = business.user_id === user.id;

    if (!isAdmin && !isOwner) {
      throw new AuthorizationError('You can only add products to your own registered business');
    }

    // Dynamic Catalog Quota Enforcement
    const settings = await settingsRepository.getSettings();
    const effectiveLimit =
      business.custom_product_limit ??
      business.product_limit ??
      settings.tier_starter_limit ?? 25;

    const db = getDb();
    const [{ count }] = await db('products')
      .where({ business_id: targetBusinessId, is_active: true })
      .count('id as count');

    if (Number(count) >= effectiveLimit) {
      throw new ValidationError(
        `Catalog quota reached (${effectiveLimit} products allowed for your storefront tier). Please upgrade your storefront tier in your dashboard to list additional products.`
      );
    }

    const product = await productRepository.create({
      business_id: targetBusinessId,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      category: body.category?.trim() || business.sector || 'General Commercial',
      price_usd: body.price_usd,
      price_zig: body.price_zig || null,
      images: body.images || [],
      in_stock: body.in_stock ?? true,
      stock_quantity: body.stock_quantity ?? 1,
      condition: body.condition || 'Brand New',
      is_featured: body.is_featured ?? false,
      is_active: true,
    });

    invalidateProductsCache();

    return jsonResponse(
      {
        message: 'Product published to Marketplace successfully.',
        product,
      },
      requestId,
      201
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
