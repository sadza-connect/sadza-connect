import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasFirstVerifiedAt = await knex.schema.hasColumn('businesses', 'first_verified_at');
  if (!hasFirstVerifiedAt) {
    await knex.schema.alterTable('businesses', (table) => {
      table.timestamp('first_verified_at', { useTz: true }).nullable();
      table.timestamp('verified_at', { useTz: true }).nullable();
      table.index('first_verified_at');
    });
  }

  // Backfill first_verified_at for all already-verified businesses
  await knex.raw(`
    UPDATE businesses
    SET
      first_verified_at = COALESCE(updated_at, created_at, NOW()),
      verified_at = COALESCE(updated_at, created_at, NOW())
    WHERE (is_verified = true OR verification_status = 'Verified')
      AND first_verified_at IS NULL;
  `);

  // Align subscription_expires_at with first_verified_at for already-verified businesses in grace period
  await knex.raw(`
    UPDATE businesses
    SET subscription_expires_at = first_verified_at + INTERVAL '30 days'
    WHERE first_verified_at IS NOT NULL
      AND subscription_status = 'Month 1 Grace Period';
  `);
}

export async function down(knex: Knex): Promise<void> {
  const hasFirstVerifiedAt = await knex.schema.hasColumn('businesses', 'first_verified_at');
  if (hasFirstVerifiedAt) {
    await knex.schema.alterTable('businesses', (table) => {
      table.dropIndex('first_verified_at');
      table.dropColumn('first_verified_at');
      table.dropColumn('verified_at');
    });
  }
}
