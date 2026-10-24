import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasHeroHeadline = await knex.schema.hasColumn('platform_settings', 'hero_headline');
  if (!hasHeroHeadline) {
    await knex.schema.alterTable('platform_settings', (table) => {
      table.string('hero_headline', 255).defaultTo('Connecting Zimbabwean Businesses, Customers & Everyday Trade');
      table.text('hero_subtitle').defaultTo('Discover verified local suppliers, shop marketplace items, find job vacancies, and recharge utility tokens across Harare, Bulawayo, Mutare, Gweru, and all 10 provinces.');
      table.jsonb('home_slides').defaultTo('[]');
      table.jsonb('why_reasons').defaultTo('[]');
      table.jsonb('process_steps').defaultTo('[]');
      table.string('about_headline', 255).defaultTo('Zimbabwe’s Unified Digital Commercial Infrastructure');
      table.text('about_mission').nullable();
      table.text('about_vision').nullable();
      table.jsonb('core_values').defaultTo('[]');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasHeroHeadline = await knex.schema.hasColumn('platform_settings', 'hero_headline');
  if (hasHeroHeadline) {
    await knex.schema.alterTable('platform_settings', (table) => {
      table.dropColumn('hero_headline');
      table.dropColumn('hero_subtitle');
      table.dropColumn('home_slides');
      table.dropColumn('why_reasons');
      table.dropColumn('process_steps');
      table.dropColumn('about_headline');
      table.dropColumn('about_mission');
      table.dropColumn('about_vision');
      table.dropColumn('core_values');
    });
  }
}
