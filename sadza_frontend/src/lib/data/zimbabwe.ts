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
    name: 'Harare Metropolitan',
    capital: 'Harare',
    majorHubs: ['CBD', 'Eastlea', 'Borrowdale', 'Msasa Industrial', 'Chitungwiza'],
    gdpDrivers: 'Financial Services, Manufacturing, Commercial Trade & Tech',
    color: '#007a3d',
  },
  {
    id: 'bulawayo',
    name: 'Bulawayo Metropolitan',
    capital: 'Bulawayo',
    majorHubs: ['Belmont Industrial', 'CBD', 'Kelvin North', 'Suburbs'],
    gdpDrivers: 'Heavy Engineering, Textiles, Rail Hub & Cultural Tourism',
    color: '#d97706',
  },
  {
    id: 'midlands',
    name: 'Midlands Province',
    capital: 'Gweru',
    majorHubs: ['Gweru', 'Kwekwe', 'Zvishavane', 'Gokwe'],
    gdpDrivers: 'Steel, Ferrochrome Mining, Cattle Ranching & Education',
    color: '#005a2b',
  },
  {
    id: 'manicaland',
    name: 'Manicaland Province',
    capital: 'Mutare',
    majorHubs: ['Mutare', 'Nyanga', 'Chipinge', 'Rusape'],
    gdpDrivers: 'Timber, Macadamia, Tea/Coffee & Cross-Border Logistics',
    color: '#16a34a',
  },
  {
    id: 'masvingo',
    name: 'Masvingo Province',
    capital: 'Masvingo',
    majorHubs: ['Masvingo Urban', 'Chiredzi', 'Triangle', 'Mashava'],
    gdpDrivers: 'Sugar Cane Plantations, Great Zimbabwe Tourism & Lithium',
    color: '#b45309',
  },
  {
    id: 'matabeleland-north',
    name: 'Matabeleland North',
    capital: 'Lupane',
    majorHubs: ['Victoria Falls', 'Hwange', 'Lupane'],
    gdpDrivers: 'World Tourism (Vic Falls), Coal Mining & Thermal Energy',
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
    slug: 'restaurants-dining',
    name: 'Restaurants & Traditional Dining',
    description: 'Sadza rezviyo, braai spots, contemporary eateries & catering',
    count: 342,
    iconName: 'Utensils',
    featured: true,
  },
  {
    id: 'cat-2',
    slug: 'solar-energy',
    name: 'Solar & Clean Energy',
    description: 'Inverters, lithium batteries, borehole solar pumps & solar installations',
    count: 215,
    iconName: 'SunMedium',
    featured: true,
  },
  {
    id: 'cat-3',
    slug: 'agriculture-farming',
    name: 'Agriculture & Farm Inputs',
    description: 'Seed maize, fertilizer, irrigation equipment, poultry & livestock feeds',
    count: 289,
    iconName: 'Sprout',
    featured: true,
  },
  {
    id: 'cat-4',
    slug: 'hardware-construction',
    name: 'Hardware & Construction',
    description: 'PPC cement, bricks, timber, steel trusses, roofing & plumbing supplies',
    count: 198,
    iconName: 'Building',
    featured: true,
  },
  {
    id: 'cat-5',
    slug: 'hotels-tourism',
    name: 'Hotels, Safari & Tourism',
    description: 'Vic Falls lodges, national park safari camps, city business hotels',
    count: 147,
    iconName: 'Palmtree',
    featured: true,
  },
  {
    id: 'cat-6',
    slug: 'healthcare-clinics',
    name: 'Healthcare & Pharmacies',
    description: 'Private clinics, registered pharmacies, medical labs & specialists',
    count: 164,
    iconName: 'Stethoscope',
    featured: true,
  },
  {
    id: 'cat-7',
    slug: 'automotive-spares',
    name: 'Automotive & Spare Parts',
    description: 'Vehicle servicing, auto spares, Japanese import dealers & tyre fitment',
    count: 220,
    iconName: 'Car',
    featured: true,
  },
  {
    id: 'cat-8',
    slug: 'professional-services',
    name: 'Professional Services',
    description: 'Legal practitioners, ZIMRA tax accountants, architects & IT agencies',
    count: 183,
    iconName: 'Briefcase',
    featured: true,
  },
];

export interface BusinessListing {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
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
  description: string;
  services: string[];
  tags: string[];
}

export const SAMPLE_BUSINESSES: BusinessListing[] = [
  {
    id: 'biz-1',
    slug: 'gavas-traditional-restaurant',
    name: "Gava's Traditional Restaurant",
    categorySlug: 'restaurants-dining',
    categoryName: 'Restaurants & Traditional Dining',
    rating: 4.9,
    reviewCount: 184,
    province: 'Harare Metropolitan',
    city: 'Harare',
    address: 'Belgravia Sports Club, 2nd Street Extension, Harare',
    phone: '+263772123456',
    whatsapp: '+263772123456',
    email: 'info@gavas.co.zw',
    openingHours: 'Mon - Sun: 10:00 AM - 10:00 PM',
    verifiedTier: 'tier2_corporate',
    cr14Verified: true,
    zimraVerified: true,
    featured: true,
    description: 'Authentic Zimbabwean cuisine: sadza rezviyo, roadrunner chicken, maguru, beef stew, wild veggies and live Afro-jazz every Sunday.',
    services: ['Traditional Meals', 'Catering', 'Outdoor Seating', 'Live Music', 'Takeaway'],
    tags: ['Sadza', 'Roadrunner', 'Harare Food', 'Afro Jazz', 'Verified CR14'],
  },
  {
    id: 'biz-2',
    slug: 'midlands-solar-agro-solutions',
    name: 'Midlands Solar & Agro Solutions',
    categorySlug: 'solar-energy',
    categoryName: 'Solar & Clean Energy',
    rating: 4.8,
    reviewCount: 96,
    province: 'Midlands Province',
    city: 'Gweru',
    address: '42 Robert Mugabe Way, Gweru CBD',
    phone: '+263712987654',
    whatsapp: '+263712987654',
    email: 'sales@midlandssolar.co.zw',
    openingHours: 'Mon - Fri: 8:00 AM - 5:00 PM, Sat: 8:00 AM - 1:00 PM',
    verifiedTier: 'tier2_corporate',
    cr14Verified: true,
    zimraVerified: true,
    featured: true,
    description: 'Midlands top supplier of solar hybrid inverters, Tier-1 lithium batteries, DC solar submersible borehole pumps, and farm microgrids.',
    services: ['Solar Installation', 'Borehole Sizing', 'Battery Testing', 'Farm Power Audits'],
    tags: ['Solar Inverters', 'Borehole Pumps', 'Gweru', 'Lithium Batteries', 'ZIMRA Verified'],
  },
  {
    id: 'biz-3',
    slug: 'victoria-falls-safari-lodge',
    name: 'Victoria Falls Safari Lodge',
    categorySlug: 'hotels-tourism',
    categoryName: 'Hotels, Safari & Tourism',
    rating: 5.0,
    reviewCount: 312,
    province: 'Matabeleland North',
    city: 'Victoria Falls',
    address: 'Stand 471 Squire Cummings Road, Victoria Falls',
    phone: '+263832843211',
    whatsapp: '+263773554433',
    email: 'reservations@vfsl.co.zw',
    openingHours: '24/7 Front Desk & Hospitality',
    verifiedTier: 'tier2_corporate',
    cr14Verified: true,
    zimraVerified: true,
    featured: true,
    description: 'World-renowned eco-luxury safari lodge overlooking a natural waterhole teeming with elephant, buffalo, and migratory bird species.',
    services: ['Luxury Accommodation', 'Boma Dinner Experience', 'Game Drives', 'Helicopter Flights', 'Conferences'],
    tags: ['Vic Falls', 'Safari', 'Tourism', 'Luxury Lodge', 'Verified CR14'],
  },
  {
    id: 'biz-4',
    slug: 'batanai-building-hardware',
    name: 'Batanai Hardware & Timber Supplies',
    categorySlug: 'hardware-construction',
    categoryName: 'Hardware & Construction',
    rating: 4.7,
    reviewCount: 79,
    province: 'Bulawayo Metropolitan',
    city: 'Bulawayo',
    address: '88 Belmont Industrial East, Bulawayo',
    phone: '+263774889900',
    whatsapp: '+263774889900',
    email: 'orders@batanai.co.zw',
    openingHours: 'Mon - Fri: 7:30 AM - 4:30 PM, Sat: 7:30 AM - 12:00 PM',
    verifiedTier: 'tier2_corporate',
    cr14Verified: true,
    zimraVerified: true,
    featured: true,
    description: 'Direct distributors of PPC Suracem cement, galvanized IBR roofing sheets, certified structural pine timber, and building rebar.',
    services: ['Bulk Delivery', 'Cutting & Bending', 'Credit Accounts', 'Direct Mill Sourcing'],
    tags: ['Cement', 'Roofing', 'Bulawayo', 'Hardware', 'Verified Corporate'],
  },
  {
    id: 'biz-5',
    slug: 'mutare-agro-inputs-depot',
    name: 'Eastern Highlands Agri Supplies',
    categorySlug: 'agriculture-farming',
    categoryName: 'Agriculture & Farm Inputs',
    rating: 4.8,
    reviewCount: 65,
    province: 'Manicaland Province',
    city: 'Mutare',
    address: '15 Main Street, Mutare',
    phone: '+263771334455',
    whatsapp: '+263771334455',
    email: 'contact@easternagri.co.zw',
    openingHours: 'Mon - Sat: 8:00 AM - 5:00 PM',
    verifiedTier: 'tier1_artisan',
    cr14Verified: false,
    zimraVerified: true,
    featured: false,
    description: 'Certified seed maize varieties, drip irrigation kits, foliar sprays, and specialized macadamia and coffee crop nutrition.',
    services: ['Soil Testing', 'Agronomist Advisory', 'Farm Delivery', 'Fertilizer Supply'],
    tags: ['Agriculture', 'Mutare', 'Seed Maize', 'Fertilizer'],
  },
  {
    id: 'biz-6',
    slug: 'chitungwiza-auto-tech',
    name: 'Chitungwiza Precision Auto Works',
    categorySlug: 'automotive-spares',
    categoryName: 'Automotive & Spare Parts',
    rating: 4.6,
    reviewCount: 42,
    province: 'Harare Metropolitan',
    city: 'Chitungwiza',
    address: 'Stand 120 Tilcor Industrial Area, Chitungwiza',
    phone: '+263775667788',
    whatsapp: '+263775667788',
    email: 'service@chitautotech.co.zw',
    openingHours: 'Mon - Sat: 8:00 AM - 6:00 PM',
    verifiedTier: 'tier1_artisan',
    cr14Verified: false,
    zimraVerified: false,
    featured: false,
    description: 'Computer diagnostics, suspension overhaul, engine rebuilds for Toyota, Nissan, Isuzu, and genuine Japanese spares.',
    services: ['Computer Diagnostics', 'Suspension', 'Gearbox Rebuilds', 'Auto Electrical'],
    tags: ['Auto Repair', 'Spares', 'Chitungwiza', 'Diagnostics'],
  },
];

export interface MarketplaceProduct {
  id: string;
  slug: string;
  title: string;
  category: string;
  priceUsd: number;
  location: string;
  condition: 'Brand New' | 'Certified Used' | 'Locally Fabricated';
  sellerName: string;
  sellerPhone: string;
  sellerVerified: boolean;
  featured?: boolean;
}

export const SAMPLE_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'prod-1',
    slug: 'deye-5kw-hybrid-inverter-system',
    title: 'Deye 5kW Hybrid Inverter + 5.12kWh Felicity Lithium Battery Bundle',
    category: 'Solar & Renewable Energy',
    priceUsd: 1450.0,
    location: 'Harare CBD & Gweru Depot',
    condition: 'Brand New',
    sellerName: 'Midlands Solar & Agro Solutions',
    sellerPhone: '+263712987654',
    sellerVerified: true,
    featured: true,
  },
  {
    id: 'prod-2',
    slug: 'ppc-suracem-cement-50kg-pallet',
    title: 'PPC SuraCem 32.5R Cement 50kg Bags (Pallet of 40 bags)',
    category: 'Hardware & Construction',
    priceUsd: 380.0,
    location: 'Bulawayo Belmont / Free Local Delivery',
    condition: 'Brand New',
    sellerName: 'Batanai Hardware & Timber Supplies',
    sellerPhone: '+263774889900',
    sellerVerified: true,
    featured: true,
  },
  {
    id: 'prod-3',
    slug: 'seed-co-sc719-maize-seed-50kg',
    title: 'Seed Co SC719 Certified Hybrid Seed Maize (50kg Seed Pack)',
    category: 'Agriculture & Farm Inputs',
    priceUsd: 145.0,
    location: 'Mutare Depot & Marondera Hub',
    condition: 'Brand New',
    sellerName: 'Eastern Highlands Agri Supplies',
    sellerPhone: '+263771334455',
    sellerVerified: true,
    featured: true,
  },
  {
    id: 'prod-4',
    slug: 'submersible-solar-water-pump-2hp',
    title: '2.0HP High-Head Brushless Solar Submersible Borehole Pump',
    category: 'Solar & Clean Energy',
    priceUsd: 520.0,
    location: 'Gweru & Kwekwe Pick Up',
    condition: 'Brand New',
    sellerName: 'Midlands Solar & Agro Solutions',
    sellerPhone: '+263712987654',
    sellerVerified: true,
    featured: false,
  },
  {
    id: 'prod-5',
    slug: 'toyota-hilux-gd6-suspension-lift-kit',
    title: 'Old Man Emu Heavy Duty 2-Inch Suspension Lift Kit for Hilux GD6',
    category: 'Automotive & Spare Parts',
    priceUsd: 890.0,
    location: 'Chitungwiza / Harare Delivery',
    condition: 'Brand New',
    sellerName: 'Chitungwiza Precision Auto Works',
    sellerPhone: '+263775667788',
    sellerVerified: false,
    featured: false,
  },
  {
    id: 'prod-6',
    slug: 'traditional-dried-meat-chimukuyu-5kg',
    title: 'Smoked Traditional Chimukuyu (Beef Biltong) 5kg Wholesale Pack',
    category: 'Restaurants & Traditional Dining',
    priceUsd: 45.0,
    location: 'Harare Belgravia Delivery',
    condition: 'Locally Fabricated',
    sellerName: "Gava's Traditional Restaurant",
    sellerPhone: '+263772123456',
    sellerVerified: true,
    featured: false,
  },
];

export interface JobOpening {
  id: string;
  slug: string;
  title: string;
  company: string;
  province: string;
  city: string;
  type: 'Full-time' | 'Contract' | 'Part-time' | 'Apprenticeship';
  salaryUsd: string;
  postedDate: string;
  category: string;
  description: string;
  requirements: string[];
}

export const SAMPLE_JOBS: JobOpening[] = [
  {
    id: 'job-1',
    slug: 'senior-solar-installation-engineer',
    title: 'Senior Solar PV Installation Engineer',
    company: 'Midlands Solar & Agro Solutions',
    province: 'Midlands Province',
    city: 'Gweru',
    type: 'Full-time',
    salaryUsd: '$800 - $1,200 / month',
    postedDate: 'Yesterday',
    category: 'Renewable Energy & Engineering',
    description: 'Lead high-voltage hybrid solar and agricultural borehole pump installations across Midlands and Masvingo farms.',
    requirements: ['Degree/Diploma in Electrical Engineering', '5+ years solar experience', 'Clean Class 4 Driver License'],
  },
  {
    id: 'job-2',
    slug: 'hospitality-operations-supervisor',
    title: 'Lodge Operations & Guest Experience Supervisor',
    company: 'Victoria Falls Safari Lodge',
    province: 'Matabeleland North',
    city: 'Victoria Falls',
    type: 'Full-time',
    salaryUsd: '$1,000 - $1,400 / month',
    postedDate: '2 days ago',
    category: 'Hospitality & Tourism',
    description: 'Manage front-of-house hospitality, international tour logistics, wildlife conservation briefings, and luxury room audits.',
    requirements: ['Degree in Tourism/Hospitality', 'Opera PMS proficiency', 'Minimum 4 years 4/5-star lodge experience'],
  },
  {
    id: 'job-3',
    slug: 'senior-agronomist-horticulture',
    title: 'Field Agronomist (Macadamia & Horticulture)',
    company: 'Eastern Highlands Agri Supplies',
    province: 'Manicaland Province',
    city: 'Mutare',
    type: 'Full-time',
    salaryUsd: '$750 - $1,100 / month',
    postedDate: '3 days ago',
    category: 'Agriculture & Agronomy',
    description: 'Provide on-site farmer advisory, soil nutrient balancing, drip irrigation audits, and export-grade macadamia nut pest scouting.',
    requirements: ['BSc Agriculture / Agronomy', 'Hands-on tree crop experience', 'Motorcycle / Class 4 license'],
  },
  {
    id: 'job-4',
    slug: 'head-chef-traditional-cuisine',
    title: 'Head Chef (Traditional Zimbabwean Cuisine)',
    company: "Gava's Traditional Restaurant",
    province: 'Harare Metropolitan',
    city: 'Harare',
    type: 'Full-time',
    salaryUsd: '$650 - $900 / month',
    postedDate: '4 days ago',
    category: 'Culinary & Restaurants',
    description: 'Lead commercial kitchen preparation of high-volume traditional Zimbabwean dishes, meat smoking, stew seasoning, and staff mentoring.',
    requirements: ['Culinary Arts certification', 'Passion for indigenous grains & wild culinary herbs', 'High hygiene standards'],
  },
];
