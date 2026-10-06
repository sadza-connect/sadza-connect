-- ============================================================================
--  MATECH Integrated Services — 0007: Orders, Product Reviews & Customer RLS
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Product Reviews
-- ---------------------------------------------------------------------------
-- Drop foreign key constraint if created in a previous schema version
alter table public.product_reviews drop constraint if exists product_reviews_product_id_fkey;

create table if not exists public.product_reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  text not null,
  user_id     uuid not null references auth.users(id) on delete cascade,
  user_name   text not null,
  rating      integer not null check (rating >= 1 and rating <= 5),
  comment     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (product_id, user_id)
);

-- Ensure column type is text if table was created previously with uuid
alter table public.product_reviews alter column product_id type text;

create index if not exists product_reviews_product_idx on public.product_reviews(product_id, created_at desc);

-- Enable RLS
alter table public.product_reviews enable row level security;

-- Public can read all reviews
drop policy if exists "product_reviews_public_select" on public.product_reviews;
create policy "product_reviews_public_select"
  on public.product_reviews for select
  using (true);

-- Authenticated users can insert their own review
drop policy if exists "product_reviews_user_insert" on public.product_reviews;
create policy "product_reviews_user_insert"
  on public.product_reviews for insert
  with check (auth.uid() = user_id);

-- Authenticated users can update their own review
drop policy if exists "product_reviews_user_update" on public.product_reviews;
create policy "product_reviews_user_update"
  on public.product_reviews for update
  using (auth.uid() = user_id);

-- Authenticated users can delete their own review
drop policy if exists "product_reviews_user_delete" on public.product_reviews;
create policy "product_reviews_user_delete"
  on public.product_reviews for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 2. Customer Product Orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text not null unique,                  -- ORD-MAT-YYYY-XXXX
  user_id         uuid references auth.users(id) on delete set null,
  customer_name   text not null,
  customer_email  text not null,
  customer_phone  text not null,
  shipping_address text not null,
  subtotal        bigint not null default 0,
  tax             bigint not null default 0,
  total           bigint not null default 0,
  currency        text not null default 'NGN',
  status          text not null default 'Pending' check (status in ('Pending', 'Processing', 'Quoted', 'Shipped', 'Delivered', 'Cancelled')),
  notes           text,
  tracking_number text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders(user_id, created_at desc);
create index if not exists orders_number_idx on public.orders(order_number);

create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity    integer not null default 1,
  unit_price  bigint not null default 0,
  line_total  bigint generated always as (quantity * unit_price) stored
);

create index if not exists order_items_order_idx on public.order_items(order_id);

-- Enable RLS
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Users can view their own orders
drop policy if exists "orders_user_select" on public.orders;
create policy "orders_user_select"
  on public.orders for select
  using (auth.uid() = user_id or public.is_staff());

-- Authenticated users can insert their own order
drop policy if exists "orders_user_insert" on public.orders;
create policy "orders_user_insert"
  on public.orders for insert
  with check (auth.uid() = user_id or user_id is null);

-- Staff can update orders (e.g. status, tracking_number)
drop policy if exists "orders_staff_update" on public.orders;
create policy "orders_staff_update"
  on public.orders for update
  using (public.is_staff());

-- Staff can read/write order_items
drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select"
  on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())));

drop policy if exists "order_items_insert" on public.order_items;
create policy "order_items_insert"
  on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())));
