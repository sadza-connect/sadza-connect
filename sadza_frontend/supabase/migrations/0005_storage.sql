-- ============================================================================
--  MATECH Integrated Services — 0005: Storage buckets & policies
--  Run AFTER 0004. Safe to re-run (on conflict do nothing / drop-if-exists).
--
--  Buckets are public-read (images are shown on the public site and on the
--  public ID/receipt verification pages). Writes are restricted to signed-in
--  staff. Bucket-level file_size_limit + allowed_mime_types reject anything
--  that is not a reasonably-sized image, so no executable uploads are possible.
--
--  NOTE: existing Phase 1 images stay served from /public/images (fast, SEO
--  stable). These buckets hold NEW uploads made through the admin panel.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('projects', 'projects', true, 5242880,
     array['image/jpeg','image/png','image/webp','image/avif']),
  ('products', 'products', true, 5242880,
     array['image/jpeg','image/png','image/webp','image/avif']),
  ('staff',    'staff',    true, 5242880,
     array['image/jpeg','image/png','image/webp','image/avif']),
  ('company',  'company',  true, 5242880,
     array['image/jpeg','image/png','image/webp','image/avif','image/svg+xml'])
on conflict (id) do nothing;

-- Public read across the media buckets.
drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select
  using (bucket_id in ('projects','products','staff','company'));

-- Signed-in staff may upload.
drop policy if exists "media staff insert" on storage.objects;
create policy "media staff insert" on storage.objects for insert to authenticated
  with check (
    bucket_id in ('projects','products','staff','company')
    and public.is_staff()
  );

-- Signed-in staff may replace/rename their uploads.
drop policy if exists "media staff update" on storage.objects;
create policy "media staff update" on storage.objects for update to authenticated
  using (
    bucket_id in ('projects','products','staff','company')
    and public.is_staff()
  );

-- Only admins may delete media.
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete to authenticated
  using (
    bucket_id in ('projects','products','staff','company')
    and public.is_admin()
  );
