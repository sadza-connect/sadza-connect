'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ShieldCheck,
  Building2,
  Megaphone,
  ArrowRight,
  Clock,
  CreditCard,
  HelpCircle,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import {
  getPlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
  PlatformSettings,
} from '@/data/platformStore';

export default function PricingPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);

  useEffect(() => {
    setSettings(getPlatformSettings());
    const sync = () => setSettings(getPlatformSettings());
    window.addEventListener('sadza-platform-updated', sync);
    return () => window.removeEventListener('sadza-platform-updated', sync);
  }, []);

  const plans = [
    {
      badge: `Month 1 (${settings.freeGracePeriodDays} Days)`,
      name: 'New Business Grace Period',
      price: '$0',
      period: `for your first ${settings.freeGracePeriodDays} days`,
      subtitle:
        'Every newly registered business receives 1 full month of complete platform access at zero cost.',
      highlighted: false,
      features: [
        'Full public listing in the National Business Directory',
        'Upload and showcase products in the Marketplace',
        'Direct WhatsApp click-to-chat & telephone lead buttons',
        'Post job vacancies on the Jobs Portal',
        'Submit verification documents (National ID or CR14/ZIMRA)',
        'Full access to your Business Owner Control Panel',
      ],
      cta: 'Register Business (Start 30-Day Grace)',
      href: '/signup?type=business',
    },
    {
      badge: 'Standard Active Membership',
      name: 'Monthly Business Subscription',
      price: `$${settings.monthlySubscriptionPriceUsd}`,
      period: '/ month (after Month 1)',
      subtitle:
        'Simple flat monthly rate after your 30-day grace period to keep your business profile and products live.',
      highlighted: true,
      features: [
        'Continuous public visibility in the Business Directory',
        'Unlimited product uploads on the Marketplace feed',
        'Zero commission on your sales — buyers pay you directly',
        'Active Verified Badge (Sole Proprietor, SME, Co-op, or Corporate)',
        'Post open job vacancies & receive applicant CVs',
        'Automated renewal reminders 7 days & 3 days before expiry',
      ],
      cta: 'Go to Business Billing & Renewal',
      href: '/dashboard/business?tab=billing',
    },
    {
      badge: 'Optional High-Visibility Boost',
      name: 'Sponsored Product & Business Advert',
      price: `$${settings.sponsoredAdvertPriceUsd}`,
      period: '/ campaign (30 days)',
      subtitle:
        'Pin your special package, discount, or bulk offer in the Homepage Right Sidebar and Adverts Directory.',
      highlighted: false,
      features: [
        'Featured placement in the Homepage Sponsored Adverts column',
        'Listed in the dedicated Adverts & Deals Directory (/adverts)',
        'Filtered by your commercial sector and province',
        'Custom promotional badge (Special Package, Discount, Bulk Deal)',
        'Direct WhatsApp inquiry button straight to your sales desk',
        'Live impression and click tracking in your dashboard',
      ],
      cta: 'Publish a Sponsored Advert',
      href: '/adverts',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Commercial Membership & Advertising Rates</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Straightforward Business Pricing
            </h1>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Every business on {settings.siteName} starts with a{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {settings.freeGracePeriodDays}-day free grace period
              </span>
              . After your first month, maintain your active directory storefront and product listings for a flat{' '}
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                ${settings.monthlySubscriptionPriceUsd}/month
              </span>{' '}
              with zero commission on your sales.
            </p>
          </div>

          {/* 3-Column Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`flex flex-col justify-between rounded-2xl p-6 sm:p-8 bg-white dark:bg-slate-900 transition-all ${
                  plan.highlighted
                    ? 'border-2 border-emerald-600 shadow-md relative'
                    : 'border border-slate-200 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                        plan.highlighted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {plan.badge}
                    </span>
                    {plan.highlighted && (
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        Required After Month 1
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {plan.subtitle}
                  </p>

                  <div className="mt-6 pb-6 border-b border-slate-200 dark:border-slate-800 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {plan.period}
                    </span>
                  </div>

                  <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={plan.href}
                    className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      plan.highlighted
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white'
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* How the Subscription & Grace Period Lifecycle Works */}
          <div className="mt-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-6">
              How Business Billing & Visibility Work on {settings.siteName}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                  Stage 1 • Day 1 to 30
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                  30-Day Free Grace Period
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Register your business, complete your profile, and upload your products. Your business and products are immediately visible nationwide for 30 days free.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
                  Stage 2 • Day 23 & Day 27
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                  Advance Renewal Notice
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your Business Dashboard displays a clear countdown banner 7 days and 3 days before your grace period ends so you can renew smoothly without interruption.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                  Stage 3 • Active Paid Status
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                  ${settings.monthlySubscriptionPriceUsd}/Month Active Listing
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Settle via EcoCash USD, InnBucks, or card. Your products and directory profile remain live with zero commission charged on customer orders.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Stage 4 • If Unpaid After Day 30
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                  Safe Pause & Instant Restore
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  If a subscription expires, public visibility is paused while your catalog is safely preserved. Paying ${settings.monthlySubscriptionPriceUsd} restores all listings immediately.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Regular Users / Everyday Shoppers browse the directory, contact suppliers on WhatsApp, apply for jobs, and buy ZESA tokens completely free of charge.
                </span>
              </div>
              <Link
                href="/contact"
                className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
              >
                Questions? Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
