'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics/tracker';
import { useCookieConsent } from '@/context/CookieConsentContext';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const { consent } = useCookieConsent();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Only track if pathname changed and user granted analytics consent
    if (pathname && pathname !== lastPathRef.current) {
      lastPathRef.current = pathname;
      if (consent?.analytics) {
        trackEvent('page_view', pathname);
      }
    }
  }, [pathname, consent?.analytics]);

  return null;
}
