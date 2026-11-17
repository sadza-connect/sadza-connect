'use client';

import { useCookieConsent } from '@/context/CookieConsentContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, ShieldCheck, SlidersHorizontal, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function CookieConsentBanner() {
  const { isBannerOpen, acceptAll, rejectNonEssential, openPreferences, closeBanner } =
    useCookieConsent();

  return (
    <AnimatePresence>
      {isBannerOpen && (
        <motion.div
          initial={{ y: 120, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 120, opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="fixed bottom-3 sm:bottom-6 inset-x-3 sm:inset-x-6 z-50 pointer-events-none flex justify-center"
          role="region"
          aria-label="Cookie Consent"
        >
          <div className="w-full max-w-5xl pointer-events-auto overflow-hidden rounded-3xl border-2 border-emerald-500/40 dark:border-emerald-500/50 bg-slate-950/95 dark:bg-[#060b12]/98 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all">
            {/* Radiant Brand Gradient Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-[#1e57eb] to-teal-400 animate-gradient" />

            <div className="p-5 sm:p-7">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Visual Icon & Content */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Glowing Icon Frame */}
                  <div className="relative shrink-0">
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#1e57eb] opacity-40 blur-sm" />
                    <div className="relative flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-[#1e57eb] text-white shadow-xl shadow-emerald-500/30">
                      <Cookie className="h-7 w-7 text-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                        MySadza Connect Privacy &amp; Cookie Choices
                      </h3>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-400/40 shadow-xs">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>ZIM Data Act [12:07] Compliant</span>
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl font-medium">
                      <strong className="text-white font-bold">MySadza Connect</strong> uses strictly necessary cookies for secure logins, verified directory searches, and storefront payments. With your consent, we also use optional functional and performance cookies to remember your visual preferences and speed up marketplace browsing. Learn more in our{' '}
                      <Link
                        href="/privacy"
                        className="font-bold text-emerald-400 underline underline-offset-2 hover:text-emerald-300 transition-colors"
                      >
                        Privacy &amp; Data Policy
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/cookie-policy"
                        className="font-bold text-emerald-400 underline underline-offset-2 hover:text-emerald-300 transition-colors"
                      >
                        Cookie Policy
                      </Link>
                      .
                    </p>
                  </div>
                </div>

                {/* Highly Prominent Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0 justify-end pt-2 lg:pt-0">
                  <button
                    type="button"
                    onClick={openPreferences}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 hover:border-slate-500 text-slate-200 hover:text-white px-4 py-3 text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                    <span>Customize</span>
                  </button>

                  <button
                    type="button"
                    onClick={rejectNonEssential}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-600 bg-slate-800/80 hover:bg-slate-700 text-slate-100 hover:text-white px-4 py-3 text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                  >
                    Essential Only
                  </button>

                  <button
                    type="button"
                    onClick={acceptAll}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:via-emerald-500 hover:to-teal-400 text-white font-black px-6 py-3 text-xs sm:text-sm shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span>Accept All Cookies</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={closeBanner}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors hidden xl:inline-flex cursor-pointer ml-1"
                    aria-label="Dismiss cookie notice"
                    title="Dismiss notice"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
