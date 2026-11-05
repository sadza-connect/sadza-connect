'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Star,
  MapPin,
  Palmtree,
  DollarSign,
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
  TourismListing,
  TOURISM_CATEGORIES,
  TOURISM_DESTINATIONS,
  getStoredTourisms,
  saveStoredTourism,
  deleteStoredTourism,
  toggleTourismVerification,
  toggleTourismFeatured,
} from '@/data/tourismStore';
import { cn } from '@/lib/utils/cn';

export default function AdminTourismPage() {
  const [tourisms, setTourisms] = useState<TourismListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [destinationFilter, setDestinationFilter] = useState('All');
  const [provinceFilter, setProvinceFilter] = useState('All');
  const [toast, setToast] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<TourismListing | null>(null);

  const [form, setForm] = useState({
    name: '',
    category: 'Lodges & Safari Camps' as TourismListing['category'],
    destinationArea: 'Victoria Falls',
    province: 'Matabeleland North',
    city: 'Victoria Falls',
    addressOrLocation: '',
    pricePerNightUSD: '150',
    guestsCapacity: '4',
    bedrooms: '2',
    amenities: 'Solar Power, Borehole Water, Swimming Pool, Free WiFi, Air Conditioning',
    description: '',
    hostName: '',
    hostType: 'Safari Lodge Operator' as TourismListing['hostType'],
    phone: '+263 ',
    whatsapp: '263',
    rating: '4.8',
    reviewsCount: '15',
    isVerified: true,
    isFeatured: false,
    images: [] as GalleryItem[],
  });

  const loadData = () => {
    try {
      const items = getStoredTourisms();
      setTourisms(items);
    } catch {
      setTourisms([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('sadza-tourism-updated', handleUpdate);
    return () => {
      window.removeEventListener('sadza-tourism-updated', handleUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = useMemo(() => {
    return tourisms.filter((t) => {
      if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
      if (destinationFilter !== 'All' && t.destinationArea !== destinationFilter) return false;
      if (provinceFilter !== 'All' && t.province.toLowerCase() !== provinceFilter.toLowerCase()) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.destinationArea.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.hostName.toLowerCase().includes(q)
      );
    });
  }, [tourisms, query, categoryFilter, destinationFilter, provinceFilter]);

  // Statistics
  const totalCount = tourisms.length;
  const safariCount = tourisms.filter((t) => t.category === 'Lodges & Safari Camps').length;
  const vicFallsCount = tourisms.filter((t) => t.destinationArea === 'Victoria Falls').length;
  const avgNightlyRate = totalCount > 0
    ? Math.round(tourisms.reduce((acc, curr) => acc + curr.pricePerNightUSD, 0) / totalCount)
    : 0;

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      name: '',
      category: 'Lodges & Safari Camps',
      destinationArea: 'Victoria Falls',
      province: 'Matabeleland North',
      city: 'Victoria Falls',
      addressOrLocation: '',
      pricePerNightUSD: '150',
      guestsCapacity: '4',
      bedrooms: '2',
      amenities: 'Solar Power, Borehole Water, Swimming Pool, Free WiFi, Air Conditioning',
      description: '',
      hostName: '',
      hostType: 'Safari Lodge Operator',
      phone: '+263 ',
      whatsapp: '263',
      rating: '4.8',
      reviewsCount: '15',
      isVerified: true,
      isFeatured: false,
      images: [],
    });
    setFormOpen(true);
  };

  const openEditModal = (t: TourismListing) => {
    setEditingId(t.id);
    const galleryImages: GalleryItem[] = (t.images || []).map((url) => ({
      src: url,
      caption: '',
    }));

    setForm({
      name: t.name,
      category: t.category,
      destinationArea: t.destinationArea,
      province: t.province,
      city: t.city,
      addressOrLocation: t.addressOrLocation || '',
      pricePerNightUSD: String(t.pricePerNightUSD || ''),
      guestsCapacity: String(t.guestsCapacity ?? '2'),
      bedrooms: String(t.bedrooms ?? '1'),
      amenities: (t.amenities || []).join(', '),
      description: t.description || '',
      hostName: t.hostName,
      hostType: t.hostType,
      phone: t.phone,
      whatsapp: t.whatsapp,
      rating: String(t.rating ?? '4.8'),
      reviewsCount: String(t.reviewsCount ?? '12'),
      isVerified: Boolean(t.isVerified),
      isFeatured: Boolean(t.isFeatured),
      images: galleryImages,
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.pricePerNightUSD.trim() || !form.destinationArea.trim()) {
      showToast('Please fill in accommodation name, destination, and nightly rate.');
      return;
    }

    const priceNum = parseFloat(form.pricePerNightUSD) || 0;
    const amens = form.amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const imageUrls = form.images.length > 0
      ? form.images.map((img) => img.src)
      : ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'];

    const slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (editingId) {
      const existing = tourisms.find((t) => t.id === editingId);
      const updated: TourismListing = {
        id: editingId,
        name: form.name.trim(),
        slug: existing?.slug || `${slug}-${Date.now().toString(36)}`,
        category: form.category,
        destinationArea: form.destinationArea,
        province: form.province,
        city: form.city.trim(),
        addressOrLocation: form.addressOrLocation.trim() || form.destinationArea,
        pricePerNightUSD: priceNum,
        guestsCapacity: form.guestsCapacity ? parseInt(form.guestsCapacity, 10) : 2,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms, 10) : 1,
        amenities: amens,
        description: form.description.trim(),
        images: imageUrls,
        hostName: form.hostName.trim() || 'Verified Host',
        hostType: form.hostType,
        isVerified: form.isVerified,
        isFeatured: form.isFeatured,
        whatsapp: form.whatsapp.trim().replace(/[^0-9]/g, ''),
        phone: form.phone.trim(),
        rating: parseFloat(form.rating) || 4.8,
        reviewsCount: parseInt(form.reviewsCount, 10) || 12,
        postedAt: existing?.postedAt || 'Verified Partner',
      };
      saveStoredTourism(updated);
      showToast('Accommodation updated successfully.');
    } else {
      const newItem: TourismListing = {
        id: `tour-${Date.now()}`,
        name: form.name.trim(),
        slug: `${slug}-${Date.now().toString(36)}`,
        category: form.category,
        destinationArea: form.destinationArea,
        province: form.province,
        city: form.city.trim(),
        addressOrLocation: form.addressOrLocation.trim() || form.destinationArea,
        pricePerNightUSD: priceNum,
        guestsCapacity: form.guestsCapacity ? parseInt(form.guestsCapacity, 10) : 2,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms, 10) : 1,
        amenities: amens,
        description: form.description.trim(),
        images: imageUrls,
        hostName: form.hostName.trim() || 'Verified Host',
        hostType: form.hostType,
        isVerified: form.isVerified,
        isFeatured: form.isFeatured,
        whatsapp: form.whatsapp.trim().replace(/[^0-9]/g, ''),
        phone: form.phone.trim(),
        rating: parseFloat(form.rating) || 4.9,
        reviewsCount: parseInt(form.reviewsCount, 10) || 5,
        postedAt: 'Verified Partner',
      };
      saveStoredTourism(newItem);
      showToast('New accommodation added successfully.');
    }

    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    deleteStoredTourism(deletingItem.id);
    showToast(`Accommodation "${deletingItem.name}" deleted.`);
    setDeletingItem(null);
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
        title="Tourism & Hospitality"
        description="Manage lodges, safari camps, luxury BnBs, resort hotels, and houseboat stays across Zimbabwe."
      >
        <AdminButton variant="primary" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Accommodation
        </AdminButton>
      </AdminPageHeader>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Stays"
          value={isLoading ? '...' : totalCount}
          icon={Compass}
          hint="Lodges, BnBs & Resorts"
          loading={isLoading}
        />
        <StatCard
          label="Safari & Game Lodges"
          value={isLoading ? '...' : safariCount}
          icon={Palmtree}
          hint="Hwange, Kariba & Matopos"
          loading={isLoading}
        />
        <StatCard
          label="Victoria Falls Hub"
          value={isLoading ? '...' : vicFallsCount}
          icon={MapPin}
          hint="Prime tourism gateway"
          loading={isLoading}
        />
        <StatCard
          label="Avg Nightly Rate"
          value={isLoading ? '...' : `$${avgNightlyRate} USD`}
          icon={DollarSign}
          hint="Across all regional categories"
          loading={isLoading}
        />
      </div>

      {/* Main Table Panel */}
      <Panel padded={false}>
        <Toolbar>
          <SearchInput
            placeholder="Search by lodge name, destination, city, or host..."
            value={query}
            onChange={setQuery}
          />
          <div className="flex flex-wrap items-center gap-2.5">
            <FilterSelect
              label="Filter by Category"
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val)}
            >
              <option value="All">All Categories</option>
              {TOURISM_CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </FilterSelect>

            <FilterSelect
              label="Filter by Destination"
              value={destinationFilter}
              onChange={(val) => setDestinationFilter(val)}
            >
              <option value="All">All Destinations</option>
              {TOURISM_DESTINATIONS.filter((d) => d !== 'All Destinations').map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
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
          <ResultCount shown={filtered.length} total={tourisms.length} noun="accommodations" />
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No accommodations found"
            description={query || categoryFilter !== 'All' ? 'Try adjusting your search filters.' : 'Get started by listing your first tourism lodge or retreat.'}
            action={
              <AdminButton variant="primary" onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-1.5" /> Add First Accommodation
              </AdminButton>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#e6eaf1] bg-[#f4f6f9]/80 text-xs font-semibold uppercase tracking-wider text-[#6b81a5]">
                <tr>
                  <th className="px-5 py-3">Accommodation</th>
                  <th className="px-4 py-3">Category & Destination</th>
                  <th className="px-4 py-3">Nightly Rate</th>
                  <th className="px-4 py-3">Host & Booking</th>
                  <th className="px-4 py-3">Rating & Badges</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6eaf1]">
                {filtered.map((item) => (
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
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                              <Compass className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0a1018] truncate block max-w-xs">
                              {item.name}
                            </span>
                            {item.isFeatured && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200/60">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Featured
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[#6b81a5] mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-[#9aabc4] shrink-0" />
                            <span>{item.addressOrLocation || item.city} ({item.province})</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <AdminBadge tone="info">{item.category}</AdminBadge>
                        <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {item.destinationArea}
                        </div>
                        <div className="text-[11px] text-[#6b81a5]">
                          Up to {item.guestsCapacity || 2} guests · {item.bedrooms || 1} bed(s)
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-[#0a1018] text-base">
                        ${item.pricePerNightUSD} USD
                      </div>
                      <div className="text-xs text-[#6b81a5]">per night</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="text-[#0a1018] font-semibold text-xs">
                        {item.hostName}
                      </div>
                      <div className="text-xs text-[#6b81a5]">{item.hostType}</div>
                      <div className="text-xs text-[#9aabc4] font-mono mt-0.5">{item.phone}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1.5 items-start">
                        <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{item.rating}</span>
                          <span className="text-[11px] text-[#6b81a5] font-normal">({item.reviewsCount} reviews)</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleTourismVerification(item.id)}
                          title="Click to toggle Host Verification"
                          className="text-left cursor-pointer"
                        >
                          {item.isVerified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Partner
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
                          href="/tourism"
                          target="_blank"
                          className="p-1.5 rounded-lg text-[#6b81a5] hover:text-[#0a1018] hover:bg-[#eef1f6] transition-colors"
                          title="View on Live Tourism Directory"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <IconButton
                          icon={Star}
                          label="Toggle Featured"
                          onClick={() => toggleTourismFeatured(item.id)}
                          className={cn(item.isFeatured && 'text-amber-500')}
                        />

                        <IconButton
                          icon={Pencil}
                          label="Edit Accommodation"
                          onClick={() => openEditModal(item)}
                        />

                        <IconButton
                          icon={Trash2}
                          label="Delete Accommodation"
                          tone="danger"
                          onClick={() => setDeletingItem(item)}
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

      {/* Create / Edit Modal */}
      <AdminModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Edit Tourism Accommodation' : 'Add New Tourism Listing'}
        description="Fill out lodge attributes, destination, guest capacity, pricing, and photo gallery."
        size="2xl"
      >
        <ModalBody>
          <ModalSection title="Lodge & Accommodation Details">
            <AdminInput
              label="Accommodation Name"
              placeholder="e.g. Victoria Falls Safari Lodge & River Chalets"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <ModalGrid cols={2}>
              <AdminSelect
                label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as TourismListing['category'] })}
              >
                {TOURISM_CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </AdminSelect>

              <AdminSelect
                label="Destination Hub"
                value={form.destinationArea}
                onChange={(e) => setForm({ ...form, destinationArea: e.target.value })}
              >
                {TOURISM_DESTINATIONS.filter((d) => d !== 'All Destinations').map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </AdminSelect>
            </ModalGrid>
          </ModalSection>

          <ModalSection title="Location & Address">
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
                placeholder="e.g. Victoria Falls, Kariba"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />

              <AdminInput
                label="Physical Address / Corridor"
                placeholder="e.g. Stand 471B, Zambezi Drive"
                value={form.addressOrLocation}
                onChange={(e) => setForm({ ...form, addressOrLocation: e.target.value })}
              />
            </ModalGrid>
          </ModalSection>

          <ModalSection title="Pricing, Capacity & Ratings">
            <ModalGrid cols={2}>
              <AdminInput
                label="Price Per Night (USD)"
                type="number"
                placeholder="185"
                value={form.pricePerNightUSD}
                onChange={(e) => setForm({ ...form, pricePerNightUSD: e.target.value })}
                required
              />

              <AdminInput
                label="Guests Capacity"
                type="number"
                placeholder="4"
                value={form.guestsCapacity}
                onChange={(e) => setForm({ ...form, guestsCapacity: e.target.value })}
              />

              <AdminInput
                label="Bedrooms / Chalets"
                type="number"
                placeholder="2"
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
              />

              <AdminInput
                label="Rating (out of 5)"
                type="number"
                step="0.1"
                placeholder="4.9"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
              />
            </ModalGrid>
          </ModalSection>

          <ModalSection title="Host & Booking Contacts">
            <ModalGrid cols={2}>
              <AdminInput
                label="Host / Management Name"
                placeholder="e.g. Africa Albida Tourism / Tendai Ndlovu"
                value={form.hostName}
                onChange={(e) => setForm({ ...form, hostName: e.target.value })}
              />

              <AdminSelect
                label="Host Entity Type"
                value={form.hostType}
                onChange={(e) => setForm({ ...form, hostType: e.target.value as TourismListing['hostType'] })}
              >
                <option value="Hotel / Resort Group">Hotel / Resort Group</option>
                <option value="Safari Lodge Operator">Safari Lodge Operator</option>
                <option value="Private BnB Host">Private BnB Host</option>
                <option value="Guesthouse Manager">Guesthouse Manager</option>
              </AdminSelect>

              <AdminInput
                label="Direct Phone Line"
                placeholder="+263 77 123 4567"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <AdminInput
                label="WhatsApp Number (Booking Inquiries)"
                placeholder="263771234567"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />
            </ModalGrid>
          </ModalSection>

          <ModalSection title="Amenities & Atmosphere">
            <AdminInput
              label="Key Amenities (comma-separated)"
              placeholder="Solar Power, Borehole Water, Swimming Pool, Free WiFi, Game Drives, River Views"
              value={form.amenities}
              onChange={(e) => setForm({ ...form, amenities: e.target.value })}
            />

            <AdminTextarea
              label="Detailed Description"
              rows={4}
              placeholder="Describe the wildlife experiences, dining, transfers, views of the Zambezi or mountains, and guest policies..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </ModalSection>

          <ModalSection title="Photos & Gallery">
            <ImageUploader
              label="Lodge & Chalet Images"
              images={form.images}
              onChange={(imgs) => setForm({ ...form, images: imgs })}
              multiple
              maxImages={6}
            />
          </ModalSection>

          <ModalSection title="Listing Status & Flags">
            <div className="space-y-3">
              <ModalToggle
                label="Verified Partner"
                checked={form.isVerified}
                onChange={(c) => setForm({ ...form, isVerified: c })}
              />
              <ModalToggle
                label="Featured Destination Listing"
                checked={form.isFeatured}
                onChange={(c) => setForm({ ...form, isFeatured: c })}
              />
            </div>
          </ModalSection>
        </ModalBody>

        <ModalFooter>
          <AdminButton variant="outline" type="button" onClick={() => setFormOpen(false)}>
            Cancel
          </AdminButton>
          <AdminButton variant="primary" type="button" onClick={handleSave}>
            {editingId ? 'Save Changes' : 'Publish Accommodation'}
          </AdminButton>
        </ModalFooter>
      </AdminModal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Tourism Accommodation"
        message={`Are you sure you want to delete "${deletingItem?.name}"? It will be immediately removed from the tourism catalog.`}
        confirmLabel="Delete Accommodation"
        tone="danger"
      />
    </div>
  );
}
