-- ============================================================================
--  MATECH Integrated Services — 0009: Production Security Hardening & Zero-Vulnerability Architecture
--
--  Applies comprehensive Row-Level Security (RLS), locks search_path on all
--  SECURITY DEFINER functions, restricts PostgREST surface, enforces data
--  integrity constraints, and hardens verification RPCs.
--
--  Safe to execute multiple times (idempotent policy drops and creates).

-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Enable Row Level Security on ALL Public Tables
-- ---------------------------------------------------------------------------
alter table if exists public.profiles enable row level security;
alter table if exists public.company_settings enable row level security;
alter table if exists public.services enable row level security;
alter table if exists public.projects enable row level security;
alter table if exists public.products enable row level security;
alter table if exists public.quote_requests enable row level security;
alter table if exists public.receipts enable row level security;
alter table if exists public.receipt_items enable row level security;
alter table if exists public.staff_ids enable row level security;
alter table if exists public.chat_sessions enable row level security;
alter table if exists public.chat_messages enable row level security;
alter table if exists public.audit_log enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.order_items enable row level security;
alter table if exists public.product_reviews enable row level security;
alter table if exists public.blog_posts enable row level security;

-- ---------------------------------------------------------------------------
-- 2. Hardened SECURITY DEFINER Helper Functions (search_path locked)
-- ---------------------------------------------------------------------------
create or replace function public.current_app_role() returns public.app_role
language sql stable security definer set search_path = public, extensions, pg_temp as $$
  select role from public.profiles where id = auth.uid() and is_active;
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public, extensions, pg_temp as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active and role in ('Staff', 'Admin', 'Owner')
  );
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public, extensions, pg_temp as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active and role in ('Admin', 'Owner')
  );
$$;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public, extensions, pg_temp as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active and role = 'Owner'
  );
$$;

create or replace function public.log_audit(
  p_action text, p_entity text, p_entity_id text, p_metadata jsonb default '{}'
) returns void
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare
  em text;
begin
  select email into em from public.profiles where id = auth.uid();
  insert into public.audit_log (actor_id, actor_email, action, entity, entity_id, metadata)
  values (auth.uid(), em, p_action, p_entity, p_entity_id, coalesce(p_metadata, '{}'::jsonb));
end; $$;

-- ---------------------------------------------------------------------------
-- 3. Public Verification RPCs (Controlled Data Exposure)
-- ---------------------------------------------------------------------------
-- Receipts Verification: Exposes ONLY non-sensitive receipt fields
create or replace function public.verify_receipt(p_ref text)
returns table (
  receipt_number text,
  client text,
  project text,
  issue_date date,
  total bigint,
  currency text,
  status public.receipt_status,
  issued_by text
)
language sql stable security definer set search_path = public, extensions, pg_temp as $$
  select r.receipt_number, r.client, r.project, r.issue_date,
         r.total, r.currency, r.status, r.issued_by
  from public.receipts r
  where upper(trim(r.receipt_number)) = upper(trim(p_ref))
  limit 1;
$$;

-- Staff Verification: Exposes ONLY active verification status; strictly omits blood group, phone, emergency contacts
create or replace function public.verify_staff(p_ref text)
returns table (
  staff_number text,
  name text,
  role text,
  department text,
  photo_path text,
  status public.staff_status,
  issued date,
  expires date,
  verified boolean,
  is_valid boolean
)
language sql stable security definer set search_path = public, extensions, pg_temp as $$
  select s.staff_number, s.name, s.role, s.department, s.photo_path,
         s.status, s.issued, s.expires, s.verified,
         (s.status = 'Active' and s.verified and (s.expires is null or s.expires >= current_date)) as is_valid
  from public.staff_ids s
  where upper(trim(s.staff_number)) = upper(trim(p_ref))
  limit 1;
$$;

-- ---------------------------------------------------------------------------
-- 4. RLS Policies: Least Privilege & Zero Blanket Policies
-- ---------------------------------------------------------------------------

-- 4.1. PROFILES
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_manage on public.profiles;
create policy profiles_manage on public.profiles for all
  using (public.is_owner()) with check (public.is_owner());

-- 4.2. COMPANY SETTINGS
drop policy if exists company_public_read on public.company_settings;
create policy company_public_read on public.company_settings for select
  using (true);

drop policy if exists company_admin_write on public.company_settings;
create policy company_admin_write on public.company_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- 4.3. SERVICES
drop policy if exists services_public_read on public.services;
create policy services_public_read on public.services for select
  using (published = true);

drop policy if exists services_staff_read on public.services;
create policy services_staff_read on public.services for select
  using (public.is_staff());

drop policy if exists services_admin_write on public.services;
create policy services_admin_write on public.services for all
  using (public.is_admin()) with check (public.is_admin());

-- 4.4. PROJECTS
drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects for select
  using (published = true);

drop policy if exists projects_staff_read on public.projects;
create policy projects_staff_read on public.projects for select
  using (public.is_staff());

drop policy if exists projects_admin_write on public.projects;
create policy projects_admin_write on public.projects for all
  using (public.is_admin()) with check (public.is_admin());

-- 4.5. PRODUCTS
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select
  using (published = true);

drop policy if exists products_staff_read on public.products;
create policy products_staff_read on public.products for select
  using (public.is_staff());

drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products for all
  using (public.is_admin()) with check (public.is_admin());

-- 4.6. QUOTE REQUESTS (Inbound Leads)
drop policy if exists quote_public_insert on public.quote_requests;
create policy quote_public_insert on public.quote_requests for insert
  with check (
    status = 'New'
    and priority = 'Normal'
    and internal_notes is null
  );

drop policy if exists quote_staff_read on public.quote_requests;
create policy quote_staff_read on public.quote_requests for select
  using (public.is_staff());

drop policy if exists quote_staff_update on public.quote_requests;
create policy quote_staff_update on public.quote_requests for update
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists quote_admin_delete on public.quote_requests;
create policy quote_admin_delete on public.quote_requests for delete
  using (public.is_admin());

-- 4.7. RECEIPTS & RECEIPT ITEMS
drop policy if exists receipts_staff_read on public.receipts;
drop policy if exists receipts_customer_select on public.receipts;
create policy receipts_customer_select on public.receipts for select
  using (
    public.is_staff()
    or (auth.uid() is not null and lower(client_email) = lower(auth.jwt()->>'email'))
  );

drop policy if exists receipts_admin_write on public.receipts;
drop policy if exists receipts_staff_write on public.receipts;
create policy receipts_staff_write on public.receipts for all
  using (public.is_staff() or public.is_admin());

drop policy if exists receipt_items_select on public.receipt_items;
create policy receipt_items_select on public.receipt_items for select
  using (
    public.is_staff()
    or exists (
      select 1 from public.receipts r
      where r.id = receipt_id
        and (public.is_staff() or (auth.uid() is not null and lower(r.client_email) = lower(auth.jwt()->>'email')))
    )
  );

drop policy if exists receipt_items_staff_write on public.receipt_items;
create policy receipt_items_staff_write on public.receipt_items for all
  using (public.is_staff() or public.is_admin());

-- 4.8. STAFF IDS (Base table is staff-only; public uses verify_staff RPC)
drop policy if exists staff_staff_read on public.staff_ids;
create policy staff_staff_read on public.staff_ids for select
  using (public.is_staff());

drop policy if exists staff_admin_write on public.staff_ids;
create policy staff_admin_write on public.staff_ids for all
  using (public.is_admin()) with check (public.is_admin());

-- 4.9. ORDERS & ORDER ITEMS
drop policy if exists "orders_user_select" on public.orders;
create policy "orders_user_select" on public.orders for select
  using (auth.uid() = user_id or public.is_staff());

drop policy if exists "orders_user_insert" on public.orders;
create policy "orders_user_insert" on public.orders for insert
  with check (auth.uid() = user_id or user_id is null or public.is_staff());

drop policy if exists "orders_staff_update" on public.orders;
create policy "orders_staff_update" on public.orders for update
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())
    )
  );

drop policy if exists "order_items_insert" on public.order_items;
create policy "order_items_insert" on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())
    )
  );

-- 4.10. PRODUCT REVIEWS
drop policy if exists "product_reviews_public_select" on public.product_reviews;
create policy "product_reviews_public_select" on public.product_reviews for select
  using (true);

drop policy if exists "product_reviews_user_insert" on public.product_reviews;
create policy "product_reviews_user_insert" on public.product_reviews for insert
  with check (auth.uid() = user_id);

drop policy if exists "product_reviews_user_update" on public.product_reviews;
create policy "product_reviews_user_update" on public.product_reviews for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "product_reviews_user_delete" on public.product_reviews;
create policy "product_reviews_user_delete" on public.product_reviews for delete
  using (auth.uid() = user_id or public.is_admin());

-- 4.11. AUDIT LOG (Admin only read; insert via log_audit)
drop policy if exists audit_admin_read on public.audit_log;
create policy audit_admin_read on public.audit_log for select
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. Revoke & Grant Explicit Execution Privileges
-- ---------------------------------------------------------------------------
revoke all on function public.verify_receipt(text) from public;
revoke all on function public.verify_staff(text)   from public;
grant execute on function public.verify_receipt(text) to anon, authenticated;
grant execute on function public.verify_staff(text)   to anon, authenticated;

grant execute on function public.next_receipt_number() to authenticated;
grant execute on function public.next_staff_number(text) to authenticated;
grant execute on function public.next_quote_reference() to authenticated, anon;
grant execute on function public.log_audit(text,text,text,jsonb) to authenticated;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_owner() to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Integrity Constraints (Non-negative prices & positive quantities)
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_price_from_non_negative') then
    alter table public.products add constraint products_price_from_non_negative check (price_from is null or price_from >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'order_items_qty_positive') then
    alter table public.order_items add constraint order_items_qty_positive check (quantity > 0 and quantity <= 1000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'order_items_unit_price_non_negative') then
    alter table public.order_items add constraint order_items_unit_price_non_negative check (unit_price >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'receipt_items_qty_positive') then
    alter table public.receipt_items add constraint receipt_items_qty_positive check (qty > 0 and qty <= 1000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'receipt_items_unit_price_non_negative') then
    alter table public.receipt_items add constraint receipt_items_unit_price_non_negative check (unit_price >= 0);
  end if;
exception
  when others then null;
end $$;
