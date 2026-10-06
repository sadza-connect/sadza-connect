'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  Store,
  Zap,
} from 'lucide-react';

interface RegisterTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegisterTypeModal({ isOpen, onClose }: RegisterTypeModalProps) {
  const router = useRouter();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectType = (type: 'business' | 'personal') => {
    onClose();
    router.push(`/signup?type=${type}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Blurred Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200/90 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all animate-in zoom-in-95 duration-200 z-10">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            <Sparkles className="h-3 w-3" />
            <span>Join Zimbabwe’s Digital Commercial Platform</span>
          </div>

          <h2
            id="register-modal-title"
            className="font-display mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            How would you like to register?
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Choose the account type that matches your needs. Your registration flow will be tailored specifically for you.
          </p>
        </div>

        {/* The Two Choice Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* OPTION 1: REGISTER AS A BUSINESS */}
          <div
            onClick={() => handleSelectType('business')}
            className="group relative flex flex-col justify-between rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 p-5 sm:p-6 transition-all duration-200 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 hover:shadow-lg cursor-pointer text-left"
          >
            <div>
              {/* Badge & Icon */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">
                  <Store className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Enterprises & SMEs
                </span>
              </div>

              {/* Title & Tagline */}
              <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Register as a Business
              </h3>

              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                For registered companies, sole traders, service providers, and suppliers looking to reach buyers across Zimbabwe.
              </p>

              {/* Key Features */}
              <ul className="mt-4 space-y-2 text-[11px] text-slate-700 dark:text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>National commercial directory listing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Post marketplace deals & open vacancies</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Receive customer quotes & verified badges</span>
                </li>
              </ul>
            </div>

            {/* Action CTA */}
            <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
              <span>Continue as Business</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>

          {/* OPTION 2: REGISTER AS A REGULAR USER */}
          <div
            onClick={() => handleSelectType('personal')}
            className="group relative flex flex-col justify-between rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 p-5 sm:p-6 transition-all duration-200 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 hover:shadow-lg cursor-pointer text-left"
          >
            <div>
              {/* Badge & Icon */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform">
                  <User className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-800 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                  Individual Shoppers
                </span>
              </div>

              {/* Title & Tagline */}
              <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Register as a Regular User
              </h3>

              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                For everyday Zimbabweans and Diaspora shoppers looking to browse products, buy electricity tokens, and find jobs.
              </p>

              {/* Key Features */}
              <ul className="mt-4 space-y-2 text-[11px] text-slate-700 dark:text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Instant prepaid ZESA electricity recharge</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Contact verified local suppliers directly</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Quick 1-minute registration process</span>
                </li>
              </ul>
            </div>

            {/* Action CTA */}
            <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-blue-700 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
              <span>Continue as Regular User</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            href="/login"
            onClick={onClose}
            className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
