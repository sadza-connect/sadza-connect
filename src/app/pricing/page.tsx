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

    fetch('/api/v1/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.settings) {
          const s = json.data.settings;
          setSettings((prev) => ({
            ...prev,
            usdToZigRate: Number(s.usd_to_zig_rate) || prev.usdToZigRate,
            monthlySubscriptionPriceUsd: Number(s.monthly_subscription_price_usd) || prev.monthlySubscriptionPriceUsd,
            sponsoredAdvertPriceUsd: Number(s.sponsored_advert_price_usd) || prev.sponsoredAdvertPriceUsd,
            freeGracePeriodDays: Number(s.free_grace_period_days) || prev.freeGracePeriodDays,
            tierStarterName: s.tier_starter_name || prev.tierStarterName,
            tierStarterLimit: Number(s.tier_starter_limit) || prev.tierStarterLimit,
            tierStarterPriceUsd: Number(s.tier_starter_price_usd) || prev.tierStarterPriceUsd,
            tierGrowthName: s.tier_growth_name || prev.tierGrowthName,
            tierGrowthLimit: Number(s.tier_growth_limit) || prev.tierGrowthLimit,
            tierGrowthPriceUsd: Number(s.tier_growth_price_usd) || prev.tierGrowthPriceUsd,
            tierEnterpriseName: s.tier_enterprise_name || prev.tierEnterpriseName,
            tierEnterpriseLimit: Number(s.tier_enterprise_limit) || prev.tierEnterpriseLimit,
            tierEnterprisePriceUsd: Number(s.tier_enterprise_price_usd) || prev.tierEnterprisePriceUsd,
          }));
        }
      })
      .catch(() => {});

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
        `Upload up to ${settings.tierStarterLimit ?? 25} products in the Marketplace`,
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
      price: `$${settings.tierStarterPriceUsd ?? settings.monthlySubscriptionPriceUsd}`,
      period: '/ month (after Month 1)',
      subtitle:
        'Simple flat monthly rate after your 30-day grace period to keep your business profile and products live.',
      highlighted: true,
      features: [
        'Continuous public visibility in the Business Directory',
        `Up to ${settings.tierStarterLimit ?? 25} product listings on Starter (expandable to ${settings.tierEnterpriseLimit ?? 300}+)`,
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

          {/* Storefront Catalog Tiers & Capacity Quotas */}
          <div className="mt-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
            <div className="max-w-2xl mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Self-Service Capacity Expansion
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Storefront Catalog Quotas &amp; Tier Pricing
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5">
                Every newly registered business starts with {settings.tierStarterLimit ?? 25} product slots completely free during the {settings.freeGracePeriodDays}-day grace period. Expand your capacity anytime directly from your dashboard with automated instant activation.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-400 font-semibold bg-slate-50/50 dark:bg-slate-800/40">
                    <th className="px-4 py-3">Storefront Tier</th>
                    <th className="px-4 py-3">Catalog Quota</th>
                    <th className="px-4 py-3">Monthly Rate (USD)</th>
                    <th className="px-4 py-3">Reference (ZiG)</th>
                    <th className="px-4 py-3">Ideal For</th>
                    <th className="px-4 py-3 text-right">Expansion Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                  {/* Starter Tier */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      {settings.tierStarterName ?? 'Starter Storefront'}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-700 dark:text-emerald-400">
                      {settings.tierStarterLimit ?? 25} Products
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      ${settings.tierStarterPriceUsd ?? 15} / mo
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {Math.round((settings.tierStarterPriceUsd ?? 15) * (settings.usdToZigRate || 26.5)).toLocaleString()} ZiG
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      Boutiques, cafes, artisans, solo traders &amp; local service shops
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                        Default Baseline
                      </span>
                    </td>
                  </tr>

                  {/* Growth Tier */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 bg-emerald-50/20 dark:bg-emerald-950/10">
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{settings.tierGrowthName ?? 'Growth Storefront'}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                          Popular
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-700 dark:text-emerald-400">
                      {settings.tierGrowthLimit ?? 100} Products
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      ${settings.tierGrowthPriceUsd ?? 25} / mo
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {Math.round((settings.tierGrowthPriceUsd ?? 25) * (settings.usdToZigRate || 26.5)).toLocaleString()} ZiG
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      Supermarkets, clothing distributors, consumer electronics retailers
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href="/dashboard/business?tab=products"
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        Expand in Dashboard →
                      </Link>
                    </td>
                  </tr>

                  {/* Enterprise Tier */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      {settings.tierEnterpriseName ?? 'Enterprise Wholesaler'}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-700 dark:text-emerald-400">
                      {settings.tierEnterpriseLimit ?? 300} Products
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      ${settings.tierEnterprisePriceUsd ?? 50} / mo
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {Math.round((settings.tierEnterprisePriceUsd ?? 50) * (settings.usdToZigRate || 26.5)).toLocaleString()} ZiG
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      Hardware depots, agricultural suppliers, auto parts wholesalers
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href="/dashboard/business?tab=products"
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        Expand in Dashboard →
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              Need custom catalog quotas above {settings.tierEnterpriseLimit ?? 300} items? Contact our corporate team for dedicated enterprise contracts.
            </p>
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
