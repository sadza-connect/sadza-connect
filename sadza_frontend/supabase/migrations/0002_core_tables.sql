-- ============================================================================
--  MATECH Integrated Services — 0002: Core Tables
--  Run AFTER 0001. Safe to re-run (create table if not exists).
--  Column names are snake_case; the app data layer maps them to the camelCase
--  Phase 1 field names, so the existing UI keeps working unchanged.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles — admin panel users, linked 1:1 to auth.users
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text,
  phone       text,
  role        public.app_role not null default 'Customer',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table public.profiles is 'Admin users mirrored from auth.users; role governs panel access.';

-- ---------------------------------------------------------------------------
-- company_settings — single-row company profile / site settings
-- ---------------------------------------------------------------------------
create table if not exists public.company_settings (
  id               uuid primary key default gen_random_uuid(),
  is_singleton     boolean not null default true unique check (is_singleton),
  name             text not null,
  short_name       text,
  legal_suffix     text,
  tagline          text,
  motto            text,
  rc_number        text,
  established      integer,
  meta_description text,
  vision           text,
  mission          text,
  core_values      jsonb  not null default '[]',   -- [{title, body}]
  scope            text[] not null default '{}',
  email            text,
  phones           text[] not null default '{}',
  whatsapp         text,
  address          jsonb  not null default '{}',   -- {line1,line2,city,state,country}
  hours            text,
  founder          jsonb  not null default '{}',   -- {name,role,phone,image}
  social           jsonb  not null default '{}',   -- {facebook,instagram,linkedin,twitter}
  stats            jsonb  not null default '[]',   -- [{value,label,suffix,format}]
  hero             jsonb  not null default '{}',   -- optional homepage hero content
  formats          jsonb  not null default '{}',   -- {receipt,staffEngineer,staffTechnician}
  updated_at       timestamptz not null default now()
);
comment on table public.company_settings is 'Single-row company profile & site settings (is_singleton unique enforces one row).';

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------
create table if not exists public.services (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  display_index    text,                          -- editorial numbering "01".. (maps to Service.index)
  name             text not null,
  short_name       text,
  tagline          text,
  summary          text,
  description      text[] not null default '{}',  -- paragraphs
  icon             text,                          -- IconKey
  hero_image       text,
  card_image       text,
  category         text,                          -- spec field; unused in Phase 1
  capabilities     text[] not null default '{}',
  applications     text[] not null default '{}',  -- spec field; unused in Phase 1
  features         jsonb  not null default '[]',  -- [{title, body}]
  process          jsonb  not null default '[]',  -- [{step, title, body}]
  deliverables     text[] not null default '{}',
  related_projects text[] not null default '{}',  -- project slugs
  faqs             jsonb  not null default '[]',  -- [{q, a}]
  featured         boolean not null default false,
  published        boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  client           text,
  location         text,
  year             integer,
  completion_date  date,                          -- spec field; optional
  category         public.project_category,
  services         text[] not null default '{}',  -- service slugs
  summary          text,
  challenge        text,
  approach         text[] not null default '{}',  -- solution steps
  outcome          text,                          -- results
  metrics          jsonb  not null default '[]',  -- [{label,value}]
  cover_image      text,
  gallery          jsonb  not null default '[]',  -- [{src,caption}]
  scope            text[] not null default '{}',  -- technical scope
  featured         boolean not null default false,
  published        boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  brand             text,
  category          public.product_category,
  subcategory       text,                         -- spec field; optional
  type              public.product_type not null default 'Product',
  availability      public.product_availability not null default 'On Request',
  price_from        bigint,                        -- NGN integer; null => "Request quote"
  currency          text not null default 'NGN',
  price_note        text,
  short_description text,
  description       text[] not null default '{}',
  image             text,
  gallery           jsonb  not null default '[]',  -- [{src,caption}] (future)
  specs             jsonb  not null default '[]',  -- [{label,value}]
  highlights        text[] not null default '{}',
  tags              text[] not null default '{}',
  stock_qty         integer,                       -- spec field; optional
  featured          boolean not null default false,
  published         boolean not null default true,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- quote_requests — unified inbound leads (public quote form + enquiry basket)
-- Private: staff-only read. Anonymous visitors may INSERT (see RLS 0004).
-- ---------------------------------------------------------------------------
create table if not exists public.quote_requests (
  id                uuid primary key default gen_random_uuid(),
  reference         text unique,                   -- QUO-YYYY-XXXX (server assigned)
  name              text not null,
  email             text not null,
  phone             text,
  company           text,
  service           text,
  budget            text,
  message           text,
  preferred_contact text,
  items             jsonb not null default '[]',   -- enquiry basket [{slug,name,kind,qty}]
  status            public.submission_status not null default 'New',
  priority          public.msg_priority not null default 'Normal',
  internal_notes    text,                          -- private staff notes
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
comment on table public.quote_requests is 'Inbound leads from the public quote/contact form incl. enquiry-basket items. Backs the admin Messages inbox.';

-- ---------------------------------------------------------------------------
-- receipts + receipt_items
-- ---------------------------------------------------------------------------
create table if not exists public.receipts (
  id                 uuid primary key default gen_random_uuid(),
  receipt_number     text not null unique,         -- REC-MAT-YYYY-XXXX (server assigned; see 0003)
  client             text not null,
  project            text,
  issue_date         date not null default current_date,
  subtotal           bigint not null default 0,
  discount           bigint not null default 0,
  vat                bigint not null default 0,
  total              bigint not null default 0,    -- grand total
  currency           text not null default 'NGN',
  payment_method     text,
  status             public.receipt_status not null default 'Paid',
  issued_by          text,
  notes              text,
  verification_token uuid not null default gen_random_uuid(),
  created_by         uuid references public.profiles(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists public.receipt_items (
  id           uuid primary key default gen_random_uuid(),
  receipt_id   uuid not null references public.receipts(id) on delete cascade,
  description  text not null,
  qty          integer not null default 1,
  unit_price   bigint  not null default 0,
  line_total   bigint  generated always as (qty * unit_price) stored,
  sort_order   integer not null default 0
);
create index if not exists receipt_items_receipt_id_idx on public.receipt_items(receipt_id);

-- ---------------------------------------------------------------------------
-- staff_ids
-- ---------------------------------------------------------------------------
create table if not exists public.staff_ids (
  id                 uuid primary key default gen_random_uuid(),
  staff_number       text not null unique,         -- MAT-ENG-XXXX / MAT-TECH-XXXX
  name               text not null,
  role               text,
  department         text,
  photo_path         text,                          -- Storage or /images path
  blood_group        text,                          -- private: not returned by public verify
  phone              text,                          -- private: not returned by public verify
  status             public.staff_status not null default 'Active',
  issued             date,
  expires            date,
  verified           boolean not null default false,
  emergency_contact  jsonb,                          -- private {name,phone,relation}
  verification_token uuid not null default gen_random_uuid(),
  created_by         uuid references public.profiles(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- chat_sessions + chat_messages
-- ---------------------------------------------------------------------------
create table if not exists public.chat_sessions (
  id              uuid primary key default gen_random_uuid(),
  visitor_name    text,
  visitor_contact text,
  status          public.chat_status not null default 'AI Active',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  last_message_at timestamptz
);

create table if not exists public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.chat_sessions(id) on delete cascade,
  sender      text not null check (sender in ('visitor','ai','admin')),
  body        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists chat_messages_session_idx on public.chat_messages(session_id, created_at);

-- ---------------------------------------------------------------------------
-- audit_log
-- ---------------------------------------------------------------------------
create table if not exists public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  actor_email text,
  action      text not null,                        -- create | update | delete | void | status_change | issue ...
  entity      text not null,                        -- project | product | service | receipt | staff | quote | settings
  entity_id   text,
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);
create index if not exists audit_log_created_idx on public.audit_log(created_at desc);
create index if not exists audit_log_entity_idx  on public.audit_log(entity, entity_id);

-- ---------------------------------------------------------------------------
-- listing indexes for public queries
-- ---------------------------------------------------------------------------
create index if not exists services_public_idx      on public.services(published, featured, sort_order);
create index if not exists projects_public_idx       on public.projects(published, featured, sort_order);
create index if not exists projects_category_idx     on public.projects(category);
create index if not exists products_public_idx       on public.products(published, featured, sort_order);
create index if not exists products_category_idx     on public.products(category);
create index if not exists quote_requests_status_idx on public.quote_requests(status, created_at desc);
