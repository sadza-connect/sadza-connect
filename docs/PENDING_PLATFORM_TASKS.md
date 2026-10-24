# Sadza Connect — Pending Platform Tasks & GitHub Issue Backlog

This document compiles pending tasks, architectural specifications, and enhancement backlogs for **Sadza Connect**. Each section is formatted as a self-contained specification ready to be copied directly into a GitHub Issue for sequential implementation, review, and tracking.

---

## Task Matrix & Implementation Roadmap

| Issue # | Title | Priority | Target Scope | Status |
| :--- | :--- | :--- | :--- | :--- |
| **#1** | Dynamic Catalog Quotas, Automated Tier Expansion & Dynamic Admin Pricing Controls | **High** | Anti-spam, Storefront limits, Admin overrides, Paynow upgrades | Backlog / Ready for Implementation |
| **#2** | Complete Scrubbing of Internal Technical Jargon & Infrastructure Leaks (PostgreSQL, Supabase, etc.) | **High** | UI Polish, Brand trust, User registration/login spinners, Admin UI | Backlog / Ready for Implementation |
| **#3** | Admin Table Skeleton Loaders & Eliminating False Empty-State Flashes Across All Sidebar Pages | **High** | Admin UX, Loading skeletons, Route transitions, In-memory cache | Backlog / Ready for Implementation |
| **#4** | Purging Mock Fallbacks, Fabricated Reviews, and Hardcoded Demo Assets Across Platform | **High** | Data integrity, Real brand placeholders, Clean admin modals | Backlog / Ready for Implementation |
| **#5** | Full Multi-Page CMS (Homepage, About Us & Contact Us) & Live Database Persistence Sync | **High** | Public CMS, Database persistence, Dynamic hero/slides/values/contact | Backlog / Ready for Implementation |
| **#6** | Admin Security Hardening: Password-Protected Suspend/Delete Actions & Threat State Badges | **Critical** | Admin Auth, Re-auth modal, Suspended red badges, User delete button | Backlog / Ready for Implementation |

---

# GitHub Issue #1: Dynamic Catalog Quotas, Automated Tier Expansion & Dynamic Admin Pricing Controls

## 1. Feature Overview & Problem Statement
Currently, any verified business on Sadza Connect can list unlimited products in the marketplace. While beneficial for growth, this introduces critical operational risks:
1. **Catalog Spam & Monopolization:** A single aggressive vendor could upload thousands of duplicate or low-quality listings, overwhelming search results and drowning out other businesses.
2. **Missing Monetization Funnel:** Businesses that scale from small shops to major distributors need an automated, friction-free way to expand their storefront capacity without manual admin intervention.
3. **Storage & Infrastructure Safeguards:** Image hosting and database indexing need sustainable, tiered resource allocation.

To solve this, Sadza Connect will implement a **Dynamic Product Quota & Self-Service Tier Expansion System** completely governed by the Platform Administrator.

---

## 2. Core Business Requirements & Admin Authority

### A. Dynamic Admin Management (Zero Hardcoding)
* **Full Price & Quota Authority:** The Platform Admin determines and can change at any time from `/admin/settings`:
  1. The **number of products** permitted for each tier (e.g., Starter = 25, Growth = 100, Enterprise = 300).
  2. The **monthly subscription price (USD)** for each tier.
  3. The **upgrade fee structure** when moving from a lower tier to a higher tier.
* **Per-Business Custom Overrides:** In addition to platform-wide tiers, the Admin retains individual control in `/admin/businesses` to:
  * Set a **custom product limit** for any specific business (e.g., granting 500 products to a high-volume enterprise partner).
  * Set a **custom monthly rate** for bespoke enterprise contracts.
* **Dynamic Platform Propagation:** Changing a tier's price or quota in `/admin/settings` must update:
  * Public `/pricing` comparison tables.
  * Merchant `/dashboard/business` quota meters and upgrade modals.
  * Backend API upload validators (`POST /api/v1/products`).

### B. Anti-Spam & Quality Guard
* Newly registered businesses on the 30-day free grace period start with the **Base/Starter Quota** (default: 25 active products).
* Merchants cannot upload beyond their active quota. Attempting to upload when at capacity blocks the action gracefully and directs them to the expansion modal.

### C. Automated Self-Service Expansion (No Manual Delays)
* Merchants do **not** have to wait for manual Admin approval to expand.
* From `/dashboard/business`, merchants can view their live catalog meter, select an expanded tier, and settle the payment via **EcoCash, InnBucks, Card, or ZiG**.
* Upon successful payment, the backend immediately increases their `product_limit` and updates their `catalog_tier` in real time.

---

## 3. Tier Structure (Default Baseline Subject to Admin Customization)

| Tier Name | Default Product Quota | Default Monthly Price | Target Merchant Type |
| :--- | :--- | :--- | :--- |
| **Starter Storefront** *(Base)* | **25 Products** | **$10 – $15 / month** *(Free in Month 1 Grace)* | Boutiques, artisans, cafes, local pharmacies, specialty repair shops |
| **Growth Storefront** | **100 Products** | **$25 / month** *(Configurable by Admin)* | Supermarkets, clothing distributors, consumer electronics retailers |
| **Enterprise Wholesaler** | **300 Products** | **$50 / month** *(Configurable by Admin)* | Hardware depots, agricultural suppliers, auto parts wholesalers |

> **Admin Custom Tier:** The Admin can also set individual custom limits (e.g., 500, 1,000, or unlimited) and custom rates for unique enterprise contracts.

---

## 4. Technical Architecture & Database Schema

### A. Database Migrations
1. **`businesses` Table Updates:**
   * `product_limit` (`INTEGER`, default `25`, `NOT NULL`): The active maximum allowed products.
   * `catalog_tier` (`VARCHAR(50)`, default `'starter'`, `NOT NULL`): Active tier identifier (`starter`, `growth`, `enterprise`, `custom`).
   * `custom_product_limit` (`INTEGER`, nullable): If populated by an Admin, overrides tier defaults.
2. **`platform_settings` Table Updates:**
   * `tier_starter_name` (`VARCHAR(80)`, default `'Starter Storefront'`)
   * `tier_starter_limit` (`INTEGER`, default `25`)
   * `tier_starter_price_usd` (`DECIMAL(10,2)`, default `15.00`)
   * `tier_growth_name` (`VARCHAR(80)`, default `'Growth Storefront'`)
   * `tier_growth_limit` (`INTEGER`, default `100`)
   * `tier_growth_price_usd` (`DECIMAL(10,2)`, default `25.00`)
   * `tier_enterprise_name` (`VARCHAR(80)`, default `'Enterprise Wholesaler'`)
   * `tier_enterprise_limit` (`INTEGER`, default `300`)
   * `tier_enterprise_price_usd` (`DECIMAL(10,2)`, default `50.00`)

### B. Backend API Enforcement (`POST /api/v1/products`)
```typescript
// 1. Fetch effective quota for target business
const effectiveLimit =
  business.custom_product_limit ??
  business.product_limit ??
  settings.tier_starter_limit ?? 25;

// 2. Count active products currently published
const [{ count }] = await db('products')
  .where({ business_id: targetBusinessId, is_active: true })
  .count('id as count');

const activeCount = Number(count);

// 3. Reject if limit reached
if (activeCount >= effectiveLimit) {
  throw new ValidationError(
    `Catalog limit of ${effectiveLimit} products reached. Please upgrade your storefront tier in your dashboard to list additional products.`
  );
}
```

### C. Self-Service Upgrade API Endpoint (`POST /api/v1/businesses/upgrade-tier`)
* **Payload:** `{ business_id: string, target_tier: 'growth' | 'enterprise', payment_method: 'ecocash' | 'innbucks' | 'card' }`
* **Flow:**
  1. Validates dynamic price from `platform_settings`.
  2. Generates subscription invoice in `invoices` table.
  3. Initiates payment through Paynow / EcoCash / InnBucks.
  4. On successful settlement, updates `businesses.catalog_tier`, `businesses.product_limit`, and extends subscription expiry.

---

## 5. UI & User Experience Specifications

### A. Business Owner Dashboard (`/dashboard/business`)
1. **Catalog Usage Meter:**
   * A clean progress component in the Products Hub:
     * e.g., `18 of 25 products listed (72%)` with visual color coding:
       * **Emerald:** Under 80%
       * **Amber:** 80% – 99%
       * **Rose:** 100% capacity
   * Prominent **"Expand Catalog"** button next to the meter.
2. **Expansion Modal:**
   * Renders the 3 dynamic tiers showing real-time prices (USD & ZiG equivalent).
   * Displays clear feature comparison bullets.
   * Direct one-click payment checkout with instant real-time quota upgrade upon completion.
3. **Empty State & Capacity Warning:**
   * If a merchant hits 100% quota, clicking "Upload Product" opens the Expansion Modal directly, explaining that their active catalog is full.

### B. Admin Console (`/admin`)
1. **Admin Platform Settings (`/admin/settings`):**
   * New **"Storefront Catalog Tiers & Pricing"** section.
   * Input fields for Tier Name, Product Limit, and Monthly Price for all 3 tiers.
   * "Save Changes" button that persists updates to the database and syncs platform-wide.
2. **Admin Businesses Directory (`/admin/businesses`):**
   * Columns for `Catalog Tier` and `Product Limit (Active/Max)`.
   * Quick-action edit modal allowing Admin to manually override `custom_product_limit` and `custom_monthly_price_usd` for any enterprise account.

---

## 6. Implementation Checklist for Issue #1

- [ ] **Phase 1: Database Migration**
  - [ ] Add `product_limit`, `catalog_tier`, and `custom_product_limit` to `businesses` table.
  - [ ] Add tier limits and pricing columns to `platform_settings` table.
  - [ ] Update `BusinessRow` and `PlatformSettings` TypeScript interfaces.
- [ ] **Phase 2: Admin Dynamic Controls**
  - [ ] Add tier pricing and quota editor form in `src/app/admin/settings/page.tsx`.
  - [ ] Add individual business quota override input in `src/app/admin/businesses/page.tsx`.
  - [ ] Update `settings-repository.ts` and `business-repository.ts` to handle tier settings.
- [ ] **Phase 3: Backend API Quota Validation**
  - [ ] Implement quota checks in `src/app/api/v1/products/route.ts` (`POST`).
  - [ ] Create tier upgrade endpoint (`src/app/api/v1/businesses/[slug]/upgrade/route.ts`).
  - [ ] Link successful payment webhook to automatic `product_limit` increase.
- [ ] **Phase 4: Business Dashboard UI**
  - [ ] Build live catalog meter component in `src/app/dashboard/business/page.tsx`.
  - [ ] Build **Expand Catalog Allowance** modal with dynamic tier selection.
  - [ ] Integrate seamless checkout and instant unlock.
- [ ] **Phase 5: Public Pricing Page Sync**
  - [ ] Dynamically render tier limits and prices in `src/app/pricing/page.tsx` from `platform_settings`.
- [ ] **Phase 6: QA, Anti-Spam Verification & Build**
  - [ ] Test quota block at 25/25 items.
  - [ ] Test automated self-service payment and immediate quota expansion.
  - [ ] Test Admin manual override.
  - [ ] Run full Next.js production build (`npm run build`).

---

# GitHub Issue #2: Complete Scrubbing of Internal Technical Jargon & Infrastructure Leaks (PostgreSQL, Supabase, etc.) Across All User Interfaces

## 1. Feature Overview & Problem Statement
During user registration, login, and account onboarding, modal spinners and popups currently expose internal architectural details to end users. For example, when submitting details on registration, a user sees:
> *"Encrypted PostgreSQL Data Link"*
> *"provisioning KYC profile in PostgreSQL..."*
> *"fetching information from database..."*

Exposing backend infrastructure terminology like **PostgreSQL**, **Supabase**, **Cloudflare**, or raw database table identifiers undermines brand professionalism, violates commercial design best practices, and introduces unnecessary security reconnaissance risk. End users should experience a sleek, bank-grade Zimbabwean commerce platform that communicates trust, speed, and enterprise security without developer jargon.

---

## 2. Identified Code Leaks & Required Cleanups

### A. Modal Spinners & Progress Loaders (`src/components/ui/ActionLoader.tsx`)
* **Location:** `src/components/ui/ActionLoader.tsx` (Line 66)
* **Current Text:**
  ```tsx
  <div className="relative mt-4 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400">
    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
    <span>Encrypted PostgreSQL Data Link</span>
  </div>
  ```
* **Replacement:**
  ```tsx
  <div className="relative mt-4 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400">
    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
    <span>256-Bit Encrypted Secure Connection</span>
  </div>
  ```
* **Impact:** Affects all instances where `ActionLoader` is displayed:
  - User Login (`src/app/login/page.tsx`)
  - User Registration (`src/app/signup/page.tsx`)
  - Business KYC Onboarding (`src/app/onboarding/business/page.tsx`)

### B. Business Onboarding Submission Modal (`src/app/onboarding/business/page.tsx`)
* **Location:** `src/app/onboarding/business/page.tsx` (Line 2054)
* **Current Text:**
  ```tsx
  subtitle="Creating storefront directory listing and provisioning KYC profile in PostgreSQL..."
  ```
* **Replacement:**
  ```tsx
  subtitle="Creating storefront directory listing and provisioning verified KYC compliance profile..."
  ```

### C. Admin Users Console (`src/app/admin/users/page.tsx`)
* **Location:** `src/app/admin/users/page.tsx` (Lines 334, 372, 451)
* **Current Text:**
  - Line 334: `${newName} has been provisioned as ${newRole} in PostgreSQL database.`
  - Line 372: `Account role updated to ${newDbRole.toUpperCase()} in database.`
  - Line 451: `title="Reload users from PostgreSQL"`
* **Replacement:**
  - Line 334: `${newName} has been successfully provisioned as ${newRole}.`
  - Line 372: `Account role successfully updated to ${newDbRole.toUpperCase()}.`
  - Line 451: `title="Reload platform directory"`

### D. Admin Analytics Console (`src/app/admin/analytics/page.tsx`)
* **Location:** `src/app/admin/analytics/page.tsx` (Lines 178, 185, 192, 231, 238, 255)
* **Current Text:**
  - Line 178: `...from PostgreSQL telemetry for ${activeTimeframe.label}.`
  - Line 185: `title="Refresh database analytics"`
  - Line 192: `<CheckCircle2 className="h-4 w-4 text-emerald-600" /> PostgreSQL Telemetry`
  - Line 231: `hint="Active listed companies in PostgreSQL"`
  - Line 238: `hint="Catalogue inventory items in PostgreSQL"`
  - Line 255: `hint="Distribution calculated from PostgreSQL active records (${activeTimeframe.label})"`
* **Replacement:**
  - Line 178: `...from real-time platform telemetry for ${activeTimeframe.label}.`
  - Line 185: `title="Refresh platform telemetry"`
  - Line 192: `<CheckCircle2 className="h-4 w-4 text-emerald-600" /> Live Platform Telemetry`
  - Line 231: `hint="Active verified businesses"`
  - Line 238: `hint="Active catalogue inventory items"`
  - Line 255: `hint="Distribution calculated from active platform records (${activeTimeframe.label})"`

### E. API Error Responses (`src/app/api/v1/adverts/[id]/route.ts`)
* **Location:** `src/app/api/v1/adverts/[id]/route.ts` (Line 125)
* **Current Text:**
  ```typescript
  message: 'Advert is not in database or already deleted.'
  ```
* **Replacement:**
  ```typescript
  message: 'Advert was not found or has already been removed.'
  ```

### F. Privacy Policy & Compliance Copy (`src/app/privacy/page.tsx`)
* **Location:** `src/app/privacy/page.tsx` (Line 34)
* **Review:** Ensure descriptions emphasize "enterprise encrypted cloud vault" and "banking-standard AES-256 data protection" rather than technical DB architecture jargon.

### G. Global Error Handling & Exception Sanitization
* **Audit Rule:** Catch blocks in API routes and client fetch calls must never output raw database error objects (`error.message` from PostgreSQL/Knex driver like `relation "xyz" does not exist`, `duplicate key value violates unique constraint`, etc.) into toasts or alert components.
* **Standardization:** Map all database-level errors to clean, localized customer messages:
  - Unique constraint violations -> `"An account with this email or phone number is already registered. Please sign in or reset your password."`
  - Record not found -> `"The requested listing could not be found."`
  - Generic server errors -> `"Unable to process your request at this time. Please try again shortly or contact Sadza Connect support."`

---

## 3. Implementation Checklist for Issue #2

- [ ] **Phase 1: Component & Modal Scrubbing**
  - [ ] Replace `"Encrypted PostgreSQL Data Link"` in `src/components/ui/ActionLoader.tsx` with `"256-Bit Encrypted Secure Connection"`.
  - [ ] Replace `"provisioning KYC profile in PostgreSQL..."` in `src/app/onboarding/business/page.tsx` with `"provisioning verified KYC compliance profile..."`.
- [ ] **Phase 2: Admin Portal Scrubbing**
  - [ ] Clean all toast and tooltip messages in `src/app/admin/users/page.tsx`.
  - [ ] Clean telemetry badges and card hints in `src/app/admin/analytics/page.tsx`.
- [ ] **Phase 3: API & Server Sanitization**
  - [ ] Sanitize advert deletion message in `src/app/api/v1/adverts/[id]/route.ts`.
  - [ ] Verify that client error handling in `login`, `signup`, and `dashboard` never forwards raw DB driver error messages.
- [ ] **Phase 4: Global Codebase Audit & Build Verification**
  - [ ] Run `git grep -i -E "postgresql|supabase" src/` to verify zero residual user-facing strings.
  - [ ] Run `npx tsc --noEmit` and `npm run build` to ensure all pages compile cleanly.

---

# GitHub Issue #3: Admin Table Skeleton Loaders & Eliminating False Empty-State Flashes Across All Sidebar Pages

## 1. Feature Overview & Problem Statement
When an Administrator navigates through the Admin Console sidebar (e.g., clicking **Users**, **Businesses**, **Products**, **Adverts**, **Orders**, or **Vacancies**), the page immediately flashes an **"Empty State"** notification:
> *"No users found. Try changing your search query or role filter."*
> *"No businesses match filters."*
> *"No products match filters."*

Then, 400ms to 1200ms later when the database network response arrives, the empty state abruptly disappears and the data table pops into view.

### The Root Cause:
1. **Premature Array Evaluation:** The table data state starts as `[]`. In JSX, the component checks `{filtered.length === 0 ? <EmptyState /> : <table>}` without checking if data is currently loading.
2. **`isLoading` Defaults to `false`:** In several pages (`users`, `orders`), `isLoading` was initialized to `false`. In others (`marketplace`, `adverts`, `jobs`), there wasn't even an `isLoading` variable.
3. **No Skeleton Component in `AdminUI`:** There are zero table skeleton or placeholder components anywhere in `src/components/admin/AdminUI.tsx`, forcing pages to render either the table or the empty box.

---

## 2. Architectural Blueprint: 3-State Data Table Lifecycle

Every admin data table must strictly adhere to a **3-State Lifecycle**:

```
[ Route Mounts / Filter Changes ]
               │
               ▼
   Is data currently loading?
       ├──► YES ──► Render <TableSkeleton columns={N} rows={M} />
       │            (Pulsing animated shimmer placeholder rows)
       ▼ NO
   Are there 0 items in filtered array?
       ├──► YES ──► Render <EmptyState title="No records found" ... />
       │            (ONLY shown when fetch is complete and zero results exist)
       ▼ NO
   Render populated <table> data rows
```

---

## 3. Implementation Details

### A. Reusable `<TableSkeleton />` Component (`src/components/admin/AdminUI.tsx`)
Create a high-fidelity table skeleton loader:
```tsx
export function TableSkeleton({
  columns = 6,
  rows = 5,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="overflow-x-auto animate-pulse">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#e6eaf1] bg-[#f4f6f9]/80">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-5 py-3">
                <div className="h-3.5 w-20 rounded bg-slate-200/80" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e6eaf1]">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="hover:bg-slate-50/50">
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="px-5 py-4">
                  <div
                    className={cn(
                      'h-4 rounded bg-slate-200/70',
                      c === 0 ? 'w-36' : c === columns - 1 ? 'w-16 ml-auto' : 'w-24'
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### B. Standardized State Initialization Across All Admin Pages
Every admin page must initialize its loading state to `true`:
```tsx
const [isLoading, setIsLoading] = useState(true);
```
And wrap the table view in the 3-state condition:
```tsx
{isLoading ? (
  <TableSkeleton columns={6} rows={6} />
) : filtered.length === 0 ? (
  <EmptyState ... />
) : (
  <div className="overflow-x-auto">
    <table>...</table>
  </div>
)}
```

### C. Pages Requiring Table Skeleton & State Fix:
1. `src/app/admin/users/page.tsx`
2. `src/app/admin/businesses/page.tsx`
3. `src/app/admin/marketplace/page.tsx`
4. `src/app/admin/adverts/page.tsx`
5. `src/app/admin/orders/page.tsx`
6. `src/app/admin/jobs/page.tsx`
7. `src/app/admin/id-cards/page.tsx`
8. `src/app/admin/messages/page.tsx`

---

## 4. Implementation Checklist for Issue #3

- [ ] **Phase 1: Component Infrastructure**
  - [ ] Add `<TableSkeleton />` with customizable columns, row counts, and pulsing shimmers to `src/components/admin/AdminUI.tsx`.
- [ ] **Phase 2: Admin Sidebar Pages Fix**
  - [ ] Update `src/app/admin/users/page.tsx`: Set `isLoadingUsers(true)` by default; render `<TableSkeleton />`.
  - [ ] Update `src/app/admin/businesses/page.tsx`: Wire `isLoading` state to `<TableSkeleton />`.
  - [ ] Update `src/app/admin/marketplace/page.tsx`: Introduce `isLoading` state and `<TableSkeleton />`.
  - [ ] Update `src/app/admin/adverts/page.tsx`: Introduce `isLoading` state and `<TableSkeleton />`.
  - [ ] Update `src/app/admin/orders/page.tsx`: Set `loading(true)` by default; render `<TableSkeleton />`.
  - [ ] Update `src/app/admin/jobs/page.tsx`: Introduce `isLoading` state and `<TableSkeleton />`.
  - [ ] Update `src/app/admin/id-cards/page.tsx`: Introduce `isLoading` state and `<TableSkeleton />`.
  - [ ] Update `src/app/admin/messages/page.tsx`: Introduce `isLoading` state and `<TableSkeleton />`.
- [ ] **Phase 3: Client Route Caching & Flicker Elimination**
  - [ ] Cache retrieved admin datasets in a lightweight memory store so navigating back and forth across sidebar tabs shows existing data immediately while revalidating in the background.
- [ ] **Phase 4: QA & Verification**
  - [ ] Navigate across all 8 admin tabs in browser: verify zero "Empty State" flashes occur on load.
  - [ ] Verify that real empty states still show when filters genuinely match 0 items.

---

# GitHub Issue #4: Purging Mock Fallbacks, Fabricated Reviews, and Hardcoded Demo Assets Across Platform

## 1. Feature Overview & Problem Statement
During initial UI prototyping, dozens of hardcoded dummy fallbacks, fake reviews, mock phone numbers, and stock Unsplash assets were embedded to keep cards from looking empty. In production, this causes severe commercial data integrity issues:
1. **Unrelated Stock Photos:** A merchant who creates a product (e.g. "50kg Maize Meal" or "Brake Pads") without an image has an Unsplash photo of a **solar panel** automatically attached to their listing!
2. **Fabricated 5-Star Reviews:** Every newly registered enterprise automatically gets a fake 5-star review from `"Verified Buyer"` reading *"Fast communication on WhatsApp and genuine products supplied in good time"* and a fake `4.5 rating (12 reviews)`.
3. **Dead Dummy Phone Numbers & Emails:** Fallback contact numbers like `+263 77 000 0000`, `+263 77 210 1101`, and `client@example.co.zw` are displayed to real customers and logistics couriers.
4. **Polluted Admin Forms:** Opening "Add Product", "Add Advert", or "Add Order" in Admin opens modals pre-filled with demo company data (`SunPower Solar`, `$450`, `$1450`, etc.) instead of clean blank inputs.

---

## 2. Identified Fallbacks & Remediation Plan

### A. Product Mappers & Upload Forms
* **`src/app/dashboard/business/page.tsx`:**
  - Remove `PRESET_PRODUCT_IMAGES[0]` (`photo-1509391366360-2e959784a276`) from initial `prodImages` state. The image array must start empty `[]`.
  - Make image upload a required/strongly guided field in the form.
  - Reset default pre-filled price (`'120'`), unit (`'Per Unit / Kit'`), and stock note (`'In Stock • Immediate Dispatch'`) to empty strings with clear placeholders.
* **`src/lib/data/product-mapper.ts`:**
  - Remove fallback to Unsplash solar panel (`photo-1509391366360-2e959784a276`).
  - If a product has no image, return a clean SVG placeholder identifier or `null` so the UI renders a branded category placeholder (e.g., an icon with the category name), NEVER a random solar panel.
  - Remove hardcoded seller fallback phone `+263770000000`. If seller phone is missing, render `null`.
* **`src/app/admin/marketplace/page.tsx`:**
  - Remove Unsplash fallback image in `imgSrc`.
  - Clear all pre-filled form fields (`sellerName: 'SunPower Solar'`, `priceUsd: '450'`, `specs`, `highlights`). Forms must start blank with helpful `placeholder="..."` hints.
  - Remove automatic assignment to `availableBusinesses[0]` or `'b1'` / `'midlands-solar-agro-solutions'`; require explicit business selection.

### B. Business Mappers & Ratings
* **`src/lib/data/business-mapper.ts`:**
  - **DELETE** the injected fake review object:
    ```typescript
    // REMOVE THIS FABRICATED REVIEW
    reviews: [
      {
        id: `rev-${b.id}-1`,
        author: 'Verified Buyer',
        role: 'Commercial Client',
        rating: 5,
        date: 'Recent',
        comment: 'Fast communication on WhatsApp and genuine products supplied in good time.',
      },
    ]
    ```
  - Stop defaulting `reviewCount` to `12` and `rating` to `4.5`. If a business has no reviews in the database, return `reviewCount: 0` and `rating: 0`. The UI should render *"No reviews yet • Be the first to review"*.
  - Remove fallback image (`photo-1497440001374-f26997328c1b`). If no logo/cover is uploaded, display a neutral building icon or brand monogram of the business initials.
  - Remove fake fallback phone `+263 77 000 0000` and fake email `contact@${b.slug}.co.zw`.
* **`src/app/admin/businesses/page.tsx`:**
  - Remove `photo-1509391366360-2e959784a276` from `coverImg`.
  - Do not default `cr14Verified: true` when creating a business in Admin; require manual toggle verification.

### C. Sponsored Advert Mappers & Forms
* **`src/lib/data/advert-mapper.ts`:**
  - Remove fallback to Unsplash logistics photo (`photo-1586528116311-ad8dd3c8310d`).
  - Remove hardcoded fallback phone numbers `263772111222` and `+263 77 211 1222`.
* **`src/app/admin/adverts/page.tsx`:**
  - Clear pre-filled demo data (`businessName: 'SunPower Solar'`, `promoBadge: 'SAVE 15% THIS MONTH'`, `originalPriceUsd: '1450'`, `promoPriceUsd: '1250'`, `whatsapp: '263772101101'`).
  - Forms must start blank with placeholder text.

### D. Orders & Careers Mappers
* **`src/lib/data/order-mapper.ts`:**
  - Remove hardcoded `email: 'client@example.co.zw'`. If customer email is null, display `N/A`.
  - Remove hardcoded `province: 'Harare'` and fallback carrier `Swift Transit`. Only show courier if assigned.
* **`src/app/admin/orders/page.tsx`:**
  - Clear pre-filled demo supplier `"SunPower Solar & Inverters Zimbabwe"`.
* **`src/lib/data/job-mapper.ts`:**
  - Remove the 3 auto-injected boilerplate requirements (`Minimum 2 years experience...`). Display only genuine requirements submitted by the employer.
  - Remove fallback `cvFileName: 'Curriculum_Vitae.pdf'`.
* **`src/app/admin/jobs/page.tsx`:**
  - Clear pre-filled demo values (`SunPower Solar`, `$500 – $750 USD / month`, `whatsapp: '263772101101'`).
* **`src/lib/data/id-card-mapper.ts`:**
  - Remove hardcoded model photo (`photo-1534528741775-53994a69daeb`) and phone `+263 77 210 1101`. Use standard avatar placeholder icon when photo is missing.

---

## 3. Safe Fallbacks to Preserve (Do Not Remove)
The following operational fallbacks are safe and essential for platform stability:
1. **Dynamic Currency Conversion:** If `price_zig` is null in the database, automatically computing `price_usd * usdToZigRate` ensures reliable dual-currency pricing across the country.
2. **Safe Date Formatting:** Returning `'Recently Listed'` if an API record has a null `created_at` timestamp prevents client crashes.
3. **Auto-Slugification:** Automatically slugifying names (e.g., `"Harare Solar Depot"` -> `"harare-solar-depot"`) for friendly URLs.

---

## 4. Implementation Checklist for Issue #4

- [ ] **Phase 1: Product & Dashboard Purge**
  - [ ] Remove `PRESET_PRODUCT_IMAGES` pre-population in `src/app/dashboard/business/page.tsx`.
  - [ ] Remove Unsplash solar panel fallback in `src/lib/data/product-mapper.ts` and `src/app/admin/marketplace/page.tsx`.
  - [ ] Implement neutral SVG / category branded placeholder for products without photos.
  - [ ] Clean pre-filled demo values in `src/app/admin/marketplace/page.tsx`.
- [ ] **Phase 2: Business & Review Integrity**
  - [ ] Remove injected fake reviews and fabricated 4.5/12 rating defaults from `src/lib/data/business-mapper.ts`.
  - [ ] Implement clean zero-review state (*"No reviews yet"*) in business storefront and marketplace cards.
  - [ ] Remove fake fallback phone/email numbers and Unsplash building images from business mapper.
- [ ] **Phase 3: Sponsored Adverts & ID Cards Purge**
  - [ ] Remove Unsplash warehouse photo and dummy phone numbers from `src/lib/data/advert-mapper.ts`.
  - [ ] Clear pre-filled demo data in `src/app/admin/adverts/page.tsx`.
  - [ ] Remove Unsplash model photo from `src/lib/data/id-card-mapper.ts`.
- [ ] **Phase 4: Orders & Vacancies Purge**
  - [ ] Remove dummy email `client@example.co.zw` and default carrier `Swift Transit` from `src/lib/data/order-mapper.ts`.
  - [ ] Remove auto-injected boilerplate requirements from `src/lib/data/job-mapper.ts`.
  - [ ] Clear demo form values in `src/app/admin/orders/page.tsx` and `src/app/admin/jobs/page.tsx`.
- [ ] **Phase 5: Global Audit & Production Build**
  - [ ] Verify that registering a business and creating a product produces 100% genuine data with zero unintended fallbacks.
  - [ ] Run `npx tsc --noEmit` and `npm run build` to verify clean compilation.

---

# GitHub Issue #5: Full Multi-Page CMS (Homepage, About Us & Contact Us) & Live Database Persistence Sync

## 1. Feature Overview & Problem Statement
In the Admin Console ([`/admin/content`](file:///home/levibliz/Desktop/LeviOnChain/Sadza_Conneect/src/app/admin/content/page.tsx)), the CMS allows Administrators to customize copy, headlines, value propositions, imagery, mission statements, and contact details across three core public pages:
1. **Homepage (`/`)**
2. **About Us Page (`/about`)**
3. **Contact Us Page (`/contact`)**

Currently, saving changes in this interface **fails to update the public site** for three reasons:
1. **LocalStorage Isolation:** `handleSave()` executes `savePlatformSettings(settings)` which only commits to browser `localStorage`. It never dispatches an HTTP `PATCH` or `POST` to PostgreSQL.
2. **Disconnected Component State:** Major content blocks (showcase banner slides, 4 Why Choose Us points, 4 How It Works steps, and 4 Core Operational Values) are held in temporary component `useState`. They are never passed to the persistence layer.
3. **Hardcoded Public Pages:** Key public UI components ([`Hero.tsx`](file:///home/levibliz/Desktop/LeviOnChain/Sadza_Conneect/src/components/landing/Hero.tsx), [`CommercialPortalWorkspace.tsx`](file:///home/levibliz/Desktop/LeviOnChain/Sadza_Conneect/src/components/landing/CommercialPortalWorkspace.tsx), and [`about/page.tsx`](file:///home/levibliz/Desktop/LeviOnChain/Sadza_Conneect/src/app/about/page.tsx)) contain hardcoded text rather than reading from live database settings.

---

## 2. Multi-Page Scope & Content Specifications

### A. Page 1: Homepage (`/`)
The Administrator must have complete dynamic control over:
* **Top Announcement Bar:** Announcement copy, active display toggle, and link target.
* **Hero Section:** National Eyebrow, Main Headline (`hero_headline`), Subtitle/Tagline (`hero_subtitle`), and Primary Call-to-Action button label.
* **Featured Commercial Showcase Banners (`home_slides`):** Array of banner cards (Image URL, Sector Tag, Alt/Caption, Destination URL).
* **Why Choose Us Value Propositions (`why_reasons`):** 4 customizable value pillars (Title, Body description).
* **How It Works Workflow Steps (`process_steps`):** 4 numbered onboarding and trading steps (Step Number, Title, Body).

### B. Page 2: About Us (`/about`)
The Administrator must have complete dynamic control over:
* **Corporate Overview Eyebrow & Main Headline (`about_headline`):** Displayed prominently on the corporate header.
* **Commercial Mission Statement (`about_mission`):** Detailed mission copy.
* **National Mandate & Vision Statement (`about_vision`):** Detailed vision copy.
* **Core Operational Values (`core_values`):** 4 operational pillars (Pillar Title, Body description).

### C. Page 3: Contact Us (`/contact`) & Global Footer
The Administrator must have complete dynamic control over:
* **Official Support Email (`support_email`):** Updates the contact form destination, header badges, and footer.
* **Primary Telephone Line (`support_phone`):** Click-to-call links across the website.
* **Official WhatsApp Desk Number (`support_whatsapp`):** Generates live click-to-WhatsApp support links nationwide and for the Diaspora.
* **Headquarters Physical Depot Address (`hq_address`):** Physical location copy displayed on the map card and footer.

---

## 3. Database Schema & API Specifications

### A. Database Migration: `platform_settings` / `cms_content` Table
Add JSONB and text columns to `platform_settings`:
```sql
ALTER TABLE platform_settings
  ADD COLUMN IF NOT EXISTS hero_headline VARCHAR(255) DEFAULT 'Connecting Zimbabwean Businesses, Customers & Everyday Trade',
  ADD COLUMN IF NOT EXISTS hero_subtitle TEXT DEFAULT 'Discover verified local suppliers, shop marketplace items, find job vacancies, and recharge utility tokens across Harare, Bulawayo, Mutare, Gweru, and all 10 provinces.',
  ADD COLUMN IF NOT EXISTS home_slides JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS why_reasons JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS process_steps JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS about_headline VARCHAR(255) DEFAULT 'Zimbabwe’s Unified Digital Commercial Infrastructure',
  ADD COLUMN IF NOT EXISTS about_mission TEXT,
  ADD COLUMN IF NOT EXISTS about_vision TEXT,
  ADD COLUMN IF NOT EXISTS core_values JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS support_email VARCHAR(255) DEFAULT 'support@sadzaconnect.co.zw',
  ADD COLUMN IF NOT EXISTS support_phone VARCHAR(50) DEFAULT '+263 77 210 1101',
  ADD COLUMN IF NOT EXISTS support_whatsapp VARCHAR(50) DEFAULT '263772101101',
  ADD COLUMN IF NOT EXISTS hq_address TEXT DEFAULT '14 Samora Machel Avenue, Harare CBD, Zimbabwe';
```

### B. Backend API Endpoints
1. **`GET /api/v1/cms` (Public, Cached):**
   Returns full structured CMS content for all 3 pages (`home`, `about`, `contact`). Public pages fetch this on mount/SSR with ISR revalidation.
2. **`PATCH /api/v1/cms` (Admin Authenticated):**
   Accepts updated CMS fields, validates payload with Zod, and commits directly to PostgreSQL. Emits a cache purge so public visitors immediately see updated headlines and copy.

---

## 4. Implementation Checklist for Issue #5

- [ ] **Phase 1: Database Migration & Schema Extension**
  - [ ] Add CMS columns (`hero_headline`, `hero_subtitle`, `home_slides`, `why_reasons`, `process_steps`, `core_values`) to PostgreSQL schema.
  - [ ] Update `settings-repository.ts` to read and write full multi-page CMS payloads.
- [ ] **Phase 2: API Endpoints**
  - [ ] Implement `GET /api/v1/cms` for public high-speed retrieval.
  - [ ] Implement `PATCH /api/v1/cms` with admin JWT authorization.
- [ ] **Phase 3: Admin CMS Interface (`src/app/admin/content/page.tsx`)**
  - [ ] Wire `handleSave` to send an authenticated `PATCH /api/v1/cms` to the backend.
  - [ ] Connect `homeSlides`, `whyReasons`, `processSteps`, `aboutVision`, `aboutMission`, and `coreValues` to the save payload.
  - [ ] Pre-populate fields on page mount by fetching live database content.
- [ ] **Phase 4: Public Frontend Binding**
  - [ ] Update `Hero.tsx`: Bind `hero_headline` and `hero_subtitle` dynamically to database CMS.
  - [ ] Update `AnnouncementBar.tsx`: Bind announcement text and badge dynamically.
  - [ ] Update `src/app/about/page.tsx`: Bind `about_headline`, `about_mission`, `about_vision`, and `core_values` dynamically.
  - [ ] Update `src/app/contact/page.tsx` & `Footer.tsx`: Bind support email, phone, WhatsApp link, and physical address dynamically.
- [ ] **Phase 5: Verification & End-to-End Test**
  - [ ] Edit homepage headline in Admin CMS -> verify change is visible on `/`.
  - [ ] Edit mission statement in Admin CMS -> verify change is visible on `/about`.
  - [ ] Edit support phone/address in Admin CMS -> verify change is visible on `/contact` and footer.

---

# GitHub Issue #6: Admin Security Hardening: Password-Protected Suspend/Delete Actions & Threat State Badges

## 1. Feature Overview & Problem Statement
Administrative operations on accounts and businesses require robust visual clarity and strict security safeguards. Currently, two major flaws exist in the Admin Console:
1. **Misleading Visual Status on Suspended Accounts:**
   When an Administrator suspends a user in [`/admin/users`](file:///home/levibliz/Desktop/LeviOnChain/Sadza_Conneect/src/app/admin/users/page.tsx), the table continues to display an **emerald green checkmark** (`CheckCircle2 text-emerald-500`) with green text! Suspended accounts look identical to active accounts, creating confusion.
2. **Zero Security Verification on Destructive Actions:**
   - Suspending an account runs immediately on a single click without confirmation or password verification.
   - Deleting a business in `/admin/businesses` only uses a simple yes/no modal with no password requirement.
   - Promoting a user to Super Administrator executes with zero re-authentication.
   - There is **no Delete User button** in the Admin UI at all, despite the backend supporting soft deletion.

---

## 2. Visual State Management (Status Badges)

In [`src/app/admin/users/page.tsx`](file:///home/levibliz/Desktop/LeviOnChain/Sadza_Conneect/src/app/admin/users/page.tsx):
* **Suspended Status Badge (Danger State):**
  - Background: `bg-red-50 dark:bg-red-950/40`
  - Text: `text-red-700 dark:text-red-400 font-bold`
  - Border: `border border-red-200 dark:border-red-900/60`
  - Icon: `<ShieldAlert className="h-3 w-3 text-red-600 dark:text-red-400" />`
  - Label: `"Suspended"`
* **Active Status Badge (Healthy State):**
  - Background: `bg-emerald-50 dark:bg-emerald-950/40`
  - Text: `text-emerald-700 dark:text-emerald-400 font-medium`
  - Border: `border border-emerald-200 dark:border-emerald-900/60`
  - Icon: `<CheckCircle2 className="h-3 w-3 text-emerald-500" />`
  - Label: `"Active"`
* **User Profile Detail Modal:**
  - If an account is suspended, render a prominent red alert banner across the top:
    > *"This account is currently SUSPENDED. The user cannot access storefront portals or upload listings."*

---

## 3. Destructive Action Security: Admin Password Re-Authentication

### A. Protected Operations
The following high-consequence operations must require **Admin Password Re-Authentication**:
1. **Suspend User Account**
2. **Reactivate Suspended User Account**
3. **Delete User Account** *(new button to be added)*
4. **Delete Registered Business**
5. **Elevate Role to Super Administrator**

### B. `<AdminPasswordConfirmationModal />` Component
Create a reusable security modal in [`src/components/admin/AdminUI.tsx`](file:///home/levibliz/Desktop/LeviOnChain/Sadza_Conneect/src/components/admin/AdminUI.tsx):
* **Props:** `open: boolean`, `title: string`, `description: string`, `actionType: 'danger' | 'warning'`, `confirmLabel: string`, `onConfirm: (password: string) => Promise<void>`, `onClose: () => void`.
* **Behavior:**
  - Displays a clear consequence warning (e.g., *"You are about to permanently delete enterprise [Company Name]. This will revoke storefront access and deactivate active products."*).
  - Renders a secure password input (`type="password"`) with eye-toggle visibility.
  - "Authorize & Proceed" button disabled until password has at least 6 characters.
  - Displays an active spinner during verification.

### C. Backend Password Verification Endpoint (`POST /api/v1/auth/verify-password`)
* **Request:** `{ password: string }` with Admin Bearer JWT.
* **Backend Logic:**
  1. Retrieves caller user record from `users` table via `getAuthenticatedUser()`.
  2. Compares submitted password with `caller.password_hash` using `bcrypt.compare()`.
  3. Returns `200 { valid: true }` if correct.
  4. Returns `401 { error: 'Invalid administrator credentials' }` if incorrect.
* **Destructive Endpoints Guard:**
  Alternatively, require `admin_password` inside the payload of `DELETE /api/v1/users/[id]`, `PATCH /api/v1/users/[id]`, and `DELETE /api/v1/businesses/[slug]` to ensure backend-level atomic authorization.

### D. User Account Deletion Feature in UI
* Add a **"Delete Account"** button in [`src/app/admin/users/page.tsx`](file:///home/levibliz/Desktop/LeviOnChain/Sadza_Conneect/src/app/admin/users/page.tsx) inside the User Details Modal.
* Clicking opens `<AdminPasswordConfirmationModal />`.
* Upon verified password input, executes `DELETE /api/v1/users/${user.id}`.
* Automatically cascades: deactivates any businesses and products owned by that user.

---

## 4. Implementation Checklist for Issue #6

- [ ] **Phase 1: Status Badge Color & Threat Styling**
  - [ ] Update table status rendering in `src/app/admin/users/page.tsx`: Suspended -> Red badge with `<ShieldAlert />`; Active -> Green badge with `<CheckCircle2 />`.
  - [ ] Add suspended threat alert banner inside the User Details Modal.
- [ ] **Phase 2: Re-Authentication Modal Component**
  - [ ] Build `<AdminPasswordConfirmationModal />` in `src/components/admin/AdminUI.tsx` with secure password input and consequence warnings.
- [ ] **Phase 3: Backend Verification Endpoint**
  - [ ] Implement `POST /api/v1/auth/verify-password` using bcrypt compare against active admin session.
  - [ ] Add password validation guard to `DELETE /api/v1/users/[id]` and `DELETE /api/v1/businesses/[slug]`.
- [ ] **Phase 4: User Deletion UI & Action Wiring**
  - [ ] Add "Delete Account" button in `src/app/admin/users/page.tsx`.
  - [ ] Wire Suspend, Reactivate, Delete User, and Promote Admin buttons to trigger `<AdminPasswordConfirmationModal />`.
  - [ ] Wire Delete Business in `src/app/admin/businesses/page.tsx` to trigger `<AdminPasswordConfirmationModal />`.
- [ ] **Phase 5: Data Cascade & Deactivation**
  - [ ] Ensure deleting/suspending a user automatically hides their active listings from public search.
- [ ] **Phase 6: QA & Security Testing**
  - [ ] Test wrong password: verify action is strictly blocked and error toast is displayed.
  - [ ] Test correct password: verify action succeeds and UI updates immediately.
