import './dns-cache.js';
import knex, { type Knex } from 'knex';
import config from '../../config/database.js';
import { logger } from '../../shared/logging/logger.js';

declare global {
  // eslint-disable-next-line no-var
  var __sadza_db: Knex | undefined;
}

let db: Knex | null = null;

export function isTransientDbError(err: unknown): boolean {
  if (!err) return false;
  const error = err as any;
  const msg = String(error?.message || '').toLowerCase();
  const code = String(error?.code || '').toLowerCase();

  return (
    msg.includes('econnreset') ||
    msg.includes('read econnreset') ||
    msg.includes('write econnreset') ||
    msg.includes('connection terminated') ||
    msg.includes('connection unexpectedly closed') ||
    msg.includes('etimedout') ||
    msg.includes('econnrefused') ||
    msg.includes('client was closed') ||
    msg.includes('socket hang up') ||
    msg.includes('broken pipe') ||
    msg.includes('timeout exceeded when trying to connect') ||
    msg.includes('terminating connection due to administrator command') ||
    code === '57p01' ||
    code === '57p02' ||
    code === '57p03' ||
    code === '08000' ||
    code === '08003' ||
    code === '08006' ||
    code === '08001' ||
    code === '08004'
  );
}

function createResilientKnex(knexConfig: Knex.Config): Knex {
  const instance = knex(knexConfig);

  // Wrap Knex query runner to intercept and auto-retry transient connection drops (e.g. ECONNRESET)
  const origRunner = (instance.client as any).runner;
  if (typeof origRunner === 'function') {
    (instance.client as any).runner = function (builder: any) {
      const runner = origRunner.call(this, builder);
      const origRun = runner.run;
      if (typeof origRun === 'function') {
        runner.run = async function () {
          let attempts = 0;
          const maxAttempts = 2;
          while (attempts < maxAttempts) {
            try {
              return await origRun.call(this);
            } catch (err) {
              attempts++;
              if (attempts < maxAttempts && isTransientDbError(err)) {
                logger.warn(
                  { err: (err as any)?.message || err, attempt: attempts },
                  'Transient database socket reset encountered. Auto-retrying query with fresh connection...',
                );
                await new Promise((resolve) => setTimeout(resolve, 150));
                continue;
              }
              throw err;
            }
          }
        };
      }
      return runner;
    };
  }

  return instance;
}

export function getDb(): Knex {
  if (process.env.NODE_ENV === 'production') {
    if (!db) {
      db = createResilientKnex(config);
      logger.info('Database connection pool created (resilient)');
    }
    return db;
  }

  if (!global.__sadza_db) {
    global.__sadza_db = createResilientKnex(config);
    logger.info('Database connection pool created (resilient)');
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

export type { Knex };
