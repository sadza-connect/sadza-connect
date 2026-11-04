import { CLEAN_PROVINCES } from './advertsStore';

export interface PropertyListing {
  id: string;
  title: string;
  slug: string;
  propertyType:
    | 'Residential Rent'
    | 'Commercial Rent'
    | 'Residential Sale'
    | 'Commercial Sale'
    | 'Stands & Land'
    | 'Student Accommodation';
  category:
    | 'House'
    | 'Apartment / Flat'
    | 'Cottage'
    | 'Office Space'
    | 'Warehouse'
    | 'Retail Shop'
    | 'Residential Stand'
    | 'Agricultural Plot';
  province: string;
  city: string;
  suburb: string;
  priceUSD: number;
  pricePeriod: 'per_month' | 'total' | 'per_year';
  bedrooms?: number;
  bathrooms?: number;
  features: string[];
  description: string;
  images: string[];
  advertiserName: string;
  advertiserType: 'Real Estate Agency' | 'Direct Landlord' | 'Developer' | 'Property Manager';
  isVerified: boolean;
  whatsapp: string;
  phone: string;
  postedAt: string;
  isFeatured: boolean;
  occupancyStatus?: 'Available' | 'Occupied' | 'Taken';
  isOccupied?: boolean;
}

export const PROPERTY_TYPES = [
  'All Types',
  'Residential Rent',
  'Commercial Rent',
  'Residential Sale',
  'Commercial Sale',
  'Stands & Land',
  'Student Accommodation',
] as const;

export const PROPERTY_CATEGORIES = [
  'All Categories',
  'House',
  'Apartment / Flat',
  'Cottage',
  'Office Space',
  'Warehouse',
  'Retail Shop',
  'Residential Stand',
  'Agricultural Plot',
] as const;

export const DEFAULT_PROPERTIES: PropertyListing[] = [
  {
    id: 'prop-1',
    title: 'Modern 3-Bedroom Executive Cluster Home with 5kVA Solar',
    slug: 'executive-3-bed-cluster-home-borrowdale',
    propertyType: 'Residential Rent',
    category: 'House',
    province: 'Harare',
    city: 'Harare',
    suburb: 'Borrowdale West',
    priceUSD: 1600,
    pricePeriod: 'per_month',
    bedrooms: 3,
    bathrooms: 2,
    features: ['5kVA Solar & Lithium Battery', 'Reliable Borehole & 5000L Tank', '24/7 Gated Security', 'Electric Fence & Intercom', 'Fitted Kitchen & Gas Hob'],
    description: 'Immaculately finished lock-up-and-go 3-bedroom cluster home in a quiet Borrowdale complex. Master bedroom en-suite, double lockup garage, lush private garden, and fully operational solar setup ensuring uninterrupted power and water supply.',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    ],
    advertiserName: 'Heritage Real Estate (Pvt Ltd)',
    advertiserType: 'Real Estate Agency',
    isVerified: true,
    whatsapp: '263772555666',
    phone: '+263 77 255 5666',
    postedAt: '2 days ago',
    isFeatured: true,
  },
  {
    id: 'prop-2',
    title: 'High-Exposure Commercial Office Space (CBD / Avondale Corridor)',
    slug: 'commercial-office-space-avondale-harare',
    propertyType: 'Commercial Rent',
    category: 'Office Space',
    province: 'Harare',
    city: 'Harare',
    suburb: 'Avondale',
    priceUSD: 950,
    pricePeriod: 'per_month',
    bedrooms: 4,
    bathrooms: 2,
    features: ['Fibre Internet Ready (Liquid/TelOne)', 'Dedicated Customer Parking (8 bays)', 'Borehole Water', 'ZESA Prepaid', 'Guard House on Site'],
    description: 'Standalone converted commercial property ideal for NGO headquarters, law firm, chartered accountancy, or consultancy clinic. Features 4 spacious private offices, boardroom, reception lobby, kitchenette, and generous customer parking.',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80',
    ],
    advertiserName: 'ZimPrime Commercial Properties',
    advertiserType: 'Property Manager',
    isVerified: true,
    whatsapp: '263774888999',
    phone: '+263 77 488 8999',
    postedAt: '1 day ago',
    isFeatured: true,
  },
  {
    id: 'prop-3',
    title: 'Heavy Industrial Warehouse & Distribution Bay (Belmont)',
    slug: 'heavy-industrial-warehouse-belmont-bulawayo',
    propertyType: 'Commercial Rent',
    category: 'Warehouse',
    province: 'Bulawayo',
    city: 'Bulawayo',
    suburb: 'Belmont Industrial',
    priceUSD: 1400,
    pricePeriod: 'per_month',
    bathrooms: 2,
    features: ['650 sqm Covered Floor', '3-Phase Heavy Industrial Power', 'Direct Articulated Truck Access', 'Internal Admin Offices', 'High Roller Shutter Doors'],
    description: 'Premier industrial facility situated in the heart of Belmont, Bulawayo. Complete with overhead crane rails, 3-phase commercial electricity, secure perimeter, and easy turning radius for super-link trucks.',
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80',
    ],
    advertiserName: 'Matabeleland Industrial Properties',
    advertiserType: 'Real Estate Agency',
    isVerified: true,
    whatsapp: '263771222333',
    phone: '+263 77 122 2333',
    postedAt: '3 days ago',
    isFeatured: false,
    occupancyStatus: 'Taken',
    isOccupied: true,
  },
  {
    id: 'prop-4',
    title: 'Fully Serviced Residential Stand (Gated Community with Title Deeds)',
    slug: 'serviced-residential-stand-marondera-mash-east',
    propertyType: 'Stands & Land',
    category: 'Residential Stand',
    province: 'Mashonaland East',
    city: 'Marondera',
    suburb: 'Paradise Park Ext',
    priceUSD: 18500,
    pricePeriod: 'total',
    features: ['Tarred Roads', 'ZESA Lines Energized', 'Council Water Connection', 'Parent Title Deeds Available', 'Ready to Build Immediately'],
    description: '1,200 sqm fully serviced prime residential stand in Marondera. ZESA transformers installed, tarred access roads, municipal water mains on site. Clean paperwork ready for direct deed transfer upon full settlement.',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
    ],
    advertiserName: 'Sunrise Land Developers',
    advertiserType: 'Developer',
    isVerified: true,
    whatsapp: '263773444555',
    phone: '+263 77 344 4555',
    postedAt: 'Just now',
    isFeatured: true,
  },
  {
    id: 'prop-5',
    title: 'Cozy 2-Bedroom Garden Flat (Avondale West / Mt Pleasant)',
    slug: 'garden-flat-avondale-west-harare',
    propertyType: 'Residential Rent',
    category: 'Apartment / Flat',
    province: 'Harare',
    city: 'Harare',
    suburb: 'Avondale West',
    priceUSD: 750,
    pricePeriod: 'per_month',
    bedrooms: 2,
    bathrooms: 1,
    features: ['Prolific Borehole', 'Solar Geyser', 'Carport & Visitor Parking', 'Quiet Complex (10 Units Only)', 'Levies Included in Rent'],
    description: 'Charming ground-floor 2-bedroom garden apartment with private courtyard garden. Spacious open-plan lounge and dining, neat fitted cupboards, solar geyser, and high security. Ideal for young professionals or small family.',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80',
    ],
    advertiserName: 'Direct Landlord Management',
    advertiserType: 'Direct Landlord',
    isVerified: true,
    whatsapp: '263772666777',
    phone: '+263 77 266 6777',
    postedAt: '4 days ago',
    isFeatured: false,
  },
];

const STORAGE_KEY = 'sadza_properties_v1';

export function getStoredProperties(): PropertyListing[] {
  if (typeof window === 'undefined') return DEFAULT_PROPERTIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROPERTIES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_PROPERTIES;
  } catch {
    return DEFAULT_PROPERTIES;
  }
}

export function saveStoredProperty(property: PropertyListing): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredProperties();
    const updated = [property, ...existing.filter((p) => p.id !== property.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('sadza-properties-updated'));
  } catch (err) {
    console.error('Failed to save property to localStorage:', err);
  }
}

export function togglePropertyOccupancy(propertyId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredProperties();
    const updated = existing.map((p) => {
      if (p.id !== propertyId) return p;
      const isCurrentlyOccupied = p.occupancyStatus === 'Occupied' || p.occupancyStatus === 'Taken' || p.isOccupied;
      const nextStatus: 'Available' | 'Taken' = isCurrentlyOccupied ? 'Available' : 'Taken';
      return {
        ...p,
        occupancyStatus: nextStatus,
        isOccupied: !isCurrentlyOccupied,
      };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('sadza-properties-updated'));
  } catch (err) {
    console.error('Failed to toggle property occupancy:', err);
  }
}
