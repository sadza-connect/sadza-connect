'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Megaphone,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Plus,
  Layers,
  ShieldCheck,
  Clock,
  Tag,
  ArrowLeft,
  CheckCircle2,
  X,
  SlidersHorizontal,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { AnnouncementBar } from '@/components/landing/AnnouncementBar';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  PaidAdvertItem,
  CLEAN_PROVINCES,
  COMMERCIAL_SECTORS,
  DEFAULT_PAID_ADVERTS,
  loadStoredAdverts,
  saveStoredAdverts,
  getDeletedAdvertIds,
} from '@/data/advertsStore';
import { mapDbAdvertToPaidAdvert } from '@/lib/data/advert-mapper';
import { sanitizePhoneNumber } from '@/lib/utils/whatsapp';

const OFFER_TYPES = [
  'All Offer Types',
  'Special Package',
  'Price Discount',
  'Bulk / Wholesale',
  'Free Delivery',
] as const;

export default function AdvertsDirectoryPage() {
  const [adverts, setAdverts] = useState<PaidAdvertItem[]>(DEFAULT_PAID_ADVERTS);
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedProvince, setSelectedProvince] = useState<string>('All Provinces');
  const [selectedOfferType, setSelectedOfferType] = useState<string>('All Offer Types');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Create Advert Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<PaidAdvertItem['businessType']>('Registered Company (Pvt Ltd)');
  const [province, setProvince] = useState('Harare');
  const [category, setCategory] = useState('Solar & Clean Energy');
  const [offerType, setOfferType] = useState<PaidAdvertItem['offerType']>('Special Package');
  const [headline, setHeadline] = useState('');
  const [offerText, setOfferText] = useState('');
  const [promoBadge, setPromoBadge] = useState('SPECIAL OFFER');
  const [promoPriceUSD, setPromoPriceUSD] = useState('');
  const [validUntil, setValidUntil] = useState('Valid 14 days');
  const [whatsapp, setWhatsapp] = useState('263772111222');
  const [paymentMethod, setPaymentMethod] = useState<'ecocash' | 'innbucks' | 'card'>('ecocash');
  const [publishSuccess, setPublishSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchLiveAdverts() {
      try {
        let liveAdverts: PaidAdvertItem[] = [];
        try {
          const res = await fetch('/api/v1/adverts?limit=100');
          if (res.ok) {
            const json = await res.json();
            const dbAds = json.data?.adverts || json.adverts || [];
            if (Array.isArray(dbAds)) {
              liveAdverts = dbAds.map(mapDbAdvertToPaidAdvert);
            }
          }
        } catch (apiErr) {
          console.warn('API fetch for adverts failed:', apiErr);
        }

        const deletedIds = new Set(getDeletedAdvertIds());
        const validAds = liveAdverts.filter((item) => item && item.id && !deletedIds.has(item.id));

        if (isMounted) {
          setAdverts(validAds);
        }
      } catch {
        if (isMounted) setAdverts([]);
      }
    }

    fetchLiveAdverts();
    const handleSync = () => fetchLiveAdverts();
    window.addEventListener('sadza-adverts-updated', handleSync);
    return () => {
      isMounted = false;
      window.removeEventListener('sadza-adverts-updated', handleSync);
    };
  }, []);

  const filteredAdverts = useMemo(() => {
    return adverts.filter((ad) => {
      const matchSector = selectedSector === 'All' || ad.category === selectedSector;
      const matchProv = selectedProvince === 'All Provinces' || ad.province === selectedProvince;
      const matchOffer = selectedOfferType === 'All Offer Types' || ad.offerType === selectedOfferType;
      const matchSearch =
        !searchQuery.trim() ||
        ad.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.offerText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSector && matchProv && matchOffer && matchSearch;
    });
  }, [adverts, selectedSector, selectedProvince, selectedOfferType, searchQuery]);

  const handlePublishAdvert = async (e: React.FormEvent) => {
    e.preventDefault();
    const usd = parseFloat(promoPriceUSD) || undefined;
    const cleanWhatsapp = whatsapp.replace(/\D/g, '') || '263772111222';

    let createdAdvertObj: PaidAdvertItem | null = null;

    try {
      const res = await fetch('/api/v1/adverts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          business_name: businessName.trim() || 'Verified Zimbabwean Enterprise',
          business_type: businessType,
          province,
          category,
          offer_type: offerType,
          headline: headline.trim() || 'Special Commercial Promotion',
          offer_text:
            offerText.trim() ||
            'Contact our sales desk directly on WhatsApp to claim this promotional business offer.',
          promo_badge: promoBadge.trim().toUpperCase() || 'PAID PROMO',
          promo_price_usd: usd,
          valid_until: validUntil.trim() || 'Valid this month',
          whatsapp: cleanWhatsapp,
          phone: `+${cleanWhatsapp}`,
          image:
            'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
          featured_on_home: true,
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.advert) {
        createdAdvertObj = mapDbAdvertToPaidAdvert(json.data.advert);
      }
    } catch (err) {
      console.error('Failed to publish advert to database:', err);
    }

    // Also record subscription invoice for the $20 advert promotion
    try {
      await fetch('/api/v1/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          business_name: businessName.trim() || 'Verified Zimbabwean Enterprise',
          plan_type: 'Sponsored Product Advert ($20/mo)',
          amount_usd: 20,
          payment_method: paymentMethod === 'ecocash' ? 'EcoCash USD' : paymentMethod === 'innbucks' ? 'InnBucks' : 'Visa / Mastercard',
          status: 'Paid',
        }),
      });
    } catch {}

    const newAd: PaidAdvertItem = createdAdvertObj || {
      id: `ad-${Date.now()}`,
      businessName: businessName.trim() || 'Verified Zimbabwean Enterprise',
      businessType,
      province,
      category,
      offerType,
      headline: headline.trim() || 'Special Commercial Promotion',
      offerText:
        offerText.trim() ||
        'Contact our sales desk directly on WhatsApp to claim this promotional business offer.',
      promoBadge: promoBadge.trim().toUpperCase() || 'PAID PROMO',
      promoPriceUSD: usd,
      priceZiG: usd ? Math.round(usd * 26.5) : undefined,
      validUntil: validUntil.trim() || 'Valid this month',
      whatsapp: cleanWhatsapp,
      phone: `+${cleanWhatsapp}`,
      image:
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      featuredOnHome: true,
      postedAt: 'Just now',
    };

    const updated = [newAd, ...adverts];
    setAdverts(updated);
    saveStoredAdverts(updated);
    setPublishSuccess(true);
  };

  const resetFilters = () => {
    setSelectedSector('All');
    setSelectedProvince('All Provinces');
    setSelectedOfferType('All Offer Types');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-100/90 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 py-8 sm:py-10">
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-8">
          {/* Page Header Banner */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    href="/#commercial-portal"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Homepage Portal</span>
                  </Link>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    <Megaphone className="h-3.5 w-3.5 text-amber-600" />
                    <span>Sponsored Business Adverts &amp; Deals</span>
                  </span>
                </div>

                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">
                  All Active Business Adverts &amp; Commercial Promotions
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Browse verified promotional flyers, wholesale discounts, contractor clearances, and special packages published by subscribed businesses across all 10 provinces of Zimbabwe. Every advert published here also rotates in the Homepage Sponsored Sidebar.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setPublishSuccess(false);
                    setCreateModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 text-sm font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Publish a Paid Business Advert ($20)</span>
                </button>
                <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  Appears on Homepage Right Sidebar &amp; Adverts Directory
                </div>
              </div>
            </div>

            {/* Filter Console */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
              {/* Search input */}
              <div className="lg:col-span-4 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search adverts by product, company, or offer..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-10 pr-8 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Sector Filter */}
              <div className="lg:col-span-3">
                <select
                  aria-label="Filter by Commercial Sector"
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                >
                  {COMMERCIAL_SECTORS.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Province Filter (Clean Names) */}
              <div className="lg:col-span-3">
                <select
                  aria-label="Filter by Province"
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                >
                  {CLEAN_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              {/* Offer Type Filter */}
              <div className="lg:col-span-2">
                <select
                  aria-label="Filter by Offer Type"
                  value={selectedOfferType}
                  onChange={(e) => setSelectedOfferType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                >
                  {OFFER_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Active Results Count & Quick Province Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Showing {filteredAdverts.length} Active Business Advert{filteredAdverts.length === 1 ? '' : 's'}
              </span>
              {(selectedSector !== 'All' ||
                selectedProvince !== 'All Provinces' ||
                selectedOfferType !== 'All Offer Types' ||
                searchQuery) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {CLEAN_PROVINCES.slice(0, 7).map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => setSelectedProvince(prov)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    selectedProvince === prov
                      ? 'bg-slate-900 text-white dark:bg-emerald-600'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>

          {/* Adverts Grid */}
          {filteredAdverts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3">
              <Megaphone className="h-10 w-10 text-slate-400 mx-auto" />
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                No Sponsored Adverts Match Your Filter
              </h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Try selecting &ldquo;All Provinces&rdquo; or &ldquo;All Commercial Sectors&rdquo; to see all running business promotions.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl bg-emerald-600 text-white px-4 py-2.5 text-sm font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAdverts.map((ad) => (
                <article
                  key={ad.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs hover:shadow-lg hover:border-amber-500/60 transition-all duration-200"
                >
                  <div>
                    {/* Banner Image */}
                    <div className="relative h-52 w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                      {ad.image ? (
                        <>
                          <Image
                            src={ad.image}
                            alt={ad.headline}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                          <Megaphone className="h-12 w-12 text-amber-400/80 mb-2" />
                          <span className="text-xs font-semibold text-slate-300 line-clamp-1">{ad.businessName}</span>
                        </div>
                      )}

                      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-amber-400 text-slate-950 px-2.5 py-1 text-xs font-extrabold uppercase shadow-sm">
                          {ad.promoBadge}
                        </span>
                        <span className="rounded-lg bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white px-2.5 py-1 text-xs font-bold shadow-sm">
                          {ad.province}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="rounded-lg bg-slate-950/80 text-amber-300 border border-amber-400/30 px-2.5 py-1 text-[11px] font-bold">
                          {ad.offerType}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                            {ad.category}
                          </p>
                          <p className="text-sm font-bold text-white truncate">
                            {ad.businessName}
                          </p>
                        </div>
                        <span className="rounded-md bg-emerald-600/90 text-white px-2 py-0.5 text-[11px] font-bold flex items-center gap-1 shrink-0">
                          <ShieldCheck className="h-3 w-3" />
                          Verified
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-3">
                      <Link
                        href={`/adverts/${ad.id}`}
                        className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white leading-snug">
                          {ad.headline}
                        </h2>
                      </Link>

                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {ad.offerText}
                      </p>

                      {ad.promoPriceUSD && (
                        <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 px-3.5 py-2.5 flex items-baseline justify-between">
                          <div>
                            <span className="text-xs font-semibold text-slate-500 mr-2">
                              Promo Price:
                            </span>
                            <span className="font-display text-lg font-extrabold text-slate-900 dark:text-white">
                              USD ${ad.promoPriceUSD.toLocaleString()}
                            </span>
                            {ad.originalPriceUSD && (
                              <span className="ml-2 text-xs text-slate-400 line-through">
                                ${ad.originalPriceUSD.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {ad.priceZiG && (
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                              {ad.priceZiG.toLocaleString()} ZiG
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {ad.validUntil}
                      </span>{' '}
                      • {ad.postedAt}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/adverts/${ad.id}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        View Deal
                      </Link>
                      <a
                        href={`tel:${ad.phone}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/${sanitizePhoneNumber(ad.whatsapp)}?text=Hi%20${encodeURIComponent(
                          ad.businessName
                        )},%20I'm%20claiming%20your%20advert%20offer%20"${encodeURIComponent(
                          ad.headline
                        )}"%20on%20Sadza%20Connect.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold transition-colors"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Claim on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Publish Paid Business Advert Modal */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Publish Sponsored Business Advert"
          description="Your advert will immediately appear in the Homepage Right Sidebar and in the All Adverts Directory."
        >
          {publishSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Sponsored Advert Published Live!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                Your promotion is now live in the Adverts Directory and on the Homepage Sponsored Sidebar.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Button variant="outline" size="md" onClick={() => setCreateModalOpen(false)}>
                  View on This Page
                </Button>
                <Link href="/#commercial-portal">
                  <Button variant="primary" size="md">
                    See on Homepage Sidebar
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePublishAdvert} className="space-y-3.5">
              <Input
                label="Registered Business Name"
                placeholder="e.g. Midlands Solar & Power Systems"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Commercial Sector
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {COMMERCIAL_SECTORS.filter((s) => s.id !== 'All').map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Province
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {CLEAN_PROVINCES.filter((p) => p !== 'All Provinces').map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="Advert Headline"
                placeholder="e.g. 15% Off Bulk Cement & Free Site Delivery"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />

              <Input
                label="Promotional Offer Details"
                placeholder="Describe what buyers get and any minimum order or warranty..."
                required
                value={offerText}
                onChange={(e) => setOfferText(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Promo Badge"
                  placeholder="e.g. SAVE $250"
                  required
                  value={promoBadge}
                  onChange={(e) => setPromoBadge(e.target.value)}
                />
                <Input
                  label="Promo Price (USD)"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 450"
                  value={promoPriceUSD}
                  onChange={(e) => setPromoPriceUSD(e.target.value)}
                />
                <Input
                  label="WhatsApp Number"
                  placeholder="263772111222"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Sponsored Advert Placement Fee (30 Days):
                </span>
                <span className="font-display text-base font-extrabold text-emerald-600">
                  USD $20.00 / 530 ZiG
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="md" type="button" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit">
                  Pay &amp; Publish Advert Live
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}

      <Footer />
    </div>
  );
}
