import { NextRequest } from 'next/server';
import { randomUUID, randomInt } from 'node:crypto';
import { z } from 'zod';
import { billRepository } from '@/infrastructure/database/repositories/bill-repository';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import { getPlatformSettings } from '@/data/platformStore';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import {
  ValidationError,
  AuthorizationError,
} from '@/shared/errors/AppError';
import { sanitizePhoneNumber } from '@/lib/utils/whatsapp';

export const runtime = 'nodejs';

function generateZesaToken(): string {
  const parts: string[] = [];
  for (let i = 0; i < 5; i++) {
    const num = randomInt(1000, 10000);
    parts.push(String(num));
  }
  return parts.join(' ');
}

const createBillPaymentSchema = z.object({
  biller: z.string().min(2, 'Utility provider is required'),
  account_number: z.string().min(4, 'Account or meter number is required'),
  meter_number: z.string().optional(),
  amount: z.number().positive('Payment amount must be greater than 0'),
  currency: z.enum(['USD', 'ZiG']).default('USD'),
  payment_method: z.string().default('EcoCash'),
  customer_phone: z.string().min(6, 'Customer contact phone number is required'),
  customer_name: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const biller = searchParams.get('biller') || undefined;
    const status = searchParams.get('status') || undefined;
    const myBills = searchParams.get('my_bills') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    let targetUserId: string | undefined = undefined;

    const user = await getAuthenticatedUser(req, false);
    if (user && user.role !== 'admin') {
      targetUserId = user.id;
    } else if (myBills) {
      if (!user) {
        throw new AuthorizationError('Authentication required to view your utility vault');
      }
      targetUserId = user.id;
    }

    const result = await billRepository.findBillPayments({
      search,
      biller,
      status,
      userId: targetUserId,
      page,
      limit,
    });

    const stats = await billRepository.getSummaryStats();

    return jsonResponse(
      {
        ...result,
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
    // Option B: Mandatory authentication
    const user = await getAuthenticatedUser(req, true);
    if (!user) {
      throw new AuthorizationError('Please sign in or register to purchase utility tokens & record receipts');
    }

    const body = await parseAndValidateBody(req, createBillPaymentSchema);
    const settings = getPlatformSettings();
    const usdToZigRate = settings.usdToZigRate || 26.5;

    let amountUsd = 0;
    let amountZig = 0;

    if (body.currency === 'USD') {
      amountUsd = parseFloat(body.amount.toFixed(2));
      amountZig = parseFloat((amountUsd * usdToZigRate).toFixed(2));
    } else {
      amountZig = parseFloat(body.amount.toFixed(2));
      amountUsd = parseFloat((amountZig / usdToZigRate).toFixed(2));
    }

    const isZesa = body.biller.toLowerCase().includes('zesa') || body.biller.toLowerCase().includes('electricity');
    const isWater = body.biller.toLowerCase().includes('water');
    const isDstv = body.biller.toLowerCase().includes('dstv');

    let token: string | null = null;
    let unitsKwh: number | null = null;

    if (isZesa) {
      // Validate 11-digit meter format if possible
      const cleanMeter = body.account_number.replace(/\D/g, '');
      if (cleanMeter.length < 9) {
        throw new ValidationError('A valid ZESA prepaid meter number (9-11 digits) is required');
      }
      token = generateZesaToken();
      // Domestic lifeline tariff: 6.2 kWh per USD
      unitsKwh = parseFloat((amountUsd * 6.2).toFixed(1));
    }

    const prefix = isZesa ? 'ZETDC' : isWater ? 'MUN' : isDstv ? 'DSTV' : 'BILL';
    const timestamp = Date.now().toString().slice(-6);
    const paymentRef = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}-${timestamp}`;

    const created = await billRepository.create({
      user_id: user.id,
      biller: body.biller,
      account_number: body.account_number.trim(),
      meter_number: body.meter_number?.trim() || (isZesa ? body.account_number.trim() : null),
      amount_usd: amountUsd,
      amount_zig: amountZig,
      currency: body.currency,
      token,
      units_kwh: unitsKwh,
      payment_method: body.payment_method || 'EcoCash',
      payment_reference: paymentRef,
      status: 'Completed',
      customer_name: body.customer_name || user.fullName || 'Verified Customer',
    });

    const tokenMsg = isZesa
      ? `Token: ${token} (${unitsKwh} kWh units). Meter: ${body.account_number}`
      : `Reference: ${paymentRef}. Account: ${body.account_number}`;

    const whatsappLink = `https://wa.me/${sanitizePhoneNumber(body.customer_phone)}?text=${encodeURIComponent(
      `Sadza Connect Utility Receipt (${body.biller}): Paid ${body.currency} ${body.amount}. ${tokenMsg}. Thank you!`
    )}`;

    return jsonResponse(
      {
        message: 'Utility bill payment completed successfully.',
        bill: created,
        token,
        units_kwh: unitsKwh,
        payment_reference: paymentRef,
        whatsapp_receipt_link: whatsappLink,
      },
      requestId,
      201
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
