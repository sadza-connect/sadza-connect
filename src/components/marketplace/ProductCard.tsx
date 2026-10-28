'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  Heart,
  ImageIcon,
  Zap,
  ShieldCheck,
  Sun,
  MapPin,
  ShoppingCart,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { MarketplaceProduct } from '@/lib/data/zimbabwe';

interface ProductCardProps {
  product: MarketplaceProduct;
  onViewProduct?: (product: MarketplaceProduct) => void;
  isSaved?: boolean;
  onToggleSave?: (productId: string) => void;
  isSelected?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  onViewProduct,
  isSaved = false,
  onToggleSave,
  isSelected = false,
  className = '',
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Normalize image gallery (each product accepts up to 5 images)
  const images = (
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : []
  ).filter(Boolean).slice(0, 5);

  const totalImages = Math.min(Math.max(images.length, 1), 5);
  const primaryImage =
    imageError || images.length === 0
      ? 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80'
      : images[activeImageIndex] || images[0];

  // Prices
  const usdPrice = typeof product.priceUsd === 'number' ? product.priceUsd : parseFloat(product.priceUsd || '0');
  const zigPrice = product.priceZig !== undefined
    ? product.priceZig
    : Math.round(usdPrice * 26.5);

  // Clean WhatsApp number
  const rawPhone = product.sellerWhatsapp || product.sellerPhone || '263772123456';
  const cleanPhone = rawPhone.replace(/[^\d]/g, '');
  const waLink = `https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(
    product.sellerName
  )},%20I%20am%20interested%20in%20your%20product%20"${encodeURIComponent(
    product.title
  )}"%20(US$%20${usdPrice.toFixed(2)})%20on%20Sadza%20Connect.`;

  // Dynamic Specs (defaults to 3 key specs as seen in the Figma design)
  const specs = product.specs && product.specs.length >= 3
    ? product.specs.slice(0, 3)
    : [
        { label: 'Power Output', value: '550W', icon: 'zap' },
        { label: 'Warranty', value: '25 Years', icon: 'shield' },
        { label: 'Efficiency', value: '22.5%', icon: 'sun' },
      ];

  const renderSpecIcon = (iconName?: string) => {
    switch (iconName) {
      case 'shield':
        return <ShieldCheck className="w-5 h-5 text-slate-800 dark:text-slate-200 stroke-[1.6] shrink-0" />;
      case 'sun':
        return <Sun className="w-5 h-5 text-slate-800 dark:text-slate-200 stroke-[1.6] shrink-0" />;
      case 'zap':
      default:
        return <Zap className="w-5 h-5 text-slate-800 dark:text-slate-200 stroke-[1.6] shrink-0" />;
    }
  };

  return (
    <article
      onClick={() => onViewProduct?.(product)}
      className={`group relative flex flex-col justify-between rounded-[22px] border bg-white dark:bg-slate-900 transition-all duration-300 overflow-hidden cursor-pointer ${
        isSelected
          ? 'border-[#056636] ring-2 ring-[#056636]/20 shadow-lg'
          : 'border-slate-100 dark:border-slate-800 shadow-[0_2px_14px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.09)] hover:border-slate-200'
      } ${className}`}
    >
      <div>
        {/* =============================================================
            IMAGE CONTAINER (With Featured Badge, Heart Button, & 1/5 Pill)
        ============================================================= */}
        <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            onError={() => setImageError(true)}
          />

          {/* Top-Left Featured Badge */}
          {product.featured !== false && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#056636] text-white text-xs font-semibold shadow-xs">
                <Star className="w-3.5 h-3.5 fill-white text-white" />
                <span>Featured</span>
              </span>
            </div>
          )}

          {/* Top-Right Heart / Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave?.(product.id);
            }}
            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isSaved ? 'fill-red-500 text-red-500' : 'text-slate-700 dark:text-slate-300'
              }`}
            />
          </button>

          {/* Multi-Image Navigation Arrows (up to 5 images) */}
          {totalImages > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImageError(false);
                  setActiveImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
                }}
                aria-label="Previous image"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImageError(false);
                  setActiveImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
                }}
                aria-label="Next image"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Bottom-Right Photo Count (e.g. 1/5) */}
          <div className="absolute bottom-3 right-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-xs text-white text-xs font-medium shadow-xs">
              <ImageIcon className="w-3.5 h-3.5 text-white" />
              <span>{activeImageIndex + 1}/{totalImages}</span>
            </span>
          </div>

          {/* Subtle dots indicator when hovering card with multiple images */}
          {totalImages > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {Array.from({ length: totalImages }).map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={`h-1.5 rounded-full transition-all ${
                    dotIdx === activeImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* =============================================================
            PRODUCT DETAILS BODY
        ============================================================= */}
        <div className="p-5 sm:p-6 space-y-3.5">
          {/* Title */}
          <h3 className="font-bold text-lg sm:text-xl text-[#0b1d33] dark:text-white leading-snug tracking-tight line-clamp-1 group-hover:text-[#056636] transition-colors">
            {product.title}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {product.description ||
              'High-efficiency commercial and residential equipment designed for maximum durability and performance across Zimbabwe.'}
          </p>

          {/* Pricing Row: US$ 180.00 (ZiG 324.00) */}
          <div className="flex items-center gap-2.5 pt-0.5">
            <span className="font-extrabold text-2xl sm:text-[26px] text-[#056636] tracking-tight">
              US$ {usdPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eaf5ee] dark:bg-emerald-950/50 text-[#056636] dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
              (ZiG {zigPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
            </span>
          </div>

          {/* Key Specifications (3 Columns) */}
          <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100 dark:border-slate-800/80">
            {specs.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2 min-w-0">
                {renderSpecIcon(s.icon)}
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {s.value}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Seller Attribution & Location Bar */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
            {/* Left: Logo & Business Name */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-10 h-10 rounded-full bg-slate-950 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200 shadow-xs">
                {product.sellerLogo ? (
                  <Image
                    src={product.sellerLogo}
                    alt={product.sellerName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-xs">
                    {product.sellerName.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <Link
                  href={`/businesses/${product.sellerSlug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-[#056636] transition-colors flex items-center gap-1.5 truncate"
                >
                  <span className="truncate">{product.sellerName}</span>
                  {product.sellerVerified !== false && (
                    <CheckCircle2 className="w-4 h-4 text-[#056636] fill-[#056636] text-white shrink-0" />
                  )}
                </Link>
                <div className="text-[11px] text-slate-400 font-normal truncate">
                  Verified Business
                </div>
              </div>
            </div>

            {/* Right: Location with divider */}
            <div className="border-l border-slate-200 dark:border-slate-700 pl-3 shrink-0 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {product.sellerCity
                  ? `${product.sellerCity}, Zimbabwe`
                  : product.location || `${product.province || 'Harare'}, Zimbabwe`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =============================================================
          ACTION BUTTONS FOOTER
          Left: Contact Seller (WhatsApp) | Right: View Product
      ============================================================= */}
      <div className="p-5 sm:p-6 pt-0">
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Button 1: Contact Seller */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-[#056636] bg-transparent hover:bg-[#eaf5ee] dark:hover:bg-emerald-950/40 text-[#056636] dark:text-emerald-400 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            {/* Custom WhatsApp Speech-Handset Icon */}
            <svg
              className="w-4 h-4 shrink-0 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.63c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06s-1.05-.39-2-1.23c-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29" />
            </svg>
            <span>Contact Seller</span>
          </a>

          {/* Button 2: View Product */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewProduct?.(product);
            }}
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#056636] hover:bg-[#04522b] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-white shrink-0" />
            <span>View Product</span>
          </button>
        </div>
      </div>
    </article>
  );
}
