# Sadza Connect Zimbabwe — Production Deployment & Cloud Migration Playbook

This master operational document provides the Africdominion Group engineering and executive team with complete guidance for launching **Sadza Connect Zimbabwe**, managing cloud infrastructure costs, executing zero-downtime database migrations, and administering the 13 platform management modules.

---

## 1. Architectural Independence & Database Portability

### Zero-Vendor-Lock-In Guarantee
Sadza Connect is purposefully engineered to eliminate proprietary platform lock-in. 

* **No Hard Dependencies on Supabase Client Libraries for Business Logic:**
  All backend data queries, migrations, mutations, and relational joins utilize **Knex.js** with native PostgreSQL connection pools (`pg`). 
* **Standard PostgreSQL Wire Protocol:**
  The entire application communicates over standard PostgreSQL connection strings (`DATABASE_URL=postgresql://user:password@host:port/database`).
* **Clean Relational Schema:**
  All 12 production tables (`businesses`, `products`, `jobs`, `job_applications`, `adverts`, `bill_payments`, `invoices`, `orders`, `id_cards`, `categories`, `platform_settings`, `notifications`) are defined with standard ANSI PostgreSQL types (`UUID`, `VARCHAR`, `DECIMAL`, `JSONB`, `BOOLEAN`, `TIMESTAMP WITH TIME ZONE`).
* **Zero Code Changes for Migration:**
  Migrating from Supabase to Railway, AWS RDS, Neon, or self-hosted PostgreSQL requires **zero modifications to application source code**. Only the `DATABASE_URL` environment variable changes.

---

## 2. Infrastructure Pricing Comparison (First Launch)

### A. Managed PostgreSQL Database

| Provider | Plan | Estimated Cost / Month | Pros | Cons / Caveats |
| :--- | :--- | :--- | :--- | :--- |
| **Railway Postgres** *(Recommended for Launch)* | **Pro / Usage-based** | **\$5 – \$10 / mo** | • Dedicated Docker Postgres container<br>• Persistent volume SSD disk<br>• Zero cold starts (never pauses)<br>• Transparent RAM/vCPU usage billing<br>• Automatic daily volume backups | • Manual read-replica setup if scaling to millions of rows |
| **Supabase** | **Free Tier** | **\$0 / mo** | • Good for developer sandbox testing | • **Pauses automatically after 7 days of inactivity**<br>• 500MB database size cap |
| **Supabase** | **Pro Plan** | **\$25 / mo** | • Daily automated backups<br>• 8GB database space<br>• 100k MAU | • Minimum \$25/mo fixed base fee regardless of actual resource usage |

> **Verdict for First Launch:** **Railway Postgres** offers the best price-to-performance ratio (\$5–\$10/mo) without the risk of project pausing or arbitrary tier markups.

---

### B. Object Storage (Images, Documents, KYC & Resumes)

| Provider | Plan | Storage Cost | Bandwidth / Egress Cost | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Cloudflare R2** | **Free Tier (10 GB)** | \$0.00 up to 10GB<br>(\$0.015/GB thereafter) | **\$0.00 / GB (Always Free Egress)** | **100% Recommended** (Eliminates high bandwidth bills) |
| **AWS S3** | **Standard** | \$0.023 / GB | \$0.09 / GB transferred | High egress costs |
| **Local Disk Fallback** | **Included** | \$0.00 | Depends on hosting | Active in development mode (`/public/uploads`) |

---

### C. Web Application Compute (Next.js SSR & API)

| Provider | Plan | Cost / Month | Notes |
| :--- | :--- | :--- | :--- |
| **Railway App** | Pro | \$5 – \$10 / mo | Native Docker, co-located with Railway Postgres for <1ms database latency |
| **Vercel** | Pro | \$20 / mo | Global edge network, automatic preview deployments |
| **Render** | Starter | \$7 / mo | Reliable containerized web service |

---

### Total Estimated Monthly Launch Cost

$$\text{Railway Postgres (\$7)} + \text{Railway Web Container (\$7)} + \text{Cloudflare R2 (\$0)} + \text{Cloudflare CDN/SSL (\$0)} \approx \mathbf{\$14\text{ to }\$18\text{ / month}}$$

---

## 3. The 3-Step Seamless Migration Playbook (Supabase $\to$ Railway)

When ready to switch from Supabase to Railway Postgres, follow this simple 3-step process without touching any TypeScript or React code:

### Step 1: Export Current Data from Supabase
Run `pg_dump` from your terminal to generate a complete SQL snapshot containing both table schemas and seeded records:

```bash
pg_dump \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --dbname="<YOUR_SUPABASE_DATABASE_URL>" \
  --file="sadza_connect_backup.sql"
```

### Step 2: Provision Railway Postgres & Import Data
1. Log into your [Railway Dashboard](https://railway.app).
2. Click **New Project** $\to$ **Provision PostgreSQL**.
3. Under the **Connect** tab in Railway, copy the `DATABASE_URL` (e.g., `postgresql://postgres:password@railway.internal:5432/railway` or the public TCP proxy URL).
4. Restore your data directly to Railway:

```bash
psql \
  --dbname="<YOUR_RAILWAY_DATABASE_URL>" \
  --file="sadza_connect_backup.sql"
```

### Step 3: Update Environment Variables in Production
In your production web host (Railway or Vercel), update the environment variables:

```env
# Point to your new Railway PostgreSQL instance
DATABASE_URL=postgresql://postgres:<password>@<host>:<port>/railway
DB_HOST=<host>
DB_PORT=<port>
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=<password>
DB_SSL=false
```

Restart the web container. The application will immediately begin querying Railway Postgres with 0 downtime and 0 code rewrites.

---

## 4. Cloudflare DNS, Edge Caching & SSL Setup

For the official national domain `sadzaconnect.co.zw`:

1. **DNS Records (Cloudflare Dashboard):**
   - `A` record: `@` $\to$ Origin IP of your web container (Proxy status: **Orange Cloud / Proxied**).
   - `CNAME` record: `www` $\to$ `sadzaconnect.co.zw` (Proxy status: **Proxied**).
2. **SSL/TLS Encryption Mode:**
   - Set to **Full (Strict)** to ensure end-to-end encryption between Cloudflare Edge and the origin web server.
3. **Edge Caching Rules:**
   - Static assets (`/_next/static/*`, `/images/*`, `/favicon.ico`) $\to$ **Cache Everything**, TTL: 1 month.
   - Directory search & listings pages $\to$ `s-maxage=300, stale-while-revalidate=600`.
   - Admin routes (`/admin/*`) and authenticated dashboards (`/dashboard/*`) $\to$ **Bypass Cache**.

---

## 5. Executive Admin HQ User Manual (13 Modules)

Platform administrators access the Command Center at [`/admin`](http://localhost:3000/admin):

1. **Dashboard Overview (`/admin`):** High-level national commerce telemetry, real-time revenue, active listings, and provincial breakdowns.
2. **Business Directory (`/admin/businesses`):** Review pending registrations, inspect KYC documents, issue Verified Green Badges, or lock suspect entities.
3. **Products & Marketplace (`/admin/products`):** Audit catalog items, moderate pricing, and verify dual-currency ZiG/USD compliance.
4. **Sponsored Adverts (`/admin/adverts`):** Manage homepage promo slots, banner placement schedules, and commercial discount badges.
5. **Careers & Job Board (`/admin/jobs`):** Moderate employment postings across provinces, verify company legitimacy, and review applicants.
6. **Utility Bill Payments (`/admin/bills`):** Real-time ledger of ZETDC prepaid electricity tokens, municipal council settlements, and DStv receipts.
7. **Commercial Invoices (`/admin/invoices`):** Automated billing ledger with 15% ZIMRA VAT breakdown, downloadable PDF/print receipts, and payment status updates.
8. **Orders & Deliveries (`/admin/orders`):** Dispatch tracking, carrier assignment (Swift Express, FedEx), waybill generation, and status management.
9. **PVC ID Cards (`/admin/id-cards`):** Issue national merchant & inspector PVC credentials, preview cryptographic QR payloads, and manage card validity.
10. **Users & RBAC (`/admin/users`):** User account administration, role assignment (Admin, Business, Personal), and security audits.
11. **Platform Settings (`/admin/settings`):** Live configuration of the central USD-to-ZiG exchange rate (currently 26.50), subscription fees, and support hotlines.
12. **Audit Logs (`/admin/audit-logs`):** Immutable compliance trail logging every administrative mutation, time stamp, and actor ID.
13. **Storage & Media Hub (`/admin/storage`):** Visual inspector for Cloudflare R2 / local uploads with file key deletion and direct URL preview.

---

*Sadza Connect Zimbabwe — Built by Africdominion Group (Pvt) Ltd. Engineered for national scalability.*
