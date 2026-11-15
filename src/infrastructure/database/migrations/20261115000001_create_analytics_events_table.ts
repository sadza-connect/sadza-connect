import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('analytics_events');
  if (!exists) {
    await knex.schema.createTable('analytics_events', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('event_type', 50).notNullable().index(); // 'page_view', 'whatsapp_click', 'search', 'product_view', 'business_view', 'bill_payment'
      table.string('path', 255).notNullable().index(); // '/businesses', '/marketplace', etc.
      table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL').index();
      table.string('user_role', 50).nullable(); // 'customer', 'merchant', 'admin', 'guest'
      table.string('session_id', 100).nullable().index();
      table.string('province', 60).nullable().index(); // Harare, Bulawayo, Midlands, etc.
      table.string('device_type', 30).nullable(); // 'mobile', 'desktop', 'tablet'
      table.string('referrer', 255).nullable();
      table.jsonb('metadata').nullable().defaultTo('{}');
      table.string('ip_hash', 64).nullable(); // SHA-256 pseudonymized hash of client IP
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now()).index();
    });

    // Composite indexes for sub-millisecond aggregation queries
    await knex.raw('CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created ON analytics_events(event_type, created_at DESC);');
    await knex.raw('CREATE INDEX IF NOT EXISTS idx_analytics_events_path_created ON analytics_events(path, created_at DESC);');
    await knex.raw('CREATE INDEX IF NOT EXISTS idx_analytics_events_province_created ON analytics_events(province, created_at DESC);');
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('analytics_events');
}
