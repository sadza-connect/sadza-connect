'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CookieConsentPreferences,
  getSavedCookieConsent,
  persistCookieConsent,
  DEFAULT_ALL_PREFERENCES,
  DEFAULT_STRICT_PREFERENCES,
} from '@/lib/cookies/cookie-consent';

interface CookieConsentContextType {
  consent: CookieConsentPreferences | null;
  hasResponded: boolean;
  isBannerOpen: boolean;
  isPreferencesOpen: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (custom: {
    functional?: boolean;
    analytics?: boolean;
    marketing?: boolean;
  }) => void;
  openPreferences: () => void;
  closePreferences: () => void;
  closeBanner: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsentPreferences | null>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Initialize consent on client mount
  useEffect(() => {
    const existing = getSavedCookieConsent();
    if (existing) {
      setConsent(existing);
      setHasResponded(true);
      setIsBannerOpen(false);
    } else {
      // Delay showing the banner slightly (400ms) to ensure smooth page load
      const timer = setTimeout(() => {
        setIsBannerOpen(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for consent updates across tabs or components
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CookieConsentPreferences>;
      if (customEvent.detail) {
        setConsent(customEvent.detail);
        setHasResponded(true);
      }
    };

    window.addEventListener('sadza-cookie-consent-updated', handleUpdate);
    return () => window.removeEventListener('sadza-cookie-consent-updated', handleUpdate);
  }, []);

  const acceptAll = useCallback(() => {
    persistCookieConsent(DEFAULT_ALL_PREFERENCES);
    setConsent(DEFAULT_ALL_PREFERENCES);
    setHasResponded(true);
    setIsBannerOpen(false);
    setIsPreferencesOpen(false);
  }, []);

  const rejectNonEssential = useCallback(() => {
    persistCookieConsent(DEFAULT_STRICT_PREFERENCES);
    setConsent(DEFAULT_STRICT_PREFERENCES);
    setHasResponded(true);
    setIsBannerOpen(false);
    setIsPreferencesOpen(false);
  }, []);

  const savePreferences = useCallback(
    (custom: { functional?: boolean; analytics?: boolean; marketing?: boolean }) => {
      const updated: CookieConsentPreferences = {
        necessary: true,
        functional: Boolean(custom.functional),
        analytics: Boolean(custom.analytics),
        marketing: Boolean(custom.marketing),
        timestamp: new Date().toISOString(),
        version: '1.0',
      };
      persistCookieConsent(updated);
      setConsent(updated);
      setHasResponded(true);
      setIsBannerOpen(false);
      setIsPreferencesOpen(false);
    },
    []
  );

  const openPreferences = useCallback(() => {
    setIsPreferencesOpen(true);
  }, []);

  const closePreferences = useCallback(() => {
    setIsPreferencesOpen(false);
  }, []);

  const closeBanner = useCallback(() => {
    setIsBannerOpen(false);
  }, []);

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        hasResponded,
        isBannerOpen,
        isPreferencesOpen,
        acceptAll,
        rejectNonEssential,
        savePreferences,
        openPreferences,
        closePreferences,
        closeBanner,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContextType {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}
