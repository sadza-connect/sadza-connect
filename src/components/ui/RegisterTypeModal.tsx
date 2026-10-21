'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  Store,
  Loader2,
} from 'lucide-react';

interface RegisterTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegisterTypeModal({ isOpen, onClose }: RegisterTypeModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loadingType, setLoadingType] = useState<'business' | 'personal' | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLoadingType(null);
      // Pre-warm the signup routes so navigation completes promptly
      try {
        router.prefetch('/signup?type=business');
        router.prefetch('/signup?type=personal');
        router.prefetch('/login');
      } catch {
        // Ignore prefetch errors in environments that restrict it
      }
    }
  }, [isOpen, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loadingType) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, loadingType]);

  if (!mounted) return null;

  const handleSelectType = (type: 'business' | 'personal') => {
    if (loadingType) return; // Prevent double-triggering
    setLoadingType(type);
    router.push(`/signup?type=${type}`);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Sheet / Dialog */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            className="relative z-10 flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-slate-200/90 bg-white text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-white sm:max-h-[min(88svh,860px)] sm:rounded-2xl"
          >
            {/* Drag Handle on Phones */}
            <div className="flex shrink-0 justify-center pt-2.5 sm:hidden" aria-hidden>
              <span className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Scrollable Modal Content */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-8">
              {/* Modal Header */}
              <div className="text-center max-w-lg mx-auto pt-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="h-3 w-3" />
                  <span>Zimbabwe Commercial Ecosystem</span>
                </div>

                <h2
                  id="register-modal-title"
                  className="font-display mt-3 text-xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white"
                >
                  Choose Your Account Type
                </h2>

                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Select whether you are onboarding a business storefront or creating a personal buyer &amp; career account.
                </p>
              </div>

              {/* The Two Choice Cards */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {/* OPTION 1: REGISTER AS A BUSINESS */}
                <div
                  onClick={() => handleSelectType('business')}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-5 sm:p-6 transition-all duration-200 text-left ${
                    loadingType === 'business'
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-md cursor-wait'
                      : loadingType === 'personal'
                      ? 'opacity-40 pointer-events-none border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-emerald-600 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg cursor-pointer'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                        {loadingType === 'business' ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Store className="h-5 w-5" />
                        )}
                      </div>
                      <span className="rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        30-Day Free Grace
                      </span>
                    </div>

                    <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Register a Business
                    </h3>

                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      For companies, SMEs, agro-dealers, and suppliers seeking national directory, marketplace, and job board visibility.
                    </p>

                    <ul className="mt-4 space-y-2 text-[11px] font-medium text-slate-700 dark:text-slate-200">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Month 1 complimentary grace period ($10/mo after)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Upload unlimited products &amp; job vacancies</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>CR14 &amp; ZIMRA Verified Trust Badge</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-3.5 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {loadingType === 'business' ? (
                      <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Opening Business Registration...</span>
                      </span>
                    ) : (
                      <>
                        <span>Continue as Business</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </div>
                </div>

                {/* OPTION 2: REGISTER AS A REGULAR USER */}
                <div
                  onClick={() => handleSelectType('personal')}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-5 sm:p-6 transition-all duration-200 text-left ${
                    loadingType === 'personal'
                      ? 'border-[#1e57eb] ring-2 ring-[#1e57eb]/30 bg-blue-50/40 dark:bg-blue-950/30 shadow-md cursor-wait'
                      : loadingType === 'business'
                      ? 'opacity-40 pointer-events-none border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-[#1e57eb] hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg cursor-pointer'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e57eb] text-white shadow-sm group-hover:scale-105 transition-transform">
                        {loadingType === 'personal' ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      <span className="rounded-full bg-[#eef4ff] dark:bg-blue-950 border border-[#1e57eb]/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1e57eb] dark:text-blue-300">
                        100% Free Forever
                      </span>
                    </div>

                    <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-950 dark:text-white group-hover:text-[#1e57eb] dark:group-hover:text-blue-400 transition-colors">
                      Personal &amp; Buyer Account
                    </h3>

                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      For shoppers, procurement buyers, and job seekers purchasing ZESA tokens, comparing suppliers, or applying for jobs.
                    </p>

                    <ul className="mt-4 space-y-2 text-[11px] font-medium text-slate-700 dark:text-slate-200">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#1e57eb] dark:text-blue-400 shrink-0" />
                        <span>1-click ZESA prepaid tokens &amp; utility receipts</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#1e57eb] dark:text-blue-400 shrink-0" />
                        <span>Save verified suppliers &amp; marketplace items</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#1e57eb] dark:text-blue-400 shrink-0" />
                        <span>Fast-track job applications with saved CV</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-3.5 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-[#1e57eb] dark:text-blue-400">
                    {loadingType === 'personal' ? (
                      <span className="flex items-center gap-2 text-[#1e57eb] dark:text-blue-400 font-semibold">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Opening Personal Registration...</span>
                      </span>
                    ) : (
                      <>
                        <span>Continue as Personal User</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Banner when Loading */}
              {loadingType && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200 animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Preparing {loadingType === 'business' ? 'Business' : 'Personal'} Registration Portal... Please wait</span>
                </div>
              )}

              {/* Modal Footer */}
              <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 pb-2">
                Already have an account?{' '}
                <Link
                  href="/login"
                  onClick={onClose}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Sign in here
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
