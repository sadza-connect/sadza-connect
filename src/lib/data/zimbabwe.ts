export interface Province {
  id: string;
  name: string;
  capital: string;
  majorHubs: string[];
  gdpDrivers: string;
  color: string;
}

export const ZIMBABWE_PROVINCES: Province[] = [
  {
    id: 'harare',
    name: 'Harare',
    capital: 'Harare',
    majorHubs: ['CBD', 'Eastlea', 'Borrowdale', 'Msasa Industrial', 'Chitungwiza'],
    gdpDrivers: 'Financial Services, Manufacturing, Commercial Trade & Tech',
    color: '#007a3d',
  },
  {
    id: 'bulawayo',
    name: 'Bulawayo',
    capital: 'Bulawayo',
    majorHubs: ['Belmont Industrial', 'CBD', 'Kelvin North', 'Suburbs'],
    gdpDrivers: 'Heavy Engineering, Textiles, Rail Hub & Cultural Tourism',
    color: '#d97706',
  },
  {
    id: 'midlands',
    name: 'Midlands',
    capital: 'Gweru',
    majorHubs: ['Gweru', 'Kwekwe', 'Zvishavane', 'Gokwe'],
    gdpDrivers: 'Steel, Ferrochrome Mining, Cattle Ranching & Education',
    color: '#005a2b',
  },
  {
    id: 'manicaland',
    name: 'Manicaland',
    capital: 'Mutare',
    majorHubs: ['Mutare', 'Nyanga', 'Chipinge', 'Rusape'],
    gdpDrivers: 'Timber, Macadamia, Tea/Coffee & Cross-Border Logistics',
    color: '#16a34a',
  },
  {
    id: 'masvingo',
    name: 'Masvingo',
    capital: 'Masvingo',
    majorHubs: ['Masvingo Urban', 'Chiredzi', 'Triangle', 'Mashava'],
    gdpDrivers: 'Sugar Cane Plantations, Great Zimbabwe Tourism & Lithium',
    color: '#b45309',
  },
  {
    id: 'mashonaland-east',
    name: 'Mashonaland East',
    capital: 'Marondera',
    majorHubs: ['Marondera', 'Ruwa', 'Goromonzi', 'Mutoko'],
    gdpDrivers: 'Horticulture, Floriculture, Tobacco & Black Granite',
    color: '#007a3d',
  },
  {
    id: 'mashonaland-west',
    name: 'Mashonaland West',
    capital: 'Chinhoyi',
    majorHubs: ['Chinhoyi', 'Kadoma', 'Kariba', 'Norton'],
    gdpDrivers: 'Commercial Maize & Soya, Gold Mining & Kariba Hydro',
    color: '#059669',
  },
  {
    id: 'mashonaland-central',
    name: 'Mashonaland Central',
    capital: 'Bindura',
    majorHubs: ['Bindura', 'Mazowe', 'Shamva', 'Mt Darwin'],
    gdpDrivers: 'Nickel & Gold Mining, Citrus Estates & Seed Maize',
    color: '#047857',
  },
  {
    id: 'matabeleland-north',
    name: 'Matabeleland North',
    capital: 'Lupane',
    majorHubs: ['Victoria Falls', 'Hwange', 'Lupane'],
    gdpDrivers: 'World Tourism, Coal Mining & Thermal Energy',
    color: '#d40000',
  },
  {
    id: 'matabeleland-south',
    name: 'Matabeleland South',
    capital: 'Gwanda',
    majorHubs: ['Beitbridge', 'Gwanda', 'Plumtree'],
    gdpDrivers: 'Gold Mining, Beitbridge Transit Port & Livestock',
    color: '#eab308',
  },
];

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  count: number;
  iconName: string;
  featured?: boolean;
}

export const BUSINESS_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    slug: 'agriculture-farm-inputs',
    name: 'Agriculture & Farm Inputs',
    description: 'Seed maize, fertilizer, irrigation equipment, poultry & livestock feeds',
    count: 289,
    iconName: 'Sprout',
    featured: true,
  },
  {
    id: 'cat-2',
    slug: 'solar-clean-energy',
    name: 'Solar & Clean Energy',
    description: 'Inverters, lithium batteries, borehole solar pumps & solar installations',
    count: 215,
    iconName: 'SunMedium',
    featured: true,
  },
  {
    id: 'cat-3',
    slug: 'hardware-construction',
    name: 'Hardware & Construction',
    description: 'Cement, bricks, structural timber, steel trusses, roofing & plumbing supplies',
    count: 198,
    iconName: 'Building',
    featured: true,
  },
  {
    id: 'cat-4',
    slug: 'restaurants-dining',
    name: 'Restaurants & Dining',
    description: 'Traditional cuisine, contemporary eateries, cafes & corporate catering',
    count: 342,
    iconName: 'Utensils',
    featured: true,
  },
  {
    id: 'cat-5',
    slug: 'ICT-electronics',
    name: 'ICT & Electronics',
    description: 'Business laptops, Starlink & fibre networking, POS systems & enterprise IT',
    count: 176,
    iconName: 'Laptop',
    featured: true,
  },
  {
    id: 'cat-6',
    slug: 'automotive-spares',
    name: 'Automotive & Spares',
    description: 'Vehicle servicing, suspension kits, commercial truck parts & tyre fitment',
    count: 220,
    iconName: 'Car',
    featured: true,
  },
  {
    id: 'cat-7',
    slug: 'hotels-tourism',
    name: 'Hotels & Tourism',
    description: 'Safari lodges, business hotels, conference venues & tour operators',
    count: 147,
    iconName: 'Palmtree',
    featured: true,
  },
  {
    id: 'cat-8',
    slug: 'healthcare-pharmacies',
    name: 'Healthcare & Pharmacies',
    description: 'Private clinics, wholesale & retail pharmacies, diagnostic labs & medical supplies',
    count: 164,
    iconName: 'Stethoscope',
    featured: true,
  },
  {
    id: 'cat-9',
    slug: 'wholesale-fmcg',
    name: 'Wholesale & Retail Supermarkets',
    description: 'Bulk groceries, beverages, household essentials & FMCG distribution',
    count: 204,
    iconName: 'ShoppingBag',
  },
  {
    id: 'cat-10',
    slug: 'logistics-transport',
    name: 'Logistics, Haulage & Courier',
    description: 'Cross-border freight, local courier delivery, cold-chain & warehousing',
    count: 132,
    iconName: 'Truck',
  },
  {
    id: 'cat-11',
    slug: 'mining-industrial',
    name: 'Mining & Industrial Equipment',
    description: 'Compressors, crushers, PPE safety gear, assay labs & heavy machinery',
    count: 118,
    iconName: 'Wrench',
  },
  {
    id: 'cat-12',
    slug: 'professional-services',
    name: 'Professional & Legal Services',
    description: 'Chartered accountants, ZIMRA tax advisory, legal firms & business consultants',
    count: 183,
    iconName: 'Briefcase',
  },
];

export interface BusinessReview {
  id: string;
  author: string;
  role: string;
  rating: number;
  date: string;
  comment: string;
  reply?: string;
}

export interface BusinessListing {
  id: string;
  slug: string;
  name: string;
  tradingName?: string;
  categorySlug: string;
  categoryName: string;
  businessType:
    | 'Registered Company (Pvt Ltd)'
    | 'SME / Partnership'
    | 'Sole Proprietor'
    | 'Cooperative / Association'
    | string;
  onboardingTrack?: 'registered_entity' | 'owner_operated' | 'association_institutional' | string;
  legalForm?: string;
  applicantRole?: string;
  verificationBadge?: string;
  registrationNumber?: string;
  teamScale?: string;
  subscriptionStatus: 'Paid Subscriber' | 'Month 1 Grace Period' | 'Expired';
  customMonthlyPriceUsd?: number | null;
  productLimit?: number;
  catalogTier?: string;
  customProductLimit?: number | null;
  graceDaysRemaining?: number;
  firstVerifiedAt?: string;
  verifiedAt?: string;
  rating: number;
  reviewCount: number;
  province: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  openingHours: string;
  verifiedTier: 'tier1_artisan' | 'tier2_corporate' | 'unverified';
  verificationStatus?: string;
  cr14Verified: boolean;
  zimraVerified: boolean;
  featured: boolean;
  image: string;
  coverImage?: string;
  logoUrl?: string;
  description: string;
  services: string[];
  tags: string[];
  reviews?: BusinessReview[];
  views?: number;
  inquiries?: number;
  kycDocuments?: any[];
}

export const SAMPLE_BUSINESSES: BusinessListing[] = [];

export interface MarketplaceProduct {
  id: string;
  slug: string;
  title: string;
  category: string;
  province: string;
  priceUsd: number;
  unit: string;
  movementBadge: 'Just Arrived' | 'Fast Moving' | 'Bulk Stock' | 'New Upload';
  postedAgo: string;
  stockNote: string;
  location: string;
  condition: 'Brand New' | 'Certified Used' | 'Locally Fabricated';
  sellerId: string;
  sellerSlug: string;
  sellerName: string;
  sellerType:
    | 'Registered Company (Pvt Ltd)'
    | 'SME / Partnership'
    | 'Sole Proprietor'
    | 'Cooperative / Association'
    | string;
  sellerPlan: 'Paid Subscriber' | 'Month 1 Free Grace';
  sellerPhone: string;
  sellerVerified: boolean;
  sellerLogo?: string;
  image: string;
  images?: string[];
  description: string;
  highlights: string[];
  featured?: boolean;
}

export const SAMPLE_PRODUCTS: MarketplaceProduct[] = [];

export interface JobOpening {
  id: string;
  slug: string;
  title: string;
  company: string;
  companySlug?: string;
  province: string;
  city: string;
  type: 'Full-time' | 'Contract' | 'Part-time' | 'Apprenticeship';
  salaryUsd: string;
  postedDate: string;
  category: string;
  whatsapp?: string;
  description: string;
  requirements: string[];
}

export const SAMPLE_JOBS: JobOpening[] = [];
