import {
  SAMPLE_BUSINESSES,
  SAMPLE_PRODUCTS,
  SAMPLE_JOBS,
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
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  siteName: 'Sadza Connect',
  tagline: 'Connecting People, Businesses & Opportunities Across Zimbabwe',
  announcementText:
    'New Business Registrations Receive a 30-Day Free Grace Period • Active Monthly Listing $10/mo • Direct WhatsApp Trade',
  usdToZigRate: 26.5,
  monthlySubscriptionPriceUsd: 10,
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

export const DEFAULT_UTILITY_RECEIPTS: UtilityReceipt[] = [
  {
    id: 'ut-1',
    reference: 'ZETDC-948201',
    service: 'ZESA Prepaid Token',
    accountOrMeter: '37148920194',
    customerPhone: '+263772123456',
    currency: 'USD',
    amount: 25,
    tokenOrConfirmation: '4829 1049 5832 9104 7721',
    unitsOrPackage: '155.0 kWh',
    date: 'Today, 09:42',
    status: 'Completed',
  },
  {
    id: 'ut-2',
    reference: 'MUN-558190',
    service: 'Municipal Water',
    accountOrMeter: 'ACC-883921 (Harare)',
    customerPhone: '+263773112233',
    currency: 'USD',
    amount: 18,
    tokenOrConfirmation: 'WATER-REC-883921',
    unitsOrPackage: 'Monthly Rates & Water Settlement',
    date: 'Yesterday, 16:15',
    status: 'Completed',
  },
  {
    id: 'ut-3',
    reference: 'DSTV-331048',
    service: 'DStv Subscription',
    accountOrMeter: '1029384756',
    customerPhone: '+263712987654',
    currency: 'USD',
    amount: 39,
    tokenOrConfirmation: 'DSTV-COMPACT-ACTIVE',
    unitsOrPackage: 'DStv Compact Bouquet',
    date: '2 days ago',
    status: 'Completed',
  },
];

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

export const DEFAULT_JOB_APPLICATIONS: JobApplicationRecord[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    jobTitle: 'Solar Technical Sales & Installation Engineer',
    companyName: 'Midlands Solar & Power Systems',
    province: 'Midlands',
    applicantName: 'Tinashe Sibanda',
    applicantEmail: 'tinashe.sibanda@gmail.com',
    applicantPhone: '+263773112233',
    experienceSummary: '4 years installing 5kVA–15kVA Deye & Victron hybrid inverter systems.',
    cvFileName: 'Tinashe_Sibanda_Electrical_CV.pdf',
    appliedDate: 'Yesterday',
    status: 'Shortlisted',
  },
  {
    id: 'app-2',
    jobId: 'job-3',
    jobTitle: 'Procurement & Hardware Depot Supervisor',
    companyName: 'Batanai Building Supplies & Timber',
    province: 'Bulawayo',
    applicantName: 'Farai Moyo',
    applicantEmail: 'farai.moyo@outlook.com',
    applicantPhone: '+263774998877',
    experienceSummary: '6 years managing hardware store stock, cement dispatch, and Pastel inventory.',
    cvFileName: 'Farai_Moyo_Procurement_CV.pdf',
    appliedDate: '2 days ago',
    status: 'Under Review',
  },
];

export interface BusinessSubscriptionInvoice {
  id: string;
  invoiceNumber: string;
  businessId: string;
  businessName: string;
  planType: 'Monthly Business Listing ($10/mo)' | 'Sponsored Product Advert ($20/mo)';
  amountUsd: number;
  paymentMethod: 'EcoCash USD' | 'InnBucks' | 'Visa / Mastercard' | 'Bank Transfer';
  date: string;
  periodCovered: string;
  status: 'Paid' | 'Pending';
}

export const DEFAULT_SUBSCRIPTION_INVOICES: BusinessSubscriptionInvoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'SC-INV-2026-084',
    businessId: 'b1',
    businessName: 'Midlands Solar & Power Systems',
    planType: 'Monthly Business Listing ($10/mo)',
    amountUsd: 10,
    paymentMethod: 'EcoCash USD',
    date: '01 Oct 2026',
    periodCovered: '01 Oct 2026 – 31 Oct 2026',
    status: 'Paid',
  },
  {
    id: 'inv-102',
    invoiceNumber: 'SC-INV-2026-089',
    businessId: 'b1',
    businessName: 'Midlands Solar & Power Systems',
    planType: 'Sponsored Product Advert ($20/mo)',
    amountUsd: 20,
    paymentMethod: 'InnBucks',
    date: '03 Oct 2026',
    periodCovered: '03 Oct 2026 – 02 Nov 2026',
    status: 'Paid',
  },
  {
    id: 'inv-103',
    invoiceNumber: 'SC-INV-2026-092',
    businessId: 'b2',
    businessName: "Gava's Traditional Restaurant & Catering",
    planType: 'Monthly Business Listing ($10/mo)',
    amountUsd: 10,
    paymentMethod: 'EcoCash USD',
    date: '04 Oct 2026',
    periodCovered: '04 Oct 2026 – 03 Nov 2026',
    status: 'Paid',
  },
];

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

export const DEFAULT_PLATFORM_USERS: PlatformUserRecord[] = [
  {
    id: 'usr-1',
    fullName: 'Ugwoke Levi',
    email: 'admin@sadzaconnect.co.zw',
    phone: '+263771000001',
    role: 'Super Admin',
    province: 'Harare',
    status: 'Active',
    joinedDate: 'Jan 2026',
  },
  {
    id: 'usr-2',
    fullName: 'Tinowonga Ngozi',
    email: 'director@africdominion.co.zw',
    phone: '+263772000002',
    role: 'Super Admin',
    province: 'Midlands',
    status: 'Active',
    joinedDate: 'Jan 2026',
  },
  {
    id: 'usr-3',
    fullName: 'Simba Nyathi',
    email: 'sales@midlandssolar.co.zw',
    phone: '+263773333444',
    role: 'Business Owner',
    businessName: 'Midlands Solar & Power Systems',
    province: 'Midlands',
    status: 'Active',
    joinedDate: 'Feb 2026',
  },
  {
    id: 'usr-4',
    fullName: 'Farai Gava',
    email: 'bookings@gavas.co.zw',
    phone: '+263772111222',
    role: 'Business Owner',
    businessName: "Gava's Traditional Restaurant & Catering",
    province: 'Harare',
    status: 'Active',
    joinedDate: 'Feb 2026',
  },
  {
    id: 'usr-5',
    fullName: 'Nyasha Mutasa',
    email: 'coop@easterngrowers.co.zw',
    phone: '+263778999000',
    role: 'Business Owner',
    businessName: 'Eastern Highlands Growers Co-op',
    province: 'Manicaland',
    status: 'Active',
    joinedDate: 'Sep 2026',
  },
  {
    id: 'usr-6',
    fullName: 'Tinashe Sibanda',
    email: 'tinashe.sibanda@gmail.com',
    phone: '+263773112233',
    role: 'Regular User',
    province: 'Bulawayo',
    status: 'Active',
    joinedDate: 'Mar 2026',
  },
];

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

function notifyPlatformUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sadza-platform-updated'));
  }
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
  return loadItem(KEYS.BUSINESSES, SAMPLE_BUSINESSES);
}

export function saveStoredBusinesses(list: BusinessListing[]): void {
  saveItem(KEYS.BUSINESSES, list);
}

export function getStoredProducts(): MarketplaceProduct[] {
  return loadItem(KEYS.PRODUCTS, SAMPLE_PRODUCTS);
}

export function saveStoredProducts(list: MarketplaceProduct[]): void {
  saveItem(KEYS.PRODUCTS, list);
}

export function getStoredJobs(): JobOpening[] {
  return loadItem(KEYS.JOBS, SAMPLE_JOBS);
}

export function saveStoredJobs(list: JobOpening[]): void {
  saveItem(KEYS.JOBS, list);
}

export function getStoredUtilityReceipts(): UtilityReceipt[] {
  return loadItem(KEYS.UTILITY_RECEIPTS, DEFAULT_UTILITY_RECEIPTS);
}

export function saveStoredUtilityReceipts(list: UtilityReceipt[]): void {
  saveItem(KEYS.UTILITY_RECEIPTS, list);
}

export function getStoredJobApplications(): JobApplicationRecord[] {
  return loadItem(KEYS.JOB_APPLICATIONS, DEFAULT_JOB_APPLICATIONS);
}

export function saveStoredJobApplications(list: JobApplicationRecord[]): void {
  saveItem(KEYS.JOB_APPLICATIONS, list);
}

export function getStoredInvoices(): BusinessSubscriptionInvoice[] {
  return loadItem(KEYS.INVOICES, DEFAULT_SUBSCRIPTION_INVOICES);
}

export function saveStoredInvoices(list: BusinessSubscriptionInvoice[]): void {
  saveItem(KEYS.INVOICES, list);
}

export function getStoredUsers(): PlatformUserRecord[] {
  return loadItem(KEYS.USERS, DEFAULT_PLATFORM_USERS);
}

export function saveStoredUsers(list: PlatformUserRecord[]): void {
  saveItem(KEYS.USERS, list);
}

export function getSavedBusinessIds(): string[] {
  return loadItem(KEYS.SAVED_BUSINESS_IDS, ['b1', 'b2']);
}

export function toggleSavedBusinessId(id: string): string[] {
  const current = getSavedBusinessIds();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  saveItem(KEYS.SAVED_BUSINESS_IDS, next);
  return next;
}

export function getSavedProductIds(): string[] {
  return loadItem(KEYS.SAVED_PRODUCT_IDS, ['p1', 'p4']);
}

export function toggleSavedProductId(id: string): string[] {
  const current = getSavedProductIds();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  saveItem(KEYS.SAVED_PRODUCT_IDS, next);
  return next;
}
