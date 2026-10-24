'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import {
  Megaphone,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Clock,
  Tag,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  Sparkles,
  CreditCard,
  AlertCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import {
  PaidAdvertItem,
  DEFAULT_PAID_ADVERTS,
} from '@/data/advertsStore';
import { mapDbAdvertToPaidAdvert } from '@/lib/data/advert-mapper';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/Button';

export default function AdvertDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || '';
  const { toast } = useToast();

  const [adverts, setAdverts] = useState<PaidAdvertItem[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchAdvertData() {
      // Fetch specific advert from database
      try {
        const res = await fetch(`/api/v1/adverts/${encodeURIComponent(id)}`);
        const json = await res.json();
        if (isMounted && json.success && json.data?.advert) {
          const mapped = mapDbAdvertToPaidAdvert(json.data.advert);
          setAdverts((prev) => {
            const exists = prev.some((a) => a.id === mapped.id);
            return exists ? prev.map((a) => (a.id === mapped.id ? mapped : a)) : [mapped, ...prev];
          });
        }
      } catch {}

      // 3. Fetch all active adverts for related section
      try {
        const listRes = await fetch('/api/v1/adverts?limit=50');
        const listJson = await listRes.json();
        if (isMounted && listJson.success && Array.isArray(listJson.data?.adverts)) {
          const listMapped = listJson.data.adverts.map(mapDbAdvertToPaidAdvert);
          setAdverts((prev) => {
            const combined = [...prev];
            for (const item of listMapped) {
              if (!combined.some((a) => a.id === item.id)) {
                combined.push(item);
              }
            }
            return combined;
          });
        }
      } catch {}
    }

    if (id) {
      fetchAdvertData();
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  const advert = useMemo(() => {
    return adverts.find((a) => a.id === id);
  }, [adverts, id]);

  const relatedAdverts = useMemo(() => {
    if (!advert) return [];
    return adverts
      .filter((a) => a.id !== advert.id && (a.category === advert.category || a.province === advert.province))
      .slice(0, 3);
  }, [adverts, advert]);

  const fallbackRelated = useMemo(() => {
    if (relatedAdverts.length > 0) return relatedAdverts;
    return adverts.filter((a) => a.id !== id).slice(0, 3);
  }, [adverts, relatedAdverts, id]);

  if (!advert) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Promotion Not Found</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The promotional campaign you are looking for may have expired or been updated by the sponsor.
            </p>
            <div className="pt-2">
              <Link
                href="/adverts"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e57eb] text-white font-medium hover:bg-blue-700 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Browse Active Deals
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleCopyShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast({ title: 'Promotion link copied to clipboard', variant: 'info' });
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const cleanWaNumber = (phone: string) => phone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanWaNumber(advert.whatsapp)}?text=${encodeURIComponent(
    `Hello ${advert.businessName}, I saw your sponsored offer "${advert.headline}" on Sadza Connect and would like more details.`
  )}`;

  const savingsUSD =
    advert.originalPriceUSD && advert.promoPriceUSD
      ? advert.originalPriceUSD - advert.promoPriceUSD
      : 0;

  const savingsPercent =
    advert.originalPriceUSD && savingsUSD > 0
      ? Math.round((savingsUSD / advert.originalPriceUSD) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between pb-20 sm:pb-0">
      <Navbar />

      <main className="flex-1 py-6 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/adverts" className="hover:text-slate-900 dark:hover:text-white transition">
              Sponsored Deals
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px] sm:max-w-xs">
              {advert.headline}
            </span>
          </nav>

          {/* Top Headline & Quick Badges Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                {advert.offerType}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {advert.province}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                {advert.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {advert.validUntil}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied' : 'Share Deal'}</span>
              </button>
            </div>
          </div>

          {/* Main Grid: Left Column Details & Right Column Sponsor Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Product / Offer Hero Image Card */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-sm aspect-video sm:aspect-[21/9] flex items-center justify-center">
                {advert.image ? (
                  <>
                    <Image
                      src={advert.image}
                      alt={advert.headline}
                      fill
                      priority
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <Megaphone className="h-16 w-16 text-amber-400/80 mb-2" />
                    <span className="text-sm font-semibold text-slate-300">{advert.businessName}</span>
                  </div>
                )}

                {/* Floating Promo Badge Ribbon */}
                {advert.promoBadge && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs sm:text-sm font-bold tracking-wide uppercase shadow-lg flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      {advert.promoBadge}
                    </span>
                  </div>
                )}

                {/* Headline Overlay inside image */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
                    {advert.businessName}
                  </p>
                  <h1 className="text-lg sm:text-2xl font-bold leading-snug drop-shadow-sm">
                    {advert.headline}
                  </h1>
                </div>
              </div>

              {/* Dual-Currency Commercial Pricing Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Promotional Rate
                    </span>
                    <div className="flex items-baseline gap-3 mt-1">
                      {advert.promoPriceUSD ? (
                        <>
                          <span className="text-3xl sm:text-4xl font-extrabold text-[#1e57eb] dark:text-blue-400">
                            ${advert.promoPriceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-slate-500">
                            USD
                          </span>
                          {advert.originalPriceUSD && (
                            <span className="text-base sm:text-lg line-through text-slate-400 dark:text-slate-500">
                              ${advert.originalPriceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                          Quote on Request
                        </span>
                      )}
                    </div>
                  </div>

                  {advert.priceZiG && (
                    <div className="sm:text-right bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                        Equivalent in Zimbabwe Gold
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">
                        ZiG {advert.priceZiG.toLocaleString('en-US')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Savings Callout */}
                {savingsUSD > 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      Instant Deal Saving: <strong>${savingsUSD.toFixed(2)} USD</strong> ({savingsPercent}% discount off standard tariff).
                    </span>
                  </div>
                )}

                {/* Payment Methods Accepted */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Accepted Settlement:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">EcoCash USD / ZiG</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">InnBucks</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">Bank Transfer / RTGS</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">USD Cash on Collection</span>
                </div>
              </div>

              {/* Offer Description & Package Inclusions */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3">
                    Offer Details & Commercial Specifications
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                    {advert.offerText}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    What is Included with this Promotion:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Official Zimbabwe VAT Tax Invoice Provided</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Direct Merchant Warranty & Guarantee</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Priority Dispatch & Warehouse Collection</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Inspected by Sadza Connect Verified Vendor System</span>
                    </div>
                  </div>
                </div>

                {/* Redemption Instructions */}
                <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40 text-xs sm:text-sm space-y-1.5 text-blue-900 dark:text-blue-200">
                  <p className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1e57eb] dark:text-blue-400" />
                    How to Claim this Promotion:
                  </p>
                  <p className="text-blue-800 dark:text-blue-300">
                    Contact the merchant directly via WhatsApp or Phone below. Quote advert reference code{' '}
                    <span className="font-mono font-bold bg-white dark:bg-blue-900/80 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-700">
                      SC-PROMO-{advert.id.toUpperCase()}
                    </span>{' '}
                    to receive the exact listed promotional rate before the validity window closes.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Verified Merchant Card (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#1e57eb] dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {advert.businessName}
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-[#1e57eb] dark:text-blue-400 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {advert.businessType}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> Province:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">{advert.province}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-400" /> Sector:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">{advert.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Published:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">{advert.postedAt}</span>
                  </div>
                </div>

                {/* Primary Contact CTAs */}
                <div className="space-y-2.5 pt-2">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 shadow-sm transition active:scale-[0.99]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Enquire on WhatsApp
                  </a>

                  <a
                    href={`tel:${advert.phone}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700/60 transition"
                  >
                    <Phone className="w-4 h-4 text-slate-500" />
                    Call {advert.phone}
                  </a>

                  <Link
                    href={`/companies?query=${encodeURIComponent(advert.businessName)}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-[#1e57eb] dark:text-blue-400 font-medium hover:underline pt-1"
                  >
                    <span>View Registered Profile in Business Directory</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {/* Safety & Compliance Badge */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Commercial Sponsor
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    This advertiser has submitted business verification documents. Always verify items upon collection or handover.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Sponsored Deals Section */}
          {fallbackRelated.length > 0 && (
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    More Sponsored Deals You May Like
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Hand-picked promotions across Zimbabwe
                  </p>
                </div>
                <Link
                  href="/adverts"
                  className="text-xs sm:text-sm font-semibold text-[#1e57eb] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {fallbackRelated.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/adverts/${rel.id}`}
                    className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                        <Image
                          src={rel.image}
                          alt={rel.headline}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-300"
                        />
                        {rel.promoBadge && (
                          <div className="absolute top-2.5 left-2.5">
                            <span className="px-2.5 py-1 rounded bg-rose-600 text-white text-[11px] font-bold uppercase shadow">
                              {rel.promoBadge}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[140px]">
                            {rel.businessName}
                          </span>
                          <span>{rel.province}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#1e57eb] transition">
                          {rel.headline}
                        </h3>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        {rel.promoPriceUSD ? (
                          <span className="font-bold text-[#1e57eb] dark:text-blue-400 text-base">
                            ${rel.promoPriceUSD.toLocaleString()} USD
                          </span>
                        ) : (
                          <span className="font-medium text-slate-700 dark:text-slate-300">Quote</span>
                        )}
                      </div>
                      <span className="text-slate-500 font-medium group-hover:translate-x-1 transition flex items-center gap-0.5">
                        Details <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex items-center justify-between gap-3 shadow-lg">
        <div className="min-w-0">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider truncate">
            Promo Price
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-[#1e57eb] dark:text-blue-400">
              {advert.promoPriceUSD ? `$${advert.promoPriceUSD.toLocaleString()}` : 'Quote'}
            </span>
            {advert.originalPriceUSD && (
              <span className="text-xs line-through text-slate-400">
                ${advert.originalPriceUSD}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={`tel:${advert.phone}`}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            aria-label="Call advertiser"
          >
            <Phone className="w-4 h-4" />
          </a>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-sm active:scale-95 transition"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
