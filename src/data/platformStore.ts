import {
  BusinessListing,
  MarketplaceProduct,
  JobOpening,
} from '@/lib/data/zimbabwe';

export interface PlatformSettings {
  siteName: string;
  tagline: string;
  announcementText: string;
  usdToZigRate: number;
  monthlySubscriptionPriceUsd: number;
  soloMonthlyPriceUsd?: number;
  coopMonthlyPriceUsd?: number;
  corporateMonthlyPriceUsd?: number;
  sponsoredAdvertPriceUsd: number;
  freeGracePeriodDays: number;
  supportWhatsApp: string;
  supportPhone: string;
  supportEmail: string;
  hqAddress: string;
  harareAddress: string;
  operatingHours: string;
  autoApproveTier1: boolean;
  requireEmailVerification: boolean;
  allowPublicReviews: boolean;
  aboutHeadline: string;
  aboutMission: string;
  aboutVision: string;
  vatPct?: number;
  zesaServiceFeePct?: number;
  ecocashMerchantCode?: string;
  innbucksMerchantCode?: string;
  homepageSlotsCap?: number;
  shipping?: any;
  verification?: any;
  notifications?: any;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  siteName: 'Sadza Connect',
  tagline: 'Connecting People, Businesses & Opportunities Across Zimbabwe',
  announcementText:
    'New Business Registrations Receive a 30-Day Free Grace Period • Active Monthly Listing $10/mo • Direct WhatsApp Trade',
  usdToZigRate: 26.5,
  monthlySubscriptionPriceUsd: 15,
  soloMonthlyPriceUsd: 5,
  coopMonthlyPriceUsd: 10,
  corporateMonthlyPriceUsd: 15,
  sponsoredAdvertPriceUsd: 20,
  freeGracePeriodDays: 30,
  supportWhatsApp: '263771000000',
  supportPhone: '+263 77 100 0000',
  supportEmail: 'support@sadzaconnect.co.zw',
  hqAddress: 'Africdominion House, 5th Street, Central Business District, Midlands',
  harareAddress: 'Eastlea Commercial Park, Samora Machel Avenue, Harare',
  operatingHours: 'Monday – Friday: 08:00 – 17:00 CAT • Saturday: 08:00 – 13:00 CAT',
  autoApproveTier1: false,
  requireEmailVerification: true,
  allowPublicReviews: true,
  aboutHeadline: 'National Commercial Directory, Marketplace & Utility Settlement Platform',
  aboutMission:
    'To provide every legitimate enterprise in Zimbabwe—from independent sole proprietors and cooperatives to incorporated companies—with verified digital visibility, direct WhatsApp customer inquiries, and transparent marketplace commerce.',
  aboutVision:
    'To serve as Zimbabwe’s primary commercial registry and trade infrastructure across all 10 provinces, connecting local suppliers with domestic and diaspora buyers.',
};

export interface UtilityReceipt {
  id: string;
  reference: string;
  service: 'ZESA Prepaid Token' | 'Municipal Water' | 'DStv Subscription';
  accountOrMeter: string;
  customerPhone: string;
  currency: 'USD' | 'ZiG';
  amount: number;
  tokenOrConfirmation: string;
  unitsOrPackage: string;
  date: string;
  status: 'Completed' | 'Verified';
}

export const DEFAULT_UTILITY_RECEIPTS: UtilityReceipt[] = [];

export interface JobApplicationRecord {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  province: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  experienceSummary: string;
  cvFileName: string;
  appliedDate: string;
  status: 'Submitted' | 'Under Review' | 'Shortlisted';
}

export const DEFAULT_JOB_APPLICATIONS: JobApplicationRecord[] = [];

export interface BusinessSubscriptionInvoice {
  id: string;
  invoiceNumber: string;
  businessId: string;
  businessName: string;
  planType:
    | 'Monthly Business Listing ($10/mo)'
    | 'Sponsored Product Advert ($20/mo)'
    | 'Enterprise Duo Listing & Advert ($25/mo)'
    | string;
  amountUsd: number;
  paymentMethod: 'EcoCash USD' | 'InnBucks' | 'Visa / Mastercard' | 'Bank Transfer';
  date: string;
  periodCovered: string;
  status: 'Paid' | 'Pending';
}

export const DEFAULT_SUBSCRIPTION_INVOICES: BusinessSubscriptionInvoice[] = [];

export interface PlatformUserRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'Super Admin' | 'Business Owner' | 'Regular User';
  businessName?: string;
  province: string;
  status: 'Active' | 'Suspended';
  joinedDate: string;
}

export const DEFAULT_PLATFORM_USERS: PlatformUserRecord[] = [];

const KEYS = {
  SETTINGS: 'sadza_platform_settings_v1',
  BUSINESSES: 'sadza_platform_businesses_v1',
  PRODUCTS: 'sadza_platform_products_v1',
  JOBS: 'sadza_platform_jobs_v1',
  UTILITY_RECEIPTS: 'sadza_platform_utility_receipts_v1',
  JOB_APPLICATIONS: 'sadza_platform_job_apps_v1',
  INVOICES: 'sadza_platform_invoices_v1',
  USERS: 'sadza_platform_users_v1',
  SAVED_BUSINESS_IDS: 'sadza_saved_businesses_v1',
  SAVED_PRODUCT_IDS: 'sadza_saved_products_v1',
};

const MOCK_ID_REGEX = /^(b[1-6]|p[1-8]|ad-[1-4]|job-[1-4]|j[1-3]|app-[1-2]|inv-10[1-3]|ut-[1-3]|usr-[1-6])$/;

function notifyPlatformUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sadza-platform-updated'));
  }
}

if (typeof window !== 'undefined') {
  try {
    const PURGE_KEY = 'sadza_v4_strict_clean_applied';
    if (!window.localStorage.getItem(PURGE_KEY)) {
      window.localStorage.removeItem('sadza_businesses');
      window.localStorage.removeItem('sadza_products');
      window.localStorage.removeItem('sadza_jobs');
      window.localStorage.removeItem('sadza_paid_adverts_v1');
      window.localStorage.removeItem('sadza_platform_businesses_v1');
      window.localStorage.removeItem('sadza_platform_products_v1');
      window.localStorage.removeItem('sadza_platform_jobs_v1');
      window.localStorage.removeItem('sadza_platform_utility_receipts_v1');
      window.localStorage.removeItem('sadza_platform_job_apps_v1');
      window.localStorage.removeItem('sadza_platform_invoices_v1');
      window.localStorage.removeItem('sadza_platform_users_v1');
      window.localStorage.setItem(PURGE_KEY, 'true');
    }
  } catch {}
}

function loadItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    notifyPlatformUpdate();
  } catch {
    // ignore storage quota errors
  }
}

export function getPlatformSettings(): PlatformSettings {
  return loadItem(KEYS.SETTINGS, DEFAULT_PLATFORM_SETTINGS);
}

export function savePlatformSettings(settings: PlatformSettings): void {
  saveItem(KEYS.SETTINGS, settings);
}

export function getStoredBusinesses(): BusinessListing[] {
  const list = loadItem<BusinessListing[]>(KEYS.BUSINESSES, []);
  if (!Array.isArray(list)) return [];
  return list.filter((item) => item?.id && !MOCK_ID_REGEX.test(item.id));
}

export function saveStoredBusinesses(list: BusinessListing[]): void {
  saveItem(KEYS.BUSINESSES, list.filter((item) => item?.id && !MOCK_ID_REGEX.test(item.id)));
}

export function getStoredProducts(): MarketplaceProduct[] {
  const list = loadItem<MarketplaceProduct[]>(KEYS.PRODUCTS, []);
  if (!Array.isArray(list)) return [];
  return list.filter((item) => item?.id && !MOCK_ID_REGEX.test(item.id));
}

export function saveStoredProducts(list: MarketplaceProduct[]): void {
  saveItem(KEYS.PRODUCTS, list.filter((item) => item?.id && !MOCK_ID_REGEX.test(item.id)));
}

export function getStoredJobs(): JobOpening[] {
  const list = loadItem<JobOpening[]>(KEYS.JOBS, []);
  if (!Array.isArray(list)) return [];
  return list.filter((item) => item?.id && !MOCK_ID_REGEX.test(item.id));
}

export function saveStoredJobs(list: JobOpening[]): void {
  saveItem(KEYS.JOBS, list.filter((item) => item?.id && !MOCK_ID_REGEX.test(item.id)));
}

export function getStoredUtilityReceipts(): UtilityReceipt[] {
  const list = loadItem<UtilityReceipt[]>(KEYS.UTILITY_RECEIPTS, DEFAULT_UTILITY_RECEIPTS);
  if (!Array.isArray(list)) return [];
  return list.filter((item) => item?.id && !MOCK_ID_REGEX.test(item.id));
}

export function saveStoredUtilityReceipts(list: UtilityReceipt[]): void {
  saveItem(KEYS.UTILITY_RECEIPTS, list.filter((item) => item?.id && !MOCK_ID_REGEX.test(item.id)));
}

export function getStoredJobApplications(): JobApplicationRecord[] {
  const list = loadItem<JobApplicationRecord[]>(KEYS.JOB_APPLICATIONS, DEFAULT_JOB_APPLICATIONS);
  if (!Array.isArray(list)) return [];
  return list.filter((item) => item?.id && !MOCK_ID_REGEX.test(item.id));
}

export function saveStoredJobApplications(list: JobApplicationRecord[]): void {
  saveItem(KEYS.JOB_APPLICATIONS, list.filter((item) => item?.id && !MOCK_ID_REGEX.test(item.id)));
}

export function getStoredInvoices(): BusinessSubscriptionInvoice[] {
  const list = loadItem<BusinessSubscriptionInvoice[]>(KEYS.INVOICES, DEFAULT_SUBSCRIPTION_INVOICES);
  if (!Array.isArray(list)) return [];
  return list.filter((item) => item?.id && !MOCK_ID_REGEX.test(item.id));
}

export function saveStoredInvoices(list: BusinessSubscriptionInvoice[]): void {
  saveItem(KEYS.INVOICES, list.filter((item) => item?.id && !MOCK_ID_REGEX.test(item.id)));
}

export function getStoredUsers(): PlatformUserRecord[] {
  const list = loadItem<PlatformUserRecord[]>(KEYS.USERS, DEFAULT_PLATFORM_USERS);
  if (!Array.isArray(list)) return [];
  return list.filter((item) => item?.id && !MOCK_ID_REGEX.test(item.id));
}

export function saveStoredUsers(list: PlatformUserRecord[]): void {
  saveItem(KEYS.USERS, list.filter((item) => item?.id && !MOCK_ID_REGEX.test(item.id)));
}

export function getSavedBusinessIds(): string[] {
  const list = loadItem<string[]>(KEYS.SAVED_BUSINESS_IDS, []);
  if (!Array.isArray(list)) return [];
  return list.filter((id) => !MOCK_ID_REGEX.test(id));
}

export function toggleSavedBusinessId(id: string): string[] {
  const current = getSavedBusinessIds();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  saveItem(KEYS.SAVED_BUSINESS_IDS, next);
  return next;
}

export function getSavedProductIds(): string[] {
  const list = loadItem<string[]>(KEYS.SAVED_PRODUCT_IDS, []);
  if (!Array.isArray(list)) return [];
  return list.filter((id) => !MOCK_ID_REGEX.test(id));
}

export function toggleSavedProductId(id: string): string[] {
  const current = getSavedProductIds();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  saveItem(KEYS.SAVED_PRODUCT_IDS, next);
  return next;
}
