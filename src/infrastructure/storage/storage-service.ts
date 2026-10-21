import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'node:fs';
import path from 'node:path';

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
  storageProvider: 'cloudflare-r2' | 'local-fallback';
}

export class StorageService {
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private publicDomain: string | null = null;
  private isConfiguredForR2 = false;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    this.bucketName = process.env.R2_BUCKET_NAME || 'sadzaconnect-media';
    this.publicDomain = process.env.R2_PUBLIC_DOMAIN || null;

    if (accountId && accessKeyId && secretAccessKey) {
      try {
        this.s3Client = new S3Client({
          region: 'auto',
          endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        });
        this.isConfiguredForR2 = true;
      } catch (err) {
        console.warn('Failed to initialize S3 Client for Cloudflare R2, falling back to local storage:', err);
        this.s3Client = null;
        this.isConfiguredForR2 = false;
      }
    }
  }

  public getStorageMode(): 'cloudflare-r2' | 'local-fallback' {
    return this.isConfiguredForR2 ? 'cloudflare-r2' : 'local-fallback';
  }

  public getStorageInfo() {
    return {
      provider: this.getStorageMode(),
      bucket: this.bucketName,
      hasPublicDomain: Boolean(this.publicDomain),
      localStoragePath: path.join(process.cwd(), 'public', 'uploads'),
    };
  }

  /**
   * Uploads a file buffer to Cloudflare R2 or local disk storage.
   */
  async upload(
    buffer: Buffer,
    key: string,
    mimeType: string,
    isPublic = true
  ): Promise<UploadResult> {
    const cleanKey = key.replace(/^\/+/, '');

    if (this.isConfiguredForR2 && this.s3Client) {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: cleanKey,
        Body: buffer,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);

      let publicUrl: string;
      if (this.publicDomain) {
        const domain = this.publicDomain.replace(/\/+$/, '');
        publicUrl = `${domain}/${cleanKey}`;
      } else {
        publicUrl = `https://${this.bucketName}.r2.cloudflarestorage.com/${cleanKey}`;
      }

      return {
        url: publicUrl,
        key: cleanKey,
        size: buffer.length,
        mimeType,
        storageProvider: 'cloudflare-r2',
      };
    }

    // Local Disk Fallback
    const localUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const targetFilePath = path.join(localUploadsDir, cleanKey);
    const targetDir = path.dirname(targetFilePath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    await fs.promises.writeFile(targetFilePath, buffer);

    const publicUrl = `/uploads/${cleanKey}`;

    return {
      url: publicUrl,
      key: cleanKey,
      size: buffer.length,
      mimeType,
      storageProvider: 'local-fallback',
    };
  }

  /**
   * Generates a presigned URL for direct client-to-storage upload.
   */
  async getPresignedUploadUrl(
    key: string,
    mimeType: string,
    expiresInSeconds = 3600
  ): Promise<string> {
    const cleanKey = key.replace(/^\/+/, '');

    if (this.isConfiguredForR2 && this.s3Client) {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: cleanKey,
        ContentType: mimeType,
      });

      return getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
    }

    // In local fallback mode, presigned uploads point to internal upload route
    return `/api/v1/storage/upload?key=${encodeURIComponent(cleanKey)}`;
  }

  /**
   * Generates a temporary time-limited presigned URL to view/download private files.
   */
  async getPresignedDownloadUrl(
    key: string,
    expiresInSeconds = 3600
  ): Promise<string> {
    const cleanKey = key.replace(/^\/+/, '');

    if (this.isConfiguredForR2 && this.s3Client) {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: cleanKey,
      });

      return getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
    }

    // In local fallback mode, return the local asset URL or download proxy
    return `/uploads/${cleanKey}`;
  }

  /**
   * Deletes a file from Cloudflare R2 or local disk.
   */
  async delete(key: string): Promise<boolean> {
    const cleanKey = key.replace(/^\/+/, '');

    if (this.isConfiguredForR2 && this.s3Client) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: cleanKey,
        });
        await this.s3Client.send(command);
        return true;
      } catch (err) {
        console.error(`Failed to delete object '${cleanKey}' from R2:`, err);
        return false;
      }
    }

    // Local Disk deletion
    const localUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const targetFilePath = path.join(localUploadsDir, cleanKey);

    if (fs.existsSync(targetFilePath)) {
      try {
        await fs.promises.unlink(targetFilePath);
        return true;
      } catch (err) {
        console.error(`Failed to unlink local file '${targetFilePath}':`, err);
        return false;
      }
    }

    return true;
  }
}

export const storageService = new StorageService();
