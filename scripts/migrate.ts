import { getDb } from '../src/infrastructure/database/connection.js';
import path from 'path';

async function runMigrations() {
  const db = getDb();

  console.log('🚀 [Sadza DB] Starting database migration to latest...');

  try {
    // Harmonize migration extensions if needed
    await db('knex_migrations')
      .where('name', 'like', '%.js')
      .update({
        name: db.raw("REPLACE(name, '.js', '.ts')")
      });

    const migrationsDir = path.resolve(process.cwd(), 'src/infrastructure/database/migrations');
    const [batchNo, log] = await db.migrate.latest({
      directory: migrationsDir,
      loadExtensions: ['.ts', '.js'],
    });

    if (log.length === 0) {
      console.log('✅ [Sadza DB] Database is already up to date. No new migrations executed.');
    } else {
      console.log(`✅ [Sadza DB] Batch ${batchNo} executed successfully:`);
      log.forEach((file: string) => console.log(`   - ${file}`));
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ [Sadza DB] Migration failed with error:', err);
    process.exit(1);
  }
}

runMigrations();
