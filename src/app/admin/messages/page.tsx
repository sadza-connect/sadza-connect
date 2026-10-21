'use client';

import { useMemo, useState } from 'react';
import {
  Inbox,
  Search as SearchIcon,
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Wallet,
  Send,
  MailOpen,
  CheckCircle2,
} from 'lucide-react';
import {
  AdminPageHeader,
  Panel,
  AdminBadge,
  statusTone,
  AdminButton,
  FilterSelect,
  EmptyState,
} from '@/components/admin/AdminUI';
import { cn } from '@/lib/utils/cn';

interface ContactMessage {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  service: string;
  budget?: string;
  priority: 'Low' | 'Normal' | 'High';
  status: 'New' | 'In Progress' | 'Resolved';
  receivedAt: string;
  message: string;
}

const INITIAL_MESSAGES: ContactMessage[] = [];

const STATUSES: ContactMessage['status'][] = ['New', 'In Progress', 'Resolved'];
const PRIORITIES: ContactMessage['priority'][] = ['Low', 'Normal', 'High'];

export default function AdminMessagesPage() {
  const [rows, setRows] = useState<ContactMessage[]>(INITIAL_MESSAGES);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((m) => {
      const matchesQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.service.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q);
      const matchesStatus = status === 'all' || m.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [rows, query, status]);

  const selected = rows.find((m) => m.id === selectedId) ?? null;
  const newCount = rows.filter((m) => m.status === 'New').length;

  function selectMessage(id: string) {
    setSelectedId(id);
    setReply('');
    setRows((prev) =>
      prev.map((m) => (m.id === id && m.status === 'New' ? { ...m, status: 'In Progress' } : m))
    );
  }

  function setStatusFor(id: string, next: ContactMessage['status']) {
    setRows((prev) => prev.map((m) => (m.id === id ? { ...m, status: next } : m)));
    showToast(`Enquiry marked as ${next}`);
  }

  function setPriorityFor(id: string, next: ContactMessage['priority']) {
    setRows((prev) => prev.map((m) => (m.id === id ? { ...m, priority: next } : m)));
  }

  function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !reply.trim()) return;
    showToast(`Reply dispatched to ${selected.name} (${selected.email})`);
    setReply('');
    setStatusFor(selected.id, 'Resolved');
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
        title="Messages & Customer Enquiries"
        description="Inbound enquiries, KYC support tickets, and B2B quote requests from the website contact and directory forms."
      >
        <span className="inline-flex items-center gap-2 rounded-xl border border-[#c8d2e0] bg-white px-3.5 py-2 text-xs font-semibold text-[#1f2a3d]">
          <Inbox className="h-4 w-4 text-[#1e57eb]" />
          <span className="font-bold text-[#0a1018] tabular-nums">{newCount}</span> unread
        </span>
      </AdminPageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(320px,380px),1fr]">
        {/* List pane */}
        <Panel padded={false} className={cn('overflow-hidden', selected && 'hidden lg:block')}>
          <div className="space-y-3 border-b border-[#e6eaf1] p-4">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b81a5]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages…"
                className="h-10 w-full rounded-xl border border-[#c8d2e0] bg-white pl-9 pr-3 text-sm text-[#0a1018] outline-none transition-colors placeholder:text-[#6b81a5] focus:border-[#1e57eb]"
              />
            </div>
            <FilterSelect value={status} onChange={setStatus} label="Filter by status">
              <option value="all">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </FilterSelect>
          </div>

          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Inbox}
                title="No messages"
                description="Nothing matches your search or filter."
              />
            </div>
          ) : (
            <ul className="max-h-[640px] divide-y divide-[#e6eaf1] overflow-y-auto">
              {filtered.map((m) => {
                const isActive = m.id === selectedId;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => selectMessage(m.id)}
                      className={cn(
                        'flex w-full flex-col gap-1 px-4 py-3.5 text-left transition-colors cursor-pointer',
                        isActive ? 'bg-[#eef5ff]/90' : 'hover:bg-[#f4f6f9]'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {m.status === 'New' && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-[#1e57eb]" />
                        )}
                        <span
                          className={cn(
                            'truncate text-sm',
                            m.status === 'New'
                              ? 'font-bold text-[#0a1018]'
                              : 'font-semibold text-[#1f2a3d]'
                          )}
                        >
                          {m.name}
                        </span>
                        <span className="ml-auto shrink-0 text-[0.7rem] text-[#6b81a5]">
                          {m.receivedAt}
                        </span>
                      </div>
                      <p className="truncate text-xs font-semibold text-[#1e57eb]">{m.service}</p>
                      <p className="line-clamp-1 text-xs text-[#465a7e]">{m.message}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <AdminBadge tone={statusTone(m.status)}>{m.status}</AdminBadge>
                        {m.priority === 'High' && (
                          <AdminBadge tone="danger" dot>
                            High
                          </AdminBadge>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        {/* Detail pane */}
        <Panel padded={false} className={cn('overflow-hidden', !selected && 'hidden lg:flex')}>
          {selected ? (
            <div className="flex h-full flex-col">
              <div className="border-b border-[#e6eaf1] p-5 sm:p-6">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#465a7e] hover:text-[#0a1018] lg:hidden cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to inbox
                </button>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-bold text-[#0a1018]">
                      {selected.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-[#465a7e]">
                      Enquiry about{' '}
                      <span className="font-bold text-[#1e57eb]">{selected.service}</span> ·{' '}
                      {selected.receivedAt}
                    </p>
                  </div>
                  <AdminBadge tone={statusTone(selected.priority)} dot>
                    {selected.priority} priority
                  </AdminBadge>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs text-[#374966]">
                  <a
                    href={`mailto:${selected.email}`}
                    className="inline-flex items-center gap-2 hover:text-[#1e57eb]"
                  >
                    <Mail className="h-4 w-4 text-[#6b81a5]" /> {selected.email}
                  </a>
                  <a
                    href={`tel:${selected.phone}`}
                    className="inline-flex items-center gap-2 hover:text-[#1e57eb]"
                  >
                    <Phone className="h-4 w-4 text-[#6b81a5]" /> {selected.phone}
                  </a>
                  {selected.company && (
                    <span className="inline-flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#6b81a5]" /> {selected.company}
                    </span>
                  )}
                  {selected.budget && (
                    <span className="inline-flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-[#6b81a5]" /> Est. Value: {selected.budget}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                <p className="whitespace-pre-line text-sm leading-relaxed text-[#1f2a3d]">
                  {selected.message}
                </p>
              </div>

              <div className="border-t border-[#e6eaf1] bg-[#f4f6f9]/60 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex rounded-xl border border-[#c8d2e0] bg-white p-0.5">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatusFor(selected.id, s)}
                        className={cn(
                          'rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer',
                          selected.status === s
                            ? 'bg-[#0a1018] text-white'
                            : 'text-[#465a7e] hover:text-[#0a1018]'
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  <div className="w-40">
                    <FilterSelect
                      value={selected.priority}
                      onChange={(v) =>
                        setPriorityFor(selected.id, v as ContactMessage['priority'])
                      }
                      label="Set priority"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p} priority
                        </option>
                      ))}
                    </FilterSelect>
                  </div>
                </div>

                <form onSubmit={sendReply} className="mt-4">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={`Write official response to ${selected.name}…`}
                    rows={3}
                    className="w-full resize-y rounded-xl border border-[#c8d2e0] bg-white px-4 py-3 text-sm leading-relaxed text-[#0a1018] outline-none transition-colors placeholder:text-[#9aabc4] focus:border-[#1e57eb]"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-[#6b81a5]">
                      Replies are dispatched with Sadza Connect HQ headers.
                    </p>
                    <AdminButton type="submit" size="sm" disabled={!reply.trim()}>
                      <Send className="h-4 w-4" /> Send Reply
                    </AdminButton>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-10">
              <EmptyState
                icon={MailOpen}
                title="Select a message"
                description="Choose an enquiry from the list to read it and respond."
              />
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
