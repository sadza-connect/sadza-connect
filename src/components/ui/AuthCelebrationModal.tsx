'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  PartyPopper,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import { useCelebration } from '@/context/CelebrationContext';
import { CelebrationBalloons } from '@/components/animations/CelebrationBalloons';

export function AuthCelebrationModal() {
  const { celebration, dismissCelebration } = useCelebration();
  const [isPaused, setIsPaused] = useState(false);
  const [progressPercent, setProgressPercent] = useState(100);
  const actionButtonRef = useRef<HTMLButtonElement>(null);

  const duration = celebration?.duration || 4000;

  // Auto-focus the action button for keyboard accessibility when modal opens
  useEffect(() => {
    if (celebration) {
      setProgressPercent(100);
      setIsPaused(false);
      // Slight delay to allow DOM paint
      const focusTimer = setTimeout(() => {
        actionButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(focusTimer);
    }
  }, [celebration]);

  // Handle Escape key to dismiss
  useEffect(() => {
    if (!celebration) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismissCelebration();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [celebration, dismissCelebration]);

  // Auto-dismiss countdown timer with hover pause
  useEffect(() => {
    if (!celebration) return;

    const intervalStep = 50;
    const stepPercent = (intervalStep / duration) * 100;

    const timer = setInterval(() => {
      if (!isPaused) {
        setProgressPercent((prev) => {
          if (prev <= stepPercent) {
            clearInterval(timer);
            dismissCelebration();
            return 0;
          }
          return prev - stepPercent;
        });
      }
    }, intervalStep);

    return () => clearInterval(timer);
  }, [celebration, duration, isPaused, dismissCelebration]);

  if (!celebration) return null;

  const { type, title, message } = celebration;

  const getThemeConfig = () => {
    switch (type) {
      case 'login':
        return {
          badge: 'Welcome Back',
          foilClass: 'metal-foil-emerald',
          badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          iconBg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
          progressBar: 'bg-emerald-500',
          buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          Icon: Sparkles,
        };
      case 'register':
        return {
          badge: 'Account Created',
          foilClass: 'metal-foil-gold',
          badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          iconBg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800',
          progressBar: 'bg-amber-500',
          buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
          Icon: PartyPopper,
        };
      case 'logout':
        return {
          badge: 'Signed Out',
          foilClass: 'metal-foil-silver',
          badgeBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20',
          iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700',
          progressBar: 'bg-slate-400',
          buttonClass: 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600',
          Icon: LogOut,
        };
    }
  };

  const config = getThemeConfig();
  const IconComponent = config.Icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-modal-title"
      aria-describedby="celebration-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
    >
      {/* Semi-transparent Backdrop (clicking dismisses) */}
      <div
        onClick={dismissCelebration}
        className="absolute inset-0 bg-slate-950/60 dark:bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Floating Celebratory Balloons Layer */}
      <CelebrationBalloons />

      {/* Central Modal Card */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        className="relative isolate z-20 w-full max-w-sm sm:max-w-md rounded-3xl p-[1.5px] shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Outer Metallic Foil Rim */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 rounded-3xl ${config.foilClass} opacity-90`}
        />

        {/* Inner Card Face */}
        <div className="relative z-10 overflow-hidden rounded-[23px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80">
          {/* Top Dismiss Button */}
          <button
            type="button"
            onClick={dismissCelebration}
            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            aria-label="Close celebration notification"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Centered Celebration Icon with Glow */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3 flex items-center justify-center">
              <span className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-md dark:bg-emerald-400/20" />
              <div
                className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border shadow-sm ${config.iconBg}`}
              >
                <IconComponent className="h-7 w-7" />
              </div>
            </div>

            {/* Subtle Tag Pill */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${config.badgeBg}`}
            >
              <CheckCircle2 className="h-3 w-3" />
              <span>{config.badge}</span>
            </span>

            {/* Title */}
            <h2
              id="celebration-modal-title"
              className="mt-2 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl"
            >
              {title}
            </h2>

            {/* Message Body */}
            <p
              id="celebration-modal-desc"
              className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs sm:max-w-sm"
            >
              {message}
            </p>

            {/* Quick Dismiss / Continue Action */}
            <div className="mt-6 w-full flex items-center gap-2">
              <button
                ref={actionButtonRef}
                type="button"
                onClick={dismissCelebration}
                className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-xs transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${config.buttonClass}`}
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Countdown Progress Bar */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden"
          >
            <div
              className={`h-full transition-all duration-75 ease-linear ${config.progressBar}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
