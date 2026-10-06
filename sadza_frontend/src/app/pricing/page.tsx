import Link from 'next/link';
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  Building2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/Button';

export default function PricingPage() {
  const tiers = [
    {
      name: 'Standard Listing',
      price: 'Free',
      subtitle: 'For emerging entrepreneurs and artisans',
      features: [
        'Verified Directory profile with contact details',
        'Direct WhatsApp click-to-chat inquiry link',
        'Indexed in 1 primary category',
        'OpenStreetMap pin location',
        'Standard search ranking',
      ],
      cta: 'Get Started Free',
      href: '/signup?role=business',
      highlighted: false,
    },
    {
      name: 'Featured Merchant',
      price: '$15',
      period: '/ month',
      subtitle: 'For active retail stores, restaurants & contractors',
      features: [
        'All Standard Listing features',
        'Priority placement at the top of category searches',
        'Distinctive Gold Featured Merchant badge',
        'Up to 15 product listings on Marketplace',
        'Publish job openings to National Jobs Board',
        'WhatsApp direct order lead tracking',
      ],
      cta: 'Upgrade to Featured',
      href: '/signup?role=business&tier=featured',
      highlighted: true,
    },
    {
      name: 'CR14 Corporate Enterprise',
      price: '$45',
      period: '/ month',
      subtitle: 'For registered companies, franchises & manufacturers',
      features: [
        'All Featured Merchant features',
        'Official Green CR14 & ZIMRA Verified Corporate Badge',
        'Multi-branch location management across provinces',
        'Unlimited product catalog listings',
        'Homepage Spotlight inclusion',
        'Dedicated account manager & ZIMRA verification assistance',
      ],
      cta: 'Register Corporate',
      href: '/signup?role=business&tier=corporate',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-ink-950 text-ink-950 dark:text-ink-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container-x max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-50 dark:bg-gold-950/60 text-gold-700 dark:text-gold-300 border border-gold-200 dark:border-gold-800">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              Listing & Growth Packages
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-ink-950 dark:text-white">
              Transparent Pricing for Zimbabwean Businesses
            </h1>
            <p className="text-base sm:text-lg text-ink-600 dark:text-ink-300">
              Reach thousands of high-intent local and diaspora shoppers with zero commission on sales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier, idx) => (
              <div
                key={idx}
                className={`flex flex-col justify-between rounded-3xl p-8 transition-all ${
                  tier.highlighted
                    ? 'border-2 border-brand-500 bg-brand-50/20 dark:bg-brand-950/30 shadow-xl relative'
                    : 'border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-sm'
                }`}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold bg-brand-600 text-white uppercase tracking-wider">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="text-xl font-bold text-ink-950 dark:text-white">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-ink-500 mt-1 min-h-[32px]">
                    {tier.subtitle}
                  </p>

                  <div className="mt-6 mb-6">
                    <span className="text-4xl font-black text-ink-950 dark:text-white">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-sm font-semibold text-ink-500">
                        {tier.period}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-3 text-xs sm:text-sm text-ink-700 dark:text-ink-300 pt-6 border-t border-ink-100 dark:border-ink-800">
                    {tier.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-ink-100 dark:border-ink-800">
                  <Link href={tier.href}>
                    <Button
                      variant={tier.highlighted ? 'primary' : 'secondary'}
                      size="md"
                      fullWidth
                    >
                      <span>{tier.cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
