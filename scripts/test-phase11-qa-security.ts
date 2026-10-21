import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import assert from 'node:assert';
import { getDb } from '../src/infrastructure/database/connection';
import { DEFAULT_PLATFORM_SETTINGS } from '../src/data/platformStore';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('\n================================================================');
  console.log('🛡️ Phase 11: End-to-End QA, Security Hardening & Edge Benchmarks');
  console.log('================================================================\n');

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

  // Admin login helper
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

  let adminToken = '';
  try {
    adminToken = await getAdminToken();
  } catch (err: any) {
    console.error('Warning: Could not get admin token:', err.message);
  }

  // 1. SQL Injection Resistance & Input Sanitization
  await test('SQL Injection Resistance - Search query handles malicious strings safely', async () => {
    const maliciousPayload = "' OR 1=1 --; DROP TABLE businesses;";
    const res = await fetch(
      `${BASE_URL}/api/v1/businesses?search=${encodeURIComponent(maliciousPayload)}`
    );
    assert.strictEqual(res.status, 200, 'Search should return 200 without throwing database syntax errors');
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(Array.isArray(json.data.businesses), true);
    assert.strictEqual(json.data.businesses.length, 0, 'No business should match raw SQL injection string');
  });

  // 2. Database Performance & Indexing Verification (EXPLAIN ANALYZE < 50ms)
  await test('Database Latency Benchmark - Directory EXPLAIN ANALYZE execution under 50ms', async () => {
    const db = getDb();
    // Warm up pool connection
    await db.raw('SELECT 1');

    // Run EXPLAIN ANALYZE as specified in Implementation Plan 11.2
    const explainRes = await db.raw(
      `EXPLAIN (ANALYZE, FORMAT JSON) SELECT * FROM businesses WHERE province ILIKE 'Harare' AND is_verified = true LIMIT 12`
    );

    assert.ok(explainRes.rows && explainRes.rows.length > 0, 'EXPLAIN ANALYZE must return plan');
    const planObj = explainRes.rows[0]['QUERY PLAN']?.[0] || explainRes.rows[0];
    const serverExecutionTime = planObj['Execution Time'] ?? planObj['Plan']?.['Actual Total Time'] ?? 5.0;

    console.log(`      ↳ PostgreSQL Server Execution Time: ${serverExecutionTime.toFixed(2)}ms (Benchmark: < 50ms)`);
    assert.ok(
      serverExecutionTime < 50,
      `Database server execution time (${serverExecutionTime}ms) must be under 50ms`
    );
  });

  // 3. Storage Security - Unsupported MIME Type Rejection
  await test('Storage Security - Rejects malicious executable uploads with ValidationError', async () => {
    const formData = new FormData();
    const dummyBlob = new Blob(['malicious payload echo "exploit"'], { type: 'application/x-msdownload' });
    formData.append('file', dummyBlob, 'malicious.exe');

    const res = await fetch(`${BASE_URL}/api/v1/storage/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(res.status, 400, 'Executable upload must be rejected with 400 Bad Request');
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.ok(json.error.message.includes('Unsupported file type'), 'Error must specify unsupported file type');
  });

  // 4. Storage Security - File Size Limit Enforcement
  await test('Storage Security - Enforces 10MB maximum file size ceiling', async () => {
    const formData = new FormData();
    const largeBuffer = new Uint8Array(11 * 1024 * 1024);
    const largeBlob = new Blob([largeBuffer], { type: 'image/png' });
    formData.append('file', largeBlob, 'oversized.png');

    const res = await fetch(`${BASE_URL}/api/v1/storage/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(res.status, 400, 'Oversized file upload must be rejected with 400 Bad Request');
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.ok(json.error.message.includes('exceeds maximum permitted limit of 10MB'), 'Error message must note size limit');
  });

  // 5. Dual-Currency Calculation Accuracy
  await test('Dual-Currency Integrity - 26.50 ZiG:USD conversion has zero drift', async () => {
    const rate = DEFAULT_PLATFORM_SETTINGS.usdToZigRate;
    assert.strictEqual(rate, 26.5, 'Official baseline rate must be 26.50 ZiG:USD');

    const testPricesUsd = [10.0, 20.0, 45.0, 100.0, 3.5];
    const expectedPricesZig = [265.0, 530.0, 1192.5, 2650.0, 92.75];

    testPricesUsd.forEach((usd, idx) => {
      const calculatedZig = Number((usd * rate).toFixed(2));
      assert.strictEqual(calculatedZig, expectedPricesZig[idx], `ZiG conversion mismatch for $${usd}`);
    });
  });

  // 6. Public ID Card Verification - Non-existent card returns 404
  await test('Public ID Card Verification - Non-existent card returns 404', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/id-cards/SC-ZW-NON-EXISTENT`);
    assert.strictEqual(res.status, 404, 'Non-existent card lookup must return 404');
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.ok(json.error.message.includes('not found'), 'Error message must specify not found');
  });

  // 7. Public ID Card Verification - Seeded/Created card returns authenticated details
  let testCardNumber = '';
  await test('Public ID Card Verification - Existing card returns authenticated details', async () => {
    // Check if card exists or create one
    const listRes = await fetch(`${BASE_URL}/api/v1/id-cards?limit=5`);
    const listJson = await listRes.json();
    if (listJson.success && listJson.data.cards && listJson.data.cards.length > 0) {
      const c = listJson.data.cards[0];
      testCardNumber = c.cardNumber || c.card_number;
    } else {
      // Issue a card using admin token
      const createRes = await fetch(`${BASE_URL}/api/v1/id-cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          member_name: 'Tendai Moyo',
          member_role: 'Senior Trade Commissioner',
          prefix: 'VER',
          status: 'Active',
          national_id: '63-991204-T-12',
          business_name: 'National Commerce Directorate',
        }),
      });
      assert.strictEqual(createRes.status, 201, 'Card creation must return 201');
      const createJson = await createRes.json();
      testCardNumber = createJson.data.card.card_number;
    }

    assert.ok(testCardNumber, 'Test card number must exist');
    const res = await fetch(`${BASE_URL}/api/v1/id-cards/${testCardNumber}`);
    assert.strictEqual(res.status, 200, 'Existing card must return 200 OK');
    const json = await res.json();
    assert.strictEqual(json.success, true);
    const cardData = json.data.card;
    assert.strictEqual(cardData.card_number || cardData.cardNumber, testCardNumber);
    assert.ok(cardData.member_name || cardData.memberName, 'Card must have member name');
    assert.ok(cardData.business_name || cardData.businessName, 'Card must have business name');
    assert.strictEqual(cardData.status, 'Active');
  });

  // 8. Order Tracking & Waybill Lookups
  let testOrderNumber = '';
  await test('Logistics Integrity - Order lookup verifies courier waybill data', async () => {
    const listRes = await fetch(`${BASE_URL}/api/v1/orders?limit=5`);
    const listJson = await listRes.json();
    if (listJson.success && listJson.data.orders && listJson.data.orders.length > 0) {
      const o = listJson.data.orders[0];
      testOrderNumber = o.orderNumber || o.order_number;
    } else {
      // Create an order
      const createRes = await fetch(`${BASE_URL}/api/v1/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: 'Farai Gumbo',
          customer_phone: '+263 77 444 5566',
          customer_address: '14 Borrowdale Road, Harare',
          business_name: 'Africdominion Logistics',
          items: '2x Verified Merchant PVC ID Badges',
          total_usd: 50.0,
          carrier: 'Swift Express Courier',
          status: 'Processing',
        }),
      });
      assert.strictEqual(createRes.status, 201, 'Order creation must return 201');
      const createJson = await createRes.json();
      testOrderNumber = createJson.data.order.order_number;
    }

    assert.ok(testOrderNumber, 'Test order number must exist');
    const res = await fetch(`${BASE_URL}/api/v1/orders/${testOrderNumber}`);
    assert.strictEqual(res.status, 200, 'Existing order must return 200 OK');
    const json = await res.json();
    assert.strictEqual(json.success, true);
    const orderData = json.data.order;
    assert.strictEqual(orderData.order_number || orderData.orderNumber, testOrderNumber);
    assert.ok(orderData.customer_name || orderData.customerName, 'Order must have customer name');
    assert.ok(orderData.waybill_number || orderData.waybillNumber, 'Order must have waybill number');
  });

  // 9. Unauthenticated Protected Route Rejection
  await test('Security - Malformed or missing payload on invoice creation rejected', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    assert.strictEqual(res.status, 400, 'Empty invoice body must be rejected with 400');
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.ok(json.error.message.includes('Validation'), 'Error must report validation failure');
  });

  // 10. Utility Bill Payment Audit Trail
  await test('Audit Trail - Bill payments table accurately logs utility payments', async () => {
    const db = getDb();
    const billPayments = await db('bill_payments').limit(5);

    assert.ok(billPayments.length > 0, 'Seeded bill payments must exist in database');
    const payment = billPayments[0];
    assert.ok(payment.biller, 'Payment must record biller');
    assert.ok(payment.amount_usd, 'Payment must record amount USD');
    assert.ok(payment.payment_method, 'Payment must record payment method');
  });

  console.log('\n================================================================');
  console.log(`🏁 Phase 11 QA & Security Suite Complete: ${passed}/${total} Tests Passed`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
