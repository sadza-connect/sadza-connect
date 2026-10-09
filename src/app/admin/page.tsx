'use client';

import Link from 'next/link';
import {
  Building2,
  FileCheck,
  ShoppingBag,
  Briefcase,
  Zap,
  Users,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { SAMPLE_BUSINESSES } from '../../lib/data/zimbabwe';

export default function AdminDashboardPage() {
  const kpis = [
    {
      label: 'Verified Enterprises',
      value: '1,428',
      change: '+12% this month',
      icon: Building2,
      color: 'text-brand-600',
      bg: 'bg-brand-50 dark:bg-brand-950/80',
    },
    {
      label: 'Pending KYC Approvals',
      value: '14',
      change: '3 urgent CR14 audits',
      icon: FileCheck,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/80',
    },
    {
      label: 'Active Marketplace Items',
      value: '3,890',
      change: '+240 this week',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/80',
    },
    {
      label: 'ZESA Tokens Settled (USD)',
      value: '$28,450',
      change: '4,120 transactions',
      icon: Zap,
      color: 'text-gold-600',
      bg: 'bg-gold-50 dark:bg-gold-950/80',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink-950 dark:text-white">
          Platform Overview
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1">
          Real-time telemetry across Zimbabwe commercial directory, KYC verification queue, and utility payments.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-500">{kpi.label}</span>
                <div className={`p-2 rounded-xl ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-ink-950 dark:text-white">
                {kpi.value}
              </div>
              <div className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                {kpi.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Verification Queue Preview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Pending Verification Queue */}
        <div className="lg:col-span-8 rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-ink-950 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-500" />
                <span>Urgent Verification Review Queue</span>
              </h2>
              <p className="text-xs text-ink-400 mt-0.5">
                Zimbabwean enterprises awaiting CR14 & ZIMRA ITF263 clearance
              </p>
            </div>
            <Link
              href="/admin/businesses"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View All Queue →
            </Link>
          </div>

          <div className="divide-y divide-ink-100 dark:divide-ink-800">
            {SAMPLE_BUSINESSES.slice(0, 3).map((biz) => (
              <div key={biz.id} className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-ink-950 dark:text-white">
                      {biz.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      Tier 2 Pending
                    </span>
                  </div>
                  <div className="text-xs text-ink-500">
                    {biz.city}, {biz.province} • Category: {biz.categoryName}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors"
                  >
                    Approve CR14
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg border border-ink-200 dark:border-ink-700 text-xs font-bold text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800"
                  >
                    Review Docs
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Stats & System Status */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-ink-950 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-gold-500" />
              <span>Platform Health</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-ink-100 dark:border-ink-800">
                <span className="text-ink-500">ZETDC Token Gateway</span>
                <span className="font-bold text-brand-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 99.98% Operational
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-ink-100 dark:border-ink-800">
                <span className="text-ink-500">EcoCash / InnBucks Rails</span>
                <span className="font-bold text-brand-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-ink-100 dark:border-ink-800">
                <span className="text-ink-500">Database & RLS</span>
                <span className="font-bold text-brand-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Supabase Secured
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-ink-500">Official Exchange Rate</span>
                <span className="font-bold text-ink-900 dark:text-white">
                  1 USD = 27.50 ZiG
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
