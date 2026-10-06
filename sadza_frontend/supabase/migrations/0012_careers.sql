-- ============================================================================
--  MATECH Integrated Services — 0012: Careers & Job Applications
--  Run AFTER 0011. Safe to re-run.
-- ============================================================================

-- 1. Job Positions table
create table if not exists public.job_positions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  department text not null,
  employment_type text not null default 'Full-time',
  location text not null default 'Kano, Nigeria',
  experience_level text not null default 'Mid-Level (2-4 yrs)',
  description text not null,
  responsibilities jsonb not null default '[]'::jsonb,
  requirements jsonb not null default '[]'::jsonb,
  benefits jsonb not null default '[]'::jsonb,
  salary_range text,
  deadline timestamptz,
  status text not null default 'Open' check (status in ('Open', 'Closed', 'Draft')),
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for public queries
create index if not exists idx_job_positions_status on public.job_positions(status, sort_order, created_at desc);
create index if not exists idx_job_positions_slug on public.job_positions(slug);

-- 2. Job Applications table
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.job_positions(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  location text not null,
  years_of_experience text not null,
  linkedin_url text,
  portfolio_url text,
  resume_url text not null,
  cover_letter text,
  skills jsonb not null default '[]'::jsonb,
  status text not null default 'New' check (status in ('New', 'Reviewing', 'Shortlisted', 'Interview Scheduled', 'Hired', 'Rejected')),
  admin_notes text,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for applicant lookups
create index if not exists idx_job_applications_job_id on public.job_applications(job_id);
create index if not exists idx_job_applications_status on public.job_applications(status, applied_at desc);
create index if not exists idx_job_applications_email on public.job_applications(email);

-- 3. Storage bucket for candidate resumes (PDF, DOCX, DOC)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('resumes', 'resumes', true, 10485760,
     array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do nothing;

-- 4. Storage Policies
drop policy if exists "resumes public read" on storage.objects;
create policy "resumes public read" on storage.objects for select
  using (bucket_id = 'resumes');

drop policy if exists "resumes public insert" on storage.objects;
create policy "resumes public insert" on storage.objects for insert
  with check (bucket_id = 'resumes');

-- 5. Row Level Security
alter table public.job_positions enable row level security;
alter table public.job_applications enable row level security;

-- Public can read open job positions
drop policy if exists "job_positions public read" on public.job_positions;
create policy "job_positions public read" on public.job_positions
  for select using (status = 'Open' or (select auth.role()) = 'authenticated');

-- Authenticated staff can manage job positions
drop policy if exists "job_positions staff manage" on public.job_positions;
create policy "job_positions staff manage" on public.job_positions
  for all to authenticated using (true) with check (true);

-- Anyone can submit a job application
drop policy if exists "job_applications public insert" on public.job_applications;
create policy "job_applications public insert" on public.job_applications
  for insert with check (true);

-- Authenticated staff can view and manage job applications
drop policy if exists "job_applications staff manage" on public.job_applications;
create policy "job_applications staff manage" on public.job_applications
  for all to authenticated using (true) with check (true);
