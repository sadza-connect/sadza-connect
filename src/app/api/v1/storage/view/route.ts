import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { storageService } from '@/infrastructure/storage/storage-service';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import { errorResponse } from '@/shared/utils/route-handler';
import { AuthorizationError, NotFoundError, ValidationError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EXTENSION_CONTENT_TYPE: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt': 'text/plain',
};

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const key = req.nextUrl.searchParams.get('key');
    if (!key) {
      throw new ValidationError('Storage key parameter is required');
    }

    const cleanKey = key.replace(/^\/+/, '');

    // If accessing confidential KYC documents, enforce admin or authenticated role
    if (cleanKey.startsWith('kyc-documents/')) {
      const user = await getAuthenticatedUser(req, true);
      if (!user) {
        throw new AuthorizationError('Authentication required to view confidential KYC compliance records');
      }
      // Only platform admins or merchants can view KYC records
      if (user.role !== 'admin' && (user.role as any) !== 'merchant') {
        throw new AuthorizationError('Unauthorized to inspect confidential compliance documents');
      }
    }

    const fileData = await storageService.getFile(cleanKey);
    if (!fileData) {
      throw new NotFoundError(`Requested document '${cleanKey}' could not be located in storage.`);
    }

    const ext = path.extname(cleanKey).toLowerCase();
    const contentType =
      fileData.contentType && fileData.contentType !== 'application/octet-stream'
        ? fileData.contentType
        : EXTENSION_CONTENT_TYPE[ext] || 'application/octet-stream';

    const filename = path.basename(cleanKey);
    const isInline =
      contentType.startsWith('image/') || contentType === 'application/pdf';

    return new NextResponse(new Uint8Array(fileData.buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileData.buffer.length),
        'Content-Disposition': `${isInline ? 'inline' : 'attachment'}; filename="${filename}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
