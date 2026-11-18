import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasDays = await knex.schema.hasColumn('businesses', 'subscription_reminder_days');
  if (!hasDays) {
    await knex.schema.alterTable('businesses', (table) => {
      // Smallest reminder band (7 / 3 / 1 days) already sent for the current expiry date
      table.integer('subscription_reminder_days').nullable();
      // The subscription_expires_at value those reminders were sent for (resets on renewal)
      table.timestamp('subscription_reminder_for', { useTz: true }).nullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasDays = await knex.schema.hasColumn('businesses', 'subscription_reminder_days');
  if (hasDays) {
    await knex.schema.alterTable('businesses', (table) => {
      table.dropColumn('subscription_reminder_days');
      table.dropColumn('subscription_reminder_for');
    });
  }
}
