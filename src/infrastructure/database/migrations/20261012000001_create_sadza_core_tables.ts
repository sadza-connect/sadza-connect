import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Categories Table
  await knex.schema.createTable('categories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.string('label', 100).notNullable();
    table.string('slug', 120).notNullable().unique();
    table.string('icon', 50);
    table.integer('count').notNullable().defaultTo(0);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('slug');
  });

  // 2. Businesses Table
  await knex.schema.createTable('businesses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('name', 150).notNullable();
    table.string('slug', 180).notNullable().unique();
    table.text('description');
    table.string('province', 60).notNullable();
    table.string('city', 60);
    table.string('address', 255);
    table.string('sector', 100);
    table.string('business_type', 80).notNullable().defaultTo('Registered Company (Pvt Ltd)');
    table.string('phone', 30);
    table.string('email', 255);
    table.string('whatsapp', 30);
    table.string('website', 255);
    table.string('logo_url', 512);
    table.string('cover_url', 512);
    table.specificType('gallery', 'jsonb').notNullable().defaultTo('[]');
    table.specificType('operating_hours', 'jsonb').notNullable().defaultTo('{}');
    table.boolean('is_verified').notNullable().defaultTo(false);
    table.string('verification_status', 30).notNullable().defaultTo('Pending');
    table.boolean('is_featured').notNullable().defaultTo(false);
    table.decimal('rating_avg', 3, 2).notNullable().defaultTo(0.0);
    table.integer('reviews_count').notNullable().defaultTo(0);
    table.integer('views_count').notNullable().defaultTo(0);
    table.integer('whatsapp_clicks').notNullable().defaultTo(0);
    table.specificType('kyc_documents', 'jsonb').notNullable().defaultTo('[]');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('slug');
    table.index('province');
    table.index('sector');
    table.index('is_verified');
    table.index('verification_status');
    table.index('is_featured');
  });

  // 3. Products Table
  await knex.schema.createTable('products', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('business_id').notNullable().references('id').inTable('businesses').onDelete('CASCADE');
    table.string('name', 200).notNullable();
    table.string('slug', 255).notNullable();
    table.text('description');
    table.string('category', 100);
    table.decimal('price_usd', 10, 2).notNullable();
    table.decimal('price_zig', 14, 2);
    table.specificType('images', 'jsonb').notNullable().defaultTo('[]');
    table.boolean('in_stock').notNullable().defaultTo(true);
    table.integer('stock_quantity').notNullable().defaultTo(1);
    table.string('condition', 40).notNullable().defaultTo('Brand New');
    table.boolean('is_featured').notNullable().defaultTo(false);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('business_id');
    table.index('slug');
    table.index('category');
    table.index('is_active');
  });

  // 4. Jobs Table
  await knex.schema.createTable('jobs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('business_id').notNullable().references('id').inTable('businesses').onDelete('CASCADE');
    table.string('company_name', 150).notNullable();
    table.string('title', 200).notNullable();
    table.string('slug', 255).notNullable();
    table.string('province', 60).notNullable();
    table.string('city', 60);
    table.string('job_type', 50).notNullable().defaultTo('Full-time');
    table.string('salary_usd', 80);
    table.string('category', 100);
    table.string('whatsapp', 30);
    table.text('description').notNullable();
    table.specificType('requirements', 'jsonb').notNullable().defaultTo('[]');
    table.boolean('is_featured').notNullable().defaultTo(false);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('business_id');
    table.index('slug');
    table.index('province');
    table.index('category');
    table.index('job_type');
    table.index('is_active');
  });

  // 5. Job Applications Table
  await knex.schema.createTable('job_applications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('job_id').notNullable().references('id').inTable('jobs').onDelete('CASCADE');
    table.string('applicant_name', 120).notNullable();
    table.string('applicant_email', 255).notNullable();
    table.string('applicant_phone', 30).notNullable();
    table.text('experience_summary');
    table.string('cv_file_name', 255);
    table.string('cv_url', 512);
    table.string('status', 40).notNullable().defaultTo('Submitted');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('job_id');
    table.index('applicant_email');
    table.index('status');
  });

  // 6. Adverts Table
  await knex.schema.createTable('adverts', (table) => {
    table.string('id', 60).primary(); // allows 'ad-1' or uuid
    table.uuid('business_id').references('id').inTable('businesses').onDelete('CASCADE');
    table.string('business_name', 150).notNullable();
    table.string('business_type', 80);
    table.string('province', 60).notNullable();
    table.string('category', 100).notNullable();
    table.string('offer_type', 60).notNullable();
    table.string('headline', 255).notNullable();
    table.text('offer_text').notNullable();
    table.string('promo_badge', 60);
    table.decimal('original_price_usd', 10, 2);
    table.decimal('promo_price_usd', 10, 2);
    table.decimal('price_zig', 14, 2);
    table.string('valid_until', 80);
    table.string('whatsapp', 30);
    table.string('phone', 30);
    table.string('image', 512);
    table.boolean('featured_on_home').notNullable().defaultTo(false);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('province');
    table.index('category');
    table.index('featured_on_home');
    table.index('is_active');
  });

  // 7. Bill Payments Table
  await knex.schema.createTable('bill_payments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('biller', 60).notNullable();
    table.string('account_number', 80).notNullable();
    table.string('meter_number', 80);
    table.decimal('amount_usd', 10, 2).notNullable();
    table.decimal('amount_zig', 14, 2);
    table.string('currency', 10).notNullable().defaultTo('USD');
    table.string('token', 60);
    table.decimal('units_kwh', 8, 2);
    table.string('payment_method', 60).notNullable();
    table.string('payment_reference', 100).unique();
    table.string('status', 30).notNullable().defaultTo('Completed');
    table.string('customer_name', 120);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('user_id');
    table.index('biller');
    table.index('meter_number');
    table.index('payment_reference');
  });

  // 8. Invoices Table
  await knex.schema.createTable('invoices', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('invoice_number', 60).notNullable().unique();
    table.uuid('business_id').references('id').inTable('businesses').onDelete('SET NULL');
    table.string('business_name', 150).notNullable();
    table.string('plan_type', 120).notNullable();
    table.decimal('amount_usd', 10, 2).notNullable();
    table.string('payment_method', 60).notNullable();
    table.string('period_covered', 120);
    table.string('status', 30).notNullable().defaultTo('Paid');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('invoice_number');
    table.index('business_id');
    table.index('status');
  });

  // 9. Orders Table
  await knex.schema.createTable('orders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('order_number', 60).notNullable().unique();
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('customer_name', 120).notNullable();
    table.string('customer_phone', 30).notNullable();
    table.string('customer_address', 255);
    table.uuid('business_id').references('id').inTable('businesses').onDelete('SET NULL');
    table.string('business_name', 150).notNullable();
    table.specificType('items', 'jsonb').notNullable().defaultTo('[]');
    table.decimal('total_usd', 10, 2).notNullable();
    table.string('waybill_number', 60);
    table.string('carrier', 80);
    table.string('status', 40).notNullable().defaultTo('Processing');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('order_number');
    table.index('user_id');
    table.index('business_id');
    table.index('waybill_number');
    table.index('status');
  });

  // 10. Platform Settings Table
  await knex.schema.createTable('platform_settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.decimal('usd_to_zig_rate', 10, 2).notNullable().defaultTo(26.5);
    table.decimal('monthly_subscription_price_usd', 10, 2).notNullable().defaultTo(10.0);
    table.decimal('sponsored_advert_price_usd', 10, 2).notNullable().defaultTo(20.0);
    table.integer('free_grace_period_days').notNullable().defaultTo(30);
    table.string('support_whatsapp', 30).notNullable().defaultTo('263771000000');
    table.string('support_phone', 30).notNullable().defaultTo('+263 77 100 0000');
    table.string('support_email', 255).notNullable().defaultTo('support@sadzaconnect.co.zw');
    table.string('hq_address', 255).defaultTo('Africdominion House, 5th Street, Central Business District, Midlands');
    table.string('harare_address', 255).defaultTo('Eastlea Commercial Park, Samora Machel Avenue, Harare');
    table.string('operating_hours', 255).defaultTo('Monday – Friday: 08:00 – 17:00 CAT');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // 11. ID Cards Table
  await knex.schema.createTable('id_cards', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('card_number', 60).notNullable().unique();
    table.uuid('business_id').references('id').inTable('businesses').onDelete('CASCADE');
    table.string('business_name', 150).notNullable();
    table.string('member_name', 120).notNullable();
    table.string('member_role', 80).notNullable();
    table.string('national_id', 40);
    table.date('issue_date');
    table.date('expiry_date');
    table.string('status', 30).notNullable().defaultTo('Active');
    table.text('qr_code_payload');
    table.string('photo_url', 512);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('card_number');
    table.index('business_id');
    table.index('status');
  });

  // 12. Notifications Table
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('title', 200).notNullable();
    table.text('message').notNullable();
    table.string('category', 50).notNullable();
    table.string('action_url', 255);
    table.string('action_label', 100);
    table.string('severity', 20).notNullable().defaultTo('info');
    table.boolean('is_read').notNullable().defaultTo(false);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index('user_id');
    table.index('category');
    table.index('is_read');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('id_cards');
  await knex.schema.dropTableIfExists('platform_settings');
  await knex.schema.dropTableIfExists('orders');
  await knex.schema.dropTableIfExists('invoices');
  await knex.schema.dropTableIfExists('bill_payments');
  await knex.schema.dropTableIfExists('adverts');
  await knex.schema.dropTableIfExists('job_applications');
  await knex.schema.dropTableIfExists('jobs');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('businesses');
  await knex.schema.dropTableIfExists('categories');
}
