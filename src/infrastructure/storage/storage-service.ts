import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
  storageProvider: 'cloudflare-r2' | 'local-fallback';
  isEncrypted?: boolean;
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
   * Derives a cryptographic 256-bit key for sensitive KYC verification documents.
   */
  private getKycEncryptionKey(): Buffer {
    const secret =
      process.env.KYC_ENCRYPTION_KEY ||
      process.env.JWT_ACCESS_SECRET ||
      'sadza-connect-kyc-vault-master-key-2026';
    return crypto.createHash('sha256').update(secret).digest();
  }

  /**
   * AES-256-GCM symmetric buffer encryption for private compliance documents.
   */
  public encryptBuffer(buffer: Buffer): Buffer {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.getKycEncryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const tag = cipher.getAuthTag();
    // Prefix with magic header 'SCENC1' (Sadza Connect Encrypted v1) + 12-byte IV + 16-byte Tag + ciphertext
    const header = Buffer.from('SCENC1', 'utf8');
    return Buffer.concat([header, iv, tag, encrypted]);
  }

  /**
   * AES-256-GCM buffer decryption with backwards compatibility for unencrypted legacy files.
   */
  public decryptBuffer(buffer: Buffer): Buffer {
    if (buffer.length < 34) return buffer;
    const header = buffer.subarray(0, 6).toString('utf8');
    if (header !== 'SCENC1') {
      // Not encrypted with this scheme (e.g. legacy plain file), return original buffer
      return buffer;
    }
    const iv = buffer.subarray(6, 18);
    const tag = buffer.subarray(18, 34);
    const ciphertext = buffer.subarray(34);
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.getKycEncryptionKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  }

  /**
   * Uploads a file buffer to Cloudflare R2 or local disk storage.
   * If isPublic is false (e.g. KYC document), encrypts the buffer before storing.
   */
  async upload(
    buffer: Buffer,
    key: string,
    mimeType: string,
    isPublic = true
  ): Promise<UploadResult> {
    const cleanKey = key.replace(/^\/+/, '');
    const shouldEncrypt = !isPublic || cleanKey.startsWith('kyc-documents/');
    const finalBuffer = shouldEncrypt ? this.encryptBuffer(buffer) : buffer;

    if (this.isConfiguredForR2 && this.s3Client) {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: cleanKey,
        Body: finalBuffer,
        ContentType: shouldEncrypt ? 'application/octet-stream' : mimeType,
      });

      await this.s3Client.send(command);

      let publicUrl: string;
      if (shouldEncrypt) {
        // Private documents are accessed via the authenticated view endpoint
        publicUrl = `/api/v1/storage/view?key=${encodeURIComponent(cleanKey)}`;
      } else if (this.publicDomain) {
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
        isEncrypted: shouldEncrypt,
      };
    }

    // Local Disk Fallback
    const localUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const targetFilePath = path.join(localUploadsDir, cleanKey);
    const targetDir = path.dirname(targetFilePath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    await fs.promises.writeFile(targetFilePath, finalBuffer);

    const publicUrl = shouldEncrypt
      ? `/api/v1/storage/view?key=${encodeURIComponent(cleanKey)}`
      : `/uploads/${cleanKey}`;

    return {
      url: publicUrl,
      key: cleanKey,
      size: buffer.length,
      mimeType,
      storageProvider: 'local-fallback',
      isEncrypted: shouldEncrypt,
    };
  }

  /**
   * Retrieves and automatically decrypts a file buffer from Cloudflare R2 or local disk.
   */
  async getFile(key: string): Promise<{ buffer: Buffer; contentType: string } | null> {
    const cleanKey = key.replace(/^\/+/, '');

    if (this.isConfiguredForR2 && this.s3Client) {
      try {
        const command = new GetObjectCommand({
          Bucket: this.bucketName,
          Key: cleanKey,
        });

        const response = await this.s3Client.send(command);
        if (!response.Body) return null;

        const rawByteArray = await response.Body.transformToByteArray();
        const rawBuffer = Buffer.from(rawByteArray);
        const decrypted = this.decryptBuffer(rawBuffer);

        return {
          buffer: decrypted,
          contentType: response.ContentType || 'application/octet-stream',
        };
      } catch (err) {
        console.error(`Failed to fetch object '${cleanKey}' from Cloudflare R2:`, err);
        return null;
      }
    }

    // Local disk fallback
    const localUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const targetFilePath = path.join(localUploadsDir, cleanKey);

    if (!fs.existsSync(targetFilePath)) {
      return null;
    }

    try {
      const rawBuffer = await fs.promises.readFile(targetFilePath);
      const decrypted = this.decryptBuffer(rawBuffer);
      return {
        buffer: decrypted,
        contentType: 'application/octet-stream',
      };
    } catch (err) {
      console.error(`Failed to read local file '${targetFilePath}':`, err);
      return null;
    }
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
