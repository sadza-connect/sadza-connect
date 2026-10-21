import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('\n======================================================');
  console.log('☁️ Phase 9: Cloud Object Storage & Media Pipeline Tests');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`  ✓ [TEST ${total}] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ [TEST ${total}] ${name}`);
      console.error(`    Error: ${err.message}`);
    }
  }

  let uploadedImageKey = '';
  let uploadedImageUrl = '';
  let uploadedDocKey = '';

  // 1. Storage Info & Health Check
  await test('GET /api/v1/storage/upload - returns storage provider info and status', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/storage/upload`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.provider, 'Provider must be defined');
    assert.ok(['cloudflare-r2', 'local-fallback'].includes(json.data.provider), 'Valid provider mode');
    assert.ok(json.data.bucket, 'Bucket name should be present');
  });

  // 2. Upload sample image to public-media partition
  await test('POST /api/v1/storage/upload - uploads image to public-media partition', async () => {
    // 1x1 transparent PNG buffer
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const pngBuffer = Buffer.from(pngBase64, 'base64');
    const blob = new Blob([pngBuffer], { type: 'image/png' });

    const formData = new FormData();
    formData.append('file', blob, 'sample-logo.png');
    formData.append('partition', 'public-media');
    formData.append('is_public', 'true');

    const res = await fetch(`${BASE_URL}/api/v1/storage/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(res.status, 201);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.url, 'Upload URL must be returned');
    assert.ok(json.data.key, 'Storage key must be returned');
    assert.ok(json.data.key.startsWith('public-media/'), 'Key must reside in public-media partition');
    assert.strictEqual(json.data.mimeType, 'image/png');

    uploadedImageKey = json.data.key;
    uploadedImageUrl = json.data.url;
  });

  // 3. Verify public media URL is accessible
  await test('GET [uploadedImageUrl] - serves uploaded asset via HTTP', async () => {
    assert.ok(uploadedImageUrl, 'Uploaded image URL must exist');
    const targetUrl = uploadedImageUrl.startsWith('http')
      ? uploadedImageUrl
      : `${BASE_URL}${uploadedImageUrl}`;

    const res = await fetch(targetUrl);
    assert.strictEqual(res.status, 200, `Asset at ${targetUrl} should be accessible`);
  });

  // 4. Upload document to secure-vault / kyc-documents partition
  await test('POST /api/v1/storage/upload - uploads private document to kyc-documents', async () => {
    const docContent = 'Sadza Connect Verified Enterprise KYC Compliance Dossier 2026';
    const blob = new Blob([docContent], { type: 'text/plain' });

    const formData = new FormData();
    formData.append('file', blob, 'kyc-compliance-cert.txt');
    formData.append('partition', 'kyc-documents');
    formData.append('is_public', 'false');

    const res = await fetch(`${BASE_URL}/api/v1/storage/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(res.status, 201);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.key.startsWith('kyc-documents/'), 'Key must reside in kyc-documents partition');
    uploadedDocKey = json.data.key;
  });

  // 5. Generate presigned upload URL
  await test('POST /api/v1/storage/presigned-url - generates upload presigned URL', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/storage/presigned-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: 'direct-upload-avatar.webp',
        mime_type: 'image/webp',
        action: 'upload',
        partition: 'public-media',
        expires_in: 1800,
      }),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.url, 'Presigned URL should be returned');
    assert.ok(json.data.key, 'Target key should be returned');
    assert.strictEqual(json.data.action, 'upload');
  });

  // 6. Generate presigned download URL for private documents
  await test('POST /api/v1/storage/presigned-url - generates download presigned URL for secure asset', async () => {
    assert.ok(uploadedDocKey, 'Uploaded doc key must exist');
    const res = await fetch(`${BASE_URL}/api/v1/storage/presigned-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: uploadedDocKey,
        mime_type: 'text/plain',
        action: 'download',
        expires_in: 600,
      }),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.url, 'Presigned download URL should be returned');
    assert.strictEqual(json.data.key, uploadedDocKey);
    assert.strictEqual(json.data.action, 'download');
  });

  // 7. Validation rejection on missing file
  await test('POST /api/v1/storage/upload - rejects request when file payload is missing', async () => {
    const formData = new FormData();
    formData.append('partition', 'public-media');

    const res = await fetch(`${BASE_URL}/api/v1/storage/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    const errMsg = json.error?.message || JSON.stringify(json.error);
    assert.ok(errMsg.includes('valid file must be provided'), 'Clear error message on missing file');
  });

  // 8. Validation rejection on disallowed MIME type
  await test('POST /api/v1/storage/upload - rejects disallowed executable MIME type', async () => {
    const maliciousPayload = 'binary_payload_executable';
    const blob = new Blob([maliciousPayload], { type: 'application/x-msdownload' });

    const formData = new FormData();
    formData.append('file', blob, 'exploit.exe');
    formData.append('partition', 'public-media');

    const res = await fetch(`${BASE_URL}/api/v1/storage/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    const errMsg = json.error?.message || JSON.stringify(json.error);
    assert.ok(errMsg.includes('Unsupported file type'), 'Rejection error message');
  });

  // 9. Validation rejection on oversized file (>10MB)
  await test('POST /api/v1/storage/upload - rejects oversized file exceeding 10MB limit', async () => {
    // 11MB buffer simulation
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
    const blob = new Blob([largeBuffer], { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('file', blob, 'huge-image.jpg');
    formData.append('partition', 'public-media');

    const res = await fetch(`${BASE_URL}/api/v1/storage/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    const errMsg = json.error?.message || JSON.stringify(json.error);
    assert.ok(errMsg.includes('File size exceeds'), 'Rejection error message for oversized file');
  });

  // 10. Delete uploaded file
  await test('DELETE /api/v1/storage/[...key] - deletes uploaded file from storage', async () => {
    assert.ok(uploadedImageKey, 'Uploaded image key must exist');
    const res = await fetch(`${BASE_URL}/api/v1/storage/${uploadedImageKey}`, {
      method: 'DELETE',
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.deleted, true);

    // Also cleanup uploaded doc
    if (uploadedDocKey) {
      await fetch(`${BASE_URL}/api/v1/storage/${uploadedDocKey}`, {
        method: 'DELETE',
      });
    }
  });

  console.log('\n------------------------------------------------------');
  console.log(`Results: ${passed}/${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log('------------------------------------------------------\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
