import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { businessRepository } from '@/infrastructure/database/repositories/business-repository';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const trackSchema = z.object({
  type: z.enum(['view', 'whatsapp']),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { slug } = await params;
    const body = await parseAndValidateBody(req, trackSchema);

    if (body.type === 'view') {
      await businessRepository.incrementViews(slug);
    } else if (body.type === 'whatsapp') {
      await businessRepository.incrementWhatsappClicks(slug);
    }

    return jsonResponse({ tracked: true, type: body.type }, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
