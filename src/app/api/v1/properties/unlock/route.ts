import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import {
  DEFAULT_PROPERTIES,
  PROPERTY_CONTACT_UNLOCK_FEE_USD,
  PROPERTY_CONTACT_UNLOCK_FEE_ZIG,
} from '@/data/propertiesStore';
import { invoiceRepository } from '@/infrastructure/database/repositories/invoice-repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const unlockPropertySchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  customerPhone: z.string().optional(),
  paymentMethod: z.enum(['ecocash', 'innbucks', 'card', 'demo', 'instant_demo']).default('demo'),
  amountUsd: z.number().optional().default(2.0),
});

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  return jsonResponse(
    {
      unlockFeeUsd: PROPERTY_CONTACT_UNLOCK_FEE_USD,
      unlockFeeZig: PROPERTY_CONTACT_UNLOCK_FEE_ZIG,
      terms: 'One-time $2.00 USD fee to permanently unlock direct landlord WhatsApp and phone contact.',
      supportedMethods: ['ecocash', 'innbucks', 'card', 'instant_demo'],
    },
    requestId,
    200
  );
}

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const body = await parseAndValidateBody(req, unlockPropertySchema);

    // Look up property in DEFAULT_PROPERTIES (or fallback)
    const property = DEFAULT_PROPERTIES.find((p) => p.id === body.propertyId);

    // If custom property created by user in browser, fallback details will still unlock cleanly
    const revealedPhone = property?.phone || '+263 77 100 0000';
    const revealedWhatsapp = property?.whatsapp || '263771000000';
    const propertyTitle = property?.title || `Property ID ${body.propertyId}`;

    const reference = `PROP-UNL-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Attempt to log invoice in database if table is reachable
    try {
      await invoiceRepository.create({
        invoice_number: reference,
        business_id: null,
        business_name: `Direct Landlord Contact - ${propertyTitle.slice(0, 50)}`,
        plan_type: `Property Direct Contact Unlock ($${PROPERTY_CONTACT_UNLOCK_FEE_USD})`,
        amount_usd: PROPERTY_CONTACT_UNLOCK_FEE_USD,
        payment_method:
          body.paymentMethod === 'ecocash'
            ? 'EcoCash USD'
            : body.paymentMethod === 'innbucks'
            ? 'InnBucks'
            : body.paymentMethod === 'card'
            ? 'Visa / Mastercard'
            : 'Instant Demo',
        status: 'Paid',
      });
    } catch {
      // Non-fatal if database is offline in mock mode
    }

    return jsonResponse(
      {
        unlocked: true,
        propertyId: body.propertyId,
        propertyTitle,
        phone: revealedPhone,
        whatsapp: revealedWhatsapp,
        amountUsd: PROPERTY_CONTACT_UNLOCK_FEE_USD,
        amountZig: PROPERTY_CONTACT_UNLOCK_FEE_ZIG,
        reference,
        paymentMethod: body.paymentMethod,
        unlockedAt: new Date().toISOString(),
        message: 'Direct landlord contact unlocked successfully!',
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
