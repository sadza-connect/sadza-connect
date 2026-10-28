'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';
type TransitionDirection = 'to-dark' | 'to-light' | null;

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  isTransitioning: boolean;
  transitionDirection: TransitionDirection;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to continuously advance angles forward through time (clockwise cycle)
function advanceAngle(current: number, targetBase: number): number {
  const delta = ((targetBase - current) % 360 + 360) % 360;
  return current + (delta === 0 ? 360 : delta);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>(null);
  const [mounted, setMounted] = useState(false);

  // Keep track of continuous rotation angles
  const sunTurnRef = useRef<number>(30);
  const moonTurnRef = useRef<number>(-110);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Always default to light mode unless user explicitly chose dark mode
    const stored = localStorage.getItem('sadza-theme-v2');
    const initial: Theme = stored === 'dark' ? 'dark' : 'light';

    setThemeState(initial);

    const initialResolved: ResolvedTheme = initial === 'dark' ? 'dark' : 'light';

    setResolvedTheme(initialResolved);

    // Initialize angles without animation flash
    const root = document.documentElement;
    if (initialResolved === 'dark') {
      sunTurnRef.current = 195;
      moonTurnRef.current = 40;
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      root.dataset.sky = 'night';
    } else {
      sunTurnRef.current = 30;
      moonTurnRef.current = -110;
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      root.dataset.sky = 'day';
    }

    root.style.setProperty('--sky-turn', String(sunTurnRef.current));
    root.style.setProperty('--moon-turn', String(moonTurnRef.current));
    root.style.setProperty('--sky-dur', '0s');

    // Enable snappy duration after initial paint
    const t = setTimeout(() => {
      root.style.setProperty('--sky-dur', '0.2s');
    }, 50);

    setMounted(true);
    return () => clearTimeout(t);
  }, []);

  const triggerThemeTransition = (targetTheme: ResolvedTheme) => {
    const root = document.documentElement;
    const direction: TransitionDirection = targetTheme === 'dark' ? 'to-dark' : 'to-light';

    // Clear any pending timer
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }

    // Immediately toggle theme attributes on <html> synchronously for instant response
    if (targetTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      root.dataset.sky = 'night';
      sunTurnRef.current = 195;
      moonTurnRef.current = 40;
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      root.dataset.sky = 'day';
      sunTurnRef.current = 30;
      moonTurnRef.current = -110;
    }

    root.style.setProperty('--sky-dur', '0.2s');
    root.style.setProperty('--sky-turn', String(sunTurnRef.current));
    root.style.setProperty('--moon-turn', String(moonTurnRef.current));

    setResolvedTheme(targetTheme);
    setIsTransitioning(true);
    setTransitionDirection(direction);

    // Snappy micro-animation cleanup
    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false);
      setTransitionDirection(null);
    }, 150);
  };

  const setTheme = (newTheme: Theme) => {
    const target: ResolvedTheme = newTheme === 'dark' ? 'dark' : 'light';
    setThemeState(target);
    localStorage.setItem('sadza-theme-v2', target);
    localStorage.removeItem('sadza-theme');

    if (target !== resolvedTheme) {
      triggerThemeTransition(target);
    }
  };

  const toggleTheme = () => {
    const next: ResolvedTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        isTransitioning,
        transitionDirection,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
