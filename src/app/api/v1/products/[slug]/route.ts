import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { productRepository } from '@/infrastructure/database/repositories/product-repository';
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
import { invalidateProductsCache } from '../route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  price_usd: z.number().positive().optional(),
  price_zig: z.number().optional(),
  images: z.array(z.string()).max(5, 'Maximum of 5 images allowed per product').optional(),
  in_stock: z.boolean().optional(),
  stock_quantity: z.number().int().nonnegative().optional(),
  condition: z.string().optional(),
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
    const product = await productRepository.findBySlug(slug);

    if (!product) {
      throw new NotFoundError(`Product '${slug}' was not found`);
    }

    return jsonResponse({ product }, requestId, 200);
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

    const existing = await productRepository.findBySlug(slug);
    if (!existing) {
      throw new NotFoundError(`Product '${slug}' was not found`);
    }

    const business = await businessRepository.findById(existing.business_id);
    const isAdmin = user.role === 'admin';
    const isOwner = business && business.user_id === user.id;

    if (!isAdmin && !isOwner) {
      throw new AuthorizationError('You do not have permission to edit this product');
    }

    const body = await parseAndValidateBody(req, updateProductSchema);

    // If new images provided, detect and purge any removed images from Cloudflare R2
    if (body.images !== undefined) {
      let oldImages: string[] = [];
      if (Array.isArray(existing.images)) {
        oldImages = existing.images;
      } else if (typeof existing.images === 'string') {
        try {
          const parsed = JSON.parse(existing.images);
          if (Array.isArray(parsed)) oldImages = parsed;
        } catch {}
      }
      const newImagesSet = new Set(body.images);
      const removedImages = oldImages.filter((img) => !newImagesSet.has(img));
      if (removedImages.length > 0) {
        storageService.deleteFiles(removedImages).catch((err) =>
          console.error('Failed to purge removed product images from storage:', err)
        );
      }
    }

    const updated = await productRepository.update(existing.id, body);
    invalidateProductsCache();

    return jsonResponse(
      {
        message: 'Product updated successfully.',
        product: updated,
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

    const existing = await productRepository.findBySlug(slug);
    if (!existing) {
      throw new NotFoundError(`Product '${slug}' was not found`);
    }

    const business = await businessRepository.findById(existing.business_id);
    const isAdmin = user.role === 'admin';
    const isOwner = business && business.user_id === user.id;

    if (!isAdmin && !isOwner) {
      throw new AuthorizationError('You do not have permission to delete this product');
    }

    // Collect all product images to purge from Cloudflare R2
    let imagesToPurge: string[] = [];
    if (Array.isArray(existing.images)) {
      imagesToPurge = existing.images;
    } else if (typeof existing.images === 'string') {
      try {
        const parsed = JSON.parse(existing.images);
        if (Array.isArray(parsed)) imagesToPurge = parsed;
      } catch {}
    }

    await productRepository.delete(existing.id);
    invalidateProductsCache();

    // Cascading purge of all product images from Cloudflare R2 / storage
    if (imagesToPurge.length > 0) {
      storageService.deleteFiles(imagesToPurge).catch((err) =>
        console.error('Failed to purge product images from storage:', err)
      );
    }

    return jsonResponse(
      {
        message: 'Product deleted successfully and images purged from storage.',
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
