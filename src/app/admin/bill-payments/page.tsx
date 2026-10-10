'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Receipt as ReceiptIcon,
  X,
  ShieldCheck,
  Mail,
  Printer,
  Send,
  Phone,
  MapPin,
  QrCode,
  Zap,
  CheckCircle2,
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
  AdminModal,
  SearchInput,
  FilterSelect,
  Toolbar,
  ResultCount,
  EmptyState,
} from '@/components/admin/AdminUI';
import {
  getStoredUtilityReceipts,
  UtilityReceipt,
} from '@/data/platformStore';
import { cn } from '@/lib/utils/cn';

interface OfficialReceipt {
  id: string;
  client: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  project: string;
  date: string;
  status: 'Paid' | 'Partial' | 'Void';
  issuedBy: string;
  vatRate: number;
  subtotal: number;
  vat: number;
  amount: number;
  items: { description: string; qty: number; unit: number }[];
}

const INITIAL_RECEIPTS: OfficialReceipt[] = [
  {
    id: 'REC-SC-2026-0142',
    client: 'SunPower Solar & Inverters Zimbabwe',
    clientEmail: 'accounts@sunpowersolar.co.zw',
    clientPhone: '+263 77 210 1101',
    clientAddress: 'Stand 402, Msasa Industrial Park, Harare',
    project: 'Monthly Business Listing ($10/mo) + Homepage Sponsored Advert ($20/mo)',
    date: '2026-10-09',
    status: 'Paid',
    issuedBy: 'Sadza Connect Accounts HQ',
    vatRate: 0,
    subtotal: 30,
    vat: 0,
    amount: 30,
    items: [
      { description: 'Standard Monthly Business Listing Subscription (30 Days)', qty: 1, unit: 10 },
      { description: 'Sponsored Homepage Top-6 Promotional Advert Slot', qty: 1, unit: 20 },
    ],
  },
  {
    id: 'REC-SC-2026-0141',
    client: 'Midlands Chrome Smelters Pvt Ltd',
    clientEmail: 'procurement@midlandschrome.co.zw',
    clientPhone: '+263 77 289 1023',
    clientAddress: 'Heavy Industrial Site, Gweru, Midlands',
    project: 'Commercial Hybrid Solar Equipment Supply Settlement',
    date: '2026-10-08',
    status: 'Paid',
    issuedBy: 'Sadza Connect Trade Desk',
    vatRate: 15,
    subtotal: 5800,
    vat: 870,
    amount: 6670,
    items: [
      { description: '15kVA Three-Phase Hybrid Inverter Bank', qty: 2, unit: 1900 },
      { description: '5.12kWh LiFePO4 Server Rack Battery Pack', qty: 2, unit: 1000 },
    ],
  },
  {
    id: 'REC-SC-2026-0140',
    client: 'BuildRight Hardware & Timber',
    clientEmail: 'finance@buildright.co.zw',
    clientPhone: '+263 71 450 2231',
    clientAddress: 'Belmont Industrial Area, Bulawayo',
    project: 'Annual Enterprise Directory & Sponsored Deal Package',
    date: '2026-10-05',
    status: 'Paid',
    issuedBy: 'Sadza Connect Accounts HQ',
    vatRate: 0,
    subtotal: 120,
    vat: 0,
    amount: 120,
    items: [
      { description: '12-Month Verified Enterprise Directory Subscription', qty: 12, unit: 10 },
    ],
  },
];

type ItemDraft = { description: string; qty: string; unit: string };

export default function AdminBillPaymentsPage() {
  const [activeTab, setActiveTab] = useState<'receipts' | 'utilities'>('receipts');
  const [rows, setRows] = useState<OfficialReceipt[]>(INITIAL_RECEIPTS);
  const [utilityLogs, setUtilityLogs] = useState<UtilityReceipt[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [toast, setToast] = useState<string | null>(null);

  const [viewing, setViewing] = useState<OfficialReceipt | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [emailModalReceipt, setEmailModalReceipt] = useState<OfficialReceipt | null>(null);
  const [targetEmail, setTargetEmail] = useState('');
  const [customNote, setCustomNote] = useState('');

  const [form, setForm] = useState({
    client: '',
    clientEmail: '',
    clientPhone: '+263 77 ',
    clientAddress: 'Harare, Zimbabwe',
    project: 'Monthly Business Listing ($10/mo)',
    date: '2026-10-10',
    status: 'Paid' as OfficialReceipt['status'],
    issuedBy: 'Sadza Connect Accounts HQ',
    vatRate: '0',
    items: [
      { description: 'Monthly Verified Business Listing ($10/mo)', qty: '1', unit: '10' },
    ] as ItemDraft[],
  });

  useEffect(() => {
    const sync = () => setUtilityLogs(getStoredUtilityReceipts());
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
    return rows.filter((r) => {
      const matchesQ =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.client.toLowerCase().includes(q) ||
        r.project.toLowerCase().includes(q);
      const matchesStatus = status === 'all' || r.status === status;
      return matchesQ && matchesStatus;
    });
  }, [rows, query, status]);

  const totalValue = useMemo(
    () => rows.filter((r) => r.status !== 'Void').reduce((s, r) => s + r.amount, 0),
    [rows]
  );

  const draftSubtotal = useMemo(
    () =>
      form.items.reduce(
        (sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unit) || 0),
        0
      ),
    [form.items]
  );
  const draftVat = Math.round((draftSubtotal * (Number(form.vatRate) || 0)) / 100);
  const draftGrandTotal = draftSubtotal + draftVat;

  function openCreate() {
    setEditingId(null);
    setForm({
      client: '',
      clientEmail: '',
      clientPhone: '+263 77 ',
      clientAddress: 'Harare, Zimbabwe',
      project: 'Monthly Business Listing ($10/mo)',
      date: '2026-10-10',
      status: 'Paid',
      issuedBy: 'Sadza Connect Accounts HQ',
      vatRate: '0',
      items: [{ description: 'Standard Monthly Business Listing ($10/mo)', qty: '1', unit: '10' }],
    });
    setFormOpen(true);
  }

  function openEdit(r: OfficialReceipt) {
    setEditingId(r.id);
    setForm({
      client: r.client,
      clientEmail: r.clientEmail,
      clientPhone: r.clientPhone,
      clientAddress: r.clientAddress,
      project: r.project,
      date: r.date,
      status: r.status,
      issuedBy: r.issuedBy,
      vatRate: String(r.vatRate),
      items: r.items.map((i) => ({
        description: i.description,
        qty: String(i.qty),
        unit: String(i.unit),
      })),
    });
    setFormOpen(true);
  }

  function handleSaveReceipt(e: React.FormEvent) {
    e.preventDefault();
    const parsedItems = form.items
      .filter((i) => i.description.trim())
      .map((i) => ({
        description: i.description.trim(),
        qty: Number(i.qty) || 1,
        unit: Number(i.unit) || 0,
      }));
    const subtotal = parsedItems.reduce((s, i) => s + i.qty * i.unit, 0);
    const vatRate = Number(form.vatRate) || 0;
    const vat = Math.round((subtotal * vatRate) / 100);
    const amount = subtotal + vat;

    if (editingId) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                client: form.client,
                clientEmail: form.clientEmail,
                clientPhone: form.clientPhone,
                clientAddress: form.clientAddress,
                project: form.project,
                date: form.date,
                status: form.status,
                issuedBy: form.issuedBy,
                vatRate,
                subtotal,
                vat,
                amount,
                items: parsedItems,
              }
            : r
        )
      );
      showToast(`Updated official receipt ${editingId}`);
    } else {
      const id = `REC-SC-2026-0${rows.length + 143}`;
      setRows((prev) => [
        {
          id,
          client: form.client,
          clientEmail: form.clientEmail,
          clientPhone: form.clientPhone,
          clientAddress: form.clientAddress,
          project: form.project,
          date: form.date,
          status: form.status,
          issuedBy: form.issuedBy,
          vatRate,
          subtotal,
          vat,
          amount,
          items: parsedItems,
        },
        ...prev,
      ]);
      showToast(`Issued official receipt ${id}`);
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
        title="Receipts, Financial Billing & ZESA Token Ledger"
        description="Issue, print, and email official QR-verifiable payment receipts to clients, and audit live ZESA/utility token settlements."
      >
        <AdminButton onClick={openCreate}>
          <Plus className="h-4 w-4" /> Issue New Receipt
        </AdminButton>
      </AdminPageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Official Receipts Issued"
          value={rows.length}
          hint="Subscriptions, Adverts & B2B Trade"
          icon={ReceiptIcon}
        />
        <StatCard
          label="Recognised Receipt Value"
          value={`$${totalValue.toLocaleString()}`}
          hint="Verified USD collections"
          icon={ShieldCheck}
        />
        <StatCard
          label="ZESA & Utility Tokens Issued"
          value={utilityLogs.length}
          hint="Instant prepaid token settlements"
          icon={Zap}
        />
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-[#c8d2e0]">
        <button
          type="button"
          onClick={() => setActiveTab('receipts')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-colors cursor-pointer',
            activeTab === 'receipts'
              ? 'border-[#1e57eb] text-[#1e57eb] bg-white/70'
              : 'border-transparent text-[#465a7e] hover:text-[#0a1018]'
          )}
        >
          <ReceiptIcon className="h-4 w-4" />
          Official Financial Receipts ({rows.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('utilities')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-colors cursor-pointer',
            activeTab === 'utilities'
              ? 'border-[#1e57eb] text-[#1e57eb] bg-white/70'
              : 'border-transparent text-[#465a7e] hover:text-[#0a1018]'
          )}
        >
          <Zap className="h-4 w-4" />
          ZESA &amp; Utility Token Ledger ({utilityLogs.length})
        </button>
      </div>

      {activeTab === 'receipts' ? (
        <Panel padded={false}>
          <Toolbar>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search receipt ID, client name, email, or project…"
            />
            <FilterSelect
              value={status}
              onChange={setStatus}
              label="Filter by status"
              className="sm:w-44"
            >
              <option value="all">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Void">Void</option>
            </FilterSelect>
            <ResultCount shown={filtered.length} total={rows.length} noun="receipts" />
          </Toolbar>

          {filtered.length === 0 ? (
            <EmptyState
              icon={ReceiptIcon}
              title="No receipts found"
              description="Try clearing your search filter or issue a new receipt."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e6eaf1] bg-[#f4f6f9]/80 text-xs font-semibold uppercase tracking-wider text-[#6b81a5]">
                    <th className="px-5 py-3 sm:px-6">Receipt ID</th>
                    <th className="px-4 py-3">Client &amp; Contact</th>
                    <th className="px-4 py-3">Description / Plan</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Total (USD)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-5 py-3 text-right sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6eaf1]">
                  {filtered.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-[#f4f6f9]/60">
                      <td className="px-5 py-4 font-mono text-xs font-bold text-[#0a1018] sm:px-6">
                        {row.id}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-[#0a1018]">{row.client}</p>
                        <p className="text-xs text-[#6b81a5]">{row.clientEmail}</p>
                      </td>
                      <td className="px-4 py-4 font-medium text-[#1f2a3d] max-w-xs">
                        <p className="line-clamp-1">{row.project}</p>
                      </td>
                      <td className="px-4 py-4 text-xs text-[#6b81a5]">{row.date}</td>
                      <td className="px-4 py-4 font-mono font-bold text-[#0a1018] tabular-nums">
                        ${row.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <AdminBadge tone={statusTone(row.status)} dot>
                          {row.status}
                        </AdminBadge>
                      </td>
                      <td className="px-5 py-4 text-right sm:px-6">
                        <div className="flex items-center justify-end gap-1">
                          <IconButton
                            icon={Eye}
                            label="View & Print Official Receipt"
                            tone="brand"
                            onClick={() => setViewing(row)}
                          />
                          <IconButton
                            icon={Mail}
                            label="Email Receipt to Client"
                            onClick={() => {
                              setEmailModalReceipt(row);
                              setTargetEmail(row.clientEmail);
                              setCustomNote('');
                            }}
                          />
                          <IconButton
                            icon={Pencil}
                            label="Edit Receipt"
                            onClick={() => openEdit(row)}
                          />
                          <IconButton
                            icon={Trash2}
                            label="Void Receipt"
                            tone="danger"
                            onClick={() => {
                              setRows((prev) => prev.filter((r) => r.id !== row.id));
                              showToast(`Voided receipt ${row.id}`);
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
      ) : (
        <Panel padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e6eaf1] bg-[#f4f6f9]/80 text-xs font-semibold uppercase tracking-wider text-[#6b81a5]">
                  <th className="px-5 py-3 sm:px-6">Reference</th>
                  <th className="px-4 py-3">Utility Biller</th>
                  <th className="px-4 py-3">Meter / Policy #</th>
                  <th className="px-4 py-3">Token / Confirmation</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6eaf1]">
                {utilityLogs.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-[#f4f6f9]/60">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#0a1018] sm:px-6">
                      {u.reference}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[#1f2a3d]">{u.service}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-[#374966]">
                      {u.accountOrMeter}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-[#1e57eb]">
                      {u.tokenOrConfirmation}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-[#0a1018]">
                      {u.currency === 'USD' ? `$${u.amount}` : `${u.amount} ZiG`}
                    </td>
                    <td className="px-4 py-3.5">
                      <AdminBadge tone="success" dot>
                        {u.status}
                      </AdminBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Executive Printable Receipt Modal (modeled after Template ReceiptsManager.tsx) */}
      <AdminModal open={Boolean(viewing)} onClose={() => setViewing(null)} bare size="lg">
        {viewing && (
          <div className="bg-white text-[#0a1018] p-6 sm:p-10 rounded-2xl relative font-sans">
            <div className="flex items-center justify-between border-b border-[#e6eaf1] pb-4 mb-6 print:hidden">
              <span className="text-xs uppercase font-bold tracking-wider text-[#1e57eb]">
                Official Digital Financial Record
              </span>
              <div className="flex items-center gap-2">
                <AdminButton size="sm" variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" /> Print / Save PDF
                </AdminButton>
                <AdminButton
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const r = viewing;
                    setViewing(null);
                    setEmailModalReceipt(r);
                    setTargetEmail(r.clientEmail);
                  }}
                >
                  <Mail className="h-4 w-4" /> Email Client
                </AdminButton>
                <button
                  type="button"
                  onClick={() => setViewing(null)}
                  className="rounded-lg p-2 text-[#6b81a5] hover:bg-[#e6eaf1] cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Official Sadza Connect Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 border-b border-[#e6eaf1] pb-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e57eb] text-white font-extrabold text-sm">
                    SC
                  </span>
                  <div>
                    <p className="font-display text-lg font-extrabold text-[#0a1018]">
                      SADZA CONNECT ZIMBABWE
                    </p>
                    <p className="text-xs text-[#6b81a5]">
                      National Commercial Directory, Marketplace &amp; Utility Hub
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-[#465a7e] leading-relaxed">
                  <p>4th Floor, Joina City Commercial Tower, Jason Moyo Ave, Harare</p>
                  <p className="font-mono text-[0.7rem] text-[#6b81a5] mt-0.5">
                    ZIMRA TIN Verified · Tel: +263 242 700 891 · support@sadzaconnect.co.zw
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="text-right">
                  <AdminBadge tone={statusTone(viewing.status)} dot>
                    {viewing.status}
                  </AdminBadge>
                  <p className="font-mono text-sm font-extrabold text-[#0a1018] mt-2">
                    {viewing.id}
                  </p>
                  <p className="text-xs text-[#6b81a5]">Issue Date: {viewing.date}</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-[#c8d2e0] bg-[#f4f6f9]">
                  <QrCode className="h-12 w-12 text-[#0a1018]" />
                </div>
              </div>
            </div>

            {/* Billed To */}
            <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-[#f4f6f9] p-5 border border-[#c8d2e0]">
              <div className="space-y-1">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b81a5]">
                  BILLED TO (CLIENT DETAILS)
                </p>
                <p className="font-display text-base font-bold text-[#0a1018]">{viewing.client}</p>
                <p className="text-xs text-[#374966] flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#1e57eb]" /> {viewing.clientEmail}
                </p>
                <p className="text-xs text-[#374966] flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#1e57eb]" /> {viewing.clientPhone}
                </p>
                <p className="text-xs text-[#374966] flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#1e57eb]" /> {viewing.clientAddress}
                </p>
              </div>
              <div className="sm:text-right space-y-1">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b81a5]">
                  SERVICE &amp; ISSUER INFO
                </p>
                <p className="text-sm font-bold text-[#0a1018]">{viewing.project}</p>
                <p className="text-xs text-[#465a7e]">Issued by: {viewing.issuedBy}</p>
                <p className="text-xs font-bold text-emerald-700">Record Status: Validated</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="overflow-hidden rounded-xl border border-[#c8d2e0] my-6">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#0a1018] text-white text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 font-semibold">Item Description</th>
                    <th className="px-4 py-3 text-center font-semibold">Qty</th>
                    <th className="px-5 py-3 text-right font-semibold">Unit Price</th>
                    <th className="px-5 py-3 text-right font-semibold">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6eaf1] bg-white">
                  {viewing.items.map((it, i) => (
                    <tr key={i}>
                      <td className="px-5 py-3.5 font-medium text-[#0a1018]">{it.description}</td>
                      <td className="px-4 py-3.5 text-center font-mono">{it.qty}</td>
                      <td className="px-5 py-3.5 text-right font-mono">${it.unit}</td>
                      <td className="px-5 py-3.5 text-right font-bold font-mono text-[#0a1018]">
                        ${(it.qty * it.unit).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex flex-col items-end gap-2 text-sm border-t border-[#c8d2e0] pt-4">
              <div className="flex justify-between w-full max-w-xs text-[#374966]">
                <span>Subtotal:</span>
                <span className="font-mono font-bold">${viewing.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between w-full max-w-xs text-[#374966]">
                <span>VAT ({viewing.vatRate}%):</span>
                <span className="font-mono font-bold">${viewing.vat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between w-full max-w-xs rounded-xl bg-[#0a1018] text-white p-4 font-bold mt-2">
                <span className="uppercase text-xs tracking-wider self-center text-[#9aabc4]">
                  Grand Total (USD)
                </span>
                <span className="font-display text-xl font-extrabold font-mono">
                  ${viewing.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Email Receipt Modal */}
      <AdminModal
        open={Boolean(emailModalReceipt)}
        onClose={() => setEmailModalReceipt(null)}
        title="Email Official Receipt to Client"
        description="Dispatch this digital financial receipt directly to the client's inbox."
        size="md"
      >
        {emailModalReceipt && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              showToast(`Official Receipt ${emailModalReceipt.id} emailed to ${targetEmail}`);
              setEmailModalReceipt(null);
            }}
            className="p-6 space-y-4"
          >
            <AdminInput
              label="Recipient Email Address"
              type="email"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              required
            />
            <AdminInput
              label="Optional Milestone / Payment Note"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Thank you for your subscription payment."
            />
            <div className="flex justify-end gap-2 pt-2">
              <AdminButton
                type="button"
                variant="outline"
                onClick={() => setEmailModalReceipt(null)}
              >
                Cancel
              </AdminButton>
              <AdminButton type="submit">
                <Send className="h-4 w-4" /> Send Receipt Email
              </AdminButton>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Create / Edit Receipt Form Modal */}
      <AdminModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? `Edit Receipt: ${editingId}` : 'Issue New Official Financial Receipt'}
        description="Build itemized receipt lines, calculate VAT, and generate a verifiable QR record."
        size="lg"
      >
        <form onSubmit={handleSaveReceipt} className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminInput
              label="Client / Enterprise Name"
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
              required
            />
            <AdminInput
              label="Client Email"
              type="email"
              value={form.clientEmail}
              onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
              required
            />
            <AdminInput
              label="Client Phone"
              value={form.clientPhone}
              onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
            />
            <AdminInput
              label="Client Address"
              value={form.clientAddress}
              onChange={(e) => setForm({ ...form, clientAddress: e.target.value })}
            />
            <AdminInput
              label="Project / Subscription Title"
              value={form.project}
              onChange={(e) => setForm({ ...form, project: e.target.value })}
              required
            />
            <AdminInput
              label="Issue Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
            <AdminSelect
              label="Payment Status"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as OfficialReceipt['status'] })
              }
            >
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Void">Void</option>
            </AdminSelect>
            <AdminInput
              label="VAT Rate (%)"
              type="number"
              value={form.vatRate}
              onChange={(e) => setForm({ ...form, vatRate: e.target.value })}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-[#2c3a52]">
                Line Items
              </p>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    items: [...form.items, { description: '', qty: '1', unit: '10' }],
                  })
                }
                className="inline-flex items-center gap-1 text-xs font-bold text-[#1e57eb] cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Line Item
              </button>
            </div>
            <div className="space-y-2">
              {form.items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-[1fr,4.5rem,6.5rem,auto] gap-2">
                  <input
                    value={it.description}
                    onChange={(e) => {
                      const next = [...form.items];
                      next[idx] = { ...next[idx], description: e.target.value };
                      setForm({ ...form, items: next });
                    }}
                    placeholder="Description"
                    className="h-10 rounded-xl border border-[#c8d2e0] px-3 text-sm"
                  />
                  <input
                    type="number"
                    value={it.qty}
                    onChange={(e) => {
                      const next = [...form.items];
                      next[idx] = { ...next[idx], qty: e.target.value };
                      setForm({ ...form, items: next });
                    }}
                    className="h-10 rounded-xl border border-[#c8d2e0] px-2 text-center text-sm"
                  />
                  <input
                    type="number"
                    value={it.unit}
                    onChange={(e) => {
                      const next = [...form.items];
                      next[idx] = { ...next[idx], unit: e.target.value };
                      setForm({ ...form, items: next });
                    }}
                    placeholder="$ USD"
                    className="h-10 rounded-xl border border-[#c8d2e0] px-2 text-right text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-[#6b81a5] hover:bg-red-50 hover:text-red-600 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-[#f4f6f9] p-4 flex items-center justify-between text-sm font-bold text-[#0a1018]">
            <span>Calculated Grand Total (inc. VAT):</span>
            <span className="font-mono text-lg text-[#1e57eb]">
              ${draftGrandTotal.toLocaleString()} USD
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e6eaf1]">
            <AdminButton type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit">
              {editingId ? 'Save Receipt Changes' : 'Issue Official Receipt'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
