import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../../config/env.js';
import { logger } from '../../shared/logging/logger.js';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(env.SUPABASE_URL && (env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY));
}

/**
 * Returns a standard anon Supabase client for client-scoped operations.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    logger.debug('Supabase anon client skipped: SUPABASE_URL or SUPABASE_ANON_KEY missing');
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
}

/**
 * Returns a service-role Supabase admin client for server-level operations.
 * Bypasses RLS policies — use with caution for background tasks and admin tasks.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;

  if (!env.SUPABASE_URL || !serviceKey) {
    logger.debug('Supabase admin client skipped: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
    return null;
  }

  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(env.SUPABASE_URL, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseAdminClient;
}
