import { getDb } from '../src/infrastructure/database/connection.js';

async function verify() {
  const db = getDb();
  console.log('🔍 [Sadza DB] Verifying seeded records count...');

  try {
    const counts = {
      categories: (await db('categories').count('* as count'))[0].count,
      businesses: (await db('businesses').count('* as count'))[0].count,
      products: (await db('products').count('* as count'))[0].count,
      jobs: (await db('jobs').count('* as count'))[0].count,
      adverts: (await db('adverts').count('* as count'))[0].count,
      platform_settings: (await db('platform_settings').count('* as count'))[0].count,
    };

    console.log('=== SEEDED DATABASE SUMMARY ===');
    console.table(counts);
  } catch (err) {
    console.error('Error verifying records:', err);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

verify();
