import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Users,
  Target,
  Globe2,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/Button';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-ink-950 text-ink-950 dark:text-ink-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container-x max-w-4xl">
          {/* Badge & Title */}
          <div className="text-center space-y-4 mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              Africdominion Group (Pvt) Ltd
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-ink-950 dark:text-white">
              Connecting People, Businesses & Opportunities
            </h1>
            <p className="text-base sm:text-lg text-ink-600 dark:text-ink-300 max-w-2xl mx-auto">
              Sadza Connect is Zimbabwe’s unified digital commercial directory, marketplace, and utility settlement platform.
            </p>
          </div>

          {/* Mission & Vision Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/80 flex items-center justify-center text-brand-600 mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-ink-950 dark:text-white mb-2">
                Our Mission
              </h2>
              <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed">
                To eliminate information barriers across Zimbabwe by empowering every business—from local artisans and sole traders to national corporations—with verified digital visibility, WhatsApp commerce, and seamless utility settlements.
              </p>
            </div>

            <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-gold-50 dark:bg-gold-950/80 flex items-center justify-center text-gold-600 mb-4">
                <Globe2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-ink-950 dark:text-white mb-2">
                Our National Vision
              </h2>
              <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed">
                To build Zimbabwe’s premier digital infrastructure that bridges all 10 provinces and connects our local economy to both residents and the global diaspora.
              </p>
            </div>
          </div>

          {/* Verification Blueprint */}
          <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-900/60 p-8 space-y-6">
            <h2 className="text-2xl font-bold text-ink-950 dark:text-white">
              The Two-Tier Trust Model
            </h2>
            <p className="text-sm text-ink-600 dark:text-ink-300">
              Unlike international platforms that ignore African informal enterprise reality, Sadza Connect utilizes a pragmatic two-tier verification blueprint:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-white dark:bg-ink-950 border border-ink-200 dark:border-ink-800">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-700 dark:text-amber-400 mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Tier 1: Identity Verified Artisan</span>
                </div>
                <p className="text-xs text-ink-600 dark:text-ink-400">
                  Tailored for informal traders, solar mechanics, carpenters, and small shops. Verified via Director National ID + active WhatsApp business line.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-ink-950 border border-ink-200 dark:border-ink-800">
                <div className="flex items-center gap-2 font-bold text-sm text-brand-700 dark:text-brand-400 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tier 2: CR14 Certified Corporate</span>
                </div>
                <p className="text-xs text-ink-600 dark:text-ink-400">
                  Formal registered companies verified via official Registrar of Companies CR14 form, Certificate of Incorporation, and ZIMRA ITF263 tax clearance.
                </p>
              </div>
            </div>

            <div className="text-center pt-4">
              <Link href="/signup?role=business">
                <Button variant="primary" size="lg">
                  Register Your Business on Sadza Connect
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
