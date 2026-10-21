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

const simulatePaymentSchema = z.object({
  reference: z.string().min(3, 'Transaction reference is required'),
});

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const body = await parseAndValidateBody(req, simulatePaymentSchema);
    const result = await paynowService.simulatePaymentSuccess(body.reference);

    return jsonResponse(
      {
        ...result,
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
