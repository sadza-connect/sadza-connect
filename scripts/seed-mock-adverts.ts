import { getDb } from '../src/infrastructure/database/connection.js';

interface AdvertSeedItem {
  id: string;
  business_id: string;
  business_name: string;
  business_type: string;
  province: string;
  category: string;
  offer_type: string;
  headline: string;
  offer_text: string;
  promo_badge: string;
  original_price_usd: number;
  promo_price_usd: number;
  price_zig: number;
  valid_until: string;
  whatsapp: string;
  phone: string;
  image: string;
  featured_on_home: boolean;
  is_active: boolean;
}

const MOCK_ADVERTS: AdvertSeedItem[] = [
  {
    id: 'adv-mabasa-solar-5kva',
    business_id: 'fe7a2c06-3f52-4569-8a76-63bd07ac0fd6',
    business_name: 'Mabasa Solar & Electrical',
    business_type: 'Registered Company (Pvt Ltd)',
    province: 'Harare',
    category: 'Solar & Clean Energy',
    offer_type: 'Special Package',
    headline: 'Complete 5kVA Solar Package (Growatt Inverter + 4.8kWh Lithium Battery)',
    offer_text: 'Zero load shedding special! Includes 5kVA Growatt Hybrid Inverter, 4.8kWh Felicity Lithium Battery, 6x 550W Tier-1 Panels with professional CR14 certified installation and warranty.',
    promo_badge: '🔥 HOT PROMO • SAVE $350',
    original_price_usd: 2850,
    promo_price_usd: 2499,
    price_zig: 66224,
    valid_until: 'Valid until 15 Nov',
    whatsapp: '263772987654',
    phone: '+263772987654',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    featured_on_home: true,
    is_active: true,
  },
  {
    id: 'adv-zimagro-drip-irrigation',
    business_id: '0e259f33-8b1d-4257-9003-ef457d6eb2b0',
    business_name: 'ZimAgro Solutions',
    business_type: 'Registered Company (Pvt Ltd)',
    province: 'Midlands',
    category: 'Agriculture & Farm Inputs',
    offer_type: 'Bulk / Wholesale',
    headline: 'Commercial Drip Irrigation Kit (1-Hectare Turnkey Setup)',
    offer_text: 'Heavy duty UV-resistant drip lines, disc filtration manifold, venturi fertilizer injector and fittings. Boost maize, tomato, and onion yield by 40% with minimal water consumption.',
    promo_badge: '🌱 FARM SPECIAL • 20% OFF',
    original_price_usd: 850,
    promo_price_usd: 680,
    price_zig: 18020,
    valid_until: 'Valid 30 days',
    whatsapp: '263774765432',
    phone: '+263774765432',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    featured_on_home: true,
    is_active: true,
  },
  {
    id: 'adv-great-zim-safari-deal',
    business_id: 'f656fc91-7aee-4966-bece-669c08de8fec',
    business_name: 'Great Zimbabwe Hotels',
    business_type: 'Registered Company (Pvt Ltd)',
    province: 'Harare',
    category: 'Hotels & Tourism',
    offer_type: 'Weekend Special',
    headline: '3-Day Victoria Falls Safari & Zambezi Sunset Cruise Getaway',
    offer_text: 'Executive luxury lodge stay overlooking the Zambezi, guided rainforest walking tour, Big-5 game drive, and luxury sunset boat cruise. Gourmet breakfast included for couples and business travelers.',
    promo_badge: '⭐ VIP GETAWAY • EXCLUSIVE',
    original_price_usd: 520,
    promo_price_usd: 395,
    price_zig: 10468,
    valid_until: 'Limited slots available',
    whatsapp: '263775654321',
    phone: '+263775654321',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
    featured_on_home: true,
    is_active: true,
  },
  {
    id: 'adv-tsvaga-auto-fleet',
    business_id: '9342ad2b-2f96-4d10-98cb-38cac24edf0a',
    business_name: 'Tsvaga Auto Care',
    business_type: 'SME / Partnership',
    province: 'Bulawayo',
    category: 'Automotive & Spares',
    offer_type: 'Service Special',
    headline: 'Comprehensive Fleet & 4x4 Major Diagnostic Service Package',
    offer_text: 'Complete synthetic oil service, OEM filter replacements, computerized engine diagnostic scan, 40-point suspension and brake safety inspection with complimentary wheel balancing.',
    promo_badge: '🚗 25% OFF SERVICE',
    original_price_usd: 160,
    promo_price_usd: 120,
    price_zig: 3180,
    valid_until: 'Valid this week',
    whatsapp: '263776543210',
    phone: '+263776543210',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    featured_on_home: true,
    is_active: true,
  },
  {
    id: 'adv-nyumbani-security-cams',
    business_id: '4b746a54-f2e8-4363-9f2e-1bdc22ddc9ec',
    business_name: 'Nyumbani Home & Living',
    business_type: 'Registered Company (Pvt Ltd)',
    province: 'Bulawayo',
    category: 'Hardware & Construction',
    offer_type: 'Price Discount',
    headline: 'Solar-Powered 4G PTZ Security Cameras & Smart Floodlights',
    offer_text: '1080p Full HD smart solar cameras with motion tracking, two-way audio, color night vision, SIM card connectivity and smartphone alerts without requiring ZESA electricity.',
    promo_badge: '⚡ FLASH SALE • 35% OFF',
    original_price_usd: 140,
    promo_price_usd: 89,
    price_zig: 2358,
    valid_until: 'While stocks last',
    whatsapp: '263773876543',
    phone: '+263773876543',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
    featured_on_home: true,
    is_active: true,
  },
  {
    id: 'adv-rufaro-family-health',
    business_id: 'c5e6e0b1-f78f-4fb3-a12f-f60867490818',
    business_name: 'Rufaro Pharmacy',
    business_type: 'Registered Company (Pvt Ltd)',
    province: 'Harare',
    category: 'Healthcare & Pharmacies',
    offer_type: 'Special Package',
    headline: 'Family Wellness & Home Diagnostic Health Care Kit',
    offer_text: 'Includes digital automatic blood pressure monitor, glucometer with 50 test strips, fingertip pulse oximeter, and comprehensive family first aid supplies with same-day Harare delivery.',
    promo_badge: '❤️ HEALTH PACK',
    original_price_usd: 95,
    promo_price_usd: 65,
    price_zig: 1722,
    valid_until: 'Ongoing promo',
    whatsapp: '263777432109',
    phone: '+263777432109',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    featured_on_home: true,
    is_active: true,
  },
];

async function seedAdverts() {
  const db = getDb();
  console.log('📢 Seeding mock adverts into database...');

  try {
    for (const ad of MOCK_ADVERTS) {
      const existing = await db('adverts').where({ id: ad.id }).first();
      if (!existing) {
        await db('adverts').insert({
          ...ad,
          created_at: new Date(),
          updated_at: new Date(),
        });
        console.log(`   ✓ Inserted advert: ${ad.headline} (${ad.id})`);
      } else {
        await db('adverts').where({ id: ad.id }).update({
          ...ad,
          updated_at: new Date(),
        });
        console.log(`   ✓ Updated advert: ${ad.headline} (${ad.id})`);
      }
    }

    const count = await db('adverts').count('* as count').first();
    console.log(`🎉 Total adverts in database: ${count?.count}`);
  } catch (err) {
    console.error('❌ Failed to seed adverts:', err);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

seedAdverts();
