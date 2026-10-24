import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Update businesses table
  const hasProductLimit = await knex.schema.hasColumn('businesses', 'product_limit');
  if (!hasProductLimit) {
    await knex.schema.alterTable('businesses', (table) => {
      table.integer('product_limit').notNullable().defaultTo(25);
      table.string('catalog_tier', 50).notNullable().defaultTo('starter');
      table.integer('custom_product_limit').nullable();
      table.index('catalog_tier');
    });
  }

  // 2. Update platform_settings table
  const hasTierStarterLimit = await knex.schema.hasColumn('platform_settings', 'tier_starter_limit');
  if (!hasTierStarterLimit) {
    await knex.schema.alterTable('platform_settings', (table) => {
      table.string('tier_starter_name', 80).defaultTo('Starter Storefront');
      table.integer('tier_starter_limit').defaultTo(25);
      table.decimal('tier_starter_price_usd', 10, 2).defaultTo(15.0);

      table.string('tier_growth_name', 80).defaultTo('Growth Storefront');
      table.integer('tier_growth_limit').defaultTo(100);
      table.decimal('tier_growth_price_usd', 10, 2).defaultTo(25.0);

      table.string('tier_enterprise_name', 80).defaultTo('Enterprise Wholesaler');
      table.integer('tier_enterprise_limit').defaultTo(300);
      table.decimal('tier_enterprise_price_usd', 10, 2).defaultTo(50.0);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasProductLimit = await knex.schema.hasColumn('businesses', 'product_limit');
  if (hasProductLimit) {
    await knex.schema.alterTable('businesses', (table) => {
      table.dropIndex('catalog_tier');
      table.dropColumn('product_limit');
      table.dropColumn('catalog_tier');
      table.dropColumn('custom_product_limit');
    });
  }

  const hasTierStarterLimit = await knex.schema.hasColumn('platform_settings', 'tier_starter_limit');
  if (hasTierStarterLimit) {
    await knex.schema.alterTable('platform_settings', (table) => {
      table.dropColumn('tier_starter_name');
      table.dropColumn('tier_starter_limit');
      table.dropColumn('tier_starter_price_usd');
      table.dropColumn('tier_growth_name');
      table.dropColumn('tier_growth_limit');
      table.dropColumn('tier_growth_price_usd');
      table.dropColumn('tier_enterprise_name');
      table.dropColumn('tier_enterprise_limit');
      table.dropColumn('tier_enterprise_price_usd');
    });
  }
}
