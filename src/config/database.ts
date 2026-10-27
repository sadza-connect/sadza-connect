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
    min: 0,
    max: 20,
    idleTimeoutMillis: 30_000,
    acquireTimeoutMillis: 30_000,
    propagateCreateError: false,
    afterCreate: (conn: any, done: (err: any, connection: any) => void) => {
      // Configure TCP keepalive on underlying client socket
      if (conn?.stream?.setKeepAlive) {
        conn.stream.setKeepAlive(true, 5000);
      }
      // Silently handle socket drop warnings on idle connections
      if (conn && typeof conn.on === 'function') {
        conn.on('error', (err: any) => {
          // Socket error on idle connection (e.g. Supabase closing connection)
          // Handled gracefully so process does not crash
        });
      }
      done(null, conn);
    },
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
            keepAliveInitialDelayMillis: 5000,
            statement_timeout: 30000,
            query_timeout: 30000,
            connectionTimeoutMillis: 15000,
          }
        : {
            connectionString: env.DATABASE_URL,
            keepAlive: true,
            keepAliveInitialDelayMillis: 5000,
            statement_timeout: 30000,
            query_timeout: 30000,
            connectionTimeoutMillis: 15000,
          },
    };
  }

  const base = {
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    keepAlive: true,
    keepAliveInitialDelayMillis: 5000,
    statement_timeout: 30000,
    query_timeout: 30000,
    connectionTimeoutMillis: 15000,
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
