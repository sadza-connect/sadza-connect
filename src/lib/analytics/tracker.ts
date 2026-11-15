/**
 * Client-Side Privacy-Compliant Analytics Tracker
 * Automatically checks Cookie Consent before dispatching events
 */

import { isConsentGranted } from '@/lib/cookies/cookie-consent';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = window.sessionStorage.getItem('sadza_anon_session_id');
    if (!id) {
      id = 's_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      window.sessionStorage.setItem('sadza_anon_session_id', id);
    }
    return id;
  } catch {
    return '';
  }
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Dispatch an analytics event if the user has consented to analytics
 */
export function trackEvent(
  eventType: string,
  path = typeof window !== 'undefined' ? window.location.pathname : '/',
  metadata: Record<string, any> = {}
): void {
  if (typeof window === 'undefined') return;

  // 1. Consent Gate: Never dispatch if analytics consent is rejected
  if (!isConsentGranted('analytics')) {
    return;
  }

  const payload = {
    event_type: eventType,
    path,
    session_id: getSessionId(),
    device_type: getDeviceType(),
    referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    metadata,
  };

  try {
    // Prefer sendBeacon for non-blocking asynchronous transmission
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/v1/analytics/track', blob);
      return;
    }

    // Fallback to fetch with keepalive
    fetch('/api/v1/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Fail silently without disrupting user interaction
  }
}

export function trackWhatsAppInquiry(businessId: string, businessName: string): void {
  trackEvent('whatsapp_click', `/businesses/${businessId}`, {
    businessId,
    businessName,
  });
}

export function trackSearch(query: string, section: string): void {
  trackEvent('search', `/${section}`, {
    query,
    section,
  });
}
