'use client';

import { useMemo, useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Eye,
  Send,
  Trash2,
  CheckCircle2,
  Truck,
  Mail,
  Phone,
  MapPin,
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

interface AdminOrderItem {
  id: string;
  orderNumber: string;
  client: string;
  email: string;
  phone: string;
  province: string;
  address: string;
  supplierName: string;
  items: string;
  amountUsd: number;
  status: 'Processing' | 'In Transit' | 'Delivered' | 'Cancelled';
  waybillRef: string;
  date: string;
  notes: string;
}

const INITIAL_ORDERS: AdminOrderItem[] = [
  {
    id: 'ord-1',
    orderNumber: 'SC-ORD-2026-0412',
    client: 'Midlands Chrome Smelters Pvt Ltd',
    email: 'procurement@midlandschrome.co.zw',
    phone: '+263 77 289 1023',
    province: 'Midlands',
    address: 'Heavy Industrial Site, Stand 418, Gweru, Midlands',
    supplierName: 'SunPower Solar & Inverters Zimbabwe',
    items: '2x 15kVA Deye Hybrid Inverter + 6x 5.12kWh LiFePO4 Rack Batteries',
    amountUsd: 6850,
    status: 'In Transit',
    waybillRef: 'WB-ZIM-88412',
    date: '2026-10-09',
    notes: 'Dispatched via Swift Freight Harare depot. Expected arrival 09:00 tomorrow.',
  },
  {
    id: 'ord-2',
    orderNumber: 'SC-ORD-2026-0411',
    client: 'Eng. Tendai Mupfumi',
    email: 'tmupfumi@hararebuilders.co.zw',
    phone: '+263 71 904 5512',
    province: 'Harare',
    address: '14 Borrowdale Brooke Drive, Harare',
    supplierName: 'BuildRight Hardware & Timber',
    items: '200 Bags PPC SureBuild 42.5N Cement + 40 Lengths IBR Chromadek Roofing',
    amountUsd: 3420,
    status: 'Delivered',
    waybillRef: 'WB-HRE-44219',
    date: '2026-10-08',
    notes: 'Signed and offloaded on-site by site foreman.',
  },
  {
    id: 'ord-3',
    orderNumber: 'SC-ORD-2026-0410',
    client: 'Manicaland Estates Co-op',
    email: 'orders@manicalandestates.co.zw',
    phone: '+263 77 412 8890',
    province: 'Manicaland',
    address: 'Plot 9, Vumba Road, Mutare, Manicaland',
    supplierName: 'AgriYield Seed & Fertilizer Hub',
    items: '5 Tonnes Compound D Fertilizer + Drip Irrigation Starter Kit (2 Ha)',
    amountUsd: 4190,
    status: 'Processing',
    waybillRef: 'PENDING-DISPATCH',
    date: '2026-10-10',
    notes: 'Payment verified via EcoCash USD Corporate Merchant.',
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderItem[]>(INITIAL_ORDERS);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<AdminOrderItem | null>(null);
  const [statusModalOrder, setStatusModalOrder] = useState<AdminOrderItem | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<AdminOrderItem | null>(null);

  const [newStatusVal, setNewStatusVal] = useState<AdminOrderItem['status']>('Processing');
  const [newTrackingVal, setNewTrackingVal] = useState('');
  const [newNotesVal, setNewNotesVal] = useState('');

  const [form, setForm] = useState({
    client: '',
    email: '',
    phone: '+263 77 ',
    province: 'Harare',
    address: '',
    supplierName: 'SunPower Solar & Inverters Zimbabwe',
    items: '',
    amountUsd: '',
    status: 'Processing' as AdminOrderItem['status'],
    waybillRef: '',
    notes: '',
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesQuery =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.client.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.items.toLowerCase().includes(q) ||
        o.waybillRef.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [orders, query, statusFilter]);

  const totalVolumeUsd = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'Cancelled')
        .reduce((acc, cur) => acc + cur.amountUsd, 0),
    [orders]
  );

  function openStatusModal(order: AdminOrderItem) {
    setStatusModalOrder(order);
    setNewStatusVal(order.status);
    setNewTrackingVal(order.waybillRef === 'PENDING-DISPATCH' ? '' : order.waybillRef);
    setNewNotesVal(order.notes || '');
  }

  function handleSaveStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!statusModalOrder) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === statusModalOrder.id
          ? {
              ...o,
              status: newStatusVal,
              waybillRef: newTrackingVal.trim() || 'PENDING-DISPATCH',
              notes: newNotesVal,
            }
          : o
      )
    );
    showToast(
      `Order ${statusModalOrder.orderNumber} updated to "${newStatusVal}" & client notified via email.`
    );
    setStatusModalOrder(null);
  }

  function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    const orderNum = `SC-ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newItem: AdminOrderItem = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      client: form.client,
      email: form.email,
      phone: form.phone,
      province: form.province,
      address: form.address,
      supplierName: form.supplierName,
      items: form.items,
      amountUsd: Number(form.amountUsd) || 0,
      status: form.status,
      waybillRef: form.waybillRef.trim() || 'PENDING-DISPATCH',
      date: new Date().toISOString().split('T')[0],
      notes: form.notes,
    };
    setOrders((prev) => [newItem, ...prev]);
    setFormOpen(false);
    showToast(`Order ${orderNum} created and confirmation email sent to ${form.client}.`);
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
        title="Marketplace Orders & Waybill Logistics"
        description="Track B2B and retail equipment orders, assign inter-provincial waybill numbers, and dispatch status notifications."
      >
        <AdminButton onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> Create Manual Order
        </AdminButton>
      </AdminPageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Active Orders"
          value={orders.length}
          hint="All recorded B2B & retail dispatches"
          icon={ShoppingBag}
        />
        <StatCard
          label="Order Volume (USD)"
          value={totalVolumeUsd.toLocaleString()}
          prefix="$"
          hint="Verified gross merchandise value"
          icon={Truck}
        />
        <StatCard
          label="In Transit / Processing"
          value={orders.filter((o) => o.status === 'In Transit' || o.status === 'Processing').length}
          hint="Active provincial waybills"
          icon={MapPin}
        />
      </div>

      <Panel padded={false}>
        <Toolbar>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search order number, client, items, or waybill reference…"
          />
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            label="Filter by order status"
            className="sm:w-48"
          >
            <option value="all">All Statuses</option>
            <option value="Processing">Processing</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </FilterSelect>
          <ResultCount shown={filtered.length} total={orders.length} noun="orders" />
        </Toolbar>

        {filtered.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders match filters"
            description="Try clearing your search query or create a new order."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e6eaf1] bg-[#f4f6f9]/80 text-xs font-semibold uppercase tracking-wider text-[#6b81a5]">
                  <th className="px-5 py-3 sm:px-6">Order Ref</th>
                  <th className="px-4 py-3">Client &amp; Province</th>
                  <th className="px-4 py-3">Items &amp; Supplier</th>
                  <th className="px-4 py-3">Waybill</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6eaf1]">
                {filtered.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-[#f4f6f9]/60">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-[#0a1018] sm:px-6">
                      {o.orderNumber}
                      <span className="block text-[11px] font-sans font-normal text-[#6b81a5]">
                        {o.date}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-[#0a1018]">{o.client}</p>
                      <p className="text-xs text-[#6b81a5]">
                        {o.province} · {o.phone}
                      </p>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <p className="font-medium text-[#1f2a3d] line-clamp-1">{o.items}</p>
                      <p className="text-xs text-[#1e57eb] font-semibold">{o.supplierName}</p>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs font-semibold text-[#374966]">
                      {o.waybillRef}
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-[#0a1018] tabular-nums">
                      ${o.amountUsd.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <AdminBadge tone={statusTone(o.status)} dot>
                        {o.status}
                      </AdminBadge>
                    </td>
                    <td className="px-5 py-4 text-right sm:px-6">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          icon={Eye}
                          label="Inspect Order"
                          onClick={() => setViewingOrder(o)}
                        />
                        <IconButton
                          icon={Truck}
                          label="Update Status & Waybill"
                          tone="brand"
                          onClick={() => openStatusModal(o)}
                        />
                        <IconButton
                          icon={Send}
                          label="Resend Notification Email"
                          onClick={() =>
                            showToast(`Dispatched live tracking email to ${o.email}`)
                          }
                        />
                        <IconButton
                          icon={Trash2}
                          label="Delete Order"
                          tone="danger"
                          onClick={() => setDeletingOrder(o)}
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

      {/* View Order Modal */}
      <AdminModal
        open={Boolean(viewingOrder)}
        onClose={() => setViewingOrder(null)}
        title={`Order Dossier: ${viewingOrder?.orderNumber}`}
        description="Complete waybill, buyer contact, and fulfilment record."
        size="lg"
      >
        {viewingOrder && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-[#c8d2e0] bg-[#f4f6f9]/60 p-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6b81a5]">
                  Buyer / Consignee
                </p>
                <p className="mt-1 font-display text-base font-bold text-[#0a1018]">
                  {viewingOrder.client}
                </p>
                <p className="mt-1 text-xs text-[#374966] flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#1e57eb]" /> {viewingOrder.email}
                </p>
                <p className="mt-1 text-xs text-[#374966] flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#1e57eb]" /> {viewingOrder.phone}
                </p>
                <p className="mt-1 text-xs text-[#374966] flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#1e57eb]" /> {viewingOrder.address}
                </p>
              </div>
              <div className="sm:text-right">
                <AdminBadge tone={statusTone(viewingOrder.status)} dot>
                  {viewingOrder.status}
                </AdminBadge>
                <p className="mt-2 font-mono text-xs font-bold text-[#0a1018]">
                  Waybill: {viewingOrder.waybillRef}
                </p>
                <p className="mt-1 text-xs text-[#6b81a5]">Supplier: {viewingOrder.supplierName}</p>
                <p className="mt-2 font-display text-xl font-bold text-[#1e57eb]">
                  ${viewingOrder.amountUsd.toLocaleString()} USD
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#c8d2e0] p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#6b81a5]">
                Ordered Equipment &amp; Quantities
              </p>
              <p className="text-sm font-semibold text-[#0a1018]">{viewingOrder.items}</p>
              {viewingOrder.notes && (
                <p className="text-xs text-[#465a7e] pt-2 border-t border-[#e6eaf1]">
                  Logistics Note: {viewingOrder.notes}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <AdminButton variant="outline" onClick={() => setViewingOrder(null)}>
                Close
              </AdminButton>
              <AdminButton
                onClick={() => {
                  const o = viewingOrder;
                  setViewingOrder(null);
                  openStatusModal(o);
                }}
              >
                <Truck className="h-4 w-4" /> Update Waybill &amp; Status
              </AdminButton>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Update Status & Waybill Modal */}
      <AdminModal
        open={Boolean(statusModalOrder)}
        onClose={() => setStatusModalOrder(null)}
        title={`Update Waybill & Status: ${statusModalOrder?.orderNumber}`}
        description="Updating status automatically dispatches a tracking notification email to the buyer."
        size="md"
      >
        {statusModalOrder && (
          <form onSubmit={handleSaveStatus} className="p-6 space-y-4">
            <AdminSelect
              label="Fulfilment Status"
              value={newStatusVal}
              onChange={(e) => setNewStatusVal(e.target.value as AdminOrderItem['status'])}
            >
              <option value="Processing">Processing</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </AdminSelect>

            <AdminInput
              label="Waybill / Courier Tracking Reference"
              value={newTrackingVal}
              onChange={(e) => setNewTrackingVal(e.target.value)}
              placeholder="e.g. WB-ZIM-88412"
            />

            <AdminTextarea
              label="Dispatch / Delivery Notes"
              rows={3}
              value={newNotesVal}
              onChange={(e) => setNewNotesVal(e.target.value)}
              placeholder="Enter courier depot, driver contact, or delivery instructions..."
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-[#e6eaf1]">
              <AdminButton
                type="button"
                variant="outline"
                onClick={() => setStatusModalOrder(null)}
              >
                Cancel
              </AdminButton>
              <AdminButton type="submit">Save &amp; Notify Client</AdminButton>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Create Order Modal */}
      <AdminModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Create Manual B2B / Marketplace Order"
        description="Log a verified equipment or bulk supply order and generate waybill tracking."
        size="lg"
      >
        <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminInput
              label="Client / Company Name"
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
              placeholder="e.g. Bulawayo Mining Supplies"
              required
            />
            <AdminInput
              label="Client Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="procurement@company.co.zw"
              required
            />
            <AdminInput
              label="Client Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <AdminInput
              label="Destination Province"
              value={form.province}
              onChange={(e) => setForm({ ...form, province: e.target.value })}
              required
            />
            <AdminInput
              label="Delivery Physical Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              wrapClassName="sm:col-span-2"
              placeholder="Stand number, industrial area, city"
              required
            />
            <AdminInput
              label="Fulfilling Verified Supplier"
              value={form.supplierName}
              onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
              required
            />
            <AdminInput
              label="Total Order Value (USD)"
              type="number"
              value={form.amountUsd}
              onChange={(e) => setForm({ ...form, amountUsd: e.target.value })}
              placeholder="2450"
              required
            />
            <AdminInput
              label="Ordered Items & Quantities"
              value={form.items}
              onChange={(e) => setForm({ ...form, items: e.target.value })}
              wrapClassName="sm:col-span-2"
              placeholder="e.g. 10x 550W Jinko Solar Panels + 1x 5kVA Inverter"
              required
            />
            <AdminSelect
              label="Initial Status"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as AdminOrderItem['status'] })
              }
            >
              <option value="Processing">Processing</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
            </AdminSelect>
            <AdminInput
              label="Waybill Reference (Optional)"
              value={form.waybillRef}
              onChange={(e) => setForm({ ...form, waybillRef: e.target.value })}
              placeholder="WB-ZIM-..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#e6eaf1]">
            <AdminButton type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit">Create Order &amp; Send Email</AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation */}
      <AdminModal
        open={Boolean(deletingOrder)}
        onClose={() => setDeletingOrder(null)}
        title="Delete Order Record?"
        size="sm"
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-[#374966]">
            Are you sure you want to remove order{' '}
            <strong className="text-[#0a1018]">{deletingOrder?.orderNumber}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <AdminButton variant="outline" onClick={() => setDeletingOrder(null)}>
              Cancel
            </AdminButton>
            <AdminButton
              variant="danger"
              onClick={() => {
                if (deletingOrder) {
                  setOrders((prev) => prev.filter((o) => o.id !== deletingOrder.id));
                  showToast(`Order ${deletingOrder.orderNumber} deleted.`);
                  setDeletingOrder(null);
                }
              }}
            >
              Delete Order
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
