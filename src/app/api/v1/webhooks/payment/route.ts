import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { paynowService } from '@/infrastructure/payments/paynow-service';
import {
  jsonResponse,
  errorResponse,
} from '@/shared/utils/route-handler';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const contentType = req.headers.get('content-type') || '';
    const payload: Record<string, string> = {};

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        payload[key] = String(value);
      });
    } else {
      const json = await req.json().catch(() => ({}));
      for (const [key, value] of Object.entries(json)) {
        payload[key] = String(value);
      }
    }

    const result = await paynowService.processWebhook(payload);

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
