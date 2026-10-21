import bcrypt from 'bcryptjs';
import { getDb } from '../src/infrastructure/database/connection.js';
import { COMMERCIAL_SECTORS, DEFAULT_PAID_ADVERTS } from '../src/data/advertsStore.js';
import { SAMPLE_BUSINESSES, SAMPLE_PRODUCTS, SAMPLE_JOBS } from '../src/lib/data/zimbabwe.js';
import { DEFAULT_PLATFORM_SETTINGS } from '../src/data/platformStore.js';

async function seed() {
  const db = getDb();
  console.log('🌱 [Sadza DB] Starting database seeding...');

  try {
    // 0. Seed Baseline Users (Admin, Merchant, Customer)
    const existingUsers = await db('users').select('email');
    const existingEmails = new Set(existingUsers.map((u: any) => u.email.toLowerCase()));

    const seedUsers = [
      {
        email: 'admin@sadzaconnect.co.zw',
        password: 'SadzaAdmin2026!',
        fullName: 'Sadza Connect Administrator',
        role: 'admin',
        accountType: 'business',
        status: 'active',
        isVerified: true,
        phoneNumber: '+263771000001',
        province: 'Harare Province',
      },
      {
        email: 'merchant@sadzaconnect.co.zw',
        password: 'SadzaMerchant2026!',
        fullName: 'Farai Chidzero',
        role: 'merchant',
        accountType: 'business',
        businessName: 'EcoFlow Solar & Agrotechnologies Zimbabwe',
        sector: 'Solar & Renewable Energy',
        status: 'active',
        isVerified: true,
        phoneNumber: '+263772000002',
        province: 'Harare Province',
      },
      {
        email: 'customer@sadzaconnect.co.zw',
        password: 'SadzaCustomer2026!',
        fullName: 'Tariro Moyo',
        role: 'customer',
        accountType: 'personal',
        status: 'active',
        isVerified: true,
        phoneNumber: '+263773000003',
        province: 'Bulawayo Province',
      },
    ];

    for (const u of seedUsers) {
      if (!existingEmails.has(u.email.toLowerCase())) {
        const passwordHash = await bcrypt.hash(u.password, 10);
        await db('users').insert({
          email: u.email.toLowerCase(),
          password_hash: passwordHash,
          full_name: u.fullName,
          role: u.role,
          account_type: u.accountType,
          status: u.status,
          is_verified: u.isVerified,
          phone_number: u.phoneNumber,
          province: u.province,
          business_name: (u as any).businessName || null,
          sector: (u as any).sector || null,
        });
        console.log(`   ✓ Seed user ${u.email} (${u.role}) created.`);
      }
    }

    // 1. Seed Platform Settings
    const existingSettings = await db('platform_settings').first();
    if (!existingSettings) {
      await db('platform_settings').insert({
        usd_to_zig_rate: DEFAULT_PLATFORM_SETTINGS.usdToZigRate,
        monthly_subscription_price_usd: DEFAULT_PLATFORM_SETTINGS.monthlySubscriptionPriceUsd,
        sponsored_advert_price_usd: DEFAULT_PLATFORM_SETTINGS.sponsoredAdvertPriceUsd,
        free_grace_period_days: DEFAULT_PLATFORM_SETTINGS.freeGracePeriodDays,
        support_whatsapp: DEFAULT_PLATFORM_SETTINGS.supportWhatsApp,
        support_phone: DEFAULT_PLATFORM_SETTINGS.supportPhone,
        support_email: DEFAULT_PLATFORM_SETTINGS.supportEmail,
        hq_address: DEFAULT_PLATFORM_SETTINGS.hqAddress,
        harare_address: DEFAULT_PLATFORM_SETTINGS.harareAddress,
        operating_hours: DEFAULT_PLATFORM_SETTINGS.operatingHours,
      });
      console.log('   ✓ platform_settings seeded.');
    } else {
      console.log('   - platform_settings already exists, skipping.');
    }

    // 2. Seed Categories (21 Commercial Sectors)
    const existingCategories = await db('categories').select('slug');
    const existingSlugs = new Set(existingCategories.map((c: any) => c.slug));

    const categoriesToInsert = COMMERCIAL_SECTORS.filter(
      (sec) => sec.id !== 'All' && !existingSlugs.has(sec.id.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    ).map((sec) => ({
      name: sec.name,
      label: sec.label,
      slug: sec.id.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      count: sec.count || 0,
    }));

    if (categoriesToInsert.length > 0) {
      await db('categories').insert(categoriesToInsert);
      console.log(`   ✓ ${categoriesToInsert.length} commercial categories seeded.`);
    } else {
      console.log('   - categories already seeded, skipping.');
    }

    // 3. Seed Businesses (Map to clean province names & format)
    const existingBiz = await db('businesses').select('slug');
    const existingBizSlugs = new Set(existingBiz.map((b: any) => b.slug));

    const businessesToInsert = SAMPLE_BUSINESSES.filter(
      (b) => !existingBizSlugs.has(b.slug)
    ).map((b: any) => ({
      id: b.id.length === 36 ? b.id : undefined, // only use if valid UUID, otherwise db generates UUID
      name: b.name,
      slug: b.slug,
      description: b.description,
      province: b.province,
      city: b.city,
      address: b.address,
      sector: b.categoryName || b.category,
      business_type: b.businessType || 'Registered Company (Pvt Ltd)',
      phone: b.phone,
      email: b.email || `contact@${b.slug}.co.zw`,
      whatsapp: b.whatsapp,
      website: b.website,
      logo_url: b.image || b.logo,
      cover_url: b.image || b.coverImage,
      gallery: JSON.stringify(b.photos || []),
      operating_hours: JSON.stringify(b.hours || { summary: b.openingHours || '' }),
      is_verified: b.cr14Verified ?? b.verified ?? false,
      verification_status: (b.cr14Verified ?? b.verified) ? 'Verified' : 'Pending',
      is_featured: b.featured || false,
      rating_avg: b.rating || 4.5,
      reviews_count: b.reviewsCount || b.reviewCount || 10,
    }));

    if (businessesToInsert.length > 0) {
      await db('businesses').insert(businessesToInsert);
      console.log(`   ✓ ${businessesToInsert.length} showcase businesses seeded.`);
    } else {
      console.log('   - businesses already seeded, skipping.');
    }

    // Retrieve inserted businesses to map products and jobs to foreign keys
    const liveBusinesses = await db('businesses').select('id', 'name', 'slug');
    const bizBySlug = new Map(liveBusinesses.map((b: any) => [b.slug, b.id]));

    // 4. Seed Products
    const existingProducts = await db('products').select('slug');
    const existingProdSlugs = new Set(existingProducts.map((p: any) => p.slug));

    const defaultBizId = liveBusinesses[0]?.id;
    if (defaultBizId) {
      const productsToInsert = SAMPLE_PRODUCTS.filter(
        (p) => !existingProdSlugs.has(p.slug)
      ).map((p: any) => {
        const matchingBizId = bizBySlug.get(p.sellerSlug || p.companySlug || '') || defaultBizId;
        return {
          business_id: matchingBizId,
          name: p.title || (p as any).name,
          slug: p.slug,
          description: p.description,
          category: p.category,
          price_usd: p.priceUsd,
          price_zig: Math.round(p.priceUsd * 26.5),
          images: JSON.stringify(p.images || []),
          in_stock: p.inStock,
          condition: p.condition || 'Brand New',
          is_featured: p.featured || false,
          is_active: true,
        };
      });

      if (productsToInsert.length > 0) {
        await db('products').insert(productsToInsert);
        console.log(`   ✓ ${productsToInsert.length} marketplace products seeded.`);
      } else {
        console.log('   - products already seeded, skipping.');
      }
    }

    // 5. Seed Jobs
    const existingJobs = await db('jobs').select('slug');
    const existingJobSlugs = new Set(existingJobs.map((j: any) => j.slug));

    if (defaultBizId) {
      const jobsToInsert = SAMPLE_JOBS.filter(
        (j) => !existingJobSlugs.has(j.slug)
      ).map((j) => {
        const matchingBizId = bizBySlug.get(j.companySlug || '') || defaultBizId;
        return {
          business_id: matchingBizId,
          company_name: j.company,
          title: j.title,
          slug: j.slug,
          province: j.province,
          city: j.city,
          job_type: j.type,
          salary_usd: j.salaryUsd,
          category: j.category,
          whatsapp: j.whatsapp,
          description: j.description,
          requirements: JSON.stringify(j.requirements || []),
          is_featured: false,
          is_active: true,
        };
      });

      if (jobsToInsert.length > 0) {
        await db('jobs').insert(jobsToInsert);
        console.log(`   ✓ ${jobsToInsert.length} careers vacancies seeded.`);
      } else {
        console.log('   - jobs already seeded, skipping.');
      }
    }

    // 6. Seed Adverts
    const existingAdverts = await db('adverts').select('id');
    const existingAdIds = new Set(existingAdverts.map((a: any) => a.id));

    const advertsToInsert = DEFAULT_PAID_ADVERTS.filter(
      (a) => !existingAdIds.has(a.id)
    ).map((a) => ({
      id: a.id,
      business_name: a.businessName,
      business_type: a.businessType,
      province: a.province,
      category: a.category,
      offer_type: a.offerType,
      headline: a.headline,
      offer_text: a.offerText,
      promo_badge: a.promoBadge,
      original_price_usd: a.originalPriceUSD || null,
      promo_price_usd: a.promoPriceUSD || null,
      price_zig: a.priceZiG || null,
      valid_until: a.validUntil,
      whatsapp: a.whatsapp,
      phone: a.phone,
      image: a.image,
      featured_on_home: a.featuredOnHome,
      is_active: true,
    }));

    if (advertsToInsert.length > 0) {
      await db('adverts').insert(advertsToInsert);
      console.log(`   ✓ ${advertsToInsert.length} sponsored campaign adverts seeded.`);
    } else {
      console.log('   - adverts already seeded, skipping.');
    }

    console.log('🎉 [Sadza DB] Database seeding completed successfully!');
  } catch (err) {
    console.error('❌ [Sadza DB] Seeding failed with error:', err);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

seed();
