/**
 * Cookie Consent Core Types & Utility Helpers
 * Complies with Zimbabwe Cyber and Data Protection Act [Chapter 12:07],
 * South Africa POPIA, and international ePrivacy / GDPR standards.
 */

export interface CookieConsentPreferences {
  necessary: true; // Strictly necessary (Security, Authentication, Platform operation)
  functional: boolean; // User preferences (Theme, Saved province, Workspace UI)
  analytics: boolean; // Anonymous traffic measurement and error telemetry
  marketing: boolean; // Targeted commercial promotions and campaign attribution
  timestamp: string; // ISO 8601 timestamp of consent record
  version: string; // Schema revision for policy re-consent if policies change
}

export const COOKIE_CONSENT_KEY = 'sadza_cookie_consent';
export const CURRENT_CONSENT_VERSION = '1.0';
export const CONSENT_MAX_AGE_SECONDS = 365 * 24 * 60 * 60; // 12 Months

export const DEFAULT_STRICT_PREFERENCES: CookieConsentPreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
  timestamp: '',
  version: CURRENT_CONSENT_VERSION,
};

export const DEFAULT_ALL_PREFERENCES: CookieConsentPreferences = {
  necessary: true,
  functional: true,
  analytics: true,
  marketing: true,
  timestamp: '',
  version: CURRENT_CONSENT_VERSION,
};

/**
 * Client-side helper to read a cookie value by name
 */
export function getClientCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Client-side helper to set a standard persistent cookie
 */
export function setClientCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') return;
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${
    secure ? '; Secure' : ''
  }`;
}

/**
 * Client-side helper to remove a cookie
 */
export function deleteClientCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Safely parse cookie consent preferences from cookie or localStorage fallback
 */
export function getSavedCookieConsent(): CookieConsentPreferences | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Try reading from cookie first (accessible by both SSR headers and client JS)
    const cookieVal = getClientCookie(COOKIE_CONSENT_KEY);
    if (cookieVal) {
      const parsed = JSON.parse(cookieVal);
      if (parsed && typeof parsed === 'object' && parsed.necessary === true) {
        return parsed as CookieConsentPreferences;
      }
    }

    // 2. Fallback to localStorage if cookies are restricted
    const localVal = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (localVal) {
      const parsed = JSON.parse(localVal);
      if (parsed && typeof parsed === 'object' && parsed.necessary === true) {
        return parsed as CookieConsentPreferences;
      }
    }
  } catch {
    // Ignore parse errors from corrupted client storage
  }

  return null;
}

/**
 * Persist cookie consent to both cookie and localStorage and dispatch an event
 */
export function persistCookieConsent(preferences: CookieConsentPreferences): void {
  if (typeof window === 'undefined') return;

  const record: CookieConsentPreferences = {
    ...preferences,
    necessary: true, // Always locked to true
    timestamp: new Date().toISOString(),
    version: CURRENT_CONSENT_VERSION,
  };

  const serialized = JSON.stringify(record);

  try {
    setClientCookie(COOKIE_CONSENT_KEY, serialized, CONSENT_MAX_AGE_SECONDS);
  } catch {}

  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, serialized);
  } catch {}

  try {
    window.dispatchEvent(
      new CustomEvent('sadza-cookie-consent-updated', { detail: record })
    );
  } catch {}
}

/**
 * Helper to check if a specific consent category is granted
 */
export function isConsentGranted(category: 'functional' | 'analytics' | 'marketing'): boolean {
  const current = getSavedCookieConsent();
  if (!current) return false;
  return Boolean(current[category]);
}
