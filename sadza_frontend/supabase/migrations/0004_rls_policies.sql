-- ============================================================================
--  MATECH Integrated Services — 0004: Row Level Security policies
--  Run AFTER 0003. Safe to re-run (drop policy if exists → create).
--
--  Principle: public (anon) may read ONLY published/public content. Private
--  data (leads, receipts, staff records, chat, audit) is staff-only. Public
--  verification of receipts/staff goes through the curated RPCs in 0003, so
--  those tables need no public read policy.
-- ============================================================================

alter table public.profiles         enable row level security;
alter table public.company_settings enable row level security;
alter table public.services         enable row level security;
alter table public.projects         enable row level security;
alter table public.products         enable row level security;
alter table public.quote_requests   enable row level security;
alter table public.receipts          enable row level security;
alter table public.receipt_items     enable row level security;
alter table public.staff_ids         enable row level security;
alter table public.chat_sessions     enable row level security;
alter table public.chat_messages     enable row level security;
alter table public.audit_log         enable row level security;

-- ---------------------------------------------------------------------------
-- profiles — you see your own row; admins see all; only owners manage the team
-- ---------------------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_manage on public.profiles;
create policy profiles_manage on public.profiles for all
  using (public.is_owner()) with check (public.is_owner());

-- ---------------------------------------------------------------------------
-- company_settings — world-readable (public marketing content); admin writes
-- ---------------------------------------------------------------------------
drop policy if exists company_public_read on public.company_settings;
create policy company_public_read on public.company_settings for select using (true);

drop policy if exists company_admin_write on public.company_settings;
create policy company_admin_write on public.company_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- services / projects / products — public reads published rows; staff read
-- everything (incl. drafts) in the panel; admins write.
-- ---------------------------------------------------------------------------
drop policy if exists services_public_read on public.services;
create policy services_public_read on public.services for select using (published = true);
drop policy if exists services_staff_read on public.services;
create policy services_staff_read on public.services for select using (public.is_staff());
drop policy if exists services_admin_write on public.services;
create policy services_admin_write on public.services for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects for select using (published = true);
drop policy if exists projects_staff_read on public.projects;
create policy projects_staff_read on public.projects for select using (public.is_staff());
drop policy if exists projects_admin_write on public.projects;
create policy projects_admin_write on public.projects for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select using (published = true);
drop policy if exists products_staff_read on public.products;
create policy products_staff_read on public.products for select using (public.is_staff());
drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- quote_requests — anyone may submit a lead, but only as a fresh, untriaged
-- row (cannot fabricate status/priority escalation or inject staff notes).
-- Only staff can read; staff update; admins delete.
-- ---------------------------------------------------------------------------
drop policy if exists quote_public_insert on public.quote_requests;
create policy quote_public_insert on public.quote_requests for insert
  with check (
    status = 'New'
    and priority = 'Normal'
    and internal_notes is null
  );

drop policy if exists quote_staff_read on public.quote_requests;
create policy quote_staff_read on public.quote_requests for select using (public.is_staff());

drop policy if exists quote_staff_update on public.quote_requests;
create policy quote_staff_update on public.quote_requests for update
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists quote_admin_delete on public.quote_requests;
create policy quote_admin_delete on public.quote_requests for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- receipts + items — no public table access (public uses verify_receipt RPC).
-- Staff read; admins write.
-- ---------------------------------------------------------------------------
drop policy if exists receipts_staff_read on public.receipts;
create policy receipts_staff_read on public.receipts for select using (public.is_staff());
drop policy if exists receipts_admin_write on public.receipts;
create policy receipts_admin_write on public.receipts for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists receipt_items_staff_read on public.receipt_items;
create policy receipt_items_staff_read on public.receipt_items for select using (public.is_staff());
drop policy if exists receipt_items_admin_write on public.receipt_items;
create policy receipt_items_admin_write on public.receipt_items for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- staff_ids — no public table access (public uses verify_staff RPC, which
-- omits blood group / phone / emergency contact). Staff read; admins write.
-- ---------------------------------------------------------------------------
drop policy if exists staff_staff_read on public.staff_ids;
create policy staff_staff_read on public.staff_ids for select using (public.is_staff());
drop policy if exists staff_admin_write on public.staff_ids;
create policy staff_admin_write on public.staff_ids for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- chat — staff-only for now. Anonymous visitor access will be added via
-- session-scoped RPCs when the chat backend is built (task #33).
-- ---------------------------------------------------------------------------
drop policy if exists chat_sessions_staff on public.chat_sessions;
create policy chat_sessions_staff on public.chat_sessions for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists chat_messages_staff on public.chat_messages;
create policy chat_messages_staff on public.chat_messages for all
  using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- audit_log — admins read. Inserts happen only through log_audit()
-- (SECURITY DEFINER), so no client insert policy is granted.
-- ---------------------------------------------------------------------------
drop policy if exists audit_admin_read on public.audit_log;
create policy audit_admin_read on public.audit_log for select using (public.is_admin());

-- ============================================================================
--  BOOTSTRAP (run ONCE, after you create your first admin user)
--  ---------------------------------------------------------------------------
--  1. Supabase Dashboard → Authentication → Users → Add user (email+password).
--     The on_auth_user_created trigger auto-creates a matching profile row
--     with role 'Staff'.
--  2. Promote yourself to Owner by running (replace the email):
--
--       update public.profiles
--          set role = 'Owner', is_active = true
--        where email = 'you@yourcompany.com';
--
--  The SQL Editor runs as a privileged role, so this UPDATE bypasses RLS.
-- ============================================================================
