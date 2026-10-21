import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('\n======================================================');
  console.log('⚡ Phase 7: Utility Bill Payments & Token Ledger Tests');
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

  // Helper for customer login
  async function getCustomerToken(): Promise<string> {
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@sadzaconnect.co.zw',
        password: 'SadzaCustomer2026!',
      }),
    });
    assert.strictEqual(loginRes.status, 200, 'Customer login should succeed');
    const loginJson = await loginRes.json();
    return loginJson.data.accessToken;
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

  // 1. Bills Ledger Query
  await test('GET /api/v1/bills - queries bill payments ledger with pagination & stats', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/bills?limit=10`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(Array.isArray(json.data.bills), 'bills should be an array');
    assert(typeof json.data.total === 'number', 'total should be a number');
    assert(json.data.stats, 'stats object must be returned');
    assert(typeof json.data.stats.totalReceipts === 'number', 'stats.totalReceipts must be number');
  });

  // 2. Strict Authentication Requirement (Option B)
  await test('POST /api/v1/bills (Unauthenticated) - rejects unauthenticated settlement with 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/bills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        biller: 'ZESA Prepaid Electricity (ZETDC)',
        account_number: '37148920194',
        amount: 20,
        currency: 'USD',
        customer_phone: '+263772123456',
      }),
    });
    assert.strictEqual(res.status, 401, 'Unauthenticated payment must be rejected per Option B');
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  // 3. Validation: Invalid Meter Number
  let customerToken = '';
  await test('POST /api/v1/bills (Invalid Meter) - returns 400 for malformed short meter number', async () => {
    customerToken = await getCustomerToken();
    const res = await fetch(`${BASE_URL}/api/v1/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        biller: 'ZESA Prepaid Electricity (ZETDC)',
        account_number: '123',
        amount: 20,
        currency: 'USD',
        customer_phone: '+263772123456',
      }),
    });
    assert.strictEqual(res.status, 400, 'Invalid meter must return 400');
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  // 4. Valid ZESA Prepaid Electricity Token Generation (USD)
  let createdBillId = '';
  let createdBillRef = '';
  await test('POST /api/v1/bills (ZESA USD) - generates 20-digit token & calculates kWh units', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        biller: 'ZESA Prepaid Electricity (ZETDC)',
        account_number: '37148920194',
        meter_number: '37148920194',
        amount: 20,
        currency: 'USD',
        payment_method: 'EcoCash',
        customer_phone: '+263772123456',
      }),
    });

    assert.strictEqual(res.status, 201);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.bill.id, 'bill must have id');
    assert(json.data.token, 'token must be generated');
    const tokenParts = json.data.token.split(' ');
    assert.strictEqual(tokenParts.length, 5, 'token must have 5 segments of 4 digits');
    tokenParts.forEach((part: string) => assert.strictEqual(part.length, 4, 'each segment must be 4 digits'));
    assert(Number(json.data.units_kwh) > 100, 'kWh units must be calculated from tariff (~124 kWh)');
    assert(json.data.whatsapp_receipt_link.includes('https://wa.me/'), 'must return whatsapp receipt link');

    createdBillId = json.data.bill.id;
    createdBillRef = json.data.bill.payment_reference;
  });

  // 5. Dual-Currency ZiG Token Purchase
  await test('POST /api/v1/bills (ZESA ZiG) - converts ZiG based on platform rate and yields token', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        biller: 'ZESA Prepaid Electricity (ZETDC)',
        account_number: '37148920194',
        amount: 265,
        currency: 'ZiG',
        payment_method: 'OneMoney',
        customer_phone: '+263771999888',
      }),
    });

    assert.strictEqual(res.status, 201);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.bill.currency, 'ZiG');
    assert(Number(json.data.bill.amount_zig) === 265);
    assert(Number(json.data.bill.amount_usd) >= 9.5, 'USD equivalent should be ~10 USD');
    assert(json.data.token, 'ZiG purchase must generate valid token');
  });

  // 6. Municipal Water Payment Settlement
  await test('POST /api/v1/bills (Municipal Water) - settles Harare Municipal Water account', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        biller: 'Harare Municipal Water & Council Rates',
        account_number: 'ACC-883921',
        amount: 35,
        currency: 'USD',
        payment_method: 'InnBucks',
        customer_phone: '+263772111222',
      }),
    });

    assert.strictEqual(res.status, 201);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.payment_reference.startsWith('MUN-'), 'Reference should have MUN prefix');
    assert.strictEqual(json.data.bill.status, 'Completed');
  });

  // 7. DStv Bouquet Subscription Settlement
  await test('POST /api/v1/bills (DStv Renewal) - renews DStv Compact smartcard bouquet', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        biller: 'DStv Bouquet Renewal (DStv Compact)',
        account_number: '1029384756',
        amount: 39,
        currency: 'USD',
        payment_method: 'Card',
        customer_phone: '+263772333444',
      }),
    });

    assert.strictEqual(res.status, 201);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.payment_reference.startsWith('DSTV-'), 'Reference should have DSTV prefix');
  });

  // 8. Single Bill Retrieval by ID & Reference
  await test('GET /api/v1/bills/[id] - retrieves single bill transaction voucher', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/bills/${createdBillId}`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.bill.id, createdBillId);

    // Also test lookup by payment reference
    const refRes = await fetch(`${BASE_URL}/api/v1/bills/${createdBillRef}`);
    assert.strictEqual(refRes.status, 200);
    const refJson = await refRes.json();
    assert.strictEqual(refJson.data.bill.id, createdBillId);
  });

  // 9. Personal Utility Vault Query
  await test('GET /api/v1/bills?my_bills=true - fetches user utility receipts history', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/bills?my_bills=true`, {
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(Array.isArray(json.data.bills), 'bills must be an array');
    assert(json.data.bills.length >= 1, 'customer must have their utility bills in history');
    const hasMyBill = json.data.bills.some((b: any) => b.id === createdBillId);
    assert(hasMyBill, 'newly created bill must appear in user utility vault');
  });

  // 10. Admin Financial Ledger & Reconciliation Search
  await test('GET /api/v1/bills?search=ZETDC - searches ledger and verifies summary metrics', async () => {
    const adminToken = await getAdminToken();
    const res = await fetch(`${BASE_URL}/api/v1/bills?search=ZETDC`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.bills.length >= 1, 'must find ZETDC token records');
    assert(json.data.stats.totalZesaTokens >= 1, 'total ZESA tokens count must be tracked');
    assert(json.data.stats.totalAmountUsd > 0, 'total recognized USD amount must be tracked');
  });

  console.log('\n======================================================');
  console.log(`Results: ${passed}/${total} Phase 7 tests passed!`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during Phase 7 test execution:', err);
  process.exit(1);
});
