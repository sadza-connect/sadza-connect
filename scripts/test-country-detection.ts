import { detectCountryFromPhone, formatE164Phone } from '../src/lib/data/countries.js';

console.log('--- Testing Intelligent Phone Country Auto-Detection ---');

const testCases = [
  // 1. User's exact Nigerian number without country code
  {
    input: '9030098304',
    expectedCountry: 'Nigeria',
    expectedDial: '+234',
    expectedE164: '+2349030098304',
  },
  // 2. Nigerian number with leading zero
  {
    input: '09030098304',
    expectedCountry: 'Nigeria',
    expectedDial: '+234',
    expectedE164: '+2349030098304',
  },
  // 3. Nigerian number with +234
  {
    input: '+2349030098304',
    expectedCountry: 'Nigeria',
    expectedDial: '+234',
    expectedE164: '+2349030098304',
  },
  // 4. Nigerian number with 234 without +
  {
    input: '2349030098304',
    expectedCountry: 'Nigeria',
    expectedDial: '+234',
    expectedE164: '+2349030098304',
  },
  // 5. Nigerian number with spaces/formatting
  {
    input: '0903 009 8304',
    expectedCountry: 'Nigeria',
    expectedDial: '+234',
    expectedE164: '+2349030098304',
  },
  // 6. Other Nigerian operators (Airtel, Glo, etc.)
  {
    input: '8031234567',
    expectedCountry: 'Nigeria',
    expectedDial: '+234',
    expectedE164: '+2348031234567',
  },
  {
    input: '07011234567',
    expectedCountry: 'Nigeria',
    expectedDial: '+234',
    expectedE164: '+2347011234567',
  },
  // 7. Zimbabwe Econet local number without code
  {
    input: '0771234567',
    expectedCountry: 'Zimbabwe',
    expectedDial: '+263',
    expectedE164: '+263771234567',
  },
  {
    input: '771234567',
    expectedCountry: 'Zimbabwe',
    expectedDial: '+263',
    expectedE164: '+263771234567',
  },
  // 8. Zimbabwe with +263
  {
    input: '+263771234567',
    expectedCountry: 'Zimbabwe',
    expectedDial: '+263',
    expectedE164: '+263771234567',
  },
  // 9. South Africa local and international
  {
    input: '0821234567',
    expectedCountry: 'South Africa',
    expectedDial: '+27',
    expectedE164: '+27821234567',
  },
  {
    input: '+27821234567',
    expectedCountry: 'South Africa',
    expectedDial: '+27',
    expectedE164: '+27821234567',
  },
  // 10. United Kingdom mobile
  {
    input: '+447911123456',
    expectedCountry: 'United Kingdom',
    expectedDial: '+44',
    expectedE164: '+447911123456',
  },
  // 11. United States
  {
    input: '+14155552671',
    expectedCountry: 'United States',
    expectedDial: '+1',
    expectedE164: '+14155552671',
  },
];

let failed = 0;

for (const tc of testCases) {
  const result = detectCountryFromPhone(tc.input);
  if (!result.detected || !result.country) {
    console.error(`❌ FAIL: '${tc.input}' was NOT detected! Got:`, result);
    failed++;
    continue;
  }

  if (result.country.name !== tc.expectedCountry || result.dialCode !== tc.expectedDial) {
    console.error(
      `❌ FAIL: '${tc.input}' expected ${tc.expectedCountry} (${tc.expectedDial}), got ${result.country.name} (${result.dialCode})`
    );
    failed++;
    continue;
  }

  const e164 = formatE164Phone(result.dialCode, result.localNumber);
  if (e164 !== tc.expectedE164) {
    console.error(
      `❌ FAIL E.164: '${tc.input}' expected ${tc.expectedE164}, got ${e164}`
    );
    failed++;
    continue;
  }

  console.log(`✅ PASS: '${tc.input}' -> ${result.country.flag} ${result.country.name} (${result.dialCode}) -> E.164: ${e164}`);
}

if (failed > 0) {
  console.error(`\n❌ ${failed} tests failed!`);
  process.exit(1);
} else {
  console.log('\n🎉 ALL AUTO-DETECTION TESTS PASSED 100%!\n');
  process.exit(0);
}
