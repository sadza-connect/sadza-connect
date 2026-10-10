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

    // Enable smooth duration after initial paint
    const t = setTimeout(() => {
      root.style.setProperty('--sky-dur', '1.4s');
    }, 100);

    setMounted(true);
    return () => clearTimeout(t);
  }, []);

  const triggerThemeTransition = (targetTheme: ResolvedTheme) => {
    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const direction: TransitionDirection = targetTheme === 'dark' ? 'to-dark' : 'to-light';

    // Clear any pending timer
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }

    setIsTransitioning(true);
    setTransitionDirection(direction);

    if (prefersReducedMotion) {
      // Immediate switch for accessibility
      root.style.setProperty('--sky-dur', '0.01s');
      if (targetTheme === 'dark') {
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
      setResolvedTheme(targetTheme);
      setIsTransitioning(false);
      setTransitionDirection(null);
      return;
    }

    // Continuous natural rotation (sun rises in east, sets in west)
    const targetSunBase = targetTheme === 'dark' ? 195 : 30;
    const targetMoonBase = targetTheme === 'dark' ? 40 : -110;

    const nextSun = advanceAngle(sunTurnRef.current, targetSunBase);
    const nextMoon = advanceAngle(moonTurnRef.current, targetMoonBase);

    sunTurnRef.current = nextSun;
    moonTurnRef.current = nextMoon;

    root.style.setProperty('--sky-dur', '1.4s');
    root.style.setProperty('--sky-turn', String(nextSun));
    root.style.setProperty('--moon-turn', String(nextMoon));

    // Apply global transition classes
    root.classList.add('theme-transitioning');
    if (direction === 'to-dark') {
      root.classList.add('theme-to-dark');
      root.classList.remove('theme-to-light');
    } else {
      root.classList.add('theme-to-light');
      root.classList.remove('theme-to-dark');
    }

    // Toggle theme attributes
    if (targetTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      root.dataset.sky = 'night';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      root.dataset.sky = 'day';
    }

    setResolvedTheme(targetTheme);

    // Clean up transition classes after animation completes
    transitionTimerRef.current = setTimeout(() => {
      root.classList.remove('theme-transitioning', 'theme-to-dark', 'theme-to-light');
      setIsTransitioning(false);
      setTransitionDirection(null);
    }, 1400);
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
