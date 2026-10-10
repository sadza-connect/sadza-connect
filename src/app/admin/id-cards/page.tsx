'use client';

import { useMemo, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  IdCard,
  Printer,
  CheckSquare,
  Square,
  ShieldCheck,
  RefreshCw,
  Layers,
  Phone,
  CheckCircle2,
  QrCode,
} from 'lucide-react';
import {
  AdminPageHeader,
  Panel,
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
  IconButton,
} from '@/components/admin/AdminUI';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { cn } from '@/lib/utils/cn';

interface StaffCardRecord {
  id: string;
  name: string;
  role: string;
  department: string;
  bloodGroup: string;
  phone: string;
  photo: string;
  status: 'Active' | 'Suspended' | 'Expired';
  issued: string;
  expires: string;
  prefix: 'HQ' | 'VER';
  verified: boolean;
}

const INITIAL_CARDS: StaffCardRecord[] = [
  {
    id: 'SC-HQ-0101',
    name: 'Ugwoke Levi',
    role: 'Chief Platform Architect',
    department: 'Executive Operations & KYC',
    bloodGroup: 'O+',
    phone: '+263 77 200 1001',
    photo:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
    status: 'Active',
    issued: '2026-01-15',
    expires: '2028-01-15',
    prefix: 'HQ',
    verified: true,
  },
  {
    id: 'SC-VER-0102',
    name: 'Eng. Tafadzwa Moyo',
    role: 'Field Verification Inspector',
    department: 'Harare & Mashonaland KYC',
    bloodGroup: 'A+',
    phone: '+263 71 450 8821',
    photo:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
    status: 'Active',
    issued: '2026-02-10',
    expires: '2028-02-10',
    prefix: 'VER',
    verified: true,
  },
  {
    id: 'SC-VER-0103',
    name: 'Nomsa Dube',
    role: 'Senior Commercial Auditor',
    department: 'Bulawayo & Matabeleland Hub',
    bloodGroup: 'B+',
    phone: '+263 77 812 9940',
    photo:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80',
    status: 'Active',
    issued: '2026-03-01',
    expires: '2028-03-01',
    prefix: 'VER',
    verified: true,
  },
];

function PvcIdCardPreview({
  person,
  showControls = true,
  defaultView = 'front',
}: {
  person: StaffCardRecord;
  showControls?: boolean;
  defaultView?: 'front' | 'back' | 'both';
}) {
  const [view, setView] = useState<'front' | 'back' | 'both'>(defaultView);

  const FrontCard = (
    <div className="w-[270px] h-[430px] rounded-2xl bg-white border border-[#c8d2e0] shadow-xl overflow-hidden flex flex-col justify-between relative select-none">
      {/* Top Royal Blue Header Band */}
      <div className="bg-gradient-to-br from-[#0a1018] via-[#142152] to-[#1e57eb] p-4 text-white relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-xs font-extrabold">
              SC
            </span>
            <div>
              <p className="text-[11px] font-extrabold tracking-wider uppercase">SADZA CONNECT</p>
              <p className="text-[9px] text-[#8ebfff] uppercase tracking-widest">
                Official Credential
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-400/20 border border-emerald-300/40 px-2 py-0.5 text-[9px] font-bold text-emerald-200">
            {person.status}
          </span>
        </div>

        {/* Portrait Photo */}
        <div className="mt-4 flex justify-center">
          <div className="h-24 w-24 rounded-2xl border-2 border-white shadow-lg overflow-hidden bg-[#1f2a3d]">
            <img src={person.photo} alt={person.name} className="h-full w-full object-cover" />
          </div>
        </div>
      </div>

      {/* Identity Details */}
      <div className="px-4 py-3 text-center space-y-1 flex-1 flex flex-col justify-center">
        <h4 className="font-display text-base font-extrabold text-[#0a1018]">{person.name}</h4>
        <p className="text-xs font-bold text-[#1e57eb]">{person.role}</p>
        <p className="text-[11px] text-[#465a7e]">{person.department}</p>

        <div className="mt-3 pt-3 border-t border-[#e6eaf1] grid grid-cols-2 gap-2 text-left text-[10px]">
          <div>
            <span className="text-[#6b81a5] block uppercase font-bold">ID Number</span>
            <span className="font-mono font-bold text-[#0a1018]">{person.id}</span>
          </div>
          <div>
            <span className="text-[#6b81a5] block uppercase font-bold">Blood Group</span>
            <span className="font-bold text-red-600">{person.bloodGroup}</span>
          </div>
          <div>
            <span className="text-[#6b81a5] block uppercase font-bold">Issued</span>
            <span className="font-semibold text-[#1f2a3d]">{person.issued}</span>
          </div>
          <div>
            <span className="text-[#6b81a5] block uppercase font-bold">Expires</span>
            <span className="font-semibold text-[#1f2a3d]">{person.expires}</span>
          </div>
        </div>
      </div>

      {/* Bottom Security Strip */}
      <div className="bg-[#0a1018] px-4 py-2.5 text-white flex items-center justify-between text-[10px]">
        <span className="flex items-center gap-1 font-semibold text-[#8ebfff]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#599bff]" /> CR14 &amp; KYC Authority
        </span>
        <span className="font-mono text-[9px] text-[#9aabc4]">{person.phone}</span>
      </div>
    </div>
  );

  const BackCard = (
    <div className="w-[270px] h-[430px] rounded-2xl bg-white border border-[#c8d2e0] shadow-xl overflow-hidden flex flex-col justify-between p-5 text-center select-none">
      <div className="space-y-1.5 border-b border-[#e6eaf1] pb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#1e57eb]">
          Property of Sadza Connect HQ
        </p>
        <p className="text-[11px] text-[#465a7e] leading-relaxed">
          This identification card certifies that the bearer is an authorized representative of
          Sadza Connect Zimbabwe.
        </p>
      </div>

      <div className="my-auto flex flex-col items-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-[#0a1018] bg-[#f4f6f9] p-2">
          <QrCode className="h-20 w-20 text-[#0a1018]" />
        </div>
        <p className="mt-2 font-mono text-xs font-extrabold text-[#0a1018]">{person.id}</p>
        <p className="text-[10px] text-[#6b81a5]">Scan to verify credential validity</p>
      </div>

      <div className="space-y-2 border-t border-[#e6eaf1] pt-3 text-[10px] text-[#465a7e]">
        <div className="italic font-serif text-sm text-[#0a1018]">Ugwoke Levi</div>
        <p className="font-bold uppercase tracking-wider text-[#0a1018]">
          Authorized Executive Signature
        </p>
        <p className="flex items-center justify-center gap-1 text-[10px] text-[#1e57eb] font-semibold">
          <Phone className="h-3 w-3" /> Helpdesk: +263 242 700 891
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      {showControls && (
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#c8d2e0] bg-white p-2 shadow-2xs print:hidden">
          <div className="flex items-center rounded-xl bg-[#f4f6f9] p-0.5">
            {(['front', 'back', 'both'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-all cursor-pointer',
                  view === mode
                    ? 'bg-[#1e57eb] text-white shadow-2xs'
                    : 'text-[#465a7e] hover:text-[#0a1018]'
                )}
              >
                {mode === 'both' ? (
                  <span className="inline-flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" /> Both Sides
                  </span>
                ) : (
                  `${mode} Side`
                )}
              </button>
            ))}
          </div>

          <AdminButton size="sm" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" /> Print PVC Card
          </AdminButton>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-6 py-2">
        {view === 'front' && FrontCard}
        {view === 'back' && BackCard}
        {view === 'both' && (
          <>
            {FrontCard}
            {BackCard}
          </>
        )}
      </div>

      {showControls && view !== 'both' && (
        <button
          type="button"
          onClick={() => setView(view === 'front' ? 'back' : 'front')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1e57eb] hover:underline print:hidden cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Flip to {view === 'front' ? 'Back' : 'Front'} Side
        </button>
      )}
    </div>
  );
}

export default function AdminIdCardsPage() {
  const [rows, setRows] = useState<StaffCardRecord[]>(INITIAL_CARDS);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewing, setViewing] = useState<StaffCardRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    role: '',
    department: 'Harare & Mashonaland KYC',
    bloodGroup: 'O+',
    phone: '+263 77 ',
    photo:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
    status: 'Active' as StaffCardRecord['status'],
    issued: '2026-10-10',
    expires: '2028-10-10',
    prefix: 'VER' as 'HQ' | 'VER',
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQ =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);
      const matchesStatus = status === 'all' || r.status === status;
      return matchesQ && matchesStatus;
    });
  }, [rows, query, status]);

  function openCreate() {
    setEditingId(null);
    setForm({
      name: '',
      role: 'Field Verification Officer',
      department: 'Harare & Mashonaland KYC',
      bloodGroup: 'O+',
      phone: '+263 77 ',
      photo:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
      status: 'Active',
      issued: '2026-10-10',
      expires: '2028-10-10',
      prefix: 'VER',
    });
    setFormOpen(true);
  }

  function openEdit(person: StaffCardRecord) {
    setEditingId(person.id);
    setForm({
      name: person.name,
      role: person.role,
      department: person.department,
      bloodGroup: person.bloodGroup,
      phone: person.phone,
      photo: person.photo,
      status: person.status,
      issued: person.issued,
      expires: person.expires,
      prefix: person.prefix,
    });
    setFormOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      setRows((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, ...form, verified: true } : r))
      );
      showToast(`Updated PVC ID Card for ${form.name}`);
    } else {
      const id = `SC-${form.prefix}-0${rows.length + 105}`;
      setRows((prev) => [{ id, ...form, verified: true }, ...prev]);
      showToast(`Issued new PVC ID Card ${id} for ${form.name}`);
    }
    setFormOpen(false);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
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
        title="Staff & Inspector PVC ID Card Generator"
        description="Issue, preview (Front/Back/Both Sides), and print official verifiable PVC identification cards for Sadza Connect staff and field KYC inspectors."
      >
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <AdminButton variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print Selected ({selectedIds.length})
            </AdminButton>
          )}
          <AdminButton size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Issue New ID Card
          </AdminButton>
        </div>
      </AdminPageHeader>

      <Panel padded={false}>
        <Toolbar>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search staff name, title, department, or ID number…"
          />
          <FilterSelect
            value={status}
            onChange={setStatus}
            label="Filter by card status"
            className="sm:w-44"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Expired">Expired</option>
          </FilterSelect>
          <ResultCount shown={filtered.length} total={rows.length} noun="ID cards" />
        </Toolbar>

        {filtered.length === 0 ? (
          <EmptyState
            icon={IdCard}
            title="No ID cards match filters"
            description="Try a different search query or issue a new staff ID card."
          />
        ) : (
          <div className="p-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((person) => {
              const isSelected = selectedIds.includes(person.id);
              return (
                <div
                  key={person.id}
                  className={cn(
                    'rounded-2xl border p-4 transition-all bg-white',
                    isSelected
                      ? 'border-[#1e57eb] ring-2 ring-[#1e57eb]/20'
                      : 'border-[#c8d2e0] hover:border-[#9aabc4]'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSelect(person.id)}
                        className="text-[#465a7e] hover:text-[#1e57eb] cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-[#1e57eb]" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                      <img
                        src={person.photo}
                        alt={person.name}
                        className="h-12 w-12 rounded-xl object-cover border border-[#c8d2e0]"
                      />
                      <div>
                        <p className="font-bold text-[#0a1018]">{person.name}</p>
                        <p className="text-xs font-semibold text-[#1e57eb]">{person.role}</p>
                        <p className="font-mono text-[11px] text-[#6b81a5]">{person.id}</p>
                      </div>
                    </div>
                    <AdminBadge tone={statusTone(person.status)} dot>
                      {person.status}
                    </AdminBadge>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#e6eaf1] flex items-center justify-between text-xs text-[#465a7e]">
                    <span>{person.department}</span>
                    <div className="flex items-center gap-1">
                      <IconButton
                        icon={Eye}
                        label="3D Preview & Print Card"
                        tone="brand"
                        onClick={() => setViewing(person)}
                      />
                      <IconButton
                        icon={Pencil}
                        label="Edit Card"
                        onClick={() => openEdit(person)}
                      />
                      <IconButton
                        icon={Trash2}
                        label="Revoke Card"
                        tone="danger"
                        onClick={() => {
                          setRows((prev) => prev.filter((r) => r.id !== person.id));
                          showToast(`Revoked ID card ${person.id}`);
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {/* Interactive Front/Back/Both Preview Modal */}
      <AdminModal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={`PVC Credential Preview: ${viewing?.name} (${viewing?.id})`}
        description="Switch between Front Side, Back Side (with QR Verification), or Both Sides for physical PVC printing."
        size="xl"
      >
        {viewing && (
          <div className="p-6 bg-[#f4f6f9]/60">
            <PvcIdCardPreview person={viewing} showControls defaultView="both" />
          </div>
        )}
      </AdminModal>

      {/* Issue / Edit ID Card Modal */}
      <AdminModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? `Edit PVC ID Card: ${editingId}` : 'Issue New Staff / Inspector PVC ID Card'}
        description="Upload portrait photo from device and configure credential validity."
        size="lg"
      >
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminInput
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Eng. Farai Ndlovu"
              required
            />
            <AdminInput
              label="Official Role / Title"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="e.g. Senior KYC Verification Officer"
              required
            />
            <AdminInput
              label="Provincial Hub / Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              required
            />
            <AdminInput
              label="Official Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <AdminSelect
              label="ID Prefix Series"
              value={form.prefix}
              onChange={(e) => setForm({ ...form, prefix: e.target.value as 'HQ' | 'VER' })}
            >
              <option value="HQ">SC-HQ (Executive &amp; Engineering)</option>
              <option value="VER">SC-VER (Field KYC Inspector)</option>
            </AdminSelect>
            <AdminSelect
              label="Card Status"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as StaffCardRecord['status'] })
              }
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Expired">Expired</option>
            </AdminSelect>
            <AdminInput
              label="Issue Date"
              type="date"
              value={form.issued}
              onChange={(e) => setForm({ ...form, issued: e.target.value })}
              required
            />
            <AdminInput
              label="Expiry Date"
              type="date"
              value={form.expires}
              onChange={(e) => setForm({ ...form, expires: e.target.value })}
              required
            />
          </div>

          <ImageUploader
            label="Portrait Photo (Upload from Device or Paste URL)"
            multiple={false}
            images={form.photo ? [{ src: form.photo, caption: form.name || 'Portrait' }] : []}
            onChange={(imgs) => setForm({ ...form, photo: imgs[0]?.src || '' })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-[#e6eaf1]">
            <AdminButton type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit">
              {editingId ? 'Save ID Card Changes' : 'Issue PVC ID Card'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
