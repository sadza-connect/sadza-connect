import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import {
  propertyRepository,
  CreatePropertyDTO,
} from '@/infrastructure/database/repositories/property-repository';
import {
  PROPERTY_CONTACT_UNLOCK_FEE_USD,
  PROPERTY_CONTACT_UNLOCK_FEE_ZIG,
  maskPhoneNumber,
} from '@/data/propertiesStore';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createPropertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().optional(),
  propertyType: z.enum([
    'Residential Rent',
    'Commercial Rent',
    'Residential Sale',
    'Commercial Sale',
    'Stands & Land',
    'Student Accommodation',
  ]),
  category: z.enum([
    'House',
    'Apartment / Flat',
    'Cottage',
    'Office Space',
    'Warehouse',
    'Retail Shop',
    'Residential Stand',
    'Agricultural Plot',
  ]),
  province: z.string().min(2, 'Province is required'),
  city: z.string().min(2, 'City is required'),
  suburb: z.string().min(2, 'Suburb is required'),
  priceUSD: z.number().positive('Price must be greater than zero'),
  pricePeriod: z.enum(['per_month', 'total', 'per_year']).default('per_month'),
  bedrooms: z.number().int().nonnegative().optional().nullable(),
  bathrooms: z.number().int().nonnegative().optional().nullable(),
  features: z.array(z.string()).default([]),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  images: z.array(z.string()).default([]),
  advertiserName: z.string().min(2, 'Advertiser name is required'),
  advertiserType: z.enum([
    'Real Estate Agency',
    'Direct Landlord',
    'Developer',
    'Property Manager',
  ]).default('Direct Landlord'),
  isVerified: z.boolean().optional(),
  whatsapp: z.string().min(6, 'WhatsApp number is required'),
  phone: z.string().min(6, 'Phone number is required'),
  isFeatured: z.boolean().optional(),
  occupancyStatus: z.enum(['Available', 'Occupied', 'Taken']).default('Available'),
});

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const province = searchParams.get('province') || undefined;
    const type = searchParams.get('type') || searchParams.get('propertyType') || undefined;
    const category = searchParams.get('category') || undefined;
    const occupancy = searchParams.get('occupancy') || searchParams.get('occupancyStatus') || undefined;
    const isFeaturedParam = searchParams.get('isFeatured') || searchParams.get('is_featured');
    const isFeatured = isFeaturedParam !== null ? isFeaturedParam === 'true' : undefined;
    const adminRequested = searchParams.get('admin') === 'true';
    const includeStats = searchParams.get('stats') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    // Check caller authentication
    const user = await getAuthenticatedUser(req, false);
    const isAdmin = user?.role === 'admin';

    const { properties, total } = await propertyRepository.findMany({
      search,
      province,
      propertyType: type,
      category,
      occupancyStatus: occupancy,
      isFeatured,
      limit,
      offset,
    });

    // Mask sensitive contact details for public visitors (reveal only for admins or unlocked users)
    const canViewFullContacts = isAdmin && adminRequested;
    const formattedProperties = properties.map((p) => {
      if (canViewFullContacts) {
        return {
          ...p,
          phoneMasked: p.phone,
          isAddressPrivate: false,
        };
      }
      return {
        ...p,
        phoneMasked: maskPhoneNumber(p.phone),
        phone: maskPhoneNumber(p.phone), // Mask actual phone field in public response to prevent scraping
        whatsapp: `${p.whatsapp.slice(0, 6)}••••••`, // Mask WhatsApp number in public response
        unlockFeeUsd: PROPERTY_CONTACT_UNLOCK_FEE_USD,
        unlockFeeZig: PROPERTY_CONTACT_UNLOCK_FEE_ZIG,
        isAddressPrivate: true,
        addressDisclosure: `${p.suburb}, ${p.city} (Exact street address private until viewing is arranged)`,
      };
    });

    let stats = undefined;
    if (includeStats || (isAdmin && adminRequested)) {
      stats = await propertyRepository.getStats();
    }

    return jsonResponse(
      {
        properties: formattedProperties,
        total,
        stats,
        unlockFeeUsd: PROPERTY_CONTACT_UNLOCK_FEE_USD,
        unlockFeeZig: PROPERTY_CONTACT_UNLOCK_FEE_ZIG,
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
    const body = await parseAndValidateBody(req, createPropertySchema);

    const isAdmin = user?.role === 'admin';
    const isVerified = isAdmin ? (body.isVerified ?? true) : false;
    const isFeatured = isAdmin ? (body.isFeatured ?? false) : false;

    const property = await propertyRepository.create({
      userId: user?.id || null,
      title: body.title,
      slug: body.slug,
      propertyType: body.propertyType,
      category: body.category,
      province: body.province,
      city: body.city,
      suburb: body.suburb,
      priceUSD: body.priceUSD,
      pricePeriod: body.pricePeriod,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      features: body.features,
      description: body.description,
      images: body.images,
      advertiserName: body.advertiserName,
      advertiserType: body.advertiserType,
      isVerified,
      whatsapp: body.whatsapp,
      phone: body.phone,
      isFeatured,
      occupancyStatus: body.occupancyStatus,
    });

    return jsonResponse(
      {
        property,
        message: 'Property listing created successfully.',
      },
      requestId,
      201
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
