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
    | 'Cooperative / Association';
  teamScale?: string;
  subscriptionStatus: 'Paid Subscriber' | 'Month 1 Grace Period' | 'Expired';
  graceDaysRemaining?: number;
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
  cr14Verified: boolean;
  zimraVerified: boolean;
  featured: boolean;
  image: string;
  description: string;
  services: string[];
  tags: string[];
  reviews?: BusinessReview[];
}

export const SAMPLE_BUSINESSES: BusinessListing[] = [
  {
    id: 'b1',
    slug: 'midlands-solar-agro-solutions',
    name: 'Midlands Solar & Power Systems',
    categorySlug: 'solar-clean-energy',
    categoryName: 'Solar & Clean Energy',
    businessType: 'Registered Company (Pvt Ltd)',
    teamScale: '11 – 50 People',
    subscriptionStatus: 'Paid Subscriber',
    rating: 4.9,
    reviewCount: 128,
    province: 'Midlands',
    city: 'Gweru',
    address: '54 Robert Mugabe Way, Central Business District',
    phone: '+263773333444',
    whatsapp: '+263773333444',
    email: 'sales@midlandssolar.co.zw',
    openingHours: 'Mon - Fri: 08:00 - 17:00, Sat: 08:00 - 13:00',
    verifiedTier: 'tier2_corporate',
    cr14Verified: true,
    zimraVerified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80',
    description:
      'Leading supplier and installer of hybrid solar inverters, Tier-1 LiFePO4 lithium battery banks, DC solar borehole pumps, and commercial farm microgrids across Zimbabwe.',
    services: [
      'Commercial & Domestic Solar Installations',
      'Solar Borehole Pump Sizing & Fitting',
      'Lithium Battery Bank Upgrades',
      'Farm & Industrial Power Audits',
    ],
    tags: ['Solar Inverters', 'Borehole Pumps', 'Lithium Batteries', 'CR14 Verified'],
    reviews: [
      {
        id: 'rev-1',
        author: 'Eng. Tafadzwa Moyo',
        role: 'Commercial Farmer',
        rating: 5,
        date: '3 days ago',
        comment: 'Installed a 10kVA Deye hybrid system and 2HP borehole pump at our farm. Clean wiring and reliable after-sales support.',
        reply: 'Thank you Eng. Moyo! We are glad the borehole and packhouse systems are running at 100% capacity.',
      },
      {
        id: 'rev-2',
        author: 'Rudo Chikwanda',
        role: 'Clinic Administrator',
        rating: 5,
        date: '1 week ago',
        comment: 'Delivered genuine Felicity lithium batteries on time with full warranty documentation and ZIMRA fiscal invoice.',
      },
    ],
  },
  {
    id: 'b2',
    slug: 'gavas-traditional-restaurant',
    name: "Gava's Traditional Restaurant & Catering",
    categorySlug: 'restaurants-dining',
    categoryName: 'Restaurants & Dining',
    businessType: 'Registered Company (Pvt Ltd)',
    teamScale: '11 – 50 People',
    subscriptionStatus: 'Paid Subscriber',
    rating: 4.9,
    reviewCount: 218,
    province: 'Harare',
    city: 'Harare',
    address: 'Belgravia Sports Club, Second Street Extension',
    phone: '+263772111222',
    whatsapp: '+263772111222',
    email: 'bookings@gavas.co.zw',
    openingHours: 'Mon - Sun: 10:00 - 22:00',
    verifiedTier: 'tier2_corporate',
    cr14Verified: true,
    zimraVerified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    description:
      'Authentic Zimbabwean cuisine prepared fresh daily: sadza rezviyo, roadrunner chicken, oxtail, mazondo, smoked chimukuyu, and executive corporate catering.',
    services: [
      'Executive Corporate Catering',
      'Traditional Sit-Down Dining',
      'Outdoor Garden Venue Hire',
      'Bulk Smoked Biltong & Chimukuyu Supply',
    ],
    tags: ['Traditional Cuisine', 'Corporate Catering', 'Roadrunner', 'Harare Dining'],
    reviews: [
      {
        id: 'rev-3',
        author: 'Simbarashe Ndoro',
        role: 'Operations Director',
        rating: 5,
        date: '2 days ago',
        comment: 'Handled our 120-delegate AGM lunch flawlessly. Hot food, professional service, and authentic local flavors.',
      },
    ],
  },
  {
    id: 'b3',
    slug: 'batanai-building-hardware',
    name: 'Batanai Building Supplies & Timber',
    categorySlug: 'hardware-construction',
    categoryName: 'Hardware & Construction',
    businessType: 'Registered Company (Pvt Ltd)',
    teamScale: '50+ People',
    subscriptionStatus: 'Paid Subscriber',
    rating: 4.8,
    reviewCount: 94,
    province: 'Bulawayo',
    city: 'Bulawayo',
    address: '88 Belmont Industrial East',
    phone: '+263775666777',
    whatsapp: '+263775666777',
    email: 'orders@batanai.co.zw',
    openingHours: 'Mon - Fri: 07:30 - 16:30, Sat: 07:30 - 12:30',
    verifiedTier: 'tier2_corporate',
    cr14Verified: true,
    zimraVerified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
    description:
      'Direct wholesale distributor of PPC Surebuild & Suracem cement, Chromadek IBR roofing sheets, treated structural pine timber, deformed steel rebar, and plumbing hardware.',
    services: [
      'Bulk Cement & Brick Delivery',
      'Custom Roof Sheet Cutting',
      'Diaspora Building Project Supply Accounts',
      'Structural Timber & Steel Trusses',
    ],
    tags: ['Cement', 'Roofing Sheets', 'Structural Timber', 'Hardware Wholesale'],
  },
  {
    id: 'b4',
    slug: 'mazowe-citrus-agro-supplies',
    name: 'Mazowe Citrus & Agro Supplies',
    categorySlug: 'agriculture-farm-inputs',
    categoryName: 'Agriculture & Farm Inputs',
    businessType: 'Registered Company (Pvt Ltd)',
    teamScale: '11 – 50 People',
    subscriptionStatus: 'Paid Subscriber',
    rating: 4.9,
    reviewCount: 137,
    province: 'Mashonaland Central',
    city: 'Bindura',
    address: 'Mazowe Valley Agro-Industrial Park',
    phone: '+263776777888',
    whatsapp: '+263776777888',
    email: 'sales@mazoweagro.co.zw',
    openingHours: 'Mon - Sat: 07:30 - 17:00',
    verifiedTier: 'tier2_corporate',
    cr14Verified: true,
    zimraVerified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    description:
      'Authorized agricultural depot supplying certified hybrid maize and wheat seed, Compound D and Ammonium Nitrate fertilizers, drip irrigation lines, and crop protection chemicals.',
    services: [
      'Bulk Fertilizer & Seed Dispatch',
      'Drip & Center-Pivot Irrigation Kits',
      'On-Farm Agronomist Soil Audits',
      'Livestock Stockfeeds & Veterinary Remedies',
    ],
    tags: ['Fertilizer', 'Seed Maize', 'Irrigation', 'Agro-Dealer'],
  },
  {
    id: 'b5',
    slug: 'victoria-falls-safari-lodge',
    name: 'Victoria Falls Safari Eco-Lodge',
    categorySlug: 'hotels-tourism',
    categoryName: 'Hotels & Tourism',
    businessType: 'Registered Company (Pvt Ltd)',
    teamScale: '50+ People',
    subscriptionStatus: 'Paid Subscriber',
    rating: 5.0,
    reviewCount: 412,
    province: 'Matabeleland North',
    city: 'Victoria Falls',
    address: 'Stand 471 Squire Cummings Avenue',
    phone: '+263832843211',
    whatsapp: '+263774555666',
    email: 'reservations@vfsl.co.zw',
    openingHours: '24/7 Front Desk & Executive Conferencing',
    verifiedTier: 'tier2_corporate',
    cr14Verified: true,
    zimraVerified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    description:
      'Premier safari lodge and corporate conference venue overlooking a natural wildlife waterhole, offering executive suites, boardroom facilities, and Zambezi sunset cruises.',
    services: [
      'Corporate Conferences & Retreats',
      'Luxury Safari Suites',
      'Airport Transfers & Tour Desk',
      'Boma Executive Dining',
    ],
    tags: ['Conference Venue', 'Safari Lodge', 'Tourism', 'Hospitality'],
  },
  {
    id: 'b6',
    slug: 'eastern-highlands-growers-coop',
    name: 'Eastern Highlands Growers Co-op',
    categorySlug: 'agriculture-farm-inputs',
    categoryName: 'Agriculture & Farm Inputs',
    businessType: 'Cooperative / Association',
    teamScale: '50+ People',
    subscriptionStatus: 'Month 1 Grace Period',
    graceDaysRemaining: 21,
    rating: 4.7,
    reviewCount: 65,
    province: 'Manicaland',
    city: 'Mutare',
    address: '15 Vumba Road Agricultural Depot',
    phone: '+263778999000',
    whatsapp: '+263778999000',
    email: 'coop@easterngrowers.co.zw',
    openingHours: 'Mon - Sat: 08:00 - 17:00',
    verifiedTier: 'tier1_artisan',
    cr14Verified: false,
    zimraVerified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    description:
      'Registered producer cooperative of 85 smallholder farmers supplying export-grade macadamia nuts, Hass avocados, treated gum poles, and pure montane forest honey.',
    services: [
      'Wholesale Macadamia & Avocado Supply',
      'Raw Montane Honey Bulk Packaging',
      'Treated Timber & Fencing Poles',
      'Cooperative Member Input Pooling',
    ],
    tags: ['Cooperative', 'Macadamia', 'Honey', 'Timber Poles'],
  },
  {
    id: 'b7',
    slug: 'first-choice-tech-solutions',
    name: 'First Choice Tech Solutions',
    categorySlug: 'ICT-electronics',
    categoryName: 'ICT & Electronics',
    businessType: 'SME / Partnership',
    teamScale: '2 – 10 People',
    subscriptionStatus: 'Month 1 Grace Period',
    graceDaysRemaining: 18,
    rating: 4.8,
    reviewCount: 53,
    province: 'Harare',
    city: 'Harare',
    address: 'Suite 14, First Street Commercial Centre',
    phone: '+263772111222',
    whatsapp: '+263772111222',
    email: 'sales@firstchoicetech.co.zw',
    openingHours: 'Mon - Sat: 08:00 - 17:30',
    verifiedTier: 'tier1_artisan',
    cr14Verified: false,
    zimraVerified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    description:
      'Commercial IT hardware supplier specializing in HP ProBook, Dell Latitude, and Lenovo ThinkPad business laptops, fiscalized POS terminals, and enterprise network setups.',
    services: [
      'Corporate Laptop Supply & Warranties',
      'Fiscalized POS Terminal Setup',
      'Office Network & Wi-Fi Installations',
      'Hardware Repairs & SSD Upgrades',
    ],
    tags: ['Business Laptops', 'POS Systems', 'ICT Hardware', 'SME Verified'],
  },
  {
    id: 'b8',
    slug: 'msasa-auto-spares-diagnostics',
    name: 'Msasa Auto Spares & Diagnostics',
    categorySlug: 'automotive-spares',
    categoryName: 'Automotive & Spares',
    businessType: 'Sole Proprietor',
    teamScale: '2 – 10 People',
    subscriptionStatus: 'Paid Subscriber',
    rating: 4.7,
    reviewCount: 42,
    province: 'Harare',
    city: 'Harare',
    address: 'Stand 120 Msasa Industrial Area',
    phone: '+263774123987',
    whatsapp: '+263774123987',
    email: 'service@msasaauto.co.zw',
    openingHours: 'Mon - Sat: 08:00 - 18:00',
    verifiedTier: 'tier1_artisan',
    cr14Verified: false,
    zimraVerified: false,
    featured: false,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80',
    description:
      'Specialized suspension kits, OEM service filter packs, computer diagnostics, and gearbox overhauls for Toyota Hilux GD-6, Ford Ranger, and Isuzu commercial fleets.',
    services: [
      'OEM Filter & Service Kits',
      'Heavy-Duty Suspension Upgrades',
      'Computerized Engine Diagnostics',
      'Fleet Maintenance Contracts',
    ],
    tags: ['Hilux Spares', 'Suspension', 'Auto Diagnostics', 'Fleet Service'],
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
    | 'Cooperative / Association';
  sellerPlan: 'Paid Subscriber' | 'Month 1 Free Grace';
  sellerPhone: string;
  sellerVerified: boolean;
  image: string;
  description: string;
  highlights: string[];
  featured?: boolean;
}

export const SAMPLE_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'p1',
    slug: 'deye-5kw-hybrid-inverter-system',
    title: '5kVA Deye Hybrid Solar Inverter + 100Ah Lithium Battery Pack',
    category: 'Solar & Clean Energy',
    province: 'Midlands',
    priceUsd: 1150.0,
    unit: 'Full Kit',
    movementBadge: 'Fast Moving',
    postedAgo: '14 mins ago',
    stockNote: '8 kits remaining in warehouse',
    location: 'Midlands • Nationwide Delivery',
    condition: 'Brand New',
    sellerId: 'b1',
    sellerSlug: 'midlands-solar-agro-solutions',
    sellerName: 'Midlands Solar & Power Systems',
    sellerType: 'Registered Company (Pvt Ltd)',
    sellerPlan: 'Paid Subscriber',
    sellerPhone: '+263773333444',
    sellerVerified: true,
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    description:
      'Complete 5kVA 48V hybrid solar system including a genuine Deye hybrid inverter, 5.12kWh LiFePO4 battery bank, 6x 450W monocrystalline panels, and full AC/DC protection box.',
    highlights: [
      '5-Year manufacturer warranty on inverter and LiFePO4 battery',
      'Powers borehole pump, refrigerators, lighting, and office equipment',
      'Professional installation available across all 10 provinces',
    ],
    featured: true,
  },
  {
    id: 'p2',
    slug: 'compound-d-ammonium-nitrate-fertilizer-50kg',
    title: 'Compound D & Ammonium Nitrate Fertilizer (50kg Bags)',
    category: 'Agriculture & Farm Inputs',
    province: 'Mashonaland Central',
    priceUsd: 34.0,
    unit: 'Per 50kg Bag',
    movementBadge: 'Bulk Stock',
    postedAgo: '32 mins ago',
    stockNote: 'Min order 10 bags • Farm delivery available',
    location: 'Mashonaland Central • Depot Pickup / Delivery',
    condition: 'Brand New',
    sellerId: 'b4',
    sellerSlug: 'mazowe-citrus-agro-supplies',
    sellerName: 'Mazowe Citrus & Agro Supplies',
    sellerType: 'Registered Company (Pvt Ltd)',
    sellerPlan: 'Paid Subscriber',
    sellerPhone: '+263776777888',
    sellerVerified: true,
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    description:
      'Freshly manufactured Compound Dbasal and Ammonium Nitrate (34.5% N) top-dressing fertilizer in moisture-sealed 50kg bags, ready for immediate depot collection or farm truck dispatch.',
    highlights: [
      'Certified nutrient analysis for commercial maize, tobacco & horticulture',
      'Volume discounts available on 5-tonne and 30-tonne loads',
      'ZIMRA fiscal tax invoice issued on all orders',
    ],
    featured: true,
  },
  {
    id: 'p3',
    slug: 'ppc-suracem-cement-50kg-pallet',
    title: 'PPC Surebuild 42.5N Cement & IBR Chromadek Roofing Sheets',
    category: 'Hardware & Construction',
    province: 'Bulawayo',
    priceUsd: 11.5,
    unit: 'Per 50kg Pocket',
    movementBadge: 'Just Arrived',
    postedAgo: '1 hour ago',
    stockNote: 'Direct depot offloading today',
    location: 'Bulawayo • Belmont Industrial Depot',
    condition: 'Brand New',
    sellerId: 'b3',
    sellerSlug: 'batanai-building-hardware',
    sellerName: 'Batanai Building Supplies & Timber',
    sellerType: 'Registered Company (Pvt Ltd)',
    sellerPlan: 'Paid Subscriber',
    sellerPhone: '+263775666777',
    sellerVerified: true,
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
    description:
      'High-strength PPC Surebuild 42.5N structural cement in 50kg pockets alongside 0.40mm and 0.58mm Chromadek IBR roofing sheets cut to exact customer roof specifications.',
    highlights: [
      'Fresh factory batch stored in dry covered warehouse',
      'Crane truck offloading available for site deliveries',
      'Diaspora direct-to-site building material accounts supported',
    ],
    featured: true,
  },
  {
    id: 'p4',
    slug: 'hp-probook-lenovo-thinkpad-core-i7',
    title: 'HP ProBook & Lenovo ThinkPad Core i7 Business Laptops',
    category: 'ICT & Electronics',
    province: 'Harare',
    priceUsd: 340.0,
    unit: 'Each (6-Mo Warranty)',
    movementBadge: 'New Upload',
    postedAgo: '2 hours ago',
    stockNote: '15 units tested & ready',
    location: 'Harare • CBD Showroom',
    condition: 'Certified Used',
    sellerId: 'b7',
    sellerSlug: 'first-choice-tech-solutions',
    sellerName: 'First Choice Tech Solutions',
    sellerType: 'SME / Partnership',
    sellerPlan: 'Month 1 Free Grace',
    sellerPhone: '+263772111222',
    sellerVerified: true,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    description:
      'Executive Grade-A corporate laptops featuring 11th Gen Intel Core i7 processors, 16GB DDR4 RAM, 512GB NVMe SSD storage, backlit keyboards, and licensed Windows 11 Pro.',
    highlights: [
      '6-Month written hardware warranty from Harare showroom',
      'Battery health guaranteed above 85% capacity',
      'Bulk corporate setup and office delivery available',
    ],
    featured: true,
  },
  {
    id: 'p5',
    slug: 'organic-honey-dried-macadamia-nuts',
    title: 'Organic Honey & Dried Macadamia Nuts (Export Grade)',
    category: 'Agriculture & Farm Inputs',
    province: 'Manicaland',
    priceUsd: 6.5,
    unit: 'Per 500g Jar / Pack',
    movementBadge: 'Just Arrived',
    postedAgo: '3 hours ago',
    stockNote: 'Retail & wholesale cartons',
    location: 'Manicaland • Nationwide Courier',
    condition: 'Locally Fabricated',
    sellerId: 'b6',
    sellerSlug: 'eastern-highlands-growers-coop',
    sellerName: 'Eastern Highlands Growers Co-op',
    sellerType: 'Cooperative / Association',
    sellerPlan: 'Month 1 Free Grace',
    sellerPhone: '+263778999000',
    sellerVerified: true,
    image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    description:
      'Pure, unblended Eastern Highlands montane forest honey and vacuum-sealed roasted macadamia kernels harvested directly by cooperative member farms.',
    highlights: [
      '100% pure unheated natural honey with zero additives',
      'Wholesale carton pricing for supermarkets, hotels, and pharmacies',
      'Overnight inter-city courier dispatch available',
    ],
    featured: false,
  },
  {
    id: 'p6',
    slug: 'toyota-hilux-gd6-suspension-service-kits',
    title: 'Toyota Hilux GD-6 & D-4D Suspension & Service Kits',
    category: 'Automotive & Spares',
    province: 'Harare',
    priceUsd: 85.0,
    unit: 'Complete Service Kit',
    movementBadge: 'Fast Moving',
    postedAgo: '4 hours ago',
    stockNote: 'Same-day courier nationwide',
    location: 'Harare • Msasa Industrial',
    condition: 'Brand New',
    sellerId: 'b8',
    sellerSlug: 'msasa-auto-spares-diagnostics',
    sellerName: 'Msasa Auto Spares & Diagnostics',
    sellerType: 'Sole Proprietor',
    sellerPlan: 'Paid Subscriber',
    sellerPhone: '+263774123987',
    sellerVerified: true,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80',
    description:
      'Genuine OEM oil, fuel, air, and cabin filter service kits alongside heavy-duty shock absorbers and ceramic brake pads for Toyota Hilux GD-6, D-4D, and Ford Ranger fleets.',
    highlights: [
      'Genuine OEM specification filters and parts',
      'Workshop fitting available at our Msasa service bay',
      'Same-day dispatch to Bulawayo, Gweru, Mutare, and Masvingo',
    ],
    featured: false,
  },
  {
    id: 'p7',
    slug: 'submersible-solar-water-pump-2hp',
    title: '2.0HP High-Head Brushless Solar Submersible Borehole Pump',
    category: 'Solar & Clean Energy',
    province: 'Midlands',
    priceUsd: 520.0,
    unit: 'Complete Pump + Controller',
    movementBadge: 'Bulk Stock',
    postedAgo: '5 hours ago',
    stockNote: '12 units in stock',
    location: 'Midlands • Gweru Warehouse',
    condition: 'Brand New',
    sellerId: 'b1',
    sellerSlug: 'midlands-solar-agro-solutions',
    sellerName: 'Midlands Solar & Power Systems',
    sellerType: 'Registered Company (Pvt Ltd)',
    sellerPlan: 'Paid Subscriber',
    sellerPhone: '+263773333444',
    sellerVerified: true,
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
    description:
      'Stainless-steel 304 solar borehole submersible pump with MPPT controller, dry-run sensor, and 140m maximum head for farm irrigation and homestead water supply.',
    highlights: [
      'Includes intelligent MPPT solar pump controller and float switches',
      '140-meter maximum head with 6,500L/hour flow rate',
      '2-Year replacement warranty',
    ],
    featured: false,
  },
  {
    id: 'p8',
    slug: 'traditional-dried-meat-chimukuyu-5kg',
    title: 'Smoked Traditional Chimukuyu (Beef Biltong) 5kg Catering Pack',
    category: 'Restaurants & Dining',
    province: 'Harare',
    priceUsd: 45.0,
    unit: 'Per 5kg Vacuum Pack',
    movementBadge: 'Fast Moving',
    postedAgo: '6 hours ago',
    stockNote: 'Prepared fresh daily',
    location: 'Harare • Belgravia Kitchen',
    condition: 'Locally Fabricated',
    sellerId: 'b2',
    sellerSlug: 'gavas-traditional-restaurant',
    sellerName: "Gava's Traditional Restaurant & Catering",
    sellerType: 'Registered Company (Pvt Ltd)',
    sellerPlan: 'Paid Subscriber',
    sellerPhone: '+263772111222',
    sellerVerified: true,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    description:
      'Wood-smoked prime beef chimukuyu and traditional biltong vacuum-sealed in 5kg catering packs for events, lodges, and diaspora parcels.',
    highlights: [
      'Hygienically cured and vacuum-sealed for long shelf life',
      'Available in mild, traditional garlic, or peri-peri seasoning',
      'Same-day Harare delivery',
    ],
    featured: false,
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

export const SAMPLE_JOBS: JobOpening[] = [
  {
    id: 'job-1',
    slug: 'senior-solar-installation-engineer',
    title: 'Solar Technical Sales & Installation Engineer',
    company: 'Midlands Solar & Power Systems',
    companySlug: 'midlands-solar-agro-solutions',
    province: 'Midlands',
    city: 'Gweru',
    type: 'Full-time',
    salaryUsd: '$850 - $1,200 / month',
    postedDate: '2 hours ago',
    category: 'Solar & Clean Energy',
    whatsapp: '+263773333444',
    description:
      'Lead commercial hybrid solar and agricultural borehole pump installations across Midlands and Masvingo commercial farms and industrial sites.',
    requirements: [
      'Degree or National Diploma in Electrical / Power Engineering',
      'Minimum 3 years hands-on experience with Deye, Victron, or Sunsynk inverters',
      'Clean Class 4 Driver License',
    ],
  },
  {
    id: 'job-2',
    slug: 'senior-agronomist-horticulture',
    title: 'Senior Commercial Farm Agronomist',
    company: 'Mazowe Citrus & Agro Supplies',
    companySlug: 'mazowe-citrus-agro-supplies',
    province: 'Mashonaland Central',
    city: 'Bindura',
    type: 'Contract',
    salaryUsd: '$1,000 - $1,500 / month',
    postedDate: '5 hours ago',
    category: 'Agriculture & Farm Inputs',
    whatsapp: '+263776777888',
    description:
      'Provide technical crop nutrition advisory, soil testing interpretation, and irrigation scheduling for commercial maize, wheat, and citrus growers.',
    requirements: [
      'BSc Agriculture / Crop Science or Agronomy',
      'Proven field advisory experience in seed & fertilizer trials',
      'Valid Class 4 Driver License',
    ],
  },
  {
    id: 'job-3',
    slug: 'procurement-hardware-depot-supervisor',
    title: 'Procurement & Hardware Depot Supervisor',
    company: 'Batanai Building Supplies & Timber',
    companySlug: 'batanai-building-hardware',
    province: 'Bulawayo',
    city: 'Bulawayo',
    type: 'Full-time',
    salaryUsd: '$700 - $950 / month',
    postedDate: '1 day ago',
    category: 'Hardware & Construction',
    whatsapp: '+263775666777',
    description:
      'Oversee warehouse stock control, cement and roofing dispatch, supplier reconciliations, and corporate trade counter operations at our Belmont depot.',
    requirements: [
      'Diploma in Purchasing & Supply / Inventory Management',
      'Experience in building hardware or timber yard operations',
      'Proficiency in ERP / Pastel inventory systems',
    ],
  },
  {
    id: 'job-4',
    slug: 'hospitality-operations-supervisor',
    title: 'Lodge Operations & Conferencing Supervisor',
    company: 'Victoria Falls Safari Eco-Lodge',
    companySlug: 'victoria-falls-safari-lodge',
    province: 'Matabeleland North',
    city: 'Victoria Falls',
    type: 'Full-time',
    salaryUsd: '$1,000 - $1,400 / month',
    postedDate: '2 days ago',
    category: 'Hotels & Tourism',
    whatsapp: '+263774555666',
    description:
      'Coordinate corporate conference bookings, international guest hospitality, tour transfers, and front-of-house quality standards.',
    requirements: [
      'Degree or HND in Tourism & Hospitality Management',
      'Minimum 4 years supervisory experience in a 4/5-star lodge or hotel',
      'Excellent guest communication and organizational skills',
    ],
  },
  {
    id: 'job-5',
    slug: 'head-chef-traditional-cuisine',
    title: 'Executive Catering & Traditional Cuisine Chef',
    company: "Gava's Traditional Restaurant & Catering",
    companySlug: 'gavas-traditional-restaurant',
    province: 'Harare',
    city: 'Harare',
    type: 'Full-time',
    salaryUsd: '$650 - $900 / month',
    postedDate: '3 days ago',
    category: 'Restaurants & Dining',
    whatsapp: '+263772111222',
    description:
      'Lead commercial kitchen preparation for high-volume restaurant dining and corporate outside catering across Harare.',
    requirements: [
      'Professional Culinary Arts Certificate or Diploma',
      'Strong track record in high-volume corporate catering & traditional dishes',
      'Strict kitchen hygiene and portion cost control',
    ],
  },
];
