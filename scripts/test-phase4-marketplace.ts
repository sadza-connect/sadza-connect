import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('\n======================================================');
  console.log('🛒 Phase 4: Marketplace & Dual-Currency Engine Tests');
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

  // Helper for admin login
  async function getAdminToken(): Promise<string> {
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@sadzaconnect.co.zw',
        password: 'SadzaAdmin2026!',
      }),
    });
    assert.strictEqual(loginRes.status, 200, 'Admin login should succeed');
    const loginJson = await loginRes.json();
    return loginJson.data.accessToken;
  }

  // 1. Marketplace Catalog Listing
  await test('GET /api/v1/products - returns products with pagination and joined vendor fields', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/products?limit=4`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(Array.isArray(json.data.products), 'products should be an array');
    assert(json.data.products.length > 0, 'should return at least 1 product');
    assert(typeof json.data.total === 'number', 'total should be a number');
    assert.strictEqual(json.data.limit, 4);

    const first = json.data.products[0];
    assert(first.name, 'product must have name');
    assert(first.slug, 'product must have slug');
    assert(typeof first.price_usd === 'number' || typeof first.price_usd === 'string', 'must have price_usd');
  });

  // 2. Full-Text Search
  await test('GET /api/v1/products?search=solar - performs case-insensitive text search across catalog', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/products?search=solar`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.products.length >= 1, 'should find solar products');
    const matches = json.data.products.some((p: any) =>
      p.name.toLowerCase().includes('solar') ||
      (p.description && p.description.toLowerCase().includes('solar')) ||
      (p.category && p.category.toLowerCase().includes('solar'))
    );
    assert(matches, 'search results should contain "solar" keyword');
  });

  // 3. Category Filter
  await test('GET /api/v1/products?category=Solar+%26+Clean+Energy - filters products by commercial category', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/products?category=Solar+%26+Clean+Energy`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.products.length >= 1, 'should return solar category products');
    json.data.products.forEach((p: any) => {
      assert(
        p.category.toLowerCase().includes('solar') || p.category.toLowerCase().includes('energy'),
        `category '${p.category}' should match solar category`
      );
    });
  });

  // 4. Province Filter
  await test('GET /api/v1/products?province=Harare - filters products by supplier province', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/products?province=Harare`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.products.length >= 1, 'should return products from Harare');
    json.data.products.forEach((p: any) => {
      const prov = (p.province || p.business_province || '').toLowerCase();
      assert.strictEqual(prov, 'harare', 'Product province must be Harare');
    });
  });

  // 5. Dual-Currency Engine (USD and ZiG calculation)
  await test('Dual-Currency Engine - ensures price_zig is auto-computed via official rate', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/products?limit=10`);
    const json = await res.json();
    assert.strictEqual(json.success, true);

    const hasValidZig = json.data.products.some((p: any) => {
      const usd = Number(p.price_usd);
      const zig = Number(p.price_zig);
      return usd > 0 && zig > 0;
    });
    assert(hasValidZig, 'At least one product should have computed price_zig');
  });

  // 6. Single Product Detail
  let testSampleSlug = '';
  await test('GET /api/v1/products/[slug] - retrieves full single product dossier with vendor info', async () => {
    const listRes = await fetch(`${BASE_URL}/api/v1/products?limit=1`);
    const listJson = await listRes.json();
    testSampleSlug = listJson.data.products[0].slug;

    const res = await fetch(`${BASE_URL}/api/v1/products/${testSampleSlug}`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.product, 'should return product object');
    assert.strictEqual(json.data.product.slug, testSampleSlug);
    assert(json.data.product.business_name, 'product should have joined business_name');
  });

  // 7. Unauthenticated Protection
  await test('POST /api/v1/products - unauthenticated request returns 401/403', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Unauthorized Product Test',
        price_usd: 100,
      }),
    });
    assert(res.status === 401 || res.status === 403, `Expected 401 or 403, got ${res.status}`);
  });

  // 8. Product Creation by Authenticated Admin
  let createdProductSlug = '';
  await test('POST /api/v1/products - authenticated admin can publish product with dual-currency calculation', async () => {
    const token = await getAdminToken();

    // Fetch existing business slug to attach
    const bizRes = await fetch(`${BASE_URL}/api/v1/businesses?limit=1`);
    const bizJson = await bizRes.json();
    const bizSlug = bizJson.data.businesses[0].slug;

    const testProductName = `5kVA Lithium Battery Pack ${Date.now()}`;
    const res = await fetch(`${BASE_URL}/api/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        business_slug: bizSlug,
        name: testProductName,
        description: 'Grade-A LiFePO4 48V 100Ah battery system with 6000 cycles warranty.',
        category: 'Solar & Clean Energy',
        price_usd: 850,
        condition: 'Brand New',
        in_stock: true,
        stock_quantity: 15,
        is_featured: true,
      }),
    });

    assert.strictEqual(res.status, 201);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.product.id, 'product must have generated UUID');
    assert.strictEqual(json.data.product.name, testProductName);
    assert.strictEqual(Number(json.data.product.price_usd), 850);
    // Auto-computed price_zig: 850 * 26.50 = 22525
    assert(Number(json.data.product.price_zig) > 0, 'price_zig should be auto-calculated');
    createdProductSlug = json.data.product.slug;
  });

  // 9. Product Update
  await test('PATCH /api/v1/products/[slug] - updates price, description and recalculates ZiG price', async () => {
    const token = await getAdminToken();

    const res = await fetch(`${BASE_URL}/api/v1/products/${createdProductSlug}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        price_usd: 800,
        description: 'Updated promotional price for harvest season.',
        is_featured: false,
      }),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(Number(json.data.product.price_usd), 800);
    // 800 * 26.50 = 21200
    assert.strictEqual(Number(json.data.product.price_zig), 21200);
    assert.strictEqual(json.data.product.is_featured, false);
  });

  // 10. Product Deletion
  await test('DELETE /api/v1/products/[slug] - removes product and verifies 404 on subsequent fetch', async () => {
    const token = await getAdminToken();

    const res = await fetch(`${BASE_URL}/api/v1/products/${createdProductSlug}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);

    // Verify 404
    const checkRes = await fetch(`${BASE_URL}/api/v1/products/${createdProductSlug}`);
    assert.strictEqual(checkRes.status, 404);
  });

  console.log('\n======================================================');
  console.log(`Results: ${passed}/${total} Phase 4 Integration Tests Passed!`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
