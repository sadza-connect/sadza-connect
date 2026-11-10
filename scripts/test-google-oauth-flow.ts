import { randomUUID } from 'node:crypto';
import { AuthService } from '../src/application/auth/auth-service.js';
import { businessRepository } from '../src/infrastructure/database/repositories/business-repository.js';
import { getDb } from '../src/infrastructure/database/connection.js';

async function main() {
  console.log('--- Testing Google OAuth 2.0 Domain & Service Flows ---');
  const authService = new AuthService();
  const db = getDb();

  const personalEmail = `oauth-personal-${Date.now()}@gmail.com`;
  const personalGoogleId = `google-sub-personal-${Date.now()}`;
  const businessEmail = `oauth-business-${Date.now()}@gmail.com`;
  const businessGoogleId = `google-sub-business-${Date.now()}`;
  const linkedEmail = `oauth-linked-${Date.now()}@gmail.com`;
  const linkedGoogleId = `google-sub-linked-${Date.now()}`;

  const createdUserIds: string[] = [];

  try {
    // 1. New Personal User via Google
    const personalRes = await authService.authenticateWithGoogle({
      googleId: personalGoogleId,
      email: personalEmail,
      fullName: 'Tatenda Shopper',
      avatarUrl: 'https://lh3.googleusercontent.com/a/test-avatar',
      requestedAccountType: 'personal',
    });
    createdUserIds.push(personalRes.user.id);

    if (!personalRes.isNewUser) throw new Error('Expected personal user to be flagged as isNewUser');
    if (personalRes.user.role !== 'customer') throw new Error(`Expected role=customer, got ${personalRes.user.role}`);
    if (personalRes.user.accountType !== 'personal') throw new Error(`Expected accountType=personal, got ${personalRes.user.accountType}`);
    if (!personalRes.user.isVerified) throw new Error('Expected Google user to be auto-verified');
    if (!personalRes.tokens.accessToken) throw new Error('Expected accessToken to be issued');
    console.log('✅ PASS 1: New personal user created via Google (role=customer, verified=true, direct access).');

    // Verify attempting password login on a Google-only user fails gracefully with guidance
    let caughtOAuthGuard = false;
    try {
      await authService.login(personalEmail, 'SomePassword123!');
    } catch (err: any) {
      if (err?.message?.includes('Continue with Google')) {
        caughtOAuthGuard = true;
      }
    }
    if (!caughtOAuthGuard) throw new Error('Expected graceful Google Sign-In guidance when logging in with password on Google-only account');
    console.log('✅ PASS 2: Google-only account guards password login with helpful prompt.');

    // 2. New Business Merchant via Google
    const bizRes = await authService.authenticateWithGoogle({
      googleId: businessGoogleId,
      email: businessEmail,
      fullName: 'Chipo Merchant',
      avatarUrl: 'https://lh3.googleusercontent.com/a/test-biz-avatar',
      requestedAccountType: 'business',
    });
    createdUserIds.push(bizRes.user.id);

    if (!bizRes.isNewUser) throw new Error('Expected business user to be flagged as isNewUser');
    if (bizRes.user.role !== 'merchant') throw new Error(`Expected role=merchant, got ${bizRes.user.role}`);
    if (bizRes.user.accountType !== 'business') throw new Error(`Expected accountType=business, got ${bizRes.user.accountType}`);
    const bizList = await businessRepository.findByUserId(bizRes.user.id);
    if (bizList.length !== 0) throw new Error('Expected new business Google user to have 0 storefronts initially -> triggers /onboarding/business');
    console.log('✅ PASS 3: New business user created via Google (role=merchant, 0 storefronts -> triggers /onboarding/business).');

    // 3. Existing Email Account Linking with Google
    const localReg = await authService.register({
      accountType: 'personal',
      fullName: 'Existing Local User',
      email: linkedEmail,
      password: 'StrongPassword123!',
    });
    createdUserIds.push(localReg.user.id);

    const linkedRes = await authService.authenticateWithGoogle({
      googleId: linkedGoogleId,
      email: linkedEmail,
      fullName: 'Existing Local User',
      requestedAccountType: 'personal',
    });

    if (linkedRes.isNewUser) throw new Error('Expected existing email account NOT to create a duplicate user');
    if (linkedRes.user.id !== localReg.user.id) throw new Error('Expected Google sign-in to link to existing user ID');
    if (linkedRes.user.googleId !== linkedGoogleId) throw new Error('Expected googleId to be saved on linked user');
    console.log('✅ PASS 4: Existing email account seamlessly linked with Google ID without duplication.');

    // 4. Subsequent Sign-In via Google ID lookup
    const repeatRes = await authService.authenticateWithGoogle({
      googleId: personalGoogleId,
      email: personalEmail,
      fullName: 'Tatenda Shopper',
    });
    if (repeatRes.isNewUser || repeatRes.user.id !== personalRes.user.id) {
      throw new Error('Expected repeat Google login to resolve existing user by google_id');
    }
    console.log('✅ PASS 5: Repeat login resolves directly by google_id.');

    console.log('--- All 5 Google OAuth 2.0 tests PASSED! ---');
  } finally {
    if (createdUserIds.length > 0) {
      await db('refresh_tokens').whereIn('user_id', createdUserIds).delete();
      await db('email_verification_tokens').whereIn('user_id', createdUserIds).delete();
      await db('users').whereIn('id', createdUserIds).delete();
      console.log(`Cleaned up ${createdUserIds.length} test user records from database.`);
    }
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('❌ Google OAuth test failed:', err);
  process.exit(1);
});
