'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Unlock,
  ExternalLink,
  Star,
  MapPin,
  Home,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
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
  TableSkeleton,
  ModalBody,
  ModalSection,
  ModalGrid,
  ModalFooter,
  ModalToggle,
  ConfirmModal,
} from '@/components/admin/AdminUI';
import { ImageUploader, GalleryItem } from '@/components/admin/ImageUploader';
import { ZIMBABWE_PROVINCES } from '@/lib/data/zimbabwe';
import {
  PropertyListing,
  PROPERTY_TYPES,
  PROPERTY_CATEGORIES,
  getStoredProperties,
  saveStoredProperty,
  deleteStoredProperty,
  togglePropertyOccupancy,
  togglePropertyVerification,
  togglePropertyFeatured,
  getUnlockedContacts,
} from '@/data/propertiesStore';
import { cn } from '@/lib/utils/cn';

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [unlockedCount, setUnlockedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [occupancyFilter, setOccupancyFilter] = useState('All');
  const [provinceFilter, setProvinceFilter] = useState('All');
  const [toast, setToast] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<PropertyListing | null>(null);

  const [form, setForm] = useState({
    title: '',
    propertyType: 'Residential Rent' as PropertyListing['propertyType'],
    category: 'House' as PropertyListing['category'],
    province: 'Harare',
    city: 'Harare',
    suburb: '',
    priceUSD: '',
    pricePeriod: 'per_month' as PropertyListing['pricePeriod'],
    bedrooms: '3',
    bathrooms: '2',
    description: '',
    features: 'Borehole, 5kVA Solar, Walled & Gated',
    advertiserName: '',
    advertiserType: 'Direct Landlord' as PropertyListing['advertiserType'],
    phone: '',
    whatsapp: '',
    isVerified: true,
    isFeatured: false,
    occupancyStatus: 'Available' as 'Available' | 'Taken',
    images: [] as GalleryItem[],
  });

  const loadData = () => {
    try {
      const items = getStoredProperties();
      setProperties(items);
      const unlocked = getUnlockedContacts();
      setUnlockedCount(Object.keys(unlocked).length);
    } catch {
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('sadza-properties-updated', handleUpdate);
    window.addEventListener('sadza-unlocked-updated', handleUpdate);
    return () => {
      window.removeEventListener('sadza-properties-updated', handleUpdate);
      window.removeEventListener('sadza-unlocked-updated', handleUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (typeFilter !== 'All' && p.propertyType !== typeFilter) return false;
      if (occupancyFilter !== 'All') {
        const isOccupied = p.occupancyStatus === 'Occupied' || p.occupancyStatus === 'Taken' || p.isOccupied;
        if (occupancyFilter === 'Available' && isOccupied) return false;
        if (occupancyFilter === 'Occupied' && !isOccupied) return false;
      }
      if (provinceFilter !== 'All' && p.province.toLowerCase() !== provinceFilter.toLowerCase()) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.suburb.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.advertiserName.toLowerCase().includes(q)
      );
    });
  }, [properties, query, typeFilter, occupancyFilter, provinceFilter]);

  // Statistics
  const totalCount = properties.length;
  const rentalsCount = properties.filter((p) => p.propertyType.includes('Rent') || p.propertyType.includes('Student')).length;
  const salesCount = properties.filter((p) => p.propertyType.includes('Sale') || p.propertyType.includes('Stands')).length;
  const availableCount = properties.filter((p) => !(p.occupancyStatus === 'Occupied' || p.occupancyStatus === 'Taken' || p.isOccupied)).length;

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      title: '',
      propertyType: 'Residential Rent',
      category: 'House',
      province: 'Harare',
      city: 'Harare',
      suburb: '',
      priceUSD: '',
      pricePeriod: 'per_month',
      bedrooms: '3',
      bathrooms: '2',
      description: '',
      features: 'Borehole, 5kVA Solar, Walled & Gated',
      advertiserName: '',
      advertiserType: 'Direct Landlord',
      phone: '+263 ',
      whatsapp: '263',
      isVerified: true,
      isFeatured: false,
      occupancyStatus: 'Available',
      images: [],
    });
    setFormOpen(true);
  };

  const openEditModal = (p: PropertyListing) => {
    setEditingId(p.id);
    const galleryImages: GalleryItem[] = (p.images || []).map((url) => ({
      src: url,
      caption: '',
    }));

    setForm({
      title: p.title,
      propertyType: p.propertyType,
      category: p.category,
      province: p.province,
      city: p.city,
      suburb: p.suburb,
      priceUSD: String(p.priceUSD || ''),
      pricePeriod: p.pricePeriod || 'per_month',
      bedrooms: String(p.bedrooms ?? ''),
      bathrooms: String(p.bathrooms ?? ''),
      description: p.description || '',
      features: (p.features || []).join(', '),
      advertiserName: p.advertiserName,
      advertiserType: p.advertiserType,
      phone: p.phone,
      whatsapp: p.whatsapp,
      isVerified: Boolean(p.isVerified),
      isFeatured: Boolean(p.isFeatured),
      occupancyStatus: (p.occupancyStatus === 'Occupied' || p.occupancyStatus === 'Taken' || p.isOccupied) ? 'Taken' : 'Available',
      images: galleryImages,
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.priceUSD.trim() || !form.suburb.trim()) {
      showToast('Please fill in title, suburb, and price.');
      return;
    }

    const priceNum = parseFloat(form.priceUSD) || 0;
    const feats = form.features
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    const imageUrls = form.images.length > 0
      ? form.images.map((img) => img.src)
      : ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'];

    const isOccupiedBool = form.occupancyStatus === 'Taken';

    const slug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (editingId) {
      const existing = properties.find((p) => p.id === editingId);
      const updated: PropertyListing = {
        id: editingId,
        title: form.title.trim(),
        slug: existing?.slug || `${slug}-${Date.now().toString(36)}`,
        propertyType: form.propertyType,
        category: form.category,
        province: form.province,
        city: form.city.trim(),
        suburb: form.suburb.trim(),
        priceUSD: priceNum,
        pricePeriod: form.pricePeriod,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms, 10) : undefined,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms, 10) : undefined,
        features: feats,
        description: form.description.trim(),
        images: imageUrls,
        advertiserName: form.advertiserName.trim() || 'Verified Landlord',
        advertiserType: form.advertiserType,
        isVerified: form.isVerified,
        whatsapp: form.whatsapp.trim().replace(/[^0-9]/g, ''),
        phone: form.phone.trim(),
        postedAt: existing?.postedAt || 'Just updated',
        isFeatured: form.isFeatured,
        occupancyStatus: isOccupiedBool ? 'Taken' : 'Available',
        isOccupied: isOccupiedBool,
      };
      saveStoredProperty(updated);
      showToast('Property updated successfully.');
    } else {
      const newProperty: PropertyListing = {
        id: `prop-${Date.now()}`,
        title: form.title.trim(),
        slug: `${slug}-${Date.now().toString(36)}`,
        propertyType: form.propertyType,
        category: form.category,
        province: form.province,
        city: form.city.trim(),
        suburb: form.suburb.trim(),
        priceUSD: priceNum,
        pricePeriod: form.pricePeriod,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms, 10) : undefined,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms, 10) : undefined,
        features: feats,
        description: form.description.trim(),
        images: imageUrls,
        advertiserName: form.advertiserName.trim() || 'Verified Landlord',
        advertiserType: form.advertiserType,
        isVerified: form.isVerified,
        whatsapp: form.whatsapp.trim().replace(/[^0-9]/g, ''),
        phone: form.phone.trim(),
        postedAt: 'Just posted',
        isFeatured: form.isFeatured,
        occupancyStatus: isOccupiedBool ? 'Taken' : 'Available',
        isOccupied: isOccupiedBool,
      };
      saveStoredProperty(newProperty);
      showToast('New property created successfully.');
    }

    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deletingProperty) return;
    deleteStoredProperty(deletingProperty.id);
    showToast(`Property "${deletingProperty.title}" deleted.`);
    setDeletingProperty(null);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 rounded-xl bg-zinc-900 border border-emerald-500/40 text-emerald-300 px-4 py-3 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      <AdminPageHeader
        title="Properties & Rentals"
        description="Manage residential & commercial listings, property sales, student stands, and phone unlock revenue."
      >
        <AdminButton variant="primary" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Property
        </AdminButton>
      </AdminPageHeader>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Properties"
          value={isLoading ? '...' : totalCount}
          icon={Building2}
          hint="Catalogued across Zimbabwe"
          loading={isLoading}
        />
        <StatCard
          label="Active Rentals"
          value={isLoading ? '...' : rentalsCount}
          icon={Home}
          hint={`${availableCount} currently available`}
          loading={isLoading}
        />
        <StatCard
          label="Properties For Sale"
          value={isLoading ? '...' : salesCount}
          icon={Tag}
          hint="Houses, plots & commercial"
          loading={isLoading}
        />
        <StatCard
          label="Contact Unlocks"
          value={isLoading ? '...' : unlockedCount}
          icon={Unlock}
          hint={`Est. $${unlockedCount * 1.5} USD micro-fees`}
          loading={isLoading}
        />
      </div>

      {/* Main Table Panel */}
      <Panel padded={false}>
        <Toolbar>
          <SearchInput
            placeholder="Search by title, suburb, city, or landlord..."
            value={query}
            onChange={setQuery}
          />
          <div className="flex flex-wrap items-center gap-2.5">
            <FilterSelect
              label="Filter by Type"
              value={typeFilter}
              onChange={(val) => setTypeFilter(val)}
            >
              <option value="All">All Property Types</option>
              {PROPERTY_TYPES.filter((t) => t !== 'All Types').map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </FilterSelect>

            <FilterSelect
              label="Filter by Occupancy"
              value={occupancyFilter}
              onChange={(val) => setOccupancyFilter(val)}
            >
              <option value="All">All Occupancies</option>
              <option value="Available">Available Only</option>
              <option value="Occupied">Occupied / Taken</option>
            </FilterSelect>

            <FilterSelect
              label="Filter by Province"
              value={provinceFilter}
              onChange={(val) => setProvinceFilter(val)}
            >
              <option value="All">All Provinces</option>
              {ZIMBABWE_PROVINCES.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </FilterSelect>
          </div>
        </Toolbar>

        <div className="px-5 py-3 border-b border-[#e6eaf1]">
          <ResultCount shown={filtered.length} total={properties.length} noun="properties" />
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No properties found"
            description={query || typeFilter !== 'All' ? 'Try adjusting your search filters.' : 'Get started by publishing your first property listing.'}
            action={
              <AdminButton variant="primary" onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-1.5" /> Add First Property
              </AdminButton>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#e6eaf1] bg-[#f4f6f9]/80 text-xs font-semibold uppercase tracking-wider text-[#6b81a5]">
                <tr>
                  <th className="px-5 py-3">Property</th>
                  <th className="px-4 py-3">Type & Category</th>
                  <th className="px-4 py-3">Pricing</th>
                  <th className="px-4 py-3">Advertiser & Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6eaf1]">
                {filtered.map((item) => {
                  const isOccupied = item.occupancyStatus === 'Occupied' || item.occupancyStatus === 'Taken' || item.isOccupied;
                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-[#f4f6f9]/60 group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-zinc-100 overflow-hidden shrink-0 border border-[#c8d2e0]/60">
                            {item.images?.[0] ? (
                              <img
                                src={item.images[0]}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <Building2 className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#0a1018] truncate block max-w-xs">
                                {item.title}
                              </span>
                              {item.isFeatured && (
                                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200/60">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Featured
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[#6b81a5] mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-[#9aabc4] shrink-0" />
                              <span>{item.suburb}, {item.city} ({item.province})</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <AdminBadge tone="info">{item.propertyType}</AdminBadge>
                          <div className="text-xs text-[#6b81a5]">{item.category}</div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-[#0a1018]">
                          ${item.priceUSD.toLocaleString()} USD
                        </div>
                        <div className="text-xs text-[#6b81a5]">
                          {item.pricePeriod === 'per_month' ? 'per month' : item.pricePeriod === 'per_year' ? 'per year' : 'total price'}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-[#0a1018] font-semibold text-xs">
                          {item.advertiserName}
                        </div>
                        <div className="text-xs text-[#6b81a5]">{item.advertiserType}</div>
                        <div className="text-xs text-[#9aabc4] font-mono mt-0.5">{item.phone}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1.5 items-start">
                          <button
                            type="button"
                            onClick={() => togglePropertyOccupancy(item.id)}
                            title="Click to toggle Available vs Taken"
                            className="text-left cursor-pointer"
                          >
                            {isOccupied ? (
                              <AdminBadge tone="warning" dot>Occupied / Taken</AdminBadge>
                            ) : (
                              <AdminBadge tone="success" dot>Available</AdminBadge>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => togglePropertyVerification(item.id)}
                            title="Click to toggle Landlord Verification"
                            className="text-left cursor-pointer"
                          >
                            {item.isVerified ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#6b81a5] hover:text-[#0a1018]">
                                Unverified
                              </span>
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href="/properties"
                            target="_blank"
                            className="p-1.5 rounded-lg text-[#6b81a5] hover:text-[#0a1018] hover:bg-[#eef1f6] transition-colors"
                            title="View on Live Marketplace"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <IconButton
                            icon={Star}
                            label="Toggle Featured"
                            onClick={() => togglePropertyFeatured(item.id)}
                            className={cn(item.isFeatured && 'text-amber-500')}
                          />

                          <IconButton
                            icon={Pencil}
                            label="Edit Property"
                            onClick={() => openEditModal(item)}
                          />

                          <IconButton
                            icon={Trash2}
                            label="Delete Property"
                            tone="danger"
                            onClick={() => setDeletingProperty(item)}
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

      {/* Create / Edit Modal */}
      <AdminModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Edit Property Listing' : 'Add New Property Listing'}
        description="Fill out property attributes, rental pricing, landlord contacts, and photo gallery."
        size="2xl"
      >
        <ModalBody>
          <ModalSection title="Basic Details">
            <AdminInput
              label="Property Title / Headline"
              placeholder="e.g. Modern 3-Bedroom Cluster Home with Solar & Borehole"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <ModalGrid cols={2}>
              <AdminSelect
                label="Property Type"
                value={form.propertyType}
                onChange={(e) => setForm({ ...form, propertyType: e.target.value as PropertyListing['propertyType'] })}
              >
                {PROPERTY_TYPES.filter((t) => t !== 'All Types').map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </AdminSelect>

              <AdminSelect
                label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as PropertyListing['category'] })}
              >
                {PROPERTY_CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </AdminSelect>
            </ModalGrid>
          </ModalSection>

          <ModalSection title="Location">
            <ModalGrid cols={3}>
              <AdminSelect
                label="Province"
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
              >
                {ZIMBABWE_PROVINCES.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </AdminSelect>

              <AdminInput
                label="City / Town"
                placeholder="e.g. Harare, Bulawayo"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />

              <AdminInput
                label="Suburb / Area"
                placeholder="e.g. Avondale West, Borrowdale"
                value={form.suburb}
                onChange={(e) => setForm({ ...form, suburb: e.target.value })}
                required
              />
            </ModalGrid>
          </ModalSection>

          <ModalSection title="Pricing & Dimensions">
            <ModalGrid cols={2}>
              <AdminInput
                label="Price (USD)"
                type="number"
                placeholder="850"
                value={form.priceUSD}
                onChange={(e) => setForm({ ...form, priceUSD: e.target.value })}
                required
              />

              <AdminSelect
                label="Payment Terms"
                value={form.pricePeriod}
                onChange={(e) => setForm({ ...form, pricePeriod: e.target.value as PropertyListing['pricePeriod'] })}
              >
                <option value="per_month">Per Month</option>
                <option value="total">Total Purchase Price</option>
                <option value="per_year">Per Year</option>
              </AdminSelect>

              <AdminInput
                label="Bedrooms"
                type="number"
                placeholder="3"
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
              />

              <AdminInput
                label="Bathrooms"
                type="number"
                placeholder="2"
                value={form.bathrooms}
                onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
              />
            </ModalGrid>
          </ModalSection>

          <ModalSection title="Landlord & Contact Information">
            <ModalGrid cols={2}>
              <AdminInput
                label="Advertiser / Agency Name"
                placeholder="e.g. Rawson Properties / Mr. T. Moyo"
                value={form.advertiserName}
                onChange={(e) => setForm({ ...form, advertiserName: e.target.value })}
              />

              <AdminSelect
                label="Advertiser Entity Type"
                value={form.advertiserType}
                onChange={(e) => setForm({ ...form, advertiserType: e.target.value as PropertyListing['advertiserType'] })}
              >
                <option value="Direct Landlord">Direct Landlord</option>
                <option value="Real Estate Agency">Real Estate Agency</option>
                <option value="Property Manager">Property Manager</option>
                <option value="Developer">Property Developer</option>
              </AdminSelect>

              <AdminInput
                label="Landlord Direct Phone"
                placeholder="+263 77 123 4567"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                hint="This is the contact number protected behind the $1 paywall."
              />

              <AdminInput
                label="WhatsApp Number (Numbers only)"
                placeholder="263771234567"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />
            </ModalGrid>
          </ModalSection>

          <ModalSection title="Property Features & Description">
            <AdminInput
              label="Highlights & Key Features (comma-separated)"
              placeholder="Borehole, 5kVA Solar System, Electric Fence, Swimming Pool"
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
            />

            <AdminTextarea
              label="Detailed Description"
              rows={4}
              placeholder="Describe the condition, security, lease requirements, deposit terms, and viewing schedule..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </ModalSection>

          <ModalSection title="Photos & Gallery">
            <ImageUploader
              label="Property Images"
              images={form.images}
              onChange={(imgs) => setForm({ ...form, images: imgs })}
              multiple
              maxImages={6}
            />
          </ModalSection>

          <ModalSection title="Listing Status & Flags">
            <div className="space-y-3">
              <ModalToggle
                label="Landlord Verified"
                checked={form.isVerified}
                onChange={(c) => setForm({ ...form, isVerified: c })}
              />
              <ModalToggle
                label="Featured Listing"
                checked={form.isFeatured}
                onChange={(c) => setForm({ ...form, isFeatured: c })}
              />
              <ModalToggle
                label="Mark as Occupied / Taken"
                checked={form.occupancyStatus === 'Taken'}
                onChange={(c) => setForm({ ...form, occupancyStatus: c ? 'Taken' : 'Available' })}
              />
            </div>
          </ModalSection>
        </ModalBody>

        <ModalFooter>
          <AdminButton variant="outline" type="button" onClick={() => setFormOpen(false)}>
            Cancel
          </AdminButton>
          <AdminButton variant="primary" type="button" onClick={handleSave}>
            {editingId ? 'Save Changes' : 'Publish Property'}
          </AdminButton>
        </ModalFooter>
      </AdminModal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={Boolean(deletingProperty)}
        onClose={() => setDeletingProperty(null)}
        onConfirm={handleDelete}
        title="Delete Property Listing"
        message={`Are you sure you want to delete "${deletingProperty?.title}"? This listing will be immediately removed from the public portal.`}
        confirmLabel="Delete Property"
        tone="danger"
      />
    </div>
  );
}
