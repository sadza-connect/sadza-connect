import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import {
  DEFAULT_TOURISMS,
  TourismListing,
} from '@/data/tourismStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createTourismSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  category: z.enum([
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
  pricePerNightUSD: z.number().positive('Nightly price must be positive'),
  guestsCapacity: z.number().optional().default(2),
  bedrooms: z.number().optional().default(1),
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
    ])
    .default('Private BnB Host'),
  whatsapp: z.string().min(5, 'WhatsApp number is required'),
  phone: z.string().min(5, 'Phone number is required'),
  email: z.string().email().optional(),
});

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const category = searchParams.get('category') || 'All Categories';
    const destination = searchParams.get('destination') || 'All Destinations';
    const province = searchParams.get('province') || 'All Provinces';

    let list = DEFAULT_TOURISMS;

    if (search) {
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(search) ||
          t.destinationArea.toLowerCase().includes(search) ||
          t.city.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search) ||
          t.amenities.some((a) => a.toLowerCase().includes(search))
      );
    }

    if (category !== 'All Categories') {
      list = list.filter((t) => t.category === category);
    }

    if (destination !== 'All Destinations') {
      list = list.filter((t) => t.destinationArea === destination);
    }

    if (province !== 'All Provinces') {
      list = list.filter((t) => t.province === province);
    }

    return jsonResponse(
      {
        listings: list,
        total: list.length,
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
    const body = await parseAndValidateBody(req, createTourismSchema);

    const created: TourismListing = {
      id: `tour-${Date.now()}`,
      name: body.name.trim(),
      slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
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
      images:
        body.images && body.images.length > 0
          ? body.images
          : ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80'],
      hostName: body.hostName.trim(),
      hostType: (body.hostType || 'Private BnB Host') as TourismListing['hostType'],
      isVerified: true,
      isFeatured: false,
      whatsapp: body.whatsapp.replace(/\D/g, ''),
      phone: body.phone,
      email: body.email,
      rating: 5.0,
      reviewsCount: 1,
      postedAt: 'Just now',
    };

    return jsonResponse(
      {
        listing: created,
        message: 'Tourism & hospitality listing created successfully.',
      },
      requestId,
      201
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
