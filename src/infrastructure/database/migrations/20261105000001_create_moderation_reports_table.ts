import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('moderation_reports');
  if (!hasTable) {
    await knex.schema.createTable('moderation_reports', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('business_id').nullable().references('id').inTable('businesses').onDelete('CASCADE');
      table.string('listing_title', 255).notNullable();
      table.string('listing_category', 100).notNullable();
      table.string('listing_image', 512).nullable();
      table.string('reason', 150).notNullable();
      table.text('complaint_details').notNullable();
      table.string('reporter_type', 50).notNullable().defaultTo('User');
      table.string('reporter_name', 150).nullable();
      table.string('reporter_email', 255).nullable();
      table.string('reporter_phone', 50).nullable();
      table.string('status', 50).notNullable().defaultTo('Under review');
      table.text('admin_notes').nullable();
      table.string('enforcement_action', 80).nullable();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.index('business_id');
      table.index('status');
      table.index('created_at');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('moderation_reports');
}
