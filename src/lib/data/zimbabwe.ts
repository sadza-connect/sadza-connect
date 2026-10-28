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

export const SAMPLE_BUSINESSES: BusinessListing[] = [
  {
    id: 'biz-mabasa',
    slug: 'mabasa-solar-electrical',
    name: 'Mabasa Solar & Electrical',
    categorySlug: 'solar-clean-energy',
    categoryName: 'Solar & Electrical Solutions',
    businessType: 'Registered Company (Pvt Ltd)',
    subscriptionStatus: 'Paid Subscriber',
    rating: 4.9,
    reviewCount: 128,
    province: 'Harare',
    city: 'Harare',
    address: 'Msasa Commercial Hub, Harare',
    phone: '+263772987654',
    whatsapp: '+263772987654',
    email: 'info@mabasasolar.co.zw',
    openingHours: 'Mon - Fri 08:00 - 17:00, Sat 08:00 - 13:00',
    verifiedTier: 'tier2_corporate',
    cr14Verified: true,
    zimraVerified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=200&q=80',
    description: 'Reliable solar installations, backup power, commercial solar projects and certified electrical services.',
    services: ['Solar Installations', 'Hybrid Inverters', 'Lithium Batteries', 'Electrical Maintenance'],
    tags: ['solar', 'inverter', 'backup power', 'batteries', 'harare'],
  },
  {
    id: 'biz-nyumbani',
    slug: 'nyumbani-home-living',
    name: 'Nyumbani Home & Living',
    categorySlug: 'furniture-home-decor',
    categoryName: 'Furniture & Home Decor',
    businessType: 'Registered Company (Pvt Ltd)',
    subscriptionStatus: 'Paid Subscriber',
    rating: 4.8,
    reviewCount: 84,
    province: 'Bulawayo',
    city: 'Bulawayo',
    address: 'Belmont Industrial, Bulawayo',
    phone: '+263773876543',
    whatsapp: '+263773876543',
    email: 'sales@nyumbani.co.zw',
    openingHours: 'Mon - Fri 08:00 - 17:00, Sat 08:30 - 14:00',
    verifiedTier: 'tier2_corporate',
    cr14Verified: true,
    zimraVerified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=200&q=80',
    description: 'Modern handcrafted Zimbabwean furniture, custom home fittings, interior decor and commercial office setups.',
    services: ['Lounge Suites', 'Solid Teak Dining Sets', 'Commercial Office Desks', 'Custom Kitchens'],
    tags: ['furniture', 'teak', 'interior decor', 'bulawayo', 'home'],
  },
  {
    id: 'biz-zimagro',
    slug: 'zimagro-solutions',
    name: 'ZimAgro Solutions',
    categorySlug: 'agriculture-farm-inputs',
    categoryName: 'Agricultural Inputs & Equipment',
    businessType: 'Registered Company (Pvt Ltd)',
    subscriptionStatus: 'Paid Subscriber',
    rating: 4.9,
    reviewCount: 210,
    province: 'Midlands',
    city: 'Gweru',
    address: 'Main Commercial Way, Gweru',
    phone: '+263774765432',
    whatsapp: '+263774765432',
    email: 'contact@zimagro.co.zw',
    openingHours: 'Mon - Fri 07:30 - 17:00, Sat 08:00 - 13:00',
    verifiedTier: 'tier2_corporate',
    cr14Verified: true,
    zimraVerified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=200&q=80',
    description: 'High-yield hybrid seed varieties, specialized crop fertilizers, irrigation piping and commercial farming implements.',
    services: ['Certified Maize & Soya Seed', 'Drip Irrigation Systems', 'Bulk Compound Fertilizers', 'Livestock Feed'],
    tags: ['agriculture', 'seed', 'fertilizer', 'irrigation', 'farming'],
  },
  {
    id: 'biz-great-zim-hotels',
    slug: 'great-zimbabwe-hotels',
    name: 'Great Zimbabwe Hotels',
    categorySlug: 'hotels-tourism',
    categoryName: 'Hospitality & Tourism',
    businessType: 'Registered Company (Pvt Ltd)',
    subscriptionStatus: 'Paid Subscriber',
    rating: 4.9,
    reviewCount: 312,
    province: 'Harare',
    city: 'Harare',
    address: 'Borrowdale Executive Enclave, Harare',
    phone: '+263775654321',
    whatsapp: '+263775654321',
    email: 'reservations@greatzimhotels.co.zw',
    openingHours: '24 Hours / 7 Days',
    verifiedTier: 'tier2_corporate',
    cr14Verified: true,
    zimraVerified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=200&q=80',
    description: 'Premier business conferencing, heritage luxury accommodation, executive catering and bespoke Zimbabwean safari tours.',
    services: ['Executive Suites', 'Conference Venues', 'Fine Dining Catering', 'Airport Transfers'],
    tags: ['hotel', 'tourism', 'conferences', 'accommodation', 'harare'],
  },
  {
    id: 'biz-tsvaga-auto',
    slug: 'tsvaga-auto-care',
    name: 'Tsvaga Auto Care',
    categorySlug: 'automotive-spares',
    categoryName: 'Vehicle Service & Spares',
    businessType: 'Registered Company (Pvt Ltd)',
    subscriptionStatus: 'Paid Subscriber',
    rating: 4.7,
    reviewCount: 95,
    province: 'Bulawayo',
    city: 'Bulawayo',
    address: 'Kelvin North Auto Precinct, Bulawayo',
    phone: '+263776543210',
    whatsapp: '+263776543210',
    email: 'service@tsvagaauto.co.zw',
    openingHours: 'Mon - Fri 08:00 - 17:30, Sat 08:00 - 13:00',
    verifiedTier: 'tier2_corporate',
    cr14Verified: true,
    zimraVerified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=200&q=80',
    description: 'Comprehensive diagnostic vehicle servicing, suspension rebuilding, heavy truck spare parts and fleet maintenance.',
    services: ['Engine Diagnostics', 'Suspension Overhauls', 'OEM Spare Parts', 'Commercial Fleet Care'],
    tags: ['auto', 'car repair', 'spares', 'mechanic', 'bulawayo'],
  },
  {
    id: 'biz-rufaro-pharmacy',
    slug: 'rufaro-pharmacy',
    name: 'Rufaro Pharmacy',
    categorySlug: 'healthcare-pharmacies',
    categoryName: 'Health & Wellness',
    businessType: 'Registered Company (Pvt Ltd)',
    subscriptionStatus: 'Paid Subscriber',
    rating: 4.9,
    reviewCount: 160,
    province: 'Harare',
    city: 'Harare',
    address: 'Central Avenue Medical Chambers, Harare',
    phone: '+263777432109',
    whatsapp: '+263777432109',
    email: 'dispensary@rufaropharmacy.co.zw',
    openingHours: 'Mon - Sat 08:00 - 20:00, Sun 09:00 - 14:00',
    verifiedTier: 'tier2_corporate',
    cr14Verified: true,
    zimraVerified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1586015555751-63c25a1e285d?auto=format&fit=crop&w=1200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1586015555751-63c25a1e285d?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=200&q=80',
    description: 'Licensed dispensary providing prescription medicines, maternal healthcare, emergency supplies and direct wellness advice.',
    services: ['Prescription Dispensing', 'Medical Diagnostic Supplies', 'Chronic Illness Support', 'Emergency First Aid Kits'],
    tags: ['pharmacy', 'medicine', 'healthcare', 'wellness', 'harare'],
  },
];

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

export const SAMPLE_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'prod-solar-inverter-5kva',
    slug: '5kva-hybrid-solar-inverter',
    title: '5kVA Hybrid Solar Inverter',
    category: 'Energy & Solar',
    province: 'Harare',
    location: 'Harare',
    priceUsd: 1250,
    unit: 'Unit',
    movementBadge: 'Fast Moving',
    postedAgo: '2 hours ago',
    stockNote: 'In Stock',
    condition: 'Brand New',
    sellerId: 'biz-sunvolt',
    sellerSlug: 'sunvolt-systems',
    sellerName: 'SunVolt Systems',
    sellerType: 'Registered Company (Pvt Ltd)',
    sellerPlan: 'Paid Subscriber',
    sellerPhone: '+263772123456',
    sellerVerified: true,
    sellerLogo: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=200&q=80',
    image: 'https://images.unsplash.com/photo-1548611716-ad888c3a50d2?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1548611716-ad888c3a50d2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Deye 5kVA Hybrid Solar Inverter with 48V DC battery input, WiFi monitoring, and dual MPPT tracker. Suitable for commercial and domestic power backup in Zimbabwe.',
    highlights: [
      'Rated Output Power: 5,000 VA (5kVA)',
      'Type: Hybrid (Grid-Tie / Off-Grid)',
      'Battery Voltage: 48 V DC',
      'MPPT Input Voltage: 120 – 500 V DC',
      'Max Solar Input Power: 6,500 W',
      'Communication: WiFi / RS485',
      'Warranty: 5 Years',
      'Condition: Brand New',
    ],
    featured: true,
  },
  {
    id: 'prod-tractor-80hp',
    slug: '80hp-farm-tractor',
    title: '80HP Farm Tractor',
    category: 'Agriculture',
    province: 'Bulawayo',
    location: 'Bulawayo',
    priceUsd: 12800,
    unit: 'Tractor',
    movementBadge: 'Fast Moving',
    postedAgo: '5 hours ago',
    stockNote: 'In Stock',
    condition: 'Brand New',
    sellerId: 'biz-agripro',
    sellerSlug: 'agripro-zimbabwe',
    sellerName: 'AgriPro Zimbabwe',
    sellerType: 'Registered Company (Pvt Ltd)',
    sellerPlan: 'Paid Subscriber',
    sellerPhone: '+263773234567',
    sellerVerified: true,
    sellerLogo: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=200&q=80',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Heavy duty 80HP 4WD agricultural tractor with high clearance, 4-cylinder diesel engine, 3-point hitch, and PTO for ploughing, discing, and commercial transport.',
    highlights: [
      'Engine Power: 80 HP 4-Cylinder Diesel',
      'Drive: 4 Wheel Drive (4WD)',
      'PTO Speed: 540 / 1000 RPM',
      'Hydraulic Output: Dual Remote Valves',
      'Fuel Tank: 120 Litres',
      'Warranty: 2 Years / 2000 Hours',
      'Condition: Brand New',
    ],
    featured: true,
  },
  {
    id: 'prod-ppc-cement',
    slug: 'ppc-surebuild-cement-50kg',
    title: 'PPC Surebuild Cement 50kg',
    category: 'Construction',
    province: 'Harare',
    location: 'Harare',
    priceUsd: 7.5,
    unit: '50kg Bag',
    movementBadge: 'Bulk Stock',
    postedAgo: '1 day ago',
    stockNote: 'In Stock',
    condition: 'Brand New',
    sellerId: 'biz-buildright',
    sellerSlug: 'buildright-supplies',
    sellerName: 'BuildRight Supplies',
    sellerType: 'Registered Company (Pvt Ltd)',
    sellerPlan: 'Paid Subscriber',
    sellerPhone: '+263774345678',
    sellerVerified: true,
    sellerLogo: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=200&q=80',
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'High strength 42.5N general purpose PPC Surebuild cement in 50kg bags. Ideal for bricklaying, structural concrete, foundations, and plastering.',
    highlights: [
      'Strength Class: 42.5N',
      'Packaging: 50kg Weather-sealed Bags',
      'Standard: ZWS ISO 9001 Compliant',
      'Application: Mortar, Plaster & Structural Concrete',
      'Pallet Size: 40 Bags (2 Tonnes)',
      'Condition: Brand New',
    ],
    featured: true,
  },
  {
    id: 'prod-solar-panel-550w',
    slug: '550w-solar-panel-tier-1',
    title: '550W Solar Panel (Tier 1)',
    category: 'Energy & Solar',
    province: 'Harare',
    location: 'Harare',
    priceUsd: 110,
    unit: 'Panel',
    movementBadge: 'Fast Moving',
    postedAgo: '3 hours ago',
    stockNote: 'In Stock',
    condition: 'Brand New',
    sellerId: 'biz-solarhub',
    sellerSlug: 'solarhub-zimbabwe',
    sellerName: 'SolarHub Zimbabwe',
    sellerType: 'Registered Company (Pvt Ltd)',
    sellerPlan: 'Paid Subscriber',
    sellerPhone: '+263775456789',
    sellerVerified: true,
    sellerLogo: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=200&q=80',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548611716-ad888c3a50d2?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Tier-1 Mono-PERC 550W high-efficiency solar panel with 144 half-cut cells, tempered anti-reflective glass, and anodized aluminum frame.',
    highlights: [
      'Peak Power: 550 Watts',
      'Cell Type: Monocrystalline Half-Cell',
      'Efficiency: 21.3%',
      'Max Voltage: 41.95 V',
      'Max Current: 13.12 A',
      'Warranty: 25 Years Linear Output',
      'Condition: Brand New',
    ],
    featured: true,
  },
  {
    id: 'prod-generator-75kva',
    slug: '75kva-petrol-generator',
    title: '7.5kVA Petrol Generator',
    category: 'Tools & Equipment',
    province: 'Harare',
    location: 'Harare',
    priceUsd: 950,
    unit: 'Unit',
    movementBadge: 'New Upload',
    postedAgo: '4 hours ago',
    stockNote: 'In Stock',
    condition: 'Brand New',
    sellerId: 'biz-powerzone',
    sellerSlug: 'powerzone',
    sellerName: 'PowerZone',
    sellerType: 'Registered Company (Pvt Ltd)',
    sellerPlan: 'Paid Subscriber',
    sellerPhone: '+263776567890',
    sellerVerified: true,
    sellerLogo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Heavy duty 7.5kVA key-start petrol generator with digital AVR, 25-litre long-run fuel tank, copper alternator, and heavy wheel trolley.',
    highlights: [
      'Rated Power: 7.0 kVA / Max 7.5 kVA',
      'Starting: Electric Key Start & Recoil',
      'Voltage: 230V 50Hz Single Phase',
      'Fuel Tank: 25 Litres (8-10 Hours Run)',
      'Alternator: 100% Copper Windings',
      'Condition: Brand New',
    ],
    featured: true,
  },
  {
    id: 'prod-deformed-steel-12mm',
    slug: '12mm-deformed-steel-bar',
    title: '12mm Deformed Steel Bar',
    category: 'Construction',
    province: 'Harare',
    location: 'Harare',
    priceUsd: 6.2,
    unit: '12m Length',
    movementBadge: 'Bulk Stock',
    postedAgo: '1 day ago',
    stockNote: 'In Stock',
    condition: 'Brand New',
    sellerId: 'biz-metrosteel',
    sellerSlug: 'metro-steel',
    sellerName: 'Metro Steel',
    sellerType: 'Registered Company (Pvt Ltd)',
    sellerPlan: 'Paid Subscriber',
    sellerPhone: '+263777678901',
    sellerVerified: true,
    sellerLogo: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=200&q=80',
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'High tensile 12mm deformed reinforcing rebar (Y12) in 12-metre standard lengths. Meets Zimbabwe standard for structural reinforced concrete.',
    highlights: [
      'Diameter: 12 mm (Y12)',
      'Length: 12 Metres Standard Bar',
      'Grade: 460 High Tensile Steel',
      'Standard: BS 4449 / ZWS Compliant',
      'Application: Foundations, Beams & Columns',
      'Condition: Brand New',
    ],
    featured: true,
  },
];

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
