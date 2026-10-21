'use client';

import React, { useEffect } from 'react';
import { Loader2, ShieldCheck, Sparkles } from 'lucide-react';

interface ActionLoaderProps {
  isVisible: boolean;
  title?: string;
  subtitle?: string;
}

export function ActionLoader({
  isVisible,
  title = 'Processing Request...',
  subtitle = 'Please wait while we communicate with the server.',
}: ActionLoaderProps) {
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1018]/65 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="relative mx-4 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#0e1626] p-7 text-center shadow-2xl">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-16 left-1/2 h-32 w-48 -translate-x-1/2 rounded-full bg-radial from-[#1e57eb]/40 to-transparent blur-2xl" />

        {/* Center Animated Spinner / Icon */}
        <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1e57eb]/30 bg-[#1e57eb]/15 shadow-inner">
          <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
          <div className="absolute inset-0 rounded-2xl border border-white/5 animate-pulse" />
        </div>

        {/* Title */}
        <h3 className="relative text-base font-bold text-white tracking-tight">
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p className="relative mt-2 text-xs font-medium text-slate-300 leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* Animated Progress Bar Indicator */}
        <div className="relative mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#1e57eb] via-[#3b82f6] to-[#60a5fa] animate-[shimmer_1.5s_infinite_linear]" />
        </div>

        {/* Safe Transaction Notice */}
        <div className="relative mt-4 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Encrypted PostgreSQL Data Link</span>
        </div>
      </div>
    </div>
  );
}
