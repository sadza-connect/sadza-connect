-- ============================================================================
--  MATECH Integrated Services — 0001: Extensions & Enum Types
--  Paste into Supabase → SQL Editor → New query, then Run.
--  Run the numbered files in order (0001 → 0005, then the seed).
--  Safe to re-run: enum creation is guarded against "already exists".
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_trgm with schema extensions;

do $$ begin
  create type public.app_role as enum ('Customer', 'Staff', 'Admin', 'Owner');
exception when duplicate_object then null; end $$;

-- Project categories — exact Phase 1 display strings
do $$ begin
  create type public.project_category as enum (
    'Electrical', 'Solar & Renewable', 'SCADA & Automation',
    'Security & CCTV', 'Infrastructure'
  );
exception when duplicate_object then null; end $$;

-- Product taxonomy — exact Phase 1 display strings
do $$ begin
  create type public.product_category as enum (
    'Solar & Storage', 'Power & UPS', 'Control & Automation',
    'Security', 'Cabling & Distribution'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.product_availability as enum ('In Stock', 'Made to Order', 'On Request');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.product_type as enum ('Product', 'System', 'Service Package');
exception when duplicate_object then null; end $$;

-- Receipts
do $$ begin
  create type public.receipt_status as enum ('Paid', 'Partial', 'Void');
exception when duplicate_object then null; end $$;

-- Staff IDs
do $$ begin
  create type public.staff_status as enum ('Active', 'Suspended', 'Expired');
exception when duplicate_object then null; end $$;

-- Inbound leads (quote / enquiry / contact) lifecycle
do $$ begin
  create type public.submission_status as enum (
    'New', 'Reviewing', 'Contacted', 'Quoted', 'Completed', 'Cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.msg_priority as enum ('Low', 'Normal', 'High');
exception when duplicate_object then null; end $$;

-- Live chat session state
do $$ begin
  create type public.chat_status as enum ('AI Active', 'Waiting', 'Admin Active', 'Closed');
exception when duplicate_object then null; end $$;
