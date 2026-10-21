import bcrypt from 'bcryptjs';
import { getDb } from '../src/infrastructure/database/connection.js';

async function main() {
  const args = process.argv.slice(2);

  console.log('================================================================');
  console.log('🛡️  Sadza Connect — Administrator Account Provisioning Tool');
  console.log('================================================================\n');

  if (args.length < 2) {
    console.log('Usage:');
    console.log('  npx tsx scripts/create-admin.ts <email> <password> [fullName] [phone]\n');
    console.log('Example:');
    console.log('  npx tsx scripts/create-admin.ts supervisor@sadzaconnect.co.zw ComplexPass2026! "Chipo Mandaza" "+263772111222"\n');
    process.exit(1);
  }

  const [rawEmail, password, rawFullName, rawPhone] = args;
  const email = rawEmail.trim().toLowerCase();
  const fullName = rawFullName?.trim() || 'Platform Administrator';
  const phone = rawPhone?.trim() || '+263771000000';

  if (!email.includes('@')) {
    console.error('❌ Error: Invalid email address provided.');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters long.');
    process.exit(1);
  }

  const db = getDb();

  try {
    const existing = await db('users').whereRaw('LOWER(email) = ?', [email]).first();

    const passwordHash = await bcrypt.hash(password, 10);

    if (existing) {
      console.log(`ℹ️  User "${email}" already exists (Current Role: ${existing.role}).`);
      console.log('🔄 Promoting user to Administrator and updating credentials...');

      await db('users')
        .where({ id: existing.id })
        .update({
          role: 'admin',
          account_type: 'business',
          status: 'active',
          is_verified: true,
          password_hash: passwordHash,
          full_name: fullName !== 'Platform Administrator' ? fullName : existing.full_name,
          phone_number: phone !== '+263771000000' ? phone : existing.phone_number,
          updated_at: db.fn.now(),
        });

      console.log(`\n🎉 User "${email}" has been successfully promoted to ADMIN!`);
      console.log(`   - User ID: ${existing.id}`);
      console.log(`   - Role: admin`);
      console.log(`   - Status: active (Verified)`);
    } else {
      console.log(`✨ Provisioning new Administrator account for "${email}"...`);

      const [created] = await db('users')
        .insert({
          email,
          password_hash: passwordHash,
          full_name: fullName,
          role: 'admin',
          account_type: 'business',
          status: 'active',
          is_verified: true,
          phone_number: phone,
          province: 'Harare Province',
          created_at: db.fn.now(),
          updated_at: db.fn.now(),
        })
        .returning('*');

      console.log(`\n🎉 Administrator account created successfully!`);
      console.log(`   - User ID: ${created.id}`);
      console.log(`   - Email: ${created.email}`);
      console.log(`   - Full Name: ${created.full_name}`);
      console.log(`   - Role: ${created.role}`);
      console.log(`   - Status: ${created.status} (Verified)`);
    }

    console.log('\n✅ You can now sign in at http://localhost:3000/login with these credentials.');
    console.log('   The system will automatically route you to the Executive Admin HQ (/admin).');
  } catch (err) {
    console.error('❌ Failed to provision administrator:', err);
    process.exit(1);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

main();
