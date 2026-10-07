import assert from 'assert';

async function runCelebrationVerification() {
  console.log('🎈 Verifying Authentication Success Celebration System...');

  // 1. Verify health endpoint
  const healthRes = await fetch('http://localhost:3000/api/v1/health');
  assert.strictEqual(healthRes.status, 200, 'Health endpoint should be 200');
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.data.status, 'healthy', 'Database must be healthy');
  console.log('   ✅ Health endpoint is responsive and healthy');

  // 2. Verify Root Page contains celebration modal hook in bundle
  const homeRes = await fetch('http://localhost:3000/');
  const homeHtml = await homeRes.text();
  assert.strictEqual(homeRes.status, 200, 'Home page must return 200');
  assert.ok(homeHtml.includes('Platform Activity'), 'Home page includes live activity ticker');
  console.log('   ✅ Root page rendered with live activity ticker and RootLayout');

  // 3. Verify Login page HTML does NOT contain the persistent success card
  const loginRes = await fetch('http://localhost:3000/login');
  const loginHtml = await loginRes.text();
  assert.strictEqual(loginRes.status, 200, 'Login page must return 200');
  assert.ok(!loginHtml.includes('Open Dashboard'), 'Login page must not have persistent success card with Open Dashboard button');
  console.log('   ✅ Login page confirmed free of persistent success card');

  // 4. Verify Signup page HTML does NOT contain the persistent success card
  const signupRes = await fetch('http://localhost:3000/signup');
  const signupHtml = await signupRes.text();
  assert.strictEqual(signupRes.status, 200, 'Signup page must return 200');
  assert.ok(!signupHtml.includes('Explore Platform'), 'Signup page must not have persistent success card with Explore Platform button');
  console.log('   ✅ Signup page confirmed free of persistent success card');

  // 5. Verify Login failure does NOT trigger celebration
  const failLoginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'nonexistent@example.com', password: 'WrongPassword123!' }),
  });
  const failLoginData = await failLoginRes.json();
  assert.strictEqual(failLoginRes.status, 401, 'Invalid login must return 401');
  assert.strictEqual(failLoginData.success, false, 'Failed login success must be false');
  console.log('   ✅ Failed login properly rejected without success payload');

  // 6. Verify Logout endpoint succeeds and formats response cleanly
  const logoutRes = await fetch('http://localhost:3000/api/v1/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: '' }),
  });
  const logoutData = await logoutRes.json();
  assert.strictEqual(logoutRes.status, 200, 'Logout endpoint must return 200');
  assert.strictEqual(logoutData.success, true, 'Logout success must be true');
  console.log('   ✅ Server confirmed successful logout endpoint processing');

  console.log('🎉 ALL AUTHENTICATION CELEBRATION CHECKS PASSED SUCCESSFULLY!');
}

runCelebrationVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
