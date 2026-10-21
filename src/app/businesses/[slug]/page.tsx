'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  MapPin,
  ShieldCheck,
  Star,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Building2,
  ShoppingBag,
  Briefcase,
  Bookmark,
  Send,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import {
  SAMPLE_BUSINESSES,
  SAMPLE_PRODUCTS,
  SAMPLE_JOBS,
  BusinessListing,
  MarketplaceProduct,
  JobOpening,
  BusinessReview,
} from '@/lib/data/zimbabwe';
import {
  saveStoredBusinesses,
  getSavedBusinessIds,
  toggleSavedBusinessId,
  getPlatformSettings,
} from '@/data/platformStore';
import { createBusinessInquiryLink, createProductInquiryLink } from '@/lib/utils/whatsapp';
import { mapDbBusinessToListing } from '@/lib/data/business-mapper';
import { getOnboardingDraft } from '@/lib/utils/onboarding-state';

export default function BusinessProfilePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || '';

  const [liveBusiness, setLiveBusiness] = useState<BusinessListing | null>(null);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [usdToZig, setUsdToZig] = useState<number>(26.5);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'jobs' | 'reviews'>('overview');

  // Review Form State
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRole, setReviewerRole] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [draftBusinessName, setDraftBusinessName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const draft = getOnboardingDraft();
      if (draft?.registeredBusinessName || draft?.tradingName) {
        setDraftBusinessName(draft.tradingName || draft.registeredBusinessName || null);
      }
    } catch {}
  }, []);

  useEffect(() => {
    setSavedIds(getSavedBusinessIds());
    setUsdToZig(getPlatformSettings().usdToZigRate);

    // Fetch live business dossier from API
    if (slug) {
      fetch(`/api/v1/businesses/${encodeURIComponent(slug)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data?.business) {
            const mapped = mapDbBusinessToListing(json.data.business);
            setLiveBusiness(mapped);
            if (Array.isArray(json.data.products)) {
              setProducts(json.data.products);
            }
            if (Array.isArray(json.data.jobs)) {
              setJobs(json.data.jobs);
            }
          }
        })
        .catch(() => {});

      // Fire silent view count tracking
      fetch(`/api/v1/businesses/${encodeURIComponent(slug)}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'view' }),
      }).catch(() => {});
    }
  }, [slug]);

  const business = liveBusiness;

  if (!business) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center flex-1">
          <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Business Not Found
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            The business profile you are looking for may have been removed or does not exist.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/businesses"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
            >
              Browse Directory
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const businessProducts = products.filter(
    (p) =>
      p.sellerSlug === business.slug ||
      p.sellerId === business.id ||
      p.sellerName.toLowerCase() === business.name.toLowerCase()
  );

  const businessJobs = jobs.filter(
    (j) =>
      j.companySlug === business.slug ||
      j.company.toLowerCase() === business.name.toLowerCase()
  );

  const reviews: BusinessReview[] = business.reviews || [];
  const isSaved = savedIds.includes(business.id);
  const whatsappLink = createBusinessInquiryLink(business.name, business.whatsapp);
  const isDraftPreview = Boolean(
    (draftBusinessName && business.name && draftBusinessName.toLowerCase() === business.name.toLowerCase()) ||
    business.verificationStatus === 'Pending'
  );

  const handleWhatsAppClick = () => {
    if (slug) {
      fetch(`/api/v1/businesses/${encodeURIComponent(slug)}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'whatsapp' }),
      }).catch(() => {});
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    const newRev: BusinessReview = {
      id: `rev-${Date.now()}`,
      author: reviewerName.trim(),
      role: reviewerRole.trim() || 'Verified Customer',
      rating: reviewRating,
      date: 'Just now',
      comment: reviewComment.trim(),
    };

    if (liveBusiness) {
      const updatedBusiness: BusinessListing = {
        ...liveBusiness,
        reviewCount: (liveBusiness.reviewCount || 0) + 1,
        reviews: [newRev, ...(liveBusiness.reviews || [])],
      };
      setLiveBusiness(updatedBusiness);
    }

    setReviewerName('');
    setReviewerRole('');
    setReviewComment('');
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 sm:py-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-5">
            <Link
              href="/businesses"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Business Directory</span>
            </Link>
          </div>

          {/* Draft Preview Warning Banner */}
          {isDraftPreview && (
            <div className="mb-6 rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50/90 dark:bg-amber-950/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-amber-900 dark:text-amber-200">
                      Draft Storefront Preview
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
                      Private View Only
                    </span>
                  </div>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                    This business listing is currently in draft mode and unlisted from public Zimbabwe search.
                  </p>
                </div>
              </div>
              <Link
                href="/onboarding/business"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs shrink-0 transition-colors"
              >
                <span>Resume Setup &amp; Publish &rarr;</span>
              </Link>
            </div>
          )}

          {/* Storefront Header Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Banner Photo */}
              <div className="relative h-56 sm:h-64 lg:h-auto lg:col-span-4 bg-slate-100 dark:bg-slate-800">
                <Image
                  src={business.image}
                  alt={business.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>

              {/* Business Summary & Direct Contact */}
              <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {business.categoryName}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {business.businessType}
                    </span>
                    {business.cr14Verified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {business.verificationBadge || 'Verified Registered Company'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Unverified (Pending Review)
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {business.name}
                  </h1>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {business.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                      <Star className="w-4 h-4 text-amber-500 fill-current" />
                      {business.rating} ({business.reviewCount} reviews)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      {business.province} • {business.address}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      {business.openingHours}
                    </span>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleWhatsAppClick}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp Business Desk</span>
                    </a>
                    <a
                      href={`tel:${business.phone}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>Call {business.phone}</span>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSavedIds(toggleSavedBusinessId(business.id))}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? 'Saved to Bookmarks' : 'Save Business'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Storefront Navigation Tabs */}
            <div className="px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex overflow-x-auto gap-6">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`py-3.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'overview'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Overview & Services
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`py-3.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeTab === 'products'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Products Catalog ({businessProducts.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('jobs')}
                className={`py-3.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeTab === 'jobs'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Open Vacancies ({businessJobs.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`py-3.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeTab === 'reviews'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Star className="w-4 h-4" />
                <span>Customer Reviews ({reviews.length})</span>
              </button>
            </div>
          </div>

          {/* Main Body Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                      Core Services & Specialties
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {business.services.map((service, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preview of Products */}
                  {businessProducts.length > 0 && (
                    <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          Products Listed by {business.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setActiveTab('products')}
                          className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
                        >
                          View All ({businessProducts.length}) →
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {businessProducts.slice(0, 2).map((prod) => (
                          <div
                            key={prod.id}
                            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 flex flex-col justify-between gap-3"
                          >
                            <div>
                              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                {prod.movementBadge} • {prod.stockNote}
                              </span>
                              <Link
                                href={`/marketplace/${prod.slug}`}
                                className="block font-bold text-sm text-slate-900 dark:text-white hover:text-emerald-600 mt-1"
                              >
                                {prod.title}
                              </Link>
                              <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                                  USD ${prod.priceUsd.toLocaleString()}
                                </span>
                                <span className="text-xs text-slate-500">
                                  ({Math.round(prod.priceUsd * usdToZig).toLocaleString()} ZiG)
                                </span>
                              </div>
                            </div>
                            <a
                              href={createProductInquiryLink(
                                prod.title,
                                prod.priceUsd,
                                prod.sellerPhone
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Order on WhatsApp</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PRODUCTS CATALOG */}
              {activeTab === 'products' && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Active Products Catalog ({businessProducts.length})
                    </h2>
                  </div>

                  {businessProducts.length === 0 ? (
                    <p className="text-sm text-slate-500 py-6">
                      This business has not uploaded individual product items yet. Contact them directly via WhatsApp for their current price list.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {businessProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between bg-slate-50/40 dark:bg-slate-950/40"
                        >
                          <div>
                            <div className="relative h-40 w-full bg-slate-100">
                              <Image
                                src={prod.image}
                                alt={prod.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover"
                              />
                            </div>
                            <div className="p-4">
                              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                {prod.condition} • {prod.unit}
                              </span>
                              <Link
                                href={`/marketplace/${prod.slug}`}
                                className="block text-base font-bold text-slate-900 dark:text-white hover:text-emerald-600 mt-1"
                              >
                                {prod.title}
                              </Link>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2">
                                {prod.description}
                              </p>
                              <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                                  USD ${prod.priceUsd.toLocaleString()}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">
                                  ({Math.round(prod.priceUsd * usdToZig).toLocaleString()} ZiG)
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 pt-0 flex items-center gap-2">
                            <Link
                              href={`/marketplace/${prod.slug}`}
                              className="flex-1 text-center py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                            >
                              Details
                            </Link>
                            <a
                              href={createProductInquiryLink(
                                prod.title,
                                prod.priceUsd,
                                prod.sellerPhone
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: JOBS */}
              {activeTab === 'jobs' && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Open Vacancies at {business.name}
                  </h2>
                  {businessJobs.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4">
                      No open vacancies listed at this moment.
                    </p>
                  ) : (
                    businessJobs.map((job) => (
                      <div
                        key={job.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            {job.type} • {job.salaryUsd}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                            {job.title}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {job.description}
                          </p>
                        </div>
                        <Link
                          href="/jobs"
                          className="shrink-0 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
                        >
                          Apply on Jobs Portal
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: REVIEWS */}
              {activeTab === 'reviews' && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Customer Reviews & Feedback ({reviews.length})
                  </h2>

                  {reviews.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Be the first customer to leave a verified review for {business.name}.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {rev.author}
                              </span>
                              <span className="text-xs text-slate-500 ml-2">
                                • {rev.role}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              {rev.rating}.0 • {rev.date}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {rev.comment}
                          </p>
                          {rev.reply && (
                            <div className="mt-2 pl-3 border-l-2 border-emerald-500 text-xs text-slate-600 dark:text-slate-400">
                              <span className="font-bold text-slate-900 dark:text-white">
                                Response from {business.name}:{' '}
                              </span>
                              {rev.reply}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Leave a Review Form */}
                  <form
                    onSubmit={handleSubmitReview}
                    className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4"
                  >
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Write a Customer Review
                    </h3>
                    {reviewSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                        Thank you! Your review has been posted to {business.name}&apos;s profile.
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Your Full Name"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Your Role / Company (Optional)"
                        value={reviewerRole}
                        onChange={(e) => setReviewerRole(e.target.value)}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
                      />
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-semibold"
                      >
                        <option value={5}>5 Stars (Excellent)</option>
                        <option value={4}>4 Stars (Good)</option>
                        <option value={3}>3 Stars (Average)</option>
                      </select>
                    </div>
                    <textarea
                      rows={3}
                      required
                      placeholder="Share your experience dealing with this business..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Review</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Right Sidebar: Contact & Verification Summary */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Business Contact Details
                </h3>
                <div className="space-y-3.5 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        Province & Address
                      </div>
                      <div className="text-slate-600 dark:text-slate-300">
                        {business.province} — {business.address}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        Telephone / WhatsApp
                      </div>
                      <a
                        href={`tel:${business.phone}`}
                        className="text-emerald-600 font-semibold hover:underline"
                      >
                        {business.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        Official Email
                      </div>
                      <a
                        href={`mailto:${business.email}`}
                        className="text-slate-600 dark:text-slate-300 hover:underline"
                      >
                        {business.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        Operating Hours
                      </div>
                      <div className="text-slate-600 dark:text-slate-300">
                        {business.openingHours}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Verification & Compliance Status</span>
                </div>
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <p className="leading-relaxed">
                    Registered as{' '}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {business.legalForm
                        ? business.legalForm.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                        : business.businessType}
                    </span>{' '}
                    with active directory standing ({business.subscriptionStatus}).
                  </p>
                  {business.registrationNumber && (
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-500">Official Reference #:</span>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {business.registrationNumber}
                      </span>
                    </div>
                  )}
                  {business.applicantRole && (
                    <div className="text-[11px] text-slate-500">
                      Listing Authority: <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{business.applicantRole.replace(/_/g, ' ')}</span>
                    </div>
                  )}
                  {business.verificationBadge && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {business.verificationBadge}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
