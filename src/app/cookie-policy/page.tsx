'use client';

import Link from 'next/link';
import { Cookie, ShieldCheck, SlidersHorizontal, Lock, BarChart3, Clock } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { useCookieConsent } from '@/context/CookieConsentContext';

export default function CookiePolicyPage() {
  const { openPreferences } = useCookieConsent();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10">
        <div className="w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
              <Cookie className="w-3.5 h-3.5" />
              Cookie &amp; Storage Governance
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Cookie Policy
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Aligned with the Zimbabwe Cyber and Data Protection Act [Chapter 12:07] • Last Updated:
              November 2026
            </p>
          </div>
        </div>
      </section>

      <main className="flex-1 py-10 sm:py-12">
        <div className="w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-4xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xs space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>1. What Are Cookies &amp; How MySadza Connect Uses Them</span>
              </h2>
              <p>
                Cookies are small text files stored in your browser when you visit{' '}
                <strong>MySadza Connect</strong>. Alongside browser local storage, we use cookies to
                maintain secure authenticated sessions, remember your display and currency
                preferences (USD and ZiG), and measure platform performance when you grant consent.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>2. Categories of Cookies We Use</span>
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Strictly Necessary Cookies (Always Active):</strong> Essential for login
                  authentication, CSRF protection, and session continuity (such as{' '}
                  <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    sadza_access_token
                  </code>
                  ,{' '}
                  <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    sadza_refresh_token
                  </code>
                  , and{' '}
                  <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    sadza_cookie_consent
                  </code>
                  ). These cannot be disabled because core platform security depends on them.
                </li>
                <li>
                  <strong>Functional &amp; Preference Cookies (Optional):</strong> Remember UI choices
                  such as dark/light theme, preferred Zimbabwe province filters, and saved listings
                  across sessions.
                </li>
                <li>
                  <strong>Analytics &amp; Telemetry Cookies (Optional):</strong> Only activated if
                  you accept analytics cookies. They help us understand which sectors, directory
                  profiles, and services users engage with so we can improve MySadza Connect.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>3. Retention &amp; Consent Duration</span>
              </h2>
              <p>
                Your cookie consent choices are saved for up to twelve (12) months unless you modify
                them earlier or clear your browser storage. Short-lived session tokens expire
                automatically when you sign out or after their configured security lifetime.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>4. Managing Your Cookie Preferences</span>
              </h2>
              <p>
                You can review, customize, or withdraw your consent for optional cookies at any time
                using our preference manager or through your browser&rsquo;s privacy settings.
              </p>
              <div>
                <button
                  type="button"
                  onClick={openPreferences}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Open Cookie Preferences</span>
                </button>
              </div>
            </section>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Questions about cookies? Contact privacy@sadzaconnect.co.zw
              </span>
              <div className="flex items-center gap-4">
                <Link
                  href="/privacy"
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Privacy Policy →
                </Link>
                <Link
                  href="/disclaimer"
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Disclaimer →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
