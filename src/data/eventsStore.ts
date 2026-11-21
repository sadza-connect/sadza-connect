export type EventCategory =
  | 'Conferences & Summits'
  | 'Concerts & Entertainment'
  | 'Festivals & Cultural'
  | 'Sports & Tournaments'
  | 'Religious & Church'
  | 'Wedding & Social'
  | 'Technology & Innovation'
  | 'Education & Career'
  | 'Community & Charity'
  | 'Expos & Trade Fairs'
  | 'Business & Mining'
  | 'Agriculture & Field Days'
  | 'Workshops & Training'
  | 'Technology & Fintech'
  | 'Entertainment & Festivals';

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  category: EventCategory;
  province: string;
  venue: string;
  city: string;
  startDate: string;
  endDate: string;
  monthGroup?: string;
  time: string;
  entryType: 'Free Entry' | 'Paid Ticket' | 'Registration Required';
  ticketPriceUSD?: number;
  vipTicketPriceUSD?: number;
  ticketPriceZiG?: number;
  exhibitorBoothPriceUSD?: number;
  organizer: string;
  organizerType:
    | 'Corporate / Chamber'
    | 'Government / State Enterprise'
    | 'Industry Association'
    | 'Private Organizer'
    | 'Entertainment & Concert Promoter'
    | 'Church / Faith Ministry'
    | 'Sports Federation';
  verifiedOrganizer?: boolean;
  description: string;
  bannerImage: string;
  attendeesCount: number;
  ticketsSoldCount?: number;
  exhibitorsCount?: number;
  whatsapp: string;
  websiteUrl?: string;
  featured: boolean;
  postedAt: string;
}

export interface EventTicketRecord {
  id: string;
  ticketCode: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventCity: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  tier: 'General Admission' | 'VIP Delegate Pass' | 'Corporate Table (6 Guests)';
  quantity: number;
  totalAmountUSD: number;
  paymentMethod: 'Free Registration' | 'EcoCash USD' | 'InnBucks' | 'Visa / Mastercard';
  status: 'Confirmed & QR Issued';
  createdAt: string;
}

export interface EventExhibitorRecord {
  id: string;
  referenceCode: string;
  eventId: string;
  eventTitle: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  packageTier: 'Standard Exhibition Booth ($150)' | 'Silver Event Sponsor ($500)' | 'Gold Headline Sponsor ($1,200)';
  amountUSD: number;
  status: 'Confirmed' | 'Pending Organizer Review';
  createdAt: string;
}

export interface EventVenueItem {
  id: string;
  name: string;
  province: string;
  city: string;
  address: string;
  venueType:
    | 'Conference & Convention Centre'
    | 'Exhibition & Trade Grounds'
    | 'Stadium & Sports Arena'
    | 'Garden Wedding & Banquet Venue'
    | 'Concert & Amphitheatre Hall';
  capacity: number;
  pricePerDayUSD: number;
  amenities: string[];
  whatsapp: string;
  phone: string;
  image: string;
  verified: boolean;
}

export interface EventOrganizerProfile {
  id: string;
  name: string;
  organizerType: EventItem['organizerType'];
  province: string;
  city: string;
  specialty: string;
  eventsHosted: number;
  whatsapp: string;
  email: string;
  verified: boolean;
}

export const EVENT_CATEGORIES = [
  'All Categories',
  'Conferences & Summits',
  'Concerts & Entertainment',
  'Festivals & Cultural',
  'Sports & Tournaments',
  'Religious & Church',
  'Wedding & Social',
  'Technology & Innovation',
  'Education & Career',
  'Community & Charity',
  'Expos & Trade Fairs',
  'Business & Mining',
  'Agriculture & Field Days',
  'Workshops & Training',
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
    city: 'Bulawayo CBD',
    venue: 'ZITF Exhibition Grounds, Famona',
    startDate: '21 Apr 2026',
    endDate: '25 Apr 2026',
    monthGroup: 'April 2026',
    time: '08:30 AM - 05:00 PM CAT',
    entryType: 'Paid Ticket',
    ticketPriceUSD: 10,
    vipTicketPriceUSD: 40,
    ticketPriceZiG: 265,
    exhibitorBoothPriceUSD: 250,
    organizer: 'ZITF Company & Ministry of Industry and Commerce',
    organizerType: 'Government / State Enterprise',
    verifiedOrganizer: true,
    description:
      'The premier multi-sector trade exhibition in Zimbabwe and Southern Africa. Bringing together regional manufacturers, mining houses, financial institutions, technology leaders, and international exhibitors for high-value B2B deals and public exhibitions.',
    bannerImage:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    attendeesCount: 45000,
    ticketsSoldCount: 412,
    exhibitorsCount: 86,
    whatsapp: '263772111000',
    websiteUrl: 'https://zitf.co.zw',
    featured: true,
    postedAt: 'Featured Expo',
  },
  {
    id: 'evt-2',
    title: 'Zimbabwe Tech, AI & FinTech Innovation Summit 2026',
    slug: 'zimbabwe-tech-ai-fintech-summit-2026',
    category: 'Technology & Innovation',
    province: 'Harare',
    city: 'Harare CBD',
    venue: 'Rainbow Towers International Conference Centre (HICC)',
    startDate: '14 May 2026',
    endDate: '15 May 2026',
    monthGroup: 'May 2026',
    time: '08:30 AM - 04:30 PM CAT',
    entryType: 'Paid Ticket',
    ticketPriceUSD: 20,
    vipTicketPriceUSD: 60,
    ticketPriceZiG: 530,
    exhibitorBoothPriceUSD: 150,
    organizer: 'TechHub Harare & Zimbabwe ICT Directorate',
    organizerType: 'Corporate / Chamber',
    verifiedOrganizer: true,
    description:
      'Discover the future of digital payments, Paynow & mobile money APIs, AI startups, cybersecurity, and Starlink enterprise connectivity across Zimbabwe. Includes startup pitch competitions, developer hackathons, and investor networking.',
    bannerImage:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    attendeesCount: 2500,
    ticketsSoldCount: 198,
    exhibitorsCount: 34,
    whatsapp: '263773222111',
    featured: true,
    postedAt: 'Featured Summit',
  },
  {
    id: 'evt-3',
    title: 'Victoria Falls International Jazz, Music & Cultural Festival',
    slug: 'victoria-falls-jazz-music-cultural-festival',
    category: 'Concerts & Entertainment',
    province: 'Matabeleland North',
    city: 'Victoria Falls',
    venue: 'Baobab Outdoor Arena, Victoria Falls',
    startDate: '29 May 2026',
    endDate: '31 May 2026',
    monthGroup: 'May 2026',
    time: '02:00 PM - 11:30 PM CAT',
    entryType: 'Paid Ticket',
    ticketPriceUSD: 35,
    vipTicketPriceUSD: 90,
    ticketPriceZiG: 928,
    exhibitorBoothPriceUSD: 150,
    organizer: 'Zambezi Live Entertainment & ZTA',
    organizerType: 'Entertainment & Concert Promoter',
    verifiedOrganizer: true,
    description:
      'Three unforgettable nights of live Zimbabwean afro-jazz, sungura, amapiano, and international headline performers overlooking the spray of Victoria Falls. Food stalls, craft markets, and VIP sunset lounges available.',
    bannerImage:
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80',
    attendeesCount: 8000,
    ticketsSoldCount: 540,
    exhibitorsCount: 42,
    whatsapp: '263775555444',
    featured: true,
    postedAt: 'Trending Concert',
  },
  {
    id: 'evt-4',
    title: 'National Executive Leadership & Economic Conference',
    slug: 'national-executive-leadership-economic-conference',
    category: 'Conferences & Summits',
    province: 'Harare',
    city: 'Borrowdale',
    venue: 'Borrowdale Brooke Convention Pavilion',
    startDate: '08 Jun 2026',
    endDate: '09 Jun 2026',
    monthGroup: 'June 2026',
    time: '08:00 AM - 04:00 PM CAT',
    entryType: 'Registration Required',
    ticketPriceUSD: 25,
    vipTicketPriceUSD: 75,
    ticketPriceZiG: 663,
    exhibitorBoothPriceUSD: 200,
    organizer: 'Confederation of Zimbabwe Industries (CZI)',
    organizerType: 'Industry Association',
    verifiedOrganizer: true,
    description:
      'High-level C-suite and SME conference addressing industrial growth, export finance, ZIMRA tax frameworks, and cross-border SADC supply chains.',
    bannerImage:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    attendeesCount: 950,
    ticketsSoldCount: 145,
    exhibitorsCount: 22,
    whatsapp: '263774333222',
    featured: false,
    postedAt: '2 days ago',
  },
  {
    id: 'evt-5',
    title: 'Harare Marathon & Corporate Inter-Provincial Sports Tournament',
    slug: 'harare-marathon-corporate-sports-tournament',
    category: 'Sports & Tournaments',
    province: 'Harare',
    city: 'Mount Pleasant',
    venue: 'University of Zimbabwe Sports Arena & Old Georgians',
    startDate: '20 Jun 2026',
    endDate: '21 Jun 2026',
    monthGroup: 'June 2026',
    time: '06:00 AM - 05:00 PM CAT',
    entryType: 'Paid Ticket',
    ticketPriceUSD: 15,
    vipTicketPriceUSD: 45,
    ticketPriceZiG: 398,
    organizer: 'National Athletics & Corporate Sports Federation',
    organizerType: 'Sports Federation',
    verifiedOrganizer: true,
    description:
      'Annual 42km full marathon, 21km half marathon, 10km fun run, and 5-a-side corporate football & netball tournament. Register individual runners or corporate teams.',
    bannerImage:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    attendeesCount: 3200,
    ticketsSoldCount: 290,
    exhibitorsCount: 18,
    whatsapp: '263771444333',
    featured: false,
    postedAt: '3 days ago',
  },
  {
    id: 'evt-6',
    title: 'Zimbabwe Bridal, Wedding & Social Lifestyle Expo',
    slug: 'zimbabwe-bridal-wedding-social-expo',
    category: 'Wedding & Social',
    province: 'Harare',
    city: 'Newlands',
    venue: 'Highlands Park Botanical Gardens',
    startDate: '04 Jul 2026',
    endDate: '05 Jul 2026',
    monthGroup: 'July 2026',
    time: '09:00 AM - 06:00 PM CAT',
    entryType: 'Free Entry',
    exhibitorBoothPriceUSD: 120,
    organizer: ' ZimWeddings & Lifestyle Collective',
    organizerType: 'Private Organizer',
    verifiedOrganizer: true,
    description:
      'Meet Zimbabwe’s finest wedding planners, garden venues, caterers, cake designers, photographers, decorators, and bridal couture houses in one scenic outdoor exhibition.',
    bannerImage:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    attendeesCount: 1800,
    ticketsSoldCount: 215,
    exhibitorsCount: 50,
    whatsapp: '263772999888',
    featured: false,
    postedAt: '4 days ago',
  },
  {
    id: 'evt-7',
    title: 'National Youth Career, University & Scholarship Fair',
    slug: 'national-youth-career-university-scholarship-fair',
    category: 'Education & Career',
    province: 'Midlands',
    city: 'Gweru',
    venue: 'Gweru Civic Convention Hall',
    startDate: '17 Jul 2026',
    endDate: '18 Jul 2026',
    monthGroup: 'July 2026',
    time: '08:30 AM - 04:00 PM CAT',
    entryType: 'Free Entry',
    organizer: 'Zimbabwe Higher Education & Careers Network',
    organizerType: 'Industry Association',
    verifiedOrganizer: true,
    description:
      'Connecting high school graduates, university students, and job seekers with top Zimbabwean employers, vocational academies, and international scholarship desks.',
    bannerImage:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    attendeesCount: 4000,
    ticketsSoldCount: 330,
    exhibitorsCount: 35,
    whatsapp: '263773444555',
    featured: false,
    postedAt: '5 days ago',
  },
];

export const DEFAULT_EVENT_VENUES: EventVenueItem[] = [
  {
    id: 'ven-1',
    name: 'Harare International Conference Centre (HICC / Rainbow Towers)',
    province: 'Harare',
    city: 'Harare CBD',
    address: '1 Pennefather Ave, Samora Machel West, Harare',
    venueType: 'Conference & Convention Centre',
    capacity: 4500,
    pricePerDayUSD: 1500,
    amenities: ['4,500-Seat Main Auditorium', 'VIP Breakout Rooms', 'Full Backup Generators', 'Exhibition Foyer', '5-Star Catering'],
    whatsapp: '263772100200',
    phone: '+263 242 772 633',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
    verified: true,
  },
  {
    id: 'ven-2',
    name: 'ZITF International Exhibition Park & Pavilions',
    province: 'Bulawayo',
    city: 'Famona',
    address: 'Hillside Road, Famona, Bulawayo',
    venueType: 'Exhibition & Trade Grounds',
    capacity: 15000,
    pricePerDayUSD: 1200,
    amenities: ['6 Indoor Exhibition Halls', 'Outdoor Machinery Arena', 'Conference Centre', 'Secure Parking for 2,000+ Cars'],
    whatsapp: '263772111000',
    phone: '+263 292 884 911',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
    verified: true,
  },
  {
    id: 'ven-3',
    name: 'Borrowdale Brooke Glass Garden & Wedding Pavilion',
    province: 'Harare',
    city: 'Borrowdale',
    address: 'Crowhill Road, Borrowdale North, Harare',
    venueType: 'Garden Wedding & Banquet Venue',
    capacity: 600,
    pricePerDayUSD: 850,
    amenities: ['Manicured Lakeside Gardens', 'Glass Marquee', 'Bridal Suite', 'Solar & Generator Backup', 'Private Security'],
    whatsapp: '263772999888',
    phone: '+263 77 299 9888',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
    verified: true,
  },
  {
    id: 'ven-4',
    name: 'Elephant Hills Zambezi Convention & Resort Hall',
    province: 'Matabeleland North',
    city: 'Victoria Falls',
    address: 'Parkway Drive, Victoria Falls',
    venueType: 'Conference & Convention Centre',
    capacity: 800,
    pricePerDayUSD: 1100,
    amenities: ['Zambezi River Views', 'Championship Golf Course', 'AV & Simultaneous Translation', 'Executive Banquet Catering'],
    whatsapp: '263775555444',
    phone: '+263 83 284 4793',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    verified: true,
  },
];

export const DEFAULT_EVENT_ORGANIZERS: EventOrganizerProfile[] = [
  {
    id: 'org-1',
    name: 'ZITF Company & National Exhibitions Desk',
    organizerType: 'Government / State Enterprise',
    province: 'Bulawayo',
    city: 'Famona',
    specialty: 'International Trade Fairs, Mine Entra, Scholastica & Industrial Expos',
    eventsHosted: 24,
    whatsapp: '263772111000',
    email: 'exhibitions@zitf.co.zw',
    verified: true,
  },
  {
    id: 'org-2',
    name: 'Zambezi Live Concerts & Festival Promotions',
    organizerType: 'Entertainment & Concert Promoter',
    province: 'Matabeleland North',
    city: 'Victoria Falls',
    specialty: 'Music Festivals, Live Concerts, Cultural Showcases & Outdoor Sound Production',
    eventsHosted: 18,
    whatsapp: '263775555444',
    email: 'bookings@zambezilive.co.zw',
    verified: true,
  },
  {
    id: 'org-3',
    name: 'TechHub Harare & FinTech Summits',
    organizerType: 'Corporate / Chamber',
    province: 'Harare',
    city: 'Harare CBD',
    specialty: 'Technology Conferences, Startup Pitch Summits & Developer Hackathons',
    eventsHosted: 15,
    whatsapp: '263773222111',
    email: 'events@techhubharare.co.zw',
    verified: true,
  },
];

const STORAGE_KEY = 'sadza_events_v2';
const TICKETS_KEY = 'sadza_event_tickets_v1';
const EXHIBITORS_KEY = 'sadza_event_exhibitors_v1';
const VENUES_KEY = 'sadza_event_venues_v1';
const ORGANIZERS_KEY = 'sadza_event_organizers_v1';

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

export function getStoredEventTickets(): EventTicketRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredEventTicket(ticket: EventTicketRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredEventTickets();
    const updated = [ticket, ...existing];
    localStorage.setItem(TICKETS_KEY, JSON.stringify(updated));

    // Also increment event attendee & ticket count
    const events = getStoredEvents();
    const nextEvents = events.map((ev) =>
      ev.id === ticket.eventId
        ? {
            ...ev,
            attendeesCount: ev.attendeesCount + ticket.quantity,
            ticketsSoldCount: (ev.ticketsSoldCount || 0) + ticket.quantity,
          }
        : ev
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEvents));
    window.dispatchEvent(new Event('sadza-events-updated'));
  } catch (err) {
    console.error('Failed to save ticket:', err);
  }
}

export function getStoredEventExhibitors(): EventExhibitorRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EXHIBITORS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredEventExhibitor(exhibitor: EventExhibitorRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredEventExhibitors();
    const updated = [exhibitor, ...existing];
    localStorage.setItem(EXHIBITORS_KEY, JSON.stringify(updated));

    const events = getStoredEvents();
    const nextEvents = events.map((ev) =>
      ev.id === exhibitor.eventId
        ? {
            ...ev,
            exhibitorsCount: (ev.exhibitorsCount || 0) + 1,
          }
        : ev
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEvents));
    window.dispatchEvent(new Event('sadza-events-updated'));
  } catch (err) {
    console.error('Failed to save exhibitor:', err);
  }
}

export function getStoredEventVenues(): EventVenueItem[] {
  if (typeof window === 'undefined') return DEFAULT_EVENT_VENUES;
  try {
    const raw = localStorage.getItem(VENUES_KEY);
    if (!raw) return DEFAULT_EVENT_VENUES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_EVENT_VENUES;
  } catch {
    return DEFAULT_EVENT_VENUES;
  }
}

export function saveStoredEventVenue(venue: EventVenueItem): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredEventVenues();
    const updated = [venue, ...existing.filter((v) => v.id !== venue.id)];
    localStorage.setItem(VENUES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('sadza-events-updated'));
  } catch (err) {
    console.error('Failed to save venue:', err);
  }
}

export function getStoredEventOrganizers(): EventOrganizerProfile[] {
  if (typeof window === 'undefined') return DEFAULT_EVENT_ORGANIZERS;
  try {
    const raw = localStorage.getItem(ORGANIZERS_KEY);
    if (!raw) return DEFAULT_EVENT_ORGANIZERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_EVENT_ORGANIZERS;
  } catch {
    return DEFAULT_EVENT_ORGANIZERS;
  }
}

export function saveStoredEventOrganizer(org: EventOrganizerProfile): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredEventOrganizers();
    const updated = [org, ...existing.filter((o) => o.id !== org.id)];
    localStorage.setItem(ORGANIZERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('sadza-events-updated'));
  } catch (err) {
    console.error('Failed to save organizer:', err);
  }
}
