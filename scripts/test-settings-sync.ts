import { settingsRepository } from '../src/infrastructure/database/repositories/settings-repository.js';
import { getDb } from '../src/infrastructure/database/connection.js';

async function run() {
  console.log('🧪 Testing Settings Repository & Dynamic Configuration Sync...');

  // 1. Fetch current settings
  const initial = await settingsRepository.getSettings();
  console.log('✅ Current Platform Settings in Database:');
  console.log(`   - Grace Days: ${initial.free_grace_period_days}`);
  console.log(`   - Monthly Subscription Price: $${initial.monthly_subscription_price_usd}`);
  console.log(`   - Sponsored Advert Price: $${initial.sponsored_advert_price_usd}`);
  console.log(`   - USD to ZiG Rate: ${initial.usd_to_zig_rate}`);
  console.log(`   - Support WhatsApp: ${initial.support_whatsapp}`);
  console.log(`   - Support Email: ${initial.support_email}`);

  // 2. Perform an update
  const updated = await settingsRepository.updateSettings({
    usd_to_zig_rate: 27.5,
    monthly_subscription_price_usd: 15.0,
    sponsored_advert_price_usd: 25.0,
    free_grace_period_days: 30,
    extra_config: {
      vatPct: 15,
      zesaServiceFeePct: 1.5,
      ecocashMerchantCode: '774920',
      innbucksMerchantCode: 'SC-ZW-881',
      homepageSlotsCap: 6,
    },
  });

  console.log('✅ Updated Settings in Database:');
  console.log(`   - New Monthly Subscription: $${updated.monthly_subscription_price_usd}`);
  console.log(`   - New Advert Price: $${updated.sponsored_advert_price_usd}`);
  console.log(`   - New USD:ZiG Rate: ${updated.usd_to_zig_rate}`);
  console.log(`   - Extra Config VAT: ${updated.extra_config?.vatPct}%`);

  // 3. Re-read to confirm persistence
  const reRead = await settingsRepository.getSettings();
  if (
    reRead.monthly_subscription_price_usd === 15.0 &&
    reRead.sponsored_advert_price_usd === 25.0 &&
    reRead.usd_to_zig_rate === 27.5
  ) {
    console.log('✅ Persistence Verified: Database read matches updated values precisely!');
  } else {
    throw new Error('Persistence mismatch!');
  }

  // 4. Restore to standard baseline ($10 / $20 / 26.50)
  await settingsRepository.updateSettings({
    usd_to_zig_rate: 26.5,
    monthly_subscription_price_usd: 10.0,
    sponsored_advert_price_usd: 20.0,
    free_grace_period_days: 30,
    extra_config: {
      vatPct: 15,
      zesaServiceFeePct: 1.5,
      ecocashMerchantCode: '774920',
      innbucksMerchantCode: 'SC-ZW-881',
      homepageSlotsCap: 6,
    },
  });
  console.log('✅ Reset baseline settings ($10/mo, $20/mo, 26.50 ZiG rate) successfully.');

  const db = getDb();
  await db.destroy();
  console.log('🎉 All Settings Synchronization Tests Passed Successfully!');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Settings test failed:', err);
  process.exit(1);
});
