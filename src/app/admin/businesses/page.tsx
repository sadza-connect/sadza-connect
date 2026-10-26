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
  FileText,
  FileCheck,
  Eye,
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
  TableSkeleton,
  ModalBody,
  ModalSection,
  ModalGrid,
  ModalFooter,
  ModalToggle,
  ConfirmModal,
  AdminPasswordConfirmationModal,
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
  getPlatformSettings,
  PlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
} from '@/data/platformStore';
import { mapDbBusinessToListing } from '@/lib/data/business-mapper';

export function getEffectiveBusinessPrice(b: BusinessListing, st: PlatformSettings) {
  if (b.customMonthlyPriceUsd !== undefined && b.customMonthlyPriceUsd !== null) {
    return {
      price: b.customMonthlyPriceUsd,
      isCustom: true,
      label: `$${b.customMonthlyPriceUsd.toFixed(2)}/mo (Admin Custom)`,
    };
  }
  const track = b.onboardingTrack || 'registered_entity';
  if (track === 'owner_operated') {
    const p = st.soloMonthlyPriceUsd ?? 5;
    return { price: p, isCustom: false, label: `$${p.toFixed(2)}/mo (Track B Solo)` };
  }
  if (track === 'association_institutional') {
    const p = st.coopMonthlyPriceUsd ?? 10;
    return { price: p, isCustom: false, label: `$${p.toFixed(2)}/mo (Track C Coop)` };
  }
  const p = st.corporateMonthlyPriceUsd ?? st.monthlySubscriptionPriceUsd ?? 15;
  return { price: p, isCustom: false, label: `$${p.toFixed(2)}/mo (Track A Corporate)` };
}

export default function AdminBusinessesPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [query, setQuery] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [trackFilter, setTrackFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingBiz, setDeletingBiz] = useState<BusinessListing | null>(null);
  const [reviewingKycBiz, setReviewingKycBiz] = useState<BusinessListing | null>(null);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sadza_access_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const [form, setForm] = useState({
    name: '',
    categoryName: BUSINESS_CATEGORIES[0]?.name || 'Solar & Clean Energy',
    province: 'Harare',
    address: '',
    phone: '+263 77 ',
    whatsapp: '26377',
    email: '',
    description: '',
    services: '',
    openingHours: 'Mon - Sat: 08:00 - 17:00',
    subscriptionStatus: 'Month 1 Grace Period' as BusinessListing['subscriptionStatus'],
    graceDaysRemaining: '30',
    customMonthlyPriceUsd: '',
    catalogTier: 'starter',
    customProductLimit: '',
    cr14Verified: false,
    featured: false,
    images: [] as GalleryItem[],
  });

  useEffect(() => {
    let isMounted = true;
    async function loadAdminBusinesses() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/v1/businesses?limit=100&include_expired=true', {
          headers: getAuthHeaders(),
          credentials: 'include',
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.businesses)) {
          if (isMounted) {
            const mapped = json.data.businesses.map(mapDbBusinessToListing);
            setBusinesses(mapped);
          }
        }
      } catch (err) {
        console.warn('Failed to load businesses from database:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAdminBusinesses();

    const sync = () => {
      loadAdminBusinesses();
    };
    window.addEventListener('sadza-platform-updated', sync);
    return () => {
      isMounted = false;
      window.removeEventListener('sadza-platform-updated', sync);
    };
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
      const matchesTrack =
        trackFilter === 'all' ||
        b.onboardingTrack === trackFilter ||
        (!b.onboardingTrack && trackFilter === 'registered_entity');
      return matchesQ && matchesProv && matchesStatus && matchesTrack;
    });
  }, [businesses, query, provinceFilter, statusFilter, trackFilter]);

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
      services: '',
      openingHours: 'Mon - Sat: 08:00 - 17:00',
      subscriptionStatus: 'Month 1 Grace Period',
      graceDaysRemaining: '30',
      customMonthlyPriceUsd: '',
      catalogTier: 'starter',
      customProductLimit: '',
      cr14Verified: false,
      featured: false,
      images: [],
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
      email: b.email || '',
      description: b.description,
      services: (b.services || []).join(', '),
      openingHours: b.openingHours || 'Mon - Sat: 08:00 - 17:00',
      subscriptionStatus: b.subscriptionStatus || 'Paid Subscriber',
      graceDaysRemaining: String(b.graceDaysRemaining ?? 30),
      customMonthlyPriceUsd:
        b.customMonthlyPriceUsd !== undefined && b.customMonthlyPriceUsd !== null
          ? String(b.customMonthlyPriceUsd)
          : '',
      catalogTier: b.catalogTier || 'starter',
      customProductLimit:
        b.customProductLimit !== undefined && b.customProductLimit !== null
          ? String(b.customProductLimit)
          : '',
      cr14Verified: b.cr14Verified,
      featured: b.featured,
      images: b.image ? [{ src: b.image, caption: b.name }] : [],
    });
    setFormOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const catObj =
      BUSINESS_CATEGORIES.find((c) => c.name === form.categoryName) || BUSINESS_CATEGORIES[0];
    const coverImg = form.images[0]?.src || '';
    const parsedServices = form.services
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const customPriceNum =
      form.customMonthlyPriceUsd.trim() !== ''
        ? Math.max(0, parseFloat(form.customMonthlyPriceUsd))
        : null;

    const customLimitNum =
      form.customProductLimit.trim() !== ''
        ? Math.max(1, parseInt(form.customProductLimit, 10))
        : null;

    if (editingId) {
      const existing = businesses.find((b) => b.id === editingId);
      if (existing) {
        try {
          const res = await fetch(`/api/v1/businesses/${encodeURIComponent(existing.slug)}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify({
              description: form.description,
              province: form.province,
              address: form.address,
              sector: catObj.name,
              whatsapp: form.whatsapp,
              cover_url: coverImg,
              logo_url: coverImg,
              is_featured: form.featured,
              custom_monthly_price_usd: customPriceNum,
              catalog_tier: form.catalogTier,
              custom_product_limit: customLimitNum,
              is_verified: form.cr14Verified,
              verification_status: form.cr14Verified ? 'Verified' : 'Pending',
            }),
          });
          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.error?.message || json.message || 'Failed to update business in database');
          }
        } catch (err: any) {
          console.error('Failed to update business in database:', err);
          showToast(`Error: ${err.message || 'Database update failed'}`);
          return;
        }
      }

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
              customMonthlyPriceUsd: customPriceNum,
              catalogTier: form.catalogTier,
              customProductLimit: customLimitNum,
              productLimit:
                customLimitNum ??
                (form.catalogTier === 'enterprise' ? 300 : form.catalogTier === 'growth' ? 100 : 25),
              cr14Verified: form.cr14Verified,
              zimraVerified: form.cr14Verified,
              verificationStatus: form.cr14Verified ? 'Verified' : 'Pending',
              verificationBadge: form.cr14Verified
                ? ((b.businessType || '').includes('Sole') || (b.businessType || '').includes('Artisan') || (b.businessType || '').includes('Owner') || b.onboardingTrack === 'owner_operated'
                    ? 'Verified Owner-Operated Business (National ID)'
                    : (b.businessType || '').includes('Cooperative')
                    ? 'Verified Cooperative'
                    : 'Verified Registered Company')
                : undefined,
              verifiedTier: (form.cr14Verified
                ? ((b.businessType || '').includes('Sole') || (b.businessType || '').includes('Artisan') || (b.businessType || '').includes('Owner') || b.onboardingTrack === 'owner_operated'
                    ? 'tier1_artisan'
                    : 'tier2_corporate')
                : 'unverified') as BusinessListing['verifiedTier'],
              featured: form.featured,
              image: coverImg,
            }
          : b
      );
      saveStoredBusinesses(updated);
      setBusinesses(updated);
      showToast(`Updated enterprise profile for ${form.name}`);
    } else {
      try {
        const res = await fetch('/api/v1/businesses', {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({
            name: form.name,
            province: form.province,
            address: form.address,
            sector: catObj.name,
            phone: form.phone,
            whatsapp: form.whatsapp,
            email: form.email,
            description: form.description,
            cover_url: coverImg,
            logo_url: coverImg,
            custom_monthly_price_usd: customPriceNum,
            catalog_tier: form.catalogTier,
            custom_product_limit: customLimitNum,
            is_verified: form.cr14Verified,
            verification_status: form.cr14Verified ? 'Verified' : 'Pending',
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || json.message || 'Failed to create business in database');
        }
      } catch (err: any) {
        console.error('Failed to create business in database:', err);
        showToast(`Error: ${err.message || 'Database creation failed'}`);
        return;
      }

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
        customMonthlyPriceUsd: customPriceNum,
        catalogTier: form.catalogTier,
        customProductLimit: customLimitNum,
        productLimit:
          customLimitNum ??
          (form.catalogTier === 'enterprise' ? 300 : form.catalogTier === 'growth' ? 100 : 25),
        rating: 0,
        reviewCount: 0,
        province: form.province,
        city: form.province,
        address: form.address,
        phone: form.phone,
        whatsapp: form.whatsapp,
        email: form.email,
        openingHours: form.openingHours,
        verifiedTier: (form.cr14Verified ? 'tier2_corporate' : 'unverified') as BusinessListing['verifiedTier'],
        verificationStatus: form.cr14Verified ? 'Verified' : 'Pending',
        verificationBadge: form.cr14Verified ? 'Verified Registered Company' : undefined,
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
      showToast(`Registered ${form.name}`);
    }
    setFormOpen(false);
  }

  async function toggleKyc(b: BusinessListing) {
    const nextVal = !b.cr14Verified;
    const nextStatus = nextVal ? 'Verified' : 'Pending';

    try {
      const res = await fetch(`/api/v1/businesses/${encodeURIComponent(b.slug)}/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.message || 'Verification update failed');
      }
    } catch (err: any) {
      console.error('Failed to update KYC in database:', err);
      showToast(`Error: ${err.message || 'Verification update failed'}`);
      return;
    }

    const isTrackB =
      b.onboardingTrack === 'owner_operated' ||
      b.verifiedTier === 'tier1_artisan' ||
      (b.businessType || '').toLowerCase().includes('owner') ||
      (b.businessType || '').toLowerCase().includes('sole') ||
      (b.businessType || '').toLowerCase().includes('artisan') ||
      (b.businessType || '').toLowerCase().includes('informal');

    const badge = nextVal
      ? (b.verificationBadge && !b.verificationBadge.includes('Corporate') && !b.verificationBadge.includes('Registered Company')
          ? b.verificationBadge
          : isTrackB
          ? 'Verified Owner-Operated Business (National ID)'
          : 'Verified Registered Company')
      : undefined;

    const tier = (nextVal ? (isTrackB ? 'tier1_artisan' : 'tier2_corporate') : 'unverified') as BusinessListing['verifiedTier'];

    const updated = businesses.map((item) =>
      item.id === b.id
        ? {
            ...item,
            cr14Verified: nextVal,
            zimraVerified: nextVal,
            verificationStatus: nextStatus,
            verificationBadge: badge,
            verifiedTier: tier,
          }
        : item
    );
    saveStoredBusinesses(updated);
    setBusinesses(updated);
    showToast(
      `${b.name}: Statutory KYC ${nextVal ? 'Approved & Verified' : 'Marked Pending'}`
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
          label="Statutory Verified"
          value={businesses.filter((b) => b.cr14Verified).length}
          hint="CR14 or National ID verified"
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
            value={trackFilter}
            onChange={setTrackFilter}
            label="Filter by legal track"
            className="sm:w-52"
          >
            <option value="all">All Legal Tracks</option>
            <option value="registered_entity">Track A: Registered Company / PBC</option>
            <option value="owner_operated">Track B: Owner-Operated / Informal</option>
            <option value="association_institutional">Track C: Cooperative / Trust / Church</option>
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

        {isLoading ? (
          <TableSkeleton columns={6} rows={6} />
        ) : filtered.length === 0 ? (
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
                  <th className="px-4 py-3">Legal Track &amp; KYC Badge</th>
                  <th className="px-4 py-3">Subscription &amp; Grace</th>
                  <th className="px-4 py-3">Monthly Rate</th>
                  <th className="px-4 py-3">Catalog Quota</th>
                  <th className="px-5 py-3 text-right sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6eaf1]">
                {filtered.map((b) => {
                  const rateInfo = getEffectiveBusinessPrice(b, settings);
                  return (
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
                      <div className="space-y-1">
                        <div>
                          {b.onboardingTrack === 'registered_entity' ? (
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              Track A: Registered
                            </span>
                          ) : b.onboardingTrack === 'owner_operated' ? (
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              Track B: Owner-Operated
                            </span>
                          ) : b.onboardingTrack === 'association_institutional' ? (
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                              Track C: Institution / NGO
                            </span>
                          ) : (
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {b.businessType}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleKyc(b)}
                            className="cursor-pointer text-left block"
                            title="Click to toggle KYC verification status"
                          >
                            <AdminBadge tone={b.cr14Verified ? 'success' : 'warning'} dot>
                              {b.cr14Verified
                                ? b.verificationBadge || 'Verified'
                                : 'Pending Review'}
                            </AdminBadge>
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewingKycBiz(b)}
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                              b.kycDocuments && b.kycDocuments.length > 0
                                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                            title="Review submitted statutory documents"
                          >
                            <FileText className="w-3 h-3" />
                            <span>
                              {b.kycDocuments && b.kycDocuments.length > 0
                                ? `${b.kycDocuments.length} doc${b.kycDocuments.length === 1 ? '' : 's'}`
                                : 'Docs'}
                            </span>
                          </button>
                        </div>
                      </div>
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
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 text-sm">
                          ${rateInfo.price.toFixed(2)}
                          <span className="text-[11px] font-normal text-slate-500"> /mo</span>
                        </div>
                        <div>
                          <span
                            className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              rateInfo.isCustom
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {rateInfo.isCustom ? '★ Admin Custom' : 'Track Default'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-800 capitalize">
                          {b.catalogTier || 'starter'} Tier
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {b.customProductLimit ? (
                            <span className="font-semibold text-purple-700">Custom {b.customProductLimit} max</span>
                          ) : (
                            <span>Limit: {b.productLimit || (b.catalogTier === 'enterprise' ? 300 : b.catalogTier === 'growth' ? 100 : 25)} max</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right sm:px-6">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          icon={Send}
                          label="Send Payment / Grace Notice"
                          tone="brand"
                          onClick={() =>
                            showToast(
                              `Dispatched $${rateInfo.price.toFixed(2)}/mo subscription reminder to ${b.name} (${b.phone})`
                            )
                          }
                        />
                        <IconButton
                          icon={ExternalLink}
                          label="View Storefront"
                          href={`/businesses/${b.slug}`}
                        />
                        <IconButton
                          icon={FileCheck}
                          label="Review KYC Documents"
                          tone="brand"
                          onClick={() => setReviewingKycBiz(b)}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Business editor */}
      <AdminModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        size="xl"
        icon={editingId ? Pencil : Building2}
        title={editingId ? 'Edit business' : 'Register a business'}
        description="Business details, billing status and cover photo."
      >
        <form onSubmit={handleSave}>
          <ModalBody>
            <ModalSection title="Business details">
              <ModalGrid>
                <AdminInput
                  label="Business name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. SunPower Solar Zimbabwe"
                  required
                  wrapClassName="sm:col-span-2"
                />
                <AdminSelect
                  label="Category"
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
                  label="Street address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Stand / street address"
                  required
                  wrapClassName="sm:col-span-2"
                />
                <AdminInput
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
                <AdminInput
                  label="WhatsApp"
                  type="tel"
                  inputMode="numeric"
                  hint="Digits only, e.g. 263771234567"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  required
                />
                <AdminInput
                  label="Opening hours"
                  value={form.openingHours}
                  onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
                  wrapClassName="sm:col-span-2"
                />
              </ModalGrid>
              <AdminTextarea
                label="About the business"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
              <AdminInput
                label="Services"
                hint="Separate with commas"
                value={form.services}
                onChange={(e) => setForm({ ...form, services: e.target.value })}
              />
            </ModalSection>

            <ModalSection
              title="Subscription & Commercial Rates"
              description="Monthly subscription fees are determined by Admin. Leave custom price blank to use the legal track default, or set a custom rate for this business."
            >
              <ModalGrid>
                <AdminSelect
                  label="Subscription Status"
                  value={form.subscriptionStatus}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      subscriptionStatus: e.target.value as BusinessListing['subscriptionStatus'],
                    })
                  }
                >
                  <option value="Paid Subscriber">Paid subscriber</option>
                  <option value="Month 1 Grace Period">Free grace period</option>
                  <option value="Expired">Expired</option>
                </AdminSelect>
                {form.subscriptionStatus === 'Month 1 Grace Period' && (
                  <AdminInput
                    label="Grace days left"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={60}
                    value={form.graceDaysRemaining}
                    onChange={(e) => setForm({ ...form, graceDaysRemaining: e.target.value })}
                  />
                )}
                <AdminInput
                  label="Admin Custom Monthly Price ($ USD / mo)"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 8.00 (leave empty for track default)"
                  hint="Determined by Admin. Overrides the legal track default rate."
                  value={form.customMonthlyPriceUsd}
                  onChange={(e) => setForm({ ...form, customMonthlyPriceUsd: e.target.value })}
                  wrapClassName="sm:col-span-2"
                />
                <AdminSelect
                  label="Catalog Storefront Tier"
                  value={form.catalogTier}
                  onChange={(e) => setForm({ ...form, catalogTier: e.target.value })}
                >
                  <option value="starter">Starter Storefront (Default 25 products)</option>
                  <option value="growth">Growth Storefront (Default 100 products)</option>
                  <option value="enterprise">Enterprise Wholesaler (Default 300 products)</option>
                </AdminSelect>
                <AdminInput
                  label="Admin Custom Product Limit Override"
                  type="number"
                  min={1}
                  placeholder="e.g. 500 (leave empty for tier default)"
                  hint="Determined by Admin. Overrides platform tier product quota for bespoke partners."
                  value={form.customProductLimit}
                  onChange={(e) => setForm({ ...form, customProductLimit: e.target.value })}
                />
              </ModalGrid>
            </ModalSection>

            <ModalSection title="Cover photo">
              <ImageUploader
                label="Upload a cover image"
                multiple={false}
                images={form.images}
                onChange={(imgs) => setForm({ ...form, images: imgs })}
              />
            </ModalSection>

            <ModalSection title="Visibility">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ModalToggle
                  label="Statutory KYC Verified"
                  description="Awards verified badge according to declared legal track"
                  checked={form.cr14Verified}
                  onChange={(v) => setForm({ ...form, cr14Verified: v })}
                />
                <ModalToggle
                  label="Featured"
                  description="Highlight on the homepage"
                  checked={form.featured}
                  onChange={(v) => setForm({ ...form, featured: v })}
                />
              </div>
            </ModalSection>
          </ModalBody>

          <ModalFooter>
            <AdminButton type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit">{editingId ? 'Save changes' : 'Register business'}</AdminButton>
          </ModalFooter>
        </form>
      </AdminModal>

      <AdminPasswordConfirmationModal
        open={Boolean(deletingBiz)}
        onClose={() => setDeletingBiz(null)}
        title={deletingBiz ? `Delete Enterprise: ${deletingBiz.name}` : 'Delete Business'}
        description={
          <>
            <strong className="text-[#0a1018]">{deletingBiz?.name}</strong> will be removed from the
            directory along with its storefront listings and enquiry links. This action cannot be undone.
          </>
        }
        confirmLabel="Authorize & Delete"
        actionType="danger"
        onConfirm={async (password: string) => {
          if (!deletingBiz) return;
          const token = typeof window !== 'undefined' ? localStorage.getItem('sadza_access_token') : null;
          const vRes = await fetch('/api/v1/auth/verify-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: 'include',
            body: JSON.stringify({ password }),
          });
          const vJson = await vRes.json();
          if (!vRes.ok) {
            throw new Error(vJson.error?.message || vJson.message || 'Invalid administrator credentials');
          }

          try {
            await fetch(`/api/v1/businesses/${encodeURIComponent(deletingBiz.slug)}`, {
              method: 'DELETE',
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              credentials: 'include',
            });
          } catch (err) {
            console.error('Failed to delete business from database:', err);
          }
          const next = businesses.filter((b) => b.id !== deletingBiz.id);
          saveStoredBusinesses(next);
          setBusinesses(next);
          showToast(`Removed ${deletingBiz.name}`);
          setDeletingBiz(null);
        }}
      />

      {/* KYC Documents Review Modal */}
      <AdminModal
        open={Boolean(reviewingKycBiz)}
        onClose={() => setReviewingKycBiz(null)}
        title={reviewingKycBiz ? `KYC Compliance Review: ${reviewingKycBiz.name}` : 'KYC Review'}
        description={
          reviewingKycBiz
            ? `${reviewingKycBiz.legalForm || reviewingKycBiz.businessType} • Reg No: ${
                reviewingKycBiz.registrationNumber || 'Not provided'
              }`
            : ''
        }
        size="lg"
      >
        <ModalBody>
          <ModalSection title="Uploaded Statutory Documents">
            {!reviewingKycBiz?.kycDocuments || reviewingKycBiz.kycDocuments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-slate-50 dark:bg-slate-900/50">
                <FileText className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No Compliance Documents Uploaded
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  The merchant has not uploaded compliance documents (such as National ID, CR14, or trade permits) yet. They can attach them in their merchant dashboard.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviewingKycBiz.kycDocuments.map((doc: any, idx: number) => {
                  const docTitle =
                    doc.docType === 'owner_national_id'
                      ? 'Owner National ID (Metal/Plastic) or Passport'
                      : doc.docType === 'proof_of_location'
                      ? 'Proof of Operating Location / Permit'
                      : doc.docType === 'storefront_photo'
                      ? 'Storefront / Workshop / Trade Photo'
                      : doc.docType === 'cr6_cr14'
                      ? 'Form CR6 (or CR14) — Register of Directors'
                      : doc.docType === 'tax_clearance'
                      ? 'ZIMRA Tax Clearance Certificate (ITF263)'
                      : doc.docType === 'director_id'
                      ? 'Director National ID / Passport'
                      : doc.docType === 'trust_deed'
                      ? 'Notarial Trust Deed / Constitution'
                      : doc.title || doc.name || `Document #${idx + 1}`;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {docTitle}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-slate-600 dark:text-slate-400">
                              {doc.name || 'document.pdf'}
                            </span>
                            {doc.size && <span>• {doc.size}</span>}
                            {doc.storageType && (
                              <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {doc.storageType}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {doc.url ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors shrink-0"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Inspect File</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No URL available</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ModalSection>

          <ModalSection title="Verification Status">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Current Status: {reviewingKycBiz?.cr14Verified ? 'Approved & Verified' : 'Pending Review'}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Approving verification grants the enterprise a Verified Trust Badge across directory search results.
                </p>
              </div>
              <div>
                <AdminBadge tone={reviewingKycBiz?.cr14Verified ? 'success' : 'warning'} dot>
                  {reviewingKycBiz?.cr14Verified
                    ? (reviewingKycBiz.verificationBadge || (reviewingKycBiz.verifiedTier === 'tier1_artisan' ? 'Identity Verified (National ID)' : 'Verified Company'))
                    : 'Pending'}
                </AdminBadge>
              </div>
            </div>
          </ModalSection>
        </ModalBody>

        <ModalFooter>
          <AdminButton variant="outline" onClick={() => setReviewingKycBiz(null)}>
            Close
          </AdminButton>

          {reviewingKycBiz && (
            <AdminButton
              variant={reviewingKycBiz.cr14Verified ? 'danger' : 'primary'}
              onClick={async () => {
                await toggleKyc(reviewingKycBiz);
                setReviewingKycBiz((prev) => (prev ? { ...prev, cr14Verified: !prev.cr14Verified } : null));
              }}
            >
              {reviewingKycBiz.cr14Verified ? 'Revoke Verification' : 'Approve & Verify Business'}
            </AdminButton>
          )}
        </ModalFooter>
      </AdminModal>
    </div>
  );
}
