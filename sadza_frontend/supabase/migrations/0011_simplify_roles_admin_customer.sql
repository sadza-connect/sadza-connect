-- ============================================================================
--  MATECH Integrated Services — 0011: Role Simplification (Admin & Client Only)
--  Removes PostgreSQL enum transaction locks and standardizes on:
--  - 'Client' (default for all regular users)
--  - 'Admin' (for full administrative panel access)
-- ============================================================================

-- 1. Convert profiles.role to text type to remove enum transaction lock limitations
alter table public.profiles
  alter column role drop default;

alter table public.profiles
  alter column role type text using role::text;

-- 2. Migrate existing roles in public.profiles
update public.profiles
set role = 'Admin'
where role in ('Admin', 'Owner', 'Staff');

update public.profiles
set role = 'Client'
where role not in ('Admin');

-- 3. Set the default to 'Client'
alter table public.profiles
  alter column role set default 'Client';

-- 4. Hardened handle_new_user() trigger
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
begin
  insert into public.profiles (id, email, full_name, role, is_active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    'Client',
    true
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name);
  return new;
end; $$;

-- 5. Re-bind the trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. Standardized security helper functions
drop function if exists public.current_app_role() cascade;
create or replace function public.current_app_role() returns text
language sql stable security definer set search_path = public, extensions, pg_temp as $$
  select role from public.profiles where id = auth.uid() and is_active;
$$;
grant execute on function public.current_app_role() to authenticated;

drop function if exists public.is_admin() cascade;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public, extensions, pg_temp as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active and role = 'Admin'
  );
$$;
grant execute on function public.is_admin() to authenticated, anon;

drop function if exists public.is_staff() cascade;
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public, extensions, pg_temp as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active and role = 'Admin'
  );
$$;
grant execute on function public.is_staff() to authenticated, anon;

drop function if exists public.is_owner() cascade;
create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public, extensions, pg_temp as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active and role = 'Admin'
  );
$$;
grant execute on function public.is_owner() to authenticated, anon;

-- 7. Update orders_status_check constraint on public.orders
-- Adds 'In Transit' and 'Installed & Commissioned' to permitted status values
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('Pending', 'Processing', 'Quoted', 'In Transit', 'Shipped', 'Installed & Commissioned', 'Delivered', 'Cancelled'));
