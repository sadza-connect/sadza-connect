-- ============================================================================
--  MATECH Integrated Services — 0003: Functions & Triggers
--  Run AFTER 0002. Safe to re-run (create or replace / drop-if-exists).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','company_settings','services','projects','products',
    'quote_requests','receipts','staff_ids','chat_sessions'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Role helpers (SECURITY DEFINER so RLS policies can call them without
-- recursing into the profiles policies). search_path is locked for safety.
-- ---------------------------------------------------------------------------
create or replace function public.current_app_role() returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and is_active;
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_active);
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active and role in ('Admin','Owner')
  );
$$;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active and role = 'Owner'
  );
$$;

-- ---------------------------------------------------------------------------
-- Auto-create a profile whenever a Supabase auth user is created.
-- New users default to 'Staff' + active. Promote your first user to 'Owner'
-- once (see the note at the bottom of 0004).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Server-trusted identifier generators (never trust client-supplied numbers).
-- Per-scope advisory lock avoids duplicate numbers under concurrency.
-- ---------------------------------------------------------------------------
create or replace function public.next_receipt_number() returns text
language plpgsql security definer set search_path = public as $$
declare y text := to_char(now(), 'YYYY'); n integer;
begin
  perform pg_advisory_xact_lock(hashtext('receipt:' || y));
  select coalesce(max((regexp_replace(receipt_number, '^REC-MAT-\d{4}-', ''))::int), 0) + 1
    into n
  from public.receipts
  where receipt_number like 'REC-MAT-' || y || '-%';
  return 'REC-MAT-' || y || '-' || lpad(n::text, 4, '0');
end; $$;

create or replace function public.next_staff_number(p_prefix text) returns text
language plpgsql security definer set search_path = public as $$
declare pfx text := upper(p_prefix); n integer;
begin
  if pfx not in ('ENG','TECH') then
    raise exception 'Invalid staff prefix: % (expected ENG or TECH)', p_prefix;
  end if;
  perform pg_advisory_xact_lock(hashtext('staff:' || pfx));
  select coalesce(max((regexp_replace(staff_number, '^MAT-' || pfx || '-', ''))::int), 0) + 1
    into n
  from public.staff_ids
  where staff_number like 'MAT-' || pfx || '-%';
  return 'MAT-' || pfx || '-' || lpad(n::text, 4, '0');
end; $$;

create or replace function public.next_quote_reference() returns text
language plpgsql security definer set search_path = public as $$
declare y text := to_char(now(), 'YYYY'); n integer;
begin
  perform pg_advisory_xact_lock(hashtext('quote:' || y));
  select coalesce(max((regexp_replace(reference, '^QUO-\d{4}-', ''))::int), 0) + 1
    into n
  from public.quote_requests
  where reference like 'QUO-' || y || '-%';
  return 'QUO-' || y || '-' || lpad(n::text, 4, '0');
end; $$;

-- Assign a server-trusted receipt number on insert when none is supplied.
-- The admin "create receipt" server action ALWAYS inserts a NULL number and
-- lets this trigger assign it, so clients can never choose their own number.
-- (Seeding historic receipts supplies explicit numbers, which are preserved.)
create or replace function public.set_receipt_number() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.receipt_number is null then
    new.receipt_number := public.next_receipt_number();
  end if;
  return new;
end; $$;
drop trigger if exists set_receipt_number on public.receipts;
create trigger set_receipt_number before insert on public.receipts
  for each row execute function public.set_receipt_number();

-- Auto-assign a quote reference on insert when not provided.
create or replace function public.set_quote_reference() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.reference is null then
    new.reference := public.next_quote_reference();
  end if;
  return new;
end; $$;
drop trigger if exists set_quote_reference on public.quote_requests;
create trigger set_quote_reference before insert on public.quote_requests
  for each row execute function public.set_quote_reference();

-- ---------------------------------------------------------------------------
-- Public verification RPCs — return only non-sensitive fields, so the base
-- tables never need a public read policy. Blood group / phone / notes /
-- pricing breakdown are deliberately NOT exposed to the public.
-- ---------------------------------------------------------------------------
create or replace function public.verify_receipt(p_ref text)
returns table (
  receipt_number text, client text, project text, issue_date date,
  total bigint, currency text, status public.receipt_status, issued_by text
)
language sql stable security definer set search_path = public as $$
  select r.receipt_number, r.client, r.project, r.issue_date,
         r.total, r.currency, r.status, r.issued_by
  from public.receipts r
  where upper(trim(r.receipt_number)) = upper(trim(p_ref))
  limit 1;
$$;

create or replace function public.verify_staff(p_ref text)
returns table (
  staff_number text, name text, role text, department text, photo_path text,
  status public.staff_status, issued date, expires date, verified boolean, is_valid boolean
)
language sql stable security definer set search_path = public as $$
  select s.staff_number, s.name, s.role, s.department, s.photo_path,
         s.status, s.issued, s.expires, s.verified,
         (s.status = 'Active' and s.verified
           and (s.expires is null or s.expires >= current_date)) as is_valid
  from public.staff_ids s
  where upper(trim(s.staff_number)) = upper(trim(p_ref))
  limit 1;
$$;

-- ---------------------------------------------------------------------------
-- Audit helper — records an admin action. SECURITY DEFINER so the insert
-- succeeds without a direct client insert policy on audit_log.
-- ---------------------------------------------------------------------------
create or replace function public.log_audit(
  p_action text, p_entity text, p_entity_id text, p_metadata jsonb default '{}'
) returns void
language plpgsql security definer set search_path = public as $$
declare em text;
begin
  select email into em from public.profiles where id = auth.uid();
  insert into public.audit_log (actor_id, actor_email, action, entity, entity_id, metadata)
  values (auth.uid(), em, p_action, p_entity, p_entity_id, coalesce(p_metadata, '{}'));
end; $$;

-- ---------------------------------------------------------------------------
-- Execute grants
-- ---------------------------------------------------------------------------
-- Public verification is callable by anyone (anon + signed-in).
revoke all on function public.verify_receipt(text) from public;
revoke all on function public.verify_staff(text)   from public;
grant execute on function public.verify_receipt(text) to anon, authenticated;
grant execute on function public.verify_staff(text)   to anon, authenticated;

-- Identifier generators + audit are for signed-in staff (server actions).
grant execute on function public.next_receipt_number()      to authenticated;
grant execute on function public.next_staff_number(text)    to authenticated;
grant execute on function public.next_quote_reference()     to authenticated, anon;
grant execute on function public.log_audit(text,text,text,jsonb) to authenticated;
grant execute on function public.current_app_role()         to authenticated;
grant execute on function public.is_staff()                 to authenticated;
grant execute on function public.is_admin()                 to authenticated;
grant execute on function public.is_owner()                 to authenticated;
