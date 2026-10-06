'use client';

import { useState } from 'react';
import {
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Building2,
  MapPin,
  Search,
} from 'lucide-react';
import { SAMPLE_BUSINESSES, BusinessListing } from '@/lib/data/zimbabwe';

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessListing[]>(SAMPLE_BUSINESSES);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'verified'>('pending');
  const [search, setSearch] = useState('');

  const toggleVerify = (id: string) => {
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              cr14Verified: !b.cr14Verified,
              verifiedTier: !b.cr14Verified ? 'tier2_corporate' : 'tier1_artisan',
            }
          : b
      )
    );
  };

  const filtered = businesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.city.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'pending') return matchesSearch && !b.cr14Verified;
    if (activeTab === 'verified') return matchesSearch && b.cr14Verified;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink-950 dark:text-white">
            Business Directory & Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 mt-1">
            Review Zimbabwean CR14 incorporation forms, ZIMRA ITF263 tax clearance, and approve verified badges.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-white'
                : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'
            }`}
          >
            Pending Review
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('verified')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'verified'
                ? 'bg-brand-600 text-white'
                : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'
            }`}
          >
            Verified Corporates
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'all'
                ? 'bg-ink-800 text-white'
                : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'
            }`}
          >
            All Enterprises ({businesses.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ink-50 dark:bg-ink-950/70 border-b border-ink-100 dark:border-ink-800 text-ink-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Enterprise Name</th>
                <th className="px-6 py-4">Province & City</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Verification Status</th>
                <th className="px-6 py-4 text-right">KYC Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {filtered.map((biz) => (
                <tr key={biz.id} className="hover:bg-ink-50/50 dark:hover:bg-ink-950/50">
                  <td className="px-6 py-4 font-bold text-ink-950 dark:text-white">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      <span>{biz.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-ink-600 dark:text-ink-300">
                    {biz.city}, {biz.province}
                  </td>
                  <td className="px-6 py-4 text-ink-600 dark:text-ink-300">
                    {biz.categoryName}
                  </td>
                  <td className="px-6 py-4">
                    {biz.cr14Verified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                        <CheckCircle2 className="w-3 h-3 text-brand-600" />
                        CR14 Verified Corporate
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <ShieldCheck className="w-3 h-3 text-amber-500" />
                        Artisan / Pending CR14
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleVerify(biz.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                        biz.cr14Verified
                          ? 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-ruby-50 hover:text-ruby-600'
                          : 'bg-brand-600 hover:bg-brand-700 text-white'
                      }`}
                    >
                      {biz.cr14Verified ? 'Revoke Badge' : 'Approve CR14'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
