import Link from 'next/link';
import { FileText, ShieldCheck, CheckCircle2, Lock, CreditCard } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10">
        <div className="w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
              <FileText className="w-3.5 h-3.5" />
              Legal &amp; Commercial Governance
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Terms of Service &amp; Commercial Listing Agreement
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Effective Date: October 2026 • Governed by the Laws of the Republic of Zimbabwe •
              Operated by Africdominion Group (Pvt) Ltd
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
                <span>1. Scope of the Sadza Connect Platform</span>
              </h2>
              <p>
                Sadza Connect (&ldquo;the Platform&rdquo;) is a commercial business directory,
                marketplace, job vacancy board, and utility bill settlement platform operated by
                Africdominion Group (Pvt) Ltd across all 10 provinces of Zimbabwe. By registering an
                account or transacting on the Platform, you agree to abide by these Terms of
                Service.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>2. 30-Day Free Grace Period &amp; Commercial Subscription Terms</span>
              </h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Month 1 Free Grace Period ($0):</strong> Every verified business (Sole
                  Proprietor, Cooperative, SME, or Registered Company) receives thirty (30) calendar
                  days of complimentary directory listing and marketplace product access starting
                  from their registration date.
                </li>
                <li>
                  <strong>Active Monthly Business Subscription ($10 USD / Month):</strong> After the
                  30-day grace period expires, businesses must maintain an active $10 USD/month
                  (or equivalent Zimbabwe Gold / ZiG at the prevailing RBZ rate) subscription to keep
                  their products, job postings, and storefront visible in public search results.
                </li>
                <li>
                  <strong>Sponsored Product Adverts ($20 USD / Month):</strong> Active business
                  subscribers may optionally purchase a $20 USD/month Sponsored Advert slot to
                  promote specific wholesale offers, discounts, or packages on the homepage and
                  dedicated Adverts &amp; Deals board.
                </li>
                <li>
                  <strong>Grace Expiry &amp; Data Preservation:</strong> If a business does not
                  renew after its 30-day grace period, its public marketplace products are paused
                  automatically, but all storefront data is preserved for instant reactivation upon
                  payment.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>3. Locked Primary Registration Credentials &amp; KYC Verification</span>
              </h2>
              <p>
                To prevent commercial impersonation and protect buyers across Zimbabwe, a business
                account&rsquo;s <strong>Registered Business Name</strong>,{' '}
                <strong>Primary Registration Email</strong>, and{' '}
                <strong>Primary Registration Phone Number</strong> are permanently bound to the
                account upon registration. Businesses may add secondary operational WhatsApp lines or
                public sales emails in their Business Dashboard, while any legal name change
                requires submitting updated CR14 / National ID documentation to the Admin Compliance
                Desk.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>4. Marketplace Transactions &amp; Utility Bill Settlements</span>
              </h2>
              <p>
                Marketplace inquiries initiated via WhatsApp or telephone are direct commercial
                negotiations between buyer and verified supplier. Buyers are encouraged to Deal with
                Tier 1 Identity-Verified or Tier 2 CR14-Certified suppliers and inspect physical
                goods where applicable. Prepaid ZESA tokens, Municipal Water clearing, and DStv
                payments processed through the Bill Payments module generate instant electronic
                vouchers and reference receipts stored in your User Dashboard.
              </p>
            </section>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Questions about commercial compliance? Contact support@sadzaconnect.co.zw
              </span>
              <div className="flex items-center gap-3">
                <Link
                  href="/privacy"
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  View Privacy Policy →
                </Link>
                <Link
                  href="/contact"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                >
                  Contact Legal Desk
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
