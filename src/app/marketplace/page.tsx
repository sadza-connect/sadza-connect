'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  ShoppingBag,
  MessageCircle,
  CheckCircle2,
  MapPin,
  Bookmark,
  RotateCcw,
  Plus,
  SlidersHorizontal,
  ArrowUpDown,
  ShieldCheck,
  Check,
  Sparkles,
  Heart,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { MarketplaceProduct } from '@/lib/data/zimbabwe';
import { CLEAN_PROVINCES, COMMERCIAL_SECTORS } from '@/data/advertsStore';
import {
  getSavedProductIds,
  toggleSavedProductId,
  getPlatformSettings,
} from '@/data/platformStore';
import { createProductInquiryLink } from '@/lib/utils/whatsapp';
import { mapDbProductToMarketplaceProduct } from '@/lib/data/product-mapper';

export default function MarketplacePage() {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [usdToZig, setUsdToZig] = useState<number>(26.5);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');
  const [selectedCondition, setSelectedCondition] = useState('All Conditions');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMarketplace() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/v1/products?limit=100');
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.products)) {
          if (isMounted) {
            const mapped = json.data.products.map(mapDbProductToMarketplaceProduct);
            setProducts(mapped);
          }
        } else if (isMounted) {
          setProducts([]);
        }
      } catch {
        if (isMounted) setProducts([]);
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

    loadMarketplace();
    setSavedIds(getSavedProductIds());
    setUsdToZig(getPlatformSettings().usdToZigRate);

    const sync = () => {
      loadMarketplace();
      setSavedIds(getSavedProductIds());
      setUsdToZig(getPlatformSettings().usdToZigRate);
    };
    window.addEventListener('sadza-platform-updated', sync);
    return () => {
      isMounted = false;
      window.removeEventListener('sadza-platform-updated', sync);
    };
  }, []);

  // Compute sector counts
  const sectorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const min = minPrice ? parseFloat(minPrice) : null;
    const max = maxPrice ? parseFloat(maxPrice) : null;

    const filtered = products.filter((prod) => {
      const matchesSearch =
        !q ||
        prod.title.toLowerCase().includes(q) ||
        prod.category.toLowerCase().includes(q) ||
        prod.sellerName.toLowerCase().includes(q) ||
        prod.description.toLowerCase().includes(q);

      const matchesSector =
        selectedSector === 'All Sectors' ||
        prod.category.toLowerCase() === selectedSector.toLowerCase();

      const matchesProvince =
        selectedProvince === 'All Provinces' || prod.province === selectedProvince;

      const matchesCondition =
        selectedCondition === 'All Conditions' ||
        prod.condition === selectedCondition;

      const matchesMin = min === null || isNaN(min) || prod.priceUsd >= min;
      const matchesMax = max === null || isNaN(max) || prod.priceUsd <= max;
      const matchesVerified = !verifiedOnly || prod.sellerVerified;

      return (
        matchesSearch &&
        matchesSector &&
        matchesProvince &&
        matchesCondition &&
        matchesMin &&
        matchesMax &&
        matchesVerified
      );
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'price-asc') return a.priceUsd - b.priceUsd;
      if (sortBy === 'price-desc') return b.priceUsd - a.priceUsd;
      if (sortBy === 'newest') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      // default: featured first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      if (a.sellerVerified && !b.sellerVerified) return -1;
      if (!a.sellerVerified && b.sellerVerified) return 1;
      return 0;
    });
  }, [
    products,
    searchTerm,
    selectedSector,
    selectedProvince,
    selectedCondition,
    minPrice,
    maxPrice,
    verifiedOnly,
    sortBy,
  ]);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedSector !== 'All Sectors' ||
    selectedProvince !== 'All Provinces' ||
    selectedCondition !== 'All Conditions' ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    verifiedOnly;

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSector('All Sectors');
    setSelectedProvince('All Provinces');
    setSelectedCondition('All Conditions');
    setMinPrice('');
    setMaxPrice('');
    setVerifiedOnly(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-6 sm:py-10">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 mb-2.5">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>National Commercial Marketplace • Direct Wholesale &amp; Retail</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Commercial Stock &amp; Equipment Catalog
              </h1>
              <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl">
                Browse verified stock uploaded by registered Zimbabwean businesses. Direct WhatsApp negotiation with real-time USD &amp; ZiG dual-currency pricing.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/dashboard/business?tab=products"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Product SKU</span>
              </Link>
            </div>
          </div>

          {/* Quick Category Pills on Mobile (Horizontal Scrollable) */}
          <div className="lg:hidden mb-5 -mx-4 px-4 overflow-x-auto scrollbar-none flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedSector('All Sectors')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shrink-0 ${
                selectedSector === 'All Sectors'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              All Sectors ({products.length})
            </button>
            {COMMERCIAL_SECTORS.map((sec) => {
              const count = sectorCounts[sec.name] || 0;
              const isSelected = selectedSector === sec.name;
              return (
                <button
                  key={sec.name}
                  type="button"
                  onClick={() => setSelectedSector(sec.name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{sec.name}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-emerald-800 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Dual-Column Layout: Sidebar Filters + Main Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Desktop Left Sidebar Filters (Matching sadza-connect-marketplace-product.png) */}
            <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Filter Catalog
                    </h2>
                  </div>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Filter 1: Commercial Sectors */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    Commercial Sector
                  </h3>
                  <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => setSelectedSector('All Sectors')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                        selectedSector === 'All Sectors'
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span>All Sectors</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {products.length}
                      </span>
                    </button>

                    {COMMERCIAL_SECTORS.map((sec) => {
                      const count = sectorCounts[sec.name] || 0;
                      const isSelected = selectedSector === sec.name;
                      return (
                        <button
                          key={sec.name}
                          type="button"
                          onClick={() => setSelectedSector(sec.name)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <span className="truncate pr-2">{sec.name}</span>
                          <span
                            className={`text-[11px] px-1.5 py-0.5 rounded-full shrink-0 ${
                              isSelected
                                ? 'bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-100'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Filter 2: Dual Price Range */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                    Price Range (USD $)
                  </h3>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="text-[10px] text-slate-400 font-medium">Min ($)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-medium">Max ($)</label>
                      <input
                        type="number"
                        placeholder="Any"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                  {(minPrice || maxPrice) && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      ≈ {minPrice ? (Number(minPrice) * usdToZig).toLocaleString() : '0'} to{' '}
                      {maxPrice ? (Number(maxPrice) * usdToZig).toLocaleString() : 'Any'} ZiG
                    </p>
                  )}
                </div>

                {/* Filter 3: Province / Location */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Province
                  </h3>
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-emerald-600"
                  >
                    {CLEAN_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter 4: Condition */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Item Condition
                  </h3>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-emerald-600"
                  >
                    <option value="All Conditions">All Conditions</option>
                    <option value="Brand New">Brand New</option>
                    <option value="Certified Used">Certified Used</option>
                    <option value="Locally Fabricated">Locally Fabricated</option>
                  </select>
                </div>

                {/* Filter 5: Verified & In-Stock Only Toggle */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Verified Sellers Only</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Dual Currency Exchange Rate Indicator */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    Real-time Benchmark
                  </p>
                  <p>
                    1 USD = <strong className="text-slate-900 dark:text-white">{usdToZig} ZiG</strong>
                  </p>
                </div>
              </div>
            </aside>

            {/* Right Main Product Listing Area */}
            <div className="lg:col-span-9 space-y-6">
              {/* Search Bar & Sort Bar */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search solar panels, inverters, cement, fertilizer, laptops, commercial parts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mobile filter toggle button */}
                    <button
                      type="button"
                      onClick={() => setShowMobileFilters(!showMobileFilters)}
                      className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <Filter className="w-4 h-4 text-emerald-600" />
                      <span>Filters</span>
                    </button>

                    <div className="relative flex items-center">
                      <ArrowUpDown className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-600 appearance-none cursor-pointer"
                      >
                        <option value="featured">Featured First</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="newest">Newest Uploads</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Results count & active tags bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>
                      Showing <strong className="text-slate-900 dark:text-white">{filteredProducts.length}</strong> verified commercial items
                    </span>
                    {hasActiveFilters && (
                      <span className="text-emerald-600 font-semibold">• Filters Active</span>
                    )}
                  </div>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear all filters</span>
                    </button>
                  )}
                </div>

                {/* Mobile Expanded Filters Drawer */}
                {showMobileFilters && (
                  <div className="lg:hidden pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
                      >
                        <option value="All Sectors">All Sectors</option>
                        {COMMERCIAL_SECTORS.map((sec) => (
                          <option key={sec.name} value={sec.name}>
                            {sec.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
                      >
                        {CLEAN_PROVINCES.map((prov) => (
                          <option key={prov} value={prov}>
                            {prov}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <input
                          type="checkbox"
                          checked={verifiedOnly}
                          onChange={(e) => setVerifiedOnly(e.target.checked)}
                          className="h-4 w-4 rounded text-emerald-600"
                        />
                        <span>Verified Sellers Only</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowMobileFilters(false)}
                        className="px-3 py-1 rounded-md bg-emerald-600 text-white text-xs font-bold"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Cards Grid (Matching Figma sadza-connect-marketplace-product.png) */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden p-4 space-y-3 animate-pulse"
                    >
                      <div className="aspect-[4/3] rounded-xl bg-slate-200 dark:bg-slate-800 w-full" />
                      <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    No products matched your search filters
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    Try broadening your keywords, clearing the sector filter, or expanding the price range to explore all Zimbabwean commercial stock.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Clear All Filters</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                  {filteredProducts.map((prod) => {
                    const zigPrice = Math.round(prod.priceUsd * usdToZig);
                    const whatsappLink = createProductInquiryLink(
                      prod.title,
                      prod.priceUsd,
                      prod.sellerPhone
                    );
                    const isSaved = savedIds.includes(prod.id);

                    return (
                      <div
                        key={prod.id}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:border-emerald-500/70 hover:shadow-md transition-all"
                      >
                        <div>
                          {/* 4:3 Aspect Ratio Product Photo */}
                          <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            {prod.image ? (
                              <Image
                                src={prod.image}
                                alt={prod.title}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                <ShoppingBag className="h-10 w-10 stroke-[1.5] text-slate-300 dark:text-slate-600" />
                                <span className="mt-1 text-xs font-semibold text-slate-400">
                                  Catalog Photo
                                </span>
                              </div>
                            )}

                            {/* Top Badges: Category & Wishlist */}
                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-950/80 text-emerald-400 backdrop-blur-md shadow-xs border border-white/10">
                                {prod.category}
                              </span>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSavedIds(toggleSavedProductId(prod.id));
                                }}
                                aria-label="Save to Wishlist"
                                className={`pointer-events-auto h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                                  isSaved
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-950/60 hover:bg-slate-950/90 text-white backdrop-blur-md'
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                              </button>
                            </div>

                            {/* Bottom-left Photo Badge: In Stock / Ready to Dispatch */}
                            <div className="absolute bottom-3 left-3 z-10">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/95 dark:bg-slate-950/90 text-slate-900 dark:text-slate-100 backdrop-blur-xs shadow-xs border border-slate-200/50 dark:border-slate-800">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{prod.stockNote || 'In Stock • Ready'}</span>
                              </span>
                            </div>
                          </div>

                          {/* Card Content Body */}
                          <div className="p-4 sm:p-5 space-y-3">
                            {/* Dual Currency Price (Matching Figma) */}
                            <div>
                              <div className="flex flex-wrap items-baseline gap-2">
                                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                  USD ${prod.priceUsd.toLocaleString()}
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                  ≈ {zigPrice.toLocaleString()} ZiG
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {prod.unit || 'Per Unit'} • {prod.condition}
                              </p>
                            </div>

                            {/* Product Title */}
                            <Link
                              href={`/marketplace/${prod.slug}`}
                              className="block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                            >
                              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                                {prod.title}
                              </h2>
                            </Link>

                            {/* Seller Attribution with circular logo / verified badge */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                              <Link
                                href={`/businesses/${prod.sellerSlug}`}
                                className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 hover:text-emerald-600 transition truncate group/seller"
                              >
                                <div className="relative h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                                  {prod.sellerLogo ? (
                                    <Image
                                      src={prod.sellerLogo}
                                      alt={prod.sellerName}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <span>{prod.sellerName.substring(0, 2).toUpperCase()}</span>
                                  )}
                                </div>
                                <span className="truncate group-hover/seller:underline">
                                  {prod.sellerName}
                                </span>
                                {prod.sellerVerified && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                )}
                              </Link>

                              <span className="text-slate-500 dark:text-slate-400 text-[11px] shrink-0 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {prod.province}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Dual Action Buttons Footer */}
                        <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <Link
                            href={`/marketplace/${prod.slug}`}
                            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 flex items-center gap-1"
                          >
                            <span>View Specs</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>

                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
