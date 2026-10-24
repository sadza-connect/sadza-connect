import './dns-cache.js';
import knex, { type Knex } from 'knex';
import config from '../../config/database.js';
import { logger } from '../../shared/logging/logger.js';

declare global {
  // eslint-disable-next-line no-var
  var __sadza_db: Knex | undefined;
}

let db: Knex | null = null;

export function getDb(): Knex {
  if (process.env.NODE_ENV === 'production') {
    if (!db) {
      db = knex(config);
      logger.info('Database connection pool created');
    }
    return db;
  }

  if (!global.__sadza_db) {
    global.__sadza_db = knex(config);
    logger.info('Database connection pool created');
  }
  return global.__sadza_db;
}

export async function destroyDb(): Promise<void> {
  if (db) {
    await db.destroy();
    db = null;
    logger.info('Database connection pool destroyed');
  }
  if (global.__sadza_db) {
    await global.__sadza_db.destroy();
    global.__sadza_db = undefined;
    logger.info('Global database connection pool destroyed');
  }
}

export async function pingDb(): Promise<boolean> {
  try {
    const result = await getDb().raw('SELECT 1 AS ok');
    return result.rows?.[0]?.ok === 1;
  } catch {
    return false;
  }
}

export { Knex };
