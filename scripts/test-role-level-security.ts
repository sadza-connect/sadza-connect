import { businessRepository } from '../src/infrastructure/database/repositories/business-repository.js';
import { getDb } from '../src/infrastructure/database/connection.js';

async function main() {
  console.log('--- Testing Role-Level Security (RLS) Verification ---');
  const db = getDb();

  // 1. Fetch all businesses count
  const allBusinesses = await db('businesses').select('id', 'name', 'user_id');
  console.log(`Total businesses in database: ${allBusinesses.length}`);

  // 2. Find a merchant with a business
  const businessWithOwner = allBusinesses.find((b) => b.user_id !== null);
  if (businessWithOwner && businessWithOwner.user_id) {
    const merchantUserId = businessWithOwner.user_id;
    console.log(`Testing with merchant user_id: ${merchantUserId} (owns: "${businessWithOwner.name}")`);

    // Query findByUserId (what /api/v1/businesses?my_business=true runs)
    const merchantBusinesses = await businessRepository.findByUserId(merchantUserId);
    console.log(`Merchant businesses returned: ${merchantBusinesses.length}`);
    for (const b of merchantBusinesses) {
      console.log(`  - Business: "${b.name}" (ID: ${b.id}, Owner: ${b.user_id})`);
      if (b.user_id !== merchantUserId) {
        throw new Error(`SECURITY LEAK: Found business ${b.id} with owner ${b.user_id} in query for user ${merchantUserId}!`);
      }
    }
    console.log('✅ PASS: Merchant can ONLY access businesses where user_id matches.');
  }

  // 3. Test non-existent or zero-business user
  const zeroBusinessUser = '00000000-0000-0000-0000-000000000000';
  const zeroBusinesses = await businessRepository.findByUserId(zeroBusinessUser);
  console.log(`Zero-business user returned: ${zeroBusinesses.length} businesses.`);
  if (zeroBusinesses.length !== 0) {
    throw new Error('SECURITY LEAK: Zero-business user received unexpected businesses!');
  }
  console.log('✅ PASS: Zero-business user receives empty array (never falls back to stranger businesses).');

  console.log('--- All Role-Level Security checks PASSED successfully! ---');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
