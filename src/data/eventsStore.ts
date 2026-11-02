import { CLEAN_PROVINCES } from './advertsStore';

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  category:
    | 'Expos & Trade Fairs'
    | 'Business & Mining'
    | 'Technology & Fintech'
    | 'Agriculture & Field Days'
    | 'Workshops & Training'
    | 'Entertainment & Festivals';
  province: string;
  venue: string;
  city: string;
  startDate: string;
  endDate: string;
  time: string;
  entryType: 'Free Entry' | 'Paid Ticket' | 'Registration Required';
  ticketPriceUSD?: number;
  ticketPriceZiG?: number;
  organizer: string;
  organizerType:
    | 'Corporate / Chamber'
    | 'Government / State Enterprise'
    | 'Industry Association'
    | 'Private Organizer';
  description: string;
  bannerImage: string;
  attendeesCount: number;
  whatsapp: string;
  websiteUrl?: string;
  featured: boolean;
  postedAt: string;
}

export const EVENT_CATEGORIES = [
  'All Categories',
  'Expos & Trade Fairs',
  'Business & Mining',
  'Technology & Fintech',
  'Agriculture & Field Days',
  'Workshops & Training',
  'Entertainment & Festivals',
] as const;

export const EVENT_ENTRY_TYPES = [
  'All Entry Types',
  'Free Entry',
  'Paid Ticket',
  'Registration Required',
] as const;

export const DEFAULT_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Zimbabwe International Trade Fair (ZITF 2026)',
    slug: 'zitf-bulawayo-2026',
    category: 'Expos & Trade Fairs',
    province: 'Bulawayo',
    city: 'Bulawayo',
    venue: 'ZITF Grounds, Famona',
    startDate: '21 Apr 2026',
    endDate: '25 Apr 2026',
    time: '08:30 AM - 05:00 PM CAT',
    entryType: 'Paid Ticket',
    ticketPriceUSD: 10,
    ticketPriceZiG: 265,
    organizer: 'ZITF Company & Ministry of Industry and Commerce',
    organizerType: 'Government / State Enterprise',
    description: 'The premier multi-sector trade exhibition in Zimbabwe and Southern Africa. Bringing together regional manufacturers, mining houses, financial institutions, technology leaders, and foreign trade delegations for high-value B2B matchmaking and deals.',
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    attendeesCount: 45000,
    whatsapp: '263772111000',
    websiteUrl: 'https://zitf.co.zw',
    featured: true,
    postedAt: '1 week ago',
  },
  {
    id: 'evt-2',
    title: 'Harare Renewable Energy & Solar Tech Expo',
    slug: 'harare-renewable-energy-solar-expo-2026',
    category: 'Business & Mining',
    province: 'Harare',
    city: 'Harare',
    venue: 'Rainbow Towers Hotel & Conference Centre',
    startDate: '14 May 2026',
    endDate: '16 May 2026',
    time: '09:00 AM - 04:30 PM CAT',
    entryType: 'Free Entry',
    organizer: 'Renewable Energy Association of Zimbabwe (REAZ)',
    organizerType: 'Industry Association',
    description: 'A dedicated commercial showcase of solar PV, lithium-ion storage solutions, hybrid commercial inverters, and borehole solar pump technologies. Connect directly with certified importers, engineers, and distributors.',
    bannerImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    attendeesCount: 3800,
    whatsapp: '263773222111',
    websiteUrl: 'https://reaz.co.zw',
    featured: true,
    postedAt: '3 days ago',
  },
  {
    id: 'evt-3',
    title: 'Zimbabwe National SME Business Summit & Funding Forum',
    slug: 'zim-sme-business-summit-funding-forum',
    category: 'Workshops & Training',
    province: 'Harare',
    city: 'Harare',
    venue: 'Meikles Hotel, Stewart Room',
    startDate: '08 Jun 2026',
    endDate: '09 Jun 2026',
    time: '08:00 AM - 03:00 PM CAT',
    entryType: 'Registration Required',
    ticketPriceUSD: 25,
    ticketPriceZiG: 660,
    organizer: 'SME Chamber of Zimbabwe & Corporate Partners',
    organizerType: 'Industry Association',
    description: 'Keynote panels on tax compliance with ZIMRA, access to bank export credit lines, digital POS adoption, and scaling owner-operated businesses into formal corporate entities.',
    bannerImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    attendeesCount: 650,
    whatsapp: '263774333222',
    featured: true,
    postedAt: 'Just now',
  },
  {
    id: 'evt-4',
    title: 'Mashonaland Commercial Farming & Horticulture Field Day',
    slug: 'mashonaland-farming-horticulture-field-day',
    category: 'Agriculture & Field Days',
    province: 'Mashonaland East',
    city: 'Marondera',
    venue: 'Grasslands Research Station, Marondera',
    startDate: '27 May 2026',
    endDate: '27 May 2026',
    time: '07:30 AM - 02:00 PM CAT',
    entryType: 'Free Entry',
    organizer: 'Commercial Farmers Union & Seed Co Agronomy',
    organizerType: 'Corporate / Chamber',
    description: 'Practical on-field demonstrations of drip irrigation, hybrid seed maize trials, commercial poultry feeds, and soil fertility management for farmers across Mashonaland East and Central.',
    bannerImage: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=1200&q=80',
    attendeesCount: 1200,
    whatsapp: '263771444333',
    featured: false,
    postedAt: '2 days ago',
  },
  {
    id: 'evt-5',
    title: 'Victoria Falls Tourism & Hospitality Investment Forum',
    slug: 'vic-falls-tourism-hospitality-investment-forum',
    category: 'Business & Mining',
    province: 'Matabeleland North',
    city: 'Victoria Falls',
    venue: 'Elephant Hills Resort & Conference Centre',
    startDate: '18 Jul 2026',
    endDate: '20 Jul 2026',
    time: '09:00 AM - 05:00 PM CAT',
    entryType: 'Registration Required',
    ticketPriceUSD: 150,
    ticketPriceZiG: 3975,
    organizer: 'Zimbabwe Tourism Authority (ZTA)',
    organizerType: 'Government / State Enterprise',
    description: 'Convening international hotel groups, safari operators, eco-tourism developers, and institutional investors exploring tourism concessions and hospitality ventures in Victoria Falls and Hwange.',
    bannerImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    attendeesCount: 420,
    whatsapp: '263775555444',
    websiteUrl: 'https://zimbabwetourism.net',
    featured: true,
    postedAt: '5 days ago',
  },
];

const STORAGE_KEY = 'sadza_events_v1';

export function getStoredEvents(): EventItem[] {
  if (typeof window === 'undefined') return DEFAULT_EVENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_EVENTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_EVENTS;
  } catch {
    return DEFAULT_EVENTS;
  }
}

export function saveStoredEvent(event: EventItem): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredEvents();
    const updated = [event, ...existing.filter((e) => e.id !== event.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('sadza-events-updated'));
  } catch (err) {
    console.error('Failed to save event to localStorage:', err);
  }
}
