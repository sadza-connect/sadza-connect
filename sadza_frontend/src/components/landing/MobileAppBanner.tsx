import { Smartphone, WifiOff, Zap, DownloadCloud, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function MobileAppBanner() {
  return (
    <section className="py-16 bg-white dark:bg-ink-950 transition-colors">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 via-ink-950 to-brand-950 p-8 sm:p-12 text-white border border-ink-800 shadow-2xl">
          <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-white/10">
                <WifiOff className="h-3.5 w-3.5" />
                <span>Engineered for Low-Data & Offline Browsing</span>
              </div>

              <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Sadza Connect On-The-Go: Works Smoothly on Econet & NetOne
              </h2>

              <p className="text-sm sm:text-base text-ink-300 max-w-2xl leading-relaxed">
                We understand connectivity in Zimbabwe. The Sadza Connect progressive web app (PWA)
                caches your visited businesses and directory listings so you can view phone numbers
                and physical directions even during network blackouts.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-ink-200">
                <span className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-gold-400" /> Under 2MB Total Data Footprint
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> WhatsApp Integration
                </span>
                <span className="flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-brand-400" /> Android & iOS Home Screen Ready
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center items-start lg:items-end">
              <Button
                variant="primary"
                size="lg"
                as="link"
                href="/signup?role=business"
                className="w-full sm:w-auto"
              >
                <span>Register Your Business Free</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <span className="text-[11px] text-ink-400 text-center lg:text-right w-full">
                Instant setup in under 3 minutes • No listing fees
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
