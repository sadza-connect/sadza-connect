import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { jsonResponse, errorResponse } from '@/shared/utils/route-handler';
import {
  DEFAULT_PROPERTIES,
  PROPERTY_CONTACT_UNLOCK_FEE_USD,
  maskPhoneNumber,
} from '@/data/propertiesStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const province = searchParams.get('province') || 'All Provinces';
    const type = searchParams.get('type') || 'All Types';
    const category = searchParams.get('category') || 'All Categories';

    let list = DEFAULT_PROPERTIES;

    if (search) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.suburb.toLowerCase().includes(search) ||
          p.city.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.features.some((f) => f.toLowerCase().includes(search))
      );
    }

    if (province !== 'All Provinces') {
      list = list.filter((p) => p.province === province);
    }

    if (type !== 'All Types') {
      list = list.filter((p) => p.propertyType === type);
    }

    if (category !== 'All Categories') {
      list = list.filter((p) => p.category === category);
    }

    // Return properties with masked phone numbers for public security
    const masked = list.map((p) => ({
      ...p,
      phoneMasked: maskPhoneNumber(p.phone),
      unlockFeeUsd: PROPERTY_CONTACT_UNLOCK_FEE_USD,
      isAddressPrivate: true,
      addressDisclosure: `${p.suburb}, ${p.city} (Exact street address private until viewing is arranged)`,
    }));

    return jsonResponse(
      {
        properties: masked,
        total: masked.length,
        unlockFeeUsd: PROPERTY_CONTACT_UNLOCK_FEE_USD,
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
