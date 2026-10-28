'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  ArrowLeft,
  Truck,
  Building2,
  Bookmark,
  Package,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Share2,
  Phone,
  Tag,
  Calendar,
  FileText,
  Check,
  Flag,
  X,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { MarketplaceProduct } from '@/lib/data/zimbabwe';
import {
  getPlatformSettings,
  getSavedProductIds,
  toggleSavedProductId,
} from '@/data/platformStore';
import { createProductInquiryLink } from '@/lib/utils/whatsapp';
import { mapDbProductToMarketplaceProduct } from '@/lib/data/product-mapper';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || '';

  const [liveProduct, setLiveProduct] = useState<MarketplaceProduct | null>(null);
  const [usdToZig, setUsdToZig] = useState<number>(26.5);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [reportSubmitted, setReportSubmitted] = useState<boolean>(false);
  const [showStickyHeader, setShowStickyHeader] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setUsdToZig(getPlatformSettings().usdToZigRate);
    setSavedIds(getSavedProductIds());

    if (slug) {
      setIsLoading(true);
      fetch(`/api/v1/products/${encodeURIComponent(slug)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data?.product) {
            setLiveProduct(mapDbProductToMarketplaceProduct(json.data.product));
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }

    const handleScroll = () => {
      setShowStickyHeader(window.scrollY > 380);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug]);

  const product = liveProduct;

  const productImages = useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) {
      return product.images.filter(Boolean).slice(0, 5);
    }
    return product.image ? [product.image].filter(Boolean) : [];
  }, [product]);

  const activeImage = productImages[activeImageIndex] || product?.image || '';

  const handlePrevImage = () => {
    if (productImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (productImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (isLoading && !product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
        <Navbar />
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="aspect-[16/10] w-full rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center flex-1">
          <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Product Not Found
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            The product listing you are looking for may have been removed or does not exist.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/marketplace"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
            >
              Browse Marketplace
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const zigPrice = Math.round(product.priceUsd * usdToZig);
  const whatsappLink = createProductInquiryLink(
    product.title,
    product.priceUsd,
    product.sellerPhone
  );
  const isSaved = savedIds.includes(product.id);

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* -------------------------------------------------------------
          GUMTREE FLOATING MINI-HEADER (Active when user scrolls down)
      ------------------------------------------------------------- */}
      {showStickyHeader && (
        <aside
          aria-label="Sticky product summary"
          className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>
              {activeImage && (
                <img
                  src={activeImage}
                  alt={product.title}
                  className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 truncate">
                  {product.category}
                </p>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {product.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-base font-extrabold text-slate-900 dark:text-white">
                  ${product.priceUsd.toLocaleString()} USD
                </p>
                <p className="text-[11px] font-semibold text-emerald-600">
                  {zigPrice.toLocaleString()} ZiG
                </p>
              </div>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm shadow-sm transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message seller</span>
              </a>
            </div>
          </div>
        </aside>
      )}

      {/* -------------------------------------------------------------
          MAIN PRODUCT VIEW CONTAINER
      ------------------------------------------------------------- */}
      <main className="flex-1 py-6 sm:py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs Row (Matching Gumtree) */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to results</span>
              </Link>
              <span>/</span>
              <Link
                href={`/marketplace?category=${encodeURIComponent(product.category)}`}
                className="hover:text-emerald-600 transition"
              >
                {product.category}
              </Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-medium truncate max-w-xs">
                {product.title}
              </span>
            </div>
          </div>

          {/* TWO-COLUMN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* -----------------------------------------------------------
                LEFT COLUMN: CAROUSEL GALLERY + LISTING DETAILS TABLE
            ----------------------------------------------------------- */}
            <div className="lg:col-span-8 space-y-6">
              {/* IMAGE CAROUSEL (Gumtree Hero Style) */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-xs">
                <div className="relative aspect-[16/11] sm:aspect-[16/10] w-full rounded-xl bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-800 group shadow-xs">
                  {activeImage ? (
                    <Image
                      src={activeImage}
                      alt={product.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                      <Package className="h-16 w-16 stroke-[1.5] text-slate-300 dark:text-slate-600" />
                      <span className="mt-2 text-sm font-semibold text-slate-400 dark:text-slate-500">
                        No Photo Provided by Seller
                      </span>
                    </div>
                  )}

                  {/* Top Category Tag */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10 pointer-events-none">
                    <span className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-900/85 text-white backdrop-blur-xs">
                      {product.category}
                    </span>
                    <span className="px-3 py-1 rounded-md text-xs font-semibold bg-white/95 text-slate-900 shadow-xs">
                      {product.condition}
                    </span>
                  </div>

                  {/* Carousel Previous / Next Arrows */}
                  {productImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        aria-label="Previous photo"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer z-10"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextImage}
                        aria-label="Next photo"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer z-10"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Image Counter Badge: "1/7" */}
                  {productImages.length > 0 && (
                    <div className="absolute bottom-4 left-4 px-3 py-1 rounded-md bg-slate-950/80 backdrop-blur-xs text-white text-xs font-bold tracking-wider z-10">
                      {activeImageIndex + 1}/{productImages.length}
                    </div>
                  )}

                  {/* Fullscreen Expand Icon Button */}
                  {activeImage && (
                    <button
                      type="button"
                      onClick={() => setLightboxOpen(true)}
                      aria-label="View photo fullscreen"
                      className="absolute bottom-4 right-4 w-9 h-9 rounded-lg bg-slate-950/80 backdrop-blur-xs text-white hover:bg-slate-950 flex items-center justify-center shadow transition cursor-pointer z-10"
                      title="Fullscreen"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Dots Indicator */}
                  {productImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                      {productImages.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          aria-label={`Jump to photo ${idx + 1}`}
                          className={`h-1.5 rounded-full transition-all ${
                            idx === activeImageIndex
                              ? 'w-6 bg-white'
                              : 'w-1.5 bg-white/50 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Horizontal Thumbnail Strip Underneath */}
                {productImages.length > 1 && (
                  <div className="mt-3 flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                    {productImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative h-16 w-20 sm:h-18 sm:w-24 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          idx === activeImageIndex
                            ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                            : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.title} photo ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* LISTING DETAILS TABLE (Matching Gumtree Reference Screenshot) */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
                {/* Header with Title and Report Action */}
                <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Listing details
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSavedIds(toggleSavedProductId(product.id))}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                        isSaved
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                      <span>{isSaved ? 'Saved' : 'Save Item'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 text-xs font-semibold transition cursor-pointer"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>Report listing</span>
                    </button>
                  </div>
                </div>

                {/* 2-Column Key/Value Attribute Matrix */}
                <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between sm:justify-start sm:gap-6 py-1">
                    <span className="text-slate-500 dark:text-slate-400 w-36 shrink-0 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      Location
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {product.province} • {product.location}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start sm:gap-6 py-1">
                    <span className="text-slate-500 dark:text-slate-400 w-36 shrink-0 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Seller Type
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {product.sellerType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start sm:gap-6 py-1">
                    <span className="text-slate-500 dark:text-slate-400 w-36 shrink-0 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                      Commercial Sector
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {product.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start sm:gap-6 py-1">
                    <span className="text-slate-500 dark:text-slate-400 w-36 shrink-0 flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-600 shrink-0" />
                      Condition
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {product.condition}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start sm:gap-6 py-1">
                    <span className="text-slate-500 dark:text-slate-400 w-36 shrink-0 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                      Availability
                    </span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {product.stockNote}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start sm:gap-6 py-1">
                    <span className="text-slate-500 dark:text-slate-400 w-36 shrink-0 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      Pricing Unit
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {product.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start sm:gap-6 py-1">
                    <span className="text-slate-500 dark:text-slate-400 w-36 shrink-0 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                      Posted
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {product.postedAgo}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start sm:gap-6 py-1">
                    <span className="text-slate-500 dark:text-slate-400 w-36 shrink-0 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      Settlement
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      USD &amp; ZiG Accepted
                    </span>
                  </div>
                </div>

                {/* Seller's description */}
                <div className="pt-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Seller&apos;s description:
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>

                  {/* Highlights */}
                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                      Key Commercial Guarantees
                    </h4>
                    <ul className="space-y-2">
                      {(product.highlights || [
                        `Direct supply from verified entity ${product.sellerName}`,
                        `Official dual currency pricing (USD & ZiG at 1:${usdToZig})`,
                        'Depot pickup or inter-provincial carrier dispatch supported',
                      ]).map((hl, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dispatch Logistics Banner */}
                  <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <Truck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        Nationwide Dispatch &amp; Collection Terms
                      </div>
                      <p className="mt-0.5">
                        Goods available for direct inspection and collection in {product.province}. Nationwide courier or heavy freight dispatch can be coordinated directly with {product.sellerName}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* -----------------------------------------------------------
                RIGHT COLUMN: PRICE CARD + SELLER PROFILE CARD (STICKY)
            ----------------------------------------------------------- */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
              {/* CARD 1: PRICE & PRIMARY ACTION (Gumtree Style) */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                {/* Price and Share Icon */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      USD ${product.priceUsd.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      ≈ {zigPrice.toLocaleString()} ZiG (1 USD = {usdToZig} ZiG)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    aria-label="Share listing"
                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition cursor-pointer shrink-0"
                    title="Share listing"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Product Title */}
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white leading-snug">
                    {product.title}
                  </h1>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{product.province} &gt; {product.location}</span>
                  </div>
                </div>

                {/* Badges / Specs Pill Row */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    {product.condition}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    {product.unit}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                    {product.stockNote}
                  </span>
                </div>

                {/* Seller Attribution Line */}
                <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pt-1">
                  <span>by</span>
                  <Link
                    href={`/businesses/${product.sellerSlug}`}
                    className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 inline-flex items-center gap-1"
                  >
                    <span>{product.sellerName}</span>
                    {product.sellerVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                    )}
                  </Link>
                </div>

                {/* Big Primary Green Message Seller CTA */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm sm:text-base shadow-sm transition-all duration-200 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Message seller</span>
                </a>
              </div>

              {/* CARD 2: SELLER PROFILE CARD (Matching Gumtree BF Ben Ferreira Card) */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3.5">
                  {/* Avatar with initials & verified badge */}
                  <div className="relative h-13 w-13 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-base flex items-center justify-center shrink-0">
                    {product.sellerName.substring(0, 2).toUpperCase()}
                    {product.sellerVerified && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-4.5 w-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shadow">
                        ✓
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <Link
                      href={`/businesses/${product.sellerSlug}`}
                      className="font-bold text-base text-slate-900 dark:text-white hover:text-emerald-600 transition truncate block"
                    >
                      {product.sellerName}
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {product.sellerVerified ? 'Verified Enterprise Storefront' : 'Verified Business Merchant'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {/* View profile button - Styled Indigo / Blue like Gumtree */}
                  <Link
                    href={`/businesses/${product.sellerSlug}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold text-xs sm:text-sm shadow-xs transition"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>View profile</span>
                  </Link>

                  {/* Show phone number button */}
                  <button
                    type="button"
                    onClick={() => setShowPhoneNumber((prev) => !prev)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm transition cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>
                      {showPhoneNumber
                        ? product.sellerPhone || 'Phone available upon request'
                        : 'Show phone number'}
                    </span>
                  </button>

                  {/* Message Seller outline button */}
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-semibold text-xs sm:text-sm transition cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Message Seller</span>
                  </a>
                </div>
              </div>

              {/* CARD 3: COMMERCIAL TRADE ASSURANCE */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Commercial Trade Assurance</span>
                </div>
                <p className="leading-relaxed">
                  Always verify stock specifications and request a formal Proforma Tax Invoice before settling commercial or bulk orders. Payment in both USD &amp; ZiG is legally supported.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* -------------------------------------------------------------
          FULLSCREEN LIGHTBOX MODAL
      ------------------------------------------------------------- */}
      {lightboxOpen && activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery fullscreen lightbox"
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-8"
        >
          <div className="flex items-center justify-between text-white z-10">
            <span className="text-sm font-bold">
              {activeImageIndex + 1} / {productImages.length}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center min-h-0 py-4">
            {productImages.length > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                aria-label="Previous photo"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer z-20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div className="relative max-w-5xl max-h-full w-full h-full flex items-center justify-center">
              <img
                src={activeImage}
                alt={product.title}
                className="max-h-[82vh] max-w-full object-contain rounded-lg"
              />
            </div>

            {productImages.length > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                aria-label="Next photo"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer z-20"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {productImages.length > 1 && (
            <div className="flex justify-center gap-2 overflow-x-auto py-2 z-10">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`h-14 w-18 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                    idx === activeImageIndex
                      ? 'border-emerald-500 scale-105'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          REPORT LISTING MODAL
      ------------------------------------------------------------- */}
      {reportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Report listing"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-600" />
                <span>Report Listing</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setReportModalOpen(false);
                  setReportSubmitted(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Report Received
                </h4>
                <p className="text-xs text-slate-500">
                  Thank you for helping keep Sadza Connect safe and authentic. Our compliance team will review this SKU.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Please let us know why you believe this listing requires compliance review:
                </p>
                <select className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-200">
                  <option>Incorrect price or currency information</option>
                  <option>Out of stock or unavailable product</option>
                  <option>Suspected fraudulent or counterfeit item</option>
                  <option>Misleading product specifications or photos</option>
                  <option>Other commercial dispute</option>
                </select>
                <textarea
                  rows={3}
                  placeholder="Additional comments (optional)..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-200"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportSubmitted(true)}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
