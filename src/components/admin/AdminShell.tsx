'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getPlatformSettings, savePlatformSettings } from '@/data/platformStore';
import {
  Menu,
  LogOut,
  ExternalLink,
  Search,
  Bell,
  ChevronRight,
  Building2,
  User,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { ADMIN_NAV } from '@/lib/data/admin-nav';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/context/AuthContext';

export interface AdminUser {
  fullName: string;
  email: string;
  role: string;
}

export function AdminShell({
  user: initialUser = {
    fullName: 'Ugwoke Levi',
    email: 'admin@sadzaconnect.co.zw',
    role: 'Super Admin',
  },
  children,
}: {
  user?: AdminUser;
  children: React.ReactNode;
}) {
  const { user: authUser, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentUser: AdminUser = {
    fullName: authUser?.fullName || initialUser.fullName,
    email: authUser?.email || initialUser.email,
    role: authUser?.role
      ? authUser.role === 'admin'
        ? 'Super Admin'
        : authUser.role
      : initialUser.role,
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  const [quickRate, setQuickRate] = useState<string>('26.5');
  const [rateSaved, setRateSaved] = useState(false);

  useEffect(() => {
    const s = getPlatformSettings();
    if (s?.usdToZigRate) setQuickRate(String(s.usdToZigRate));
  }, []);

  const handleUpdateRate = async () => {
    const parsed = parseFloat(quickRate);
    if (isNaN(parsed) || parsed <= 0) return;
    const s = getPlatformSettings();
    savePlatformSettings({ ...s, usdToZigRate: parsed });
    setRateSaved(true);
    setTimeout(() => setRateSaved(false), 2000);
    try {
      await fetch('/api/v1/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ usd_to_zig_rate: parsed }),
      });
    } catch {}
  };

  const current = ADMIN_NAV.find((item) =>
    item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href)
  );

  return (
    <div className="min-h-dvh bg-[#e6eaf1]/70 text-[#0a1018] font-sans">
      {/* Sidebar (desktop) — Deep Obsidian Ink (#0a1018) with Royal Blue (#1e57eb) Accents */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/5 bg-[#0a1018] lg:flex">
        <SidebarContent
          pathname={pathname}
          name={currentUser.fullName}
          email={currentUser.email}
          role={currentUser.role}
          onNavigate={() => {}}
        />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-[#0a1018]/65 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0a1018] lg:hidden"
            >
              <SidebarContent
                pathname={pathname}
                name={currentUser.fullName}
                email={currentUser.email}
                role={currentUser.role}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="lg:pl-64 flex flex-col min-h-dvh">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#c8d2e0]/70 bg-white/85 px-4 backdrop-blur-md sm:px-6 print:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#374966] hover:bg-[#e6eaf1] lg:hidden cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb / title */}
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden text-[#6b81a5] sm:inline">Admin Console</span>
            <ChevronRight className="hidden h-3.5 w-3.5 text-[#9aabc4] sm:inline" />
            <span className="font-bold text-[#0a1018]">{current?.label ?? 'Dashboard'}</span>
          </div>

          {/* Search (visual) */}
          <div className="relative ml-auto hidden max-w-xs flex-1 xl:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b81a5]" />
            <input
              placeholder="Quick jump or search console…"
              className="h-9 w-full rounded-lg border border-[#c8d2e0] bg-[#f4f6f9]/80 pl-9 pr-3 text-xs text-[#0a1018] outline-none transition-colors placeholder:text-[#6b81a5] focus:border-[#1e57eb] focus:bg-white"
            />
          </div>

          {/* Quick USD to ZiG Rate Updater (Matching Figma sadza-connect-admin-verification.png) */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#f4f6f9] border border-[#c8d2e0] text-xs shrink-0">
            <span className="font-semibold text-[#465a7e]">USD to ZiG</span>
            <input
              type="number"
              step="0.1"
              value={quickRate}
              onChange={(e) => setQuickRate(e.target.value)}
              className="w-14 px-1.5 py-0.5 rounded-lg border border-[#c8d2e0] bg-white text-xs font-bold text-center text-[#0a1018] focus:outline-none focus:border-[#1e57eb]"
            />
            <button
              type="button"
              onClick={handleUpdateRate}
              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-2xs cursor-pointer"
            >
              {rateSaved ? 'Updated!' : 'Update rate'}
            </button>
          </div>

          <div className="ml-auto xl:ml-0 flex items-center gap-2">
            {/* Quick Portal Switcher Links */}
            <Link
              href="/dashboard/business"
              className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#c8d2e0] bg-white px-3 text-xs font-semibold text-[#1f2a3d] transition-colors hover:bg-[#eef5ff] hover:text-[#1e57eb] hover:border-[#bcd7ff]"
            >
              <Building2 className="h-3.5 w-3.5 text-[#1e57eb]" /> Business Portal
            </Link>

            <Link
              href="/dashboard/user"
              className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#c8d2e0] bg-white px-3 text-xs font-semibold text-[#1f2a3d] transition-colors hover:bg-[#eef5ff] hover:text-[#1e57eb] hover:border-[#bcd7ff]"
            >
              <User className="h-3.5 w-3.5 text-[#1e57eb]" /> User Portal
            </Link>

            <Link
              href="/"
              target="_blank"
              className="hidden h-9 items-center gap-1.5 rounded-lg border border-[#c8d2e0] bg-white px-3 text-xs font-semibold text-[#1f2a3d] transition-colors hover:bg-[#f4f6f9] sm:inline-flex"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#1e57eb]" /> View Site
            </Link>

            <Link
              href="/admin/messages"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#374966] hover:bg-[#e6eaf1]"
              aria-label="Notifications"
              title="Messages & Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#1e57eb] ring-2 ring-white" />
            </Link>

            {/* User Identity */}
            <div className="flex items-center gap-2 border-l border-[#c8d2e0] pl-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e57eb] text-xs font-bold text-white shadow-xs">
                {currentUser.fullName.charAt(0)}
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-xs font-bold text-[#0a1018]">{currentUser.fullName}</p>
                <p className="text-[0.68rem] text-[#6b81a5]">{currentUser.role}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-[#465a7e] transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                aria-label="Log out"
                title="Sign out"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-[18px] w-[18px]" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  name,
  email,
  role,
  onNavigate,
}: {
  pathname: string | null;
  name: string;
  email: string;
  role: string;
  onNavigate: () => void;
}) {
  return (
    <>
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-white/5 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1e57eb] text-white shadow-[0_4px_14px_rgba(30,87,235,0.45)]">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div className="leading-none">
          <p className="font-display text-sm font-bold tracking-tight text-white">SADZA CONNECT</p>
          <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#6b81a5]">
            Admin Console
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {ADMIN_NAV.map((item) => {
          const active =
            item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'text-white font-semibold' : 'text-[#9aabc4] hover:text-white'
              )}
            >
              {active && (
                <motion.span
                  layoutId="admin-nav-active"
                  className="absolute inset-0 rounded-xl bg-white/10 ring-1 ring-inset ring-white/15"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <Icon
                className={cn(
                  'relative z-10 h-[18px] w-[18px] shrink-0 transition-colors',
                  active ? 'text-[#599bff]' : 'text-[#6b81a5] group-hover:text-white'
                )}
              />
              <span className="relative z-10 truncate">{item.label}</span>
              {item.comingSoon ? (
                <span className="relative z-10 ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/10 text-amber-400">
                  Soon
                </span>
              ) : item.badge !== undefined ? (
                <span className="relative z-10 ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1e57eb] px-1.5 text-[0.68rem] font-bold text-white tabular-nums">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Signed-in identity */}
      <div className="border-t border-white/5 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-inset ring-white/10">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e57eb] text-xs font-bold text-white">
            {name.charAt(0)}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-xs font-semibold text-white">{name}</p>
            <p className="mt-0.5 truncate text-[0.68rem] text-[#6b81a5]">
              {role} · {email}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
