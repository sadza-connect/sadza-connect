import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export type AppRole = 'Customer' | 'Merchant' | 'Admin';

export interface SessionUser {
  id: string;
  email: string;
  fullName: string | null;
  role: AppRole;
  isActive: boolean;
}

const ROLE_RANK: Record<AppRole, number> = { Customer: 0, Merchant: 1, Admin: 2 };

export function roleAtLeast(role: AppRole, min: AppRole): boolean {
  return (ROLE_RANK[role] ?? 0) >= (ROLE_RANK[min] ?? 0);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('email, full_name, role, is_active')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) return null;

    const rawRole = (profile.role as string) || 'Customer';
    const role: AppRole =
      rawRole.toLowerCase() === 'admin'
        ? 'Admin'
        : rawRole.toLowerCase() === 'merchant' || rawRole.toLowerCase() === 'business'
        ? 'Merchant'
        : 'Customer';

    return {
      id: user.id,
      email: profile.email ?? user.email ?? '',
      fullName: profile.full_name,
      role,
      isActive: profile.is_active ?? true,
    };
  } catch {
    return null;
  }
}

export async function requireUser(minRole: AppRole = 'Admin'): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (!user.isActive || !roleAtLeast(user.role, minRole)) redirect('/admin/unauthorized');
  return user;
}

export type AuthorizeResult =
  | { ok: true; user: SessionUser }
  | { ok: false; error: string };

export async function authorize(minRole: AppRole = 'Admin'): Promise<AuthorizeResult> {
  const user = await getSessionUser();
  if (!user || !user.isActive) {
    return { ok: false, error: 'Your session has expired. Please sign in again.' };
  }
  if (!roleAtLeast(user.role, minRole)) {
    return { ok: false, error: 'You do not have permission to perform this action.' };
  }
  return { ok: true, user };
}
