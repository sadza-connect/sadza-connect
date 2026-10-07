import { ShieldCheck, Award, FileCheck2, UserCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge } from '@/components/ui/Badge';

export function TrustSafetySection() {
  return (
    <section className="py-20 bg-ink-50/70 dark:bg-ink-900/30 border-t border-ink-200 dark:border-ink-800/80 transition-colors">
      <div className="container-x">
        <SectionHeading
          centered
          eyebrow="Trust & Security Architecture"
          title="Zimbabwe's Two-Tier Verification System"
          description="How Sadza Connect eliminates phantom merchants and protects buyers across all ten provinces."
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Tier 1 Card: Sole Trader & Artisan */}
          <div className="relative rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-8 shadow-card dark:shadow-card-dark flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <Badge tone="brand" size="md">
                  Tier 1 Verification
                </Badge>
                <span className="text-xs font-semibold text-ink-500">Sole Traders & Artisans</span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink-950 dark:text-white">
                    Identity Verified Badge
                  </h3>
                  <p className="text-xs text-ink-500 dark:text-ink-400">For individual technicians & tradesmen</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-ink-600 dark:text-ink-300 leading-relaxed">
                Tailored for Zimbabwe&rsquo;s informal artisans, carpenters, solar installers, mobile
                mechanics, and caterers who power local commerce without formal corporate incorporation.
              </p>

              <div className="mt-6 space-y-2.5 pt-4 border-t border-ink-100 dark:border-ink-800 text-xs">
                <div className="flex items-center gap-2 text-ink-700 dark:text-ink-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>National Identity Card / Passport Verification</span>
                </div>
                <div className="flex items-center gap-2 text-ink-700 dark:text-ink-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Verified WhatsApp Business Phone Number</span>
                </div>
                <div className="flex items-center gap-2 text-ink-700 dark:text-ink-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Verified Service-Radius (No Home Address Exposed)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-ink-100 dark:border-ink-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Recommended for: Plumbers, Welders, Technicians & Caterers
              </span>
            </div>
          </div>

          {/* Tier 2 Card: Corporate Enterprise */}
          <div className="relative rounded-3xl border-2 border-brand-500/40 dark:border-brand-500/40 bg-gradient-to-b from-brand-50/30 to-white dark:from-brand-950/20 dark:to-ink-900 p-8 shadow-card-hover dark:shadow-card-hover-dark flex flex-col justify-between">
            {/* Top Recommended Tag */}
            <div className="absolute -top-3.5 right-6 rounded-full bg-brand-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-emerald">
              Highest Trust Tier
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <Badge tone="verified" size="md">
                  Tier 2 Verification
                </Badge>
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                  Registered Enterprises
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-emerald">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink-950 dark:text-white">
                    CR14 Certified Corporate Badge
                  </h3>
                  <p className="text-xs text-ink-500 dark:text-ink-400">For registered Zimbabwean companies</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-ink-600 dark:text-ink-300 leading-relaxed">
                The gold standard for established corporate entities, wholesalers, hotels, clinics, and
                distributors. Backed by verifiable government registration and tax compliance.
              </p>

              <div className="mt-6 space-y-2.5 pt-4 border-t border-brand-200/50 dark:border-brand-800/50 text-xs">
                <div className="flex items-center gap-2 text-ink-700 dark:text-ink-300">
                  <CheckCircle2 className="h-4 w-4 text-brand-600 dark:text-brand-400 shrink-0" />
                  <span>Certificate of Incorporation (Registrar of Companies)</span>
                </div>
                <div className="flex items-center gap-2 text-ink-700 dark:text-ink-300">
                  <CheckCircle2 className="h-4 w-4 text-brand-600 dark:text-brand-400 shrink-0" />
                  <span>CR14 / CR6 Official Directors Record</span>
                </div>
                <div className="flex items-center gap-2 text-ink-700 dark:text-ink-300">
                  <CheckCircle2 className="h-4 w-4 text-brand-600 dark:text-brand-400 shrink-0" />
                  <span>ZIMRA Tax Clearance Certificate (ITF263 Validated)</span>
                </div>
                <div className="flex items-center gap-2 text-ink-700 dark:text-ink-300">
                  <CheckCircle2 className="h-4 w-4 text-brand-600 dark:text-brand-400 shrink-0" />
                  <span>Physical Commercial Trading Address Verified</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-brand-200/50 dark:border-brand-800/50">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                Recommended for: Wholesalers, Solar Distributors, Hotels & Clinics
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
