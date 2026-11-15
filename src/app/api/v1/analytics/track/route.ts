import { NextRequest } from 'next/server';
import { randomUUID, createHash } from 'node:crypto';
import { analyticsRepository } from '@/infrastructure/database/repositories/analytics-repository';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import { getClientIp, jsonResponse, errorResponse } from '@/shared/utils/route-handler';
import { COOKIE_CONSENT_KEY, CookieConsentPreferences } from '@/lib/cookies/cookie-consent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getConsentFromRequest(req: NextRequest): CookieConsentPreferences | null {
  const raw = req.cookies.get(COOKIE_CONSENT_KEY)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    // 1. Verify consent: Check if visitor granted analytics consent
    const consent = getConsentFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // If consent explicitly exists and analytics is false, do not record tracking telemetry
    if (consent && consent.analytics === false) {
      return jsonResponse(
        { message: 'Analytics telemetry skipped per user cookie preferences' },
        requestId,
        200
      );
    }

    const eventType = typeof body.event_type === 'string' ? body.event_type : 'page_view';
    const path = typeof body.path === 'string' ? body.path : '/';
    const province = typeof body.province === 'string' ? body.province : null;
    const deviceType = typeof body.device_type === 'string' ? body.device_type : 'desktop';
    const sessionId = typeof body.session_id === 'string' ? body.session_id : null;
    const referrer = typeof body.referrer === 'string' ? body.referrer : null;
    const metadata = typeof body.metadata === 'object' && body.metadata !== null ? body.metadata : {};

    // 2. Identify authenticated user if session exists
    const user = await getAuthenticatedUser(req, false);

    // 3. Privacy-preserving pseudonymized IP hash (SHA-256)
    const clientIp = getClientIp(req);
    const ipHash = clientIp
      ? createHash('sha256').update(clientIp + '_sadza_salt_2026').digest('hex').slice(0, 32)
      : null;

    // 4. Record event in PostgreSQL
    await analyticsRepository.recordEvent({
      event_type: eventType,
      path,
      user_id: user?.id || null,
      user_role: user?.role || 'guest',
      session_id: sessionId,
      province,
      device_type: deviceType,
      referrer,
      metadata,
      ip_hash: ipHash,
    });

    return jsonResponse({ tracked: true, event: eventType }, requestId, 201);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
