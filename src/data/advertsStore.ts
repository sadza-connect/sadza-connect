export interface PaidAdvertItem {
  id: string;
  businessName: string;
  businessType:
    | 'Registered Company (Pvt Ltd)'
    | 'SME / Partnership'
    | 'Sole Proprietor'
    | 'Cooperative / Association';
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
  { id: 'All', name: 'All Commercial Sectors', label: 'All Commercial Sectors', count: 5240 },
  { id: 'Solar & Clean Energy', name: 'Solar & Clean Energy', label: 'Solar & Clean Energy', count: 412 },
  { id: 'Agriculture & Farm Inputs', name: 'Agriculture & Farm Inputs', label: 'Agriculture & Farm Inputs', count: 685 },
  { id: 'Hardware & Construction', name: 'Hardware & Construction', label: 'Hardware & Construction', count: 530 },
  { id: 'Wholesale & FMCG', name: 'Wholesale & FMCG', label: 'Wholesale & FMCG', count: 490 },
  { id: 'ICT & Electronics', name: 'ICT & Electronics', label: 'ICT & Electronics', count: 380 },
  { id: 'Automotive & Spares', name: 'Automotive & Spares', label: 'Automotive & Spares', count: 445 },
  { id: 'Restaurants & Dining', name: 'Restaurants & Dining', label: 'Restaurants & Dining', count: 610 },
  { id: 'Hotels & Tourism', name: 'Hotels & Tourism', label: 'Hotels & Tourism', count: 295 },
  { id: 'Healthcare & Pharmacies', name: 'Healthcare & Pharmacies', label: 'Healthcare & Pharmacies', count: 310 },
  { id: 'Professional Services', name: 'Professional Services', label: 'Professional Services', count: 520 },
  { id: 'Logistics & Transport', name: 'Logistics & Transport', label: 'Logistics & Transport', count: 268 },
  { id: 'Mining & Industrial Equipment', name: 'Mining & Industrial Equipment', label: 'Mining & Industrial Equipment', count: 195 },
  { id: 'Real Estate & Property', name: 'Real Estate & Property', label: 'Real Estate & Property', count: 230 },
  { id: 'Education & Training', name: 'Education & Training', label: 'Education & Training', count: 210 },
  { id: 'Financial & Insurance Services', name: 'Financial & Insurance Services', label: 'Financial & Insurance Services', count: 175 },
  { id: 'Manufacturing & Packaging', name: 'Manufacturing & Packaging', label: 'Manufacturing & Packaging', count: 205 },
  { id: 'Fashion, Textiles & Tailoring', name: 'Fashion, Textiles & Tailoring', label: 'Fashion, Textiles & Tailoring', count: 340 },
  { id: 'Events, Media & Printing', name: 'Events, Media & Printing', label: 'Events, Media & Printing', count: 260 },
  { id: 'Security & Borehole Drilling', name: 'Security & Borehole Drilling', label: 'Security & Borehole Drilling', count: 185 },
  { id: 'Beauty, Salons & Wellness', name: 'Beauty, Salons & Wellness', label: 'Beauty, Salons & Wellness', count: 390 },
] as const;

export const DEFAULT_PAID_ADVERTS: PaidAdvertItem[] = [
  {
    id: 'ad-1',
    businessName: 'Midlands Solar & Power Systems',
    businessType: 'Registered Company (Pvt Ltd)',
    province: 'Midlands',
    category: 'Solar & Clean Energy',
    offerType: 'Special Package',
    headline: 'Zero-Loadshedding Commercial 10kVA Hybrid Solar Package',
    offerText:
      'Complete 10kVA Deye Inverter + 2x 5.12kWh Lithium Batteries + 12x 450W Tier-1 Panels. Includes free nationwide installation and 5-year warranty.',
    promoBadge: 'SAVE $250 USD',
    originalPriceUSD: 2650,
    promoPriceUSD: 2400,
    priceZiG: 63600,
    validUntil: 'Valid 6 days left',
    whatsapp: '263773333444',
    phone: '+263 77 333 3444',
    image:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    featuredOnHome: true,
    postedAt: '2 hours ago',
  },
  {
    id: 'ad-2',
    businessName: 'Batanai Building Supplies & Timber',
    businessType: 'Registered Company (Pvt Ltd)',
    province: 'Bulawayo',
    category: 'Hardware & Construction',
    offerType: 'Free Delivery',
    headline: 'Contractor Bulk Cement & Chromadek Roofing Clearance',
    offerText:
      'Order 100+ bags of PPC Surebuild 42.5N Cement or full roof IBR Chromadek sheets and receive free flatbed site delivery within 40km.',
    promoBadge: 'FREE SITE DELIVERY',
    originalPriceUSD: 12.5,
    promoPriceUSD: 11.2,
    priceZiG: 297,
    validUntil: 'Limited Depot Stock',
    whatsapp: '263775666777',
    phone: '+263 77 566 6777',
    image:
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
    featuredOnHome: true,
    postedAt: '4 hours ago',
  },
  {
    id: 'ad-3',
    businessName: 'Mazowe Citrus & Agro Supplies',
    businessType: 'Registered Company (Pvt Ltd)',
    province: 'Mashonaland Central',
    category: 'Agriculture & Farm Inputs',
    offerType: 'Bulk / Wholesale',
    headline: 'Summer Cropping Seed & Compound D Fertilizer Combo',
    offerText:
      'Pre-book Compound D, Ammonium Nitrate, and certified hybrid maize seed at direct depot wholesale rates for farms and cooperatives.',
    promoBadge: 'WHOLESALE RATE',
    originalPriceUSD: 38,
    promoPriceUSD: 33,
    priceZiG: 875,
    validUntil: 'Valid this month',
    whatsapp: '263776777888',
    phone: '+263 77 677 7888',
    image:
      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    featuredOnHome: true,
    postedAt: '6 hours ago',
  },
  {
    id: 'ad-4',
    businessName: 'First Choice Tech Solutions',
    businessType: 'SME / Partnership',
    province: 'Harare',
    category: 'ICT & Electronics',
    offerType: 'Price Discount',
    headline: 'Corporate Laptop Fleet Upgrade — HP ProBook & ThinkPad i7',
    offerText:
      'Buy 5 or more Grade-A Corporate Core i7 Laptops (16GB RAM / 512GB NVMe SSD) and get 15% off plus 1-year on-site hardware support.',
    promoBadge: '15% CORPORATE OFF',
    originalPriceUSD: 380,
    promoPriceUSD: 320,
    priceZiG: 8480,
    validUntil: '12 units left',
    whatsapp: '263772111222',
    phone: '+263 77 211 1222',
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    featuredOnHome: true,
    postedAt: '1 day ago',
  },
  {
    id: 'ad-5',
    businessName: 'Msasa Auto Spares & Diagnostics',
    businessType: 'Sole Proprietor',
    province: 'Harare',
    category: 'Automotive & Spares',
    offerType: 'Price Discount',
    headline: 'Hilux GD-6, Ranger & Isuzu Full Suspension & Service Kits',
    offerText:
      'Genuine OEM filter kits, heavy-duty shock absorbers, and brake pads with free electronic diagnostic scan on workshop fitment.',
    promoBadge: 'FREE DIAGNOSTICS',
    originalPriceUSD: 110,
    promoPriceUSD: 85,
    priceZiG: 2252,
    validUntil: 'Valid 10 days left',
    whatsapp: '263774123987',
    phone: '+263 77 412 3987',
    image:
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80',
    featuredOnHome: false,
    postedAt: '1 day ago',
  },
  {
    id: 'ad-6',
    businessName: 'Victoria Falls Safari Eco-Lodge',
    businessType: 'Registered Company (Pvt Ltd)',
    province: 'Matabeleland North',
    category: 'Hotels & Tourism',
    offerType: 'Special Package',
    headline: 'Executive Corporate Retreat & Conference Package (3 Nights)',
    offerText:
      'Full conference hall, projector setup, luxury chalet accommodation, and Zambezi sunset cruise for corporate teams of 10+.',
    promoBadge: '20% GROUP DISCOUNT',
    originalPriceUSD: 450,
    promoPriceUSD: 360,
    priceZiG: 9540,
    validUntil: 'Bookings Open',
    whatsapp: '263774555666',
    phone: '+263 83 284 3211',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    featuredOnHome: false,
    postedAt: '2 days ago',
  },
];

const ADVERTS_STORAGE_KEY = 'sadza_paid_adverts_v1';

export function loadStoredAdverts(): PaidAdvertItem[] {
  if (typeof window === 'undefined') return DEFAULT_PAID_ADVERTS;
  try {
    const raw = localStorage.getItem(ADVERTS_STORAGE_KEY);
    if (!raw) return DEFAULT_PAID_ADVERTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_PAID_ADVERTS;
  } catch {
    return DEFAULT_PAID_ADVERTS;
  }
}

export function saveStoredAdverts(adverts: PaidAdvertItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADVERTS_STORAGE_KEY, JSON.stringify(adverts));
    window.dispatchEvent(new Event('sadza-adverts-updated'));
  } catch {
    // ignore storage errors
  }
}
