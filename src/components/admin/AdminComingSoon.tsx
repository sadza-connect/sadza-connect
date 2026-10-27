'use client';

import React from 'react';
import Link from 'next/link';
import {
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';

interface AdminComingSoonProps {
  title: string;
  category: string;
  description: string;
  plannedFeatures: string[];
  eta?: string;
}

export function AdminComingSoon({
  title,
  category,
  description,
  plannedFeatures,
  eta = 'Post-Launch Phase 2',
}: AdminComingSoonProps) {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 mb-6">
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Feature on Hold for V1 • Planned for {eta}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
          {description}
        </p>

        {/* Planned Features Box */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-left max-w-2xl mx-auto mb-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Planned Capabilities in {category}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {plannedFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Nav Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-bold shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <Link
            href="/admin/businesses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition"
          >
            <FileCheck className="w-4 h-4" />
            <span>Open Verification Queue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
