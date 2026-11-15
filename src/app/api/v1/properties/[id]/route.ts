import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { propertyRepository } from '@/infrastructure/database/repositories/property-repository';
import {
  NotFoundError,
  AuthorizationError,
} from '@/shared/errors/AppError';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import { maskPhoneNumber } from '@/data/propertiesStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const updatePropertySchema = z.object({
  title: z.string().min(5).optional(),
  propertyType: z
    .enum([
      'Residential Rent',
      'Commercial Rent',
      'Residential Sale',
      'Commercial Sale',
      'Stands & Land',
      'Student Accommodation',
    ])
    .optional(),
  category: z
    .enum([
      'House',
      'Apartment / Flat',
      'Cottage',
      'Office Space',
      'Warehouse',
      'Retail Shop',
      'Residential Stand',
      'Agricultural Plot',
    ])
    .optional(),
  province: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  suburb: z.string().min(2).optional(),
  priceUSD: z.number().positive().optional(),
  pricePeriod: z.enum(['per_month', 'total', 'per_year']).optional(),
  bedrooms: z.number().int().nonnegative().optional().nullable(),
  bathrooms: z.number().int().nonnegative().optional().nullable(),
  features: z.array(z.string()).optional(),
  description: z.string().min(10).optional(),
  images: z.array(z.string()).optional(),
  advertiserName: z.string().min(2).optional(),
  advertiserType: z
    .enum([
      'Real Estate Agency',
      'Direct Landlord',
      'Developer',
      'Property Manager',
    ])
    .optional(),
  isVerified: z.boolean().optional(),
  whatsapp: z.string().min(6).optional(),
  phone: z.string().min(6).optional(),
  isFeatured: z.boolean().optional(),
  occupancyStatus: z.enum(['Available', 'Occupied', 'Taken']).optional(),
  isOccupied: z.boolean().optional(),
});

const patchStatusSchema = z.object({
  action: z.enum(['toggle_occupancy', 'toggle_verification', 'toggle_featured', 'set_status']).optional(),
  occupancyStatus: z.enum(['Available', 'Occupied', 'Taken']).optional(),
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
    let property = await propertyRepository.findById(id);
    if (!property) {
      property = await propertyRepository.findBySlug(id);
    }

    if (!property) {
      throw new NotFoundError(`Property with identifier '${id}' not found`);
    }

    const user = await getAuthenticatedUser(req, false);
    const isAdmin = user?.role === 'admin';
    const isOwner = user && property.userId && user.id === property.userId;

    if (!isAdmin && !isOwner) {
      property = {
        ...property,
        phone: maskPhoneNumber(property.phone),
        whatsapp: `${property.whatsapp.slice(0, 6)}••••••`,
      };
    }

    return jsonResponse({ property }, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { id } = await params;
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundError(`Property with ID '${id}' not found`);
    }

    const user = await getAuthenticatedUser(req, true);
    const isAdmin = user?.role === 'admin';
    const isOwner = user && property.userId && user.id === property.userId;

    if (!isAdmin && !isOwner) {
      throw new AuthorizationError('You do not have permission to modify this property listing');
    }

    const body = await parseAndValidateBody(req, updatePropertySchema);

    // Only admin can change verification or featured status
    if (!isAdmin) {
      delete body.isVerified;
      delete body.isFeatured;
    }

    const updated = await propertyRepository.update(id, body);
    return jsonResponse({ property: updated, message: 'Property updated successfully.' }, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { id } = await params;
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundError(`Property with ID '${id}' not found`);
    }

    const user = await getAuthenticatedUser(req, true);
    const isAdmin = user?.role === 'admin';
    const isOwner = user && property.userId && user.id === property.userId;

    if (!isAdmin && !isOwner) {
      throw new AuthorizationError('You do not have permission to modify this property listing');
    }

    const body = await parseAndValidateBody(req, patchStatusSchema);

    let updated = property;

    if (body.action === 'toggle_occupancy' || body.occupancyStatus !== undefined) {
      const target = body.occupancyStatus as 'Available' | 'Taken' | undefined;
      const res = await propertyRepository.toggleOccupancy(id, target);
      if (res) updated = res;
    }

    if (body.action === 'toggle_verification' || body.isVerified !== undefined) {
      if (!isAdmin) {
        throw new AuthorizationError('Only platform administrators can verify property listings');
      }
      const res = await propertyRepository.toggleVerification(id, body.isVerified);
      if (res) updated = res;
    }

    if (body.action === 'toggle_featured' || body.isFeatured !== undefined) {
      if (!isAdmin) {
        throw new AuthorizationError('Only platform administrators can feature property listings');
      }
      const res = await propertyRepository.toggleFeatured(id, body.isFeatured);
      if (res) updated = res;
    }

    return jsonResponse({ property: updated, message: 'Property status updated successfully.' }, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { id } = await params;
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundError(`Property with ID '${id}' not found`);
    }

    const user = await getAuthenticatedUser(req, true);
    const isAdmin = user?.role === 'admin';
    const isOwner = user && property.userId && user.id === property.userId;

    if (!isAdmin && !isOwner) {
      throw new AuthorizationError('You do not have permission to delete this property listing');
    }

    await propertyRepository.delete(id);
    return jsonResponse({ success: true, message: 'Property deleted successfully.' }, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
