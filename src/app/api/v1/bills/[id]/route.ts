import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { billRepository } from '@/infrastructure/database/repositories/bill-repository';
import {
  jsonResponse,
  errorResponse,
} from '@/shared/utils/route-handler';
import { NotFoundError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { id } = await params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let bill = null;

    if (isUuid) {
      bill = await billRepository.findById(id);
    }

    if (!bill) {
      bill = await billRepository.findByReference(id);
    }

    if (!bill) {
      throw new NotFoundError(`Utility bill record '${id}' was not found`);
    }

    return jsonResponse({ bill }, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
