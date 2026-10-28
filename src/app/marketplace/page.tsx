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
  Heart,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  ShieldCheck,
  Check,
  Sparkles,
  Filter,
  RotateCcw,
  X,
  Share2,
  LayoutGrid,
  Grid,
  List,
  Tag,
  Clock,
  Phone,
  ExternalLink,
  ShieldAlert,
  Headphones,
  Lock,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { MarketplaceProduct, SAMPLE_PRODUCTS } from '@/lib/data/zimbabwe';
import { CLEAN_PROVINCES, COMMERCIAL_SECTORS } from '@/data/advertsStore';
import {
  getSavedProductIds,
  toggleSavedProductId,
  getPlatformSettings,
} from '@/data/platformStore';
import { createProductInquiryLink } from '@/lib/utils/whatsapp';
import { mapDbProductToMarketplaceProduct } from '@/lib/data/product-mapper';

const SECTORS_WITH_COUNTS = [
  { name: 'Agriculture', count: 65 },
  { name: 'Construction', count: 48 },
  { name: 'Energy & Solar', count: 37 },
  { name: 'Manufacturing', count: 28 },
  { name: 'Vehicles & Transport', count: 31 },
  { name: 'Tools & Equipment', count: 22 },
  { name: 'Business Services', count: 19 },
  { name: 'Home & Office', count: 26 },
  { name: 'Other', count: 18 },
];

export default function MarketplacePage() {
  // Initialize with SAMPLE_PRODUCTS for instant paint
  const [products, setProducts] = useState<MarketplaceProduct[]>(SAMPLE_PRODUCTS);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [usdToZig, setUsdToZig] = useState<number>(26.5);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvinces, setSelectedProvinces] = useState<string>('All Provinces');
  const [selectedSectors, setSelectedSectors] = useState<string[]>(['Energy & Solar']);
  const [selectedConditions, setSelectedConditions] = useState<string[]>(['Brand New']);
  const [minPriceUsd, setMinPriceUsd] = useState('');
  const [maxPriceUsd, setMaxPriceUsd] = useState('');
  const [minPriceZig, setMinPriceZig] = useState('');
  const [maxPriceZig, setMaxPriceZig] = useState('');
  const [inStockOnly, setInStockOnly] = useState(true);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(SAMPLE_PRODUCTS[0] || null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadMarketplace() {
      try {
        const res = await fetch('/api/v1/products?limit=100');
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.products)) {
          if (isMounted) {
            const mapped = json.data.products.map(mapDbProductToMarketplaceProduct);
            // Merge DB products with sample products (avoid duplicate slugs)
            const existingSlugs = new Set(mapped.map((p: MarketplaceProduct) => p.slug));
            const merged = [
              ...mapped,
              ...SAMPLE_PRODUCTS.filter((sp) => !existingSlugs.has(sp.slug)),
            ];
            setProducts(merged);
            if (!selectedProduct && merged.length > 0) {
              setSelectedProduct(merged[0]);
            }
          }
        }
      } catch (err) {
        console.warn('Using default marketplace showcase products', err);
      }
    }

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get('q');
      if (q) setSearchTerm(q);
      const prov = urlParams.get('province');
      if (prov) setSelectedProvinces(prov);
      const sec = urlParams.get('sector');
      if (sec) setSelectedSectors([sec]);
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

  // Sync USD and ZiG price inputs
  const handleMinUsdChange = (val: string) => {
    setMinPriceUsd(val);
    if (val && !isNaN(Number(val))) {
      setMinPriceZig(Math.round(Number(val) * usdToZig).toString());
    } else {
      setMinPriceZig('');
    }
  };

  const handleMaxUsdChange = (val: string) => {
    setMaxPriceUsd(val);
    if (val && !isNaN(Number(val))) {
      setMaxPriceZig(Math.round(Number(val) * usdToZig).toString());
    } else {
      setMaxPriceZig('');
    }
  };

  const handleMinZigChange = (val: string) => {
    setMinPriceZig(val);
    if (val && !isNaN(Number(val))) {
      setMinPriceUsd((Number(val) / usdToZig).toFixed(1));
    } else {
      setMinPriceUsd('');
    }
  };

  const handleMaxZigChange = (val: string) => {
    setMaxPriceZig(val);
    if (val && !isNaN(Number(val))) {
      setMaxPriceUsd((Number(val) / usdToZig).toFixed(1));
    } else {
      setMaxPriceUsd('');
    }
  };

  const toggleSector = (sectorName: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sectorName)
        ? prev.filter((s) => s !== sectorName)
        : [...prev, sectorName]
    );
  };

  const toggleCondition = (cond: string) => {
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const min = minPriceUsd ? parseFloat(minPriceUsd) : null;
    const max = maxPriceUsd ? parseFloat(maxPriceUsd) : null;

    const filtered = products.filter((prod) => {
      const matchesSearch =
        !q ||
        prod.title.toLowerCase().includes(q) ||
        prod.category.toLowerCase().includes(q) ||
        prod.sellerName.toLowerCase().includes(q) ||
        prod.description.toLowerCase().includes(q);

      const matchesSector =
        selectedSectors.length === 0 ||
        selectedSectors.some(
          (s) =>
            prod.category.toLowerCase().includes(s.toLowerCase()) ||
            s.toLowerCase().includes(prod.category.toLowerCase())
        );

      const matchesProvince =
        selectedProvinces === 'All Provinces' || prod.province === selectedProvinces;

      const matchesCondition =
        selectedConditions.length === 0 ||
        selectedConditions.includes(prod.condition);

      const matchesStock = !inStockOnly || prod.stockNote.toLowerCase().includes('stock');

      const matchesMin = min === null || isNaN(min) || prod.priceUsd >= min;
      const matchesMax = max === null || isNaN(max) || prod.priceUsd <= max;
      const matchesVerified = !verifiedOnly || prod.sellerVerified;

      return (
        matchesSearch &&
        matchesSector &&
        matchesProvince &&
        matchesCondition &&
        matchesStock &&
        matchesMin &&
        matchesMax &&
        matchesVerified
      );
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'price-asc') return a.priceUsd - b.priceUsd;
      if (sortBy === 'price-desc') return b.priceUsd - a.priceUsd;
      if (sortBy === 'newest') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [
    products,
    searchTerm,
    selectedSectors,
    selectedProvinces,
    selectedConditions,
    inStockOnly,
    minPriceUsd,
    maxPriceUsd,
    verifiedOnly,
    sortBy,
  ]);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedSectors.length > 0 ||
    selectedProvinces !== 'All Provinces' ||
    selectedConditions.length > 0 ||
    Boolean(minPriceUsd) ||
    Boolean(maxPriceUsd) ||
    !inStockOnly ||
    verifiedOnly;

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSectors([]);
    setSelectedProvinces('All Provinces');
    setSelectedConditions([]);
    setMinPriceUsd('');
    setMaxPriceUsd('');
    setMinPriceZig('');
    setMaxPriceZig('');
    setInStockOnly(false);
    setVerifiedOnly(false);
  };

  const handleSelectProduct = (prod: MarketplaceProduct) => {
    setSelectedProduct(prod);
    setIsDrawerOpen(true);
    setSelectedImageIndex(0);
  };

  const productImages = useMemo(() => {
    if (!selectedProduct) return [];
    if (selectedProduct.images && selectedProduct.images.length > 0) {
      return selectedProduct.images;
    }
    return [selectedProduct.image];
  }, [selectedProduct]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-6 sm:py-8">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Row: Products & Services + Subtitle + Count/Sort/Views */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Products &amp; Services
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Verified businesses. Real opportunities. A stronger Zimbabwe.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                1 – {filteredProducts.length} of {products.length} results
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 hidden sm:inline">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="featured">Most Relevant</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>

              {/* Grid / List View Toggle */}
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition ${
                    viewMode === 'grid'
                      ? 'bg-[#005a36] text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  aria-label="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition ${
                    viewMode === 'list'
                      ? 'bg-[#005a36] text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  aria-label="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <Filter className="w-4 h-4 text-[#007a3d]" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* 3-Column Layout: Left Filters + Center Products Grid + Right Specs Drawer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* -------------------------------------------------------------
                LEFT SIDEBAR: FILTERS (Matching Figma sadza-connect-marketplace-product.png)
            ------------------------------------------------------------- */}
            <aside className="hidden lg:block lg:col-span-3 space-y-5 sticky top-20">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Filters
                  </h2>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-[#007a3d] hover:text-[#005a2b] hover:underline cursor-pointer"
                  >
                    Reset all
                  </button>
                </div>

                {/* 1. Province Dropdown */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                    <span>Province</span>
                  </label>
                  <select
                    value={selectedProvinces}
                    onChange={(e) => setSelectedProvinces(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:border-[#007a3d]"
                  >
                    {CLEAN_PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Sector Checkboxes with Counts */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 mb-2.5">
                    <LayoutGrid className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                    <span>Sector</span>
                  </div>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {SECTORS_WITH_COUNTS.map((sec) => {
                      const isChecked = selectedSectors.includes(sec.name);
                      return (
                        <label
                          key={sec.name}
                          className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSector(sec.name)}
                              className="h-4 w-4 rounded border-slate-300 text-[#007a3d] focus:ring-[#007a3d] cursor-pointer"
                            />
                            <span
                              className={`${
                                isChecked
                                  ? 'font-bold text-slate-900 dark:text-white'
                                  : 'text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {sec.name}
                            </span>
                          </div>
                          <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">
                            {sec.count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Dual Currency Price Inputs */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 mb-2.5">
                    <Tag className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                    <span>Price</span>
                  </div>

                  {/* USD row */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 text-[11px] font-bold text-slate-500">USD</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPriceUsd}
                      onChange={(e) => handleMinUsdChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-[#007a3d]"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPriceUsd}
                      onChange={(e) => handleMaxUsdChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-[#007a3d]"
                    />
                  </div>

                  {/* ZiG row */}
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-[11px] font-bold text-slate-500">ZiG</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPriceZig}
                      onChange={(e) => handleMinZigChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-[#007a3d]"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPriceZig}
                      onChange={(e) => handleMaxZigChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-[#007a3d]"
                    />
                  </div>
                </div>

                {/* 4. Condition Checkboxes */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                    <span>Condition</span>
                  </div>
                  <div className="space-y-1.5">
                    {['Brand New', 'Certified Used', 'Locally Fabricated'].map((cond) => {
                      const isChecked = selectedConditions.includes(cond);
                      return (
                        <label
                          key={cond}
                          className="flex items-center gap-2 py-1 px-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCondition(cond)}
                            className="h-4 w-4 rounded border-slate-300 text-[#007a3d] focus:ring-[#007a3d] cursor-pointer"
                          />
                          <span
                            className={`${
                              isChecked
                                ? 'font-bold text-slate-900 dark:text-white'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {cond}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 5. In Stock Only Toggle */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                    <Clock className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                    <span>In Stock Only</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={inStockOnly}
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                      inStockOnly ? 'bg-[#007a3d]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        inStockOnly ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Apply Filters Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {}}
                    className="w-full py-3 rounded-xl bg-[#005a36] hover:bg-[#00472b] text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </aside>

            {/* -------------------------------------------------------------
                CENTER: PRODUCT GRID (Matching Figma sadza-connect-marketplace-product.png)
            ------------------------------------------------------------- */}
            <div
              className={`${
                isDrawerOpen && selectedProduct
                  ? 'lg:col-span-5 2xl:col-span-5'
                  : 'lg:col-span-9'
              } space-y-4 transition-all duration-300`}
            >
              {filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-4">
                  <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    No products matched your filters
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try broadening your selection or clicking reset to explore all Zimbabwean commercial stock.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-[#005a36] text-white text-xs font-bold"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div
                  className={`grid ${
                    isDrawerOpen && selectedProduct
                      ? 'grid-cols-1 sm:grid-cols-2 gap-4'
                      : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                  }`}
                >
                  {filteredProducts.map((prod) => {
                    const zigPrice = Math.round(prod.priceUsd * usdToZig);
                    const isSaved = savedIds.includes(prod.id);
                    const isSelected = selectedProduct?.id === prod.id && isDrawerOpen;

                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleSelectProduct(prod)}
                        className={`group relative flex flex-col justify-between rounded-2xl border bg-white dark:bg-slate-900 overflow-hidden cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#007a3d] ring-2 ring-[#007a3d]/20 shadow-md'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                        }`}
                      >
                        <div>
                          {/* 4:3 Aspect Ratio Product Photo */}
                          <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <Image
                              src={prod.image}
                              alt={prod.title}
                              fill
                              sizes="(max-width: 640px) 100vw, 50vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />

                            {/* Top Badges: Category Pill (Left) & Heart Wishlist (Right) */}
                            <div className="absolute top-2.5 left-2.5 z-10">
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e1f5ec] text-[#0f5132]">
                                {prod.category}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSavedIds(toggleSavedProductId(prod.id));
                              }}
                              aria-label="Save to Wishlist"
                              className={`absolute top-2.5 right-2.5 h-7 w-7 rounded-full flex items-center justify-center transition-colors shadow-xs z-10 cursor-pointer ${
                                isSaved
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-white/80 dark:bg-slate-900/80 hover:bg-white text-slate-700 dark:text-slate-200 backdrop-blur-xs'
                              }`}
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  isSaved ? 'fill-current text-white' : ''
                                }`}
                              />
                            </button>
                          </div>

                          {/* Card Content */}
                          <div className="p-4 space-y-2">
                            {/* Product Title */}
                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
                              {prod.title}
                            </h2>

                            {/* Location */}
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{prod.province}</span>
                            </div>

                            {/* Dual Currency Price: US$1,250 | ZiG 33,125 */}
                            <div className="pt-1 flex items-baseline gap-2">
                              <span className="font-extrabold text-slate-900 dark:text-white text-base">
                                US${prod.priceUsd.toLocaleString()}
                              </span>
                              <span className="text-slate-300 dark:text-slate-600">|</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                                ZiG {zigPrice.toLocaleString()}
                              </span>
                            </div>

                            {/* Merchant Attribution Row */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="relative h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-[#007a3d]">
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
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold text-slate-900 dark:text-white text-xs">
                                    {prod.sellerName}
                                  </span>
                                  {prod.sellerVerified && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#007a3d] shrink-0 fill-[#007a3d] text-white" />
                                  )}
                                </div>
                              </div>

                              <span className="text-[#007a3d] font-semibold text-xs">
                                {prod.stockNote || 'In Stock'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* -------------------------------------------------------------
                RIGHT PANEL: SELECTED PRODUCT QUICK VIEW & SPECS
                (Matching Figma sadza-connect-marketplace-product.png Right Drawer)
            ------------------------------------------------------------- */}
            {isDrawerOpen && selectedProduct && (
              <div className="lg:col-span-4 2xl:col-span-4 sticky top-20">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                  {/* Top Close Button & Gallery */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="absolute top-2 right-2 z-20 h-7 w-7 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white text-slate-600 dark:text-slate-300 flex items-center justify-center shadow-xs cursor-pointer"
                      aria-label="Close specifications panel"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Main Photo with 1/5 Counter */}
                    <div className="flex gap-2.5">
                      <div className="relative aspect-[4/3] flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <Image
                          src={productImages[selectedImageIndex] || selectedProduct.image}
                          alt={selectedProduct.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-2.5 right-2.5 bg-black/70 text-white text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                          {selectedImageIndex + 1} / {productImages.length}
                        </div>
                      </div>

                      {/* Vertical Thumbnail Strip */}
                      {productImages.length > 1 && (
                        <div className="flex flex-col gap-2 shrink-0">
                          {productImages.slice(0, 4).map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedImageIndex(idx)}
                              className={`relative h-12 w-14 rounded-lg overflow-hidden border-2 cursor-pointer transition ${
                                selectedImageIndex === idx
                                  ? 'border-[#007a3d]'
                                  : 'border-transparent opacity-70 hover:opacity-100'
                              }`}
                            >
                              <Image src={img} alt="thumb" fill className="object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category Pill, Heart, Share */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#e1f5ec] text-[#0f5132]">
                      {selectedProduct.category}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSavedIds(toggleSavedProductId(selectedProduct.id))}
                        className={`h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center transition cursor-pointer ${
                          savedIds.includes(selectedProduct.id)
                            ? 'bg-rose-50 border-rose-200 text-rose-600'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                        aria-label="Wishlist"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            savedIds.includes(selectedProduct.id) ? 'fill-current' : ''
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: selectedProduct.title,
                              url: window.location.href,
                            });
                          }
                        }}
                        className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                        aria-label="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Price */}
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                      {selectedProduct.title}
                    </h3>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-[#007a3d]">
                          US${selectedProduct.priceUsd.toLocaleString()}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">
                          / ZiG {Math.round(selectedProduct.priceUsd * usdToZig).toLocaleString()}
                        </span>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e1f5ec] text-[#0f5132]">
                        • In Stock
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{selectedProduct.province}</span>
                    </div>
                  </div>

                  {/* Key Specifications Table (Matching Figma) */}
                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-2">
                      Key Specifications
                    </h4>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {selectedProduct.highlights && selectedProduct.highlights.length > 0 ? (
                        selectedProduct.highlights.map((h, i) => {
                          const parts = h.split(':');
                          const label = parts[0]?.trim() || '';
                          const val = parts.slice(1).join(':').trim() || '';
                          return (
                            <div
                              key={i}
                              className={`flex items-center justify-between px-3 py-2 ${
                                i % 2 === 0
                                  ? 'bg-slate-50/70 dark:bg-slate-950/40'
                                  : 'bg-white dark:bg-slate-900'
                              }`}
                            >
                              <span className="text-slate-500 dark:text-slate-400">{label}</span>
                              <span
                                className={`font-semibold text-right ${
                                  label.toLowerCase().includes('condition')
                                    ? 'text-[#007a3d]'
                                    : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                {val}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <>
                          <div className="flex items-center justify-between px-3 py-2 bg-slate-50/70 dark:bg-slate-950/40">
                            <span className="text-slate-500">Condition</span>
                            <span className="font-semibold text-[#007a3d]">
                              {selectedProduct.condition}
                            </span>
                          </div>
                          <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-900">
                            <span className="text-slate-500">Location</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {selectedProduct.province}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Sold by Card */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-3 bg-slate-50/50 dark:bg-slate-950/30">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Sold by
                    </span>

                    <div className="flex items-center gap-2.5">
                      <div className="relative h-10 w-10 rounded-full bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-[#007a3d] shrink-0">
                        {selectedProduct.sellerLogo ? (
                          <Image
                            src={selectedProduct.sellerLogo}
                            alt={selectedProduct.sellerName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span>{selectedProduct.sellerName.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {selectedProduct.sellerName}
                          </h5>
                          {selectedProduct.sellerVerified && (
                            <CheckCircle2 className="w-4 h-4 text-[#007a3d] shrink-0 fill-[#007a3d] text-white" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          <span className="text-[#007a3d] font-semibold">Verified Business</span> •
                          Energy Solutions for a Brighter Zimbabwe
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{selectedProduct.province}</span>
                    </div>

                    {/* Stats columns: 120 Products | 98% Positive Feedback | 2+ Years */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs">
                      <div>
                        <strong className="block font-bold text-slate-900 dark:text-white">
                          120
                        </strong>
                        <span className="text-[10px] text-slate-400">Products</span>
                      </div>
                      <div>
                        <strong className="block font-bold text-slate-900 dark:text-white">
                          98%
                        </strong>
                        <span className="text-[10px] text-slate-400">Positive Feedback</span>
                      </div>
                      <div>
                        <strong className="block font-bold text-slate-900 dark:text-white">
                          2+ Years
                        </strong>
                        <span className="text-[10px] text-slate-400">On Sadza Connect</span>
                      </div>
                    </div>

                    <Link
                      href={`/businesses/${selectedProduct.sellerSlug}`}
                      className="block w-full py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs text-center transition"
                    >
                      View Business Profile
                    </Link>
                  </div>

                  {/* Primary CTA: Message seller on WhatsApp */}
                  <a
                    href={createProductInquiryLink(
                      selectedProduct.title,
                      selectedProduct.priceUsd,
                      selectedProduct.sellerPhone
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-xl bg-[#007a3d] hover:bg-[#006331] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Message seller on WhatsApp →</span>
                  </a>

                  {/* Bottom Trust Assurance Strip */}
                  <div className="pt-2 text-center space-y-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-[#007a3d]" />
                      <span>Trade safely on Sadza Connect</span>
                    </div>
                    <div className="flex items-center justify-around text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#007a3d]" /> Verified businesses
                      </span>
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-[#007a3d]" /> Secure conversations
                      </span>
                      <span className="flex items-center gap-1">
                        <Headphones className="w-3 h-3 text-[#007a3d]" /> Support when you need it
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Filters</h3>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="p-1 rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold mb-1.5 block">Province</label>
              <select
                value={selectedProvinces}
                onChange={(e) => setSelectedProvinces(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              >
                {CLEAN_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold mb-1.5 block">Sector</label>
              <div className="grid grid-cols-2 gap-2">
                {SECTORS_WITH_COUNTS.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => toggleSector(s.name)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border ${
                      selectedSectors.includes(s.name)
                        ? 'bg-[#e1f5ec] border-[#007a3d] text-[#0f5132]'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {s.name} ({s.count})
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMobileFilters(false)}
              className="w-full py-3 rounded-xl bg-[#005a36] text-white font-bold text-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
