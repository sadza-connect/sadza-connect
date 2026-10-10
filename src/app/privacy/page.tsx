import Link from 'next/link';
import { Lock, ShieldCheck, Eye, Database, FileCheck } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10">
        <div className="w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
              <Lock className="w-3.5 h-3.5" />
              Data Protection &amp; Privacy
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Privacy &amp; Data Protection Policy
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Aligned with the Zimbabwe Cyber and Data Protection Act [Chapter 12:07] • Last Updated:
              October 2026
            </p>
          </div>
        </div>
      </section>

      <main className="flex-1 py-10 sm:py-12">
        <div className="w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-4xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xs space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>1. Information We Collect</span>
              </h2>
              <p>
                Sadza Connect collects only the information necessary to operate a verified national
                business registry, marketplace, job board, and utility settlement service:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Business Accounts:</strong> Registered business name, legal entity classification,
                  registration email, primary phone number, public WhatsApp sales line, physical
                  operating address, province, and KYC verification documents (National ID, CR14,
                  Certificate of Incorporation, or ZIMRA ITF263).
                </li>
                <li>
                  <strong>Regular User Accounts:</strong> Full name, email address, phone number,
                  saved ZESA meter/utility account numbers, bookmarked businesses, and job
                  application CVs submitted to verified employers.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>2. Public Storefront Data vs. Confidential KYC Records</span>
              </h2>
              <p>
                Your public Business Storefront displays only your business name, sector, province,
                operating hours, product catalog, and designated public contact channels (WhatsApp
                and sales phone). Uploaded KYC compliance documents (such as Director National IDs,
                CR14 forms, and ZIMRA tax certificates) are stored in a restricted compliance vault
                accessible strictly to authorized Sadza Connect verification officers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>3. Utility Receipts &amp; Subscription Billing Security</span>
              </h2>
              <p>
                All EcoCash, InnBucks, and card settlements for $10/month business subscriptions,
                $20/month sponsored adverts, and ZESA/Municipal utility bills are processed through
                encrypted payment gateways. We never store raw mobile money PINs or full card CVV
                numbers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>4. Your Rights Under Zimbabwean Law</span>
              </h2>
              <p>
                You have the right to inspect, export, or request deletion of your personal account
                data at any time via your User or Business Dashboard or by contacting our Data
                Protection Officer at <strong>support@sadzaconnect.co.zw</strong>.
              </p>
            </section>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Africdominion Group (Pvt) Ltd • Data Protection Office
              </span>
              <div className="flex items-center gap-3">
                <Link
                  href="/terms"
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  View Terms of Service →
                </Link>
                <Link
                  href="/contact"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                >
                  Contact Support
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
