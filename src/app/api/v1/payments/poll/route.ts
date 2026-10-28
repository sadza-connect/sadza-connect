import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { paynowService } from '@/infrastructure/payments/paynow-service';
import {
  jsonResponse,
  errorResponse,
} from '@/shared/utils/route-handler';
import { ValidationError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      throw new ValidationError('Transaction reference query parameter is required');
    }

    const pollResult = await paynowService.pollTransaction(reference);

    return jsonResponse(
      {
        ...pollResult,
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
