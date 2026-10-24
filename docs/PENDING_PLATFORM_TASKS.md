# Sadza Connect — Master Implementation Backlog & GitHub Issues Roadmap

This document serves as the **authoritative, sequenced roadmap** for completing all pending platform features, security hardening, data hygiene, and administrator console operations on **Sadza Connect**.

Every task is strictly ordered by **architectural dependency**: foundational data hygiene and core UI frameworks precede subsystem logic, which in turn precede the public CMS and catalog quota monetization engines.

---

## Master Implementation Sequence Matrix

| Execution Order | Issue # | Title | Priority | Architectural Stage | Target Scope |
| :---: | :---: | :--- | :---: | :--- | :--- |
| **1st** | **#1** | **Complete Scrubbing of Internal Technical Jargon & Infrastructure Leaks** | **High** | Stage 1: Clean Slate & Hygiene | Purge "PostgreSQL", "database", and developer jargon from spinners, modals, and toasts. |
| **2nd** | **#2** | **Purging Mock Fallbacks, Fabricated Reviews, and Hardcoded Demo Assets** | **High** | Stage 1: Clean Slate & Hygiene | Remove Unsplash solar panel fallbacks, delete auto-injected fake reviews, remove dummy phone/email fallbacks. |
| **3rd** | **#3** | **Admin Table Skeleton Loaders & Eliminating False Empty-State Flashes** | **High** | Stage 2: Admin UI Framework | Reusable `<TableSkeleton />`, 3-state data lifecycle (`Loading` -> `Data` -> `Empty`), and route caching. |
| **4th** | **#4** | **Admin Security Hardening: Password-Protected Suspend/Delete & Threat Badges** | **Critical** | Stage 2: Admin UI Framework | Danger red badges for suspended users, User Delete button, `<AdminPasswordConfirmationModal />`. |
| **5th** | **#5** | **Admin Settings API Authorization & Password Rotation Pipeline** | **Critical** | Stage 3: Admin Subsystem Logic | Fix missing `Authorization` header in `PUT /api/v1/settings`; implement real backend admin password rotation. |
| **6th** | **#6** | **Admin Receipts, Invoices & Customer Inquiries Pipeline** | **High** | Stage 3: Admin Subsystem Logic | Connect `/admin/bill-payments` to live PostgreSQL `/api/v1/invoices`; connect `/contact` form to `/admin/messages`. |
| **7th** | **#7** | **Admin Orders, Careers & ID Cards Operational Polish** | **Medium** | Stage 3: Admin Subsystem Logic | PVC card `@media print` CSS isolation; Job hiring status fix to `'Hired'` & real Cloudflare R2 CV download links. |
| **8th** | **#8** | **Full Multi-Page CMS (Homepage, About Us & Contact Us) & Live Database Sync** | **High** | Stage 4: Public Engine & Sync | Extend PostgreSQL schema for Homepage, About Us, and Contact Us; connect public pages to live dynamic CMS. |
| **9th** | **#9** | **Dynamic Catalog Quotas, Automated Tier Expansion & Dynamic Admin Pricing Controls** | **High** | Stage 4: Monetization Engine | Anti-spam product limits, dynamic admin pricing authority, self-service Paynow upgrades, `/pricing` sync. |

---

# GitHub Issue #1: Complete Scrubbing of Internal Technical Jargon & Infrastructure Leaks Across All User Interfaces

## 1. Feature Overview & Problem Statement
During user registration, login, business KYC onboarding, and admin monitoring, modal spinners and status popups currently expose internal architectural details to end users. For example, when submitting details on registration, a user sees:
> *"Encrypted PostgreSQL Data Link"*
> *"Creating storefront directory listing and provisioning KYC profile in PostgreSQL..."*
> *"fetching information from database..."*

Exposing backend infrastructure terminology like **PostgreSQL**, **Supabase**, **Cloudflare**, or raw database table identifiers undermines brand trust, violates commercial design best practices, and introduces security reconnaissance risks. End users should experience a sleek, bank-grade Zimbabwean commerce platform that communicates trust, speed, and enterprise security without developer buzzwords.

---

## 2. File-by-File Code Leaks & Replacements

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
* **Current Text:** `message: 'Advert is not in database or already deleted.'`
* **Replacement:** `message: 'Advert was not found or has already been removed.'`

### F. Global Exception Masking
* Catch blocks in client fetch calls and API routes must never forward raw SQL/Knex/Postgres error messages (`relation "xyz" does not exist`, `duplicate key violates unique constraint`) to toasts or modals. Replace with customer-safe error text.

---

## 3. Implementation Checklist for Issue #1
- [x] Replace `"Encrypted PostgreSQL Data Link"` in `src/components/ui/ActionLoader.tsx`.
- [x] Replace `"provisioning KYC profile in PostgreSQL..."` in `src/app/onboarding/business/page.tsx`.
- [x] Clean toast and tooltip messages in `src/app/admin/users/page.tsx`.
- [x] Clean telemetry badges and card hints in `src/app/admin/analytics/page.tsx`.
- [x] Sanitize advert deletion message in `src/app/api/v1/adverts/[id]/route.ts`.
- [x] Run `git grep -i -E "postgresql|supabase" src/` to verify zero residual user-facing strings.
- [x] Run `npm run build` to verify clean compilation.

---

# GitHub Issue #2: Purging Mock Fallbacks, Fabricated Reviews, and Hardcoded Demo Assets Across Platform

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
1. **Dynamic Currency Conversion:** If `price_zig` is null in the database, automatically computing `price_usd * usdToZigRate` ensures reliable dual-currency pricing across the country.
2. **Safe Date Formatting:** Returning `'Recently Listed'` if an API record has a null `created_at` timestamp prevents client crashes.
3. **Auto-Slugification:** Automatically slugifying names (e.g., `"Harare Solar Depot"` -> `"harare-solar-depot"`) for friendly URLs.

---

## 4. Implementation Checklist for Issue #2
- [x] Remove `PRESET_PRODUCT_IMAGES` pre-population in `src/app/dashboard/business/page.tsx`.
- [x] Remove Unsplash solar panel fallback in `src/lib/data/product-mapper.ts` and `src/app/admin/marketplace/page.tsx`.
- [x] Implement neutral SVG / category branded placeholder for products without photos.
- [x] Remove injected fake reviews and fabricated 4.5/12 rating defaults from `src/lib/data/business-mapper.ts`.
- [x] Implement clean zero-review state (*"No reviews yet"*) in business storefront and marketplace cards.
- [x] Remove Unsplash warehouse photo and dummy phone numbers from `src/lib/data/advert-mapper.ts`.
- [x] Clear pre-filled demo data in `src/app/admin/adverts/page.tsx`, `orders/page.tsx`, and `jobs/page.tsx`.
- [x] Remove Unsplash model photo from `src/lib/data/id-card-mapper.ts`.
- [x] Run `npm run build` to verify clean compilation.

---

# GitHub Issue #3: Admin Table Skeleton Loaders & Eliminating False Empty-State Flashes Across All Sidebar Pages

## 1. Feature Overview & Problem Statement
When an Administrator navigates through the Admin Console sidebar (e.g., clicking **Users**, **Businesses**, **Products**, **Adverts**, **Orders**, or **Vacancies**), the page immediately flashes an **"Empty State"** notification:
> *"No users found. Try changing your search query or role filter."*
> *"No businesses match filters."*

Then, 400ms to 1200ms later when the database network response arrives, the empty state abruptly disappears and the data table pops into view.

### The Root Cause:
1. **Premature Array Evaluation:** The table data state starts as `[]`. In JSX, the component checks `{filtered.length === 0 ? <EmptyState /> : <table>}` without checking if data is currently loading.
2. **`isLoading` Defaults to `false`:** In several pages (`users`, `orders`), `isLoading` was initialized to `false`. In others (`marketplace`, `adverts`, `jobs`), there wasn't even an `isLoading` variable.
3. **No Skeleton Component in `AdminUI`:** There are zero table skeleton or placeholder components anywhere in `src/components/admin/AdminUI.tsx`, forcing pages to render either the table or the empty box.

---

## 2. Architectural Blueprint: 3-State Data Table Lifecycle

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

---

## 4. Implementation Checklist for Issue #3
- [x] Add `<TableSkeleton />` to `src/components/admin/AdminUI.tsx`.
- [x] Update `src/app/admin/users/page.tsx`: Set `isLoadingUsers(true)` by default; render `<TableSkeleton />`.
- [x] Update `src/app/admin/businesses/page.tsx`: Wire `isLoading` state to `<TableSkeleton />`.
- [x] Update `src/app/admin/marketplace/page.tsx`: Introduce `isLoading` state and `<TableSkeleton />`.
- [x] Update `src/app/admin/adverts/page.tsx`: Introduce `isLoading` state and `<TableSkeleton />`.
- [x] Update `src/app/admin/orders/page.tsx`: Set `loading(true)` by default; render `<TableSkeleton />`.
- [x] Update `src/app/admin/jobs/page.tsx`: Introduce `isLoading` state and `<TableSkeleton />`.
- [x] Update `src/app/admin/id-cards/page.tsx`: Introduce `isLoading` state and `<TableSkeleton />`.
- [x] Update `src/app/admin/messages/page.tsx`: Introduce `isLoading` state and `<TableSkeleton />`.
- [x] Verify zero "Empty State" flashes occur on load across all admin pages.

---

# GitHub Issue #4: Admin Security Hardening: Password-Protected Suspend/Delete Actions & Threat State Badges

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
* Renders a secure password input (`type="password"`) with eye-toggle visibility.
* "Authorize & Proceed" button disabled until password has at least 6 characters.

### C. Backend Password Verification Endpoint (`POST /api/v1/auth/verify-password`)
* Compares submitted password with `caller.password_hash` using `bcrypt.compare()`.
* Returns `200 { valid: true }` if correct; `401 { error: 'Invalid administrator credentials' }` if incorrect.

### D. User Account Deletion Feature in UI
* Add a **"Delete Account"** button in [`src/app/admin/users/page.tsx`](file:///home/levibliz/Desktop/LeviOnChain/Sadza_Conneect/src/app/admin/users/page.tsx) inside the User Details Modal.
* Clicking opens `<AdminPasswordConfirmationModal />`.
* Upon verified password input, executes `DELETE /api/v1/users/${user.id}`.
* Automatically cascades: deactivates any businesses and products owned by that user.

---

## 4. Implementation Checklist for Issue #4
- [x] Update table status rendering in `src/app/admin/users/page.tsx`: Suspended -> Red badge with `<ShieldAlert />`; Active -> Green badge with `<CheckCircle2 />`.
- [x] Build `<AdminPasswordConfirmationModal />` in `src/components/admin/AdminUI.tsx`.
- [x] Implement `POST /api/v1/auth/verify-password` using bcrypt compare against active admin session.
- [x] Add "Delete Account" button in `src/app/admin/users/page.tsx`.
- [x] Wire Suspend, Reactivate, Delete User, and Promote Admin buttons to trigger `<AdminPasswordConfirmationModal />`.
- [x] Wire Delete Business in `src/app/admin/businesses/page.tsx` to trigger `<AdminPasswordConfirmationModal />`.
- [x] Ensure deleting/suspending a user automatically hides their active listings from public search.

---

# GitHub Issue #5: Admin Settings API Authorization & Password Rotation Pipeline

## 1. Feature Overview & Problem Statement
The Admin Settings page ([`/admin/settings`](file:///home/levibliz/Desktop/LeviOnChain/Sadza_Conneect/src/app/admin/settings/page.tsx)) controls core platform configuration: company profile, USD/ZiG rates, standard listing prices ($10/mo & $20/mo), 30-day grace duration, logistics hub addresses, verification toggles, and administrator password rotation.

However, two critical bugs prevent settings from functioning:
1. **Missing Authorization Header in Settings Save:**
   Inside `handleSave()` at line 310, `fetch('/api/v1/settings', { method: 'PUT', ... })` **does not pass `Authorization: Bearer <token>`**! The backend route `PUT /api/v1/settings` checks `user.role === 'admin'`. Because no token is sent, the server immediately returns `401 Unauthorized`. The error is caught silently in the console, while a green toast tells the Admin *"Settings Saved"*. **No changes are ever persisted to PostgreSQL!**
2. **Fake Password Rotation Handler:**
   Line 351 (`handlePasswordUpdate`) only checks if `security.next === security.confirm`, clears the form, and shows a toast. **It never calls an API!** An administrator cannot rotate their credentials.

---

## 2. Technical Implementation Specifications

### A. Fix `fetch('/api/v1/settings')` Authorization Header
Update [`src/app/admin/settings/page.tsx`](file:///home/levibliz/Desktop/LeviOnChain/Sadza_Conneect/src/app/admin/settings/page.tsx):
```typescript
const token = typeof window !== 'undefined' ? localStorage.getItem('sadza_access_token') : null;

await fetch('/api/v1/settings', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  credentials: 'include',
  body: JSON.stringify(payload),
});
```
* If the API returns non-200, display an error toast and rollback local state.

### B. Implement Real Backend Password Rotation (`POST /api/v1/auth/change-password`)
* **Endpoint:** `POST /api/v1/auth/change-password`
* **Zod Schema:**
  ```typescript
  const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  });
  ```
* **Backend Logic:**
  1. Authenticates caller from JWT Bearer token.
  2. Fetches user record and verifies `currentPassword` with `bcrypt.compare()`.
  3. Hashes `newPassword` with bcrypt (cost factor 12).
  4. Updates `password_hash` in `users` table.
  5. Invalidates old refresh tokens and returns fresh tokens.
* **Frontend Connection:** Wire `handlePasswordUpdate` in `src/app/admin/settings/page.tsx` to call this endpoint with active feedback.

---

## 3. Implementation Checklist for Issue #5
- [x] Add `Authorization: Bearer <token>` and `credentials: 'include'` to `PUT /api/v1/settings` call in `src/app/admin/settings/page.tsx`.
- [x] Ensure non-200 responses trigger an error toast rather than a false success message.
- [x] Create `POST /api/v1/auth/change-password` API route with bcrypt verification.
- [x] Connect `handlePasswordUpdate` in `src/app/admin/settings/page.tsx` to `POST /api/v1/auth/change-password`.
- [x] Test password change end-to-end: verify old password no longer logs in, new password works.

---

# GitHub Issue #6: Admin Receipts, Invoices & Customer Inquiries Pipeline

## 1. Feature Overview & Problem Statement
Currently, two vital operational areas of the Admin Console are completely severed from the database:
1. **Commercial Tax Receipts Tab ([`/admin/bill-payments`](file:///home/levibliz/Desktop/LeviOnChain/Sadza_Conneect/src/app/admin/bill-payments/page.tsx)):**
   Tab 1 ("Commercial Tax Receipts") never calls `/api/v1/invoices`. When an Admin creates a receipt via `handleSaveReceipt()`, it only appends to React state memory. **When the Admin refreshes the page or changes tabs, every created receipt vanishes.** Real invoices generated by merchant subscriptions never appear here.
2. **Customer Messages & Inquiries ([`/admin/messages`](file:///home/levibliz/Desktop/LeviOnChain/Sadza_Conneect/src/app/admin/messages/page.tsx)):**
   When a user submits the public contact form on `/contact`, [`src/app/contact/page.tsx`](file:///home/levibliz/Desktop/LeviOnChain/Sadza_Conneect/src/app/contact/page.tsx) only sets `submitted = true`. **It never sends an API request!** The message is discarded. The Admin Messages page has zero `fetch()` calls and remains permanently empty. Replying to a message only displays a toast without emailing the client.

---

## 2. Technical Implementation Specifications

### A. Receipts & Billing Database Connection (`src/app/admin/bill-payments/page.tsx`)
1. **Load Invoices from PostgreSQL:**
   Update `useEffect` in `admin/bill-payments/page.tsx` to fetch `GET /api/v1/invoices?limit=100` alongside `/api/v1/bills`.
2. **Persist Manual Receipts:**
   Update `handleSaveReceipt()` to send `POST /api/v1/invoices` with customer details, line items, VAT rate, and total amount.
3. **Printable / Downloadable PDF Tax Invoice:**
   Render a clean printable commercial tax receipt with QR code verification and ZIMRA tax breakdown.

### B. Public Contact Form to Database Pipeline (`src/app/contact/page.tsx`)
1. **Database Schema:** Create `contact_messages` table in PostgreSQL:
   ```sql
   CREATE TABLE IF NOT EXISTS contact_messages (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL,
     phone VARCHAR(50),
     topic VARCHAR(100) NOT NULL,
     message TEXT NOT NULL,
     status VARCHAR(50) DEFAULT 'New',
     priority VARCHAR(50) DEFAULT 'Normal',
     admin_notes TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```
2. **API Routes:**
   - `POST /api/v1/messages` (Public): Validates submission and inserts into `contact_messages`.
   - `GET /api/v1/messages` (Admin Authenticated): Returns list of messages with filtering.
   - `PATCH /api/v1/messages/[id]` (Admin Authenticated): Updates status (`New`, `In Progress`, `Resolved`).
   - `POST /api/v1/messages/[id]/reply`: Dispatches reply email to customer and marks ticket `Resolved`.
3. **Connect `/admin/messages/page.tsx`:** Wire `useEffect` to fetch from `GET /api/v1/messages` and wire `sendReply` to `POST /api/v1/messages/[id]/reply`.

---

## 3. Implementation Checklist for Issue #6
- [x] Connect `src/app/admin/bill-payments/page.tsx` to `GET /api/v1/invoices` on mount.
- [x] Update `handleSaveReceipt` to persist manual receipts via `POST /api/v1/invoices`.
- [x] Create `contact_messages` migration in PostgreSQL.
- [x] Implement `POST /api/v1/messages`, `GET /api/v1/messages`, and `PATCH /api/v1/messages/[id]`.
- [x] Wire `src/app/contact/page.tsx` submission to call `POST /api/v1/messages`.
- [x] Wire `src/app/admin/messages/page.tsx` to load live messages and dispatch real email replies.

---

# GitHub Issue #7: Admin Orders, Careers & ID Cards Operational Polish

## 1. Feature Overview & Problem Statement
1. **ID Cards PVC Print Bug ([`/admin/id-cards`](file:///home/levibliz/Desktop/LeviOnChain/Sadza_Conneect/src/app/admin/id-cards/page.tsx)):**
   Clicking "Print PVC ID Card" calls `window.print()` without `@media print` CSS isolation. The printer attempts to print the entire admin console webpage (sidebar, topbar, background) rather than just the front and back of the PVC badge.
2. **Jobs Hiring Status & CV Viewing ([`/admin/jobs`](file:///home/levibliz/Desktop/LeviOnChain/Sadza_Conneect/src/app/admin/jobs/page.tsx)):**
   Clicking "Send Formal Job Offer" sets the candidate application status to `'Shortlisted'` instead of `'Hired'`. In addition, candidate CVs are only shown as static text filenames without a functional download/view link to Cloudflare R2 storage.
3. **Orders API Authorization ([`/admin/orders`](file:///home/levibliz/Desktop/LeviOnChain/Sadza_Conneect/src/app/admin/orders/page.tsx)):**
   `PATCH` and `DELETE` routes on `/api/v1/orders/[orderNumber]` currently lack admin authorization checks.

---

## 2. Technical Implementation Specifications

### A. ID Card `@media print` CSS Isolation
In `src/app/admin/id-cards/page.tsx` (and global print styles):
```css
@media print {
  body * {
    visibility: hidden;
  }
  #pvc-card-printable, #pvc-card-printable * {
    visibility: visible;
  }
  #pvc-card-printable {
    position: fixed;
    left: 0;
    top: 0;
    width: 85.6mm; /* Standard CR80 PVC card size */
    height: 53.98mm;
    margin: 0;
    padding: 0;
  }
}
```

### B. Fix Job Hiring Logic & Cloudflare R2 CV Links (`src/app/admin/jobs/page.tsx`)
1. In `handleConfirmHire()` (line 373), set `updateAppStatus(hireModalApp.id, 'Hired')`.
2. Connect `cv_file_url` so clicking the candidate's CV opens/downloads the real document from Cloudflare R2 or local storage.

### C. Add Admin Guards to Orders API
Add `getAuthenticatedUser(req, true)` with `role === 'admin'` check to `PATCH` and `DELETE` in `src/app/api/v1/orders/[orderNumber]/route.ts`.

---

## 3. Implementation Checklist for Issue #7
- [x] Add `@media print` CR80 card isolation styles to ID Card print preview.
- [x] Fix `handleConfirmHire` in `src/app/admin/jobs/page.tsx` to set status `'Hired'`.
- [x] Add functional CV download link to candidate application drawer.
- [x] Add admin authentication guards to `src/app/api/v1/orders/[orderNumber]/route.ts`.

---

# GitHub Issue #8: Full Multi-Page CMS (Homepage, About Us & Contact Us) & Live Database Persistence Sync

## 1. Feature Overview & Problem Statement
In the Admin Console ([`/admin/content`](file:///home/levibliz/Desktop/LeviOnChain/Sadza_Conneect/src/app/admin/content/page.tsx)), the CMS allows Administrators to customize copy, headlines, value propositions, imagery, mission statements, and contact details across three core public pages:
1. **Homepage (`/`)**
2. **About Us Page (`/about`)**
3. **Contact Us Page (`/contact`)**

Currently, saving changes in this interface **fails to update the public site** because `handleSave()` only writes to browser `localStorage`, leaves multi-item sections (slides, why reasons, process steps, core values) in temporary component state, and public pages contain hardcoded text rather than reading from database settings.

---

## 2. Multi-Page Scope & Content Specifications

### A. Page 1: Homepage (`/`)
* **Top Announcement Bar:** Announcement copy, active display toggle, and link target.
* **Hero Section:** National Eyebrow, Main Headline (`hero_headline`), Subtitle/Tagline (`hero_subtitle`), and Primary Call-to-Action button label.
* **Featured Commercial Showcase Banners (`home_slides`):** Array of banner cards (Image URL, Sector Tag, Alt/Caption, Destination URL).
* **Why Choose Us Value Propositions (`why_reasons`):** 4 customizable value pillars (Title, Body description).
* **How It Works Workflow Steps (`process_steps`):** 4 numbered onboarding and trading steps (Step Number, Title, Body).

### B. Page 2: About Us (`/about`)
* **Corporate Overview Eyebrow & Main Headline (`about_headline`):** Displayed prominently on the corporate header.
* **Commercial Mission Statement (`about_mission`):** Detailed mission copy.
* **National Mandate & Vision Statement (`about_vision`):** Detailed vision copy.
* **Core Operational Values (`core_values`):** 4 operational pillars (Pillar Title, Body description).

### C. Page 3: Contact Us (`/contact`) & Global Footer
* **Official Support Email (`support_email`):** Updates contact form destination, header badges, and footer.
* **Primary Telephone Line (`support_phone`):** Click-to-call links across the website.
* **Official WhatsApp Desk Number (`support_whatsapp`):** Generates live click-to-WhatsApp support links.
* **Headquarters Physical Depot Address (`hq_address`):** Physical location copy displayed on the map card and footer.

---

## 3. Database Schema & API Specifications

### A. Database Migration: `platform_settings`
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
1. **`GET /api/v1/cms` (Public, Cached):** Returns structured CMS content for `/`, `/about`, and `/contact`.
2. **`PATCH /api/v1/cms` (Admin Authenticated):** Commits CMS updates directly to PostgreSQL.

---

## 4. Implementation Checklist for Issue #8
- [x] Add CMS columns to `platform_settings` table in PostgreSQL.
- [x] Implement `GET /api/v1/cms` and `PATCH /api/v1/cms` routes.
- [x] Connect `src/app/admin/content/page.tsx` to `PATCH /api/v1/cms` on save.
- [x] Dynamically bind `Hero.tsx` and `AnnouncementBar.tsx` to database CMS.
- [x] Dynamically bind `src/app/about/page.tsx` and `src/app/contact/page.tsx` to database CMS.
- [x] Test live updates: edit copy in Admin -> verify immediate update on public pages.

---

# GitHub Issue #9: Dynamic Catalog Quotas, Automated Tier Expansion & Dynamic Admin Pricing Controls

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

---

## 4. Technical Architecture & Database Schema

### A. Database Migrations
1. **`businesses` Table Updates:**
   * `product_limit` (`INTEGER`, default `25`, `NOT NULL`)
   * `catalog_tier` (`VARCHAR(50)`, default `'starter'`, `NOT NULL`)
   * `custom_product_limit` (`INTEGER`, nullable)
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
const effectiveLimit =
  business.custom_product_limit ??
  business.product_limit ??
  settings.tier_starter_limit ?? 25;

const [{ count }] = await db('products')
  .where({ business_id: targetBusinessId, is_active: true })
  .count('id as count');

if (Number(count) >= effectiveLimit) {
  throw new ValidationError(
    `Catalog limit of ${effectiveLimit} products reached. Please upgrade your storefront tier in your dashboard to list additional products.`
  );
}
```

---

## 5. Implementation Checklist for Issue #9
- [x] Add quota and tier columns to `businesses` and `platform_settings` tables in PostgreSQL.
- [x] Add tier quota & pricing form to `src/app/admin/settings/page.tsx`.
- [x] Add custom quota override input to `src/app/admin/businesses/page.tsx`.
- [x] Implement quota enforcement in `src/app/api/v1/products/route.ts` (`POST`).
- [x] Build catalog usage meter and **Expand Catalog** modal in `src/app/dashboard/business/page.tsx`.
- [x] Connect Paynow/EcoCash/InnBucks upgrade checkout with automatic quota elevation.
- [x] Dynamically render tier limits and prices in public `/pricing`.
- [x] Run full Next.js production build (`npm run build`).
