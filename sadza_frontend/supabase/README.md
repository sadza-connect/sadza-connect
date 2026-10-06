# Sadza Connect — Supabase backend setup

Phase 2 turns the Phase 1 prototype into a real app on **Supabase (Postgres +
Auth + Storage)**. The UI is unchanged; only the data behind it becomes real.

## One-time setup

### 1. Create the Supabase project
- Go to <https://supabase.com/dashboard> → **New project**.
- Pick a strong database password and a region close to your users.

### 2. Add credentials to `.env.local`
Copy `.env.local.example` → `.env.local` (in the repo root) and fill in the
values from **Project Settings → API**:

| Variable | Where | Exposed to browser? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | yes (safe) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` public key | yes (safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` secret | **NO — server only** |
| `NEXT_PUBLIC_SITE_URL` | e.g. `http://localhost:3000` | yes |

> `.env.local` is git-ignored. Never commit real keys. The service-role key
> must never be prefixed `NEXT_PUBLIC_` and never used in client code — it
> bypasses all security rules.

### 3. Apply the database (SQL Editor → New query)
Open **SQL Editor** in the dashboard and run these files **in order**, one at a
time (paste the file contents, press **Run**):

1. `supabase/migrations/0001_extensions_and_enums.sql`
2. `supabase/migrations/0002_core_tables.sql`
3. `supabase/migrations/0003_functions_and_triggers.sql`
4. `supabase/migrations/0004_rls_policies.sql`
5. `supabase/migrations/0005_storage.sql`
6. `supabase/migrations/0006_seed.sql`  ← loads your real content + demo leads

All files are safe to re-run.

### 4. Create your admin login
- **Authentication → Users → Add user** → enter your email + a password
  (tick "Auto Confirm User"). A matching profile row is created automatically.
- Then promote yourself to **Owner** — run this once in the SQL Editor
  (replace the email):

  ```sql
  update public.profiles
     set role = 'Owner', is_active = true
   where email = 'you@yourcompany.com';
  ```

- Visit `/admin`, sign in, and you're in the dashboard.

## Roles
- **Owner** — full access, incl. managing team members.
- **Admin** — full content/receipts/staff CRUD.
- **Staff** — can view the panel and update leads.

## What's public vs. private
- **Public (anon read):** company settings, published services/projects/products.
- **Verification:** receipts and staff IDs are verified through curated RPCs
  (`verify_receipt`, `verify_staff`) that return only non-sensitive fields —
  blood group, phone, notes and pricing breakdowns are never exposed publicly.
- **Private (staff only):** leads/quote requests, full receipts & staff records,
  chat, audit log.

## Storage
Buckets `projects`, `products`, `staff`, `company` are public-read,
staff-write, image-only, 5 MB max. Existing Phase 1 images keep loading from
`/public/images`; these buckets hold new uploads made in the admin panel.
