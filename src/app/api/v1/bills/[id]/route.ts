import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { billRepository } from '@/infrastructure/database/repositories/bill-repository';
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
      throw new AuthorizationError('Authentication required to view utility receipts');
    }

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

    if (caller.role !== 'admin' && bill.user_id !== caller.id) {
      throw new AuthorizationError('You do not have permission to view this utility receipt');
    }

    return jsonResponse({ bill }, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
