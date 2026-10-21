import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasCustomPrice = await knex.schema.hasColumn('businesses', 'custom_monthly_price_usd');
  if (!hasCustomPrice) {
    await knex.schema.alterTable('businesses', (table) => {
      table.decimal('custom_monthly_price_usd', 8, 2).nullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasCustomPrice = await knex.schema.hasColumn('businesses', 'custom_monthly_price_usd');
  if (hasCustomPrice) {
    await knex.schema.alterTable('businesses', (table) => {
      table.dropColumn('custom_monthly_price_usd');
    });
  }
}
