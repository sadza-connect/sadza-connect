import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { MessageCircle, ShieldCheck, Phone, Mail, MapPin, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-ink-200 dark:border-ink-800/80 bg-ink-50 dark:bg-ink-950 text-ink-700 dark:text-ink-300 pt-16 pb-12 transition-colors">
      <div className="container-x">
        {/* Top Sitemap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-ink-200 dark:border-ink-800">
          {/* Brand Info (Col Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" showTagline={false} />

            <p className="text-sm text-ink-600 dark:text-ink-400 max-w-sm leading-relaxed">
              Sadza Connect is Zimbabwe&rsquo;s premier digital platform connecting people,
              verified businesses, marketplace shoppers, job seekers, and tourists across all ten
              provinces.
            </p>

            <div className="space-y-2 pt-2 text-xs text-ink-600 dark:text-ink-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-600 dark:text-brand-400 shrink-0" />
                <span>Head Office: Africdominion Hub, Gweru & Harare, Zimbabwe</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-600 dark:text-brand-400 shrink-0" />
                <span>support@sadzaconnect.co.zw</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/263771000000?text=Hello%20Sadza%20Connect%20Desk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800 px-3.5 py-2 text-xs font-bold text-brand-700 dark:text-brand-300 hover:bg-brand-600 hover:text-white transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Official WhatsApp Support Desk</span>
              </a>
            </div>
          </div>

          {/* Col 1: Platform Modules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400 mb-4">
              Platform Modules
            </h4>
            <ul className="space-y-2.5 text-sm text-ink-600 dark:text-ink-400">
              <li>
                <Link href="/businesses" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Business Directory & Map
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Online Marketplace
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Jobs & Vacancies
                </Link>
              </li>
              <li>
                <Link href="/bill-payments" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  ZESA Token Settlements
                </Link>
              </li>
              <li>
                <Link href="/#commercial-portal" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Sponsored Business Adverts
                </Link>
              </li>
              <li>
                <Link href="/#directory" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  10 Provinces Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Business Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400 mb-4">
              For Business Owners
            </h4>
            <ul className="space-y-2.5 text-sm text-ink-600 dark:text-ink-400">
              <li>
                <Link href="/signup?role=business" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium">
                  Register Your Business
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Listing Packages & Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  About Sadza Connect
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Help Desk & Contact
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400 mb-4">
              Trust & Governance
            </h4>
            <ul className="space-y-2.5 text-sm text-ink-600 dark:text-ink-400">
              <li>
                <span className="text-xs text-ink-500">WCAG 2.2 AA Compliant</span>
              </li>
              <li>
                <span className="text-xs text-ink-500">ZIMRA Verified Records</span>
              </li>
              <li>
                <span className="text-xs text-ink-500">CR14 Registrar Sync</span>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Two-Tier Trust Model
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Report Listing Abuse
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Multilingual Farewell & Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-500 dark:text-ink-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink-700 dark:text-ink-300">
              Maita Basa • Siyabonga • Thank you for connecting with Zimbabwe
            </span>
          </div>

          <p>
            © 2026 Africdominion Group (Pvt) Ltd. All rights reserved. Version 1.0
          </p>
        </div>
      </div>
    </footer>
  );
}
