'use client';

import { useMemo, useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Package, CheckCircle2 } from 'lucide-react';
import {
  AdminPageHeader,
  Panel,
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
import {
  BUSINESS_CATEGORIES,
  ZIMBABWE_PROVINCES,
  MarketplaceProduct,
} from '@/lib/data/zimbabwe';
import {
  getStoredProducts,
  saveStoredProducts,
  getPlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
} from '@/data/platformStore';

export default function AdminMarketplacePage() {
  const [productsList, setProductsList] = useState<MarketplaceProduct[]>([]);
  const [zigRate, setZigRate] = useState(DEFAULT_PLATFORM_SETTINGS.usdToZigRate);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<MarketplaceProduct | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    sellerName: 'SunPower Solar & Inverters Zimbabwe',
    category: BUSINESS_CATEGORIES[0]?.name || 'Solar & Clean Energy',
    province: 'Harare',
    priceUsd: '450',
    unit: 'Per Complete Unit',
    stockNote: 'In Stock • Immediate Dispatch',
    description: '',
    specs: 'Capacity: Commercial Grade\nWarranty: 24 Months Manufacturer Warranty',
    highlights: 'Verified Supplier Stock\nNationwide Waybill Delivery',
    image: [] as GalleryItem[],
    featured: true,
  });

  useEffect(() => {
    const sync = () => {
      setProductsList(getStoredProducts());
      setZigRate(getPlatformSettings().usdToZigRate);
    };
    sync();
    window.addEventListener('sadza-platform-updated', sync);
    return () => window.removeEventListener('sadza-platform-updated', sync);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const categories = useMemo(
    () => Array.from(new Set(BUSINESS_CATEGORIES.map((c) => c.name))),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return productsList.filter((r) => {
      const matchesQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.sellerName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q);
      const matchesCategory = category === 'all' || r.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [productsList, query, category]);

  function openCreate() {
    setEditingSlug(null);
    setForm({
      title: '',
      sellerName: 'SunPower Solar & Inverters Zimbabwe',
      category: categories[0] || 'Solar & Clean Energy',
      province: 'Harare',
      priceUsd: '480',
      unit: 'Per Complete Unit',
      stockNote: 'In Stock • Immediate Dispatch',
      description: '',
      specs: 'Grade: Industrial Heavy-Duty\nWarranty: 2 Years Official',
      highlights: 'CR14 Verified Supplier\nHarare & Bulawayo Depot Pickup',
      image: [
        {
          src: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
          caption: 'Product Photo',
        },
      ],
      featured: true,
    });
    setFormOpen(true);
  }

  function openEdit(prod: MarketplaceProduct) {
    setEditingSlug(prod.slug);
    setForm({
      title: prod.title,
      sellerName: prod.sellerName,
      category: prod.category,
      province: prod.province,
      priceUsd: String(prod.priceUsd),
      unit: prod.unit,
      stockNote: prod.stockNote,
      description: prod.description,
      specs: (prod.highlights || []).join('\n'),
      highlights: (prod.highlights || []).join('\n'),
      image: prod.image ? [{ src: prod.image, caption: prod.title }] : [],
      featured: Boolean(prod.featured),
    });
    setFormOpen(true);
  }

  function saveForm(e: React.FormEvent) {
    e.preventDefault();
    const parsedHighlights = [
      ...form.highlights.split('\n').map((s) => s.trim()),
      ...form.specs.split('\n').map((s) => s.trim()),
    ].filter(Boolean);

    const imgSrc =
      form.image[0]?.src ||
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80';
    const usd = Math.max(1, Number(form.priceUsd) || 0);
    if (editingSlug) {
      const next = productsList.map((p) =>
        p.slug === editingSlug
          ? {
              ...p,
              title: form.title,
              sellerName: form.sellerName,
              category: form.category,
              province: form.province,
              priceUsd: usd,
              unit: form.unit,
              stockNote: form.stockNote,
              description: form.description,
              highlights: parsedHighlights,
              image: imgSrc,
              featured: form.featured,
            }
          : p
      );
      saveStoredProducts(next);
      setProductsList(next);
      showToast(`Product updated: ${form.title}`);
    } else {
      const slug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const newProd: MarketplaceProduct = {
        id: `mp-${Date.now()}`,
        slug: slug || `prod-${Date.now()}`,
        title: form.title,
        category: form.category,
        province: form.province,
        priceUsd: usd,
        unit: form.unit,
        movementBadge: 'New Upload',
        postedAgo: 'Just now',
        stockNote: form.stockNote,
        location: `${form.province} • Nationwide Delivery`,
        condition: 'Brand New',
        sellerId: 'b1',
        sellerSlug: 'midlands-solar-agro-solutions',
        sellerName: form.sellerName,
        sellerType: 'Registered Company (Pvt Ltd)',
        sellerPlan: 'Paid Subscriber',
        sellerPhone: '+263773333444',
        sellerVerified: true,
        image: imgSrc,
        description: form.description,
        highlights: parsedHighlights,
        featured: form.featured,
      };
      const next = [newProd, ...productsList];
      saveStoredProducts(next);
      setProductsList(next);
      showToast(`Product created: ${form.title}`);
    }
    setFormOpen(false);
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
        title="Products Catalogue"
        description="Manage equipment, system packages, specifications, USD/ZiG pricing, and product device photos."
      >
        <AdminButton onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Product
        </AdminButton>
      </AdminPageHeader>

      <Panel padded={false}>
        <Toolbar>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search products by name, supplier, or category..."
          />
          <FilterSelect
            value={category}
            onChange={setCategory}
            label="Filter by category"
            className="sm:w-56"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </FilterSelect>
          <ResultCount shown={filtered.length} total={productsList.length} noun="products" />
        </Toolbar>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products match filters"
            description="Try clearing your search query or adding a new product."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e6eaf1] bg-[#f4f6f9]/80 text-xs font-semibold uppercase tracking-wider text-[#6b81a5]">
                  <th className="px-5 py-3 sm:px-6">Product</th>
                  <th className="px-4 py-3">Verified Supplier</th>
                  <th className="px-4 py-3">Availability</th>
                  <th className="px-4 py-3">Price (USD / ZiG)</th>
                  <th className="px-5 py-3 text-right sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6eaf1]">
                {filtered.map((row) => (
                  <tr key={row.slug} className="transition-colors hover:bg-[#f4f6f9]/60">
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={row.image}
                          alt={row.title}
                          className="h-10 w-10 shrink-0 rounded-xl object-cover border border-[#c8d2e0]"
                        />
                        <div>
                          <p className="font-bold text-[#0a1018] flex items-center gap-2">
                            {row.title}
                            {row.featured && (
                              <AdminBadge tone="signal" dot>
                                Featured
                              </AdminBadge>
                            )}
                          </p>
                          <p className="text-xs text-[#6b81a5]">{row.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[#1f2a3d]">{row.sellerName}</p>
                      <p className="text-xs text-[#6b81a5]">{row.province}</p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <AdminBadge tone="brand">{row.stockNote}</AdminBadge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="font-mono font-bold text-[#0a1018]">
                        ${row.priceUsd.toLocaleString()} USD
                      </p>
                      <p className="font-mono text-xs text-[#6b81a5]">
                        {Math.round(row.priceUsd * zigRate).toLocaleString()} ZiG
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap sm:px-6">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          icon={Pencil}
                          label={`Edit ${row.title}`}
                          onClick={() => openEdit(row)}
                        />
                        <IconButton
                          icon={Trash2}
                          label={`Delete ${row.title}`}
                          tone="danger"
                          onClick={() => setDeleting(row)}
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

      {/* Ultra-Spacious 2XL Product Editor Modal */}
      <AdminModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        size="2xl"
        title={editingSlug ? 'Edit Product Catalogue Entry' : 'Add New Product'}
        description="Update pricing, technical specifications, description, and device image uploads."
      >
        <form onSubmit={saveForm} className="space-y-6 p-6 sm:p-8">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1e57eb]">
              1. Product Identity &amp; Pricing
            </h4>
            <AdminInput
              label="Product / System Name"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. 15kVA Commercial Hybrid Solar System"
              required
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AdminInput
                label="Verified Supplier / Brand Name"
                value={form.sellerName}
                onChange={(e) => setForm((f) => ({ ...f, sellerName: e.target.value }))}
                required
              />
              <AdminInput
                label="Price (USD)"
                type="number"
                value={form.priceUsd}
                onChange={(e) => setForm((f) => ({ ...f, priceUsd: e.target.value }))}
                placeholder="450"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <AdminSelect
                label="Category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </AdminSelect>

              <AdminSelect
                label="Province"
                value={form.province}
                onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
              >
                {ZIMBABWE_PROVINCES.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </AdminSelect>

              <AdminInput
                label="Availability / Stock Note"
                value={form.stockNote}
                onChange={(e) => setForm((f) => ({ ...f, stockNote: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-[#e6eaf1] pt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1e57eb]">
              2. Descriptions &amp; Specifications
            </h4>
            <AdminTextarea
              label="Full Technical Description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Detailed engineering breakdown, protective features, load rating..."
              required
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AdminTextarea
                label="Technical Specs (Format: Label: Value, 1 per line)"
                rows={4}
                value={form.specs}
                onChange={(e) => setForm((f) => ({ ...f, specs: e.target.value }))}
              />
              <AdminTextarea
                label="Key Highlights (1 per line)"
                rows={4}
                value={form.highlights}
                onChange={(e) => setForm((f) => ({ ...f, highlights: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-[#e6eaf1] pt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1e57eb]">
              3. Device Product Photos (Single or Multiple)
            </h4>
            <ImageUploader
              label="Select Product Images from Device"
              hint="Select 1 or multiple photos directly from your phone or laptop disk."
              multiple={true}
              images={form.image}
              onChange={(imgs) => setForm((f) => ({ ...f, image: imgs }))}
            />
          </div>

          <label className="flex items-center justify-between rounded-xl border border-[#c8d2e0] bg-[#f4f6f9]/60 p-4 cursor-pointer">
            <div>
              <p className="text-sm font-bold text-[#0a1018]">Featured Product</p>
              <p className="text-xs text-[#6b81a5]">
                Showcase this item on the homepage and top catalogue rail.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
              className="h-5 w-5 rounded border-[#c8d2e0] text-[#1e57eb]"
            />
          </label>

          <div className="flex justify-end gap-3 border-t border-[#e6eaf1] pt-6">
            <AdminButton type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit">
              {editingSlug ? 'Save Product Changes' : 'Create Product'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* Delete confirmation modal */}
      <AdminModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete product?"
        size="sm"
      >
        <div className="p-6">
          <p className="text-sm text-[#374966]">
            This will permanently remove{' '}
            <strong className="font-bold text-[#0a1018]">{deleting?.title}</strong> from the
            catalogue.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <AdminButton variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </AdminButton>
            <AdminButton
              variant="danger"
              onClick={() => {
                if (deleting) {
                  const next = productsList.filter((p) => p.slug !== deleting.slug);
                  saveStoredProducts(next);
                  setProductsList(next);
                  showToast(`Deleted ${deleting.title}`);
                  setDeleting(null);
                }
              }}
            >
              <Trash2 className="h-4 w-4" /> Delete Product
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
