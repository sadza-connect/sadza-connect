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
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { SAMPLE_PRODUCTS, MarketplaceProduct } from '@/lib/data/zimbabwe';
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

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return products.filter((prod) => {
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

      return (
        matchesSearch && matchesSector && matchesProvince && matchesCondition
      );
    });
  }, [
    products,
    searchTerm,
    selectedSector,
    selectedProvince,
    selectedCondition,
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>National Commercial Marketplace</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Products & Commercial Stock Catalog
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
                Browse active products uploaded by verified subscribers and businesses in their 30-day grace period. Direct WhatsApp ordering with zero middleman fees.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/dashboard/business?tab=products"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Business Product</span>
              </Link>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-8 space-y-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              <div className="relative lg:col-span-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search solar inverters, cement, fertilizer, laptops, spares..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

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

              <div className="lg:col-span-2">
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value="All Conditions">All Conditions</option>
                  <option value="Brand New">Brand New</option>
                  <option value="Certified Used">Certified Used</option>
                  <option value="Locally Fabricated">Locally Fabricated</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span>
                  Indicative Exchange Rate:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    1 USD = {usdToZig} ZiG
                  </strong>
                </span>
                {(searchTerm ||
                  selectedSector !== 'All Sectors' ||
                  selectedProvince !== 'All Provinces' ||
                  selectedCondition !== 'All Conditions') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSector('All Sectors');
                      setSelectedProvince('All Provinces');
                      setSelectedCondition('All Conditions');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear filters</span>
                  </button>
                )}
              </div>
              <div>
                Showing{' '}
                <strong className="text-slate-900 dark:text-white">
                  {filteredProducts.length}
                </strong>{' '}
                product{filteredProducts.length === 1 ? '' : 's'}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:border-emerald-500/70 transition-all group"
                >
                  <div>
                    <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      {prod.image ? (
                        <Image
                          src={prod.image}
                          alt={prod.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                          <ShoppingBag className="h-10 w-10 stroke-[1.5] text-slate-300 dark:text-slate-600" />
                          <span className="mt-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                            No Photo Provided
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900/85 text-white">
                          {prod.movementBadge}
                        </span>
                        <span className="px-2 py-1 rounded-md text-xs font-semibold bg-white/95 text-slate-800">
                          {prod.condition}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSavedIds(toggleSavedProductId(prod.id))}
                        aria-label="Save product"
                        className={`absolute top-3 right-3 h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                          isSaved
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/90 text-slate-700 hover:bg-white'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {prod.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {prod.province}
                        </span>
                      </div>

                      <Link
                        href={`/marketplace/${prod.slug}`}
                        className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                      >
                        <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                          {prod.title}
                        </h2>
                      </Link>

                      <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                            USD ${prod.priceUsd.toLocaleString()}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {zigPrice.toLocaleString()} ZiG
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {prod.unit} • {prod.stockNote}
                        </div>
                      </div>

                      <div className="mt-3.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <Link
                          href={`/businesses/${prod.sellerSlug}`}
                          className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 hover:text-emerald-600 truncate"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{prod.sellerName}</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <Link
                      href={`/marketplace/${prod.slug}`}
                      className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600"
                    >
                      View Specs →
                    </Link>

                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Order on WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
