import { getDb } from '../src/infrastructure/database/connection.js';

async function main() {
  const db = getDb();
  try {
    const tables = await db('information_schema.tables')
      .select('table_name')
      .where('table_schema', 'public')
      .orderBy('table_name');
    
    console.log('=== DATABASE PUBLIC TABLES ===');
    console.log(JSON.stringify(tables.map((t: any) => t.table_name), null, 2));

    const migrations = await db('knex_migrations').select('*').orderBy('id');
    console.log('=== KNEX MIGRATIONS RECORDED ===');
    console.log(JSON.stringify(migrations, null, 2));
  } catch (err) {
    console.error('Error querying database tables:', err);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

main();
