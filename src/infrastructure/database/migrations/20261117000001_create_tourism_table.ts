import { Knex } from 'knex';

const DEFAULT_TOURISMS = [
  {
    id: 'tour-1',
    name: 'Zambezi Sunset Safari Lodge & River Chalets',
    slug: 'zambezi-sunset-safari-lodge-victoria-falls',
    category: 'Lodges & Safari Camps',
    destination_area: 'Victoria Falls',
    province: 'Matabeleland North',
    city: 'Victoria Falls',
    address_or_location: 'Zambezi Drive, Riverfront Corridor, Victoria Falls',
    price_per_night_usd: 185.0,
    guests_capacity: 4,
    bedrooms: 2,
    amenities: JSON.stringify([
      'Infinity Pool overlooking Zambezi',
      'Daily Guided Game Drives',
      'Solar Power & 24/7 Backup',
      'High-Speed Fibre Wi-Fi',
      'Complimentary Full English Breakfast',
      'Airport Shuttle Service',
      'On-site Restaurant & Cocktail Deck',
    ]),
    description:
      'Immerse yourself in quintessential African wilderness only 10 minutes from the majestic Victoria Falls rainforest. Features private teak chalets with river vistas, wildlife viewing direct from your private veranda, and world-class Zimbabwean hospitality.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80',
    ]),
    host_name: 'Victoria Falls Wilderness Hospitality',
    host_type: 'Safari Lodge Operator',
    is_verified: true,
    is_featured: true,
    whatsapp: '263772888111',
    phone: '+263 77 288 8111',
    rating: 4.9,
    reviews_count: 38,
    posted_at: 'Verified Partner',
  },
  {
    id: 'tour-2',
    name: 'Troutbeck Mist Mountain Chalets & Trout Lodge',
    slug: 'troutbeck-mist-mountain-chalets-nyanga',
    category: 'Self-Catering Cottages & Chalets',
    destination_area: 'Nyanga & Eastern Highlands',
    province: 'Manicaland',
    city: 'Nyanga',
    address_or_location: 'Troutbeck Valley, Inyanga Mountains',
    price_per_night_usd: 120.0,
    guests_capacity: 6,
    bedrooms: 3,
    amenities: JSON.stringify([
      'Cozy Stone Log Fireplaces (Pine Wood Provided)',
      'Private Trout Dam Access & Fishing Permits',
      'Solar Geysers & Continuous Spring Water',
      'Fitted Country Kitchen & Gas Stove',
      'Golf Course & Horse Riding Access',
      'Panoramic Mountain Pine Views',
    ]),
    description:
      'Tranquil highland retreat nestled in the crisp, misty pine forests of Nyanga. Fully equipped luxury 3-bedroom stone chalets complete with wood-burning fireplace, trout dam frontage, and direct hiking trails to World’s View.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80',
    ]),
    host_name: 'Eastern Highlands Leisure Group',
    host_type: 'Hotel / Resort Group',
    is_verified: true,
    is_featured: true,
    whatsapp: '263773999222',
    phone: '+263 77 399 9222',
    rating: 4.8,
    reviews_count: 44,
    posted_at: 'Verified Partner',
  },
  {
    id: 'tour-3',
    name: 'Kariba Horizon Luxury Houseboat & Lake Cruiser',
    slug: 'kariba-horizon-luxury-houseboat',
    category: 'Houseboats & Lake Stays',
    destination_area: 'Kariba & Lake Stays',
    province: 'Mashonaland West',
    city: 'Kariba',
    address_or_location: 'Andora Harbour, Lake Kariba',
    price_per_night_usd: 290.0,
    guests_capacity: 8,
    bedrooms: 4,
    amenities: JSON.stringify([
      'Splash Pool on Top Sundeck',
      'Captain, Chef & Deckhand Fully Catered',
      '2 Tender Tender Boats for Tiger Fishing',
      'Generator & Inverter Power System',
      'Air-Conditioned En-suite Cabins',
      'Sunset Viewing Lounge & Bar',
    ]),
    description:
      'Experience the magic of Lake Kariba aboard a private luxury cruiser. Glide past drowned petrified trees, witness herds of elephants swimming along the Matusadona shoreline, and enjoy freshly caught bream cooked to perfection by your onboard chef.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80',
    ]),
    host_name: 'Zambezi Cruise & Charters Ltd',
    host_type: 'Safari Lodge Operator',
    is_verified: true,
    is_featured: true,
    whatsapp: '263774111333',
    phone: '+263 77 411 1333',
    rating: 5.0,
    reviews_count: 29,
    posted_at: 'Verified Partner',
  },
  {
    id: 'tour-4',
    name: 'Borrowdale Brooke Executive Garden BnB & Suites',
    slug: 'borrowdale-brooke-executive-garden-bnb',
    category: 'Bed & Breakfast (BnB)',
    destination_area: 'Harare & Suburbs',
    province: 'Harare',
    city: 'Harare',
    address_or_location: 'Borrowdale Brooke Golf Estate Access, Harare North',
    price_per_night_usd: 75.0,
    guests_capacity: 2,
    bedrooms: 1,
    amenities: JSON.stringify([
      'Gated Golf Estate 24/7 Security',
      'Reliable Solar Power & Pure Borehole Water',
      'Gourmet Fresh Cooked Breakfast Included',
      'Dedicated Ergonomic Work Desk & Fibre Wi-Fi',
      'Smart TV with DSTV Premium & Netflix',
      'Private Garden Patio Entry',
    ]),
    description:
      'Premier executive guesthouse in Harare’s safest and most prestigious suburb. Perfectly curated for business consultants, diaspora returnees, and diplomatic travellers seeking tranquility, high security, uninterrupted utilities, and personalized breakfast service.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
    ]),
    host_name: 'Mrs. S. Marowa (Direct Host)',
    host_type: 'Private BnB Host',
    is_verified: true,
    is_featured: false,
    whatsapp: '263772555777',
    phone: '+263 77 255 5777',
    rating: 4.9,
    reviews_count: 52,
    posted_at: 'Superhost Verified',
  },
  {
    id: 'tour-5',
    name: 'Matobo Granite Whispers Safari Camp',
    slug: 'matobo-granite-whispers-safari-camp',
    category: 'Lodges & Safari Camps',
    destination_area: 'Bulawayo & Matopos',
    province: 'Matabeleland South',
    city: 'Matobo',
    address_or_location: 'Matobo National Park Boundary, 35km from Bulawayo',
    price_per_night_usd: 140.0,
    guests_capacity: 3,
    bedrooms: 1,
    amenities: JSON.stringify([
      'Rhino Tracking Safari Walks with Professional Guides',
      'Historic San Rock Art Cave Excursions',
      'Open-air Boma Campfire & Traditional Dining',
      'Solar Powered Sustainable Eco-Lodging',
      'Spectacular Balancing Rock Formations',
    ]),
    description:
      'Built harmoniously into ancient granite whalebacks of Matobo Hills. Renowned for intimate black & white rhino tracking, historic San bushman rock paintings, and breathtaking starry nights around the crackling boma fire.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    ]),
    host_name: 'Matopo Heritage Safaris',
    host_type: 'Safari Lodge Operator',
    is_verified: true,
    is_featured: true,
    whatsapp: '263771333444',
    phone: '+263 77 133 3444',
    rating: 4.9,
    reviews_count: 31,
    posted_at: 'Verified Partner',
  },
  {
    id: 'tour-6',
    name: 'Great Zimbabwe Heritage Hotel & Cultural Village',
    slug: 'great-zimbabwe-heritage-hotel',
    category: 'Hotels & Resorts',
    destination_area: 'Great Zimbabwe & Masvingo',
    province: 'Masvingo',
    city: 'Masvingo',
    address_or_location: 'Lake Mutirikwi Road, Great Zimbabwe National Monument',
    price_per_night_usd: 95.0,
    guests_capacity: 4,
    bedrooms: 2,
    amenities: JSON.stringify([
      'Walking Distance to UNESCO World Heritage Ruins',
      'Lake Mutirikwi Boat Trips & Bass Fishing',
      'Traditional Shona Cultural Dance Performances',
      'Sparkling Swimming Pool & Tennis Court',
      'Conference & Wedding Banquet Facilities',
    ]),
    description:
      'Immerse in the medieval architecture and rich history of the Kingdom of Great Zimbabwe. Located alongside Lake Mutirikwi with verdant gardens, traditional architecture, and guided sunrise tours to the Conical Tower and Hill Complex.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
    ]),
    host_name: 'Heritage Hotels of Zimbabwe',
    host_type: 'Hotel / Resort Group',
    is_verified: true,
    is_featured: false,
    whatsapp: '263775222666',
    phone: '+263 77 522 2666',
    rating: 4.7,
    reviews_count: 26,
    posted_at: 'Verified Partner',
  },
  {
    id: 'tour-7',
    name: 'Vumba Cloud Forest Botanical Guesthouse',
    slug: 'vumba-cloud-forest-botanical-guesthouse',
    category: 'Bed & Breakfast (BnB)',
    destination_area: 'Vumba Mountains',
    province: 'Manicaland',
    city: 'Mutare',
    address_or_location: 'Bvumba Botanical Gardens Highway, Mutare',
    price_per_night_usd: 65.0,
    guests_capacity: 2,
    bedrooms: 1,
    amenities: JSON.stringify([
      'Highland Forest Mist Canopy Views into Mozambique',
      'Renowned Fresh Scones & Coffee Veranda',
      'Rare Samango Monkey & Bird Watching Walks',
      'Cozy Feather Duvets & Wall Heaters',
      'Organic Farm Fresh Breakfast',
    ]),
    description:
      'Perched high in the mystical cloud forests of the Bvumba mountains. Famous for panoramic views overlooking Mozambican valleys, ancient tree ferns, and tranquil afternoon teas accompanied by warm homemade scones.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507038772120-7ffe76778f01?auto=format&fit=crop&w=1000&q=80',
    ]),
    host_name: 'Vumba Highlands Hospitality',
    host_type: 'Guesthouse Manager',
    is_verified: true,
    is_featured: false,
    whatsapp: '263776444888',
    phone: '+263 77 644 4888',
    rating: 4.8,
    reviews_count: 37,
    posted_at: 'Verified Partner',
  },
];

export async function up(knex: Knex): Promise<void> {
  const hasTourism = await knex.schema.hasTable('tourism_listings');
  if (!hasTourism) {
    await knex.schema.createTable('tourism_listings', (table) => {
      table.string('id', 64).primary();
      table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL').index();
      table.string('name', 255).notNullable();
      table.string('slug', 255).notNullable().unique();
      table.string('category', 80).notNullable().index();
      table.string('destination_area', 120).notNullable().index();
      table.string('province', 80).notNullable().index();
      table.string('city', 100).notNullable();
      table.string('address_or_location', 255).notNullable();
      table.decimal('price_per_night_usd', 12, 2).notNullable();
      table.integer('guests_capacity').nullable().defaultTo(2);
      table.integer('bedrooms').nullable().defaultTo(1);
      table.jsonb('amenities').notNullable().defaultTo('[]');
      table.text('description').notNullable();
      table.jsonb('images').notNullable().defaultTo('[]');
      table.string('host_name', 255).notNullable();
      table.string('host_type', 80).notNullable().defaultTo('Private BnB Host');
      table.boolean('is_verified').notNullable().defaultTo(false).index();
      table.boolean('is_featured').notNullable().defaultTo(false).index();
      table.string('whatsapp', 50).notNullable();
      table.string('phone', 50).notNullable();
      table.string('email', 255).nullable();
      table.decimal('rating', 3, 2).notNullable().defaultTo(5.0);
      table.integer('reviews_count').notNullable().defaultTo(0);
      table.string('posted_at', 60).nullable();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now()).index();
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    });

    await knex.raw(
      'CREATE INDEX IF NOT EXISTS idx_tourism_prov_dest_cat ON tourism_listings(province, destination_area, category);'
    );

    const count = await knex('tourism_listings').count<{ count: string | number }[]>('id as count');
    const rowCount = Number(count[0]?.count || 0);
    if (rowCount === 0) {
      await knex('tourism_listings').insert(DEFAULT_TOURISMS);
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tourism_listings');
}
