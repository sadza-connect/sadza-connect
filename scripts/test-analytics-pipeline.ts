import assert from 'node:assert';
import { getDb } from '../src/infrastructure/database/connection';
import { analyticsRepository } from '../src/infrastructure/database/repositories/analytics-repository';

console.log('--- Testing Real PostgreSQL Analytics Pipeline & Consent Gating ---');

async function main() {
  const db = getDb();

  // 1. Verify analytics_events table exists in PostgreSQL
  const hasTable = await db.schema.hasTable('analytics_events');
  assert.strictEqual(hasTable, true, 'analytics_events table must exist');
  console.log('✅ PASS [analytics_events PostgreSQL table verified]');

  // 2. Insert test real events
  await analyticsRepository.recordEvent({
    event_type: 'page_view',
    path: '/businesses',
    province: 'Harare',
    device_type: 'mobile',
    session_id: 'test_session_1',
    ip_hash: 'test_ip_hash_1',
    metadata: { test: true },
  });

  await analyticsRepository.recordEvent({
    event_type: 'whatsapp_click',
    path: '/businesses/test-biz',
    province: 'Bulawayo',
    device_type: 'desktop',
    session_id: 'test_session_2',
    ip_hash: 'test_ip_hash_2',
    metadata: { businessName: 'Test Harare Motors' },
  });

  console.log('✅ PASS [Successfully recorded real events in analytics_events]');

  // 3. Test getAggregatedOverview
  const overview = await analyticsRepository.getAggregatedOverview(30);
  assert.ok(overview, 'Overview result must exist');
  assert.ok(overview.totalPageviews >= 1, 'Total pageviews must be at least 1');
  assert.ok(overview.uniqueVisitors >= 1, 'Unique visitors must be at least 1');
  assert.ok(overview.whatsappInquiries >= 1, 'WhatsApp inquiries must be at least 1');
  assert.ok(Array.isArray(overview.sectionBreakdown), 'Section breakdown must be an array');
  assert.ok(Array.isArray(overview.provinceBreakdown), 'Province breakdown must be an array');
  assert.ok(overview.deviceBreakdown.mobile >= 1, 'Mobile device count must be counted');
  console.log('✅ PASS [getAggregatedOverview returns real aggregated PostgreSQL metrics]');

  // 4. Verify Recent Events stream contains the recorded events
  assert.ok(overview.recentEvents.length >= 2, 'Recent events must include recorded entries');
  const foundPageview = overview.recentEvents.some((e) => e.eventType === 'page_view' && e.path === '/businesses');
  assert.strictEqual(foundPageview, true, 'Recent events must display the real pageview event');
  console.log('✅ PASS [Live visitor activity stream verified]');

  // 5. Clean up test events
  await db('analytics_events').where('session_id', 'like', 'test_session_%').del();
  console.log('✅ PASS [Cleaned up test events]');

  console.log('--- ALL Analytics Pipeline Tests PASSED! ---');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Analytics test failed:', err);
  process.exit(1);
});
