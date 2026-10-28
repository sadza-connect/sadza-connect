import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { invoiceRepository } from '@/infrastructure/database/repositories/invoice-repository';
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
    const invoice = await invoiceRepository.findById(id);

    if (!invoice) {
      throw new NotFoundError(`Invoice '${id}' was not found`);
    }

    return jsonResponse({ invoice }, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
