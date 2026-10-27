'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  MapPin,
  MessageCircle,
  CheckCircle2,
  Building2,
  Bookmark,
  RotateCcw,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { BusinessListing } from '@/lib/data/zimbabwe';
import { CLEAN_PROVINCES, COMMERCIAL_SECTORS } from '@/data/advertsStore';
import {
  getSavedBusinessIds,
  toggleSavedBusinessId,
  getStoredBusinesses,
  saveStoredBusinesses,
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
  'Masvingo',
];

export default function BusinessesDirectoryPage() {
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'relevant' | 'rating' | 'name'>('relevant');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Instant paint from local cache if previously fetched
    const cached = getStoredBusinesses();
    if (cached && cached.length > 0) {
      setBusinesses(cached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    async function loadDirectory(showLoading = false) {
      if (showLoading) setIsLoading(true);
      try {
        const res = await fetch('/api/v1/businesses?limit=100');
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.businesses)) {
          if (isMounted) {
            const mapped = json.data.businesses.map(mapDbBusinessToListing);
            setBusinesses(mapped);
            if (mapped.length > 0) {
              saveStoredBusinesses(mapped);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load businesses directory:', err);
      } finally {
        if (isMounted) setIsLoading(false);
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

    loadDirectory(cached.length === 0);
    setSavedIds(getSavedBusinessIds());

    const sync = () => {
      loadDirectory(false);
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
        biz.tags.some((t) => t.toLowerCase().includes(q));

      const matchesProvince =
        selectedProvince === 'All Provinces' || biz.province === selectedProvince;

      const matchesSector =
        selectedSector === 'All Sectors' ||
        biz.categoryName.toLowerCase() === selectedSector.toLowerCase();

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-8 sm:py-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* -------------------------------------------------------------
              HERO BANNER (Matching Figma sadza-connect-business-directory-storefront.png)
          ------------------------------------------------------------- */}
          <div className="relative rounded-3xl overflow-hidden mb-8 bg-slate-950 border border-slate-800 text-white shadow-md">
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80"
                alt="Zimbabwe Commercial Skyline"
                fill
                priority
                className="object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-emerald-950/75" />
            </div>

            <div className="relative p-6 sm:p-10 lg:p-12">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="max-w-3xl">
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
                    Verified <span className="text-amber-400">Businesses</span>
                  </h1>
                  <p className="mt-2.5 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                    Discover trusted Zimbabwean businesses. Real people. Real businesses. A stronger Zimbabwe.
                  </p>
                </div>

                <div className="hidden lg:block text-right text-xs font-semibold tracking-wider uppercase text-emerald-400/90 shrink-0">
                  <p className="text-slate-400">Support</p>
                  <p className="text-emerald-300">Connect</p>
                  <p className="text-white font-bold">Build Zimbabwe</p>
                </div>
              </div>

              {/* Integrated Search Bar inside Hero */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch gap-2 max-w-2xl bg-white/10 dark:bg-slate-900/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/15">
                <div className="relative flex-1 flex items-center">
                  <Search className="absolute left-3.5 w-5 h-5 text-slate-300" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for a business, category or product..."
                    className="w-full pl-11 pr-4 py-3 bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4 sm:hidden" />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              PROVINCE PILLS & VERIFIED FILTER STRIP (Matching Figma)
          ------------------------------------------------------------- */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {/* Quick Province Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {POPULAR_PROVINCES.map((prov) => {
                const isActive = selectedProvince === prov;
                return (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => setSelectedProvince(prov)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {prov}
                  </button>
                );
              })}

              {/* More Provinces Dropdown */}
              <select
                value={POPULAR_PROVINCES.includes(selectedProvince) ? '' : selectedProvince}
                onChange={(e) => e.target.value && setSelectedProvince(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="">More ▾</option>
                {CLEAN_PROVINCES.filter((p) => !POPULAR_PROVINCES.includes(p)).map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            {/* Verified Only Toggle */}
            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              <label className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <span>Verified only</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={verifiedOnly}
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    verifiedOnly ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      verifiedOnly ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>

          {/* -------------------------------------------------------------
              SECONDARY FILTER & RESULTS COUNT ROW
          ------------------------------------------------------------- */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span>Showing</span>
              <strong className="text-slate-900 dark:text-white font-bold">
                {isLoading && businesses.length === 0 ? '...' : filteredBusinesses.length}
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
                  className="inline-flex items-center gap-1 ml-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Sector selector */}
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none"
              >
                <option value="All Sectors">All Commercial Sectors</option>
                {COMMERCIAL_SECTORS.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* Sort by dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none"
                >
                  <option value="relevant">Most relevant</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              DIRECTORY CARDS GRID (Matching Figma Architecture)
          ------------------------------------------------------------- */}
          {isLoading && businesses.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs animate-pulse"
                >
                  <div>
                    <div className="h-44 sm:h-48 w-full bg-slate-200 dark:bg-slate-800" />
                    <div className="p-5 pt-8 space-y-3">
                      <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-3.5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-3.5 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="h-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
                      <div className="h-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No businesses match your current filters
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Try clearing your search query or switching to All Provinces and All Commercial Sectors.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedProvince('All Provinces');
                  setSelectedSector('All Sectors');
                  setVerifiedOnly(false);
                }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
              >
                Show All Businesses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filteredBusinesses.map((biz) => {
                const whatsappLink = createBusinessInquiryLink(biz.name, biz.whatsapp);
                const isSaved = savedIds.includes(biz.id);
                const coverPhoto = biz.coverImage || biz.image || getBusinessSectorCover(biz.categoryName);

                return (
                  <div
                    key={biz.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:border-emerald-500/70 hover:shadow-md transition-all group"
                  >
                    <div>
                      {/* Image Banner (16:10 aspect ratio) */}
                      <div className="relative h-44 sm:h-48 w-full bg-slate-950 overflow-hidden">
                        <Image
                          src={coverPhoto}
                          alt={biz.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                        {/* Top Category Tag */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-950/80 text-white backdrop-blur-xs">
                            {biz.categoryName}
                          </span>
                        </div>

                        {/* Bookmark Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleSave(biz.id)}
                          aria-label="Bookmark business"
                          className={`absolute top-3 right-3 h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer z-10 ${
                            isSaved
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white/90 text-slate-700 hover:bg-white'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>

                        {/* Overlapping Circular Brand Logo with Verified Badge */}
                        <div className="absolute -bottom-6 left-5 z-20">
                          <div className="relative h-14 w-14 rounded-full bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-md flex items-center justify-center overflow-hidden">
                            {biz.logoUrl ? (
                              <Image
                                src={biz.logoUrl}
                                alt={biz.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                                {biz.name.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                            {biz.cr14Verified && (
                              <span className="absolute -bottom-0.5 -right-0.5 h-4.5 w-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow">
                                ✓
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Content (pt-8 for overlapping logo clearance) */}
                      <div className="p-5 pt-8">
                        <Link
                          href={`/businesses/${biz.slug}`}
                          className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors block"
                        >
                          <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug flex items-center gap-1.5">
                            <span className="truncate">{biz.name}</span>
                            {biz.cr14Verified && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 fill-emerald-50 dark:fill-emerald-950" />
                            )}
                          </h2>
                        </Link>

                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{biz.categoryName}</span>
                        </div>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{biz.province} • {biz.city || biz.address}</span>
                        </div>

                        <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {biz.description}
                        </p>
                      </div>
                    </div>

                    {/* Card Action Footer: WhatsApp & View Storefront */}
                    <div className="p-4 pt-0">
                      <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp</span>
                        </a>

                        <Link
                          href={`/businesses/${biz.slug}`}
                          className="inline-flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold transition"
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
