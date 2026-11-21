import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { tourismRepository } from '@/infrastructure/database/repositories/tourism-repository';
import { notificationRepository } from '@/infrastructure/database/repositories/notification-repository';
import { NotFoundError, AuthorizationError } from '@/shared/errors/AppError';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const updateTourismSchema = z.object({
  name: z.string().min(2).optional(),
  category: z
    .enum([
      'Accommodation & Lodging',
      'Tour Operators & Travel Agencies',
      'Attractions & Tourist Destinations',
      'Restaurants, Food & Dining',
      'Adventures & Outdoor Activities',
      'Tourism Transport & Transfers',
      'Wellness, Leisure & Recreation',
      'Lodges & Safari Camps',
      'Bed & Breakfast (BnB)',
      'Hotels & Resorts',
      'Self-Catering Cottages & Chalets',
      'Houseboats & Lake Stays',
      'Camping & Eco-Resorts',
    ])
    .optional(),
  destinationArea: z.string().min(2).optional(),
  province: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  addressOrLocation: z.string().optional(),
  pricePerNightUSD: z.number().positive().optional(),
  guestsCapacity: z.number().int().positive().optional().nullable(),
  bedrooms: z.number().int().nonnegative().optional().nullable(),
  amenities: z.array(z.string()).optional(),
  description: z.string().min(10).optional(),
  images: z.array(z.string()).optional(),
  hostName: z.string().min(2).optional(),
  hostType: z
    .enum([
      'Hotel / Resort Group',
      'Safari Lodge Operator',
      'Private BnB Host',
      'Guesthouse Manager',
      'Tour & Travel Operator',
      'Restaurant & Dining Venue',
      'Transport & Transfer Provider',
      'Wellness & Leisure Hub',
    ])
    .optional(),
  isVerified: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  whatsapp: z.string().min(5).optional(),
  phone: z.string().min(5).optional(),
  email: z.string().email().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewsCount: z.number().int().nonnegative().optional(),
});

const patchTourismSchema = z.object({
  action: z.enum(['toggle_verification', 'toggle_featured']).optional(),
  isVerified: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { id } = await params;
    let listing = await tourismRepository.findById(id);
    if (!listing) {
      listing = await tourismRepository.findBySlug(id);
    }

    if (!listing) {
      throw new NotFoundError(`Tourism listing with identifier '${id}' not found`);
    }

    return jsonResponse({ listing }, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { id } = await params;
    const listing = await tourismRepository.findById(id);
    if (!listing) {
      throw new NotFoundError(`Tourism listing with ID '${id}' not found`);
    }

    const user = await getAuthenticatedUser(req, true);
    const isAdmin = user?.role === 'admin';
    const isOwner = Boolean(user && listing.userId && user.id === listing.userId);

    if (!isAdmin && !isOwner) {
      throw new AuthorizationError('You do not have permission to modify this hospitality listing');
    }

    const body = await parseAndValidateBody(req, updateTourismSchema);
    if (!isAdmin) {
      delete body.isVerified;
      delete body.isFeatured;
    }

    const updated = await tourismRepository.update(id, {
      ...body,
      whatsapp: body.whatsapp ? body.whatsapp.replace(/\D/g, '') : undefined,
    });

    return jsonResponse(
      { listing: updated, message: 'Hospitality listing updated successfully.' },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { id } = await params;
    const listing = await tourismRepository.findById(id);
    if (!listing) {
      throw new NotFoundError(`Tourism listing with ID '${id}' not found`);
    }

    const user = await getAuthenticatedUser(req, true);
    if (user?.role !== 'admin') {
      throw new AuthorizationError('Only platform administrators can modify verification or featured status');
    }

    const body = await parseAndValidateBody(req, patchTourismSchema);
    let updated = listing;

    if (body.action === 'toggle_verification' || body.isVerified !== undefined) {
      const res = await tourismRepository.toggleVerification(id, body.isVerified);
      if (res) updated = res;
    }

    if (body.action === 'toggle_featured' || body.isFeatured !== undefined) {
      const res = await tourismRepository.toggleFeatured(id, body.isFeatured);
      if (res) updated = res;
    }

    if (listing.userId) {
      if (updated.isVerified !== listing.isVerified) {
        await notificationRepository.createSafely({
          userId: listing.userId,
          title: `Hospitality Listing ${updated.isVerified ? 'Verified' : 'Pending Review'}`,
          message: `"${listing.name}" verification status is now ${updated.isVerified ? 'Verified Partner' : 'Unverified'}.`,
          category: 'system',
          actionUrl: '/tourism',
          actionLabel: 'View Listing',
          severity: updated.isVerified ? 'success' : 'warning',
        });
      }
      if (updated.isFeatured !== listing.isFeatured && updated.isFeatured) {
        await notificationRepository.createSafely({
          userId: listing.userId,
          title: 'Stay Featured on Tourism Portal',
          message: `"${listing.name}" is now featured on Tourism & Hospitality.`,
          category: 'system',
          actionUrl: '/tourism',
          actionLabel: 'View Listing',
          severity: 'success',
        });
      }
    }

    return jsonResponse(
      { listing: updated, message: 'Hospitality listing status updated successfully.' },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { id } = await params;
    const listing = await tourismRepository.findById(id);
    if (!listing) {
      throw new NotFoundError(`Tourism listing with ID '${id}' not found`);
    }

    const user = await getAuthenticatedUser(req, true);
    const isAdmin = user?.role === 'admin';
    const isOwner = Boolean(user && listing.userId && user.id === listing.userId);

    if (!isAdmin && !isOwner) {
      throw new AuthorizationError('You do not have permission to delete this hospitality listing');
    }

    await tourismRepository.delete(id);
    return jsonResponse(
      { success: true, message: 'Hospitality listing deleted successfully.' },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
