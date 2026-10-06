-- ============================================================================
--  MATECH Integrated Services — 0008: Receipts Schema Extensions & Realtime RLS
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Extend public.receipts columns for full client contact & VAT details
-- ---------------------------------------------------------------------------
alter table public.receipts add column if not exists client_email text;
alter table public.receipts add column if not exists client_phone text;
alter table public.receipts add column if not exists client_address text;
alter table public.receipts add column if not exists vat_rate numeric default 0;

create index if not exists receipts_client_email_idx on public.receipts(lower(client_email));

-- ---------------------------------------------------------------------------
-- 2. Update Row-Level Security (RLS) for Customer & Staff Access
-- ---------------------------------------------------------------------------
alter table public.receipts enable row level security;
alter table public.receipt_items enable row level security;

-- Receipts: Customers can read their own receipts by email; staff/admin read all
drop policy if exists receipts_staff_read on public.receipts;
drop policy if exists receipts_customer_select on public.receipts;
create policy receipts_customer_select on public.receipts for select
  using (
    public.is_staff()
    or (auth.uid() is not null and lower(client_email) = lower(auth.email()))
  );

-- Receipts: Staff/admin full write access (insert, update, delete)
drop policy if exists receipts_admin_write on public.receipts;
drop policy if exists receipts_staff_write on public.receipts;
create policy receipts_staff_write on public.receipts for all
  using (public.is_staff() or public.is_admin());

-- Receipt Items: Select policy linked to parent receipt ownership or staff privilege
drop policy if exists receipt_items_select on public.receipt_items;
create policy receipt_items_select on public.receipt_items for select
  using (
    public.is_staff()
    or exists (
      select 1 from public.receipts r
      where r.id = receipt_id
        and (public.is_staff() or (auth.uid() is not null and lower(r.client_email) = lower(auth.email())))
    )
  );

-- Receipt Items: Staff/admin write access
drop policy if exists receipt_items_staff_write on public.receipt_items;
create policy receipt_items_staff_write on public.receipt_items for all
  using (public.is_staff() or public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. Enable Supabase Realtime Publication for Live Data Syncing
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.receipts;
    alter publication supabase_realtime add table public.receipt_items;
    alter publication supabase_realtime add table public.orders;
    alter publication supabase_realtime add table public.order_items;
    alter publication supabase_realtime add table public.product_reviews;
  end if;
exception
  when duplicate_object then null;
  when others then null;
end $$;
