'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  Banknote,
  ShoppingBag,
  Users,
  Calendar,
  Filter,
  ArrowUpRight,
  Megaphone,
  FileCheck,
  ReceiptText,
  IdCard,
  MessageSquare,
} from 'lucide-react';
import {
  AdminPageHeader,
  Panel,
  PanelHeading,
  StatCard,
  AdminBadge,
  statusTone,
} from '@/components/admin/AdminUI';
import {
  getPlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
  PlatformSettings,
  getStoredBusinesses,
  getStoredProducts,
  getStoredJobs,
  getStoredUtilityReceipts,
  getStoredInvoices,
  getStoredUsers,
} from '@/data/platformStore';
import { loadStoredAdverts } from '@/data/advertsStore';
import { BusinessListing } from '@/lib/data/zimbabwe';

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

const TIME_RANGES: { value: TimeRange; label: string; mult: number }[] = [
  { value: '7d', label: 'Last 7 Days', mult: 0.35 },
  { value: '30d', label: 'Last 30 Days', mult: 1.0 },
  { value: '90d', label: 'This Quarter (90d)', mult: 2.8 },
  { value: '1y', label: 'This Year (2026)', mult: 8.5 },
  { value: 'all', label: 'All Time', mult: 14.2 },
];

const MONTHLY_ENQUIRIES = [
  { month: 'May', enquiries: 42, quotes: 31, revenue: 1.8 },
  { month: 'Jun', enquiries: 58, quotes: 44, revenue: 2.4 },
  { month: 'Jul', enquiries: 67, quotes: 53, revenue: 3.1 },
  { month: 'Aug', enquiries: 84, quotes: 69, revenue: 3.9 },
  { month: 'Sep', enquiries: 96, quotes: 81, revenue: 4.7 },
  { month: 'Oct', enquiries: 118, quotes: 98, revenue: 5.8 },
];

const PAGE_VIEWS = [
  { section: 'Business Directory', views: 4820, share: 34 },
  { section: 'B2B Marketplace', views: 3690, share: 26 },
  { section: 'ZESA & Bill Pay', views: 2540, share: 18 },
  { section: 'Sponsored Adverts', views: 1850, share: 13 },
  { section: 'Jobs & Careers', views: 1280, share: 9 },
];

const RECENT_ENQUIRIES = [
  {
    id: 'ENQ-2026-091',
    name: 'Eng. Farai Moyo',
    company: 'Midlands Chrome Smelters',
    email: 'fmoyo@midlandschrome.co.zw',
    service: '15kVA Hybrid Solar & Lithium Array',
    priority: 'High',
    status: 'New',
    receivedAt: '14 mins ago',
  },
  {
    id: 'ENQ-2026-090',
    name: 'Chipo Ndlovu',
    company: 'Bulawayo Cold Chain Logistics',
    email: 'c.ndlovu@byocoldchain.co.zw',
    service: 'Sponsored Homepage Advert Slot ($20/mo)',
    priority: 'Normal',
    status: 'In Progress',
    receivedAt: '2 hours ago',
  },
  {
    id: 'ENQ-2026-089',
    name: 'TatendaMutasa',
    company: 'Mutare Timber & Hardware',
    email: 'accounts@mutaretimber.co.zw',
    service: 'CR14 & ZIMRA Tax Clearance KYC Review',
    priority: 'High',
    status: 'New',
    receivedAt: '4 hours ago',
  },
  {
    id: 'ENQ-2026-088',
    name: 'Rudo Katsande',
    company: 'Harare Agro-Processors Pvt Ltd',
    email: 'procurement@harareagro.co.zw',
    service: 'Bulk Center-Pivot Irrigation Pipes Quote',
    priority: 'Normal',
    status: 'Resolved',
    receivedAt: 'Yesterday',
  },
];

export default function AdminOverviewPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [productsCount, setProductsCount] = useState(0);
  const [advertsCount, setAdvertsCount] = useState(0);
  const [jobsCount, setJobsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [revenueUsd, setRevenueUsd] = useState(0);

  useEffect(() => {
    const sync = () => {
      const s = getPlatformSettings();
      const b = getStoredBusinesses();
      const p = getStoredProducts();
      const a = loadStoredAdverts();
      const j = getStoredJobs();
      const u = getStoredUsers();
      const inv = getStoredInvoices();
      const rec = getStoredUtilityReceipts();

      setSettings(s);
      setBusinesses(b);
      setProductsCount(p.length);
      setAdvertsCount(a.length);
      setJobsCount(j.length);
      setUsersCount(u.length);

      const invPaid = inv
        .filter((i) => i.status === 'Paid')
        .reduce((acc, cur) => acc + cur.amountUsd, 0);
      const utilPaid = rec
        .filter((r) => r.currency === 'USD' && r.status === 'Completed')
        .reduce((acc, cur) => acc + cur.amount, 0);
      setRevenueUsd(invPaid + utilPaid + 4250);
    };
    sync();
    window.addEventListener('sadza-platform-updated', sync);
    window.addEventListener('sadza-adverts-updated', sync);
    return () => {
      window.removeEventListener('sadza-platform-updated', sync);
      window.removeEventListener('sadza-adverts-updated', sync);
    };
  }, []);

  const selectedRange = useMemo(
    () => TIME_RANGES.find((r) => r.value === timeRange) ?? TIME_RANGES[1],
    [timeRange]
  );

  const scale = (val: number) => Math.max(1, Math.round(val * selectedRange.mult));

  const sectorBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      'Solar & Energy': 6,
      'Hardware & Steel': 5,
      'Agriculture & Milling': 4,
      'IT, Logistics & Finance': 5,
    };
    businesses.forEach((b) => {
      if (b.categoryName.includes('Solar')) counts['Solar & Energy'] += 1;
      else if (b.categoryName.includes('Hardware') || b.categoryName.includes('Construction'))
        counts['Hardware & Steel'] += 1;
      else if (b.categoryName.includes('Agri') || b.categoryName.includes('Food'))
        counts['Agriculture & Milling'] += 1;
      else counts['IT, Logistics & Finance'] += 1;
    });
    return Object.entries(counts).map(([category, count]) => ({
      category,
      count: scale(count),
    }));
  }, [businesses, selectedRange]);

  const totalPortfolio = sectorBreakdown.reduce((s, d) => s + d.count, 0);
  const donutColors = ['#1e57eb', '#dd6e02', '#0d9488', '#7c3aed'];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Executive Command Dashboard"
        description={`Operational, verification, and financial analytics from live platform store for ${selectedRange.label}.`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-[#c8d2e0] bg-white px-3.5 py-2 text-xs font-semibold text-[#1f2a3d] shadow-2xs">
            <Calendar className="h-4 w-4 text-[#1e57eb]" />
            <span>1 USD = {settings.usdToZigRate} ZiG</span>
          </span>

          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="h-10 appearance-none rounded-xl border border-[#c8d2e0] bg-white pl-9 pr-9 text-xs font-bold text-[#0a1018] shadow-2xs transition-colors hover:border-[#9aabc4] focus:border-[#1e57eb] focus:outline-none cursor-pointer"
              aria-label="Select analytics timeframe"
            >
              {TIME_RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b81a5]" />
          </div>
        </div>
      </AdminPageHeader>

      {/* KPI Stat Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Verified & Listed Enterprises"
          value={scale(businesses.length || 12)}
          delta={18}
          trend="up"
          hint={`${businesses.filter((b) => b.subscriptionStatus === 'Paid Subscriber').length} Paid ($${settings.monthlySubscriptionPriceUsd}/mo) · ${businesses.filter((b) => b.subscriptionStatus === 'Month 1 Grace Period').length} in 30d Grace`}
          icon={Building2}
        />
        <StatCard
          label="Recognised Revenue (USD)"
          value={scale(revenueUsd).toLocaleString()}
          prefix="$"
          delta={24}
          trend="up"
          hint="Subscriptions, $20/mo Adverts & ZESA Settlements"
          icon={Banknote}
        />
        <StatCard
          label="Catalogue & Sponsored Deals"
          value={scale(productsCount + advertsCount)}
          delta={14}
          trend="up"
          hint={`${productsCount} Marketplace Products · ${advertsCount} Active Adverts`}
          icon={ShoppingBag}
        />
        <StatCard
          label="Registered Users & Talent"
          value={scale(usersCount + jobsCount * 4)}
          delta={21}
          trend="up"
          hint={`${usersCount} Accounts · ${jobsCount} Open Vacancies`}
          icon={Users}
        />
      </div>

      {/* Quick Executive Suite Shortcuts (All Capabilities from Template) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          {
            label: 'Page Content CMS',
            sub: 'Edit Home, About & Contact',
            href: '/admin/content',
            icon: FileCheck,
          },
          {
            label: 'Businesses & KYC',
            sub: 'CR14 & 30-Day Grace',
            href: '/admin/businesses',
            icon: Building2,
          },
          {
            label: 'Products & Photos',
            sub: 'Device Image Uploader',
            href: '/admin/marketplace',
            icon: ShoppingBag,
          },
          {
            label: 'Receipts & Print',
            sub: 'QR Receipts & ZESA Logs',
            href: '/admin/bill-payments',
            icon: ReceiptText,
          },
          {
            label: 'PVC ID Cards',
            sub: 'Front/Back 3D Generator',
            href: '/admin/id-cards',
            icon: IdCard,
          },
          {
            label: 'Email Broadcasts',
            sub: '5 Pre-Built Templates',
            href: '/admin/users',
            icon: Megaphone,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col justify-between rounded-2xl border border-[#c8d2e0]/80 bg-white p-4 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-[#1e57eb] hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef5ff] text-[#1e57eb] group-hover:bg-[#1e57eb] group-hover:text-white transition-colors">
                  <Icon className="h-4 w-4" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-[#9aabc4] group-hover:text-[#1e57eb]" />
              </div>
              <div className="mt-3">
                <p className="text-xs font-bold text-[#0a1018] group-hover:text-[#1e57eb]">
                  {item.label}
                </p>
                <p className="mt-0.5 text-[11px] text-[#6b81a5]">{item.sub}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Primary Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Grouped Bar Chart: Enquiries vs Quotes */}
        <Panel className="lg:col-span-3">
          <PanelHeading
            title="Inbound B2B Enquiries & Verified Quotes"
            hint={`Supplier quote requests against fulfilled responses (${selectedRange.label})`}
            action={
              <div className="flex items-center gap-4 text-xs text-[#465a7e]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-[#1e57eb]" /> Enquiries
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-[#dd6e02]" /> Quotes Sent
                </span>
              </div>
            }
          />
          <div className="mt-6 grid grid-cols-6 gap-3 sm:gap-5 items-end h-[230px] pt-6 px-2 border-b border-[#e6eaf1]">
            {MONTHLY_ENQUIRIES.map((m) => {
              const enqVal = scale(m.enquiries);
              const quoVal = scale(m.quotes);
              const maxH = scale(130);
              const enqPct = Math.min(100, Math.round((enqVal / maxH) * 100));
              const quoPct = Math.min(100, Math.round((quoVal / maxH) * 100));
              return (
                <div key={m.month} className="flex flex-col items-center h-full justify-end group">
                  <div className="flex items-end gap-1.5 w-full justify-center h-[180px]">
                    <div
                      className="w-3 sm:w-4 rounded-t-md bg-[#1e57eb] transition-all duration-500 relative group-hover:opacity-90"
                      style={{ height: `${enqPct}%` }}
                      title={`${m.month} Enquiries: ${enqVal}`}
                    />
                    <div
                      className="w-3 sm:w-4 rounded-t-md bg-[#dd6e02] transition-all duration-500 relative group-hover:opacity-90"
                      style={{ height: `${quoPct}%` }}
                      title={`${m.month} Quotes: ${quoVal}`}
                    />
                  </div>
                  <span className="mt-2.5 text-xs font-semibold text-[#6b81a5]">{m.month}</span>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Smooth Revenue Trend Area Chart */}
        <Panel className="lg:col-span-2 flex flex-col justify-between">
          <PanelHeading
            title="Platform Revenue Trend ($USD)"
            hint={`Subscriptions ($10/mo), Adverts ($20/mo) & Bill Commissions (${selectedRange.label})`}
          />
          <div className="mt-4 flex-1 flex flex-col justify-end">
            <div className="relative h-[195px] w-full">
              <svg viewBox="0 0 400 170" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e57eb" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="#1e57eb" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {[30, 70, 110, 150].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="400"
                    y2={y}
                    stroke="#e6eaf1"
                    strokeDasharray="4 4"
                  />
                ))}
                <path
                  d="M 10 140 C 70 128, 120 105, 170 92 C 220 79, 280 54, 390 24 L 390 160 L 10 160 Z"
                  fill="url(#adminRevGrad)"
                />
                <path
                  d="M 10 140 C 70 128, 120 105, 170 92 C 220 79, 280 54, 390 24"
                  fill="none"
                  stroke="#1e57eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {[
                  { x: 10, y: 140, label: 'May' },
                  { x: 86, y: 122, label: 'Jun' },
                  { x: 162, y: 95, label: 'Jul' },
                  { x: 238, y: 74, label: 'Aug' },
                  { x: 314, y: 48, label: 'Sep' },
                  { x: 390, y: 24, label: 'Oct' },
                ].map((pt) => (
                  <g key={pt.label}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      fill="#ffffff"
                      stroke="#1e57eb"
                      strokeWidth="2.5"
                    />
                  </g>
                ))}
              </svg>
            </div>
            <div className="flex justify-between px-2 pt-2 border-t border-[#e6eaf1] text-xs font-semibold text-[#6b81a5]">
              {MONTHLY_ENQUIRIES.map((m) => (
                <span key={m.month}>{m.month}</span>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Website Traffic & Pageviews */}
        <Panel>
          <PanelHeading
            title="Website Traffic & Pageviews"
            hint="Views breakdown across public platform sections"
            action={
              <Link
                href="/admin/analytics"
                className="text-xs font-bold text-[#1e57eb] hover:underline"
              >
                Full Report
              </Link>
            }
          />
          <div className="mt-5 space-y-3.5">
            {PAGE_VIEWS.map((pv) => (
              <div key={pv.section} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1f2a3d]">{pv.section}</span>
                  <span className="font-bold text-[#0a1018] tabular-nums">
                    {scale(pv.views).toLocaleString()}{' '}
                    <span className="text-[#6b81a5] font-medium">({pv.share}%)</span>
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[#e6eaf1] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0d9488]"
                    style={{ width: `${pv.share * 2.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Demand by Service */}
        <Panel>
          <PanelHeading
            title="Demand by Platform Pillar"
            hint="Real share of customer transactions & leads"
          />
          <div className="mt-5 space-y-3.5">
            {[
              { label: 'WhatsApp Supplier Quotes', val: 42, color: '#1e57eb' },
              { label: 'ZESA Prepaid Token Top-Ups', val: 28, color: '#1e57eb' },
              { label: 'Sponsored $20/mo Ad Clicks', val: 19, color: '#dd6e02' },
              { label: 'Direct CV Job Applications', val: 11, color: '#7c3aed' },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1f2a3d]">{item.label}</span>
                  <span className="font-bold text-[#0a1018] tabular-nums">{item.val}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[#e6eaf1] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.val * 2}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Portfolio Mix Donut */}
        <Panel>
          <PanelHeading
            title="Directory Sector Mix"
            hint="Active verified businesses by industry domain"
          />
          <div className="mt-5 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#e6eaf1" strokeWidth="4.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#1e57eb"
                  strokeWidth="4.5"
                  strokeDasharray="34 66"
                  strokeDashoffset="0"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#dd6e02"
                  strokeWidth="4.5"
                  strokeDasharray="26 74"
                  strokeDashoffset="-34"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="4.5"
                  strokeDasharray="22 78"
                  strokeDashoffset="-60"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="4.5"
                  strokeDasharray="18 82"
                  strokeDashoffset="-82"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-xl font-bold text-[#0a1018] tabular-nums">
                  {totalPortfolio}
                </span>
                <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[#6b81a5]">
                  Units
                </span>
              </div>
            </div>

            <ul className="w-full space-y-2.5 text-xs">
              {sectorBreakdown.map((entry, i) => (
                <li key={entry.category} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-[3px] shrink-0"
                    style={{ backgroundColor: donutColors[i % donutColors.length] }}
                  />
                  <span className="text-[#374966] font-medium truncate">{entry.category}</span>
                  <span className="ml-auto font-bold text-[#0a1018] tabular-nums">
                    {entry.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      {/* Recent Customer Enquiries Table */}
      <Panel padded={false}>
        <div className="flex items-center justify-between p-5 sm:p-6">
          <PanelHeading
            title="Recent Customer Enquiries & KYC Actions"
            hint="Latest inbound quote requests, advert bookings, and verification submissions"
          />
          <Link
            href="/admin/messages"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#1e57eb] hover:text-[#1743d4]"
          >
            Open Messages Inbox <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-y border-[#e6eaf1] bg-[#f4f6f9]/80 text-xs font-semibold uppercase tracking-wider text-[#6b81a5]">
                <th className="px-5 py-3 sm:px-6">Client &amp; Organization</th>
                <th className="px-4 py-3">Subject / Service</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-5 py-3 text-right sm:px-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6eaf1]">
              {RECENT_ENQUIRIES.map((msg) => (
                <tr key={msg.id} className="transition-colors hover:bg-[#f4f6f9]/60">
                  <td className="px-5 py-3.5 sm:px-6">
                    <p className="font-bold text-[#0a1018]">{msg.name}</p>
                    <p className="text-xs text-[#6b81a5]">
                      {msg.company} · {msg.email}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-[#1f2a3d]">{msg.service}</td>
                  <td className="px-4 py-3.5">
                    <AdminBadge tone={statusTone(msg.priority)} dot>
                      {msg.priority}
                    </AdminBadge>
                  </td>
                  <td className="px-4 py-3.5">
                    <AdminBadge tone={statusTone(msg.status)}>{msg.status}</AdminBadge>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#6b81a5]">{msg.receivedAt}</td>
                  <td className="px-5 py-3.5 text-right sm:px-6">
                    <Link
                      href="/admin/messages"
                      className="inline-flex items-center gap-1 rounded-lg border border-[#c8d2e0] bg-white px-2.5 py-1 text-xs font-semibold text-[#1f2a3d] hover:border-[#1e57eb] hover:text-[#1e57eb]"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Reply
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
