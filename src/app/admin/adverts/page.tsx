'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  Pin,
  CheckCircle2,
} from 'lucide-react';
import {
  AdminPageHeader,
  Panel,
  StatCard,
  IconButton,
  AdminBadge,
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminModal,
  SearchInput,
  FilterSelect,
  Toolbar,
  ResultCount,
  EmptyState,
} from '@/components/admin/AdminUI';
import { ImageUploader, GalleryItem } from '@/components/admin/ImageUploader';
import { ZIMBABWE_PROVINCES, BUSINESS_CATEGORIES } from '@/lib/data/zimbabwe';
import {
  loadStoredAdverts,
  saveStoredAdverts,
  PaidAdvertItem,
} from '@/data/advertsStore';

export default function AdminAdvertsPage() {
  const [adverts, setAdverts] = useState<PaidAdvertItem[]>([]);
  const [query, setQuery] = useState('');
  const [offerFilter, setOfferFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    businessName: 'SunPower Solar & Inverters Zimbabwe',
    category: BUSINESS_CATEGORIES[0]?.name || 'Solar & Clean Energy',
    province: 'Harare',
    offerType: 'Special Package' as PaidAdvertItem['offerType'],
    headline: '',
    offerText: '',
    promoBadge: 'SAVE 15% THIS MONTH',
    originalPriceUsd: '1450',
    promoPriceUsd: '1250',
    validUntil: 'Valid 30 Days',
    whatsapp: '263772101101',
    phone: '+263 77 210 1101',
    pinnedToHome: true,
    images: [] as GalleryItem[],
  });

  useEffect(() => {
    const sync = () => setAdverts(loadStoredAdverts());
    sync();
    window.addEventListener('sadza-adverts-updated', sync);
    return () => window.removeEventListener('sadza-adverts-updated', sync);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return adverts.filter((a) => {
      const matchesQ =
        !q ||
        a.headline.toLowerCase().includes(q) ||
        a.businessName.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q);
      const matchesOffer = offerFilter === 'all' || a.offerType === offerFilter;
      return matchesQ && matchesOffer;
    });
  }, [adverts, query, offerFilter]);

  function openCreate() {
    setEditingId(null);
    setForm({
      businessName: 'SunPower Solar & Inverters Zimbabwe',
      category: BUSINESS_CATEGORIES[0]?.name || 'Solar & Clean Energy',
      province: 'Harare',
      offerType: 'Special Package',
      headline: '',
      offerText: '',
      promoBadge: 'SPONSORED DEAL • SAVE 20%',
      originalPriceUsd: '950',
      promoPriceUsd: '790',
      validUntil: 'Valid 30 Days',
      whatsapp: '263772101101',
      phone: '+263 77 210 1101',
      pinnedToHome: true,
      images: [
        {
          src: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
          caption: 'Advert Banner',
        },
      ],
    });
    setFormOpen(true);
  }

  function openEdit(ad: PaidAdvertItem) {
    setEditingId(ad.id);
    setForm({
      businessName: ad.businessName,
      category: ad.category,
      province: ad.province,
      offerType: ad.offerType,
      headline: ad.headline,
      offerText: ad.offerText,
      promoBadge: ad.promoBadge,
      originalPriceUsd: String(ad.originalPriceUSD || ''),
      promoPriceUsd: String(ad.promoPriceUSD || ''),
      validUntil: ad.validUntil,
      whatsapp: ad.whatsapp,
      phone: ad.phone,
      pinnedToHome: Boolean(ad.featuredOnHome),
      images: ad.image ? [{ src: ad.image, caption: ad.headline }] : [],
    });
    setFormOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const imgSrc =
      form.images[0]?.src ||
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80';

    if (editingId) {
      const next = adverts.map((a) =>
        a.id === editingId
          ? {
              ...a,
              businessName: form.businessName,
              category: form.category,
              province: form.province,
              offerType: form.offerType,
              headline: form.headline,
              offerText: form.offerText,
              promoBadge: form.promoBadge,
              originalPriceUSD: Number(form.originalPriceUsd) || undefined,
              promoPriceUSD: Number(form.promoPriceUsd) || undefined,
              validUntil: form.validUntil,
              whatsapp: form.whatsapp,
              phone: form.phone,
              featuredOnHome: form.pinnedToHome,
              image: imgSrc,
            }
          : a
      );
      saveStoredAdverts(next);
      setAdverts(next);
      showToast(`Updated sponsored advert: ${form.headline}`);
    } else {
      const newAd: PaidAdvertItem = {
        id: `ad-${Date.now()}`,
        businessName: form.businessName,
        businessType: 'Registered Company (Pvt Ltd)',
        category: form.category,
        province: form.province,
        offerType: form.offerType,
        headline: form.headline,
        offerText: form.offerText,
        promoBadge: form.promoBadge,
        originalPriceUSD: Number(form.originalPriceUsd) || undefined,
        promoPriceUSD: Number(form.promoPriceUsd) || undefined,
        validUntil: form.validUntil,
        whatsapp: form.whatsapp,
        phone: form.phone,
        image: imgSrc,
        postedAt: 'Just now',
        featuredOnHome: form.pinnedToHome,
      };
      const next = [newAd, ...adverts];
      saveStoredAdverts(next);
      setAdverts(next);
      showToast(`Published $20/mo Sponsored Advert: ${form.headline}`);
    }
    setFormOpen(false);
  }

  function togglePin(ad: PaidAdvertItem) {
    const next = adverts.map((a) =>
      a.id === ad.id ? { ...a, featuredOnHome: !a.featuredOnHome } : a
    );
    saveStoredAdverts(next);
    setAdverts(next);
    showToast(
      `${ad.headline}: ${!ad.featuredOnHome ? 'Pinned to Homepage Top-6' : 'Unpinned from Homepage'}`
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl bg-[#0a1018] px-4 py-3 text-xs font-bold text-white shadow-xl border border-[#1e57eb]">
          <CheckCircle2 className="h-4 w-4 text-[#599bff]" />
          <span>{toast}</span>
        </div>
      )}

      <AdminPageHeader
        title="Sponsored Adverts & Promotions ($20/mo)"
        description="Manage paid promotional slots, control Homepage Top-6 showcase pinning, and upload promotional campaign visuals."
      >
        <AdminButton onClick={openCreate}>
          <Plus className="h-4 w-4" /> Launch Sponsored Advert
        </AdminButton>
      </AdminPageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Active Sponsored Adverts"
          value={adverts.length}
          hint="Live on /adverts marketplace"
          icon={Megaphone}
        />
        <StatCard
          label="Pinned to Homepage Top-6"
          value={adverts.filter((a) => a.featuredOnHome !== false).slice(0, 6).length}
          hint="Featured on homepage commercial workspace"
          icon={Pin}
        />
        <StatCard
          label="Monthly Ad Slot Revenue"
          value={`$${(adverts.length * 20).toLocaleString()}`}
          hint="At $20 USD / 30-day campaign slot"
          icon={CheckCircle2}
        />
      </div>

      <Panel padded={false}>
        <Toolbar>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search advert headline, business, or sector…"
          />
          <FilterSelect
            value={offerFilter}
            onChange={setOfferFilter}
            label="Filter by offer type"
            className="sm:w-52"
          >
            <option value="all">All Offer Types</option>
            <option value="Special Package">Special Package</option>
            <option value="Price Discount">Price Discount</option>
            <option value="Bulk / Wholesale">Bulk / Wholesale</option>
            <option value="Free Delivery">Free Delivery</option>
          </FilterSelect>
          <ResultCount shown={filtered.length} total={adverts.length} noun="adverts" />
        </Toolbar>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No sponsored adverts found"
            description="Try clearing your search filter or launch a new $20/mo promotional campaign."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e6eaf1] bg-[#f4f6f9]/80 text-xs font-semibold uppercase tracking-wider text-[#6b81a5]">
                  <th className="px-5 py-3 sm:px-6">Promotional Campaign</th>
                  <th className="px-4 py-3">Sponsoring Enterprise</th>
                  <th className="px-4 py-3">Promo Price</th>
                  <th className="px-4 py-3">Homepage Pin</th>
                  <th className="px-5 py-3 text-right sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6eaf1]">
                {filtered.map((ad) => (
                  <tr key={ad.id} className="transition-colors hover:bg-[#f4f6f9]/60">
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={ad.image}
                          alt={ad.headline}
                          className="h-11 w-14 shrink-0 rounded-xl object-cover border border-[#c8d2e0]"
                        />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1e57eb]">
                            {ad.promoBadge}
                          </span>
                          <p className="font-bold text-[#0a1018] line-clamp-1">{ad.headline}</p>
                          <p className="text-xs text-[#6b81a5]">
                            {ad.offerType} · {ad.validUntil}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[#1f2a3d]">{ad.businessName}</p>
                      <p className="text-xs text-[#6b81a5]">
                        {ad.province} · {ad.category}
                      </p>
                    </td>
                    <td className="px-4 py-4 font-mono">
                      {ad.promoPriceUSD ? (
                        <div>
                          <span className="font-bold text-[#0a1018]">${ad.promoPriceUSD}</span>
                          {ad.originalPriceUSD && (
                            <span className="ml-1.5 text-xs line-through text-[#6b81a5]">
                              ${ad.originalPriceUSD}
                            </span>
                          )}
                        </div>
                      ) : (
                        <AdminBadge tone="brand">Custom Quote</AdminBadge>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => togglePin(ad)}
                        className="cursor-pointer"
                      >
                        <AdminBadge tone={ad.featuredOnHome !== false ? 'signal' : 'neutral'} dot>
                          {ad.featuredOnHome !== false ? 'Pinned (Top 6)' : 'Standard Feed'}
                        </AdminBadge>
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right sm:px-6">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          icon={Pencil}
                          label="Edit Advert"
                          onClick={() => openEdit(ad)}
                        />
                        <IconButton
                          icon={Trash2}
                          label="Delete Advert"
                          tone="danger"
                          onClick={() => {
                            const next = adverts.filter((a) => a.id !== ad.id);
                            saveStoredAdverts(next);
                            setAdverts(next);
                            showToast(`Removed advert: ${ad.headline}`);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* 2XL Sponsored Advert Modal */}
      <AdminModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        size="2xl"
        title={editingId ? 'Edit Sponsored Advert Campaign' : 'Launch $20/mo Sponsored Advert'}
        description="Configure promotional headline, discount pricing, homepage placement, and banner photography."
      >
        <form onSubmit={handleSave} className="space-y-6 p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminInput
              label="Campaign Headline"
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              placeholder="e.g. 5kVA Deye Hybrid Solar Kit — Free Harare Installation"
              wrapClassName="sm:col-span-2"
              required
            />
            <AdminInput
              label="Sponsoring Business Name"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              required
            />
            <AdminInput
              label="Promo Ribbon Badge"
              value={form.promoBadge}
              onChange={(e) => setForm({ ...form, promoBadge: e.target.value })}
              placeholder="SAVE $200 THIS MONTH"
              required
            />
            <AdminSelect
              label="Offer Category"
              value={form.offerType}
              onChange={(e) =>
                setForm({ ...form, offerType: e.target.value as PaidAdvertItem['offerType'] })
              }
            >
              <option value="Special Package">Special Package</option>
              <option value="Price Discount">Price Discount</option>
              <option value="Bulk / Wholesale">Bulk / Wholesale</option>
              <option value="Free Delivery">Free Delivery</option>
            </AdminSelect>
            <AdminSelect
              label="Province"
              value={form.province}
              onChange={(e) => setForm({ ...form, province: e.target.value })}
            >
              {ZIMBABWE_PROVINCES.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </AdminSelect>
            <AdminInput
              label="Original Price (USD)"
              type="number"
              value={form.originalPriceUsd}
              onChange={(e) => setForm({ ...form, originalPriceUsd: e.target.value })}
            />
            <AdminInput
              label="Promotional Price (USD)"
              type="number"
              value={form.promoPriceUsd}
              onChange={(e) => setForm({ ...form, promoPriceUsd: e.target.value })}
            />
          </div>

          <AdminTextarea
            label="Detailed Offer Breakdown"
            rows={3}
            value={form.offerText}
            onChange={(e) => setForm({ ...form, offerText: e.target.value })}
            required
          />

          <ImageUploader
            label="Promotional Banner Image (Upload from Device)"
            multiple={false}
            images={form.images}
            onChange={(imgs) => setForm({ ...form, images: imgs })}
          />

          <label className="flex items-center justify-between rounded-xl border border-[#c8d2e0] bg-[#f4f6f9]/60 p-4 cursor-pointer">
            <div>
              <p className="text-sm font-bold text-[#0a1018]">Pin to Homepage Top-6 Showcase</p>
              <p className="text-xs text-[#6b81a5]">
                Display this campaign in the featured Sponsored Deals strip on the Homepage.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.pinnedToHome}
              onChange={(e) => setForm({ ...form, pinnedToHome: e.target.checked })}
              className="h-5 w-5 rounded border-[#c8d2e0] text-[#1e57eb]"
            />
          </label>

          <div className="flex justify-end gap-3 border-t border-[#e6eaf1] pt-6">
            <AdminButton type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit">
              {editingId ? 'Save Campaign Changes' : 'Publish Sponsored Advert'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
