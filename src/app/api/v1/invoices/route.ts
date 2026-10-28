import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { invoiceRepository } from '@/infrastructure/database/repositories/invoice-repository';
import { businessRepository } from '@/infrastructure/database/repositories/business-repository';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { AuthorizationError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createInvoiceSchema = z.object({
  invoice_number: z.string().optional(),
  business_id: z.string().uuid().optional(),
  business_slug: z.string().optional(),
  business_name: z.string().min(2, 'Business name is required'),
  plan_type: z.string().min(2, 'Plan type is required'),
  amount_usd: z.number().positive('Amount must be greater than 0'),
  payment_method: z.string().min(2, 'Payment method is required'),
  period_covered: z.string().optional(),
  status: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { searchParams } = new URL(req.url);

    let businessId = searchParams.get('business_id') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const user = await getAuthenticatedUser(req, false);

    // If caller is authenticated and non-admin, scope strictly to their businesses
    if (user && user.role !== 'admin') {
      const myBusinesses = await businessRepository.findByUserId(user.id);
      const myIds = myBusinesses.map((b) => b.id);
      if (businessId && !myIds.includes(businessId)) {
        throw new AuthorizationError('You do not have permission to view invoices for this business');
      }
      if (!businessId) {
        businessId = myIds[0] || '00000000-0000-0000-0000-000000000000';
      }
    }

    const result = await invoiceRepository.findInvoices({
      businessId,
      status,
      search,
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
    const body = await parseAndValidateBody(req, createInvoiceSchema);
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

    const startDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const invoice = await invoiceRepository.create({
      invoice_number: body.invoice_number,
      business_id: targetBusinessId || null,
      business_name: body.business_name.trim(),
      plan_type: body.plan_type,
      amount_usd: body.amount_usd,
      payment_method: body.payment_method,
      period_covered: body.period_covered || `${startDate} – ${endDate}`,
      status: body.status || 'Paid',
    });

    if (targetBusinessId && (body.status || 'Paid') === 'Paid') {
      try {
        await businessRepository.update(targetBusinessId, {
          subscription_status: 'Paid Subscriber',
          subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
      } catch (subErr) {
        console.warn('Failed to update business subscription status on invoice creation:', subErr);
      }
    }

    return jsonResponse(
      {
        message: 'Subscription invoice processed and generated successfully.',
        invoice,
      },
      requestId,
      201
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
