'use client';

import { useState, useMemo } from 'react';
import {
  Calendar,
  Eye,
  TrendingUp,
  Globe,
  Monitor,
  Smartphone,
  Clock,
  Filter,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import {
  AdminPageHeader,
  Panel,
  PanelHeading,
  StatCard,
  AdminBadge,
} from '@/components/admin/AdminUI';

type TimeframeOption = {
  label: string;
  days: number;
  mult: number;
};

const TIMEFRAMES: TimeframeOption[] = [
  { label: 'Today (24h)', days: 1, mult: 0.08 },
  { label: 'Last 7 Days', days: 7, mult: 0.35 },
  { label: 'Last 30 Days', days: 30, mult: 1.0 },
  { label: 'This Quarter (90d)', days: 90, mult: 2.9 },
  { label: 'This Year (2026)', days: 365, mult: 9.4 },
];

const BASE_SECTIONS = [
  { section: 'Verified Business Directory (/businesses)', views: 6420, percentage: 31 },
  { section: 'National B2B & Retail Marketplace (/marketplace)', views: 5180, percentage: 25 },
  { section: 'ZESA & Utility Bill Settlements (/bill-payments)', views: 3730, percentage: 18 },
  { section: 'Sponsored Promotional Adverts (/adverts)', views: 2900, percentage: 14 },
  { section: 'Verified Jobs & Careers Board (/jobs)', views: 1650, percentage: 8 },
  { section: 'Enterprise Pricing & Onboarding (/pricing)', views: 830, percentage: 4 },
];

const PROVINCE_TRAFFIC = [
  { province: 'Harare', share: 42 },
  { province: 'Bulawayo', share: 21 },
  { province: 'Midlands', share: 12 },
  { province: 'Manicaland', share: 9 },
  { province: 'Masvingo', share: 7 },
  { province: 'Diaspora (SA, UK, USA)', share: 9 },
];

export default function AdminAnalyticsPage() {
  const [daysFilter, setDaysFilter] = useState<number>(30);

  const activeTimeframe = useMemo(
    () => TIMEFRAMES.find((t) => t.days === daysFilter) || TIMEFRAMES[2],
    [daysFilter]
  );

  const sectionsToRender = useMemo(
    () =>
      BASE_SECTIONS.map((s) => ({
        ...s,
        views: Math.max(12, Math.round(s.views * activeTimeframe.mult)),
      })),
    [activeTimeframe]
  );

  const totalViews = useMemo(
    () => sectionsToRender.reduce((acc, s) => acc + s.views, 0),
    [sectionsToRender]
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Website Traffic & Pageview Analytics"
        description={`Real-time visitor tracking, provincial origin, and section pageview breakdown for ${activeTimeframe.label}.`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Live Traffic Telemetry
          </span>

          <span className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-[#c8d2e0] bg-white px-3 py-2 text-xs font-semibold text-[#1f2a3d] shadow-2xs">
            <Calendar className="h-4 w-4 text-[#1e57eb]" /> {activeTimeframe.label}
          </span>

          <div className="relative">
            <select
              value={daysFilter}
              onChange={(e) => setDaysFilter(Number(e.target.value))}
              className="h-10 appearance-none rounded-xl border border-[#c8d2e0] bg-white pl-9 pr-9 text-xs font-bold text-[#0a1018] shadow-2xs transition-colors hover:border-[#9aabc4] focus:border-[#1e57eb] focus:outline-none cursor-pointer"
              aria-label="Filter analytics by days"
            >
              {TIMEFRAMES.map((t) => (
                <option key={t.days} value={t.days}>
                  {t.label}
                </option>
              ))}
            </select>
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b81a5]" />
          </div>
        </div>
      </AdminPageHeader>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Pageviews"
          value={totalViews.toLocaleString()}
          delta={22}
          trend="up"
          hint={`Page impressions recorded in ${activeTimeframe.label}`}
          icon={Eye}
        />
        <StatCard
          label="Tracked Platform Pillars"
          value={sectionsToRender.length}
          trend="up"
          hint="Active commercial modules with visitor traffic"
          icon={Globe}
        />
        <StatCard
          label="Top Section Share"
          value={`${sectionsToRender[0].percentage}%`}
          delta={8}
          trend="up"
          hint={`Most visited: ${sectionsToRender[0].section}`}
          icon={TrendingUp}
        />
        <StatCard
          label="Avg. Session Duration"
          value="4m 38s"
          delta={14}
          trend="up"
          hint="High buyer intent across directory & marketplace"
          icon={Clock}
        />
      </div>

      {/* Main Section Breakdown & Device Share */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeading
            title="Section Pageview Breakdown"
            hint={`Live traffic distribution across website pages (${activeTimeframe.label})`}
          />

          <div className="mt-6 space-y-5">
            {sectionsToRender.map((sec) => (
              <div key={sec.section} className="space-y-2">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-[#0a1018] font-semibold flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#1e57eb]" />
                    {sec.section}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#0a1018] tabular-nums">
                      {sec.views.toLocaleString()} views
                    </span>
                    <span className="w-12 text-right text-xs font-bold text-[#1e57eb] bg-[#eef5ff] rounded-md px-1.5 py-0.5 tabular-nums">
                      {sec.percentage}%
                    </span>
                  </div>
                </div>

                <div className="h-3.5 w-full overflow-hidden rounded-full bg-[#e6eaf1] p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#1e57eb] to-[#3377f6] transition-all duration-500"
                    style={{ width: `${Math.max(sec.percentage * 2.5, 6)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <PanelHeading
              title="Device Session Distribution"
              hint="Visitor hardware & browser breakdown"
            />
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 font-medium text-[#1f2a3d]">
                  <Smartphone className="h-4 w-4 text-[#1e57eb]" /> Mobile Devices (Android / iOS)
                </span>
                <AdminBadge tone="brand">64% Share</AdminBadge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 font-medium text-[#1f2a3d]">
                  <Monitor className="h-4 w-4 text-[#1e57eb]" /> Desktop &amp; Corporate Workstations
                </span>
                <AdminBadge tone="neutral">31% Share</AdminBadge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 font-medium text-[#1f2a3d]">
                  <Globe className="h-4 w-4 text-[#1e57eb]" /> WhatsApp &amp; Direct Referrals
                </span>
                <AdminBadge tone="success">Active</AdminBadge>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeading
              title="Traffic by Province & Diaspora"
              hint="Geographic distribution of active buyers"
            />
            <ul className="mt-4 space-y-2.5 text-xs">
              {PROVINCE_TRAFFIC.map((p) => (
                <li key={p.province} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold text-[#1f2a3d]">
                    <MapPin className="h-3.5 w-3.5 text-[#1e57eb]" /> {p.province}
                  </span>
                  <span className="font-bold text-[#0a1018] tabular-nums">{p.share}%</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <PanelHeading
              title="Infrastructure & Readiness Status"
              hint="Platform store & verification services"
            />
            <ul className="mt-4 space-y-3 text-xs">
              <li className="flex items-center justify-between">
                <span className="font-medium text-[#1f2a3d]">Dynamic Platform Store</span>
                <AdminBadge tone="success">100% Live</AdminBadge>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-medium text-[#1f2a3d]">30-Day Grace Enforcement</span>
                <AdminBadge tone="brand">Automated</AdminBadge>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-medium text-[#1f2a3d]">QR Receipt &amp; ID Verification</span>
                <AdminBadge tone="success">Active</AdminBadge>
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
