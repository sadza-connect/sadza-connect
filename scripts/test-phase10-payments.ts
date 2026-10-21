import assert from 'node:assert';
import { emailService } from '../src/infrastructure/messaging/email-service';
import {
  createUtilityTokenShareLink,
  createInvoiceReceiptShareLink,
  createOrderWaybillShareLink,
} from '../src/lib/utils/whatsapp';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('\n================================================================');
  console.log('💳 Phase 10: Paynow Gateways, Webhooks & Transactional Messaging');
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

  let transactionRef = '';
  let invoiceNumber = '';

  // 1. Initiate EcoCash transaction
  await test('POST /api/v1/payments/initiate - initiates EcoCash USD transaction', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/payments/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 25.0,
        currency: 'USD',
        payment_method: 'EcoCash',
        phone: '+263 77 123 4567',
        email: 'customer@sadzaconnect.co.zw',
        additional_info: 'Sadza Connect Verified Badge Subscription',
      }),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.reference.startsWith('SC-PAY-'), 'Reference should match SC-PAY format');
    assert.strictEqual(json.data.status, 'Ok');
    assert.ok(json.data.pollUrl, 'Poll URL should be returned');
    assert.ok(json.data.instructions.includes('EcoCash'), 'Instructions should mention EcoCash');

    transactionRef = json.data.reference;
  });

  // 2. Poll transaction status (Initially Pending)
  await test('GET /api/v1/payments/poll - retrieves transaction status (Pending)', async () => {
    assert.ok(transactionRef, 'Transaction ref must exist');
    const res = await fetch(`${BASE_URL}/api/v1/payments/poll?reference=${transactionRef}`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.reference, transactionRef);
    assert.strictEqual(json.data.status, 'Pending');
  });

  // 3. Simulate customer PIN approval on handset
  await test('POST /api/v1/payments/simulate - simulates user mobile USSD authorization', async () => {
    assert.ok(transactionRef, 'Transaction ref must exist');
    const res = await fetch(`${BASE_URL}/api/v1/payments/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference: transactionRef,
      }),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.status, 'Paid');
  });

  // 4. Verify polled status is now Paid
  await test('GET /api/v1/payments/poll - verifies transaction status updated to Paid', async () => {
    assert.ok(transactionRef, 'Transaction ref must exist');
    const res = await fetch(`${BASE_URL}/api/v1/payments/poll?reference=${transactionRef}`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.status, 'Paid');
  });

  // 5. Create real invoice and link with Paynow initiation
  await test('POST /api/v1/invoices - creates pending invoice linked with Paynow payment', async () => {
    invoiceNumber = `SC-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const invRes = await fetch(`${BASE_URL}/api/v1/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoice_number: invoiceNumber,
        business_name: 'Delta Beverages Harare Hub',
        plan_type: 'Sponsored Homepage Banner (Quarterly)',
        amount_usd: 120.0,
        payment_method: 'EcoCash',
        status: 'Pending',
      }),
    });

    assert.strictEqual(invRes.status, 201);
    const invJson = await invRes.json();
    assert.strictEqual(invJson.success, true);
    invoiceNumber = invJson.data.invoice.invoice_number;
    assert.strictEqual(invJson.data.invoice.status, 'Pending');

    // Initiate payment for this invoice
    const payRes = await fetch(`${BASE_URL}/api/v1/payments/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoice_number: invoiceNumber,
        amount: 120.0,
        currency: 'USD',
        payment_method: 'EcoCash',
        phone: '+263 77 999 8811',
        email: 'billing@deltabev.co.zw',
      }),
    });

    assert.strictEqual(payRes.status, 200);
    const payJson = await payRes.json();
    assert.strictEqual(payJson.success, true);
  });

  // 6. Test incoming Paynow Webhook listener marks invoice as Paid
  await test('POST /api/v1/webhooks/payment - Paynow webhook updates invoice status to Paid', async () => {
    assert.ok(invoiceNumber, 'Invoice number must exist');

    const webhookRes = await fetch(`${BASE_URL}/api/v1/webhooks/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference: invoiceNumber,
        paynowreference: `PN-LIVE-ZIM-${Date.now()}`,
        amount: '120.00',
        status: 'Paid',
        authemail: 'billing@deltabev.co.zw',
      }),
    });

    assert.strictEqual(webhookRes.status, 200);
    const webhookJson = await webhookRes.json();
    assert.strictEqual(webhookJson.success, true);
    assert.strictEqual(webhookJson.data.invoiceUpdated, true);

    // Verify invoice is now Paid in database
    const checkInvRes = await fetch(`${BASE_URL}/api/v1/invoices/${invoiceNumber}`);
    assert.strictEqual(checkInvRes.status, 200);
    const checkInvJson = await checkInvRes.json();
    assert.strictEqual(checkInvJson.data.invoice.status, 'Paid');
  });

  // 7. Initiate InnBucks mobile wallet transaction
  await test('POST /api/v1/payments/initiate - initiates InnBucks payment request', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/payments/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 50.0,
        currency: 'USD',
        payment_method: 'InnBucks',
        phone: '+263 78 444 3322',
        email: 'innbucks.buyer@example.co.zw',
      }),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.instructions.includes('InnBucks'), 'Instructions must mention InnBucks');
  });

  // 8. Validation rejection on invalid payment parameters
  await test('POST /api/v1/payments/initiate - rejects invalid request missing valid email', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/payments/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 15.0,
        phone: '+263 77 111 2233',
        email: 'not-an-email',
      }),
    });

    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  // 9. Transactional email dispatch verification
  await test('emailService - generates official invoice and ZESA token emails', async () => {
    // Should execute gracefully without throwing in dev/test
    await emailService.sendInvoiceReceiptEmail('finance@business.co.zw', {
      invoiceNumber: 'SC-INV-2026-TEST',
      amount: 45.0,
      paymentMethod: 'EcoCash USD',
    });

    await emailService.sendUtilityTokenEmail('homeowner@harare.co.zw', {
      biller: 'ZETDC (ZESA)',
      accountNumber: '1428 9912 345',
      token: '4819 2810 4918 2019 4018',
      unitsKwh: 124.5,
      amount: 20.0,
    });
  });

  // 10. WhatsApp deep-link generation verification
  await test('whatsapp utilities - generates compliant click-to-chat links for tokens & invoices', async () => {
    const tokenLink = createUtilityTokenShareLink('ZETDC', '4819 2810 4918 2019 4018', '124.5', '0772123456');
    assert.ok(tokenLink.startsWith('https://wa.me/263772123456?text='), 'Phone number sanitized with 263 prefix');
    assert.ok(tokenLink.includes('ZETDC'), 'Token link must contain biller name');

    const invLink = createInvoiceReceiptShareLink('SC-INV-2026-8812', 120.0, 'Econet Wireless', '+263 77 100 2000');
    assert.ok(invLink.includes('SC-INV-2026-8812'), 'Invoice link must contain invoice number');

    const waybillLink = createOrderWaybillShareLink('SC-ORD-2026-0912', 'WB-ZIM-4412', 'Swift Transit', '0714999888');
    assert.ok(waybillLink.includes('WB-ZIM-4412'), 'Waybill link must contain tracking number');
  });

  console.log('\n----------------------------------------------------------------');
  console.log(`Results: ${passed}/${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log('----------------------------------------------------------------\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
