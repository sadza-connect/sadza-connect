import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasExtraConfig = await knex.schema.hasColumn('platform_settings', 'extra_config');
  if (!hasExtraConfig) {
    await knex.schema.alterTable('platform_settings', (table) => {
      table.jsonb('extra_config').defaultTo('{}');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasExtraConfig = await knex.schema.hasColumn('platform_settings', 'extra_config');
  if (hasExtraConfig) {
    await knex.schema.alterTable('platform_settings', (table) => {
      table.dropColumn('extra_config');
    });
  }
}
