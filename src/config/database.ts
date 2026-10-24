import type { Knex } from 'knex';
import '../infrastructure/database/dns-cache.js';
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
    min: 2,
    max: 10,
    idleTimeoutMillis: 60_000,
    acquireTimeoutMillis: 30_000,
  },
  acquireConnectionTimeout: 30_000,
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
            keepAlive: true,
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
