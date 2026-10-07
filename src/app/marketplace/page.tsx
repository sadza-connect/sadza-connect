'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Tag,
  ShoppingBag,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/Button';
import { SAMPLE_PRODUCTS, MarketplaceProduct } from '@/lib/data/zimbabwe';
import { formatDualCurrency, DEFAULT_USD_TO_ZIG_RATE } from '@/lib/utils/currency';
import { createProductInquiryLink } from '@/lib/utils/whatsapp';

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');

  const categories = [
    'All',
    'Solar & Renewable Energy',
    'Hardware & Construction',
    'Agriculture & Farm Inputs',
    'Automotive & Spare Parts',
    'Restaurants & Traditional Dining',
  ];

  const filteredProducts = SAMPLE_PRODUCTS.filter((prod) => {
    const matchesSearch =
      prod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.sellerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || prod.category === selectedCategory;

    const matchesCondition =
      selectedCondition === 'All' || prod.condition === selectedCondition;

    return matchesSearch && matchesCategory && matchesCondition;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-ink-950 text-ink-950 dark:text-ink-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="container-x">
          {/* Header */}
          <div className="max-w-3xl mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-50 dark:bg-gold-950/60 text-gold-700 dark:text-gold-300 border border-gold-200 dark:border-gold-800 mb-3">
              <ShoppingBag className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
              National Marketplace
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-950 dark:text-white">
              Zimbabwe Online Marketplace
            </h1>
            <p className="mt-2 text-base text-ink-600 dark:text-ink-300">
              Browse products with verified dual pricing in USD and ZiG. Negotiate and purchase directly with Zimbabwean merchants on WhatsApp.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="p-4 sm:p-5 rounded-2xl bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 mb-8 space-y-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search text */}
              <div className="relative md:col-span-6">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="text"
                  placeholder="Search solar panels, cement, maize seed, biltong, spares..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-ink-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Category filter */}
              <div className="relative md:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-ink-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition filter */}
              <div className="relative md:col-span-3">
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-ink-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="All">All Conditions</option>
                  <option value="Brand New">Brand New</option>
                  <option value="Certified Used">Certified Used</option>
                  <option value="Locally Fabricated">Locally Fabricated</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-ink-200 dark:border-ink-800 text-xs text-ink-500">
              <div>
                Indicative Exchange Rate: <span className="font-semibold text-ink-800 dark:text-ink-200">1 USD = {DEFAULT_USD_TO_ZIG_RATE} ZiG</span>
              </div>
              <div className="font-medium">
                {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'} found
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => {
              const { usd, zig } = formatDualCurrency(prod.priceUsd);
              const whatsappLink = createProductInquiryLink(prod.title, prod.priceUsd, prod.sellerPhone);

              return (
                <div
                  key={prod.id}
                  className="flex flex-col justify-between rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5 shadow-sm hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Top Row: Category & Condition */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                        {prod.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300">
                        {prod.condition}
                      </span>
                    </div>

                    {/* Product Title */}
                    <Link
                      href={`/marketplace/${prod.slug}`}
                      className="group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"
                    >
                      <h2 className="text-lg font-bold text-ink-950 dark:text-white leading-snug line-clamp-2">
                        {prod.title}
                      </h2>
                    </Link>

                    {/* Dual Pricing Pill */}
                    <div className="mt-4 p-3 rounded-xl bg-ink-50 dark:bg-ink-950/80 border border-ink-100 dark:border-ink-800/80">
                      <div className="text-xs text-ink-500 dark:text-ink-400">Direct Merchant Price:</div>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xl font-extrabold text-brand-700 dark:text-brand-400">
                          {usd}
                        </span>
                        <span className="text-xs font-bold text-gold-600 dark:text-gold-400">
                          ({zig})
                        </span>
                      </div>
                    </div>

                    {/* Seller details */}
                    <div className="mt-4 text-xs space-y-1 text-ink-600 dark:text-ink-400">
                      <div className="flex items-center gap-1.5 font-semibold text-ink-800 dark:text-ink-200">
                        {prod.sellerVerified ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        )}
                        <span>{prod.sellerName}</span>
                      </div>
                      <div>Location: {prod.location}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-ink-100 dark:border-ink-800/80 flex items-center justify-between gap-2">
                    <Link
                      href={`/marketplace/${prod.slug}`}
                      className="text-xs font-bold text-ink-700 dark:text-ink-300 hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      Details →
                    </Link>

                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Buy via WhatsApp</span>
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
