import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { storageService } from '@/infrastructure/storage/storage-service';
import {
  jsonResponse,
  errorResponse,
} from '@/shared/utils/route-handler';
import { NotFoundError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { key } = await params;
    const fullKey = key.join('/');

    if (!fullKey) {
      throw new NotFoundError('Storage key path is missing');
    }

    const deleted = await storageService.delete(fullKey);

    return jsonResponse(
      {
        message: deleted
          ? `File '${fullKey}' deleted successfully.`
          : `File '${fullKey}' was not found or could not be removed.`,
        key: fullKey,
        deleted,
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
