import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('\n======================================================');
  console.log('💳 Phase 5: Sponsored Adverts & Billing Engine Tests');
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

  // 1. Adverts Directory Listing
  await test('GET /api/v1/adverts - returns active adverts list with pagination metadata', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/adverts?limit=6`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(Array.isArray(json.data.adverts), 'adverts should be an array');
    assert(json.data.adverts.length > 0, 'should return at least 1 advert');
    assert(typeof json.data.total === 'number', 'total should be a number');

    const first = json.data.adverts[0];
    assert(first.id, 'advert must have id');
    assert(first.headline, 'advert must have headline');
    assert(first.business_name, 'advert must have business_name');
  });

  // 2. Full-Text Search on Adverts
  await test('GET /api/v1/adverts?search=solar - performs text search on promotional headlines & sectors', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/adverts?search=solar`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.adverts.length >= 1, 'should find solar promotions');
    const matches = json.data.adverts.some((a: any) =>
      a.headline.toLowerCase().includes('solar') ||
      a.business_name.toLowerCase().includes('solar') ||
      a.category.toLowerCase().includes('solar')
    );
    assert(matches, 'search results should match solar promotions');
  });

  // 3. Homepage Top-6 Query Filter
  await test('GET /api/v1/adverts?featured_on_home=true - queries homepage sponsored showcase', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/adverts?featured_on_home=true&limit=6`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.adverts.length >= 1, 'should return featured promotions');
    json.data.adverts.forEach((a: any) => {
      assert.strictEqual(a.featured_on_home, true, 'All returned items must have featured_on_home = true');
    });
  });

  // 4. Single Advert by ID
  let sampleAdvertId = '';
  await test('GET /api/v1/adverts/[id] - retrieves single promotion dossier', async () => {
    const listRes = await fetch(`${BASE_URL}/api/v1/adverts?limit=1`);
    const listJson = await listRes.json();
    sampleAdvertId = listJson.data.adverts[0].id;

    const res = await fetch(`${BASE_URL}/api/v1/adverts/${sampleAdvertId}`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.advert.id, sampleAdvertId);
    assert(json.data.advert.headline, 'must have headline');
  });

  // 5. Guest Promotion Creation with Dual Currency
  let createdAdvertId = '';
  await test('POST /api/v1/adverts - allows guest promotion creation with dual currency calculation', async () => {
    const testHeadline = `Zambezi Fresh Fish Bulk Deal ${Date.now()}`;
    const res = await fetch(`${BASE_URL}/api/v1/adverts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name: 'Kariba Cold Storage Pvt Ltd',
        province: 'Mashonaland West',
        category: 'Wholesale & FMCG',
        offer_type: 'Bulk / Wholesale',
        headline: testHeadline,
        offer_text: 'Commercial 20kg blast-frozen Kariba bream boxes with nationwide cold chain transport.',
        promo_badge: 'BULK DISCOUNT 25%',
        original_price_usd: 120,
        promo_price_usd: 90,
        valid_until: 'Valid 14 days',
        whatsapp: '263772888999',
        phone: '+263 77 288 8999',
        featured_on_home: true,
      }),
    });

    assert.strictEqual(res.status, 201);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.advert.id, 'advert must have id');
    assert.strictEqual(json.data.advert.headline, testHeadline);
    assert.strictEqual(Number(json.data.advert.promo_price_usd), 90);
    // 90 * 26.50 = 2385
    assert.strictEqual(Number(json.data.advert.price_zig), 2385);
    createdAdvertId = json.data.advert.id;
  });

  // 6. Admin Advert Update & Pin Toggle
  await test('PATCH /api/v1/adverts/[id] - updates advert details and toggles homepage pin', async () => {
    const token = await getAdminToken();

    const res = await fetch(`${BASE_URL}/api/v1/adverts/${createdAdvertId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        promo_price_usd: 85,
        featured_on_home: false,
      }),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(Number(json.data.advert.promo_price_usd), 85);
    // 85 * 26.50 = 2252.5 -> 2253
    assert(Number(json.data.advert.price_zig) > 0, 'ZiG price should update');
    assert.strictEqual(json.data.advert.featured_on_home, false);
  });

  // 7. Advert Deletion & 404 Check
  await test('DELETE /api/v1/adverts/[id] - deletes campaign and verifies subsequent 404', async () => {
    const token = await getAdminToken();

    const res = await fetch(`${BASE_URL}/api/v1/adverts/${createdAdvertId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);

    const checkRes = await fetch(`${BASE_URL}/api/v1/adverts/${createdAdvertId}`);
    assert.strictEqual(checkRes.status, 404);
  });

  // 8. Invoices Listing
  await test('GET /api/v1/invoices - returns platform invoices list', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/invoices?limit=5`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(Array.isArray(json.data.invoices), 'invoices must be an array');
  });

  // 9. Checkout Invoice Generation
  let createdInvoiceNumber = '';
  await test('POST /api/v1/invoices - creates official SC-INV-2026-XXXX tax invoice', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name: 'Ruwa Plastics & Packaging Ltd',
        plan_type: 'Enterprise Duo Listing & Advert ($25/mo)',
        amount_usd: 28.75, // $25 + 15% VAT
        payment_method: 'EcoCash USD',
        status: 'Paid',
      }),
    });

    assert.strictEqual(res.status, 201);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.invoice.id, 'invoice must have UUID');
    assert(
      json.data.invoice.invoice_number.startsWith('SC-INV-'),
      'invoice number must follow SC-INV- pattern'
    );
    assert.strictEqual(Number(json.data.invoice.amount_usd), 28.75);
    createdInvoiceNumber = json.data.invoice.invoice_number;
  });

  // 10. Single Invoice Retrieval by Invoice Number
  await test('GET /api/v1/invoices/[id] - retrieves invoice by official invoice number', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/invoices/${createdInvoiceNumber}`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.invoice.invoice_number, createdInvoiceNumber);
    assert.strictEqual(json.data.invoice.business_name, 'Ruwa Plastics & Packaging Ltd');
  });

  console.log('\n======================================================');
  console.log(`Results: ${passed}/${total} Phase 5 Integration Tests Passed!`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
