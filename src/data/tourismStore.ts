import { CLEAN_PROVINCES } from './advertsStore';

export type TourismMainCategory =
  | 'Accommodation & Lodging'
  | 'Tour Operators & Travel Agencies'
  | 'Attractions & Tourist Destinations'
  | 'Restaurants, Food & Dining'
  | 'Adventures & Outdoor Activities'
  | 'Tourism Transport & Transfers'
  | 'Wellness, Leisure & Recreation'
  | 'Lodges & Safari Camps'
  | 'Bed & Breakfast (BnB)'
  | 'Hotels & Resorts'
  | 'Self-Catering Cottages & Chalets'
  | 'Houseboats & Lake Stays'
  | 'Camping & Eco-Resorts';

export interface TourismListing {
  id: string;
  name: string;
  slug: string;
  category: TourismMainCategory;
  destinationArea: string; // e.g. "Victoria Falls", "Nyanga", "Kariba", "Harare North", "Matobo Hills"
  province: string;
  city: string;
  addressOrLocation: string;
  pricePerNightUSD: number;
  guestsCapacity?: number;
  bedrooms?: number;
  amenities: string[];
  description: string;
  images: string[];
  hostName: string;
  hostType:
    | 'Hotel / Resort Group'
    | 'Safari Lodge Operator'
    | 'Private BnB Host'
    | 'Guesthouse Manager'
    | 'Tour & Travel Operator'
    | 'Restaurant & Dining Venue'
    | 'Transport & Transfer Provider'
    | 'Wellness & Leisure Hub';
  isVerified: boolean;
  isFeatured: boolean;
  whatsapp: string;
  phone: string;
  email?: string;
  rating: number;
  reviewsCount: number;
  postedAt: string;
}

export const TOURISM_CATEGORIES = [
  'All Categories',
  'Accommodation & Lodging',
  'Tour Operators & Travel Agencies',
  'Attractions & Tourist Destinations',
  'Restaurants, Food & Dining',
  'Adventures & Outdoor Activities',
  'Tourism Transport & Transfers',
  'Wellness, Leisure & Recreation',
] as const;

export function normalizeTourismCategory(cat: string): string {
  const legacyAccommodation = [
    'Lodges & Safari Camps',
    'Bed & Breakfast (BnB)',
    'Hotels & Resorts',
    'Self-Catering Cottages & Chalets',
    'Houseboats & Lake Stays',
    'Camping & Eco-Resorts',
  ];
  if (legacyAccommodation.includes(cat)) {
    return 'Accommodation & Lodging';
  }
  return cat;
}

export const TOURISM_DESTINATIONS = [
  'All Destinations',
  'Victoria Falls',
  'Nyanga & Eastern Highlands',
  'Kariba & Lake Stays',
  'Harare & Suburbs',
  'Bulawayo & Matopos',
  'Gweru & Midlands',
  'Hwange National Park',
  'Great Zimbabwe & Masvingo',
  'Vumba Mountains',
] as const;

export const DEFAULT_TOURISMS: TourismListing[] = [
  {
    id: 'tour-1',
    name: 'Zambezi Sunset Safari Lodge & River Chalets',
    slug: 'zambezi-sunset-safari-lodge-victoria-falls',
    category: 'Accommodation & Lodging',
    destinationArea: 'Victoria Falls',
    province: 'Matabeleland North',
    city: 'Victoria Falls',
    addressOrLocation: 'Zambezi Drive, Riverfront Corridor, Victoria Falls',
    pricePerNightUSD: 185,
    guestsCapacity: 4,
    bedrooms: 2,
    amenities: [
      'Infinity Pool overlooking Zambezi',
      'Daily Guided Game Drives',
      'Solar Power & 24/7 Backup',
      'High-Speed Fibre Wi-Fi',
      'Complimentary Full English Breakfast',
      'Airport Shuttle Service',
      'On-site Restaurant & Cocktail Deck',
    ],
    description:
      'Immerse yourself in quintessential African wilderness only 10 minutes from the majestic Victoria Falls rainforest. Features private teak chalets with river vistas, wildlife viewing direct from your private veranda, and world-class Zimbabwean hospitality.',
    images: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80',
    ],
    hostName: 'Victoria Falls Wilderness Hospitality',
    hostType: 'Safari Lodge Operator',
    isVerified: true,
    isFeatured: true,
    whatsapp: '263772888111',
    phone: '+263 77 288 8111',
    rating: 4.9,
    reviewsCount: 38,
    postedAt: 'Verified Partner',
  },
  {
    id: 'tour-2',
    name: 'Troutbeck Mist Mountain Chalets & Trout Lodge',
    slug: 'troutbeck-mist-mountain-chalets-nyanga',
    category: 'Accommodation & Lodging',
    destinationArea: 'Nyanga & Eastern Highlands',
    province: 'Manicaland',
    city: 'Nyanga',
    addressOrLocation: 'Troutbeck Valley, Inyanga Mountains',
    pricePerNightUSD: 120,
    guestsCapacity: 6,
    bedrooms: 3,
    amenities: [
      'Cozy Stone Log Fireplaces (Pine Wood Provided)',
      'Private Trout Dam Access & Fishing Permits',
      'Solar Geysers & Continuous Spring Water',
      'Fitted Country Kitchen & Gas Stove',
      'Golf Course & Horse Riding Access',
      'Panoramic Mountain Pine Views',
    ],
    description:
      'Tranquil highland retreat nestled in the crisp, misty pine forests of Nyanga. Fully equipped luxury 3-bedroom stone chalets complete with wood-burning fireplace, trout dam frontage, and direct hiking trails to World’s View.',
    images: [
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80',
    ],
    hostName: 'Eastern Highlands Leisure Group',
    hostType: 'Hotel / Resort Group',
    isVerified: true,
    isFeatured: true,
    whatsapp: '263773999222',
    phone: '+263 77 399 9222',
    rating: 4.8,
    reviewsCount: 44,
    postedAt: 'Verified Partner',
  },
  {
    id: 'tour-3',
    name: 'Kariba Horizon Luxury Houseboat & Lake Cruiser',
    slug: 'kariba-horizon-luxury-houseboat',
    category: 'Houseboats & Lake Stays',
    destinationArea: 'Kariba & Lake Stays',
    province: 'Mashonaland West',
    city: 'Kariba',
    addressOrLocation: 'Andora Harbour, Lake Kariba',
    pricePerNightUSD: 290,
    guestsCapacity: 8,
    bedrooms: 4,
    amenities: [
      'Splash Pool on Top Sundeck',
      'Captain, Chef & Deckhand Fully Catered',
      '2 Tender Tender Boats for Tiger Fishing',
      'Generator & Inverter Power System',
      'Air-Conditioned En-suite Cabins',
      'Sunset Viewing Lounge & Bar',
    ],
    description:
      'Experience the magic of Lake Kariba aboard a private luxury cruiser. Glide past drowned petrified trees, witness herds of elephants swimming along the Matusadona shoreline, and enjoy freshly caught bream cooked to perfection by your onboard chef.',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80',
    ],
    hostName: 'Zambezi Cruise & Charters Ltd',
    hostType: 'Safari Lodge Operator',
    isVerified: true,
    isFeatured: true,
    whatsapp: '263774111333',
    phone: '+263 77 411 1333',
    rating: 5.0,
    reviewsCount: 29,
    postedAt: 'Verified Partner',
  },
  {
    id: 'tour-4',
    name: 'Borrowdale Brooke Executive Garden BnB & Suites',
    slug: 'borrowdale-brooke-executive-garden-bnb',
    category: 'Bed & Breakfast (BnB)',
    destinationArea: 'Harare & Suburbs',
    province: 'Harare',
    city: 'Harare',
    addressOrLocation: 'Borrowdale Brooke Golf Estate Access, Harare North',
    pricePerNightUSD: 75,
    guestsCapacity: 2,
    bedrooms: 1,
    amenities: [
      'Gated Golf Estate 24/7 Security',
      'Reliable Solar Power & Pure Borehole Water',
      'Gourmet Fresh Cooked Breakfast Included',
      'Dedicated Ergonomic Work Desk & Fibre Wi-Fi',
      'Smart TV with DSTV Premium & Netflix',
      'Private Garden Patio Entry',
    ],
    description:
      'Premier executive guesthouse in Harare’s safest and most prestigious suburb. Perfectly curated for business consultants, diaspora returnees, and diplomatic travellers seeking tranquility, high security, uninterrupted utilities, and personalized breakfast service.',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
    ],
    hostName: 'Mrs. S. Marowa (Direct Host)',
    hostType: 'Private BnB Host',
    isVerified: true,
    isFeatured: false,
    whatsapp: '263772555777',
    phone: '+263 77 255 5777',
    rating: 4.9,
    reviewsCount: 52,
    postedAt: 'Superhost Verified',
  },
  {
    id: 'tour-5',
    name: 'Matobo Granite Whispers Safari Camp',
    slug: 'matobo-granite-whispers-safari-camp',
    category: 'Lodges & Safari Camps',
    destinationArea: 'Bulawayo & Matopos',
    province: 'Matabeleland South',
    city: 'Matobo',
    addressOrLocation: 'Matobo National Park Boundary, 35km from Bulawayo',
    pricePerNightUSD: 140,
    guestsCapacity: 3,
    bedrooms: 1,
    amenities: [
      'Rhino Tracking Safari Walks with Professional Guides',
      'Historic San Rock Art Cave Excursions',
      'Open-air Boma Campfire & Traditional Dining',
      'Solar Powered Sustainable Eco-Lodging',
      'Spectacular Balancing Rock Formations',
    ],
    description:
      'Built harmoniously into ancient granite whalebacks of Matobo Hills. Renowned for intimate black & white rhino tracking, historic San bushman rock paintings, and breathtaking starry nights around the crackling boma fire.',
    images: [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    ],
    hostName: 'Matopo Heritage Safaris',
    hostType: 'Safari Lodge Operator',
    isVerified: true,
    isFeatured: true,
    whatsapp: '263771333444',
    phone: '+263 77 133 3444',
    rating: 4.9,
    reviewsCount: 31,
    postedAt: 'Verified Partner',
  },
  {
    id: 'tour-6',
    name: 'Great Zimbabwe Heritage Hotel & Cultural Village',
    slug: 'great-zimbabwe-heritage-hotel',
    category: 'Hotels & Resorts',
    destinationArea: 'Great Zimbabwe & Masvingo',
    province: 'Masvingo',
    city: 'Masvingo',
    addressOrLocation: 'Lake Mutirikwi Road, Great Zimbabwe National Monument',
    pricePerNightUSD: 95,
    guestsCapacity: 4,
    bedrooms: 2,
    amenities: [
      'Walking Distance to UNESCO World Heritage Ruins',
      'Lake Mutirikwi Boat Trips & Bass Fishing',
      'Traditional Shona Cultural Dance Performances',
      'Sparkling Swimming Pool & Tennis Court',
      'Conference & Wedding Banquet Facilities',
    ],
    description:
      'Immerse in the medieval architecture and rich history of the Kingdom of Great Zimbabwe. Located alongside Lake Mutirikwi with verdant gardens, traditional architecture, and guided sunrise tours to the Conical Tower and Hill Complex.',
    images: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
    ],
    hostName: 'Heritage Hotels of Zimbabwe',
    hostType: 'Hotel / Resort Group',
    isVerified: true,
    isFeatured: false,
    whatsapp: '263775222666',
    phone: '+263 77 522 2666',
    rating: 4.7,
    reviewsCount: 26,
    postedAt: 'Verified Partner',
  },
  {
    id: 'tour-7',
    name: 'Vumba Cloud Forest Botanical Guesthouse',
    slug: 'vumba-cloud-forest-botanical-guesthouse',
    category: 'Bed & Breakfast (BnB)',
    destinationArea: 'Vumba Mountains',
    province: 'Manicaland',
    city: 'Mutare',
    addressOrLocation: 'Bvumba Botanical Gardens Highway, Mutare',
    pricePerNightUSD: 65,
    guestsCapacity: 2,
    bedrooms: 1,
    amenities: [
      'Highland Forest Mist Canopy Views into Mozambique',
      'Renowned Fresh Scones & Coffee Veranda',
      'Rare Samango Monkey & Bird Watching Walks',
      'Cozy Feather Duvets & Wall Heaters',
      'Organic Farm Fresh Breakfast',
    ],
    description:
      'Perched high in the mystical cloud forests of the Bvumba mountains. Famous for panoramic views overlooking Mozambican valleys, ancient tree ferns, and tranquil afternoon teas accompanied by warm homemade scones.',
    images: [
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507038772120-7ffe76778f01?auto=format&fit=crop&w=1000&q=80',
    ],
    hostName: 'Vumba Highlands Hospitality',
    hostType: 'Guesthouse Manager',
    isVerified: true,
    isFeatured: false,
    whatsapp: '263776444888',
    phone: '+263 77 644 4888',
    rating: 4.8,
    reviewsCount: 37,
    postedAt: 'Verified Partner',
  },
];

import { getClientAccessToken } from '@/shared/utils/api-client';

const STORAGE_KEY = 'sadza_tourism_v1';

function getAuthHeaders(): Record<string, string> {
  const token = getClientAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function getStoredTourisms(): TourismListing[] {
  if (typeof window === 'undefined') return DEFAULT_TOURISMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TOURISMS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return DEFAULT_TOURISMS;
  } catch {
    return DEFAULT_TOURISMS;
  }
}

export async function syncTourismsFromApi(isAdmin = false): Promise<TourismListing[]> {
  if (typeof window === 'undefined') return DEFAULT_TOURISMS;
  try {
    const url = isAdmin ? '/api/v1/tourism?admin=true&limit=100' : '/api/v1/tourism?limit=100';
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) return getStoredTourisms();
    const json = await res.json();
    const list = json.data?.listings || json.listings;
    if (Array.isArray(list)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event('sadza-tourism-updated'));
      return list;
    }
    return getStoredTourisms();
  } catch (err) {
    console.warn('[TourismStore] Failed to fetch from API, using local cache:', err);
    return getStoredTourisms();
  }
}

export function saveStoredTourism(item: TourismListing, isEdit = false): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredTourisms();
    const existsLocally = existing.some((t) => t.id === item.id);
    const updated = [item, ...existing.filter((t) => t.id !== item.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('sadza-tourism-updated'));

    const headers = getAuthHeaders();
    if (isEdit || existsLocally) {
      fetch(`/api/v1/tourism/${item.id}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(item),
      })
        .then((res) => (res.ok ? syncTourismsFromApi(isEdit) : null))
        .catch((err) => console.warn('[TourismStore] API PUT failed:', err));
    } else {
      fetch('/api/v1/tourism', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(item),
      })
        .then((res) => (res.ok ? syncTourismsFromApi(false) : null))
        .catch((err) => console.warn('[TourismStore] API POST failed:', err));
    }
  } catch (err) {
    console.error('Failed to save tourism listing:', err);
  }
}

export function deleteStoredTourism(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredTourisms();
    const updated = existing.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('sadza-tourism-updated'));

    fetch(`/api/v1/tourism/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    }).catch((err) => console.warn('[TourismStore] API DELETE failed:', err));
  } catch (err) {
    console.error('Failed to delete tourism listing:', err);
  }
}

export function toggleTourismVerification(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredTourisms();
    let nextVal = true;
    const updated = existing.map((t) => {
      if (t.id === id) {
        nextVal = !t.isVerified;
        return { ...t, isVerified: nextVal };
      }
      return t;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('sadza-tourism-updated'));

    fetch(`/api/v1/tourism/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ action: 'toggle_verification', isVerified: nextVal }),
    }).catch((err) => console.warn('[TourismStore] API toggle verification failed:', err));
  } catch (err) {
    console.error('Failed to toggle verification:', err);
  }
}

export function toggleTourismFeatured(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredTourisms();
    let nextVal = true;
    const updated = existing.map((t) => {
      if (t.id === id) {
        nextVal = !t.isFeatured;
        return { ...t, isFeatured: nextVal };
      }
      return t;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('sadza-tourism-updated'));

    fetch(`/api/v1/tourism/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ action: 'toggle_featured', isFeatured: nextVal }),
    }).catch((err) => console.warn('[TourismStore] API toggle featured failed:', err));
  } catch (err) {
    console.error('Failed to toggle featured:', err);
  }
}
