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
import { mapDbProductToMarketplaceProduct } from '@/lib/data/product-mapper';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { ProductDetailModal } from '@/components/marketplace/ProductDetailModal';

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
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [usdToZig, setUsdToZig] = useState<number>(26.5);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvinces, setSelectedProvinces] = useState<string>('All Provinces');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [minPriceUsd, setMinPriceUsd] = useState('');
  const [maxPriceUsd, setMaxPriceUsd] = useState('');
  const [minPriceZig, setMinPriceZig] = useState('');
  const [maxPriceZig, setMaxPriceZig] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMarketplace() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/v1/products?limit=100');
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data?.products)) {
          const mapped = json.data.products.map(mapDbProductToMarketplaceProduct);
          setProducts(mapped);

          // If URL specifies ?product=slug, auto-open that product modal
          if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const targetSlug = urlParams.get('product');
            if (targetSlug) {
              const matched = mapped.find(
                (p: MarketplaceProduct) => p.slug === targetSlug || p.id === targetSlug
              );
              if (matched) {
                setSelectedProduct(matched);
                setIsModalOpen(true);
              }
            }
          }
        } else if (isMounted) {
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to load marketplace products from database:', err);
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
      if (prov) setSelectedProvinces(prov);
      const sec = urlParams.get('sector') || urlParams.get('category');
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
    setIsModalOpen(true);
  };

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
                CENTER: PRODUCT GRID (Full 3-column commercial stock cards)
            ------------------------------------------------------------- */}
            <div className="lg:col-span-9 space-y-4">
              {isLoading && products.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden animate-pulse"
                    >
                      <div className="aspect-[4/3] w-full bg-slate-200 dark:bg-slate-800" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
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
                    className="px-4 py-2 rounded-xl bg-[#005a36] text-white text-xs font-bold cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProducts.map((prod) => {
                    const isSaved = savedIds.includes(prod.id);
                    const isSelected = selectedProduct?.id === prod.id && isModalOpen;

                    return (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onViewProduct={handleSelectProduct}
                        isSaved={isSaved}
                        onToggleSave={(id) => setSavedIds(toggleSavedProductId(id))}
                        isSelected={isSelected}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Product Detail Pop-Up Modal (Figma Replica without Navbar & Add-to-Cart) */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen && !!selectedProduct}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        onSelectProduct={(p) => setSelectedProduct(p)}
        allProducts={products}
      />

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
