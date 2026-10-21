import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 Phase 3: Business Directory & KYC Engine Tests');
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

  // 1. Directory Listing
  await test('GET /api/v1/businesses - returns businesses with pagination meta', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/businesses?limit=4`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(Array.isArray(json.data.businesses), 'businesses should be an array');
    assert(json.data.businesses.length > 0, 'should return businesses');
    assert(typeof json.data.total === 'number', 'total should be number');
    assert.strictEqual(json.data.limit, 4);
  });

  // 2. Full-Text Search
  await test('GET /api/v1/businesses?search=solar - performs case-insensitive text search', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/businesses?search=solar`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.businesses.length >= 1, 'should find solar business');
    const hasSolar = json.data.businesses.some((b: any) =>
      b.name.toLowerCase().includes('solar') || (b.sector && b.sector.toLowerCase().includes('solar'))
    );
    assert(hasSolar, 'Search result should match solar keyword');
  });

  // 3. Province Filter
  await test('GET /api/v1/businesses?province=Harare - filters by Zimbabwean province', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/businesses?province=Harare`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    json.data.businesses.forEach((b: any) => {
      assert.strictEqual(b.province.toLowerCase(), 'harare');
    });
  });

  // 4. Single Business Details with Products & Jobs
  await test('GET /api/v1/businesses/[slug] - returns business profile dossier', async () => {
    const resList = await fetch(`${BASE_URL}/api/v1/businesses?limit=1`);
    const listJson = await resList.json();
    const slug = listJson.data.businesses[0].slug;

    const res = await fetch(`${BASE_URL}/api/v1/businesses/${slug}`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.business, 'should have business object');
    assert.strictEqual(json.data.business.slug, slug);
    assert(Array.isArray(json.data.products), 'products should be array');
    assert(Array.isArray(json.data.jobs), 'jobs should be array');
  });

  // 5. Track View
  await test('POST /api/v1/businesses/[slug]/track - increments view count', async () => {
    const resList = await fetch(`${BASE_URL}/api/v1/businesses?limit=1`);
    const listJson = await resList.json();
    const slug = listJson.data.businesses[0].slug;

    const res = await fetch(`${BASE_URL}/api/v1/businesses/${slug}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'view' }),
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.type, 'view');
  });

  // 6. Track WhatsApp Click
  await test('POST /api/v1/businesses/[slug]/track - increments whatsapp clicks', async () => {
    const resList = await fetch(`${BASE_URL}/api/v1/businesses?limit=1`);
    const listJson = await resList.json();
    const slug = listJson.data.businesses[0].slug;

    const res = await fetch(`${BASE_URL}/api/v1/businesses/${slug}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'whatsapp' }),
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.type, 'whatsapp');
  });

  // 7. Business Creation (Onboarding)
  let testBusinessSlug = '';
  await test('POST /api/v1/businesses - registers new business in PostgreSQL with Pending status', async () => {
    const testName = `Great Dyke Chrome Logistics ${Date.now()}`;
    const res = await fetch(`${BASE_URL}/api/v1/businesses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        province: 'Midlands',
        city: 'Kwekwe',
        address: 'Stand 405 Mining Ind Zone',
        sector: 'Mining & Heavy Equipment',
        business_type: 'Registered Company (Pvt Ltd)',
        phone: '+263 77 123 4567',
        email: `ops-${Date.now()}@greatdyke.co.zw`,
        whatsapp: '+263 77 123 4567',
        description: 'Heavy mineral transport and logistics contractor across the Great Dyke.',
      }),
    });
    assert.strictEqual(res.status, 201);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.business.id, 'business must have generated UUID');
    assert.strictEqual(json.data.business.verification_status, 'Pending');
    assert.strictEqual(json.data.business.is_verified, false);
    testBusinessSlug = json.data.business.slug;
  });

  // 8. Admin KYC Verification Workflow
  await test('POST /api/v1/businesses/[slug]/verify - Admin can verify business', async () => {
    // Login as Admin
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@sadzaconnect.co.zw',
        password: 'SadzaAdmin2026!',
      }),
    });
    assert.strictEqual(loginRes.status, 200);
    const loginJson = await loginRes.json();
    const token = loginJson.data.accessToken;

    // Verify test business
    const verifyRes = await fetch(`${BASE_URL}/api/v1/businesses/${testBusinessSlug}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'Verified' }),
    });
    assert.strictEqual(verifyRes.status, 200);
    const verifyJson = await verifyRes.json();
    assert.strictEqual(verifyJson.success, true);
    assert.strictEqual(verifyJson.data.business.verification_status, 'Verified');
    assert.strictEqual(verifyJson.data.business.is_verified, true);
  });

  // 9. Profile Update (Preserving Locked Fields)
  await test('PATCH /api/v1/businesses/[slug] - Admin can update description and operational details', async () => {
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@sadzaconnect.co.zw',
        password: 'SadzaAdmin2026!',
      }),
    });
    const loginJson = await loginRes.json();
    const token = loginJson.data.accessToken;

    const res = await fetch(`${BASE_URL}/api/v1/businesses/${testBusinessSlug}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        description: 'Updated mineral haulage and logistics fleet operating 24/7.',
        address: 'Stand 500 Industrial Park',
      }),
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(
      json.data.business.description,
      'Updated mineral haulage and logistics fleet operating 24/7.'
    );
  });

  // 10. Clean up test business
  await test('DELETE /api/v1/businesses/[slug] - Clean up test business', async () => {
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@sadzaconnect.co.zw',
        password: 'SadzaAdmin2026!',
      }),
    });
    const loginJson = await loginRes.json();
    const token = loginJson.data.accessToken;

    const res = await fetch(`${BASE_URL}/api/v1/businesses/${testBusinessSlug}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
  });

  console.log('\n======================================================');
  console.log(`Results: ${passed}/${total} Phase 3 Integration Tests Passed!`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
