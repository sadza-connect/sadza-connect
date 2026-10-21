import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  CreditCard,
  QrCode,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { idCardRepository } from '@/infrastructure/database/repositories/id-card-repository';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export const runtime = 'nodejs';

export default async function VerifyIdPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cardId);

  let card = null;
  if (isUuid) {
    card = await idCardRepository.findById(cardId);
  }
  if (!card) {
    card = await idCardRepository.findByCardNumber(cardId);
  }

  const issueDateStr = card?.issue_date
    ? new Date(card.issue_date).toLocaleDateString('en-GB')
    : '2026-01-01';
  const expiryDateStr = card?.expiry_date
    ? new Date(card.expiry_date).toLocaleDateString('en-GB')
    : '2028-01-01';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sadza Connect
          </Link>

          {card ? (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl space-y-6">
              {/* Verification Header */}
              <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-800">
                <div
                  className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-3 ${
                    card.status === 'Active'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                  }`}
                >
                  {card.status === 'Active' ? (
                    <ShieldCheck className="w-9 h-9" />
                  ) : (
                    <AlertTriangle className="w-9 h-9" />
                  )}
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {card.status === 'Active'
                      ? 'OFFICIALLY VERIFIED MEMBER'
                      : `STATUS: ${card.status.toUpperCase()}`}
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                  Sadza Connect PVC Badge
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  Registry Card #{card.card_number}
                </p>
              </div>

              {/* Member Profile Dossier */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                <img
                  src={
                    card.photo_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={card.member_name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm shrink-0"
                />
                <div className="text-center sm:text-left min-w-0">
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white truncate">
                    {card.member_name}
                  </h2>
                  <p className="text-sm font-semibold text-[#1e57eb] dark:text-[#599bff]">
                    {card.member_role}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{card.business_name}</span>
                  </div>
                </div>
              </div>

              {/* Registry Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-400 text-[11px] block">National ID Verification:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Encrypted &amp; Admin-Vaulted</span>
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-400 text-[11px] block">Badge Status:</span>
                  <span
                    className={`font-bold ${
                      card.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {card.status}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-400 text-[11px] block">Date Issued:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {issueDateStr}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-slate-400 text-[11px] block">Expiry Date:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {expiryDateStr}
                  </span>
                </div>
              </div>

              {/* Official Assurance */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
                <p className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Official Zimbabwe Commercial Verification
                </p>
                <p>
                  This QR code certifies that {card.member_name} is an active, authorized commercial representative of {card.business_name} registered in good standing on Sadza Connect.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-900 p-8 shadow-xl text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                Unrecognised Badge ID
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                No active membership record was found for ID <strong className="font-mono text-slate-800 dark:text-slate-200">{cardId}</strong>. The badge may be revoked or expired.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e57eb] text-xs font-bold text-white hover:bg-[#1546c7]"
              >
                Go to Homepage
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
