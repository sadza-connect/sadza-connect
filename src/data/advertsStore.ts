export interface PaidAdvertItem {
  id: string;
  businessName: string;
  businessType:
    | 'Registered Company (Pvt Ltd)'
    | 'SME / Partnership'
    | 'Sole Proprietor'
    | 'Cooperative / Association'
    | string;
  province: string;
  category: string;
  offerType: 'Bulk / Wholesale' | 'Price Discount' | 'Free Delivery' | 'Special Package';
  headline: string;
  offerText: string;
  promoBadge: string;
  originalPriceUSD?: number;
  promoPriceUSD?: number;
  priceZiG?: number;
  validUntil: string;
  whatsapp: string;
  phone: string;
  image: string;
  featuredOnHome: boolean;
  postedAt: string;
}

export const CLEAN_PROVINCES = [
  'All Provinces',
  'Harare',
  'Bulawayo',
  'Midlands',
  'Manicaland',
  'Masvingo',
  'Mashonaland East',
  'Mashonaland West',
  'Mashonaland Central',
  'Matabeleland North',
  'Matabeleland South',
] as const;

export const COMMERCIAL_SECTORS = [
  { id: 'All', name: 'All Commercial Sectors', label: 'All Commercial Sectors', count: 0 },
  { id: 'Solar & Clean Energy', name: 'Solar & Clean Energy', label: 'Solar & Clean Energy', count: 0 },
  { id: 'Agriculture & Farm Inputs', name: 'Agriculture & Farm Inputs', label: 'Agriculture & Farm Inputs', count: 0 },
  { id: 'Hardware & Construction', name: 'Hardware & Construction', label: 'Hardware & Construction', count: 0 },
  { id: 'Wholesale & FMCG', name: 'Wholesale & FMCG', label: 'Wholesale & FMCG', count: 0 },
  { id: 'ICT & Electronics', name: 'ICT & Electronics', label: 'ICT & Electronics', count: 0 },
  { id: 'Automotive & Spares', name: 'Automotive & Spares', label: 'Automotive & Spares', count: 0 },
  { id: 'Restaurants & Dining', name: 'Restaurants & Dining', label: 'Restaurants & Dining', count: 0 },
  { id: 'Hotels & Tourism', name: 'Hotels & Tourism', label: 'Hotels & Tourism', count: 0 },
  { id: 'Healthcare & Pharmacies', name: 'Healthcare & Pharmacies', label: 'Healthcare & Pharmacies', count: 0 },
  { id: 'Professional Services', name: 'Professional Services', label: 'Professional Services', count: 0 },
  { id: 'Logistics & Transport', name: 'Logistics & Transport', label: 'Logistics & Transport', count: 0 },
  { id: 'Mining & Industrial Equipment', name: 'Mining & Industrial Equipment', label: 'Mining & Industrial Equipment', count: 0 },
  { id: 'Real Estate & Property', name: 'Real Estate & Property', label: 'Real Estate & Property', count: 0 },
  { id: 'Education & Training', name: 'Education & Training', label: 'Education & Training', count: 0 },
  { id: 'Financial & Insurance Services', name: 'Financial & Insurance Services', label: 'Financial & Insurance Services', count: 0 },
  { id: 'Manufacturing & Packaging', name: 'Manufacturing & Packaging', label: 'Manufacturing & Packaging', count: 0 },
  { id: 'Fashion, Textiles & Tailoring', name: 'Fashion, Textiles & Tailoring', label: 'Fashion, Textiles & Tailoring', count: 0 },
  { id: 'Events, Media & Printing', name: 'Events, Media & Printing', label: 'Events, Media & Printing', count: 0 },
  { id: 'Security & Borehole Drilling', name: 'Security & Borehole Drilling', label: 'Security & Borehole Drilling', count: 0 },
  { id: 'Beauty, Salons & Wellness', name: 'Beauty, Salons & Wellness', label: 'Beauty, Salons & Wellness', count: 0 },
] as const;

export const DEFAULT_PAID_ADVERTS: PaidAdvertItem[] = [];

const MOCK_ADVERT_IDS = new Set(['ad-1', 'ad-2', 'ad-3', 'ad-4']);

const ADVERTS_STORAGE_KEY = 'sadza_paid_adverts_v1';
const DELETED_ADVERTS_KEY = 'sadza_deleted_advert_ids_v1';

export function getDeletedAdvertIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_ADVERTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markAdvertDeleted(id: string): void {
  if (typeof window === 'undefined' || !id) return;
  try {
    const current = getDeletedAdvertIds();
    if (!current.includes(id)) {
      localStorage.setItem(DELETED_ADVERTS_KEY, JSON.stringify([...current, id]));
    }
  } catch {}
}

if (typeof window !== 'undefined') {
  try {
    const PURGE_ADVERTS_KEY = 'sadza_v4_adverts_purged';
    if (!window.localStorage.getItem(PURGE_ADVERTS_KEY)) {
      window.localStorage.removeItem(ADVERTS_STORAGE_KEY);
      window.localStorage.setItem(PURGE_ADVERTS_KEY, 'true');
    }
  } catch {}
}

export function loadStoredAdverts(): PaidAdvertItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const deletedIds = new Set(getDeletedAdvertIds());
    const raw = localStorage.getItem(ADVERTS_STORAGE_KEY);
    let list: PaidAdvertItem[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        list = parsed;
      }
    }
    return list.filter((ad) => !deletedIds.has(ad.id) && !MOCK_ADVERT_IDS.has(ad.id));
  } catch {
    return [];
  }
}

export function saveStoredAdverts(adverts: PaidAdvertItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const deletedIds = new Set(getDeletedAdvertIds());
    const filtered = adverts.filter((ad) => !deletedIds.has(ad.id) && !MOCK_ADVERT_IDS.has(ad.id));
    localStorage.setItem(ADVERTS_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('sadza-adverts-updated'));
  } catch {
    // ignore storage errors
  }
}
