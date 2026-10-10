'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Target,
  Globe2,
  Briefcase,
  ShoppingBag,
  Zap,
  ArrowRight,
  Clock,
  Layers,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ZIMBABWE_PROVINCES, BUSINESS_CATEGORIES } from '@/lib/data/zimbabwe';
import {
  getPlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
  PlatformSettings,
} from '@/data/platformStore';

export default function AboutPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);

  useEffect(() => {
    const sync = () => setSettings(getPlatformSettings());
    sync();
    window.addEventListener('sadza-platform-updated', sync);
    return () => window.removeEventListener('sadza-platform-updated', sync);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      {/* Clean Corporate Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 sm:py-14">
        <div className="w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
              <Building2 className="w-3.5 h-3.5" />
              Africdominion Group (Pvt) Ltd • Corporate Overview
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {settings.aboutHeadline}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {settings.siteName} is Zimbabwe&rsquo;s unified digital commercial infrastructure—connecting
              verified businesses, sole proprietors, cooperatives, wholesale buyers, job seekers, and
              utility consumers across all 10 provinces.
            </p>
          </div>
        </div>
      </section>

      <main className="flex-1 py-10 sm:py-12">
        <div className="w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-10 space-y-10">
          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
              <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Our Commercial Mission
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {settings.aboutMission}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
              <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 mb-4">
                <Globe2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Our National Mandate
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {settings.aboutVision}
              </p>
            </div>
          </div>

          {/* Core Platform Pillars */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Four Integrated Modules Under One Commercial Roof
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Built specifically for how Zimbabwean businesses and households transact every day.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
                <Building2 className="w-5 h-5 text-emerald-600 mb-3" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                  1. Verified Business Directory
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Structured profiles for Registered Companies (Pvt Ltd), SMEs, Sole Proprietors, and
                  Cooperatives across 20 sectors with direct WhatsApp inquiry links.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
                <ShoppingBag className="w-5 h-5 text-emerald-600 mb-3" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                  2. Dual-Currency Marketplace
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Active subscribers upload unlimited products and wholesale stock with transparent
                  USD and Zimbabwe Gold (ZiG) pricing.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
                <Briefcase className="w-5 h-5 text-emerald-600 mb-3" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                  3. Jobs &amp; Trade Vacancies
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Verified employers post vacancies and trade tenders directly from their business
                  portal and review applicant CVs online.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
                <Zap className="w-5 h-5 text-emerald-600 mb-3" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                  4. Instant Utility Settlements
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  24/7 automated ZESA prepaid electricity token generation, Municipal Water clearing,
                  and DStv renewals with instant downloadable receipts.
                </p>
              </div>
            </div>
          </div>

          {/* Two-Tier Verification & 30-Day Grace Period Blueprint */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Two-Tier Commercial Verification Standard
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  We verify both formal incorporated businesses and independent artisans so buyers
                  know the exact standing of every supplier.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Tier 1: Identity Verified</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Designed for Sole Proprietors, Artisans, Technicians, and Agricultural
                    Cooperatives. Verified via National ID, physical operating address, and active
                    business WhatsApp line.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tier 2: CR14 &amp; Tax Certified</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Designed for Registered Companies (Pvt Ltd) and formal SMEs. Verified via
                    Registrar of Companies CR14 / Certificate of Incorporation and ZIMRA ITF263 Tax
                    Clearance.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Clock className="w-3.5 h-3.5" />
                  Transparent Commercial Billing
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {settings.freeGracePeriodDays}-Day Free Grace Period for Every New Business
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every business that registers on {settings.siteName} receives{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {settings.freeGracePeriodDays} days of full directory and marketplace access at $0
                  </strong>
                  . After your first month, maintain your active storefront for{' '}
                  <strong className="text-emerald-700 dark:text-emerald-400">
                    ${settings.monthlySubscriptionPriceUsd}/month
                  </strong>
                  , or boost specific promotional offers on the homepage for{' '}
                  <strong className="text-slate-900 dark:text-white">
                    ${settings.sponsoredAdvertPriceUsd}/month
                  </strong>
                  .
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
                <Link
                  href="/signup?role=business"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                >
                  <span>Start {settings.freeGracePeriodDays}-Day Free Listing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  View Pricing Rules
                </Link>
              </div>
            </div>
          </div>

          {/* 10 Provinces & 20 Commercial Sectors Coverage */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>National Coverage: 10 Provinces &amp; 20 Commercial Sectors</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Standardized provincial and industrial taxonomy across Directory, Marketplace,
                  Adverts, and Jobs.
                </p>
              </div>
              <Link
                href="/businesses"
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Browse National Directory →
              </Link>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                All 10 Provinces of Zimbabwe
              </div>
              <div className="flex flex-wrap gap-2">
                {ZIMBABWE_PROVINCES.map((prov) => (
                  <Link
                    key={prov.id}
                    href={`/businesses?province=${encodeURIComponent(prov.name)}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
                  >
                    {prov.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                20 Core Commercial &amp; Industrial Sectors
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {BUSINESS_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/businesses?category=${encodeURIComponent(cat.name)}`}
                    className="px-3 py-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-700 truncate transition-colors"
                    title={cat.name}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
