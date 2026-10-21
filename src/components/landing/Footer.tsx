'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { MessageCircle, Mail, MapPin } from 'lucide-react';
import {
  getPlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
  PlatformSettings,
} from '@/data/platformStore';

export function Footer() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);

  useEffect(() => {
    const sync = () => setSettings(getPlatformSettings());
    sync();
    window.addEventListener('sadza-platform-updated', sync);
    return () => window.removeEventListener('sadza-platform-updated', sync);
  }, []);

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 pt-14 pb-10 transition-colors">
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Top Sitemap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-10 border-b border-slate-200 dark:border-slate-800">
          {/* Brand Info (Col Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" showTagline={false} />

            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              {settings.siteName} is Zimbabwe&rsquo;s commercial directory, marketplace, job board,
              and utility bill settlement platform serving businesses and households across all 10
              provinces.
            </p>

            <div className="space-y-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{settings.hqAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{settings.supportEmail}</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/${settings.supportWhatsApp}?text=Hello%20Sadza%20Connect%20Desk`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Official WhatsApp Support Desk</span>
              </a>
            </div>
          </div>

          {/* Col 1: Platform Modules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Platform Modules
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link
                  href="/businesses"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Business Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Online Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href="/adverts"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Sponsored Adverts &amp; Deals
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Jobs &amp; Vacancies
                </Link>
              </li>
              <li>
                <Link
                  href="/bill-payments"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  ZESA &amp; Utility Settlements
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Commercial Pricing (${settings.monthlySubscriptionPriceUsd}/mo)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Commerce Services & Directory */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Commerce Services
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link
                  href="/businesses"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  National Business Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Dual-Currency Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Careers &amp; Vacancies
                </Link>
              </li>
              <li>
                <Link
                  href="/bill-payments"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  ZESA Tokens &amp; Utility Bills
                </Link>
              </li>
              <li>
                <Link
                  href="/signup?role=business"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-emerald-600 dark:text-emerald-400 font-semibold"
                >
                  Register a Business ({settings.freeGracePeriodDays} Days Free)
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Membership Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Corporate & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Corporate &amp; Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link
                  href="/about"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  About {settings.siteName}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Help Desk &amp; Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Privacy &amp; Data Policy
                </Link>
              </li>
              <li>
                <span className="text-xs text-slate-500">
                  1 USD = {settings.usdToZigRate} ZiG (RBZ Reference)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Maita Basa • Siyabonga • Thank you for connecting with Zimbabwe
            </span>
          </div>

          <p>© 2026 Africdominion Group (Pvt) Ltd. All rights reserved. Version 1.0</p>
        </div>
      </div>
    </footer>
  );
}
