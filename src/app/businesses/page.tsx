'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  ShieldCheck,
  Star,
  MessageCircle,
  Phone,
  Clock,
  Filter,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  BUSINESS_CATEGORIES,
  SAMPLE_BUSINESSES,
  ZIMBABWE_PROVINCES,
  BusinessListing,
} from '@/lib/data/zimbabwe';
import { createBusinessInquiryLink } from '@/lib/utils/whatsapp';

export default function BusinessesDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filteredBusinesses = SAMPLE_BUSINESSES.filter((biz) => {
    const matchesSearch =
      biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesProvince =
      selectedProvince === 'All' || biz.province.includes(selectedProvince);

    const matchesCategory =
      selectedCategory === 'All' || biz.categorySlug === selectedCategory;

    const matchesVerified = !verifiedOnly || biz.verifiedTier !== 'unverified';

    return matchesSearch && matchesProvince && matchesCategory && matchesVerified;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-ink-950 text-ink-950 dark:text-ink-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="container-x">
          {/* Header */}
          <div className="max-w-3xl mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 mb-3">
              <Building2 className="w-3.5 h-3.5 text-gold-500" />
              Verified Commercial Directory
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-950 dark:text-white">
              Zimbabwe Business Directory
            </h1>
            <p className="mt-2 text-base text-ink-600 dark:text-ink-300">
              Discover verified Zimbabwean enterprises across all 10 provinces. Connect directly via WhatsApp or telephone.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 mb-8 space-y-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search text */}
              <div className="relative md:col-span-6">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="text"
                  placeholder="Search by enterprise name, products, sadza, solar, cement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-ink-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Province filter */}
              <div className="relative md:col-span-3">
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-ink-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="All">All Provinces (10)</option>
                  {ZIMBABWE_PROVINCES.map((p) => (
                    <option key={p.id} value={p.name.split(' ')[0]}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category filter */}
              <div className="relative md:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-ink-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="All">All Categories</option>
                  {BUSINESS_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Toggle Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-ink-200 dark:border-ink-800 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                    verifiedOnly
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white dark:bg-ink-950 text-ink-700 dark:text-ink-300 border-ink-200 dark:border-ink-700 hover:border-brand-500'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>CR14 & ZIMRA Verified Only</span>
                </button>
              </div>

              <div className="text-ink-500 dark:text-ink-400 font-medium">
                Showing <span className="font-bold text-ink-900 dark:text-white">{filteredBusinesses.length}</span> verified business{filteredBusinesses.length === 1 ? '' : 'es'}
              </div>
            </div>
          </div>

          {/* Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((biz) => {
              const whatsappLink = createBusinessInquiryLink(biz.name, biz.whatsapp);

              return (
                <div
                  key={biz.id}
                  className="flex flex-col justify-between rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5 shadow-sm hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Top Row: Category & Badges */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                        {biz.categoryName}
                      </span>
                      {biz.cr14Verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                          <CheckCircle2 className="w-3 h-3 text-brand-600" />
                          CR14 Certified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <ShieldCheck className="w-3 h-3 text-amber-500" />
                          Artisan Verified
                        </span>
                      )}
                    </div>

                    {/* Name & Slug */}
                    <Link
                      href={`/businesses/${biz.slug}`}
                      className="group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"
                    >
                      <h2 className="text-xl font-bold text-ink-950 dark:text-white leading-snug">
                        {biz.name}
                      </h2>
                    </Link>

                    {/* Rating & Location */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-ink-600 dark:text-ink-400">
                      <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {biz.rating} ({biz.reviewCount})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-ink-400" />
                        {biz.city}, {biz.province}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mt-3 text-sm text-ink-600 dark:text-ink-300 line-clamp-3">
                      {biz.description}
                    </p>

                    {/* Services Tags */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {biz.services.slice(0, 3).map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-ink-100 dark:bg-ink-800 text-[11px] font-medium text-ink-700 dark:text-ink-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-6 pt-4 border-t border-ink-100 dark:border-ink-800/80 flex items-center justify-between gap-2">
                    <Link
                      href={`/businesses/${biz.slug}`}
                      className="text-xs font-bold text-ink-700 dark:text-ink-300 hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      View Full Profile →
                    </Link>

                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Chat</span>
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
