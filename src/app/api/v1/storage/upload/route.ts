import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { storageService } from '@/infrastructure/storage/storage-service';
import {
  UPLOAD_LIMITS,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_DOCUMENT_MIME_TYPES,
} from '@/lib/constants/upload-limits';
import {
  jsonResponse,
  errorResponse,
} from '@/shared/utils/route-handler';
import { ValidationError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
};

/**
 * Validates initial magic bytes to prevent masquerading executable binaries as images.
 */
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  // PNG: 89 50 4E 47
  if (mimeType === 'image/png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }
  // GIF: 47 49 46 38
  if (mimeType === 'image/gif') {
    return (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    );
  }
  // WebP: RIFF ... WEBP
  if (mimeType === 'image/webp') {
    if (buffer.length < 12) return false;
    const isRiff = buffer.subarray(0, 4).toString('ascii') === 'RIFF';
    const isWebp = buffer.subarray(8, 12).toString('ascii') === 'WEBP';
    return isRiff && isWebp;
  }
  // PDF: %PDF
  if (mimeType === 'application/pdf') {
    return buffer.subarray(0, 4).toString('ascii') === '%PDF';
  }

  return true; // Non-strict fallback for other document types
}

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
    const sanitizedPartition = partitionInput.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'public-media';

    const isKyc = sanitizedPartition === 'kyc-documents';
    const isResume = sanitizedPartition === 'resumes';

    // Strict Category-Specific Size Ceilings
    const maxBytes = isKyc
      ? UPLOAD_LIMITS.KYC_DOC_MAX_BYTES
      : isResume
      ? UPLOAD_LIMITS.RESUME_MAX_BYTES
      : UPLOAD_LIMITS.IMAGE_MAX_BYTES;

    const maxMb = isKyc
      ? UPLOAD_LIMITS.KYC_DOC_MAX_MB
      : isResume
      ? UPLOAD_LIMITS.RESUME_MAX_MB
      : UPLOAD_LIMITS.IMAGE_MAX_MB;

    if (blobFile.size > maxBytes) {
      const actualMb = (blobFile.size / (1024 * 1024)).toFixed(2);
      throw new ValidationError(
        `File size (${actualMb} MB) exceeds maximum permitted limit of ${maxMb} MB for ${
          isKyc ? 'statutory KYC compliance documents' : isResume ? 'job resumes' : 'standard images'
        }. Please choose a smaller file.`
      );
    }

    const mimeType = blobFile.type || 'application/octet-stream';

    // Strict MIME-type classification
    if (isKyc || isResume) {
      if (!ALLOWED_DOCUMENT_MIME_TYPES.has(mimeType)) {
        throw new ValidationError(
          `Unsupported file type '${mimeType}'. Allowed formats: PDF, JPEG, PNG, WebP, Word (DOC, DOCX)`
        );
      }
    } else {
      if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
        throw new ValidationError(
          `Unsupported image type '${mimeType}'. Only standard web images (JPEG, PNG, WebP, GIF) are allowed for ${sanitizedPartition}.`
        );
      }
    }

    const arrayBuffer = await blobFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Deep magic-bytes inspection (blocks renamed executable binaries)
    if (!validateMagicBytes(buffer, mimeType)) {
      throw new ValidationError(
        `Security verification failed: file content does not match reported MIME type '${mimeType}'. Upload aborted.`
      );
    }

    const ext = EXTENSION_MAP[mimeType] || path.extname(blobFile.name).replace(/^\./, '') || 'bin';
    const uniqueFileName = `${Date.now()}-${randomUUID()}.${ext}`;
    const storageKey = `${sanitizedPartition}/${uniqueFileName}`;

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
