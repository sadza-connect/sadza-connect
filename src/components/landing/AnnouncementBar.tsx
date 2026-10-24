'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  Building2,
  Coins,
  ShieldCheck,
  Briefcase,
  Zap,
} from 'lucide-react';
import {
  getPlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
  PlatformSettings,
} from '@/data/platformStore';

interface ActivityTickerItem {
  id: string;
  tag: string;
  badge: string;
  title: string;
  summary: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function AnnouncementBar() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const sync = () => setSettings(getPlatformSettings());
    sync();
    window.addEventListener('sadza-platform-updated', sync);

    fetch('/api/v1/cms')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const cms = json.data;
          setSettings((prev) => ({
            ...prev,
            announcementText: cms.home?.announcement?.text || prev.announcementText,
            announcementEnabled: cms.home?.announcement?.enabled ?? prev.announcementEnabled,
            announcementLink: cms.home?.announcement?.link || prev.announcementLink,
            usdToZigRate: cms.raw?.usd_to_zig_rate || prev.usdToZigRate,
            freeGracePeriodDays: cms.raw?.free_grace_period_days || prev.freeGracePeriodDays,
          }));
        }
      })
      .catch(() => {});

    return () => window.removeEventListener('sadza-platform-updated', sync);
  }, []);

  const activities: ActivityTickerItem[] = useMemo(
    () => [
      {
        id: 'notice',
        tag: 'Commercial Notice',
        badge: `${settings.freeGracePeriodDays}-Day Free Grace`,
        title: 'Business Onboarding',
        summary: settings.announcementText,
        href: '/pricing',
        icon: Building2,
      },
      {
        id: 'dual-currency',
        tag: 'Multi-Currency',
        badge: `1 USD = ${settings.usdToZigRate} ZiG`,
        title: 'Dual-Currency Commerce',
        summary: `Active listings ($${settings.monthlySubscriptionPriceUsd}/mo) and sponsored adverts ($${settings.sponsoredAdvertPriceUsd}/mo) settle in USD or ZiG.`,
        href: '/pricing',
        icon: Coins,
      },
      {
        id: 'compliance',
        tag: 'Verified Registry',
        badge: 'CR14 & ZIMRA',
        title: 'Merchant Verification',
        summary: 'Registered companies, SMEs, cooperatives & sole proprietors verified across 10 provinces.',
        href: '/businesses',
        icon: ShieldCheck,
      },
      {
        id: 'marketplace',
        tag: 'Commercial Exchange',
        badge: '20 Sectors Live',
        title: 'Marketplace & Tenders',
        summary: 'Commercial wholesale, solar systems, agro inputs, and trade jobs updated daily.',
        href: '/marketplace',
        icon: Briefcase,
      },
      {
        id: 'utilities',
        tag: 'Instant Payments',
        badge: '24/7 Automated',
        title: 'Utility Clearing Desk',
        summary: 'Prepaid ZESA electricity tokens, Municipal Water & DStv clearing with instant receipts.',
        href: '/bill-payments',
        icon: Zap,
      },
    ],
    [settings]
  );

  const total = activities.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  if (dismissed || settings.announcementEnabled === false) return null;

  const current = activities[currentIndex] || activities[0];
  const Icon = current.icon;

  return (
    <aside
      aria-label="Platform activity ticker"
      role="region"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="relative z-50 w-full border-b border-emerald-950/40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-2 sm:px-4 py-1.5 text-xs text-white shadow-xs"
    >
      <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Ticker Indicator Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex h-5 items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="hidden sm:inline">Platform Activity</span>
            <span className="sm:hidden">Live</span>
          </span>
        </div>

        {/* Center Rotating Content */}
        <div
          aria-live="polite"
          className="flex-1 min-w-0 flex items-center justify-center sm:justify-start gap-2 overflow-hidden"
        >
          <div
            key={current.id}
            className="flex items-center gap-2 truncate animate-in fade-in slide-in-from-right-3 duration-300 w-full justify-center sm:justify-start"
          >
            {/* Category tag */}
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md">
              <Icon className="h-3 w-3 shrink-0" />
              <span>{current.badge}</span>
            </span>

            {/* Desktop Message */}
            <p className="hidden md:flex items-center gap-1.5 text-[11px] font-medium text-slate-200 truncate">
              <span className="font-bold text-white">{current.title}:</span>
              <span className="text-slate-300 truncate">{current.summary}</span>
            </p>

            {/* Mobile / Tablet Message */}
            <p className="md:hidden text-[11px] font-medium text-slate-200 truncate text-center">
              <span className="font-bold text-emerald-400 mr-1.5">[{current.badge}]</span>
              <span className="text-white font-semibold">{current.title}</span>
            </p>

            {/* Quick Action Link */}
            <Link
              href={current.href}
              className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 hover:text-emerald-100 hover:underline shrink-0 ml-1 transition-colors"
            >
              <span>View</span>
              <ArrowRight className="h-2.5 w-2.5" />
            </Link>
          </div>
        </div>

        {/* Right Controls: Pager + Arrows + Dismiss */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 text-[11px]">
          <span className="hidden sm:inline text-[10px] text-slate-400 font-mono">
            {currentIndex + 1}/{total}
          </span>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous platform update"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next platform update"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss platform activity bar"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
