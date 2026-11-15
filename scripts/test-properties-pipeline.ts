import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getDb } from '../src/infrastructure/database/connection.js';
import { JwtService } from '../src/application/auth/jwt-service.js';
import { propertyRepository } from '../src/infrastructure/database/repositories/property-repository.js';

const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('--- Testing PostgreSQL Properties Pipeline & Security ---');
  const db = getDb();
  const jwtService = new JwtService();

  const ts = Date.now();
  const adminId = randomUUID();
  const customerId = randomUUID();
  const passwordHash = await bcrypt.hash('TestProperties123!', 4);

  try {
    // Seed test admin and customer
    await db('users').insert([
      {
        id: adminId,
        account_type: 'personal',
        role: 'admin',
        full_name: 'Properties Test Admin',
        email: `prop-admin-${ts}@test.local`,
        password_hash: passwordHash,
        status: 'active',
        is_verified: true,
      },
      {
        id: customerId,
        account_type: 'personal',
        role: 'customer',
        full_name: 'Properties Test Customer',
        email: `prop-cust-${ts}@test.local`,
        password_hash: passwordHash,
        status: 'active',
        is_verified: true,
      },
    ]);

    const adminToken = jwtService.generateAccessToken({
      userId: adminId,
      email: `prop-admin-${ts}@test.local`,
      role: 'admin',
      accountType: 'personal',
    });

    const customerToken = jwtService.generateAccessToken({
      userId: customerId,
      email: `prop-cust-${ts}@test.local`,
      role: 'customer',
      accountType: 'personal',
    });

    // 1. Test Public GET /api/v1/properties
    console.log('\n[Test 1] Public GET /api/v1/properties');
    const pubRes = await fetch(`${BASE_URL}/api/v1/properties`);
    if (!pubRes.ok) throw new Error(`Public GET failed: HTTP ${pubRes.status}`);
    const pubData = await pubRes.json();
    console.log(`  Fetched ${pubData.data.properties.length} properties from PostgreSQL. Total: ${pubData.data.total}`);
    
    // Check contact masking
    const firstProp = pubData.data.properties[0];
    if (!firstProp.phone.includes('•••') || !firstProp.whatsapp.includes('••••')) {
      throw new Error(`FAIL: Public property contacts were not properly masked! Phone: ${firstProp.phone}, WhatsApp: ${firstProp.whatsapp}`);
    }
    console.log(`  ✅ Masked phone: ${firstProp.phone}, Masked WhatsApp: ${firstProp.whatsapp}, Unlock Fee: $${firstProp.unlockFeeUsd}`);

    // 2. Test Admin GET /api/v1/properties?admin=true&stats=true
    console.log('\n[Test 2] Admin GET /api/v1/properties?admin=true&stats=true');
    const adminRes = await fetch(`${BASE_URL}/api/v1/properties?admin=true&stats=true`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!adminRes.ok) throw new Error(`Admin GET failed: HTTP ${adminRes.status}`);
    const adminData = await adminRes.json();
    const adminFirstProp = adminData.data.properties[0];
    if (adminFirstProp.phone.includes('•••')) {
      throw new Error(`FAIL: Admin should see unmasked phone number, but got: ${adminFirstProp.phone}`);
    }
    console.log(`  ✅ Admin sees unmasked phone: ${adminFirstProp.phone}`);
    console.log(`  ✅ Database Stats:`, adminData.data.stats);

    // 3. Test POST /api/v1/properties (Creating a new listing)
    console.log('\n[Test 3] POST /api/v1/properties (Create listing)');
    const createRes = await fetch(`${BASE_URL}/api/v1/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        title: `Luxury Highlands Villa with Solar & Borehole ${ts}`,
        propertyType: 'Residential Rent',
        category: 'House',
        province: 'Harare',
        city: 'Harare',
        suburb: 'Highlands',
        priceUSD: 2200,
        pricePeriod: 'per_month',
        bedrooms: 4,
        bathrooms: 3,
        features: ['10kVA Solar System', 'Prolific Borehole', 'Swimming Pool', 'Double Garage'],
        description: 'Spectacular executive villa situated in prime Highlands, featuring modern architectural finishes and 24/7 solar backup.',
        advertiserName: 'Highlands Premier Realty',
        advertiserType: 'Real Estate Agency',
        whatsapp: '263779888777',
        phone: '+263 77 988 8777',
        occupancyStatus: 'Available',
      }),
    });
    if (createRes.status !== 201) {
      const errText = await createRes.text();
      throw new Error(`Create property failed: HTTP ${createRes.status} -> ${errText}`);
    }
    const createData = await createRes.json();
    const createdId = createData.data.property.id;
    console.log(`  ✅ Created property in PostgreSQL with ID: ${createdId}, Slug: ${createData.data.property.slug}`);

    // Verify persisted in PostgreSQL directly
    const dbCheck = await db('properties').where('id', createdId).first();
    if (!dbCheck || dbCheck.price_usd != 2200) {
      throw new Error(`FAIL: Property was not found directly in PostgreSQL table!`);
    }
    console.log(`  ✅ Directly verified row in PostgreSQL: title="${dbCheck.title}", price=$${dbCheck.price_usd}`);

    // 4. Test PATCH /api/v1/properties/[id] (Toggle occupancy)
    console.log('\n[Test 4] PATCH /api/v1/properties/[id] (Toggle Occupancy)');
    const patchRes = await fetch(`${BASE_URL}/api/v1/properties/${createdId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        action: 'toggle_occupancy',
        occupancyStatus: 'Taken',
      }),
    });
    if (!patchRes.ok) throw new Error(`Toggle occupancy failed: HTTP ${patchRes.status}`);
    const patchData = await patchRes.json();
    console.log(`  ✅ Occupancy updated to: ${patchData.data.property.occupancyStatus}, isOccupied: ${patchData.data.property.isOccupied}`);

    // 5. Test POST /api/v1/properties/unlock (Micro-fee contact unlock)
    console.log('\n[Test 5] POST /api/v1/properties/unlock');
    const unlockRes = await fetch(`${BASE_URL}/api/v1/properties/unlock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        propertyId: createdId,
        paymentMethod: 'ecocash',
        customerPhone: '0771234567',
        amountUsd: 2.0,
      }),
    });
    if (!unlockRes.ok) throw new Error(`Unlock contact failed: HTTP ${unlockRes.status}`);
    const unlockData = await unlockRes.json();
    if (unlockData.data.phone !== '+263 77 988 8777' || unlockData.data.whatsapp !== '263779888777') {
      throw new Error(`FAIL: Unlocked contact did not reveal real phone/whatsapp! Got: ${JSON.stringify(unlockData.data)}`);
    }
    console.log(`  ✅ Successfully unlocked: Phone=${unlockData.data.phone}, Ref=${unlockData.data.reference}`);

    // Verify invoice and unlock row in DB
    const unlockDbRow = await db('property_contact_unlocks').where('payment_reference', unlockData.data.reference).first();
    if (!unlockDbRow) throw new Error('FAIL: property_contact_unlocks record was not written to database!');
    console.log(`  ✅ Confirmed property_contact_unlocks row in PostgreSQL: Amount=$${unlockDbRow.amount_usd}`);

    // 6. Test DELETE /api/v1/properties/[id]
    console.log('\n[Test 6] DELETE /api/v1/properties/[id]');
    const delRes = await fetch(`${BASE_URL}/api/v1/properties/${createdId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!delRes.ok) throw new Error(`Delete property failed: HTTP ${delRes.status}`);
    console.log('  ✅ Property deleted successfully from PostgreSQL.');

    const checkGone = await db('properties').where('id', createdId).first();
    if (checkGone) throw new Error('FAIL: Property row still exists in database after delete!');
    console.log('  ✅ Confirmed property row is gone from PostgreSQL.');

    console.log('\n🎉 ALL 6 PROPERTIES PIPELINE & SECURITY TESTS PASSED PERFECTLY!\n');
  } finally {
    // Clean up test users
    await db('users').whereIn('id', [adminId, customerId]).del();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Pipeline Test Error:', err);
    process.exit(1);
  });
