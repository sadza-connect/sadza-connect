import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { invoiceRepository } from '@/infrastructure/database/repositories/invoice-repository';
import { businessRepository } from '@/infrastructure/database/repositories/business-repository';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import {
  jsonResponse,
  errorResponse,
} from '@/shared/utils/route-handler';
import { AuthorizationError, NotFoundError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const caller = await getAuthenticatedUser(req, true);
    if (!caller) {
      throw new AuthorizationError('Authentication required to view invoice details');
    }

    const { id } = await params;
    const invoice = await invoiceRepository.findById(id);

    if (!invoice) {
      throw new NotFoundError(`Invoice '${id}' was not found`);
    }

    if (caller.role !== 'admin') {
      let isOwner = false;
      if (invoice.business_id) {
        const biz = await businessRepository.findById(invoice.business_id);
        if (biz && biz.user_id === caller.id) {
          isOwner = true;
        }
      }
      if (!isOwner) {
        throw new AuthorizationError('You do not have permission to view this invoice');
      }
    }

    return jsonResponse({ invoice }, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
