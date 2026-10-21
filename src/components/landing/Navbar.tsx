'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  PlusCircle,
  LogOut,
  User,
  Loader2,
  AlertCircle,
  Building2,
  ShieldCheck,
  ChevronDown,
  Bell,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { RegisterTypeModal } from '@/components/ui/RegisterTypeModal';
import { useAuth } from '@/context/AuthContext';
import { loadStoredNotifications } from '@/data/notificationsStore';
import {
  calculateOnboardingProgress,
  type OnboardingProgressInfo,
} from '@/lib/utils/onboarding-state';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [portalsMenuOpen, setPortalsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgressInfo | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      try {
        const notifs = loadStoredNotifications();
        setUnreadNotifsCount(notifs.filter((n) => !n.read).length);
      } catch {
        setUnreadNotifsCount(0);
      }
    };

    const updateOnboarding = () => {
      try {
        const prog = calculateOnboardingProgress();
        setOnboardingProgress(prog);
      } catch {
        setOnboardingProgress(null);
      }
    };

    updateCount();
    updateOnboarding();

    if (typeof sessionStorage !== 'undefined') {
      setBannerDismissed(sessionStorage.getItem('sadza_onboarding_banner_dismissed') === 'true');
    }

    window.addEventListener('sadza-notifications-updated', updateCount);
    window.addEventListener('sadza-onboarding-updated', updateOnboarding);
    return () => {
      window.removeEventListener('sadza-notifications-updated', updateCount);
      window.removeEventListener('sadza-onboarding-updated', updateOnboarding);
    };
  }, []);

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('sadza_onboarding_banner_dismissed', 'true');
    }
  };

  const { user, isAuthenticated, isLoading, logout, logoutError, clearLogoutError } = useAuth();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setLocalError(null);
      clearLogoutError();
      const success = await logout();
      if (!success) {
        setLocalError('Failed to securely end session on the server. Please try again.');
      } else {
        setMobileMenuOpen(false);
      }
    } catch (err: unknown) {
      setLocalError(
        err instanceof Error ? err.message : 'An unexpected error occurred during logout.'
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const activeError = localError || logoutError;

  return (
    <header className="sticky top-3 z-40 w-full flex flex-col items-center px-3 sm:px-6 lg:px-8 transition-all duration-300">
      {/* Global Incomplete Onboarding Alert Banner */}
      {!bannerDismissed && onboardingProgress?.hasDraft && !onboardingProgress?.isCompleted && (
        <div className="w-full max-w-[1680px] mb-2 px-3 sm:px-4 py-2 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 dark:border-amber-500/25 backdrop-blur-md flex items-center justify-between text-xs sm:text-sm text-slate-800 dark:text-slate-100 shadow-xs animate-in fade-in duration-200 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="font-semibold text-amber-800 dark:text-amber-300">
              Business Storefront Incomplete ({onboardingProgress.progressPercent}%)
            </span>
            <span className="hidden md:inline text-slate-600 dark:text-slate-300">
              — Your storefront is in draft mode. Complete onboarding to publish marketplace products.
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href={onboardingProgress.resumeUrl}
              className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline underline-offset-2"
            >
              Resume Setup &rarr;
            </Link>
            <button
              type="button"
              onClick={handleDismissBanner}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
              aria-label="Dismiss banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="relative isolate flex h-16 w-full max-w-[1680px] items-center justify-between rounded-full px-5 sm:px-7">
        {/* Outer Conic Metallic Rim (Mirror Aesthetic) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full metal-foil-silver metal-shadow opacity-95 dark:opacity-75"
        />

        {/* Inner Glass / Dark-surface Face */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[1.5px] rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md"
        />

        {/* Brand Logo */}
        <div className="relative z-10 flex items-center">
          <Logo size="sm" priority />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="relative z-10 hidden items-center gap-6 text-sm font-semibold text-slate-700 dark:text-slate-200 lg:flex">
          <Link
            href="/businesses"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Directory
          </Link>
          <Link
            href="/marketplace"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Marketplace
          </Link>
          <Link
            href="/adverts"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Adverts &amp; Deals
          </Link>
          <Link
            href="/jobs"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Jobs
          </Link>
          <Link
            href="/bill-payments"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Bill Payments
          </Link>
          <Link
            href="/pricing"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Pricing
          </Link>

          {/* Only render workspace switcher for authenticated administrators */}
          {isAuthenticated && user?.role === 'admin' && (
            <div
              className="relative"
              onMouseEnter={() => setPortalsMenuOpen(true)}
              onMouseLeave={() => setPortalsMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setPortalsMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 border border-slate-800 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
              >
                <span>Admin Workspaces</span>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
              </button>

              {portalsMenuOpen && (
                <div className="absolute right-0 top-full pt-2.5 w-72 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2 space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Administrative Views
                    </div>
                    <Link
                      href="/admin"
                      onClick={() => setPortalsMenuOpen(false)}
                      className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-[#eef4ff]/60 dark:hover:bg-slate-800/80 transition-colors group"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0a1018] text-[#6390ff] group-hover:bg-[#1e57eb] group-hover:text-white transition-colors">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          Executive Admin HQ
                        </div>
                        <div className="text-[11px] text-slate-500">
                          13 Modules • Telemetry &amp; KYC
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/dashboard/business"
                      onClick={() => setPortalsMenuOpen(false)}
                      className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          Business Storefront View
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Storefront, SKUs &amp; Invoices
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/dashboard/user"
                      onClick={() => setPortalsMenuOpen(false)}
                      className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950 text-[#1e57eb] dark:text-blue-400 group-hover:bg-[#1e57eb] group-hover:text-white transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          Consumer Account View
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Tokens, Orders &amp; Watchlist
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Desktop Action Controls */}
        <div className="relative z-10 hidden items-center gap-2 sm:flex">
          <Link
            href="/notifications"
            className="relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Notifications"
            title="Notifications & Activity"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1e57eb] text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
              </span>
            )}
          </Link>

          <ThemeToggle />

          {/* Conditional Auth Actions with Anti-Flash Loader */}
          {isLoading ? (
            <div className="flex items-center gap-2" aria-hidden="true">
              <div className="h-8 w-16 rounded-full bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
              <div className="h-8 w-20 rounded-full bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Dedicated Role-Based Dashboard CTA Button */}
              {user?.role === 'admin' ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/80 px-3 py-1.5 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-900/60 shadow-xs transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Admin Dashboard</span>
                </Link>
              ) : user?.role === 'merchant' || user?.role === 'business' || user?.accountType === 'business' ? (
                <Link
                  href="/dashboard/business"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-full shadow-xs transition-colors"
                >
                  <Building2 className="h-3.5 w-3.5 text-white" />
                  <span>Business Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/dashboard/user"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1e57eb] hover:bg-blue-700 px-3.5 py-1.5 rounded-full shadow-xs transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-white" />
                  <span>My Dashboard</span>
                </Link>
              )}

              {/* Incomplete Onboarding Resume Pill */}
              {onboardingProgress?.hasDraft && !onboardingProgress?.isCompleted && (
                <Link
                  href="/onboarding/business"
                  className="hidden xl:inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 px-2.5 py-1.5 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                  title="Resume Business Onboarding"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Draft ({onboardingProgress.progressPercent}%)</span>
                </Link>
              )}

              {/* User Account / Profile Identity */}
              <Link
                href={
                  user?.role === 'admin'
                    ? '/admin'
                    : user?.role === 'merchant' || user?.role === 'business' || user?.accountType === 'business'
                    ? '/dashboard/business'
                    : '/dashboard/user'
                }
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 max-w-[120px] truncate hover:border-emerald-500"
                title={user?.fullName || user?.email || 'User'}
              >
                <span className="truncate">
                  {user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Account'}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 dark:hover:border-rose-800 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" />
                )}
                <span>{isLoggingOut ? 'Signing out...' : 'Logout'}</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-2 py-1.5 transition-colors"
              >
                Sign In
              </Link>

              {/* Primary CTA with Metallic Emerald Foil Edge */}
              <button
                type="button"
                onClick={() => setRegisterModalOpen(true)}
                className="relative isolate inline-flex items-center justify-center rounded-full p-[1.5px] metal-foil-emerald shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
              >
                <span className="relative z-10 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 text-xs font-semibold transition-colors">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Register</span>
                </span>
              </button>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="relative z-10 flex items-center gap-1.5 lg:hidden">
          <Link
            href="/notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1e57eb] text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
              </span>
            )}
          </Link>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Logout error alert bar */}
      {activeError && (
        <div className="w-full max-w-6xl mt-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between shadow-md animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{activeError}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setLocalError(null);
              clearLogoutError();
            }}
            className="p-1 hover:text-rose-900 dark:hover:text-rose-100 transition-colors"
            aria-label="Dismiss error notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="w-full max-w-6xl mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 lg:hidden shadow-xl animate-in slide-in-from-top-2 duration-200 z-50 max-h-[calc(100svh-5rem)] overflow-y-auto overscroll-contain">
          <nav className="flex flex-col gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <Link
              href="/notifications"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#1e57eb]" />
                <span>Notifications &amp; Activity</span>
              </span>
              {unreadNotifsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#1e57eb] text-white">
                  {unreadNotifsCount} new
                </span>
              )}
            </Link>
            <Link
              href="/businesses"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600"
            >
              Directory &amp; Map
            </Link>
            <Link
              href="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600"
            >
              Marketplace
            </Link>
            <Link
              href="/adverts"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600"
            >
              Adverts &amp; Deals
            </Link>
            <Link
              href="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600"
            >
              Jobs
            </Link>
            <Link
              href="/bill-payments"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600"
            >
              Bill Payments
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600"
            >
              Pricing
            </Link>

            {/* Role-gated workspace links for authenticated users only */}
            {isAuthenticated && (
              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {user?.role === 'admin' ? 'Administration & Overviews' : 'My Account Workspace'}
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  {user?.role === 'admin' ? (
                    <>
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 py-2 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-xs font-bold text-emerald-800 dark:text-emerald-300"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Executive Admin HQ (13 Modules)</span>
                      </Link>
                      <Link
                        href="/dashboard/business"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 text-xs font-medium text-slate-800 dark:text-slate-200 hover:text-emerald-600"
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Business Storefront View</span>
                      </Link>
                      <Link
                        href="/dashboard/user"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 text-xs font-medium text-slate-800 dark:text-slate-200 hover:text-emerald-600"
                      >
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>Consumer Vault View</span>
                      </Link>
                    </>
                  ) : user?.role === 'business' || user?.role === 'merchant' || user?.accountType === 'business' ? (
                    <>
                      <Link
                        href="/dashboard/business"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 py-2.5 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-xs font-bold text-emerald-800 dark:text-emerald-300"
                      >
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span>Business Dashboard (Storefront &amp; Sales)</span>
                      </Link>
                      {onboardingProgress?.hasDraft && !onboardingProgress?.isCompleted && (
                        <Link
                          href="/onboarding/business"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-xs font-bold text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/80"
                        >
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            <span>Resume Setup ({onboardingProgress.stepTitle})</span>
                          </span>
                          <span className="text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded-full font-bold">
                            {onboardingProgress.progressPercent}%
                          </span>
                        </Link>
                      )}
                    </>
                  ) : (
                    <Link
                      href="/dashboard/user"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-2.5 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-xs font-bold text-blue-800 dark:text-blue-300"
                    >
                      <User className="w-4 h-4 text-[#1e57eb]" />
                      <span>My Dashboard (Orders &amp; Utilities)</span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </nav>

          <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            {isLoading ? (
              <div className="flex flex-col gap-2 py-1" aria-hidden="true">
                <div className="h-9 w-full rounded-lg bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
                <div className="h-9 w-full rounded-lg bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
              </div>
            ) : isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {user?.fullName || 'User Account'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  <span>{isLoggingOut ? 'Signing out...' : 'Logout'}</span>
                </button>
              </div>
            ) : (
              <>
                {onboardingProgress?.hasDraft && !onboardingProgress?.isCompleted && (
                  <Link
                    href="/onboarding/business"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-xs font-bold text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/80 mb-1"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>Resume Business Setup</span>
                    </span>
                    <span className="text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded-full font-bold">
                      {onboardingProgress.progressPercent}%
                    </span>
                  </Link>
                )}
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setRegisterModalOpen(true);
                  }}
                  className="w-full text-center py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs cursor-pointer"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Pop-up User Type Selection Modal */}
      <RegisterTypeModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </header>
  );
}
