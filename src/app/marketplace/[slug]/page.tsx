'use client';

import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { SAMPLE_PRODUCTS, MarketplaceProduct } from '@/lib/data/zimbabwe';
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

  useEffect(() => {
    setUsdToZig(getPlatformSettings().usdToZigRate);
    setSavedIds(getSavedProductIds());

    if (slug) {
      fetch(`/api/v1/products/${encodeURIComponent(slug)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data?.product) {
            setLiveProduct(mapDbProductToMarketplaceProduct(json.data.product));
          }
        })
        .catch(() => {});
    }
  }, [slug]);

  const product = liveProduct;

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 sm:py-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-5">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Col: Product Image & Full Specs */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <div className="relative h-64 sm:h-96 w-full bg-slate-100 dark:bg-slate-800">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                    <Package className="h-16 w-16 stroke-[1.5] text-slate-300 dark:text-slate-600" />
                    <span className="mt-2 text-sm font-semibold text-slate-400 dark:text-slate-500">
                      No Photo Provided by Seller
                    </span>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-900/85 text-white">
                    {product.category}
                  </span>
                  <span className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white">
                    {product.movementBadge}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-1">
                      {product.condition} • {product.province} • {product.postedAgo}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {product.title}
                    </h1>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSavedIds(toggleSavedProductId(product.id))}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                      isSaved
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? 'Saved' : 'Save Item'}</span>
                  </button>
                </div>

                {/* Price Banner */}
                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Direct Supplier Price ({product.unit})
                  </div>
                  <div className="flex flex-wrap items-baseline gap-3 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                      USD ${product.priceUsd.toLocaleString()}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-400">
                      ({zigPrice.toLocaleString()} ZiG at 1 USD = {usdToZig} ZiG)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Stock Status: <strong className="text-slate-800 dark:text-slate-200">{product.stockNote}</strong>
                  </p>
                </div>

                {/* Product Description & Highlights */}
                <div className="space-y-3 pt-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Product Description & Specifications
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {product.description}
                  </p>
                  <ul className="space-y-2 pt-2 text-sm text-slate-700 dark:text-slate-300">
                    {(product.highlights || [
                      'Verified Zimbabwean commercial supplier',
                      'Direct inspection permitted at depot or showroom',
                    ]).map((hl, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <Truck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      Collection & Nationwide Dispatch
                    </div>
                    <div>
                      Available in {product.province} ({product.location}). Inter-city courier or freight dispatch can be arranged directly with {product.sellerName}.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Supplier Info & Direct WhatsApp Order */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-xs">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Listed By Verified Supplier
                </div>

                <div>
                  <Link
                    href={`/businesses/${product.sellerSlug}`}
                    className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white hover:text-emerald-600"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{product.sellerName}</span>
                  </Link>
                  <div className="text-xs text-slate-500 mt-1">
                    {product.sellerType} • {product.sellerPlan}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{product.province}</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Order via WhatsApp</span>
                  </a>

                  <Link
                    href={`/businesses/${product.sellerSlug}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Visit Supplier Storefront</span>
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Commercial Trade Assurance</span>
                </div>
                <p className="leading-relaxed">
                  Verify stock specifications and request a formal tax invoice directly from the supplier before settling high-value commercial orders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
