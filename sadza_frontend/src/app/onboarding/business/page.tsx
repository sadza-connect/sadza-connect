'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SpotlightCard } from '@/components/animations/SpotlightCard';
import { StarfieldCanvas } from '@/components/animations/StarfieldCanvas';
import { CategoryCombobox } from '@/components/ui/CategoryCombobox';
import { INDUSTRY_CATEGORIES } from '@/lib/data/categories';
import {
  Building2,
  User,
  ShieldCheck,
  FileText,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  Mail,
  Store,
  FileCheck,
  X,
  HelpCircle,
  ExternalLink,
  Briefcase,
  Lock,
  ShoppingBag,
  Share2,
  Check,
  CheckCircle,
  Eye,
  Award,
} from 'lucide-react';

type BusinessStructure = 'corporate' | 'sole';

const PROVINCES = [
  'Harare Province (Harare, Chitungwiza)',
  'Bulawayo Province (Bulawayo Metro)',
  'Midlands Province (Gweru, Kwekwe)',
  'Manicaland Province (Mutare, Chipinge)',
  'Masvingo Province (Masvingo, Chiredzi)',
  'Mashonaland East (Marondera, Goromonzi)',
  'Mashonaland West (Chinhoyi, Kadoma)',
  'Mashonaland Central (Bindura, Mazowe)',
  'Matabeleland North (Victoria Falls, Hwange)',
  'Matabeleland South (Gwanda, Beitbridge)',
  'Diaspora (UK, South Africa, Global)',
];

interface UploadedDocument {
  id: string;
  name: string;
  size: string;
  type: string;
  docType: string;
}

function BusinessOnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Retrieve initial account values passed from step 1
  const initialName = searchParams.get('name') || 'Midlands Solar & Agro Solutions';
  const initialOwner = searchParams.get('owner') || 'Kudzai Moyo';
  const initialEmail = searchParams.get('email') || 'kudzai@midlandssolar.co.zw';
  const initialPhone = searchParams.get('phone') || '77 345 6789';

  // Wizard state: 1 = Studio Builder, 2 = Security Vault, 3 = Launch Showcase
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Business Details & Trade
  const [businessName, setBusinessName] = useState(initialName);
  const [businessStructure, setBusinessStructure] = useState<BusinessStructure>('corporate');
  const [sector, setSector] = useState(INDUSTRY_CATEGORIES[0].name); // 'Solar & Renewable Energy'
  const [customSector, setCustomSector] = useState('');
  const [tagline, setTagline] = useState(
    'Specialist supplier and installer of tier-1 solar inverters, lithium batteries, and borehole solar pumps.'
  );
  const [province, setProvince] = useState(
    searchParams.get('province') || PROVINCES[2] // Default to Midlands for demo
  );
  const [streetAddress, setStreetAddress] = useState('Stand 405, 5th Street, Light Industrial Site');
  const [city, setCity] = useState('Gweru');

  // Step 2: Verification Documents
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSkipped, setVerificationSkipped] = useState(false);

  // Helper to attach a demo document for quick review
  const handleAttachDemoDoc = (docType: string, customName?: string) => {
    const newDoc: UploadedDocument = {
      id: Math.random().toString(36).substring(7),
      name: customName || `${docType.toUpperCase()}_Verified_${Date.now().toString().slice(-4)}.pdf`,
      size: '1.4 MB',
      type: 'application/pdf',
      docType,
    };
    setUploadedDocs((prev) => [...prev.filter((d) => d.docType !== docType), newDoc]);
  };

  const handleRemoveDoc = (docType: string) => {
    setUploadedDocs((prev) => prev.filter((d) => d.docType !== docType));
  };

  // Quick fill all documents for demo testing
  const handleQuickAttachAll = () => {
    if (businessStructure === 'corporate') {
      setUploadedDocs([
        {
          id: '1',
          name: 'CR14_Midlands_Solar_Pvt_Ltd.pdf',
          size: '2.1 MB',
          type: 'application/pdf',
          docType: 'cr14',
        },
        {
          id: '2',
          name: 'ZIMRA_ITF263_Tax_Clearance_2026.pdf',
          size: '980 KB',
          type: 'application/pdf',
          docType: 'tax_clearance',
        },
      ]);
    } else {
      setUploadedDocs([
        {
          id: '1',
          name: 'National_ID_Kudzai_Moyo.jpg',
          size: '1.2 MB',
          type: 'image/jpeg',
          docType: 'national_id',
        },
        {
          id: '2',
          name: 'Gweru_City_Council_Trading_Permit.pdf',
          size: '1.8 MB',
          type: 'application/pdf',
          docType: 'council_permit',
        },
      ]);
    }
  };

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteVerification = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setVerificationSkipped(false);
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800);
  };

  const handleSkipVerification = () => {
    setVerificationSkipped(true);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Derive initial letters for storefront avatar
  const initials = businessName
    ? businessName
        .split(' ')
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'SC';

  return (
    <div className="relative min-h-screen bg-slate-50/80 dark:bg-[#07090e]/95 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      {/* Background Starfield */}
      <StarfieldCanvas className="z-0 opacity-60 dark:opacity-80" />

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" priority />
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Merchant Onboarding Experience</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Exit to Homepage
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================================
          DISTINCT PROGRESS STEPPER HEADER
          ========================================================================= */}
      <div className="relative z-10 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Step 1 Pill */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                currentStep === 1
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                  : currentStep > 1
                  ? 'border-emerald-400/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] ${
                  currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : currentStep === 1
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {currentStep > 1 ? '✓' : '1'}
              </span>
              <span>1. Storefront Studio</span>
            </div>

            <div className="w-4 h-0.5 bg-slate-300 dark:bg-slate-700 hidden sm:block" />

            {/* Step 2 Pill */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                currentStep === 2
                  ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                  : currentStep > 2
                  ? 'border-emerald-400/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] ${
                  currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : currentStep === 2
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {currentStep > 2 ? '✓' : '2'}
              </span>
              <span>2. Trust &amp; Compliance Vault</span>
            </div>

            <div className="w-4 h-0.5 bg-slate-300 dark:bg-slate-700 hidden sm:block" />

            {/* Step 3 Pill */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                currentStep === 3
                  ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] ${
                  currentStep === 3
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                3
              </span>
              <span>3. Commercial Launch</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-white">
              {businessName || 'Your Business'}
            </span>
            <span>•</span>
            <span className="capitalize">{businessStructure === 'sole' ? 'Sole Trader' : 'Pvt Ltd Corporate'}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full mx-auto px-4 py-8 sm:py-10 flex flex-col justify-between">
        <div>
          {/* =========================================================================
              DESIGN 1: STOREFRONT STUDIO (Dual-Column Workspace with Live Floating Preview)
              ========================================================================= */}
          {currentStep === 1 && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="h-3 w-3" />
                  <span>Interactive Studio Mode</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
                  Architect your business storefront
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  Choose your trade structure, search your industry category, and set your location. Your live storefront preview updates on the right in real time.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Form Builder Inputs (7 Columns) */}
                <div className="lg:col-span-7">
                  <SpotlightCard
                    spotlightColor="rgba(16, 185, 129, 0.12)"
                    borderColor="rgba(16, 185, 129, 0.3)"
                    className="!p-6 sm:!p-8 shadow-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/95 backdrop-blur-md rounded-2xl"
                  >
                    <form onSubmit={handleNextFromStep1} className="space-y-6">
                      {/* Structure Selection */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                            Business Structure <span className="text-emerald-500">*</span>
                          </label>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Adapts your verification requirements
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {/* Option 1: Registered Company */}
                          <div
                            onClick={() => setBusinessStructure('corporate')}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              businessStructure === 'corporate'
                                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                  businessStructure === 'corporate'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                <Building2 className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                    Registered Company
                                  </h3>
                                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                    Pvt Ltd
                                  </span>
                                </div>
                                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                  Has formal CR14 / CR6 and ZIMRA tax clearance.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Option 2: Sole Trader */}
                          <div
                            onClick={() => setBusinessStructure('sole')}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              businessStructure === 'sole'
                                ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                                : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                  businessStructure === 'sole'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                <User className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                    Sole Trader / SME
                                  </h3>
                                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                                    Merchant
                                  </span>
                                </div>
                                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                  Individual artisan or trader. Verified via National ID (No CR14).
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Trading Name & Category Search */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                            Business / Trading name <span className="text-emerald-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            placeholder="e.g. Midlands Solar & Agro Solutions"
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 py-2.5 px-3.5 text-xs text-slate-900 dark:text-white hover:border-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                          />
                        </div>

                        {/* Searchable Industry Category */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-100">
                              Industry category <span className="text-emerald-500">*</span>
                            </label>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              Searchable
                            </span>
                          </div>
                          <CategoryCombobox
                            value={sector}
                            onChange={(newSector) => {
                              setSector(newSector);
                              if (!newSector.startsWith('Other')) {
                                setCustomSector('');
                              }
                            }}
                            onSelectOtherWithSpecialty={(specialty) => {
                              setSector('Other (Please specify)');
                              setCustomSector(specialty);
                            }}
                          />
                        </div>
                      </div>

                      {/* If "Other" chosen: Custom Trade Input */}
                      {sector.startsWith('Other') && (
                        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20 animate-in fade-in duration-200">
                          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                            Specify your trade or specialty <span className="text-emerald-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={customSector}
                            onChange={(e) => setCustomSector(e.target.value)}
                            placeholder="e.g. Commercial Drone Surveying, Waste Tyre Recycling, Snail Farming..."
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                          />

                          {/* Architecture Card */}
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                                Directory &amp; SEO Classification
                              </span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                Other Services
                              </span>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                Clean sitemap indexing &amp; filters.
                              </p>
                            </div>

                            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                              <span className="text-emerald-700 dark:text-emerald-400 block text-[10px] font-semibold uppercase">
                                Public Storefront Display Badge
                              </span>
                              <span className="font-bold text-emerald-800 dark:text-emerald-200 truncate block">
                                {customSector.trim() || 'Your Custom Specialty'}
                              </span>
                              <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                                Shown on your storefront badge.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tagline / Bio */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                          Storefront tagline or overview
                        </label>
                        <textarea
                          rows={2}
                          value={tagline}
                          onChange={(e) => setTagline(e.target.value)}
                          placeholder="Briefly describe what services or products you offer to customers in Zimbabwe..."
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 py-2.5 px-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>

                      {/* Operating Location & Headquarters */}
                      <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                            Operating Location &amp; Headquarters <span className="text-emerald-500">*</span>
                          </label>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Enables provincial directory filters
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Business Province / Headquarters Dropdown */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                              Business Province / Headquarters <span className="text-emerald-500">*</span>
                            </label>
                            <div className="relative flex items-center group">
                              <MapPin className="pointer-events-none absolute left-3.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              <select
                                value={province}
                                onChange={(e) => setProvince(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 py-2.5 pl-10 pr-8 text-xs text-slate-900 dark:text-white hover:border-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 cursor-pointer font-medium"
                              >
                                {PROVINCES.map((prov) => (
                                  <option key={prov} value={prov} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                    {prov}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Town / City */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                              City / Town <span className="text-emerald-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="e.g. Harare, Bulawayo, Gweru, Mutare"
                              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 py-2.5 px-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                            />
                          </div>

                          {/* Physical Street Address / Premises */}
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                              Physical street address, stand, or premises
                            </label>
                            <input
                              type="text"
                              value={streetAddress}
                              onChange={(e) => setStreetAddress(e.target.value)}
                              placeholder="e.g. Stand 405, 5th Street, Light Industrial Site"
                              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 py-2.5 px-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <Link
                          href="/signup?type=business"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Back to credentials</span>
                        </Link>

                        <Button
                          type="submit"
                          variant="primary"
                          size="md"
                          className="bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold py-2.5 px-6 rounded-xl shadow-emerald"
                        >
                          <span>Proceed to Trust Vault</span>
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </form>
                  </SpotlightCard>
                </div>

                {/* Right Column: Live Sticky Storefront Preview Widget (5 Columns) */}
                <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 shadow-lg backdrop-blur-md">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-[11px]">
                      <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Storefront Preview
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Real-Time Sync
                      </span>
                    </div>

                    {/* Preview Card */}
                    <div className="mt-4 p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-900/90 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-3.5">
                      <div className="flex items-start gap-3.5">
                        {/* Company Monogram Badge */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-base shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/30">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {businessName || 'Business Name'}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              {sector.startsWith('Other') ? customSector || 'Custom Trade' : sector}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {businessStructure === 'corporate' ? 'Pvt Ltd' : 'Sole Trader'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tagline */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2 leading-relaxed">
                        &ldquo;{tagline}&rdquo;
                      </p>

                      {/* Location & Contact info */}
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{city || 'City'}, {province.split(' ')[0]}</span>
                        </div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Zimbabwe Grid
                        </span>
                      </div>
                    </div>

                    {/* Studio Guidance Box */}
                    <div className="mt-4 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                      <Sparkles className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                      <div>
                        <strong>Identity Studio Active:</strong> When buyers browse the national directory, your company card will feature this custom trade specialty and provincial location.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              DESIGN 2: SECURITY & COMPLIANCE VAULT (Bank-Grade Audited Vault Style)
              ========================================================================= */}
          {currentStep === 2 && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-98 duration-200">
              {/* Vault Header Banner */}
              <div className="relative overflow-hidden rounded-3xl border-2 border-slate-800 bg-gradient-to-r from-slate-900 via-[#0a1122] to-slate-900 p-6 sm:p-8 text-white shadow-2xl">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 shadow-inner">
                      <ShieldCheck className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-300">
                        <Lock className="h-2.5 w-2.5" />
                        <span>256-Bit Encrypted Compliance Vault</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1.5">
                        {businessStructure === 'sole'
                          ? 'Sole Trader Trust & Identity Audit'
                          : 'Corporate Registrar & Tax Clearance Audit'}
                      </h2>
                      <p className="mt-1 text-xs text-slate-300 max-w-lg leading-relaxed">
                        {businessStructure === 'sole'
                          ? 'Sole traders do not require a CR14. Simply upload your National ID and local council trading permit to unlock your Verified Merchant badge.'
                          : 'Formally incorporated companies verify with their CR14 directors list and ZIMRA Tax Clearance (ITF263) to earn top-tier corporate directory certification.'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Demo Attach */}
                  <div className="shrink-0 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleQuickAttachAll}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-blue-300" />
                      <span>Demo: Attach Sample Docs</span>
                    </button>
                  </div>
                </div>

                {/* Subtle cyber background grid */}
                <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-600/10 blur-[80px]" />
              </div>

              {/* Upload Slots Container */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 px-1">
                  <span>Document Verification Checklist</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {uploadedDocs.length} Attached
                  </span>
                </div>

                {businessStructure === 'corporate' ? (
                  <>
                    {/* Slot 1: CR14 */}
                    <VaultDocumentSlot
                      title="CR14 / CR6 (Company Directors List)"
                      badge="Official Registrar of Companies"
                      description="Certificate detailing company directors, secretaries, and registered legal address in Zimbabwe."
                      docType="cr14"
                      icon={Building2}
                      uploadedDoc={uploadedDocs.find((d) => d.docType === 'cr14')}
                      onAttachDemo={() => handleAttachDemoDoc('cr14', 'CR14_Directors_List.pdf')}
                      onRemove={() => handleRemoveDoc('cr14')}
                      required
                    />

                    {/* Slot 2: ZIMRA Tax Clearance */}
                    <VaultDocumentSlot
                      title="ZIMRA Tax Clearance Certificate (ITF263)"
                      badge="Zimbabwe Revenue Authority"
                      description="Valid ZIMRA tax clearance showing your active Business Partner (BP) number."
                      docType="tax_clearance"
                      icon={FileText}
                      uploadedDoc={uploadedDocs.find((d) => d.docType === 'tax_clearance')}
                      onAttachDemo={() => handleAttachDemoDoc('tax_clearance', 'ZIMRA_ITF263_Clearance.pdf')}
                      onRemove={() => handleRemoveDoc('tax_clearance')}
                      required
                    />

                    {/* Slot 3: Council License */}
                    <VaultDocumentSlot
                      title="City Council Trading License / Utility Bill"
                      badge="Municipal Premise Proof"
                      description="City of Harare, Bulawayo, or local council operating license or commercial premise receipt."
                      docType="council_permit"
                      icon={Store}
                      uploadedDoc={uploadedDocs.find((d) => d.docType === 'council_permit')}
                      onAttachDemo={() => handleAttachDemoDoc('council_permit', 'Council_Operating_License.pdf')}
                      onRemove={() => handleRemoveDoc('council_permit')}
                    />
                  </>
                ) : (
                  <>
                    {/* Slot 1: National ID */}
                    <VaultDocumentSlot
                      title="Owner National ID Card or Passport"
                      badge="No CR14 Required"
                      description="Zimbabwe National ID (Metal or Plastic card) or valid Passport of the sole proprietor."
                      docType="national_id"
                      icon={User}
                      uploadedDoc={uploadedDocs.find((d) => d.docType === 'national_id')}
                      onAttachDemo={() => handleAttachDemoDoc('national_id', 'National_ID_Proprietor.jpg')}
                      onRemove={() => handleRemoveDoc('national_id')}
                      required
                    />

                    {/* Slot 2: Council Trading Permit */}
                    <VaultDocumentSlot
                      title="City Council Trading Permit / Lease Agreement"
                      badge="Operating Premise Proof"
                      description="Local municipal vendor permit, market stall license, or workshop lease agreement."
                      docType="council_permit"
                      icon={Store}
                      uploadedDoc={uploadedDocs.find((d) => d.docType === 'council_permit')}
                      onAttachDemo={() => handleAttachDemoDoc('council_permit', 'Trading_Permit_Receipt.pdf')}
                      onRemove={() => handleRemoveDoc('council_permit')}
                      required
                    />

                    {/* Slot 3: Workshop Photo */}
                    <VaultDocumentSlot
                      title="Workshop, Storefront or Stock Photo"
                      badge="Visual Verification"
                      description="A clear photo of your operating workspace, shop counter, or inventory to build buyer trust."
                      docType="storefront_photo"
                      icon={Building2}
                      uploadedDoc={uploadedDocs.find((d) => d.docType === 'storefront_photo')}
                      onAttachDemo={() => handleAttachDemoDoc('storefront_photo', 'Workshop_Premises_Gweru.jpg')}
                      onRemove={() => handleRemoveDoc('storefront_photo')}
                    />
                  </>
                )}
              </div>

              {/* Trust Perks Bar */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Green Verified Shield</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>3x Higher Ranking</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Direct WhatsApp Inquiries</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Marketplace Verified</span>
                </div>
              </div>

              {/* Vault Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Storefront Studio</span>
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Non-blocking Skip */}
                  <button
                    type="button"
                    onClick={handleSkipVerification}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Skip for now &amp; upload later
                  </button>

                  {/* Submit Vault button */}
                  <Button
                    type="button"
                    onClick={handleCompleteVerification}
                    variant="primary"
                    size="md"
                    loading={isSubmitting}
                    disabled={uploadedDocs.length === 0}
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-xs font-semibold py-2.5 px-6 rounded-xl shadow-md disabled:opacity-50"
                  >
                    <span>Submit to Compliance Desk ({uploadedDocs.length})</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              DESIGN 3: STOREFRONT LAUNCH SHOWCASE (Grand Celebration & Commercial Showcase)
              ========================================================================= */}
          {currentStep === 3 && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-98 duration-200">
              {/* Grand Reveal Hero */}
              <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-[#07090e] p-8 text-center shadow-xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 ring-4 ring-emerald-500/20">
                  <Award className="h-9 w-9" />
                </div>
                <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {verificationSkipped
                    ? 'Your Storefront is Active on Sadza Connect!'
                    : 'Documents Submitted & Storefront Activated!'}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                  {verificationSkipped
                    ? 'Your profile is published in the national directory. You can complete document verification at any time from your settings to claim the verified badge.'
                    : `Your documents have been routed to our verification desk. Audits are completed within 2–4 business hours.`}
                </p>
              </div>

              {/* The "Showcase Pedestal": Live Directory Card Showcase */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                  <span className="font-bold uppercase tracking-wider text-slate-400">
                    Directory Card Showcase
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Across Zimbabwe
                  </span>
                </div>

                <div className="mt-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {sector.startsWith('Other') ? customSector || 'Custom Specialty' : sector}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{city}, {province.split(' ')[0]}</span>
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                      {businessName}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                      {tagline}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {/* Structure badge */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {businessStructure === 'corporate' ? (
                          <>
                            <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Pvt Ltd Corporate</span>
                          </>
                        ) : (
                          <>
                            <User className="h-3.5 w-3.5 text-blue-600" />
                            <span>Registered Sole Trader</span>
                          </>
                        )}
                      </span>

                      {/* Verification badge */}
                      {!verificationSkipped ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>
                            {businessStructure === 'sole'
                              ? 'Verified Merchant (Sole Trader)'
                              : 'CR14 Verified Corporate'}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                          <span>Standard Listing (Unverified)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Simulated Contact Action Card */}
                  <div className="shrink-0 flex sm:flex-col gap-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 min-w-[190px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                      Buyer Contact Actions
                    </span>
                    <button
                      type="button"
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xs opacity-90 cursor-default flex items-center justify-center gap-2"
                    >
                      <span>Inquire via WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      disabled
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-default text-center"
                    >
                      Call Office
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Actionable Launch Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-emerald-500 transition-colors">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mb-3">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    List Marketplace Products
                  </h4>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Post equipment, inverters, farm inputs, or stock to sell to buyers across Zimbabwe.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-blue-500 transition-colors">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center mb-3">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    Post Job Vacancies
                  </h4>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Hire technicians, sales reps, drivers, or accountants in {province.split(' ')[0]}.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-amber-500 transition-colors">
                  <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center mb-3">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    Share Verified Card
                  </h4>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Share your official listing URL with clients and suppliers for verified trust.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Review documents</span>
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link href="/businesses" className="flex-1 sm:flex-none">
                    <Button variant="outline" size="md" className="w-full text-xs font-semibold py-2.5">
                      Explore Directory
                    </Button>
                  </Link>

                  <Link href="/" className="flex-1 sm:flex-none">
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold py-2.5 px-6 rounded-xl shadow-emerald"
                    >
                      <span>Enter Platform Dashboard</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <div>© {new Date().getFullYear()} Sadza Connect. Africdominion Group (Pvt) Ltd.</div>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href="#" className="hover:text-slate-600 dark:hover:text-slate-300">Zimbabwe Commercial Act</Link>
            <Link href="#" className="hover:text-slate-600 dark:hover:text-slate-300">Verification Policy</Link>
            <Link href="#" className="hover:text-slate-600 dark:hover:text-slate-300">Support</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

// Vault-specific Document Slot Component with dark compliance styling
function VaultDocumentSlot({
  title,
  badge,
  description,
  docType,
  icon: Icon,
  required = false,
  uploadedDoc,
  onAttachDemo,
  onRemove,
}: {
  title: string;
  badge: string;
  description: string;
  docType: string;
  icon: React.ComponentType<{ className?: string }>;
  required?: boolean;
  uploadedDoc?: UploadedDocument;
  onAttachDemo: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all ${
        uploadedDoc
          ? 'border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-sm'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              uploadedDoc
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {uploadedDoc ? <FileCheck className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {title}
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {badge}
              </span>
              {required && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                  Required
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
              {description}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center justify-end">
          {uploadedDoc ? (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/80 px-3 py-1.5 rounded-xl shadow-xs">
              <FileCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <div className="text-[11px]">
                <span className="font-semibold text-emerald-900 dark:text-emerald-100 truncate max-w-[140px] inline-block align-middle">
                  {uploadedDoc.name}
                </span>
                <span className="text-emerald-600/70 dark:text-emerald-400/70 ml-1">({uploadedDoc.size})</span>
              </div>
              <button
                type="button"
                onClick={onRemove}
                className="text-emerald-600 dark:text-emerald-400 hover:text-rose-500 p-1 ml-1"
                aria-label="Remove document"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onAttachDemo}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Attach File</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BusinessOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#07090e]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      }
    >
      <BusinessOnboardingContent />
    </Suspense>
  );
}
