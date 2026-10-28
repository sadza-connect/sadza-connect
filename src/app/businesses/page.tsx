'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  MapPin,
  MessageCircle,
  CheckCircle2,
  Briefcase,
  Bookmark,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { BusinessListing, SAMPLE_BUSINESSES } from '@/lib/data/zimbabwe';
import { CLEAN_PROVINCES, COMMERCIAL_SECTORS } from '@/data/advertsStore';
import {
  getSavedBusinessIds,
  toggleSavedBusinessId,
} from '@/data/platformStore';
import { createBusinessInquiryLink } from '@/lib/utils/whatsapp';
import { mapDbBusinessToListing } from '@/lib/data/business-mapper';
import { getBusinessSectorCover } from '@/lib/data/business-images';

const POPULAR_PROVINCES = [
  'All Provinces',
  'Harare',
  'Bulawayo',
  'Manicaland',
  'Midlands',
];

export default function BusinessesDirectoryPage() {
  // Initialize with SAMPLE_BUSINESSES for instant paint matching Figma
  const [businesses, setBusinesses] = useState<BusinessListing[]>(SAMPLE_BUSINESSES);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'relevant' | 'rating' | 'name'>('relevant');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDirectory() {
      try {
        const res = await fetch('/api/v1/businesses?limit=100');
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.businesses)) {
          if (isMounted) {
            const mapped = json.data.businesses.map(mapDbBusinessToListing);
            // Merge DB businesses with sample businesses
            const existingSlugs = new Set(mapped.map((b: BusinessListing) => b.slug));
            const merged = [
              ...mapped,
              ...SAMPLE_BUSINESSES.filter((sb) => !existingSlugs.has(sb.slug)),
            ];
            setBusinesses(merged);
          }
        }
      } catch (err) {
        console.warn('Using default business directory showcase', err);
      }
    }

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get('q');
      if (q) setSearchTerm(q);
      const prov = urlParams.get('province');
      if (prov) setSelectedProvince(prov);
      const sec = urlParams.get('sector');
      if (sec) setSelectedSector(sec);
    }

    loadDirectory();
    setSavedIds(getSavedBusinessIds());

    const sync = () => {
      loadDirectory();
      setSavedIds(getSavedBusinessIds());
    };
    window.addEventListener('sadza-platform-updated', sync);
    return () => {
      isMounted = false;
      window.removeEventListener('sadza-platform-updated', sync);
    };
  }, []);

  const filteredBusinesses = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const result = businesses.filter((biz) => {
      if (biz.subscriptionStatus === 'Expired') return false;

      const matchesSearch =
        !q ||
        biz.name.toLowerCase().includes(q) ||
        biz.description.toLowerCase().includes(q) ||
        biz.categoryName.toLowerCase().includes(q) ||
        (biz.tags && biz.tags.some((t) => t.toLowerCase().includes(q)));

      const matchesProvince =
        selectedProvince === 'All Provinces' || biz.province === selectedProvince;

      const matchesSector =
        selectedSector === 'All Sectors' ||
        biz.categoryName.toLowerCase().includes(selectedSector.toLowerCase()) ||
        selectedSector.toLowerCase().includes(biz.categoryName.toLowerCase());

      const matchesVerified = !verifiedOnly || Boolean(biz.cr14Verified);

      return matchesSearch && matchesProvince && matchesSector && matchesVerified;
    });

    if (sortBy === 'rating') {
      return [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    if (sortBy === 'name') {
      return [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [
    businesses,
    searchTerm,
    selectedProvince,
    selectedSector,
    verifiedOnly,
    sortBy,
  ]);

  const handleToggleSave = (id: string) => {
    const updated = toggleSavedBusinessId(id);
    setSavedIds(updated);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-6 sm:py-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* -------------------------------------------------------------
              HERO BANNER (Matching Figma sadza-connect-business-directory-storefront.png)
          ------------------------------------------------------------- */}
          <div className="relative rounded-3xl overflow-hidden mb-8 bg-slate-950 border border-slate-800 text-white shadow-lg">
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80"
                alt="Zimbabwe Commercial Skyline"
                fill
                priority
                className="object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-[#003822]/60" />
            </div>

            <div className="relative p-6 sm:p-10 lg:p-12">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="max-w-2xl">
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
                    Verified <span className="text-[#f59e0b]">Businesses</span>
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                    Discover trusted Zimbabwean businesses. Real people. Real businesses. A stronger Zimbabwe.
                  </p>
                </div>

                {/* Right side slogan: Support Connect Build Zimbabwe */}
                <div className="hidden lg:block text-right text-xs font-semibold tracking-wider uppercase shrink-0">
                  <p className="text-slate-400">Support</p>
                  <p className="text-slate-300">Connect</p>
                  <p className="text-white font-bold relative inline-block">
                    Build Zimbabwe
                    <span className="block h-0.5 bg-[#f59e0b] w-full mt-1" />
                  </p>
                </div>
              </div>

              {/* In-Hero Search Container with Green Square Button */}
              <div className="mt-6 max-w-2xl bg-white rounded-2xl p-1.5 shadow-md flex items-center gap-2">
                <div className="relative flex-1 flex items-center pl-3">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for a business, category or product..."
                    className="w-full pl-3 pr-2 py-2.5 bg-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  aria-label="Search"
                  className="h-11 w-11 rounded-xl bg-[#007a3d] hover:bg-[#006331] text-white flex items-center justify-center shrink-0 transition shadow-xs cursor-pointer"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              PROVINCE PILLS & VERIFIED ONLY TOGGLE STRIP (Matching Figma)
          ------------------------------------------------------------- */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {/* Province Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedProvince('All Provinces')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  selectedProvince === 'All Provinces'
                    ? 'bg-[#005a36] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>All Provinces</span>
              </button>

              {['Harare', 'Bulawayo', 'Manicaland', 'Midlands'].map((prov) => {
                const isActive = selectedProvince === prov;
                return (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => setSelectedProvince(prov)}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? 'bg-[#005a36] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {prov}
                  </button>
                );
              })}

              {/* More Provinces Dropdown */}
              <div className="relative">
                <select
                  value={POPULAR_PROVINCES.includes(selectedProvince) ? '' : selectedProvince}
                  onChange={(e) => e.target.value && setSelectedProvince(e.target.value)}
                  className="px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer appearance-none pr-7"
                >
                  <option value="">More ▾</option>
                  {CLEAN_PROVINCES.filter((p) => !POPULAR_PROVINCES.includes(p)).map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Verified Only Toggle */}
            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Verified only
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={verifiedOnly}
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  verifiedOnly ? 'bg-[#007a3d]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    verifiedOnly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* -------------------------------------------------------------
              RESULTS HEADER & SORT ROW
          ------------------------------------------------------------- */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span>Showing</span>
              <strong className="text-slate-900 dark:text-white font-bold">
                {filteredBusinesses.length}
              </strong>
              <span>verified business{filteredBusinesses.length === 1 ? '' : 'es'}</span>

              {(searchTerm ||
                selectedProvince !== 'All Provinces' ||
                selectedSector !== 'All Sectors' ||
                verifiedOnly) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedProvince('All Provinces');
                    setSelectedSector('All Sectors');
                    setVerifiedOnly(false);
                  }}
                  className="inline-flex items-center gap-1 ml-2 text-[#007a3d] font-semibold hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Sort by</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="relevant">Most relevant</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              BUSINESS DIRECTORY CARDS (3 columns, Matching Figma sadza-connect-business-directory-storefront.png)
          ------------------------------------------------------------- */}
          {filteredBusinesses.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
              <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No businesses match your current filters
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Try clearing your search query or selecting All Provinces to discover all registered Zimbabwean businesses.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedProvince('All Provinces');
                  setSelectedSector('All Sectors');
                  setVerifiedOnly(false);
                }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#005a36] text-white text-xs font-semibold cursor-pointer"
              >
                Show All Businesses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filteredBusinesses.map((biz) => {
                const whatsappLink = createBusinessInquiryLink(biz.name, biz.whatsapp);
                const isSaved = savedIds.includes(biz.id);
                const coverPhoto =
                  biz.coverImage || biz.image || getBusinessSectorCover(biz.categoryName);

                return (
                  <div
                    key={biz.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all group"
                  >
                    <div>
                      {/* Image Banner (16:10 aspect ratio) */}
                      <div className="relative h-44 sm:h-48 w-full bg-slate-900 overflow-hidden">
                        <Image
                          src={coverPhoto}
                          alt={biz.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Overlapping Circular Brand Logo with Verified Badge */}
                        <div className="absolute -bottom-8 left-5 z-20">
                          <div className="relative h-20 w-20 rounded-full bg-slate-900 border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center overflow-hidden">
                            {biz.logoUrl ? (
                              <Image
                                src={biz.logoUrl}
                                alt={biz.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-xl font-black text-[#007a3d]">
                                {biz.name.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                            {biz.cr14Verified && (
                              <span className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-[#007a3d] text-white flex items-center justify-center text-[11px] font-bold shadow-md border-2 border-white dark:border-slate-900">
                                ✓
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Content (pt-10 for overlapping logo clearance) */}
                      <div className="p-5 pt-10 space-y-1.5">
                        <Link
                          href={`/businesses/${biz.slug}`}
                          className="group-hover:text-[#007a3d] transition-colors block"
                        >
                          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                            {biz.name}
                          </h2>
                        </Link>

                        {/* Category */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{biz.categoryName}</span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{biz.province}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Action Footer: [ WhatsApp ] (Green) & [ View storefront → ] (Outline) */}
                    <div className="p-4 pt-2">
                      <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#007a3d] hover:bg-[#006331] text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp</span>
                        </a>

                        <Link
                          href={`/businesses/${biz.slug}`}
                          className="inline-flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold transition"
                        >
                          <span>View storefront</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
