import assert from 'node:assert';
import {
  CookieConsentPreferences,
  COOKIE_CONSENT_KEY,
  DEFAULT_ALL_PREFERENCES,
  DEFAULT_STRICT_PREFERENCES,
  CURRENT_CONSENT_VERSION,
} from '../src/lib/cookies/cookie-consent';

console.log('--- Testing Cookie Consent Architecture & Backend Integration ---');

// 1. Verify Structure & Defaults
assert.strictEqual(DEFAULT_STRICT_PREFERENCES.necessary, true);
assert.strictEqual(DEFAULT_STRICT_PREFERENCES.functional, false);
assert.strictEqual(DEFAULT_STRICT_PREFERENCES.analytics, false);
assert.strictEqual(DEFAULT_STRICT_PREFERENCES.marketing, false);
console.log('✅ PASS [Default Strict Preferences Locked to Necessary Only]');

assert.strictEqual(DEFAULT_ALL_PREFERENCES.necessary, true);
assert.strictEqual(DEFAULT_ALL_PREFERENCES.functional, true);
assert.strictEqual(DEFAULT_ALL_PREFERENCES.analytics, true);
assert.strictEqual(DEFAULT_ALL_PREFERENCES.marketing, true);
console.log('✅ PASS [Default All Preferences Accepted]');

// 2. Test Serialization & Deserialization
const testRecord: CookieConsentPreferences = {
  necessary: true,
  functional: true,
  analytics: false,
  marketing: false,
  timestamp: new Date().toISOString(),
  version: CURRENT_CONSENT_VERSION,
};

const serialized = JSON.stringify(testRecord);
const parsed = JSON.parse(serialized);
assert.strictEqual(parsed.necessary, true);
assert.strictEqual(parsed.functional, true);
assert.strictEqual(parsed.analytics, false);
assert.strictEqual(parsed.version, '1.0');
console.log('✅ PASS [JSON Cookie Serialization & Deserialization]');

// 3. Test Backend Header Cookie Extraction Simulation
// How a backend route or middleware inspects consent:
function simulateBackendCookieInspection(cookieHeader: string | null) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp('(?:^|; )' + COOKIE_CONSENT_KEY + '=([^;]*)'));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as CookieConsentPreferences;
  } catch {
    return null;
  }
}

const fakeHeader = `sadza_access_token=token123; ${COOKIE_CONSENT_KEY}=${encodeURIComponent(serialized)}; sadza_theme=dark`;
const backendExtracted = simulateBackendCookieInspection(fakeHeader);
assert.ok(backendExtracted);
assert.strictEqual(backendExtracted.necessary, true);
assert.strictEqual(backendExtracted.functional, true);
assert.strictEqual(backendExtracted.analytics, false);
console.log('✅ PASS [Backend HTTP Cookie Header Extraction & Parsing]');

console.log('--- All Cookie Consent Verification Assertions PASSED! ---');
process.exit(0);
