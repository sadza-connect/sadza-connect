-- ============================================================================
--  MATECH Integrated Services — 0013: Blog Posts Table, RLS & Seed
--  Paste into Supabase SQL Editor and run once to create the blog_posts table.
-- ============================================================================

create table if not exists public.blog_posts (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  category    text not null default 'Solar & Power',
  author      text not null default 'MATECH Editorial',
  author_role text not null default 'Technical Lead',
  summary     text not null default '',
  cover_image text not null default '/images/projects/hybrid-inverter-bank.webp',
  content     text[] not null default '{}',
  tags        text[] not null default '{}',
  read_time   text not null default '5 min read',
  featured    boolean not null default false,
  published   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

-- Public reads published blog posts
drop policy if exists blog_posts_public_read on public.blog_posts;
create policy blog_posts_public_read on public.blog_posts for select
  using (published = true);

-- Staff can read all (including drafts)
drop policy if exists blog_posts_staff_read on public.blog_posts;
create policy blog_posts_staff_read on public.blog_posts for select
  using (public.is_staff());

-- Admins can create/edit/delete
drop policy if exists blog_posts_admin_write on public.blog_posts;
create policy blog_posts_admin_write on public.blog_posts for all
  using (public.is_admin()) with check (public.is_admin());

-- Seed initial articles
insert into public.blog_posts (slug, title, category, author, author_role, summary, cover_image, content, tags, read_time, featured, published)
values
(
  'solar-inverter-sizing-guide-nigeria',
  'How to Correctly Size Solar Inverters & Lithium Batteries for Nigerian Homes',
  'Solar & Power',
  'Engr. J. O. Ahmed',
  'Head of Renewable Energy',
  'A technical guide to load calculations, surge currents, surge protection, and sizing 5kVA vs 10kVA hybrid solar systems for un-interrupted power.',
  '/images/projects/hybrid-inverter-bank.webp',
  array[
    'Sizing a hybrid solar system in Nigeria requires careful analysis of peak inductive loads, baseline continuous loads, and available daily solar radiation. Many off-grid systems fail prematurely due to underestimated startup surge currents from air conditioners and pumping machines.',
    'For a standard residential setup, a 5kVA hybrid inverter with a 10kWh to 15kWh LiFePO4 battery bank offers optimal efficiency. Lithium Iron Phosphate batteries provide up to 6,000 charge cycles at 80% depth of discharge, far outperforming traditional lead-acid or gel batteries.',
    'At MATECH Integrated Services, every solar installation begins with a comprehensive load audit using digital energy meters. We ensure protective surge arresters, DC isolator breakers, and heavy-duty cabling are installed according to IEE Wiring Regulations.'
  ]::text[],
  array['solar', 'inverter', 'lithium-battery', 'load-sizing', 'kano']::text[],
  '6 min read',
  true,
  true
),
(
  'cctv-ip-surveillance-best-practices',
  'Designing High-Definition IP CCTV Networks for Industrial & Commercial Sites',
  'CCTV & Security',
  'Mustapha Sani',
  'Lead Security Automation Engineer',
  'Key considerations for camera resolution, sightlines, POE switch bandwidth, and remote monitoring setup in industrial installations.',
  '/images/projects/cctv-monitoring-wall.webp',
  array[
    'Surveillance coverage is only as reliable as the underlying network infrastructure. In commercial and industrial environments, relying on analog coaxial cables introduces signal noise, video loss, and limited analytical capabilities.',
    'Deploying IP-based video surveillance with High-Definition NVRs allows multi-channel remote monitoring, motion detection indexing, and optical zoom without loss of detail. Proper camera placement must account for outdoor backlighting, night-vision infrared illumination, and blind spots.',
    'Our deployments at major institutions—including the Abubakar Rasheed Building and KUST Wudil—utilize concealed conduit runs, industrial POE switches with surge suppression, and secure cloud remote access on iOS, Android, and Desktop.'
  ]::text[],
  array['cctv', 'surveillance', 'security', 'ip-camera', 'dahua']::text[],
  '5 min read',
  true,
  true
),
(
  'scada-plc-industrial-automation-kano',
  'Automating Industrial Grain & Milling Facilities with PLC & SCADA Systems',
  'Automation & SCADA',
  'Engr. J. O. Ahmed',
  'Chief Automation Specialist',
  'Case study on automating grain handling control panels, elevator interlocks, and real-time SCADA telemetry for industrial processors.',
  '/images/projects/scada-monitoring-buhler.webp',
  array[
    'Industrial processing plants require continuous, synchronized motor control to prevent material blockage, overheating, and unscheduled downtime. Automated PLC (Programmable Logic Controller) interlocks ensure conveyors start in reverse sequence and stop safely in emergency conditions.',
    'By integrating HMI touchscreen panels and SCADA software, plant operators gain real-time visibility into motor temperatures, current draw, silo levels, and fault diagnostics.',
    'MATECH has successfully engineered control panels and SCADA telemetry for major industrial processors in Kano and Northern Nigeria, including Bühler grain handling systems and sesame seed processing lines.'
  ]::text[],
  array['scada', 'plc', 'industrial-automation', 'buhler', 'kano']::text[],
  '7 min read',
  false,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  author = excluded.author,
  author_role = excluded.author_role,
  summary = excluded.summary,
  cover_image = excluded.cover_image,
  content = excluded.content,
  tags = excluded.tags,
  read_time = excluded.read_time,
  featured = excluded.featured,
  published = excluded.published;
