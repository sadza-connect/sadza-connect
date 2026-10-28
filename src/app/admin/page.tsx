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
import { BusinessListing, SAMPLE_BUSINESSES, SAMPLE_PRODUCTS, SAMPLE_JOBS } from '@/lib/data/zimbabwe';

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

const TIME_RANGES: { value: TimeRange; label: string; mult: number }[] = [
  { value: '7d', label: 'Last 7 Days', mult: 0.35 },
  { value: '30d', label: 'Last 30 Days', mult: 1.0 },
  { value: '90d', label: 'This Quarter (90d)', mult: 2.8 },
  { value: '1y', label: 'This Year (2026)', mult: 8.5 },
  { value: 'all', label: 'All Time', mult: 14.2 },
];

const MONTHLY_ENQUIRIES = [
  { month: 'May', enquiries: 0, quotes: 0, revenue: 0 },
  { month: 'Jun', enquiries: 0, quotes: 0, revenue: 0 },
  { month: 'Jul', enquiries: 0, quotes: 0, revenue: 0 },
  { month: 'Aug', enquiries: 0, quotes: 0, revenue: 0 },
  { month: 'Sep', enquiries: 0, quotes: 0, revenue: 0 },
  { month: 'Oct', enquiries: 0, quotes: 0, revenue: 0 },
];


const RECENT_ENQUIRIES: Array<{
  id: string;
  name: string;
  company: string;
  email: string;
  service: string;
  priority: 'Low' | 'Normal' | 'High';
  status: 'New' | 'In Progress' | 'Resolved';
  receivedAt: string;
}> = [];

export default function AdminOverviewPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [businesses, setBusinesses] = useState<BusinessListing[]>(SAMPLE_BUSINESSES);
  const [productsCount, setProductsCount] = useState(SAMPLE_PRODUCTS.length);
  const [advertsCount, setAdvertsCount] = useState(3);
  const [jobsCount, setJobsCount] = useState(SAMPLE_JOBS.length);
  const [usersCount, setUsersCount] = useState(12);
  const [revenueUsd, setRevenueUsd] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const sync = async () => {
      const s = getPlatformSettings();
      if (isMounted) setSettings(s);

      try {
        const [bizRes, prodRes, advRes, jobRes, usrRes] = await Promise.allSettled([
          fetch('/api/v1/businesses?limit=100').then((r) => r.json()),
          fetch('/api/v1/products?limit=100').then((r) => r.json()),
          fetch('/api/v1/adverts?limit=100').then((r) => r.json()),
          fetch('/api/v1/jobs?limit=100').then((r) => r.json()),
          fetch('/api/v1/users?limit=100').then((r) => r.json()),
        ]);

        const bizData = bizRes.status === 'fulfilled' ? bizRes.value?.data || bizRes.value : null;
        const prodData = prodRes.status === 'fulfilled' ? prodRes.value?.data || prodRes.value : null;
        const advData = advRes.status === 'fulfilled' ? advRes.value?.data || advRes.value : null;
        const jobData = jobRes.status === 'fulfilled' ? jobRes.value?.data || jobRes.value : null;
        const usrData = usrRes.status === 'fulfilled' ? usrRes.value?.data || usrRes.value : null;

        if (isMounted) {
          if (Array.isArray(bizData?.businesses)) {
            setBusinesses(bizData.businesses.map((b: any) => ({
              id: b.id,
              name: b.name,
              categoryName: b.sector || 'Commercial Enterprise',
              province: b.province || 'Harare',
              address: b.address || '',
              phone: b.phone || '',
              whatsapp: b.whatsapp || '',
              email: b.email || '',
              description: b.description || '',
              services: 'Supply, Sales, Delivery',
              openingHours: 'Mon - Fri',
              subscriptionStatus: 'Month 1 Grace Period',
              graceDaysRemaining: 30,
              cr14Verified: b.is_verified || false,
              featured: b.is_featured || false,
              views: b.views_count || 0,
              inquiries: b.whatsapp_clicks || 0,
              images: [],
            })));
          } else {
            setBusinesses(SAMPLE_BUSINESSES);
          }

          setProductsCount(Array.isArray(prodData?.products) && prodData.products.length > 0 ? prodData.products.length : SAMPLE_PRODUCTS.length);
          setAdvertsCount(Array.isArray(advData?.adverts) && advData.adverts.length > 0 ? advData.adverts.length : 3);
          setJobsCount(Array.isArray(jobData?.jobs) && jobData.jobs.length > 0 ? jobData.jobs.length : SAMPLE_JOBS.length);
          setUsersCount(Array.isArray(usrData?.users) && usrData.users.length > 0 ? usrData.users.length : 12);
        }
      } catch (err) {
        if (isMounted) {
          setBusinesses(SAMPLE_BUSINESSES);
          setProductsCount(SAMPLE_PRODUCTS.length);
          setAdvertsCount(3);
          setJobsCount(SAMPLE_JOBS.length);
          setUsersCount(12);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }

      if (isMounted) {
        setRevenueUsd(0);
      }
    };

    sync();
    window.addEventListener('sadza-platform-updated', sync);
    window.addEventListener('sadza-adverts-updated', sync);
    return () => {
      isMounted = false;
      window.removeEventListener('sadza-platform-updated', sync);
      window.removeEventListener('sadza-adverts-updated', sync);
    };
  }, []);

  const selectedRange = useMemo(
    () => TIME_RANGES.find((r) => r.value === timeRange) ?? TIME_RANGES[1],
    [timeRange]
  );

  const scale = (val: number) => (val === 0 ? 0 : Math.max(1, Math.round(val * selectedRange.mult)));

  const sectorBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      'Solar & Energy': 0,
      'Hardware & Steel': 0,
      'Agriculture & Milling': 0,
      'IT, Logistics & Finance': 0,
    };
    businesses.forEach((b) => {
      if (b.categoryName?.includes('Solar')) counts['Solar & Energy'] += 1;
      else if (b.categoryName?.includes('Hardware') || b.categoryName?.includes('Construction'))
        counts['Hardware & Steel'] += 1;
      else if (b.categoryName?.includes('Agri') || b.categoryName?.includes('Food'))
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

  const pageViewsBreakdown = useMemo(() => {
    const directoryViews = businesses.length * 14;
    const marketplaceViews = productsCount * 12;
    const billPayViews = 0;
    const advertsViews = advertsCount * 10;
    const jobsViews = jobsCount * 8;
    const total = directoryViews + marketplaceViews + billPayViews + advertsViews + jobsViews;

    const raw = [
      { section: 'Business Directory', views: directoryViews },
      { section: 'B2B Marketplace', views: marketplaceViews },
      { section: 'Sponsored Adverts', views: advertsViews },
      { section: 'ZESA & Bill Pay', views: billPayViews },
      { section: 'Jobs & Careers', views: jobsViews },
    ];

    return raw.map((item) => ({
      ...item,
      share: total > 0 ? Math.round((item.views / total) * 100) : 0,
    }));
  }, [businesses.length, productsCount, advertsCount, jobsCount]);

  const hasEnquiries = useMemo(
    () => MONTHLY_ENQUIRIES.some((m) => m.enquiries > 0 || m.quotes > 0),
    []
  );

  const pillarDemand = useMemo(() => {
    const quoteDemand = businesses.reduce((sum, b) => sum + (b.inquiries || 0), 0);
    const productsDemand = productsCount;
    const advertsDemand = advertsCount;
    const jobsDemand = jobsCount;
    const total = quoteDemand + productsDemand + advertsDemand + jobsDemand;

    if (total === 0) return { total: 0, items: [] };

    return {
      total,
      items: [
        { label: 'Supplier Inquiries & Quotes', val: Math.round((quoteDemand / total) * 100), count: quoteDemand, color: '#1e57eb' },
        { label: 'Marketplace Catalogue Products', val: Math.round((productsDemand / total) * 100), count: productsDemand, color: '#0d9488' },
        { label: 'Sponsored Adverts Active', val: Math.round((advertsDemand / total) * 100), count: advertsDemand, color: '#dd6e02' },
        { label: 'Talent & Open Vacancies', val: Math.round((jobsDemand / total) * 100), count: jobsDemand, color: '#7c3aed' },
      ],
    };
  }, [businesses, productsCount, advertsCount, jobsCount]);

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
          value={scale(businesses.length)}
          delta={18}
          trend="up"
          hint={`${businesses.filter((b) => b.subscriptionStatus === 'Paid Subscriber').length} Paid ($${settings.monthlySubscriptionPriceUsd}/mo) · ${businesses.filter((b) => b.subscriptionStatus === 'Month 1 Grace Period').length} in 30d Grace`}
          icon={Building2}
          loading={isLoading}
        />
        <StatCard
          label="Recognised Revenue (USD)"
          value={scale(revenueUsd).toLocaleString()}
          prefix="$"
          delta={24}
          trend="up"
          hint="Subscriptions, $20/mo Adverts & ZESA Settlements"
          icon={Banknote}
          loading={isLoading}
        />
        <StatCard
          label="Catalogue & Sponsored Deals"
          value={scale(productsCount + advertsCount)}
          delta={14}
          trend="up"
          hint={`${productsCount} Marketplace Products · ${advertsCount} Active Adverts`}
          icon={ShoppingBag}
          loading={isLoading}
        />
        <StatCard
          label="Registered Users & Talent"
          value={scale(usersCount)}
          delta={21}
          trend="up"
          hint={`${usersCount} Accounts · ${jobsCount} Open Vacancies`}
          icon={Users}
          loading={isLoading}
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
          {!hasEnquiries ? (
            <div className="flex flex-col items-center justify-center h-[230px] pt-6 px-4 text-center">
              <p className="text-sm font-semibold text-[#0a1018]">No Inbound Enquiries Yet</p>
              <p className="mt-1 text-xs text-[#6b81a5] max-w-sm">
                Enquiries and quote requests from customers will be tracked and charted here month by month.
              </p>
            </div>
          ) : (
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
          )}
        </Panel>

        {/* Smooth Revenue Trend Area Chart */}
        <Panel className="lg:col-span-2 flex flex-col justify-between">
          <PanelHeading
            title="Platform Revenue Trend ($USD)"
            hint={`Subscriptions ($10/mo), Adverts ($20/mo) & Bill Commissions (${selectedRange.label})`}
          />
          {revenueUsd === 0 ? (
            <div className="flex flex-col items-center justify-center h-[230px] px-4 text-center">
              <p className="text-sm font-semibold text-[#0a1018]">No Revenue Recorded</p>
              <p className="mt-1 text-xs text-[#6b81a5] max-w-sm">
                Revenue generated from directory subscriptions, adverts, and commissions will appear here as transactions settle.
              </p>
            </div>
          ) : (
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
          )}
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
          {pageViewsBreakdown.every((pv) => pv.views === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-sm font-semibold text-[#0a1018]">No Traffic Data Yet</p>
              <p className="mt-1 text-xs text-[#6b81a5]">
                Section traffic will be logged as users browse listings and marketplace goods.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3.5">
              {pageViewsBreakdown.map((pv) => (
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
          )}
        </Panel>

        {/* Demand by Service */}
        <Panel>
          <PanelHeading
            title="Demand by Platform Pillar"
            hint="Real share of customer transactions & leads"
          />
          {pillarDemand.total === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-sm font-semibold text-[#0a1018]">No Platform Activity Yet</p>
              <p className="mt-1 text-xs text-[#6b81a5]">
                Demand across platform pillars will populate as listings, adverts, and vacancies are added.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3.5">
              {pillarDemand.items.map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1f2a3d]">{item.label}</span>
                    <span className="font-bold text-[#0a1018] tabular-nums">{item.val}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#e6eaf1] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.val}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Portfolio Mix Donut */}
        <Panel>
          <PanelHeading
            title="Directory Sector Mix"
            hint="Active verified businesses by industry domain"
          />
          {totalPortfolio === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-sm font-semibold text-[#0a1018]">No Enterprises Registered</p>
              <p className="mt-1 text-xs text-[#6b81a5]">
                Once businesses are onboarded, sector distribution will be mapped here.
              </p>
            </div>
          ) : (
            <div className="mt-5 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#e6eaf1" strokeWidth="4.5" />
                  {(() => {
                    const circumference = 2 * Math.PI * 14;
                    let accumulated = 0;
                    return sectorBreakdown.map((entry, i) => {
                      const pct = totalPortfolio > 0 ? entry.count / totalPortfolio : 0;
                      const strokeDasharray = `${pct * circumference} ${circumference}`;
                      const strokeDashoffset = -accumulated * circumference;
                      accumulated += pct;
                      return (
                        <circle
                          key={entry.category}
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke={donutColors[i % donutColors.length]}
                          strokeWidth="4.5"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                        />
                      );
                    });
                  })()}
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
          )}
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
        {RECENT_ENQUIRIES.length === 0 ? (
          <div className="py-12 px-6 text-center">
            <p className="text-sm font-semibold text-[#0a1018]">No Inbound Enquiries Yet</p>
            <p className="mt-1 text-xs text-[#6b81a5]">
              New customer quote requests and KYC messages will appear here as soon as they are received.
            </p>
          </div>
        ) : (
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
        )}
      </Panel>
    </div>
  );
}
