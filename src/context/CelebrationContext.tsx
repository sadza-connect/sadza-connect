'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export type CelebrationType = 'login' | 'register' | 'logout';

export interface CelebrationPayload {
  type: CelebrationType;
  title: string;
  message: string;
  userName?: string;
  duration?: number; // duration in ms (default: 4000)
}

interface CelebrationContextType {
  celebration: CelebrationPayload | null;
  triggerCelebration: (payload: CelebrationPayload) => void;
  dismissCelebration: () => void;
}

const STORAGE_KEY = 'sadza_auth_celebration';

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined);

export function CelebrationProvider({ children }: { children: React.ReactNode }) {
  const [celebration, setCelebration] = useState<CelebrationPayload | null>(null);
  const pathname = usePathname();

  // Check sessionStorage for celebrations queued before a redirect
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CelebrationPayload;
        // Clear immediately so it never replays on subsequent reloads
        sessionStorage.removeItem(STORAGE_KEY);
        setCelebration(parsed);
      }
    } catch {
      // Ignore sessionStorage parsing errors
    }
  }, [pathname]);

  const triggerCelebration = useCallback((payload: CelebrationPayload) => {
    // Save to sessionStorage so if an immediate router.push redirect occurs,
    // the destination page will display the celebration modal
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage errors in restricted contexts
    }

    // Also update immediate state in case no redirect occurs or before unmount
    setCelebration(payload);
  }, []);

  const dismissCelebration = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setCelebration(null);
  }, []);

  return (
    <CelebrationContext.Provider
      value={{
        celebration,
        triggerCelebration,
        dismissCelebration,
      }}
    >
      {children}
    </CelebrationContext.Provider>
  );
}

export function useCelebration(): CelebrationContextType {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebration must be used within a CelebrationProvider');
  }
  return context;
}
