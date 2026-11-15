import { Knex } from 'knex';

const DEFAULT_PROPERTIES = [
  {
    id: 'prop-1',
    title: 'Modern 3-Bedroom Executive Cluster Home with 5kVA Solar',
    slug: 'executive-3-bed-cluster-home-borrowdale',
    property_type: 'Residential Rent',
    category: 'House',
    province: 'Harare',
    city: 'Harare',
    suburb: 'Borrowdale West',
    price_usd: 1600.0,
    price_period: 'per_month',
    bedrooms: 3,
    bathrooms: 2,
    features: JSON.stringify([
      '5kVA Solar & Lithium Battery',
      'Reliable Borehole & 5000L Tank',
      '24/7 Gated Security',
      'Electric Fence & Intercom',
      'Fitted Kitchen & Gas Hob',
    ]),
    description:
      'Immaculately finished lock-up-and-go 3-bedroom cluster home in a quiet Borrowdale complex. Master bedroom en-suite, double lockup garage, lush private garden, and fully operational solar setup ensuring uninterrupted power and water supply.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    ]),
    advertiser_name: 'Heritage Real Estate (Pvt Ltd)',
    advertiser_type: 'Real Estate Agency',
    is_verified: true,
    whatsapp: '263772555666',
    phone: '+263 77 255 5666',
    posted_at: '2 days ago',
    is_featured: true,
    occupancy_status: 'Available',
    is_occupied: false,
  },
  {
    id: 'prop-2',
    title: 'High-Exposure Commercial Office Space (CBD / Avondale Corridor)',
    slug: 'commercial-office-space-avondale-harare',
    property_type: 'Commercial Rent',
    category: 'Office Space',
    province: 'Harare',
    city: 'Harare',
    suburb: 'Avondale',
    price_usd: 950.0,
    price_period: 'per_month',
    bedrooms: 4,
    bathrooms: 2,
    features: JSON.stringify([
      'Fibre Internet Ready (Liquid/TelOne)',
      'Dedicated Customer Parking (8 bays)',
      'Borehole Water',
      'ZESA Prepaid',
      'Guard House on Site',
    ]),
    description:
      'Standalone converted commercial property ideal for NGO headquarters, law firm, chartered accountancy, or consultancy clinic. Features 4 spacious private offices, boardroom, reception lobby, kitchenette, and generous customer parking.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80',
    ]),
    advertiser_name: 'ZimPrime Commercial Properties',
    advertiser_type: 'Property Manager',
    is_verified: true,
    whatsapp: '263774888999',
    phone: '+263 77 488 8999',
    posted_at: '1 day ago',
    is_featured: true,
    occupancy_status: 'Available',
    is_occupied: false,
  },
  {
    id: 'prop-3',
    title: 'Heavy Industrial Warehouse & Distribution Bay (Belmont)',
    slug: 'heavy-industrial-warehouse-belmont-bulawayo',
    property_type: 'Commercial Rent',
    category: 'Warehouse',
    province: 'Bulawayo',
    city: 'Bulawayo',
    suburb: 'Belmont Industrial',
    price_usd: 1400.0,
    price_period: 'per_month',
    bedrooms: null,
    bathrooms: 2,
    features: JSON.stringify([
      '650 sqm Covered Floor',
      '3-Phase Heavy Industrial Power',
      'Direct Articulated Truck Access',
      'Internal Admin Offices',
      'High Roller Shutter Doors',
    ]),
    description:
      'Premier industrial facility situated in the heart of Belmont, Bulawayo. Complete with overhead crane rails, 3-phase commercial electricity, secure perimeter, and easy turning radius for super-link trucks.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80',
    ]),
    advertiser_name: 'Matabeleland Industrial Properties',
    advertiser_type: 'Real Estate Agency',
    is_verified: true,
    whatsapp: '263771222333',
    phone: '+263 77 122 2333',
    posted_at: '3 days ago',
    is_featured: false,
    occupancy_status: 'Taken',
    is_occupied: true,
  },
  {
    id: 'prop-4',
    title: 'Fully Serviced Residential Stand (Gated Community with Title Deeds)',
    slug: 'serviced-residential-stand-marondera-mash-east',
    property_type: 'Stands & Land',
    category: 'Residential Stand',
    province: 'Mashonaland East',
    city: 'Marondera',
    suburb: 'Paradise Park Ext',
    price_usd: 18500.0,
    price_period: 'total',
    bedrooms: null,
    bathrooms: null,
    features: JSON.stringify([
      'Tarred Roads',
      'ZESA Lines Energized',
      'Council Water Connection',
      'Parent Title Deeds Available',
      'Ready to Build Immediately',
    ]),
    description:
      '1,200 sqm fully serviced prime residential stand in Marondera. ZESA transformers installed, tarred access roads, municipal water mains on site. Clean paperwork ready for direct deed transfer upon full settlement.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
    ]),
    advertiser_name: 'Sunrise Land Developers',
    advertiser_type: 'Developer',
    is_verified: true,
    whatsapp: '263773444555',
    phone: '+263 77 344 4555',
    posted_at: 'Just now',
    is_featured: true,
    occupancy_status: 'Available',
    is_occupied: false,
  },
  {
    id: 'prop-5',
    title: 'Cozy 2-Bedroom Garden Flat (Avondale West / Mt Pleasant)',
    slug: 'garden-flat-avondale-west-harare',
    property_type: 'Residential Rent',
    category: 'Apartment / Flat',
    province: 'Harare',
    city: 'Harare',
    suburb: 'Avondale West',
    price_usd: 750.0,
    price_period: 'per_month',
    bedrooms: 2,
    bathrooms: 1,
    features: JSON.stringify([
      'Prolific Borehole',
      'Solar Geyser',
      'Carport & Visitor Parking',
      'Quiet Complex (10 Units Only)',
      'Levies Included in Rent',
    ]),
    description:
      'Charming ground-floor 2-bedroom garden apartment with private courtyard garden. Spacious open-plan lounge and dining, neat fitted cupboards, solar geyser, and high security. Ideal for young professionals or small family.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80',
    ]),
    advertiser_name: 'Direct Landlord Management',
    advertiser_type: 'Direct Landlord',
    is_verified: true,
    whatsapp: '263772666777',
    phone: '+263 77 266 6777',
    posted_at: '4 days ago',
    is_featured: false,
    occupancy_status: 'Available',
    is_occupied: false,
  },
];

export async function up(knex: Knex): Promise<void> {
  const hasProperties = await knex.schema.hasTable('properties');
  if (!hasProperties) {
    await knex.schema.createTable('properties', (table) => {
      table.string('id', 64).primary();
      table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL').index();
      table.string('title', 255).notNullable();
      table.string('slug', 255).notNullable().unique();
      table.string('property_type', 60).notNullable().index();
      table.string('category', 60).notNullable().index();
      table.string('province', 60).notNullable().index();
      table.string('city', 100).notNullable();
      table.string('suburb', 100).notNullable();
      table.decimal('price_usd', 12, 2).notNullable();
      table.string('price_period', 30).notNullable().defaultTo('per_month');
      table.integer('bedrooms').nullable();
      table.integer('bathrooms').nullable();
      table.jsonb('features').notNullable().defaultTo('[]');
      table.text('description').notNullable();
      table.jsonb('images').notNullable().defaultTo('[]');
      table.string('advertiser_name', 255).notNullable();
      table.string('advertiser_type', 60).notNullable().defaultTo('Direct Landlord');
      table.boolean('is_verified').notNullable().defaultTo(false).index();
      table.string('whatsapp', 50).notNullable();
      table.string('phone', 50).notNullable();
      table.string('posted_at', 60).nullable();
      table.boolean('is_featured').notNullable().defaultTo(false).index();
      table.string('occupancy_status', 30).notNullable().defaultTo('Available').index();
      table.boolean('is_occupied').notNullable().defaultTo(false).index();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now()).index();
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    });

    // Create composite index for property searches
    await knex.raw(
      'CREATE INDEX IF NOT EXISTS idx_properties_province_type_cat ON properties(province, property_type, category);'
    );

    // Initial seed if table is empty
    const count = await knex('properties').count<{ count: string | number }[]>('id as count');
    const rowCount = Number(count[0]?.count || 0);
    if (rowCount === 0) {
      await knex('properties').insert(DEFAULT_PROPERTIES);
    }
  }

  const hasUnlocks = await knex.schema.hasTable('property_contact_unlocks');
  if (!hasUnlocks) {
    await knex.schema.createTable('property_contact_unlocks', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('property_id', 64).notNullable().references('id').inTable('properties').onDelete('CASCADE').index();
      table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL').index();
      table.string('customer_phone', 50).nullable();
      table.string('payment_method', 50).notNullable();
      table.string('payment_reference', 100).notNullable().unique();
      table.decimal('amount_usd', 10, 2).notNullable().defaultTo(2.0);
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now()).index();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('property_contact_unlocks');
  await knex.schema.dropTableIfExists('properties');
}
