'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, PlusCircle, Sparkles, LogOut, User, Loader2, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { RegisterTypeModal } from '@/components/ui/RegisterTypeModal';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

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
      setLocalError(err instanceof Error ? err.message : 'An unexpected error occurred during logout.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const activeError = localError || logoutError;

  return (
    <header className="sticky top-3 z-40 w-full flex flex-col items-center px-3 sm:px-6 transition-all duration-300">
      <div className="relative isolate flex h-16 w-full max-w-6xl items-center justify-between rounded-full px-4 sm:px-6">
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
        <nav className="relative z-10 hidden items-center gap-6 text-xs font-semibold text-slate-700 dark:text-slate-200 lg:flex">
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
            Pricing &amp; Adverts
          </Link>
        </nav>

        {/* Desktop Action Controls */}
        <div className="relative z-10 hidden items-center gap-3 sm:flex">
          <ThemeToggle />

          {/* Conditional Auth Actions with Anti-Flash Loader */}
          {isLoading ? (
            <div className="flex items-center gap-2" aria-hidden="true">
              <div className="h-8 w-16 rounded-full bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
              <div className="h-8 w-20 rounded-full bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 transition-colors"
                >
                  Admin HQ
                </Link>
              )}

              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 max-w-[130px] truncate"
                title={user?.fullName || user?.email || 'User'}
              >
                <User className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">
                  {user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Account'}
                </span>
              </span>

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
        <div className="relative z-10 flex items-center gap-2 lg:hidden">
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
        <div className="w-full max-w-6xl mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 lg:hidden shadow-xl animate-in slide-in-from-top-2 duration-200 z-50">
          <nav className="flex flex-col gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
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
              Pricing &amp; Adverts
            </Link>
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
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] shrink-0"
                    >
                      Admin HQ
                    </Link>
                  )}
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
