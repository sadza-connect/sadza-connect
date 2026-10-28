'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Briefcase,
  ShieldCheck,
  Zap,
  Building2,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
    '5kVA Solar',
    'ZESA Tokens',
    'Sadza & Grills',
    'PPC Cement',
    'Vic Falls Lodges',
    'Borehole Drilling',
  ];

  const filteredSuggestions = searchTerm.trim()
    ? AUTOCOMPLETE_SUGGESTIONS.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 transition-colors">
      {/* Compact, purposeful Search & Discovery Card */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 shadow-sm p-4 sm:p-5 backdrop-blur-md">
        {/* Concise Header Line */}
        <div className="text-center mb-3">
          <h1 className="text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {settings.heroHeadline || 'Find Verified Businesses, Products & Services Across Zimbabwe'}
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Search verified local suppliers, shop marketplace products, find tenders, and buy prepaid utility tokens.
          </p>
        </div>

        {/* Unified Search Console */}
        <div className="relative max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-inner">
            {/* Search Input */}
            <div className="relative flex-1 w-full flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
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
                placeholder="Search businesses, products, solar, jobs or utilities..."
                className="w-full rounded-xl bg-transparent py-2 pl-9 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            {/* City / Province Selector */}
            <div className="relative w-full sm:w-48 flex items-center border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700/80 pl-0 sm:pl-2">
              <MapPin className="absolute left-2.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <select
                aria-label="Filter by location"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl bg-transparent py-2 pl-7 pr-6 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {PROVINCES.map((p) => (
                  <option key={p.value} value={p.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search CTA */}
            <Link href={searchHref} className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full px-5 py-2 text-xs sm:text-sm">
                <Search className="h-3.5 w-3.5" />
                <span>Search</span>
              </Button>
            </Link>
          </div>

          {/* Autocomplete Dropdown Preview */}
          {isFocused && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-2xl text-left animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Suggested Matches
              </div>
              {filteredSuggestions.map((item, i) => (
                <div
                  key={i}
                  onMouseDown={() => setSearchTerm(item.title)}
                  className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-emerald-50/60 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.category}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {item.city}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Popular Search Chips */}
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
            <span className="font-semibold text-slate-400 dark:text-slate-500">Popular:</span>
            {popularSearches.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchTerm(tag)}
                className="rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-2xs cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Sleek, 1-Line Trust & Feature Strip */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>CR14 Verified Companies</span>
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <MessageCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Direct WhatsApp Inquiries</span>
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>Instant Prepaid Utilities</span>
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Briefcase className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span>Jobs & Opportunities</span>
          </span>
        </div>
      </div>
    </section>
  );
}
