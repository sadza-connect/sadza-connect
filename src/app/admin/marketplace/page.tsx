'use client';

import { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  CheckCircle2,
  Search,
  ExternalLink,
} from 'lucide-react';
import { SAMPLE_PRODUCTS, MarketplaceProduct } from '../../../lib/data/zimbabwe';
import { formatDualCurrency } from '../../../lib/utils/currency';

export default function AdminMarketplacePage() {
  const [products, setProducts] = useState<MarketplaceProduct[]>(SAMPLE_PRODUCTS);
  const [search, setSearch] = useState('');

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sellerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink-950 dark:text-white">
          Marketplace Moderation
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1">
          Monitor product listings, verify dual pricing compliance (USD & ZiG), and remove non-compliant items.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search items or sellers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="text-xs text-ink-500">
          Total Products: <span className="font-bold text-ink-900 dark:text-white">{products.length}</span>
        </div>
      </div>

      <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ink-50 dark:bg-ink-950/70 border-b border-ink-100 dark:border-ink-800 text-ink-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Product Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price (USD / ZiG)</th>
                <th className="px-6 py-4">Merchant / Seller</th>
                <th className="px-6 py-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {filtered.map((prod) => {
                const { usd, zig } = formatDualCurrency(prod.priceUsd);
                return (
                  <tr key={prod.id} className="hover:bg-ink-50/50 dark:hover:bg-ink-950/50">
                    <td className="px-6 py-4 font-bold text-ink-950 dark:text-white max-w-xs truncate">
                      {prod.title}
                    </td>
                    <td className="px-6 py-4 text-ink-600 dark:text-ink-300">
                      {prod.category}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-brand-700 dark:text-brand-400">
                      {usd} <span className="text-[11px] text-gold-600 dark:text-gold-400 font-normal">({zig})</span>
                    </td>
                    <td className="px-6 py-4 text-ink-600 dark:text-ink-300">
                      {prod.sellerName}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(prod.id)}
                        className="p-1.5 rounded-lg text-ruby-600 hover:bg-ruby-50 dark:hover:bg-ruby-950/50 transition-colors"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
