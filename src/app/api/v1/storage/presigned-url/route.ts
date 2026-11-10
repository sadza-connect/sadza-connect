import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { z } from 'zod';
import { storageService } from '@/infrastructure/storage/storage-service';
import { businessRepository } from '@/infrastructure/database/repositories/business-repository';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { AuthorizationError, ValidationError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const presignedUrlSchema = z.object({
  filename: z.string().optional(),
  key: z.string().optional(),
  mime_type: z.string().min(3, 'MIME type is required'),
  action: z.enum(['upload', 'download']).default('upload'),
  partition: z.string().optional().default('public-media'),
  expires_in: z.number().int().min(60).max(86400).optional().default(3600),
});

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const user = await getAuthenticatedUser(req, true);
    if (!user) {
      throw new AuthorizationError('Authentication required for storage operations');
    }

    const body = await parseAndValidateBody(req, presignedUrlSchema);

    let targetKey = body.key;

    if (!targetKey) {
      if (!body.filename) {
        throw new ValidationError('Either a storage key or filename must be provided');
      }
      const partitionVal = body.partition || 'public-media';
      const sanitizedPartition = partitionVal.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'public-media';
      const ext = path.extname(body.filename) || '.bin';
      targetKey = `${sanitizedPartition}/${Date.now()}-${randomUUID()}${ext}`;
    }

    const cleanKey = targetKey.replace(/^\/+/, '');
    if (body.action === 'download' && cleanKey.startsWith('kyc-documents/') && user.role !== 'admin') {
      const myBusinesses = await businessRepository.findByUserId(user.id);
      const ownsDocument = myBusinesses.some((biz) => {
        let docs: any[] = [];
        try {
          docs = typeof biz.kyc_documents === 'string'
            ? JSON.parse(biz.kyc_documents)
            : Array.isArray(biz.kyc_documents)
            ? biz.kyc_documents
            : [];
        } catch {
          docs = [];
        }
        return docs.some((d: any) => String(d?.url || d?.src || d?.key || d?.path || '').includes(cleanKey));
      });
      if (!ownsDocument) {
        throw new AuthorizationError('Unauthorized to generate download links for confidential compliance documents');
      }
    }

    let presignedUrl: string;

    if (body.action === 'upload') {
      presignedUrl = await storageService.getPresignedUploadUrl(
        cleanKey,
        body.mime_type,
        body.expires_in
      );
    } else {
      presignedUrl = await storageService.getPresignedDownloadUrl(
        cleanKey,
        body.expires_in
      );
    }

    return jsonResponse(
      {
        url: presignedUrl,
        key: targetKey,
        action: body.action,
        expiresInSeconds: body.expires_in,
        provider: storageService.getStorageMode(),
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
