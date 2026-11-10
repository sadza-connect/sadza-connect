import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasGoogleId = await knex.schema.hasColumn('users', 'google_id');
  const hasAuthProvider = await knex.schema.hasColumn('users', 'auth_provider');

  await knex.schema.alterTable('users', (table) => {
    if (!hasGoogleId) {
      table.string('google_id', 255).nullable().unique();
      table.index('google_id');
    }
    if (!hasAuthProvider) {
      table.string('auth_provider', 30).notNullable().defaultTo('local');
    }
    table.string('password_hash', 255).nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  const hasGoogleId = await knex.schema.hasColumn('users', 'google_id');
  const hasAuthProvider = await knex.schema.hasColumn('users', 'auth_provider');

  await knex.schema.alterTable('users', (table) => {
    if (hasGoogleId) {
      table.dropColumn('google_id');
    }
    if (hasAuthProvider) {
      table.dropColumn('auth_provider');
    }
  });
}
