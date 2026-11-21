import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { tourismRepository } from '@/infrastructure/database/repositories/tourism-repository';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createTourismSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name is required'),
  slug: z.string().optional(),
  category: z.enum([
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
  ]),
  destinationArea: z.string().min(2, 'Destination area is required'),
  province: z.string().min(2, 'Province is required'),
  city: z.string().min(2, 'City is required'),
  addressOrLocation: z.string().optional(),
  pricePerNightUSD: z.number().positive('Price / rate must be positive'),
  guestsCapacity: z.number().int().positive().optional().default(2),
  bedrooms: z.number().int().nonnegative().optional().default(1),
  amenities: z.array(z.string()).default([]),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  images: z.array(z.string()).default([]),
  hostName: z.string().min(2, 'Host name is required'),
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
    .default('Private BnB Host'),
  isVerified: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  whatsapp: z.string().min(5, 'WhatsApp number is required'),
  phone: z.string().min(5, 'Phone number is required'),
  email: z.string().email().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewsCount: z.number().int().nonnegative().optional(),
});

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const destinationArea =
      searchParams.get('destination') || searchParams.get('destinationArea') || undefined;
    const province = searchParams.get('province') || undefined;
    const isFeaturedParam = searchParams.get('isFeatured') || searchParams.get('is_featured');
    const isFeatured = isFeaturedParam !== null ? isFeaturedParam === 'true' : undefined;
    const adminRequested = searchParams.get('admin') === 'true';
    const includeStats = searchParams.get('stats') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const user = await getAuthenticatedUser(req, false);
    const isAdmin = user?.role === 'admin';

    const { listings, total } = await tourismRepository.findMany({
      search,
      category,
      destinationArea,
      province,
      isFeatured,
      limit,
      offset,
    });

    let stats = undefined;
    if (includeStats || (isAdmin && adminRequested)) {
      stats = await tourismRepository.getStats();
    }

    return jsonResponse(
      {
        listings,
        total,
        stats,
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
    const body = await parseAndValidateBody(req, createTourismSchema);

    const isAdmin = user?.role === 'admin';
    const isVerified = isAdmin ? (body.isVerified ?? true) : false;
    const isFeatured = isAdmin ? (body.isFeatured ?? false) : false;

    const images =
      body.images && body.images.length > 0
        ? body.images
        : ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80'];

    const listing = await tourismRepository.create({
      id: body.id,
      userId: user?.id || null,
      name: body.name.trim(),
      slug: body.slug,
      category: body.category,
      destinationArea: body.destinationArea.trim(),
      province: body.province,
      city: body.city.trim(),
      addressOrLocation: body.addressOrLocation?.trim() || `${body.destinationArea}, Zimbabwe`,
      pricePerNightUSD: body.pricePerNightUSD,
      guestsCapacity: body.guestsCapacity,
      bedrooms: body.bedrooms,
      amenities: body.amenities || [],
      description: body.description.trim(),
      images,
      hostName: body.hostName.trim(),
      hostType: body.hostType,
      isVerified,
      isFeatured,
      whatsapp: body.whatsapp.replace(/\D/g, ''),
      phone: body.phone.trim(),
      email: body.email,
      rating: isAdmin ? body.rating : undefined,
      reviewsCount: isAdmin ? body.reviewsCount : undefined,
    });

    return jsonResponse(
      {
        listing,
        message: 'Tourism & hospitality listing created successfully.',
      },
      requestId,
      201
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
