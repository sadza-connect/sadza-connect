import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('contact_messages');
  if (!hasTable) {
    await knex.schema.createTable('contact_messages', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name', 255).notNullable();
      table.string('email', 255).notNullable();
      table.string('phone', 50).nullable();
      table.string('topic', 100).notNullable();
      table.text('message').notNullable();
      table.string('status', 50).notNullable().defaultTo('New');
      table.string('priority', 50).notNullable().defaultTo('Normal');
      table.text('admin_notes').nullable();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.index('email');
      table.index('status');
      table.index('priority');
      table.index('created_at');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('contact_messages');
}
