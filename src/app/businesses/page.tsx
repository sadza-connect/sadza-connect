'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  MapPin,
  ShieldCheck,
  Star,
  MessageCircle,
  Phone,
  CheckCircle2,
  Building2,
  Bookmark,
  Clock,
  ArrowUpRight,
  RotateCcw,
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

const BUSINESS_TYPES = [
  'All Types',
  'Registered Company (Pvt Ltd)',
  'SME / Partnership',
  'Sole Proprietor',
  'Cooperative / Association',
];

export default function BusinessesDirectoryPage() {
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [selectedBusinessType, setSelectedBusinessType] = useState('All Types');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDirectory() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/v1/businesses?limit=100');
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.businesses)) {
          if (isMounted) {
            const mapped = json.data.businesses.map(mapDbBusinessToListing);
            setBusinesses(mapped);
          }
        } else {
          if (isMounted) setBusinesses([]);
        }
      } catch {
        if (isMounted) setBusinesses([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
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
    return businesses.filter((biz) => {
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

      const matchesType =
        selectedBusinessType === 'All Types' ||
        biz.businessType === selectedBusinessType;

      const matchesVerified =
        !verifiedOnly || Boolean(biz.cr14Verified);

      return (
        matchesSearch &&
        matchesProvince &&
        matchesSector &&
        matchesType &&
        matchesVerified
      );
    });
  }, [
    businesses,
    searchTerm,
    selectedProvince,
    selectedSector,
    selectedBusinessType,
    verifiedOnly,
  ]);

  const handleToggleSave = (id: string) => {
    const updated = toggleSavedBusinessId(id);
    setSavedIds(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
                <Building2 className="w-3.5 h-3.5" />
                <span>National Commercial Registry</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Verified Zimbabwe Business Directory
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
                Search registered companies, SMEs, sole proprietors, and cooperatives across all 10 provinces. Contact suppliers directly via WhatsApp or telephone.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/signup?type=business"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-xs"
              >
                <Building2 className="w-4 h-4" />
                <span>List Your Business (30 Days Free)</span>
              </Link>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-8 space-y-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              {/* Search Input */}
              <div className="relative lg:col-span-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search business name, solar, cement, agro, catering..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              {/* Sector Filter */}
              <div className="lg:col-span-3">
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value="All Sectors">All Commercial Sectors (20)</option>
                  {COMMERCIAL_SECTORS.map((sec) => (
                    <option key={sec.name} value={sec.name}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Province Filter (Clean Names Only) */}
              <div className="lg:col-span-3">
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-emerald-600"
                >
                  {CLEAN_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              {/* Business Structure Filter */}
              <div className="lg:col-span-2">
                <select
                  value={selectedBusinessType}
                  onChange={(e) => setSelectedBusinessType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-emerald-600"
                >
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Secondary Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    verifiedOnly
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>CR14 & ZIMRA Certified Only</span>
                </button>

                {(searchTerm ||
                  selectedProvince !== 'All Provinces' ||
                  selectedSector !== 'All Sectors' ||
                  selectedBusinessType !== 'All Types' ||
                  verifiedOnly) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedProvince('All Provinces');
                      setSelectedSector('All Sectors');
                      setSelectedBusinessType('All Types');
                      setVerifiedOnly(false);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset filters</span>
                  </button>
                )}
              </div>

              <div className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                Showing{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {filteredBusinesses.length}
                </span>{' '}
                active business{filteredBusinesses.length === 1 ? '' : 'es'}
              </div>
            </div>
          </div>

          {/* Directory Cards Grid */}
          {filteredBusinesses.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
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
                  setSelectedBusinessType('All Types');
                  setVerifiedOnly(false);
                }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
              >
                Show All Businesses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBusinesses.map((biz) => {
                const whatsappLink = createBusinessInquiryLink(biz.name, biz.whatsapp);
                const isSaved = savedIds.includes(biz.id);

                return (
                  <div
                    key={biz.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:border-emerald-500/70 transition-all group"
                  >
                    <div>
                      {/* Image Header */}
                      <div className="relative h-44 w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                        {biz.image ? (
                          <>
                            <Image
                              src={biz.image}
                              alt={biz.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                            <Building2 className="w-12 h-12 text-slate-600 mb-1" />
                            <span className="text-xs font-semibold text-slate-300 line-clamp-1">{biz.name}</span>
                          </div>
                        )}

                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900/85 text-white backdrop-blur-xs">
                            {biz.categoryName}
                          </span>
                          {biz.cr14Verified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {biz.verificationBadge || 'Verified Company'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/90 text-white shadow-xs">
                              <Clock className="w-3.5 h-3.5" />
                              Unverified
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleSave(biz.id)}
                          aria-label="Bookmark business"
                          className={`absolute top-3 right-3 h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                            isSaved
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white/90 text-slate-700 hover:bg-white'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                          <span className="font-medium bg-slate-900/75 px-2.5 py-0.5 rounded-md">
                            {biz.businessType}
                          </span>
                          <span className="flex items-center gap-1 font-semibold bg-slate-900/75 px-2.5 py-0.5 rounded-md">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                            {biz.reviewCount > 0 ? `${biz.rating} (${biz.reviewCount})` : 'New'}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5">
                        <Link
                          href={`/businesses/${biz.slug}`}
                          className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                        >
                          <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                            {biz.name}
                          </h2>
                        </Link>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            {biz.province} • {biz.address}
                          </span>
                        </div>

                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {biz.description}
                        </p>

                        {/* Services Pills */}
                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                          {biz.services.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <Link
                        href={`/businesses/${biz.slug}`}
                        className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400"
                      >
                        <span>View Storefront</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>

                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${biz.phone}`}
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-colors"
                          title={`Call ${biz.name}`}
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp</span>
                        </a>
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
