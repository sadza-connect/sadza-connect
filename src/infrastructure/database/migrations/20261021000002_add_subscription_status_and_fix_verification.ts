import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasSubscriptionStatus = await knex.schema.hasColumn('businesses', 'subscription_status');
  if (!hasSubscriptionStatus) {
    await knex.schema.alterTable('businesses', (table) => {
      table.string('subscription_status', 50).notNullable().defaultTo('Month 1 Grace Period');
      table.timestamp('subscription_expires_at').nullable();
      table.index('subscription_status');
    });
  }

  // Remove the old default on verification_badge so unverified businesses are null by default
  await knex.raw(`
    ALTER TABLE businesses ALTER COLUMN verification_badge DROP DEFAULT;
  `);

  // Reset verification_badge to NULL for all businesses that are not approved by an admin
  await knex('businesses')
    .where('is_verified', false)
    .orWhereNot('verification_status', 'Verified')
    .update({
      verification_badge: null,
      verification_status: 'Pending',
    });

  // Calculate subscription_status based on 30-day grace period
  await knex.raw(`
    UPDATE businesses
    SET subscription_status = CASE
      WHEN subscription_status = 'Paid Subscriber' THEN 'Paid Subscriber'
      WHEN created_at < NOW() - INTERVAL '30 days' THEN 'Expired'
      ELSE 'Month 1 Grace Period'
    END,
    subscription_expires_at = CASE
      WHEN subscription_status = 'Paid Subscriber' THEN NOW() + INTERVAL '30 days'
      ELSE created_at + INTERVAL '30 days'
    END;
  `);
}

export async function down(knex: Knex): Promise<void> {
  const hasSubscriptionStatus = await knex.schema.hasColumn('businesses', 'subscription_status');
  if (hasSubscriptionStatus) {
    await knex.schema.alterTable('businesses', (table) => {
      table.dropIndex('subscription_status');
      table.dropColumn('subscription_status');
      table.dropColumn('subscription_expires_at');
    });
  }
}
