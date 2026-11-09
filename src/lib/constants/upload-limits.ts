/**
 * Sadza Connect — Unified Upload Limits & Media Security Standards
 * 
 * Strict file size ceilings, MIME validation, and compression rules
 * across Storefront, Marketplace, Adverts, Properties, Tourism, and KYC Vault.
 */

export const UPLOAD_LIMITS = {
  /** Standard max size for images (products, adverts, properties, tourism, avatars, logos, covers) */
  IMAGE_MAX_BYTES: 5 * 1024 * 1024, // 5 MB
  IMAGE_MAX_MB: 5,

  /** Maximum size for statutory KYC verification documents (incorporation certs, CR14, tax clearance, multi-page PDFs) */
  KYC_DOC_MAX_BYTES: 10 * 1024 * 1024, // 10 MB
  KYC_DOC_MAX_MB: 10,

  /** Maximum size for job applicant resumes & curriculum vitae (PDF, DOCX) */
  RESUME_MAX_BYTES: 5 * 1024 * 1024, // 5 MB
  RESUME_MAX_MB: 5,
} as const;

export type UploadPartition =
  | 'marketplace-products'
  | 'public-media'
  | 'adverts'
  | 'properties'
  | 'tourism'
  | 'business-logos'
  | 'business-covers'
  | 'avatars'
  | 'kyc-documents'
  | 'resumes';

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

/**
 * Validates a client-selected file against platform size and MIME standards.
 */
export function validateUploadFile(
  file: File,
  partition: UploadPartition = 'public-media'
): { valid: boolean; error?: string } {
  const isKyc = partition === 'kyc-documents';
  const isResume = partition === 'resumes';

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

  if (file.size > maxBytes) {
    const actualMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${actualMb} MB) exceeds maximum permitted limit of ${maxMb} MB for ${isKyc ? 'KYC documents' : isResume ? 'resumes' : 'images'}.`,
    };
  }

  const mime = file.type || '';
  if (isKyc || isResume) {
    if (mime && !ALLOWED_DOCUMENT_MIME_TYPES.has(mime)) {
      return {
        valid: false,
        error: `Unsupported file format '${mime}'. Allowed formats: PDF, JPG, PNG, WebP, DOC, DOCX.`,
      };
    }
  } else {
    if (mime && !ALLOWED_IMAGE_MIME_TYPES.has(mime)) {
      return {
        valid: false,
        error: `Unsupported image format '${mime}'. Please upload JPG, PNG, or WebP.`,
      };
    }
  }

  return { valid: true };
}

/**
 * Client-side high-efficiency WebP image downscaler and compressor.
 * Automatically downscales camera photos (e.g. 4000x3000) down to max 1280px / 1600px WebP,
 * turning a 4.5MB camera capture into ~80-150KB before uploading to Cloudflare R2.
 */
export async function compressImageToBlob(
  file: File,
  maxWidth = 1280,
  quality = 0.82
): Promise<Blob> {
  // If already an SVG or very small, return as is
  if (file.type === 'image/svg+xml' || file.size < 60 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        resolve(file);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = rawDataUrl;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
