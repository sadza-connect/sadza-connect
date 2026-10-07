'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  LogOut,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
  Loader2,
} from 'lucide-react';
import { ADMIN_NAV } from '@/lib/data/admin-nav';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/context/AuthContext';

export interface AdminUser {
  fullName: string;
  email: string;
  role: string;
}

export function AdminShell({
  user: initialUser = { fullName: 'Ugwoke Levi', email: 'admin@sadzaconnect.co.zw', role: 'Super Admin' },
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
    role: authUser?.role ? (authUser.role === 'admin' ? 'Super Admin' : authUser.role) : initialUser.role,
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  const current = ADMIN_NAV.find((item) =>
    item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href)
  );

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 text-ink-950 dark:text-ink-50">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-ink-200 dark:border-ink-800 bg-ink-900 text-white lg:flex">
        <SidebarContent
          pathname={pathname}
          name={currentUser.fullName}
          email={currentUser.email}
          role={currentUser.role}
          onNavigate={() => {}}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
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
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-ink-900 text-white lg:hidden"
            >
              <SidebarContent
                pathname={pathname}
                name={currentUser.fullName}
                email={currentUser.email}
                role={currentUser.role}
                onNavigate={() => setMobileOpen(false)}
                onLogout={handleLogout}
                isLoggingOut={isLoggingOut}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-ink-200 dark:border-ink-800 bg-white/90 dark:bg-ink-900/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb / title */}
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden text-ink-400 sm:inline">Admin Console</span>
              <ChevronRight className="hidden h-3.5 w-3.5 text-ink-300 sm:inline" />
              <span className="font-bold text-ink-900 dark:text-white">
                {current?.label ?? 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-xs font-semibold text-ink-700 dark:text-ink-200 hover:text-brand-600 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Public Portal</span>
            </Link>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
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
  onLogout,
  isLoggingOut = false,
}: {
  pathname: string | null;
  name: string;
  email: string;
  role: string;
  onNavigate: () => void;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}) {
  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        {/* Brand header */}
        <div className="flex items-center gap-3 px-2 py-3 border-b border-ink-800 mb-4">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600 text-white font-extrabold text-sm shadow-md">
            SC
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>Sadza Connect</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-gold-500/20 text-gold-400 border border-gold-500/30">
                HQ
              </span>
            </div>
            <div className="text-[11px] text-ink-400">Admin Control Suite</div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {ADMIN_NAV.map((item) => {
            const active =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname?.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all',
                  active
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-ink-300 hover:bg-ink-800 hover:text-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-ruby-600 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User footer */}
      <div className="pt-4 border-t border-ink-800">
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">{name}</div>
            <div className="text-[11px] text-ink-400 truncate">{role}</div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="p-1.5 rounded-lg text-ink-400 hover:text-white hover:bg-ink-800 transition-colors cursor-pointer disabled:opacity-50"
            title="Sign out"
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin text-ink-300" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
