'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Briefcase,
  ShieldCheck,
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle2,
  Building2,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SpotlightCard } from '@/components/animations/SpotlightCard';
import { ShinyText } from '@/components/animations/ShinyText';
import { OrbitalRing } from '@/components/animations/OrbitalRing';
import { HomeBannerSlideshow } from '@/components/landing/HomeBannerSlideshow';
import {
  getPlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
  PlatformSettings,
} from '@/data/platformStore';

const PROVINCES = [
  { value: 'All', label: 'All Zimbabwe (10 Provinces)' },
  { value: 'Harare', label: 'Harare (Capital & Chitungwiza)' },
  { value: 'Bulawayo', label: 'Bulawayo Metro' },
  { value: 'Midlands', label: 'Midlands (Gweru & Kwekwe)' },
  { value: 'Manicaland', label: 'Manicaland (Mutare & Nyanga)' },
  { value: 'Matabeleland North', label: 'Victoria Falls & Hwange' },
  { value: 'Masvingo', label: 'Masvingo & Chiredzi' },
  { value: 'Mashonaland West', label: 'Mashonaland West (Chinhoyi)' },
  { value: 'Mashonaland East', label: 'Mashonaland East (Marondera)' },
];

const AUTOCOMPLETE_SUGGESTIONS = [
  { title: 'Solar Panels & Hybrid Inverters', category: 'Solar & Clean Energy', city: 'Nationwide' },
  { title: 'ZESA Prepaid Electricity Token (20-Digit)', category: 'Utilities', city: 'Nationwide' },
  { title: 'Commercial Agriculture & Farm Inputs', category: 'Agriculture', city: 'Nationwide' },
  { title: 'Building Supplies, Timber & Cement', category: 'Hardware', city: 'Nationwide' },
  { title: 'Hotels, Lodges & Safari Travel', category: 'Tourism', city: 'Nationwide' },
  { title: 'Hardware, Tools & Equipment', category: 'Industrial', city: 'Nationwide' },
];

export function Hero() {
  const router = useRouter();
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [isFocused, setIsFocused] = useState(false);

  const searchParams = new URLSearchParams();
  if (searchTerm.trim()) searchParams.set('q', searchTerm.trim());
  if (selectedCity && selectedCity !== 'All') searchParams.set('province', selectedCity);
  const searchHref = `/businesses${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  useEffect(() => {
    const sync = () => setSettings(getPlatformSettings());
    sync();
    window.addEventListener('sadza-platform-updated', sync);

    fetch('/api/v1/cms')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const cms = json.data;
          setSettings((prev) => ({
            ...prev,
            heroHeadline: cms.home?.hero?.headline || prev.heroHeadline,
            heroSubtitle: cms.home?.hero?.subtitle || prev.heroSubtitle,
            heroCtaLabel: cms.home?.hero?.ctaLabel || prev.heroCtaLabel,
          }));
        }
      })
      .catch(() => {});

    return () => window.removeEventListener('sadza-platform-updated', sync);
  }, []);

  const popularSearches = [
    '5kVA Solar Packages',
    'ZESA Electricity Tokens',
    'Traditional Sadza & Grills',
    'PPC Cement & Roofing',
    'Victoria Falls Safari Lodges',
    'Borehole Drilling',
  ];

  const filteredSuggestions = searchTerm.trim()
    ? AUTOCOMPLETE_SUGGESTIONS.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-transparent via-white/70 to-slate-50/80 dark:from-transparent dark:via-slate-950/60 dark:to-[#07090e]/90 pt-10 pb-14 sm:pt-14 sm:pb-20 transition-colors">
      {/* The Majestic Celestial Orbital Ring */}
      <OrbitalRing size={940} />

      {/* Subtle atmospheric ambient lighting */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-96 w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl" />

      <div className="container-x text-center">
        {/* National Identity Eyebrow with ShinyText */}
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <ShinyText text="Verified Commercial Directory & Marketplace" speed={3} />
        </div>

        {/* Hero Headline */}
        <h1 className="font-display mt-6 text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.12]">
          {settings.heroHeadline || 'Connecting Zimbabwean Businesses, Customers & Everyday Trade'}
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {settings.heroSubtitle ||
            'Discover verified local suppliers, shop marketplace items, find job vacancies, and recharge utility tokens across Harare, Bulawayo, Mutare, Gweru, and all 10 provinces.'}
        </p>

        {/* Unified Search Console wrapped with React Bits SpotlightCard */}
        <div className="relative mt-10 max-w-3xl mx-auto">
          <SpotlightCard
            spotlightColor="rgba(0, 122, 61, 0.15)"
            borderColor="rgba(0, 122, 61, 0.4)"
            className="!p-2.5 !rounded-2xl bg-white dark:bg-ink-900 shadow-card-hover dark:shadow-card-dark border border-ink-200 dark:border-ink-700"
          >
            <div className="flex flex-col sm:flex-row items-center gap-2">
              {/* Search Input */}
              <div className="relative flex-1 w-full flex items-center">
                <Search className="absolute left-3.5 h-5 w-5 text-ink-400 dark:text-ink-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      router.push(searchHref);
                    }
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  placeholder="Search businesses, services, solar, jobs or utilities..."
                  className="w-full rounded-xl bg-transparent py-3 pl-11 pr-4 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 dark:placeholder:text-ink-500 focus:outline-none"
                />
              </div>

              {/* City Selector */}
              <div className="relative w-full sm:w-56 flex items-center border-t sm:border-t-0 sm:border-l border-ink-200 dark:border-ink-700 pl-0 sm:pl-2">
                <MapPin className="absolute left-2.5 h-4 w-4 text-brand-600 dark:text-brand-400" />
                <select
                  aria-label="Filter by location"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-xl bg-transparent py-3 pl-9 pr-8 text-xs sm:text-sm font-semibold text-ink-800 dark:text-ink-200 focus:outline-none"
                >
                  {PROVINCES.map((p) => (
                    <option key={p.value} value={p.value} className="bg-white dark:bg-ink-900 text-ink-900 dark:text-white">
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search CTA */}
              <Link href={searchHref} className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full px-7 py-3">
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </Button>
              </Link>
            </div>
          </SpotlightCard>

          {/* Autocomplete Dropdown Preview */}
          {isFocused && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-2 shadow-2xl text-left animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-400 dark:text-ink-500">
                Suggested Matches
              </div>
              {filteredSuggestions.map((item, i) => (
                <div
                  key={i}
                  onMouseDown={() => setSearchTerm(item.title)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-brand-50/60 dark:hover:bg-ink-800/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                    <div>
                      <p className="text-sm font-bold text-ink-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-ink-500 dark:text-ink-400">{item.category}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-ink-500 dark:text-ink-400 bg-ink-100 dark:bg-ink-800 px-2 py-0.5 rounded-md">
                    {item.city}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Popular search tags */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="font-bold text-ink-500 dark:text-ink-400">Popular:</span>
            {popularSearches.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchTerm(tag)}
                className="rounded-lg border border-ink-200 dark:border-ink-700/80 bg-white/80 dark:bg-ink-900/80 px-2.5 py-1 text-ink-700 dark:text-ink-300 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors shadow-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Homepage Hero Banner Slideshow (Representing the 5 Commercial Showcase Banners) */}
        <div className="mt-8 sm:mt-10 max-w-5xl xl:max-w-6xl mx-auto text-left">
          <HomeBannerSlideshow />
        </div>

        {/* Feature & Trust Highlights Pill Strip */}
        <div className="mt-10 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6 border-t border-slate-200 dark:border-slate-800 text-left">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">CR14 Verified</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Official Companies</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <MessageCircle className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Direct WhatsApp</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Direct Inquiries</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Zap className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">ZESA & Utilities</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Prepaid Tokens</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Briefcase className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Jobs & Careers</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Local Vacancies</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
