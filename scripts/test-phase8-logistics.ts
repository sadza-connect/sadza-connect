import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('\n======================================================');
  console.log('🪪 Phase 8: PVC ID Card & Logistics Dispatch Engine Tests');
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

  let adminToken = '';
  try {
    adminToken = await getAdminToken();
  } catch (err: any) {
    console.error('Failed to get admin token:', err.message);
  }

  let createdCardNumber = '';
  let createdOrderNumber = '';

  // 1. Query ID cards list and stats
  await test('GET /api/v1/id-cards - retrieves list of PVC ID cards with stats', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/id-cards?limit=10`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(Array.isArray(json.data.cards), 'Cards should be an array');
    assert.ok(json.data.stats, 'Summary stats should be provided');
    assert.ok(typeof json.data.stats.totalCards === 'number', 'Total cards count is number');
  });

  // 2. Issue PVC ID Card
  await test('POST /api/v1/id-cards - issues new official staff credential with QR payload', async () => {
    const testMemberName = 'Simbarashe Chitepo';
    const res = await fetch(`${BASE_URL}/api/v1/id-cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        member_name: testMemberName,
        member_role: 'Lead Commercial KYC Inspector',
        prefix: 'VER',
        status: 'Active',
        national_id: '63-189240-B-42',
        photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        business_name: 'Harare & Mashonaland Central Registry',
      }),
    });
    assert.strictEqual(res.status, 201);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.card, 'Card record should be returned');
    assert.strictEqual(json.data.card.member_name, testMemberName);
    assert.ok(json.data.card.card_number.startsWith('SC-VER-2026-'), 'Card prefix must match format');
    assert.ok(json.data.card.qr_code_payload.includes(json.data.card.card_number), 'QR payload must contain card number');
    createdCardNumber = json.data.card.card_number;
  });

  // 3. Retrieve single ID card by card number
  await test('GET /api/v1/id-cards/[cardNumber] - retrieves single PVC card record', async () => {
    assert.ok(createdCardNumber, 'Created card number must exist');
    const res = await fetch(`${BASE_URL}/api/v1/id-cards/${createdCardNumber}`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.card.card_number, createdCardNumber);
    assert.strictEqual(json.data.card.member_name, 'Simbarashe Chitepo');
  });

  // 4. Verify public QR verification page
  await test('GET /verify-id/[cardId] - public SSR verification page renders valid credential badge', async () => {
    assert.ok(createdCardNumber, 'Created card number must exist');
    const res = await fetch(`${BASE_URL}/verify-id/${createdCardNumber}`);
    assert.strictEqual(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes('Simbarashe Chitepo'), 'HTML should display member name');
    assert.ok(html.includes('Lead Commercial KYC Inspector'), 'HTML should display role');
    assert.ok(html.includes(createdCardNumber), 'HTML should display card number');
  });

  // 5. Update PVC card status (e.g., Suspend)
  await test('PATCH /api/v1/id-cards/[cardNumber] - updates card status and details', async () => {
    assert.ok(createdCardNumber, 'Created card number must exist');
    const res = await fetch(`${BASE_URL}/api/v1/id-cards/${createdCardNumber}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'Suspended',
        member_role: 'Senior Compliance Auditor',
      }),
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.card.status, 'Suspended');
    assert.strictEqual(json.data.card.member_role, 'Senior Compliance Auditor');
  });

  // 6. Delete / revoke PVC card
  await test('DELETE /api/v1/id-cards/[cardNumber] - revokes and deletes PVC card', async () => {
    assert.ok(createdCardNumber, 'Created card number must exist');
    const res = await fetch(`${BASE_URL}/api/v1/id-cards/${createdCardNumber}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);

    // Verify lookup returns 404
    const checkRes = await fetch(`${BASE_URL}/api/v1/id-cards/${createdCardNumber}`);
    assert.strictEqual(checkRes.status, 404);
  });

  // 7. Query orders list and stats
  await test('GET /api/v1/orders - lists marketplace orders with stats and formatted items', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/orders?limit=10`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(Array.isArray(json.data.orders), 'Orders should be an array');
    assert.ok(Array.isArray(json.data.mappedOrders), 'Mapped orders should be an array');
    assert.ok(json.data.stats, 'Stats should be present');
    assert.ok(typeof json.data.stats.totalOrders === 'number', 'Total orders is number');
  });

  // 8. Create manual dispatch order
  await test('POST /api/v1/orders - creates manual dispatch order with waybill reference', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_name: 'Kwekwe Ferrochrome Logistics',
        customer_phone: '+263 77 889 0012',
        customer_address: 'Industrial Plot 14, Kwekwe, Midlands',
        business_name: 'Dinson Iron and Steel Co',
        items: '4x Heavy Industrial Induction Motors (50kW)',
        total_usd: 12500,
        carrier: 'Swift Transit',
        status: 'Processing',
      }),
    });
    assert.strictEqual(res.status, 201);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.order, 'Order record should be returned');
    assert.strictEqual(json.data.order.customer_name, 'Kwekwe Ferrochrome Logistics');
    assert.ok(json.data.order.order_number.startsWith('SC-ORD-2026-'), 'Order number should match pattern');
    assert.ok(json.data.order.waybill_number.startsWith('WB-ZIM-'), 'Waybill should match pattern');
    createdOrderNumber = json.data.order.order_number;
  });

  // 9. Update order waybill and status
  await test('PATCH /api/v1/orders/[orderNumber] - updates waybill tracking and status', async () => {
    assert.ok(createdOrderNumber, 'Created order number must exist');
    const res = await fetch(`${BASE_URL}/api/v1/orders/${createdOrderNumber}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'In Transit',
        carrier: 'FedEx Zimbabwe',
        waybill_number: 'WB-ZIM-EXPRESS-9921',
      }),
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.order.status, 'In Transit');
    assert.strictEqual(json.data.order.carrier, 'FedEx Zimbabwe');
    assert.strictEqual(json.data.order.waybill_number, 'WB-ZIM-EXPRESS-9921');
  });

  // 10. Delete order record
  await test('DELETE /api/v1/orders/[orderNumber] - deletes order record from dispatch database', async () => {
    assert.ok(createdOrderNumber, 'Created order number must exist');
    const res = await fetch(`${BASE_URL}/api/v1/orders/${createdOrderNumber}`, {
      method: 'DELETE',
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);

    // Verify lookup returns 404
    const checkRes = await fetch(`${BASE_URL}/api/v1/orders/${createdOrderNumber}`);
    assert.strictEqual(checkRes.status, 404);
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
