import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client (public anon key only).
 * Safe to import into client components. Row-level security governs access;
 * this client never sees the service-role key.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return createBrowserClient(url, anonKey);
}
