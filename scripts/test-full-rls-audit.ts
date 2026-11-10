import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getDb } from '../src/infrastructure/database/connection.js';
import { JwtService } from '../src/application/auth/jwt-service.js';

const BASE_URL = 'http://localhost:3000';

async function expectStatus(
  label: string,
  url: string,
  options: RequestInit,
  expectedStatuses: number[],
) {
  const res = await fetch(`${BASE_URL}${url}`, options);
  if (!expectedStatuses.includes(res.status)) {
    const body = await res.text().catch(() => '');
    throw new Error(`FAIL [${label}]: Expected ${expectedStatuses.join('/')}, got ${res.status}. Body: ${body}`);
  }
  console.log(`✅ PASS [${label}] -> HTTP ${res.status}`);
}

async function main() {
  console.log('--- Running Full Multi-Role RLS Security Penetration Audit ---');
  const db = getDb();
  const jwtService = new JwtService();

  const ts = Date.now();
  const customerId = randomUUID();
  const merchantAId = randomUUID();
  const merchantBId = randomUUID();
  const bizBId = randomUUID();
  const adminId = randomUUID();

  const passwordHash = await bcrypt.hash('TestAudit123!', 4);
  const kycKeyB = `kyc-documents/audit-secret-${ts}.pdf`;

  try {
    // Seed temporary test accounts + Merchant B business with confidential KYC doc
    await db('users').insert([
      {
        id: customerId,
        account_type: 'personal',
        role: 'customer',
        full_name: 'Audit Customer',
        email: `audit-customer-${ts}@test.local`,
        password_hash: passwordHash,
        status: 'active',
        is_verified: true,
      },
      {
        id: merchantAId,
        account_type: 'business',
        role: 'merchant',
        full_name: 'Audit Merchant A',
        email: `audit-merch-a-${ts}@test.local`,
        password_hash: passwordHash,
        status: 'active',
        is_verified: true,
      },
      {
        id: merchantBId,
        account_type: 'business',
        role: 'merchant',
        full_name: 'Audit Merchant B',
        email: `audit-merch-b-${ts}@test.local`,
        password_hash: passwordHash,
        status: 'active',
        is_verified: true,
      },
      {
        id: adminId,
        account_type: 'business',
        role: 'admin',
        full_name: 'Audit Super Admin',
        email: `audit-admin-${ts}@test.local`,
        password_hash: passwordHash,
        status: 'active',
        is_verified: true,
      },
    ]);

    const bizASlug = `audit-biz-a-${ts}`;
    const bizBSlug = `audit-biz-b-${ts}`;
    const bizAId = randomUUID();

    await db('businesses').insert([
      {
        id: bizAId,
        user_id: merchantAId,
        name: `Audit Biz A ${ts}`,
        slug: bizASlug,
        province: 'Harare',
        business_type: 'Registered Company (Pvt Ltd)',
        kyc_documents: JSON.stringify([]),
      },
      {
        id: bizBId,
        user_id: merchantBId,
        name: `Audit Biz B ${ts}`,
        slug: bizBSlug,
        province: 'Bulawayo',
        business_type: 'Registered Company (Pvt Ltd)',
        kyc_documents: JSON.stringify([{ key: kycKeyB, url: `/api/v1/storage/view?key=${kycKeyB}` }]),
      },
    ]);

    const customerToken = jwtService.generateAccessToken({
      userId: customerId,
      role: 'customer',
      email: `audit-customer-${ts}@test.local`,
      accountType: 'personal',
    });
    const merchantAToken = jwtService.generateAccessToken({
      userId: merchantAId,
      role: 'merchant',
      email: `audit-merch-a-${ts}@test.local`,
      accountType: 'business',
    });
    const adminToken = jwtService.generateAccessToken({
      userId: adminId,
      role: 'admin',
      email: `audit-admin-${ts}@test.local`,
      accountType: 'business',
    });

    // 1. Unauthenticated access must be blocked across all private endpoints
    await expectStatus('Anon GET /orders', '/api/v1/orders', {}, [401]);
    await expectStatus('Anon GET /bills', '/api/v1/bills', {}, [401]);
    await expectStatus('Anon GET /invoices', '/api/v1/invoices', {}, [401]);
    await expectStatus('Anon GET /users', '/api/v1/users', {}, [401]);
    await expectStatus(
      'Anon POST /storage/presigned-url',
      '/api/v1/storage/presigned-url',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: kycKeyB, mime_type: 'application/pdf', action: 'download' }),
      },
      [401],
    );
    await expectStatus('Anon GET KYC doc', `/api/v1/storage/view?key=${encodeURIComponent(kycKeyB)}`, {}, [401]);

    // 2. Customer role boundaries
    await expectStatus(
      'Customer GET /users',
      '/api/v1/users',
      { headers: { Authorization: `Bearer ${customerToken}` } },
      [403],
    );
    await expectStatus(
      'Customer GET KYC doc',
      `/api/v1/storage/view?key=${encodeURIComponent(kycKeyB)}`,
      { headers: { Authorization: `Bearer ${customerToken}` } },
      [403],
    );
    await expectStatus(
      'Customer GET my_applications=true',
      '/api/v1/jobs/applications?my_applications=true',
      { headers: { Authorization: `Bearer ${customerToken}` } },
      [200],
    );

    // 3. Cross-tenant Merchant A attacking Merchant B
    await expectStatus(
      'Merchant A reading Merchant B KYC doc',
      `/api/v1/storage/view?key=${encodeURIComponent(kycKeyB)}`,
      { headers: { Authorization: `Bearer ${merchantAToken}` } },
      [403],
    );
    await expectStatus(
      'Merchant A presigned download of Merchant B KYC doc',
      '/api/v1/storage/presigned-url',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${merchantAToken}`,
        },
        body: JSON.stringify({ key: kycKeyB, mime_type: 'application/pdf', action: 'download' }),
      },
      [403],
    );
    await expectStatus(
      'Merchant A reading Merchant B invoices',
      `/api/v1/invoices?business_id=${bizBId}`,
      { headers: { Authorization: `Bearer ${merchantAToken}` } },
      [403],
    );
    await expectStatus(
      'Merchant A reading Merchant B orders',
      `/api/v1/orders?business_id=${bizBId}`,
      { headers: { Authorization: `Bearer ${merchantAToken}` } },
      [403],
    );
    await expectStatus(
      'Merchant A tampering with is_featured on own business',
      `/api/v1/businesses/${bizASlug}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${merchantAToken}`,
        },
        body: JSON.stringify({ is_featured: true }),
      },
      [403],
    );
    await expectStatus(
      'Merchant A publishing advert under Merchant B business',
      '/api/v1/adverts',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${merchantAToken}`,
        },
        body: JSON.stringify({
          business_id: bizBId,
          business_name: `Audit Biz B ${ts}`,
          province: 'Bulawayo',
          category: 'Hardware',
          offer_type: 'Special Package',
          headline: 'Spoofed Ad',
          offer_text: 'Attempting to attach advert to another business',
        }),
      },
      [403],
    );

    // 4. Super Admin full platform visibility
    await expectStatus(
      'Admin GET /users',
      '/api/v1/users',
      { headers: { Authorization: `Bearer ${adminToken}` } },
      [200],
    );
    await expectStatus(
      'Admin GET /orders',
      '/api/v1/orders',
      { headers: { Authorization: `Bearer ${adminToken}` } },
      [200],
    );
    await expectStatus(
      'Admin GET /bills',
      '/api/v1/bills',
      { headers: { Authorization: `Bearer ${adminToken}` } },
      [200],
    );
    await expectStatus(
      'Admin GET /invoices',
      '/api/v1/invoices',
      { headers: { Authorization: `Bearer ${adminToken}` } },
      [200],
    );

    console.log('--- ALL 19 Multi-Role RLS Security Audit Assertions PASSED! ---');
  } finally {
    await db('businesses').whereIn('user_id', [merchantAId, merchantBId]).delete();
    await db('users').whereIn('id', [customerId, merchantAId, merchantBId, adminId]).delete();
    console.log('Cleaned up temporary audit users and businesses.');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('❌ Audit failed:', err);
  process.exit(1);
});
