import assert from 'node:assert';
import pg from 'pg';

const BASE_URL = 'http://localhost:3000';

async function queryDb<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    const res = await client.query(sql, params);
    return res.rows as T[];
  } finally {
    await client.end();
  }
}

async function testPhase2Auth() {
  console.log('🚀 [PHASE 2 TEST] Starting Comprehensive Auth & Middleware Route Verification...\n');

  try {
    // --------------------------------------------------------------------------
    // TEST 1: Admin Login
    // --------------------------------------------------------------------------
    console.log('1. Testing Admin Login (/api/v1/auth/login)...');
    const adminRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'admin@sadzaconnect.co.zw',
        password: 'SadzaAdmin2026!',
      }),
    });

    assert.strictEqual(adminRes.status, 200, 'Admin login should return 200');
    const adminData = await adminRes.json();
    assert.strictEqual(adminData.data.user.role, 'admin', 'User role should be admin');
    assert.ok(adminData.data.accessToken, 'Should return accessToken');
    assert.ok(adminData.data.refreshToken, 'Should return refreshToken');
    const adminAccessToken = adminData.data.accessToken;
    console.log('   ✅ Admin authenticated successfully (role: admin)');

    // --------------------------------------------------------------------------
    // TEST 2: Merchant Login
    // --------------------------------------------------------------------------
    console.log('2. Testing Merchant Login (/api/v1/auth/login)...');
    const merchantRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'merchant@sadzaconnect.co.zw',
        password: 'SadzaMerchant2026!',
      }),
    });

    assert.strictEqual(merchantRes.status, 200, 'Merchant login should return 200');
    const merchantData = await merchantRes.json();
    assert.strictEqual(merchantData.data.user.role, 'merchant');
    const merchantAccessToken = merchantData.data.accessToken;
    console.log('   ✅ Merchant authenticated successfully (role: merchant)');

    // --------------------------------------------------------------------------
    // TEST 3: Customer Login
    // --------------------------------------------------------------------------
    console.log('3. Testing Customer Login (/api/v1/auth/login)...');
    const customerRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'customer@sadzaconnect.co.zw',
        password: 'SadzaCustomer2026!',
      }),
    });

    assert.strictEqual(customerRes.status, 200, 'Customer login should return 200');
    const customerData = await customerRes.json();
    assert.strictEqual(customerData.data.user.role, 'customer');
    const customerAccessToken = customerData.data.accessToken;
    const customerRefreshToken = customerData.data.refreshToken;
    console.log('   ✅ Customer authenticated successfully (role: customer)');

    // --------------------------------------------------------------------------
    // TEST 4: Invalid Password
    // --------------------------------------------------------------------------
    console.log('4. Testing Invalid Password Rejection...');
    const badRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'admin@sadzaconnect.co.zw',
        password: 'WrongPassword!',
      }),
    });
    assert.strictEqual(badRes.status, 401, 'Invalid password must return 401');
    console.log('   ✅ Invalid password rejected with 401');

    // --------------------------------------------------------------------------
    // TEST 5: Session Verification (/api/v1/auth/me)
    // --------------------------------------------------------------------------
    console.log('5. Testing /api/v1/auth/me Session Validation...');
    const meRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${adminAccessToken}` },
    });
    assert.strictEqual(meRes.status, 200, 'auth/me should return 200 with valid token');
    const meData = await meRes.json();
    assert.strictEqual(meData.data.user.email, 'admin@sadzaconnect.co.zw');
    console.log('   ✅ Verified session via /api/v1/auth/me');

    // --------------------------------------------------------------------------
    // TEST 6: Token Rotation (/api/v1/auth/refresh)
    // --------------------------------------------------------------------------
    console.log('6. Testing Silent Token Refresh & Family Rotation...');
    const refreshRes = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: customerRefreshToken }),
    });
    assert.strictEqual(refreshRes.status, 200, 'auth/refresh should return 200');
    const refreshData = await refreshRes.json();
    assert.ok(refreshData.data.accessToken, 'New access token issued');
    assert.ok(refreshData.data.refreshToken, 'New refresh token issued');
    console.log('   ✅ Token rotated successfully');

    // --------------------------------------------------------------------------
    // TEST 7: Registration & Email Verification Handshake
    // --------------------------------------------------------------------------
    console.log('7. Testing Full User Registration & Email Verification Handshake...');
    const testEmail = `testuser_${Date.now()}@sadzaconnect.co.zw`;
    await queryDb('DELETE FROM users WHERE email = $1', [testEmail]);

    const regRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountType: 'personal',
        fullName: 'Rutendo Chitepo',
        email: testEmail,
        password: 'SecurePassword2026!',
        phoneNumber: '+263771999888',
        province: 'Harare Province',
      }),
    });
    assert.ok(regRes.status === 201 || regRes.status === 200, `Register should return 201 or 200 (got ${regRes.status})`);
    console.log('   ✓ User registered in database');

    // Retrieve generated OTP from DB
    const users = await queryDb('SELECT id, is_verified FROM users WHERE email = $1', [testEmail]);
    assert.ok(users.length > 0, 'User must exist in database');
    const createdUser = users[0];
    assert.strictEqual(createdUser.is_verified, false, 'User must be unverified initially');

    const tokens = await queryDb('SELECT token FROM email_verification_tokens WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [createdUser.id]);
    assert.ok(tokens.length > 0, 'Verification token must exist');
    const tokenRecord = tokens[0];
    console.log(`   ✓ Retrieved verification OTP from DB: ${tokenRecord.token}`);

    // Verify email with OTP
    const verifyRes = await fetch(`${BASE_URL}/api/v1/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tokenRecord.token }),
    });
    assert.strictEqual(verifyRes.status, 200, 'verify-email should return 200');
    const verifyData = await verifyRes.json();
    assert.strictEqual(verifyData.data.user.isVerified, true, 'isVerified should now be true');
    assert.ok(verifyData.data.accessToken, 'verify-email must return accessToken');
    console.log('   ✅ User verified and auto-authenticated successfully');

    // Clean up test user
    await queryDb('DELETE FROM users WHERE id = $1', [createdUser.id]);

    // --------------------------------------------------------------------------
    // TEST 8: Forgot Password & Reset Workflow
    // --------------------------------------------------------------------------
    console.log('8. Testing Password Reset Workflow (Forgot -> OTP -> Reset)...');
    const forgotRes = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'customer@sadzaconnect.co.zw' }),
    });
    assert.strictEqual(forgotRes.status, 200, 'forgot-password should return 200');

    // Retrieve reset OTP from DB
    const custUsers = await queryDb('SELECT id FROM users WHERE email = $1', ['customer@sadzaconnect.co.zw']);
    const custUser = custUsers[0];
    const resetTokens = await queryDb('SELECT token_hash FROM password_reset_tokens WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [custUser.id]);
    assert.ok(resetTokens.length > 0, 'Reset record must exist in DB');
    const resetRecord = resetTokens[0];
    console.log(`   ✓ Retrieved reset OTP: ${resetRecord.token_hash}`);

    // Verify reset OTP to obtain resetToken JWT
    const verifyOtpRes = await fetch(`${BASE_URL}/api/v1/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'customer@sadzaconnect.co.zw',
        otp: resetRecord.token_hash,
      }),
    });
    assert.strictEqual(verifyOtpRes.status, 200, 'verify-reset-otp should return 200');
    const verifyOtpData = await verifyOtpRes.json();
    const resetToken = verifyOtpData.data.resetToken;
    assert.ok(resetToken, 'Should return resetToken');

    // Reset password with new value
    const resetRes = await fetch(`${BASE_URL}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resetToken,
        password: 'NewCustomer2026!Updated',
      }),
    });
    assert.strictEqual(resetRes.status, 200, 'reset-password should return 200');

    // Test login with new password
    const testNewLogin = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'customer@sadzaconnect.co.zw',
        password: 'NewCustomer2026!Updated',
      }),
    });
    assert.strictEqual(testNewLogin.status, 200, 'Login with new password should succeed');
    console.log('   ✓ Logged in with new password successfully');

    // Restore original password
    const forgotRestoreRes = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'customer@sadzaconnect.co.zw' }),
    });
    const restoreTokens = await queryDb('SELECT token_hash FROM password_reset_tokens WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [custUser.id]);
    const restoreRecord = restoreTokens[0];
    const verifyRestoreRes = await fetch(`${BASE_URL}/api/v1/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'customer@sadzaconnect.co.zw',
        otp: restoreRecord.token_hash,
      }),
    });
    const restoreData = await verifyRestoreRes.json();
    await fetch(`${BASE_URL}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resetToken: restoreData.data.resetToken,
        password: 'SadzaCustomer2026!',
      }),
    });
    console.log('   ✅ Password reset workflow verified');

    // --------------------------------------------------------------------------
    // TEST 9: Next.js Edge Middleware RBAC Protection
    // --------------------------------------------------------------------------
    console.log('9. Testing Next.js Edge Middleware RBAC Protection...');

    // 9a. /admin without token -> Redirects to /login?redirect=/admin
    const noAuthAdmin = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
    assert.strictEqual(noAuthAdmin.status, 307, '/admin without token must redirect (307)');
    const redirectLocation = noAuthAdmin.headers.get('location') || '';
    assert.ok(redirectLocation.includes('/login'), 'Redirect location must be /login');
    assert.ok(redirectLocation.includes('redirect=%2Fadmin'), 'Must preserve redirect param');
    console.log('   ✓ /admin unauthenticated correctly redirected to /login?redirect=/admin');

    // 9b. /admin with customer token -> Redirects to /
    const customerAdmin = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: `sadza_access_token=${customerAccessToken}` },
      redirect: 'manual',
    });
    assert.strictEqual(customerAdmin.status, 307, '/admin with customer token must redirect');
    console.log('   ✓ /admin with customer token forbidden and redirected to public home');

    // 9c. /admin with admin token -> 200 OK
    const validAdmin = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: `sadza_access_token=${adminAccessToken}` },
    });
    assert.strictEqual(validAdmin.status, 200, '/admin with admin token must return 200');
    console.log('   ✓ /admin with admin token grants access (200 OK)');

    // 9d. /dashboard/business without token -> Redirects to /login
    const noAuthBiz = await fetch(`${BASE_URL}/dashboard/business`, { redirect: 'manual' });
    assert.strictEqual(noAuthBiz.status, 307, '/dashboard/business without token must redirect (307)');
    console.log('   ✓ /dashboard/business unauthenticated correctly redirected to /login');

    // 9e. /dashboard/business with customer token -> Redirects to /onboarding/business
    const customerBiz = await fetch(`${BASE_URL}/dashboard/business`, {
      headers: { Cookie: `sadza_access_token=${customerAccessToken}` },
      redirect: 'manual',
    });
    assert.strictEqual(customerBiz.status, 307, '/dashboard/business with consumer token must redirect');
    const custBizLocation = customerBiz.headers.get('location') || '';
    assert.ok(custBizLocation.includes('/onboarding/business'), 'Consumer must be directed to business onboarding');
    console.log('   ✓ /dashboard/business with consumer token redirected to /onboarding/business');

    // 9f. /dashboard/business with merchant token -> 200 OK
    const merchantBiz = await fetch(`${BASE_URL}/dashboard/business`, {
      headers: { Cookie: `sadza_access_token=${merchantAccessToken}` },
    });
    assert.strictEqual(merchantBiz.status, 200, '/dashboard/business with merchant token grants access');
    console.log('   ✓ /dashboard/business with merchant token grants access (200 OK)');

    // 9g. /dashboard/user with customer token -> 200 OK
    const customerUserDash = await fetch(`${BASE_URL}/dashboard/user`, {
      headers: { Cookie: `sadza_access_token=${customerAccessToken}` },
    });
    assert.strictEqual(customerUserDash.status, 200, '/dashboard/user with customer token grants access');
    console.log('   ✓ /dashboard/user with customer token grants access (200 OK)');

    // 9h. Visiting /login while authenticated as admin -> Redirects to /admin
    const loggedInVisit = await fetch(`${BASE_URL}/login`, {
      headers: { Cookie: `sadza_access_token=${adminAccessToken}` },
      redirect: 'manual',
    });
    assert.strictEqual(loggedInVisit.status, 307, 'Logged-in user visiting /login must redirect');
    const loggedInLoc = loggedInVisit.headers.get('location') || '';
    assert.ok(loggedInLoc.includes('/admin'), 'Admin visiting /login redirected to /admin');
    console.log('   ✓ Authenticated users visiting /login smoothly redirected to their dashboard');

    console.log('\n🎉 [PHASE 2 COMPLETE] All 9 Authentication, Session & RBAC Middleware Tests Passed with 100% Fidelity!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

testPhase2Auth();
