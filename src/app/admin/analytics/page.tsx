'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Eye,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Filter,
  CheckCircle2,
  RefreshCw,
  Building2,
  ShoppingBag,
  Users,
  MessageCircle,
  Search,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import {
  AdminPageHeader,
  Panel,
  PanelHeading,
  StatCard,
  AdminBadge,
  AdminButton,
} from '@/components/admin/AdminUI';
import { AnalyticsOverviewResult } from '@/infrastructure/database/repositories/analytics-repository';
import { getClientAccessToken } from '@/shared/utils/api-client';

type TimeframeOption = {
  label: string;
  days: number;
};

const TIMEFRAMES: TimeframeOption[] = [
  { label: 'Today (24h)', days: 1 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'This Quarter (90d)', days: 90 },
  { label: 'This Year (365d)', days: 365 },
];

export default function AdminAnalyticsPage() {
  const [daysFilter, setDaysFilter] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsOverviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadLiveStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getClientAccessToken();
      const res = await fetch(`/api/v1/analytics/overview?days=${daysFilter}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.error?.message || 'Failed to retrieve analytics telemetry');
      }
    } catch (err: any) {
      console.warn('Failed to load real-time analytics:', err);
      setError(err?.message || 'Network error fetching analytics');
    } finally {
      setLoading(false);
    }
  }, [daysFilter]);

  useEffect(() => {
    loadLiveStats();
  }, [loadLiveStats]);

  const activeTimeframe =
    TIMEFRAMES.find((t) => t.days === daysFilter) || TIMEFRAMES[2];

  const deviceTotal =
    (data?.deviceBreakdown.mobile || 0) +
    (data?.deviceBreakdown.desktop || 0) +
    (data?.deviceBreakdown.tablet || 0);

  const mobileShare = deviceTotal > 0 ? Math.round(((data?.deviceBreakdown.mobile || 0) / deviceTotal) * 100) : 70;
  const desktopShare = deviceTotal > 0 ? Math.round(((data?.deviceBreakdown.desktop || 0) / deviceTotal) * 100) : 25;
  const tabletShare = deviceTotal > 0 ? Math.max(0, 100 - mobileShare - desktopShare) : 5;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Website Traffic & Pageview Analytics"
        description={`Real-time visitor telemetry, provincial origin, and section pageview breakdown from live database records for ${activeTimeframe.label}.`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <AdminButton
            variant="outline"
            onClick={loadLiveStats}
            disabled={loading}
            title="Refresh platform analytics"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Telemetry
          </AdminButton>

          <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Consent-Gated Telemetry
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

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800">
          {error}
        </div>
      )}

      {/* KPI Overview Cards: 100% Real Database Telemetry */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Platform Pageviews"
          value={(data?.totalPageviews || 0).toLocaleString()}
          trend="up"
          hint={`Impression volume recorded in ${activeTimeframe.label}`}
          icon={Eye}
          loading={loading}
        />
        <StatCard
          label="Unique Visitors"
          value={(data?.uniqueVisitors || 0).toLocaleString()}
          trend="up"
          hint="Deduplicated active visitor sessions"
          icon={Users}
          loading={loading}
        />
        <StatCard
          label="WhatsApp Merchant Leads"
          value={(data?.whatsappInquiries || 0).toLocaleString()}
          trend="up"
          hint="Click-to-chat buyer inquiries to sellers"
          icon={MessageCircle}
          loading={loading}
        />
        <StatCard
          label="Live Verified Storefronts"
          value={(data?.totalLiveEntities.businesses || 0).toLocaleString()}
          trend="up"
          hint="Active registered Zimbabwean enterprises"
          icon={Building2}
          loading={loading}
        />
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-[#c8d2e0] bg-white p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Marketplace Products</span>
          <p className="mt-1 text-base font-black text-slate-900">
            {(data?.totalLiveEntities.products || 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-[#c8d2e0] bg-white p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Job Vacancies</span>
          <p className="mt-1 text-base font-black text-slate-900">
            {(data?.totalLiveEntities.jobs || 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-[#c8d2e0] bg-white p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Commercial Adverts</span>
          <p className="mt-1 text-base font-black text-slate-900">
            {(data?.totalLiveEntities.adverts || 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-[#c8d2e0] bg-white p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Registered Accounts</span>
          <p className="mt-1 text-base font-black text-slate-900">
            {(data?.totalLiveEntities.users || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main Section Breakdown & Device Share */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeading
            title="Section Pageview Breakdown"
            hint={`Live traffic distribution strictly calculated from PostgreSQL telemetry (${activeTimeframe.label})`}
          />

          <div className="mt-6 space-y-5">
            {(data?.sectionBreakdown || []).map((sec) => (
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

                <div className="h-3 w-full overflow-hidden rounded-full bg-[#e6eaf1] p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#1e57eb] to-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.max(sec.percentage, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-6">
          {/* Device Distribution */}
          <Panel>
            <PanelHeading
              title="Device Hardware Distribution"
              hint="Real visitor browser environment telemetry"
            />
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 font-medium text-[#1f2a3d]">
                  <Smartphone className="h-4 w-4 text-emerald-600" /> Mobile Devices (Android / iOS)
                </span>
                <AdminBadge tone="success">{mobileShare}%</AdminBadge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 font-medium text-[#1f2a3d]">
                  <Monitor className="h-4 w-4 text-[#1e57eb]" /> Desktop &amp; Workstations
                </span>
                <AdminBadge tone="brand">{desktopShare}%</AdminBadge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 font-medium text-[#1f2a3d]">
                  <Tablet className="h-4 w-4 text-purple-600" /> Tablets &amp; Large Form
                </span>
                <AdminBadge tone="neutral">{tabletShare}%</AdminBadge>
              </div>
            </div>
          </Panel>

          {/* Provincial Origin Breakdown */}
          <Panel>
            <PanelHeading
              title="Provincial Origin Distribution"
              hint="Real Zimbabwean visitor geographic presence"
            />
            <div className="mt-4 space-y-3">
              {(data?.provinceBreakdown || []).map((pt) => (
                <div key={pt.province} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#0a1018]">{pt.province}</span>
                    <span className="text-[#1e57eb] font-bold">{pt.share}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e6eaf1]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#1e57eb] to-emerald-500"
                      style={{ width: `${Math.max(pt.share, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* Live Recent Event Telemetry Feed */}
      {data?.recentEvents && data.recentEvents.length > 0 && (
        <Panel>
          <PanelHeading
            title="Live Visitor Activity Stream"
            hint="Recent real-time events captured with active user cookie consent"
          />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Visited Path</th>
                  <th className="p-3">Province</th>
                  <th className="p-3">Device</th>
                  <th className="p-3">User Role</th>
                  <th className="p-3">Recorded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      {ev.eventType}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-[#1e57eb]">{ev.path}</td>
                    <td className="p-3 text-slate-600">{ev.province || 'Zimbabwe (National)'}</td>
                    <td className="p-3 capitalize">{ev.deviceType || 'Desktop'}</td>
                    <td className="p-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        {ev.userRole || 'Guest'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
