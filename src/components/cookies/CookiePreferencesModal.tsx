'use client';

import { useState, useEffect } from 'react';
import { useCookieConsent } from '@/context/CookieConsentContext';
import { Modal } from '@/components/ui/Modal';
import { Lock, ShieldCheck, Check, Sparkles, BarChart3, Megaphone, Info } from 'lucide-react';

export function CookiePreferencesModal() {
  const { consent, isPreferencesOpen, closePreferences, savePreferences, acceptAll, rejectNonEssential } =
    useCookieConsent();

  // Local form state for the toggles
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Sync state whenever consent is updated or modal opens
  useEffect(() => {
    if (consent) {
      setFunctional(consent.functional);
      setAnalytics(consent.analytics);
      setMarketing(consent.marketing);
    } else {
      setFunctional(true);
      setAnalytics(false);
      setMarketing(false);
    }
  }, [consent, isPreferencesOpen]);

  const handleSave = () => {
    savePreferences({ functional, analytics, marketing });
  };

  return (
    <Modal
      isOpen={isPreferencesOpen}
      onClose={closePreferences}
      maxWidth="lg"
      className="p-0 overflow-hidden"
    >
      <div className="flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Cookie &amp; Privacy Preferences
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Customize how cookies and local device storage are utilized while navigating Sadza Connect. Essential security cookies cannot be deactivated as they are required for account login and basic platform functionality.
          </p>
        </div>

        {/* Scrollable Category List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* 1. Strictly Necessary */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                  <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Strictly Necessary Cookies
                  </h4>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Always Active &bull; Required
                  </span>
                </div>
              </div>

              {/* Locked Switch */}
              <div
                className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-emerald-600 cursor-not-allowed opacity-90"
                title="Strictly necessary cookies cannot be disabled"
              >
                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white shadow-sm flex items-center justify-center">
                  <Lock className="h-2.5 w-2.5 text-emerald-700" />
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Required for authenticated merchant and customer sessions (<code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">sadza_access_token</code>, <code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">sadza_refresh_token</code>), CSRF defense, and core directory security. Without these, you cannot log in or manage your storefront.
            </p>
          </div>

          {/* 2. Functional & Experience */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#1e57eb] dark:text-blue-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Functional &amp; Experience
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Site Customization
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={functional}
                onClick={() => setFunctional((v) => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                  functional ? 'bg-[#1e57eb]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    functional ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Stores your interface preferences, such as Dark/Light visual theme (<code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">sadza-theme-v2</code>), last visited Zimbabwean province filter, and storefront catalog display preferences so you don&rsquo;t have to re-select them on every visit.
            </p>
          </div>

          {/* 3. Analytics & Performance */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Analytics &amp; Performance
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Speed &amp; Diagnostics
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={analytics}
                onClick={() => setAnalytics((v) => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                  analytics ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    analytics ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Provides aggregated, anonymized metrics on platform speed, Core Web Vitals, and page visitor trends to help our engineering team resolve bottlenecks and maintain high availability across mobile networks.
            </p>
          </div>

          {/* 4. Marketing & Commercial Promotions */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Marketing &amp; Partner Targeting
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Commercial Offers
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={marketing}
                onClick={() => setMarketing((v) => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${
                  marketing ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    marketing ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Allows customized commercial flyer alerts and tracks WhatsApp merchant inquiries to provide verified conversion reports to local Zimbabwean SME advertisers.
            </p>
          </div>

          {/* Compliance note */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800/60">
            <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Your selections are recorded for 12 months in the <code className="font-mono text-slate-700 dark:text-slate-300">sadza_cookie_consent</code> cookie and can be altered at any time via the &ldquo;Cookie Settings&rdquo; link in the website footer.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={rejectNonEssential}
              className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 transition cursor-pointer"
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
            >
              Accept All
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-[#1e57eb] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/10 transition cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
