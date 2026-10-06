-- 0014_site_content.sql — Dynamic Site Content for Homepage, About, and Contact pages

alter table if exists public.company_settings
  add column if not exists site_content jsonb not null default '{}'::jsonb;

comment on column public.company_settings.site_content is 'Dynamic editable content for Homepage, About Page, and Contact Page.';
