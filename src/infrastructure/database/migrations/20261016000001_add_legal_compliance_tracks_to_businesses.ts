import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasOnboardingTrack = await knex.schema.hasColumn('businesses', 'onboarding_track');
  if (!hasOnboardingTrack) {
    await knex.schema.alterTable('businesses', (table) => {
      table.string('onboarding_track', 60).nullable().defaultTo('registered_entity');
      table.string('legal_form', 80).nullable().defaultTo('pvt_ltd');
      table.string('applicant_role', 60).nullable().defaultTo('owner');
      table.string('verification_badge', 100).nullable().defaultTo('Verified Registered Company');
      table.string('registration_number', 100).nullable();
      table.index('onboarding_track');
      table.index('legal_form');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasOnboardingTrack = await knex.schema.hasColumn('businesses', 'onboarding_track');
  if (hasOnboardingTrack) {
    await knex.schema.alterTable('businesses', (table) => {
      table.dropIndex('onboarding_track');
      table.dropIndex('legal_form');
      table.dropColumn('onboarding_track');
      table.dropColumn('legal_form');
      table.dropColumn('applicant_role');
      table.dropColumn('verification_badge');
      table.dropColumn('registration_number');
    });
  }
}
