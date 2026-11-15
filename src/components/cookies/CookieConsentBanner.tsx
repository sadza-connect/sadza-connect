'use client';

import { useCookieConsent } from '@/context/CookieConsentContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';

export function CookieConsentBanner() {
  const { isBannerOpen, acceptAll, rejectNonEssential, openPreferences, closeBanner } =
    useCookieConsent();

  return (
    <AnimatePresence>
      {isBannerOpen && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-5 pointer-events-none"
          role="region"
          aria-label="Cookie Consent"
        >
          <div className="mx-auto max-w-4xl pointer-events-auto rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-[#0a1018]/95 p-4 sm:p-6 shadow-2xl backdrop-blur-xl transition-colors">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              {/* Left text with icon */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs">
                  <Cookie className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Your Privacy &amp; Cookie Choices
                    </h3>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                      <ShieldCheck className="h-3 w-3" /> ZIM Data Act Compliant
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                    We use strictly necessary cookies to keep Sadza Connect secure, handle authenticated sessions, and power directory services. With your permission, we also use optional functional and performance cookies to remember your preferences and optimize loading speed. Read our{' '}
                    <Link
                      href="/privacy"
                      className="font-medium text-[#1e57eb] dark:text-blue-400 underline hover:text-blue-600 dark:hover:text-blue-300"
                    >
                      Privacy &amp; Data Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 justify-end pt-1 md:pt-0">
                <button
                  type="button"
                  onClick={openPreferences}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Preferences</span>
                </button>

                <button
                  type="button"
                  onClick={rejectNonEssential}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 transition-all cursor-pointer"
                >
                  Essential Only
                </button>

                <button
                  type="button"
                  onClick={acceptAll}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 text-xs font-bold shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  Accept All
                </button>

                <button
                  type="button"
                  onClick={closeBanner}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors hidden lg:inline-flex cursor-pointer ml-1"
                  aria-label="Dismiss banner"
                  title="Dismiss banner"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
