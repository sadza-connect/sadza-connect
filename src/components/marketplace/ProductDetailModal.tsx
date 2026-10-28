'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Star,
  Heart,
  Share2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Play,
  Check,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sun,
  Grid,
  Maximize2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  BadgeCheck,
  Calendar,
  CloudRain,
  Sliders,
  Compass,
} from 'lucide-react';
import type { MarketplaceProduct } from '@/lib/data/zimbabwe';

interface ProductDetailModalProps {
  product: MarketplaceProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: MarketplaceProduct) => void;
  allProducts?: MarketplaceProduct[];
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onSelectProduct,
  allProducts = [],
}: ProductDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'reviews' | 'seller'>('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportReason, setReportReason] = useState('Inaccurate pricing or specs');
  const [imageError, setImageError] = useState(false);

  // Reset tab & active image when selected product changes
  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setActiveTab('overview');
      setImageError(false);
      // Check saved wishlist in localStorage
      try {
        const savedWishlist = JSON.parse(localStorage.getItem('sadza_wishlist') || '[]');
        setIsSaved(Array.isArray(savedWishlist) && savedWishlist.includes(product.id));
      } catch {
        setIsSaved(false);
      }
    }
  }, [product]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showReportDialog) {
          setShowReportDialog(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showReportDialog, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  // Normalize image gallery (up to 5 images)
  const images = (
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : []
  ).filter(Boolean).slice(0, 5);

  const totalImages = Math.min(Math.max(images.length, 1), 5);
  const activeImage = images[activeImageIndex] || product.image || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80';

  // Prices
  const usdPrice = typeof product.priceUsd === 'number' ? product.priceUsd : parseFloat(product.priceUsd || '0');
  const zigPrice = product.priceZig !== undefined
    ? product.priceZig
    : Math.round(usdPrice * 26.5);

  // Clean WhatsApp / Phone
  const rawPhone = product.sellerWhatsapp || product.sellerPhone || '+263 77 123 4567';
  const cleanPhone = rawPhone.replace(/[^\d+]/g, '');
  const digitsOnlyPhone = rawPhone.replace(/[^\d]/g, '');
  const sellerEmail = product.sellerSlug === 'green-energy-solutions'
    ? 'info@greenenergysolutions.co.zw'
    : `sales@${product.sellerSlug || 'sadzaconnect'}.co.zw`;

  const waLink = `https://wa.me/${digitsOnlyPhone}?text=Hi%20${encodeURIComponent(
    product.sellerName
  )},%20I%20am%20interested%20in%20your%20product%20"${encodeURIComponent(
    product.title
  )}"%20(US$%20${usdPrice.toFixed(2)})%20listed%20on%20Sadza%20Connect.`;

  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    (product.sellerAddress || product.location || 'Harare') + ', Zimbabwe'
  )}`;

  // Related products from allProducts or filtered by seller/category
  const relatedProducts = (
    allProducts.length > 0
      ? allProducts.filter((p) => p.id !== product.id && (p.sellerSlug === product.sellerSlug || p.category === product.category))
      : []
  ).slice(0, 4);

  // Toggle wishlist
  const handleToggleWishlist = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('sadza_wishlist') || '[]');
      let updated: string[];
      if (saved.includes(product.id)) {
        updated = saved.filter((id: string) => id !== product.id);
        setIsSaved(false);
      } else {
        updated = [...saved, product.id];
        setIsSaved(true);
      }
      localStorage.setItem('sadza_wishlist', JSON.stringify(updated));
    } catch {
      setIsSaved(!isSaved);
    }
  };

  // Share action
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/marketplace/${product.slug || product.id}` : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${product.title} - Sadza Connect`,
          text: `Check out ${product.title} by ${product.sellerName} on Sadza Connect Zimbabwe`,
          url,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Submit report
  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setShowReportDialog(false);
    }, 2000);
  };

  // Dynamic specs dictionary
  const specs = product.specs && product.specs.length >= 3
    ? product.specs
    : [
        { label: 'Power Output', value: '550 W', icon: 'zap' },
        { label: 'Cell Efficiency', value: '22.5%', icon: 'sun' },
        { label: 'Cell Type', value: 'Monocrystalline', icon: 'grid' },
        { label: 'Dimensions', value: '2278 x 1134 x 30 mm', icon: 'maximize' },
        { label: 'Weight', value: '28.5 kg', icon: 'scale' },
        { label: 'Warranty', value: '25 Years', icon: 'shield' },
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 lg:p-6 transition-all duration-300">
      {/* Background click to dismiss */}
      <div className="fixed inset-0 -z-10" onClick={onClose} aria-hidden="true" />

      {/* Modal Card Window */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="relative w-full max-w-[1360px] max-h-[94vh] flex flex-col bg-white dark:bg-slate-900 rounded-[26px] shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* ===================================================================
            MODAL HEADER: Breadcrumbs & Close Button
        =================================================================== */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shrink-0 z-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 overflow-x-auto no-scrollbar py-0.5">
            <Link
              href="/"
              onClick={onClose}
              className="inline-flex items-center hover:text-emerald-700 transition"
              title="Home"
            >
              <span className="text-sm">⌂</span>
            </Link>
            <span>&gt;</span>
            <Link
              href="/marketplace"
              onClick={onClose}
              className="hover:text-emerald-700 transition"
            >
              Marketplace
            </Link>
            <span>&gt;</span>
            <Link
              href={`/marketplace?category=${encodeURIComponent(product.category)}`}
              onClick={onClose}
              className="hover:text-emerald-700 transition"
            >
              {product.category}
            </Link>
            <span>&gt;</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px] sm:max-w-[320px]">
              {product.title}
            </span>
          </nav>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close product modal"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer ml-3 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===================================================================
            MODAL BODY (Scrollable Layout)
        =================================================================== */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-8">
          {/* Top Main Section: 12-Column Responsive Grid (8 cols Left Details, 4 cols Right Sidebar) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* ---------------------------------------------------------------
                LEFT REGION (8 COLS): GALLERY + PRODUCT HERO + TABS
            --------------------------------------------------------------- */}
            <div className="lg:col-span-8 space-y-6">
              {/* Product Hero: Two Sub-Columns (Gallery Left, Title/Specs Right) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 items-start">
                {/* GALLERY SUB-COLUMN (MD: 6 COLS) */}
                <div className="md:col-span-6 space-y-3">
                  {/* Main Large Image Container */}
                  <div className="relative aspect-[4/3] w-full rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xs group">
                    <Image
                      src={activeImage}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority
                      onError={() => setImageError(true)}
                    />

                    {/* Top-Left Featured Badge */}
                    {product.featured !== false && (
                      <div className="absolute top-3 left-3 z-10 pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#056636] text-white text-xs font-semibold shadow-xs">
                          <Star className="w-3.5 h-3.5 fill-white text-white" />
                          <span>Featured</span>
                        </span>
                      </div>
                    )}

                    {/* Top-Right Wishlist Heart Button */}
                    <button
                      type="button"
                      onClick={handleToggleWishlist}
                      aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                      className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isSaved ? 'fill-red-500 text-red-500' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      />
                    </button>

                    {/* Left & Right Circle Arrow Navigation */}
                    {totalImages > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1))}
                          aria-label="Previous photo"
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white text-slate-800 dark:text-white shadow-md flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1))}
                          aria-label="Next photo"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white text-slate-800 dark:text-white shadow-md flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Bottom-Right Photo Count (e.g. 1/5) */}
                    <div className="absolute bottom-3 right-3 z-10">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/65 backdrop-blur-xs text-white text-xs font-semibold shadow-xs">
                        <span>{activeImageIndex + 1}/{totalImages}</span>
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Thumbnail Strip (Up to 5 images) */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        aria-label={`View photo ${idx + 1}`}
                        className={`relative aspect-square w-14 sm:w-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                          idx === activeImageIndex
                            ? 'border-[#007a3d] ring-2 ring-[#007a3d]/25'
                            : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" />
                        {idx === 4 && (
                          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                            <span className="w-5 h-5 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-xs">
                              <Play className="w-2.5 h-2.5 fill-slate-900 ml-0.5" />
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PRODUCT OVERVIEW SUB-COLUMN (MD: 6 COLS) */}
                <div className="md:col-span-6 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-2.5">
                    {/* Top In Stock Pill Badge */}
                    <div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e8f5e9] text-[#056636] border border-[#c8e6c9] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>In Stock</span>
                      </span>
                    </div>

                    {/* Product Title */}
                    <h1 id="product-modal-title" className="text-xl sm:text-2xl font-extrabold text-[#0b1d33] dark:text-white leading-tight tracking-tight">
                      {product.title}
                    </h1>

                    {/* Description Paragraph */}
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {product.description ||
                        'High-efficiency 550W monocrystalline solar panel designed for residential and commercial solar systems. Offers excellent performance, durability and long-term energy savings.'}
                    </p>

                    {/* Price Block: US$ 180.00 / (ZiG 324.00) */}
                    <div className="pt-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-extrabold text-2xl sm:text-3xl text-[#007a3d] dark:text-emerald-400 tracking-tight">
                          US$ {usdPrice.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">
                        (ZiG {zigPrice.toFixed(2)})
                      </p>
                    </div>

                    {/* Rating Stars Row: 4.8 (24 reviews) */}
                    <div className="flex items-center gap-2 text-xs pt-0.5">
                      <div className="flex items-center text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">4.8</span>
                      <span className="text-slate-400">(24 reviews)</span>
                    </div>

                    {/* 3 Key Metric Badges in a Row */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-2 space-y-0.5">
                        <Zap className="w-4 h-4 text-[#007a3d] mx-auto stroke-[2]" />
                        <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">High Efficiency</p>
                        <p className="text-[9px] text-slate-500">(22.5%)</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-2 space-y-0.5">
                        <ShieldCheck className="w-4 h-4 text-[#007a3d] mx-auto stroke-[2]" />
                        <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">25 Year</p>
                        <p className="text-[9px] text-slate-500">Performance Warranty</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-2 space-y-0.5">
                        <CloudRain className="w-4 h-4 text-[#007a3d] mx-auto stroke-[2]" />
                        <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">Weather Resistant</p>
                        <p className="text-[9px] text-slate-500">(IP68)</p>
                      </div>
                    </div>

                    {/* Seller Mini Bar */}
                    <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-[11px] shrink-0 overflow-hidden border border-slate-200">
                        {product.sellerLogo ? (
                          <Image src={product.sellerLogo} alt={product.sellerName} width={32} height={32} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-emerald-400 font-extrabold">GE</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {product.sellerName}
                          </span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#007a3d] shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{product.sellerCity || product.location || 'Harare, Zimbabwe'}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Primary Contact CTA (Add to cart excluded per directive: platform is for adverts) */}
                  <div className="pt-2 space-y-2">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-[#007a3d] hover:bg-[#006331] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <MessageCircle className="w-4 h-4 fill-white text-[#007a3d]" />
                      <span>Contact Seller</span>
                    </a>

                    {/* Secondary Action Row: Share, Save, Report */}
                    <div className="flex items-center justify-around text-xs text-slate-600 dark:text-slate-400 pt-1">
                      <button
                        type="button"
                        onClick={handleShare}
                        className="inline-flex items-center gap-1.5 hover:text-[#007a3d] transition cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={handleToggleWishlist}
                        className="inline-flex items-center gap-1.5 hover:text-red-500 transition cursor-pointer"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={() => setShowReportDialog(true)}
                        className="inline-flex items-center gap-1.5 hover:text-amber-600 transition cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Report</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* =============================================================
                  TABS SECTION: Overview | Specifications | Reviews (24) | Seller Details
              ============================================================= */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                {/* Tab Navigation Buttons */}
                <div className="flex items-center gap-6 sm:gap-8 border-b border-slate-200 dark:border-slate-800 pb-0.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'specifications', label: 'Specifications' },
                    { id: 'reviews', label: 'Reviews (24)' },
                    { id: 'seller', label: 'Seller Details' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                        activeTab === tab.id
                          ? 'text-[#007a3d] dark:text-emerald-400'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007a3d] rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Product Description & Bullet Points */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-extrabold text-[#0b1d33] dark:text-white">
                        Product Description
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        The 550W Monocrystalline Solar Panel is built with advanced solar cell technology
                        to deliver maximum energy output, even in low light conditions. It is ideal for both
                        residential and commercial solar installations, providing reliable and efficient clean
                        energy for a sustainable future.
                      </p>
                      <ul className="space-y-2 pt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        {[
                          'High conversion efficiency (up to 22.5%)',
                          'Durable aluminium frame',
                          'Tempered low-iron glass',
                          'Excellent performance in low light',
                          '25 years performance warranty',
                        ].map((bullet, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#e8f5e9] text-[#007a3d] shrink-0">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right: Key Features 6-Item Grid */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-extrabold text-[#0b1d33] dark:text-white">
                        Key Features
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3">
                          <Zap className="w-5 h-5 text-[#007a3d] shrink-0 stroke-[2]" />
                          <div>
                            <p className="text-[11px] text-slate-500">Power Output</p>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">550 W</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3">
                          <Sun className="w-5 h-5 text-[#007a3d] shrink-0 stroke-[2]" />
                          <div>
                            <p className="text-[11px] text-slate-500">Cell Efficiency</p>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">22.5%</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3">
                          <Grid className="w-5 h-5 text-[#007a3d] shrink-0 stroke-[2]" />
                          <div>
                            <p className="text-[11px] text-slate-500">Cell Type</p>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">Monocrystalline</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3">
                          <Maximize2 className="w-5 h-5 text-[#007a3d] shrink-0 stroke-[2]" />
                          <div>
                            <p className="text-[11px] text-slate-500">Dimensions</p>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">2278 x 1134 x 30 mm</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3">
                          <Sliders className="w-5 h-5 text-[#007a3d] shrink-0 stroke-[2]" />
                          <div>
                            <p className="text-[11px] text-slate-500">Weight</p>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">28.5 kg</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3">
                          <ShieldCheck className="w-5 h-5 text-[#007a3d] shrink-0 stroke-[2]" />
                          <div>
                            <p className="text-[11px] text-slate-500">Warranty</p>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">25 Years</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SPECIFICATIONS */}
                {activeTab === 'specifications' && (
                  <div className="py-5 space-y-4">
                    <h3 className="text-sm font-extrabold text-[#0b1d33] dark:text-white">
                      Technical &amp; Engineering Specifications
                    </h3>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          <tr className="bg-slate-50/60 dark:bg-slate-800/40 font-bold">
                            <td colSpan={2} className="px-4 py-2 text-emerald-800 dark:text-emerald-400">Electrical Performance (STC: 1000W/m², 25°C)</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-slate-500 w-1/2">Maximum Power (Pmax)</td>
                            <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">550 Watts</td>
                          </tr>
                          <tr className="bg-slate-50/30 dark:bg-slate-800/20">
                            <td className="px-4 py-2.5 font-medium text-slate-500">Voltage at Maximum Power (Vmp)</td>
                            <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">41.95 Volts</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-slate-500">Current at Maximum Power (Imp)</td>
                            <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">13.12 Amperes</td>
                          </tr>
                          <tr className="bg-slate-50/30 dark:bg-slate-800/20">
                            <td className="px-4 py-2.5 font-medium text-slate-500">Open Circuit Voltage (Voc)</td>
                            <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">49.80 Volts</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-slate-500">Short Circuit Current (Isc)</td>
                            <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">13.98 Amperes</td>
                          </tr>
                          <tr className="bg-slate-50/60 dark:bg-slate-800/40 font-bold">
                            <td colSpan={2} className="px-4 py-2 text-emerald-800 dark:text-emerald-400">Mechanical &amp; Environmental Data</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-slate-500">Front Glass</td>
                            <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">3.2mm High Transmission Low-Iron Tempered Glass</td>
                          </tr>
                          <tr className="bg-slate-50/30 dark:bg-slate-800/20">
                            <td className="px-4 py-2.5 font-medium text-slate-500">Frame</td>
                            <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">Anodized Aluminium Alloy (Black/Silver)</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-slate-500">Junction Box</td>
                            <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">IP68 Rated (3 bypass diodes)</td>
                          </tr>
                          <tr className="bg-slate-50/30 dark:bg-slate-800/20">
                            <td className="px-4 py-2.5 font-medium text-slate-500">Certifications</td>
                            <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">ZWS / IEC 61215 / IEC 61730 / ISO 9001</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: REVIEWS (24) */}
                {activeTab === 'reviews' && (
                  <div className="py-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">4.8</span>
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Based on 24 verified commercial &amp; domestic buyers</p>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        100% Verified Purchases
                      </span>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          name: 'Tendai M.',
                          location: 'Borrowdale, Harare',
                          rating: 5,
                          date: '12 October 2026',
                          comment: 'Installed 8 of these panels with our Deye 5kVA inverter. Delivering full 4.2kW on sunny afternoons even during winter. Green Energy Solutions dispatched and mounted them within 48 hours.',
                        },
                        {
                          name: 'Farai C.',
                          location: 'Bulawayo',
                          rating: 5,
                          date: '28 September 2026',
                          comment: 'Excellent build quality with sturdy aluminium frame. Very satisfied with their dual currency pricing — paid part USD cash and part EcoCash ZiG.',
                        },
                        {
                          name: 'Blessing N.',
                          location: 'Chinhoyi Commercial Farm',
                          rating: 4,
                          date: '15 September 2026',
                          comment: 'Powers our borehole submersible pump without issue. High conversion efficiency verified even on overcast days.',
                        },
                      ].map((rev, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900 dark:text-white">{rev.name} ({rev.location})</span>
                            <span className="text-slate-400">{rev.date}</span>
                          </div>
                          <div className="flex text-amber-400">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: SELLER DETAILS */}
                {activeTab === 'seller' && (
                  <div className="py-5 space-y-4">
                    <h3 className="text-sm font-extrabold text-[#0b1d33] dark:text-white">
                      Verified Commercial Supplier Credentials
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <p className="text-slate-400 font-medium">Business Name</p>
                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">{product.sellerName} (Pvt Ltd)</p>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <p className="text-slate-400 font-medium">Company Registration</p>
                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">CR14 Verified • Registered Entity</p>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <p className="text-slate-400 font-medium">Head Office Location</p>
                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">{product.sellerAddress || product.location || 'Harare, Zimbabwe'}</p>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <p className="text-slate-400 font-medium">Operating Hours</p>
                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">Mon - Fri: 08:00 - 17:00 | Sat: 08:30 - 13:00</p>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 sm:col-span-2">
                        <p className="text-slate-400 font-medium">Accepted Settlement Currencies &amp; Payment Methods</p>
                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                          USD Cash, EcoCash USD &amp; ZiG, Nostro FCA, Zipit / RTGS Transfer, Bank Waybill COD.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ---------------------------------------------------------------
                RIGHT REGION (4 COLS): SELLER CARDS & MAP LOCATION
            --------------------------------------------------------------- */}
            <div className="lg:col-span-4 space-y-4">
              {/* CARD 1: SELLER INFORMATION */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3.5">
                <h3 className="text-sm font-extrabold text-[#0b1d33] dark:text-white">
                  Seller Information
                </h3>

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden border border-slate-200">
                    {product.sellerLogo ? (
                      <Image src={product.sellerLogo} alt={product.sellerName} width={44} height={44} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-emerald-400 font-extrabold">GE</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {product.sellerName}
                      </h4>
                      <CheckCircle2 className="w-4 h-4 text-[#007a3d] shrink-0" />
                    </div>
                    <p className="text-xs text-[#007a3d] font-semibold">Verified Business</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <Zap className="w-3.5 h-3.5 text-[#007a3d]" />
                  <span>{product.sellerSlug === 'green-energy-solutions' ? 'Solar & Electrical Supplies' : (product.category || 'Commercial Supplier')}</span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {product.sellerSlug === 'green-energy-solutions'
                    ? 'We supply high-quality solar panels, inverters, batteries and complete solar solutions for homes and businesses across Zimbabwe.'
                    : `Verified commercial supplier offering quality ${product.category.toLowerCase()} products and dependable service across Zimbabwe.`}
                </p>

                {/* 3 Stats Columns: 12 Products | 4.8 Rating | 2+ Years */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center">
                  <div>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">12</p>
                    <p className="text-[10px] text-slate-400">Products</p>
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">4.8</p>
                    <p className="text-[10px] text-slate-400">Rating</p>
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">2+</p>
                    <p className="text-[10px] text-slate-400">Years</p>
                  </div>
                </div>

                <Link
                  href={`/businesses/${product.sellerSlug}`}
                  onClick={onClose}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Business Profile</span>
                </Link>
              </div>

              {/* CARD 2: CONTACT SELLER */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3.5">
                <h3 className="text-sm font-extrabold text-[#0b1d33] dark:text-white">
                  Contact Seller
                </h3>

                <div className="space-y-3">
                  {/* WhatsApp */}
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <MessageCircle className="w-5 h-5 fill-[#25D366]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#007a3d]">
                        Chat on WhatsApp
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {product.sellerWhatsapp || '+263 77 123 4567'}
                      </p>
                    </div>
                  </a>

                  {/* Phone */}
                  <a
                    href={`tel:${cleanPhone}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Call Seller
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {product.sellerPhone || '+263 77 123 4567'}
                      </p>
                    </div>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:${sellerEmail}?subject=${encodeURIComponent('Inquiry: ' + product.title)}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Send Email
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {sellerEmail}
                      </p>
                    </div>
                  </a>
                </div>
              </div>

              {/* CARD 3: LOCATION & MAP */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-extrabold text-[#0b1d33] dark:text-white">
                  Location
                </h3>

                {/* Stylized Harare Map Container */}
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <iframe
                    title="Seller Location Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d121544.75549021021!2d30.957582570415303!3d-17.824858277252278!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1931a4e706b17161%3A0xa1c0385fc5cde2e1!2sHarare%2C%20Zimbabwe!5e0!3m2!1sen!2szw!4v1700000000000!5m2!1sen!2szw"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'contrast(1.05) saturate(1.1)' }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  {/* Pin overlay */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-lg ring-4 ring-white animate-bounce">
                      <MapPin className="w-4 h-4 fill-white" />
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-[#007a3d]" />
                  <span className="font-semibold">{product.sellerAddress || product.location || 'Harare, Zimbabwe'}</span>
                </div>

                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-[#007a3d]" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          </div>

          {/* ===================================================================
              BOTTOM REGION: RELATED PRODUCTS (Exact 4 Cards as in Screenshot)
          =================================================================== */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-[#0b1d33] dark:text-white">
                Related Products
              </h3>
              <Link
                href={`/marketplace?category=${encodeURIComponent(product.category)}`}
                onClick={onClose}
                className="text-xs font-bold text-[#007a3d] hover:text-[#005a2d] transition inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4 Related Product Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relProd) => {
                const relUsd = typeof relProd.priceUsd === 'number' ? relProd.priceUsd : parseFloat(relProd.priceUsd || '0');
                return (
                  <div
                    key={relProd.id}
                    onClick={() => {
                      if (onSelectProduct) {
                        onSelectProduct(relProd);
                      }
                    }}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                  >
                    <div>
                      {/* Thumbnail container */}
                      <div className="relative aspect-[4/3] w-full rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2.5">
                        <Image
                          src={relProd.image}
                          alt={relProd.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {relProd.featured && (
                          <div className="absolute top-2 left-2 z-10 pointer-events-none">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#056636] text-white text-[10px] font-bold shadow-xs">
                              <Star className="w-2.5 h-2.5 fill-white text-white" />
                              <span>Featured</span>
                            </span>
                          </div>
                        )}

                        <div className="absolute top-2 right-2 z-10">
                          <span className="w-7 h-7 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-xs flex items-center justify-center text-slate-600 dark:text-slate-300">
                            <Heart className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>

                      {/* Title & Price */}
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#007a3d] transition-colors">
                        {relProd.title}
                      </h4>
                      <p className="text-xs sm:text-sm font-extrabold text-[#007a3d] mt-1">
                        US$ {relUsd.toFixed(2)}
                      </p>
                    </div>

                    {/* Seller Bar */}
                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                        {relProd.sellerName}
                      </span>
                      <span>{relProd.province || 'Harare'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===================================================================
            REPORT PRODUCT SUB-MODAL
        =================================================================== */}
        {showReportDialog && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span>Report Listing</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowReportDialog(false)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {reportSuccess ? (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <p className="font-bold text-sm text-slate-900 dark:text-white">Report Submitted</p>
                  <p className="text-xs text-slate-500">Thank you for keeping Sadza Connect safe. Our compliance desk will review this advert.</p>
                </div>
              ) : (
                <form onSubmit={handleSendReport} className="space-y-3.5">
                  <p className="text-xs text-slate-500">
                    Flagging product: <span className="font-bold text-slate-800 dark:text-slate-200">{product.title}</span>
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Reason for Report
                    </label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                    >
                      <option value="Inaccurate pricing or specs">Inaccurate pricing or specs</option>
                      <option value="Counterfeit or unverified product">Counterfeit or unverified product</option>
                      <option value="Seller unresponsive or incorrect contact">Seller unresponsive or incorrect contact</option>
                      <option value="Spam / duplicate product">Spam / duplicate product</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReportDialog(false)}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
