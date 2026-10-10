'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Send,
  ExternalLink,
} from 'lucide-react';
import {
  AdminPageHeader,
  Panel,
  StatCard,
  IconButton,
  AdminBadge,
  statusTone,
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
import {
  ZIMBABWE_PROVINCES,
  BUSINESS_CATEGORIES,
  BusinessListing,
} from '@/lib/data/zimbabwe';
import {
  getStoredBusinesses,
  saveStoredBusinesses,
} from '@/data/platformStore';

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [query, setQuery] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingBiz, setDeletingBiz] = useState<BusinessListing | null>(null);

  const [form, setForm] = useState({
    name: '',
    categoryName: BUSINESS_CATEGORIES[0]?.name || 'Solar & Clean Energy',
    province: 'Harare',
    address: '',
    phone: '+263 77 ',
    whatsapp: '26377',
    email: '',
    description: '',
    services: 'Commercial Supply, Nationwide Delivery, Technical Support',
    openingHours: 'Mon - Sat: 08:00 - 17:00',
    subscriptionStatus: 'Month 1 Grace Period' as BusinessListing['subscriptionStatus'],
    graceDaysRemaining: '30',
    cr14Verified: true,
    featured: false,
    images: [] as GalleryItem[],
  });

  useEffect(() => {
    const sync = () => setBusinesses(getStoredBusinesses());
    sync();
    window.addEventListener('sadza-platform-updated', sync);
    return () => window.removeEventListener('sadza-platform-updated', sync);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return businesses.filter((b) => {
      const matchesQ =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.categoryName.toLowerCase().includes(q) ||
        b.province.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q);
      const matchesProv = provinceFilter === 'all' || b.province === provinceFilter;
      const matchesStatus = statusFilter === 'all' || b.subscriptionStatus === statusFilter;
      return matchesQ && matchesProv && matchesStatus;
    });
  }, [businesses, query, provinceFilter, statusFilter]);

  function openCreate() {
    setEditingId(null);
    setForm({
      name: '',
      categoryName: BUSINESS_CATEGORIES[0]?.name || 'Solar & Clean Energy',
      province: 'Harare',
      address: '',
      phone: '+263 77 ',
      whatsapp: '26377',
      email: '',
      description: '',
      services: 'Commercial Supply, Nationwide Delivery, Technical Support',
      openingHours: 'Mon - Sat: 08:00 - 17:00',
      subscriptionStatus: 'Month 1 Grace Period',
      graceDaysRemaining: '30',
      cr14Verified: true,
      featured: false,
      images: [
        {
          src: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
          caption: 'Enterprise Cover Photo',
        },
      ],
    });
    setFormOpen(true);
  }

  function openEdit(b: BusinessListing) {
    setEditingId(b.id);
    setForm({
      name: b.name,
      categoryName: b.categoryName,
      province: b.province,
      address: b.address,
      phone: b.phone,
      whatsapp: b.whatsapp,
      email: b.email || `info@${b.slug}.co.zw`,
      description: b.description,
      services: (b.services || []).join(', '),
      openingHours: b.openingHours || 'Mon - Sat: 08:00 - 17:00',
      subscriptionStatus: b.subscriptionStatus || 'Paid Subscriber',
      graceDaysRemaining: String(b.graceDaysRemaining ?? 30),
      cr14Verified: b.cr14Verified,
      featured: b.featured,
      images: b.image ? [{ src: b.image, caption: b.name }] : [],
    });
    setFormOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const catObj =
      BUSINESS_CATEGORIES.find((c) => c.name === form.categoryName) || BUSINESS_CATEGORIES[0];
    const coverImg =
      form.images[0]?.src ||
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80';
    const parsedServices = form.services
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingId) {
      const updated = businesses.map((b) =>
        b.id === editingId
          ? {
              ...b,
              name: form.name,
              categorySlug: catObj.slug,
              categoryName: catObj.name,
              province: form.province,
              city: form.province,
              address: form.address,
              phone: form.phone,
              whatsapp: form.whatsapp,
              email: form.email,
              description: form.description,
              services: parsedServices,
              openingHours: form.openingHours,
              subscriptionStatus: form.subscriptionStatus,
              graceDaysRemaining:
                form.subscriptionStatus === 'Month 1 Grace Period'
                  ? Math.max(1, Number(form.graceDaysRemaining) || 30)
                  : undefined,
              cr14Verified: form.cr14Verified,
              zimraVerified: form.cr14Verified,
              featured: form.featured,
              image: coverImg,
            }
          : b
      );
      saveStoredBusinesses(updated);
      setBusinesses(updated);
      showToast(`Updated enterprise profile for ${form.name}`);
    } else {
      const slug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const newBiz: BusinessListing = {
        id: `b-${Date.now()}`,
        slug: slug || `biz-${Date.now()}`,
        name: form.name,
        categorySlug: catObj.slug,
        categoryName: catObj.name,
        businessType: 'Registered Company (Pvt Ltd)',
        subscriptionStatus: form.subscriptionStatus,
        graceDaysRemaining:
          form.subscriptionStatus === 'Month 1 Grace Period'
            ? Math.max(1, Number(form.graceDaysRemaining) || 30)
            : undefined,
        rating: 4.9,
        reviewCount: 12,
        province: form.province,
        city: form.province,
        address: form.address,
        phone: form.phone,
        whatsapp: form.whatsapp,
        email: form.email,
        openingHours: form.openingHours,
        verifiedTier: 'tier2_corporate',
        cr14Verified: form.cr14Verified,
        zimraVerified: form.cr14Verified,
        featured: form.featured,
        image: coverImg,
        description: form.description,
        services: parsedServices,
        tags: parsedServices.slice(0, 3),
      };
      const updated = [newBiz, ...businesses];
      saveStoredBusinesses(updated);
      setBusinesses(updated);
      showToast(`Registered & verified ${form.name}`);
    }
    setFormOpen(false);
  }

  function toggleKyc(b: BusinessListing) {
    const nextVal = !b.cr14Verified;
    const updated = businesses.map((item) =>
      item.id === b.id ? { ...item, cr14Verified: nextVal, zimraVerified: nextVal } : item
    );
    saveStoredBusinesses(updated);
    setBusinesses(updated);
    showToast(
      `${b.name}: CR14 & ZIMRA KYC ${nextVal ? 'Approved (Verified)' : 'Marked Pending'}`
    );
  }

  function cycleSubscription(b: BusinessListing) {
    const nextStatus: BusinessListing['subscriptionStatus'] =
      b.subscriptionStatus === 'Paid Subscriber'
        ? 'Month 1 Grace Period'
        : b.subscriptionStatus === 'Month 1 Grace Period'
        ? 'Expired'
        : 'Paid Subscriber';
    const updated = businesses.map((item) =>
      item.id === b.id
        ? {
            ...item,
            subscriptionStatus: nextStatus,
            graceDaysRemaining: nextStatus === 'Month 1 Grace Period' ? 30 : undefined,
          }
        : item
    );
    saveStoredBusinesses(updated);
    setBusinesses(updated);
    showToast(`${b.name} billing status updated to "${nextStatus}"`);
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
        title="Businesses, CR14 KYC & 30-Day Grace Manager"
        description="Approve corporate CR14/ZIMRA documents, monitor the 1-month free onboarding grace period, and manage $10/month enterprise subscriptions."
      >
        <AdminButton onClick={openCreate}>
          <Plus className="h-4 w-4" /> Register Business
        </AdminButton>
      </AdminPageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Listed Enterprises"
          value={businesses.length}
          hint="Across all 10 provinces"
          icon={Building2}
        />
        <StatCard
          label="CR14 & ZIMRA Verified"
          value={businesses.filter((b) => b.cr14Verified).length}
          hint="Active green verification badge"
          icon={ShieldCheck}
        />
        <StatCard
          label="Paid Subscribers ($10/mo)"
          value={businesses.filter((b) => b.subscriptionStatus === 'Paid Subscriber').length}
          hint="Active recurring billing"
          icon={CheckCircle2}
        />
        <StatCard
          label="In 30-Day Free Grace"
          value={businesses.filter((b) => b.subscriptionStatus === 'Month 1 Grace Period').length}
          hint="Onboarding month active"
          icon={Clock}
        />
      </div>

      <Panel padded={false}>
        <Toolbar>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search business name, sector, or province…"
          />
          <FilterSelect
            value={provinceFilter}
            onChange={setProvinceFilter}
            label="Filter by province"
            className="sm:w-44"
          >
            <option value="all">All 10 Provinces</option>
            {ZIMBABWE_PROVINCES.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            label="Filter by billing status"
            className="sm:w-48"
          >
            <option value="all">All Billing States</option>
            <option value="Paid Subscriber">Paid Subscriber ($10/mo)</option>
            <option value="Month 1 Grace Period">Free 30-Day Grace</option>
            <option value="Expired">Grace Expired</option>
          </FilterSelect>
          <ResultCount shown={filtered.length} total={businesses.length} noun="businesses" />
        </Toolbar>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No businesses match filters"
            description="Try clearing your search or register a new enterprise."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e6eaf1] bg-[#f4f6f9]/80 text-xs font-semibold uppercase tracking-wider text-[#6b81a5]">
                  <th className="px-5 py-3 sm:px-6">Enterprise &amp; Sector</th>
                  <th className="px-4 py-3">Province</th>
                  <th className="px-4 py-3">CR14 / ZIMRA KYC</th>
                  <th className="px-4 py-3">Subscription &amp; Grace</th>
                  <th className="px-5 py-3 text-right sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6eaf1]">
                {filtered.map((b) => (
                  <tr key={b.id} className="transition-colors hover:bg-[#f4f6f9]/60">
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={b.image}
                          alt={b.name}
                          className="h-10 w-10 shrink-0 rounded-xl object-cover border border-[#c8d2e0]"
                        />
                        <div>
                          <p className="font-bold text-[#0a1018] flex items-center gap-2">
                            {b.name}
                            {b.featured && (
                              <AdminBadge tone="signal" dot>
                                Featured
                              </AdminBadge>
                            )}
                          </p>
                          <p className="text-xs text-[#465a7e]">
                            {b.categoryName} · {b.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-[#1f2a3d]">{b.province}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => toggleKyc(b)}
                        className="cursor-pointer"
                        title="Click to toggle CR14/ZIMRA KYC verification"
                      >
                        <AdminBadge tone={b.cr14Verified ? 'success' : 'warning'} dot>
                          {b.cr14Verified ? 'CR14 Verified' : 'Pending KYC'}
                        </AdminBadge>
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => cycleSubscription(b)}
                        className="cursor-pointer text-left"
                        title="Click to cycle billing status"
                      >
                        <AdminBadge tone={statusTone(b.subscriptionStatus || 'Paid Subscriber')} dot>
                          {b.subscriptionStatus || 'Paid Subscriber'}
                          {b.subscriptionStatus === 'Month 1 Grace Period' &&
                            b.graceDaysRemaining !== undefined &&
                            ` (${b.graceDaysRemaining}d left)`}
                        </AdminBadge>
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right sm:px-6">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          icon={Send}
                          label="Send Payment / Grace Notice"
                          tone="brand"
                          onClick={() =>
                            showToast(
                              `Dispatched $10/mo subscription reminder to ${b.name} (${b.phone})`
                            )
                          }
                        />
                        <IconButton
                          icon={ExternalLink}
                          label="View Storefront"
                          href={`/businesses/${b.slug}`}
                        />
                        <IconButton
                          icon={Pencil}
                          label="Edit Enterprise"
                          onClick={() => openEdit(b)}
                        />
                        <IconButton
                          icon={Trash2}
                          label="Delete Enterprise"
                          tone="danger"
                          onClick={() => setDeletingBiz(b)}
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

      {/* Ultra-Spacious 2XL Business Editor Modal */}
      <AdminModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        size="2xl"
        title={editingId ? 'Edit Enterprise Dossier & KYC' : 'Register New Verified Enterprise'}
        description="Configure corporate identity, clean provincial assignment, 30-day grace status, and cover photography."
      >
        <form onSubmit={handleSave} className="space-y-6 p-6 sm:p-8">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1e57eb]">
              1. Corporate Identity &amp; Provincial Location
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AdminInput
                label="Registered Business Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. SunPower Solar & Inverters Zimbabwe"
                required
              />
              <AdminSelect
                label="Commercial Sector"
                value={form.categoryName}
                onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
              >
                {BUSINESS_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </AdminSelect>
              <AdminSelect
                label="Province (Clean National Name)"
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
                label="Physical Depot / Office Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Stand / Street Address"
                required
              />
              <AdminInput
                label="Primary Telephone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
              <AdminInput
                label="WhatsApp Number (Digits Only)"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-[#e6eaf1] pt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1e57eb]">
              2. Subscription, 30-Day Grace &amp; KYC Verification
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <AdminSelect
                label="Subscription Tier"
                value={form.subscriptionStatus}
                onChange={(e) =>
                  setForm({
                    ...form,
                    subscriptionStatus: e.target.value as BusinessListing['subscriptionStatus'],
                  })
                }
              >
                <option value="Paid Subscriber">Paid Subscriber ($10/mo)</option>
                <option value="Month 1 Grace Period">Free 30-Day Grace Period</option>
                <option value="Expired">Grace Expired</option>
              </AdminSelect>
              <AdminInput
                label="Grace Days Remaining"
                type="number"
                min={0}
                max={60}
                value={form.graceDaysRemaining}
                onChange={(e) => setForm({ ...form, graceDaysRemaining: e.target.value })}
              />
              <AdminInput
                label="Opening Hours"
                value={form.openingHours}
                onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
              />
            </div>

            <AdminTextarea
              label="Company Overview & Capabilities"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />

            <AdminInput
              label="Core Services & Supplies (Comma-separated)"
              value={form.services}
              onChange={(e) => setForm({ ...form, services: e.target.value })}
            />
          </div>

          <div className="space-y-4 border-t border-[#e6eaf1] pt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1e57eb]">
              3. Storefront Cover Photography (Upload from Device)
            </h4>
            <ImageUploader
              label="Select Enterprise Cover Image"
              multiple={false}
              images={form.images}
              onChange={(imgs) => setForm({ ...form, images: imgs })}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex items-center justify-between rounded-xl border border-[#c8d2e0] bg-[#f4f6f9]/60 p-4 cursor-pointer">
              <div>
                <p className="text-sm font-bold text-[#0a1018]">CR14 &amp; ZIMRA Verified</p>
                <p className="text-xs text-[#6b81a5]">Display official green KYC badge</p>
              </div>
              <input
                type="checkbox"
                checked={form.cr14Verified}
                onChange={(e) => setForm({ ...form, cr14Verified: e.target.checked })}
                className="h-5 w-5 rounded border-[#c8d2e0] text-[#1e57eb]"
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-[#c8d2e0] bg-[#f4f6f9]/60 p-4 cursor-pointer">
              <div>
                <p className="text-sm font-bold text-[#0a1018]">Featured Enterprise</p>
                <p className="text-xs text-[#6b81a5]">Highlight on homepage directory</p>
              </div>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="h-5 w-5 rounded border-[#c8d2e0] text-[#1e57eb]"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#e6eaf1] pt-6">
            <AdminButton type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit">
              {editingId ? 'Save Enterprise Changes' : 'Register Enterprise'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* Delete Modal */}
      <AdminModal
        open={Boolean(deletingBiz)}
        onClose={() => setDeletingBiz(null)}
        title="Remove Enterprise from Directory?"
        size="sm"
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-[#374966]">
            This will permanently remove{' '}
            <strong className="text-[#0a1018]">{deletingBiz?.name}</strong> from the directory.
          </p>
          <div className="flex justify-end gap-2">
            <AdminButton variant="outline" onClick={() => setDeletingBiz(null)}>
              Cancel
            </AdminButton>
            <AdminButton
              variant="danger"
              onClick={() => {
                if (deletingBiz) {
                  const next = businesses.filter((b) => b.id !== deletingBiz.id);
                  saveStoredBusinesses(next);
                  setBusinesses(next);
                  showToast(`Removed ${deletingBiz.name}`);
                  setDeletingBiz(null);
                }
              }}
            >
              Delete Business
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
