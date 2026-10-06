'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils/cn';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme, isTransitioning, transitionDirection } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          'flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
          className
        )}
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      className={cn(
        'group relative inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold shadow-xs backdrop-blur-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 active:scale-95',
        isDark
          ? 'border-slate-700/80 bg-slate-900/85 text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800/90 shadow-[0_2px_12px_rgba(0,0,0,0.6)]'
          : 'border-slate-200/90 bg-white/90 text-slate-800 hover:border-amber-500/50 hover:bg-amber-50/40 shadow-[0_2px_10px_rgba(245,158,11,0.12)]',
        className
      )}
      aria-label={`Current theme: ${isDark ? 'Night' : 'Day'}. Switch to ${isDark ? 'Day' : 'Night'} mode.`}
      title={`Active: ${isDark ? 'Night' : 'Day'} Mode • Click to switch to ${isDark ? 'Day' : 'Night'}`}
    >
      {/* Visual Ambient Glow Indicator */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 rounded-full transition-opacity duration-700 blur-[6px]',
          isDark
            ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20'
            : 'bg-amber-500/15 group-hover:bg-amber-500/25'
        )}
      />

      {/* Celestial Icon Dial */}
      <div className="relative flex h-5 w-5 items-center justify-center">
        {/* Animated 360 Flip wrapper */}
        <div
          className={cn(
            'relative flex h-5 w-5 items-center justify-center transition-transform duration-700 ease-out',
            isTransitioning ? 'rotate-[360deg] scale-110' : 'group-hover:rotate-12'
          )}
        >
          {isDark ? (
            /* Luminous Moon Icon for Dark Mode */
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-emerald-300 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)] transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor" fillOpacity="0.25" />
              {/* Micro starlight dot */}
              <circle cx="19" cy="5" r="1" fill="#34d399" className="animate-ping" />
            </svg>
          ) : (
            /* Radiant Golden Sun Icon for Light Mode */
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.3" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          )}
        </div>
      </div>

      {/* Clear Active Theme Label */}
      <span className="text-[11px] font-medium tracking-wide">
        {showLabel ? (
          isDark ? 'Night Mode' : 'Day Mode'
        ) : (
          <span className="hidden sm:inline-block">
            {isDark ? 'Night' : 'Day'}
          </span>
        )}
      </span>

      {/* Micro Status Dot */}
      <span
        aria-hidden="true"
        className={cn(
          'size-1.5 rounded-full transition-colors duration-500',
          isDark ? 'bg-emerald-400 shadow-[0_0_4px_#34d399]' : 'bg-amber-400 shadow-[0_0_4px_#fbbf24]'
        )}
      />
    </button>
  );
}
