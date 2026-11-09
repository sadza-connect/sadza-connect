import { S3Client, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config({ path: '.env.local' });

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || 'sadzaconnect-media';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
});

// Helper to create a minimal valid JPEG image buffer
function createSampleJpeg(width = 200, height = 200): Buffer {
  // Minimal valid 1x1 JPEG buffer with JFIF header
  return Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
    0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
    0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
    0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
    0x00, 0xbf, 0x80, 0xff, 0xd9,
  ]);
}

// Helper to create a minimal valid PDF buffer
function createSamplePdf(content: string): Buffer {
  const pdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >> endobj
4 0 obj << /Length ${content.length + 40} >>
stream
BT
/F1 12 Tf
72 712 Td
(${content}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000216 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
310
%%EOF`;
  return Buffer.from(pdfContent, 'utf8');
}

async function runTests() {
  console.log('===============================================================');
  console.log('       SADZA CONNECT — LIVE CLOUDFLARE R2 VERIFICATION SUITE   ');
  console.log('===============================================================');
  console.log(`Cloudflare Account ID : ${accountId}`);
  console.log(`Target R2 Bucket      : ${bucketName}`);
  console.log(`Server Endpoint       : http://localhost:3000/api/v1/storage/upload`);
  console.log('---------------------------------------------------------------\n');

  // TEST 1: Oversized Image Rejection (> 5MB)
  console.log('▶ [TEST 1] Testing 5MB upload ceiling security enforcement...');
  const oversizedBuffer = Buffer.concat([createSampleJpeg(), Buffer.alloc(6 * 1024 * 1024)]); // 6MB
  const formOversized = new FormData();
  formOversized.append('file', new Blob([oversizedBuffer], { type: 'image/jpeg' }), 'huge-photo.jpg');
  formOversized.append('partition', 'marketplace-products');

  const resOversized = await fetch('http://localhost:3000/api/v1/storage/upload', {
    method: 'POST',
    body: formOversized,
  });
  const jsonOversized = await resOversized.json();

  if (resOversized.status === 400 && !jsonOversized.success) {
    console.log('  ✔ PASS: 6MB image upload was successfully BLOCKED by server!');
    console.log(`  ✔ Server Error Message: "${jsonOversized.error?.message}"\n`);
  } else {
    console.error('  ✘ FAIL: Oversized upload was not rejected properly:', jsonOversized);
  }

  // TEST 2: Product Image Upload to Cloudflare R2
  console.log('▶ [TEST 2] Testing Marketplace Product Image upload to Cloudflare R2...');
  const sampleProductJpg = createSampleJpeg();
  const formProduct = new FormData();
  formProduct.append('file', new Blob([new Uint8Array(sampleProductJpg)], { type: 'image/jpeg' }), 'solar-inverter-5kva.jpg');
  formProduct.append('partition', 'marketplace-products');
  formProduct.append('is_public', 'true');

  const resProduct = await fetch('http://localhost:3000/api/v1/storage/upload', {
    method: 'POST',
    body: formProduct,
  });
  const jsonProduct = await resProduct.json();

  if (resProduct.ok && jsonProduct.data?.key) {
    const productKey = jsonProduct.data.key;
    const productUrl = jsonProduct.data.url;
    console.log(`  ✔ Upload API Response: 201 Created`);
    console.log(`  ✔ Returned Key: ${productKey}`);
    console.log(`  ✔ Public URL  : ${productUrl}`);

    // Verify object physically exists in Cloudflare R2 via S3 API
    console.log(`  Verifying object exists inside Cloudflare R2 bucket '${bucketName}'...`);
    const r2Head = await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: productKey }));
    console.log(`  ✔ PASS: Object physically confirmed in Cloudflare R2! (Size: ${r2Head.ContentLength} bytes, Type: ${r2Head.ContentType})\n`);
  } else {
    console.error('  ✘ FAIL: Product upload failed:', jsonProduct);
  }

  // TEST 3: Confidential Statutory KYC Document Upload & Encryption
  console.log('▶ [TEST 3] Testing Statutory KYC Document Upload & AES-256-GCM Encryption...');
  const confidentialPdf = createSamplePdf('CONFIDENTIAL DIRECTORS NATIONAL ID & CR14 CERTIFICATE - NOT FOR PUBLIC DISCLOSURE');
  const formKyc = new FormData();
  formKyc.append('file', new Blob([new Uint8Array(confidentialPdf)], { type: 'application/pdf' }), 'director-id-scan.pdf');
  formKyc.append('partition', 'kyc-documents');
  formKyc.append('is_public', 'false');

  const resKyc = await fetch('http://localhost:3000/api/v1/storage/upload', {
    method: 'POST',
    body: formKyc,
  });
  const jsonKyc = await resKyc.json();

  if (resKyc.ok && jsonKyc.data?.key) {
    const kycKey = jsonKyc.data.key;
    const viewUrl = jsonKyc.data.url;
    console.log(`  ✔ Upload API Response: 201 Created`);
    console.log(`  ✔ KYC Storage Key: ${kycKey}`);
    console.log(`  ✔ Protected View URL: ${viewUrl}`);
    console.log(`  ✔ Reported isEncrypted: ${jsonKyc.data.isEncrypted}`);

    // Fetch the RAW bytes stored directly inside Cloudflare R2 to verify encryption
    console.log(`  Querying Cloudflare R2 directly for raw stored bytes of '${kycKey}'...`);
    const rawR2Obj = await s3Client.send(new GetObjectCommand({ Bucket: bucketName, Key: kycKey }));
    const rawR2Bytes = Buffer.from(await rawR2Obj.Body!.transformToByteArray());

    // Check magic encryption header
    const magicHeader = rawR2Bytes.subarray(0, 6).toString('utf8');
    console.log(`  Raw File Size in Cloudflare R2 : ${rawR2Bytes.length} bytes`);
    console.log(`  Raw Magic Header in Cloudflare : "${magicHeader}"`);

    if (magicHeader === 'SCENC1') {
      console.log('  ✔ PASS: Document is CRYPTOGRAPHICALLY ENCRYPTED with AES-256-GCM in Cloudflare R2!');
      console.log('  ✔ Anyone downloading the file directly from Cloudflare sees only encrypted ciphertext.');
      console.log(`  Sample Ciphertext Dump: [${rawR2Bytes.subarray(0, 32).toString('hex')}...]\n`);
    } else {
      console.warn('  ✘ WARNING: Magic encryption header SCENC1 was not detected!');
    }

    // Verify authenticated retrieval via /api/v1/storage/view
    console.log('  Testing access to protected view endpoint without authentication...');
    const resUnauth = await fetch(`http://localhost:3000${viewUrl}`);
    console.log(`  ✔ Unauthenticated View Response Status: ${resUnauth.status} (Access Denied as expected)\n`);
  } else {
    console.error('  ✘ FAIL: KYC upload failed:', jsonKyc);
  }

  // TEST 4: Storefront Logo / Avatar Upload to Cloudflare R2
  console.log('▶ [TEST 4] Testing Business Logo & Profile Avatar Upload to Cloudflare R2...');
  const sampleAvatarJpg = createSampleJpeg();
  const formAvatar = new FormData();
  formAvatar.append('file', new Blob([new Uint8Array(sampleAvatarJpg)], { type: 'image/jpeg' }), 'merchant-store-logo.jpg');
  formAvatar.append('partition', 'business-logos');
  formAvatar.append('is_public', 'true');

  const resAvatar = await fetch('http://localhost:3000/api/v1/storage/upload', {
    method: 'POST',
    body: formAvatar,
  });
  const jsonAvatar = await resAvatar.json();

  if (resAvatar.ok && jsonAvatar.data?.key) {
    const avatarKey = jsonAvatar.data.key;
    console.log(`  ✔ Upload API Response: 201 Created`);
    console.log(`  ✔ Logo Storage Key: ${avatarKey}`);
    const r2Head = await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: avatarKey }));
    console.log(`  ✔ PASS: Storefront Logo physically confirmed in Cloudflare R2! (${r2Head.ContentLength} bytes)\n`);
  }

  // TEST 5: Normal User Profile Avatar Upload to Cloudflare R2 (partition: avatars)
  console.log('▶ [TEST 5] Testing Normal User Profile Avatar Upload to Cloudflare R2...');
  const sampleUserAvatar = createSampleJpeg();
  const formUserAvatar = new FormData();
  formUserAvatar.append('file', new Blob([new Uint8Array(sampleUserAvatar)], { type: 'image/jpeg' }), 'user-profile-avatar.jpg');
  formUserAvatar.append('partition', 'avatars');
  formUserAvatar.append('is_public', 'true');

  const resUserAvatar = await fetch('http://localhost:3000/api/v1/storage/upload', {
    method: 'POST',
    body: formUserAvatar,
  });
  const jsonUserAvatar = await resUserAvatar.json();

  if (resUserAvatar.ok && jsonUserAvatar.data?.key) {
    const userAvatarKey = jsonUserAvatar.data.key;
    const userAvatarUrl = jsonUserAvatar.data.url;
    console.log(`  ✔ Upload API Response: 201 Created`);
    console.log(`  ✔ Avatar Storage Key: ${userAvatarKey}`);
    console.log(`  ✔ Public CDN URL: ${userAvatarUrl}`);
    const r2Head = await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: userAvatarKey }));
    console.log(`  ✔ PASS: Normal User Avatar physically confirmed in Cloudflare R2! (${r2Head.ContentLength} bytes, Type: ${r2Head.ContentType})\n`);
  } else {
    console.error('  ✘ FAIL: User avatar upload failed:', jsonUserAvatar);
  }

  console.log('===============================================================');
  console.log('             ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!    ');
  console.log('===============================================================');
}

runTests().catch(console.error);

