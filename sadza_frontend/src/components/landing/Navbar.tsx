'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, PlusCircle, Sparkles } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { RegisterTypeModal } from '@/components/ui/RegisterTypeModal';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

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
            Pricing
          </Link>
          <Link
            href="/#ai-assistant"
            className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Sparkles className="h-3 w-3 text-emerald-500" />
            <span>Assistant</span>
          </Link>
        </nav>

        {/* Desktop Action Controls */}
        <div className="relative z-10 hidden items-center gap-3 sm:flex">
          <ThemeToggle />

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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="w-full max-w-6xl mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 lg:hidden shadow-xl animate-in slide-in-from-top-2 duration-200 z-50">
          <nav className="flex flex-col gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <Link
              href="/businesses"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600"
            >
              Directory & Map
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
              Pricing
            </Link>
            <Link
              href="/#ai-assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg flex items-center justify-between bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                Assistant
              </span>
              <span className="text-[10px] uppercase font-mono text-emerald-600">Online</span>
            </Link>
          </nav>

          <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
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
              className="w-full text-center py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs"
            >
              Register
            </button>
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
