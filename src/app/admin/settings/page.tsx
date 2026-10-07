'use client';

import { useState } from 'react';
import { Settings, Save, CheckCircle2, RefreshCw } from 'lucide-react';
import { DEFAULT_USD_TO_ZIG_RATE } from '@/lib/utils/currency';

export default function AdminSettingsPage() {
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_USD_TO_ZIG_RATE.toString());
  const [siteName, setSiteName] = useState('Sadza Connect Zimbabwe');
  const [supportWhatsApp, setSupportWhatsApp] = useState('+263771000000');
  const [autoVerifyArtisan, setAutoVerifyArtisan] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink-950 dark:text-white">
          System Settings & Financial Parameters
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1">
          Configure platform exchange rates (USD to ZiG), official WhatsApp hotlines, and KYC automation rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Exchange Rate Card */}
        <div className="p-6 rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-ink-100 dark:border-ink-800">
            <div>
              <h2 className="text-base font-bold text-ink-950 dark:text-white">
                Dual Currency Peg (USD / ZiG)
              </h2>
              <p className="text-xs text-ink-500">
                Determines the automatic conversion on marketplace products and ZESA token estimates.
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gold-50 dark:bg-gold-950 text-gold-700 dark:text-gold-400 border border-gold-200 dark:border-gold-800">
              Live Rate
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                1 USD in Zimbabwe Gold (ZiG)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-400">
                  ZiG
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                Rate Synchronization
              </label>
              <button
                type="button"
                onClick={() => setExchangeRate('27.50')}
                className="w-full py-2.5 px-4 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-xs font-bold text-ink-700 dark:text-ink-300 hover:bg-ink-100 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5 text-brand-600" />
                <span>Reset to RBZ Official Baseline</span>
              </button>
            </div>
          </div>
        </div>

        {/* Platform Identity */}
        <div className="p-6 rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-ink-950 dark:text-white pb-3 border-b border-ink-100 dark:border-ink-800">
            Platform Identity & Communication
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                Platform Name
              </label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                Official Support WhatsApp Helpline
              </label>
              <input
                type="tel"
                required
                value={supportWhatsApp}
                onChange={(e) => setSupportWhatsApp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* KYC Automation Policy */}
        <div className="p-6 rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-ink-950 dark:text-white pb-3 border-b border-ink-100 dark:border-ink-800">
            KYC Automation & Verification Policy
          </h2>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-ink-900 dark:text-white">
                Tier 1 Sole Trader Instant Provisioning
              </div>
              <div className="text-xs text-ink-500">
                Automatically award Tier 1 Verified Artisan badge once WhatsApp business number is confirmed.
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoVerifyArtisan}
              onChange={(e) => setAutoVerifyArtisan(e.target.checked)}
              className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600">
              <CheckCircle2 className="w-4 h-4" />
              Settings Saved Successfully
            </span>
          )}
          <button
            type="submit"
            className="ml-auto inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save System Parameters</span>
          </button>
        </div>
      </form>
    </div>
  );
}
