import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { storageService } from '@/infrastructure/storage/storage-service';
import {
  jsonResponse,
  errorResponse,
} from '@/shared/utils/route-handler';
import { ValidationError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();
  try {
    const info = storageService.getStorageInfo();
    return jsonResponse(info, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const partitionInput = (formData.get('partition') as string) || 'public-media';
    const isPublic = formData.get('is_public') !== 'false';

    if (!file || typeof file === 'string') {
      throw new ValidationError('A valid file must be provided in the form data under the "file" field');
    }

    const blobFile = file as File;

    if (blobFile.size > MAX_FILE_SIZE) {
      throw new ValidationError(
        `File size exceeds maximum permitted limit of 10MB (file was ${(blobFile.size / (1024 * 1024)).toFixed(2)}MB)`
      );
    }

    const mimeType = blobFile.type || 'application/octet-stream';
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new ValidationError(
        `Unsupported file type '${mimeType}'. Allowed formats: JPEG, PNG, WebP, GIF, SVG, PDF, DOC, DOCX, TXT`
      );
    }

    const sanitizedPartition = partitionInput.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'public-media';
    const ext = EXTENSION_MAP[mimeType] || path.extname(blobFile.name).replace(/^\./, '') || 'bin';
    const uniqueFileName = `${Date.now()}-${randomUUID()}.${ext}`;
    const storageKey = `${sanitizedPartition}/${uniqueFileName}`;

    const arrayBuffer = await blobFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await storageService.upload(buffer, storageKey, mimeType, isPublic);

    return jsonResponse(
      {
        message: 'File uploaded successfully',
        ...result,
        originalName: blobFile.name,
      },
      requestId,
      201
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
