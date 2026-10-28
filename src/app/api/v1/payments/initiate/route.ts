import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { paynowService } from '@/infrastructure/payments/paynow-service';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const initiatePaymentSchema = z.object({
  invoice_number: z.string().optional(),
  amount: z.number().positive('Payment amount must be greater than 0'),
  currency: z.enum(['USD', 'ZiG']).default('USD'),
  payment_method: z.enum(['EcoCash', 'InnBucks', 'OneMoney', 'Card']).default('EcoCash'),
  phone: z.string().min(5, 'Customer mobile money phone number is required'),
  email: z.string().email('Valid customer email is required'),
  return_url: z.string().optional(),
  additional_info: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const body = await parseAndValidateBody(req, initiatePaymentSchema);

    const result = await paynowService.initiateTransaction({
      invoiceNumber: body.invoice_number,
      amount: body.amount,
      currency: body.currency || 'USD',
      paymentMethod: (body.payment_method || 'EcoCash') as 'EcoCash' | 'InnBucks' | 'OneMoney' | 'Card',
      phone: body.phone,
      email: body.email,
      returnUrl: body.return_url,
      additionalInfo: body.additional_info,
    });

    return jsonResponse(
      {
        message: 'Payment transaction initiated successfully',
        ...result,
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
