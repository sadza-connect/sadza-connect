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
  TableSkeleton,
  ModalBody,
  ModalSection,
  ModalGrid,
  ModalFooter,
  ModalToggle,
  ConfirmModal,
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
import { mapDbProductToMarketplaceProduct } from '@/lib/data/product-mapper';

export default function AdminMarketplacePage() {
  const [productsList, setProductsList] = useState<MarketplaceProduct[]>([]);
  const [availableBusinesses, setAvailableBusinesses] = useState<
    Array<{ id: string; name: string; slug: string; province: string }>
  >([]);
  const [zigRate, setZigRate] = useState(DEFAULT_PLATFORM_SETTINGS.usdToZigRate);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<MarketplaceProduct | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    selectedBusinessId: '',
    sellerName: '',
    category: BUSINESS_CATEGORIES[0]?.name || 'Solar & Clean Energy',
    province: 'Harare',
    priceUsd: '',
    unit: 'Per Unit',
    stockNote: '',
    description: '',
    specs: '',
    highlights: '',
    image: [] as GalleryItem[],
    featured: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadAdminData() {
      // 1. Load Products from live API
      try {
        const res = await fetch('/api/v1/products?limit=100', { credentials: 'include' });
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.products)) {
          if (isMounted) {
            const mapped = json.data.products.map(mapDbProductToMarketplaceProduct);
            setProductsList(mapped);
          }
        }
      } catch (err) {
        console.warn('Failed to load products from database:', err);
      }

      // 2. Load Businesses for supplier dropdown
      try {
        const bRes = await fetch('/api/v1/businesses?limit=100', { credentials: 'include' });
        const bJson = await bRes.json();
        if (bJson.success && Array.isArray(bJson.data?.businesses)) {
          if (isMounted) {
            setAvailableBusinesses(
              bJson.data.businesses.map((b: any) => ({
                id: b.id,
                name: b.name,
                slug: b.slug,
                province: b.province || 'Harare',
              }))
            );
          }
        }
      } catch {
        // Fallback businesses if needed
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }

      if (isMounted) {
        setZigRate(getPlatformSettings().usdToZigRate);
      }
    }

    loadAdminData();

    const sync = () => {
      loadAdminData();
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
    const defaultBiz = availableBusinesses[0];
    setForm({
      title: '',
      selectedBusinessId: defaultBiz?.id || '',
      sellerName: defaultBiz?.name || '',
      category: categories[0] || 'Solar & Clean Energy',
      province: defaultBiz?.province || 'Harare',
      priceUsd: '',
      unit: 'Per Unit',
      stockNote: '',
      description: '',
      specs: '',
      highlights: '',
      image: [],
      featured: false,
    });
    setFormOpen(true);
  }

  function openEdit(prod: MarketplaceProduct) {
    setEditingSlug(prod.slug);
    setForm({
      title: prod.title,
      selectedBusinessId: prod.sellerId || '',
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

  async function saveForm(e: React.FormEvent) {
    e.preventDefault();
    const parsedHighlights = [
      ...form.highlights.split('\n').map((s) => s.trim()),
      ...form.specs.split('\n').map((s) => s.trim()),
    ].filter(Boolean);

    const imgSrc = form.image[0]?.src || '';
    const usd = Math.max(1, Number(form.priceUsd) || 0);

    if (editingSlug) {
      try {
        await fetch(`/api/v1/products/${encodeURIComponent(editingSlug)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: form.title,
            category: form.category,
            price_usd: usd,
            description: form.description,
            is_featured: form.featured,
            images: [imgSrc],
          }),
        });
      } catch (err) {
        console.error('Failed to update product in database:', err);
      }

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
      const targetBiz =
        availableBusinesses.find((b) => b.id === form.selectedBusinessId) ||
        availableBusinesses[0];

      try {
        await fetch('/api/v1/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            business_id: targetBiz?.id,
            business_slug: targetBiz?.slug,
            name: form.title,
            category: form.category,
            price_usd: usd,
            description: form.description,
            images: [imgSrc],
            in_stock: true,
            is_featured: form.featured,
          }),
        });
      } catch (err) {
        console.error('Failed to create product in database:', err);
      }

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
        sellerId: targetBiz?.id || 'b1',
        sellerSlug: targetBiz?.slug || 'midlands-solar-agro-solutions',
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

        {isLoading ? (
          <TableSkeleton columns={5} rows={6} />
        ) : filtered.length === 0 ? (
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
                        {row.image ? (
                          <img
                            src={row.image}
                            alt={row.title}
                            className="h-10 w-10 shrink-0 rounded-xl object-cover border border-[#c8d2e0]"
                          />
                        ) : (
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center border border-[#c8d2e0] text-slate-400">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
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

      {/* Product editor */}
      <AdminModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        size="xl"
        icon={editingSlug ? Pencil : Package}
        title={editingSlug ? 'Edit product' : 'Add new product'}
        description="Update pricing, technical specifications, and photos."
      >
        <form onSubmit={saveForm}>
          <ModalBody>
            <ModalSection title="Product details">
              <ModalGrid>
                <AdminInput
                  label="Product name"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. 15kVA Commercial Hybrid Solar System"
                  required
                  wrapClassName="sm:col-span-2"
                />
                {availableBusinesses.length > 0 ? (
                  <AdminSelect
                    label="Verified Supplier / Enterprise"
                    value={form.selectedBusinessId}
                    onChange={(e) => {
                      const sel = availableBusinesses.find((b) => b.id === e.target.value);
                      setForm((f) => ({
                        ...f,
                        selectedBusinessId: e.target.value,
                        sellerName: sel ? sel.name : f.sellerName,
                        province: sel ? sel.province : f.province,
                      }));
                    }}
                  >
                    {availableBusinesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.province})
                      </option>
                    ))}
                  </AdminSelect>
                ) : (
                  <AdminInput
                    label="Supplier / Brand"
                    value={form.sellerName}
                    onChange={(e) => setForm((f) => ({ ...f, sellerName: e.target.value }))}
                    required
                  />
                )}
                <AdminInput
                  label="Price (USD)"
                  type="number"
                  inputMode="numeric"
                  value={form.priceUsd}
                  onChange={(e) => setForm((f) => ({ ...f, priceUsd: e.target.value }))}
                  placeholder="450"
                  required
                />
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
                  label="Stock status"
                  value={form.stockNote}
                  onChange={(e) => setForm((f) => ({ ...f, stockNote: e.target.value }))}
                  placeholder="In Stock • Immediate Dispatch"
                  wrapClassName="sm:col-span-2"
                />
              </ModalGrid>
            </ModalSection>

            <ModalSection title="Description & specifications">
              <AdminTextarea
                label="Technical description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Detailed breakdown, warranty, protective features..."
                required
              />
              <ModalGrid>
                <AdminTextarea
                  label="Specifications"
                  hint="Format: Label: Value (1 per line)"
                  rows={4}
                  value={form.specs}
                  onChange={(e) => setForm((f) => ({ ...f, specs: e.target.value }))}
                />
                <AdminTextarea
                  label="Key highlights"
                  hint="1 highlight per line"
                  rows={4}
                  value={form.highlights}
                  onChange={(e) => setForm((f) => ({ ...f, highlights: e.target.value }))}
                />
              </ModalGrid>
            </ModalSection>

            <ModalSection title="Product photos">
              <ImageUploader
                label="Product images"
                hint="Upload 1 or more photos from your device."
                multiple={true}
                images={form.image}
                onChange={(imgs) => setForm((f) => ({ ...f, image: imgs }))}
              />
            </ModalSection>

            <ModalSection title="Visibility">
              <ModalToggle
                label="Featured product"
                description="Highlight this product on the homepage and top catalogue rail."
                checked={form.featured}
                onChange={(v) => setForm((f) => ({ ...f, featured: v }))}
              />
            </ModalSection>
          </ModalBody>

          <ModalFooter>
            <AdminButton type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit">
              {editingSlug ? 'Save product changes' : 'Create product'}
            </AdminButton>
          </ModalFooter>
        </form>
      </AdminModal>

      {/* Delete confirmation */}
      <ConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        icon={Trash2}
        title="Delete this product?"
        message={
          <>
            <strong className="text-[#0a1018]">{deleting?.title}</strong> will be permanently removed
            from the catalogue.
          </>
        }
        confirmLabel="Delete product"
        onConfirm={async () => {
          if (deleting) {
            try {
              await fetch(`/api/v1/products/${encodeURIComponent(deleting.slug)}`, {
                method: 'DELETE',
                credentials: 'include',
              });
            } catch (err) {
              console.error('Failed to delete product from database:', err);
            }
            const next = productsList.filter((p) => p.slug !== deleting.slug);
            saveStoredProducts(next);
            setProductsList(next);
            showToast(`Deleted ${deleting.title}`);
            setDeleting(null);
          }
        }}
      />
    </div>
  );
}
