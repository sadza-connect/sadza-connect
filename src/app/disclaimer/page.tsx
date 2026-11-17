import Link from 'next/link';
import {
  AlertTriangle,
  ShieldAlert,
  Building2,
  Home,
  DollarSign,
  ExternalLink,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10">
        <div className="w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 mb-3">
              <AlertTriangle className="w-3.5 h-3.5" />
              Platform Notice &amp; Liability Boundaries
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Platform Disclaimer
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              MySadza Connect Zimbabwe • Operated by Africdominion Group (Pvt) Ltd • Last Updated:
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
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>1. Independent Commercial Directory &amp; Marketplace Intermediary</span>
              </h2>
              <p>
                <strong>MySadza Connect</strong> provides an online commercial discovery platform
                connecting consumers, diaspora buyers, businesses, employers, tourism hosts, and
                property advertisers across Zimbabwe. While we review submitted KYC registration
                documents (such as National IDs, CR14 forms, and tax clearance certificates where
                applicable), MySadza Connect does not act as a party to direct negotiations,
                contracts, or off-platform agreements concluded between users via WhatsApp or
                telephone.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>2. Buyer Due Diligence &amp; Verification Scope</span>
              </h2>
              <p>
                Information published on business storefronts, marketplace listings, job vacancies,
                and tourism retreats is supplied by the respective advertisers. Users are strongly
                advised to conduct independent verification—including inspecting physical goods,
                confirming stock availability, and verifying official company or agent credentials—
                before making advance payments directly to third parties.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-600" />
                <span>3. Property &amp; Rental Listings Disclaimer</span>
              </h2>
              <p>
                The contact unlock fee on the Properties &amp; Rentals portal grants direct access to
                the listed landlord or agent&rsquo;s contact details. MySadza Connect does not
                inspect every rental unit or hold rental deposits on behalf of landlords unless
                explicitly stated. Always inspect properties in person (or through a trusted local
                representative) and confirm legal ownership or mandate before paying deposits or
                leases.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>4. Dual-Currency (USD / ZiG) Exchange Rate Reference</span>
              </h2>
              <p>
                Equivalent Zimbabwe Gold (ZiG) figures displayed alongside USD prices are indicative
                reference conversions based on configured RBZ reference rates and may fluctuate.
                Final settlement amounts are confirmed at the point of checkout or directly with
                the merchant.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-emerald-600" />
                <span>5. External Links &amp; Third-Party Services</span>
              </h2>
              <p>
                Links directing users to WhatsApp, payment processors, or external business websites
                are provided for convenience. MySadza Connect is not responsible for the content,
                availability, or privacy practices of external third-party platforms.
              </p>
            </section>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Report suspicious listings to compliance@sadzaconnect.co.zw
              </span>
              <div className="flex items-center gap-3">
                <Link
                  href="/terms"
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Terms of Service →
                </Link>
                <Link
                  href="/contact"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                >
                  Report an Issue
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
