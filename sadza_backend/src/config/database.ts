import type { Knex } from 'knex';
import { env } from './env.js';

const commonConfig: Knex.Config = {
  client: 'pg',
  migrations: {
    directory: './src/infrastructure/database/migrations',
    extension: 'ts',
    loadExtensions: ['.ts', '.js'],
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './src/infrastructure/database/seeds',
    extension: 'ts',
    loadExtensions: ['.ts', '.js'],
  },
  pool: {
    min: env.DB_POOL_MIN,
    max: env.DB_POOL_MAX,
    // Kill idle connections after 30s — Supabase drops them at ~5min
    idleTimeoutMillis: 30_000,
    // Check for and reap stale connections every 15s
    reapIntervalMillis: 15_000,
    // Validate connections before handing them out — catches dead TCP connections
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(conn: any) {
      return new Promise((resolve) => {
        conn.query('SELECT 1', (err: Error | null) => {
          resolve(!err);
        });
      });
    },
  },
  acquireConnectionTimeout: 10_000,
};

function connectionConfig(): Knex.Config {
  const useSsl =
    Boolean(env.DB_SSL) ||
    env.NODE_ENV === 'production' ||
    env.DB_HOST.includes('supabase') ||
    env.DB_PORT === 6543;

  if (env.DATABASE_URL) {
    return {
      ...commonConfig,
      connection: useSsl
        ? {
            connectionString: env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
          }
        : env.DATABASE_URL,
    };
  }

  const base = {
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  };

  if (useSsl) {
    return {
      ...commonConfig,
      connection: {
        ...base,
        ssl: { rejectUnauthorized: false },
      },
    };
  }

  return {
    ...commonConfig,
    connection: base,
  };
}

const config = connectionConfig();

export default config;
export const knexConfig = config;
