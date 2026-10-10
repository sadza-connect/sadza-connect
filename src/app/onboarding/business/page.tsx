'use client';

import React, { Suspense, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { CategoryCombobox } from '@/components/ui/CategoryCombobox';
import { INDUSTRY_CATEGORIES } from '@/lib/data/categories';
import {
  Building2,
  User,
  Users,
  Store,
  ShieldCheck,
  FileText,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Mail,
  FileCheck,
  X,
  Briefcase,
  ShoppingBag,
  Share2,
  Check,
  Award,
  Layers,
  Truck,
  Wrench,
  Package,
  Handshake,
  BadgeCheck,
  Sparkles,
} from 'lucide-react';

export type BusinessType = 'sole_proprietor' | 'sme_partnership' | 'registered_company' | 'cooperative';
export type BusinessScale = 'solo' | 'small_team' | 'medium_enterprise' | 'large_enterprise';
export type OperatingYears = 'under_1' | '1_to_3' | '3_to_10' | 'over_10';
export type OfferingType = 'products' | 'services' | 'both';
export type ServiceMode = 'physical_premises' | 'mobile_delivery' | 'both_modes';

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

interface BusinessTypeOption {
  id: BusinessType;
  title: string;
  subtitle: string;
  description: string;
  examples: string;
  verificationNote: string;
  badgeText: string;
  icon: React.ComponentType<{ className?: string }>;
}

const BUSINESS_TYPES: BusinessTypeOption[] = [
  {
    id: 'sole_proprietor',
    title: 'Sole Proprietor / Individual Business',
    subtitle: 'Independent trader, freelancer, artisan, or self-employed professional',
    description:
      'You own and operate the business independently as an individual, whether from home, a workshop, a market stall, or on-site.',
    examples: 'Examples: Independent solar technician, farmer, caterer, mechanic, consultant, or sole trader',
    verificationNote: 'Verified with your National ID or Passport (No company incorporation papers required)',
    badgeText: 'Sole Proprietor',
    icon: User,
  },
  {
    id: 'sme_partnership',
    title: 'Small or Medium Business (SME / Partnership)',
    subtitle: 'Growing local enterprise, retail shop, workshop, or partnered business',
    description:
      'You run an active small-to-medium business or partnership with a team, serving local or regional customers.',
    examples: 'Examples: Hardware store, agro-dealer shop, auto workshop, clinic, lodge, or family business',
    verificationNote: 'Verified with Owner ID and Trading License, Shop Lease, or PBA registration',
    badgeText: 'SME / Partnership',
    icon: Store,
  },
  {
    id: 'registered_company',
    title: 'Registered Company (Full Corporate / Pvt Ltd)',
    subtitle: 'Formally incorporated Private Limited Company or commercial corporation',
    description:
      'Your business is officially incorporated with the Registrar of Companies and operates as a full corporate entity.',
    examples: 'Examples: Distributors, manufacturers, engineering contractors, haulage fleets, or corporate suppliers',
    verificationNote: 'Verified with Certificate of Incorporation / CR14 and ZIMRA Tax Clearance',
    badgeText: 'Registered Company (Pvt Ltd)',
    icon: Building2,
  },
  {
    id: 'cooperative',
    title: 'Cooperative, Association, or Group Venture',
    subtitle: 'Farming cooperative, producer group, mining syndicate, or trade association',
    description:
      'Your enterprise is jointly owned and operated by a group of producers, farmers, artisans, or members working together.',
    examples: 'Examples: Agricultural cooperative, women’s producer group, small-scale mining syndicate, or union',
    verificationNote: 'Verified with Cooperative Registration Certificate or Group Constitution & Representative ID',
    badgeText: 'Cooperative / Group',
    icon: Handshake,
  },
];

const BUSINESS_SCALES: {
  id: BusinessScale;
  label: string;
  teamRange: string;
  description: string;
}[] = [
  {
    id: 'solo',
    label: 'Just Me (Solo)',
    teamRange: '1 Person',
    description: 'I handle all daily operations and customer inquiries myself.',
  },
  {
    id: 'small_team',
    label: 'Small Business Team',
    teamRange: '2 – 10 People',
    description: 'A small crew, shop staff, or workshop team working together.',
  },
  {
    id: 'medium_enterprise',
    label: 'Medium Enterprise',
    teamRange: '11 – 50 People',
    description: 'Established operations with dedicated staff or multiple branches.',
  },
  {
    id: 'large_enterprise',
    label: 'Large Organization',
    teamRange: '50+ People',
    description: 'Full-scale commercial, industrial, or nationwide workforce.',
  },
];

const OPERATING_YEARS: { id: OperatingYears; label: string; sub: string }[] = [
  { id: 'under_1', label: 'Newly Starting', sub: 'Less than 1 year' },
  { id: '1_to_3', label: 'Growing Business', sub: '1 – 3 years' },
  { id: '3_to_10', label: 'Established', sub: '3 – 10 years' },
  { id: 'over_10', label: 'Long-Standing', sub: '10+ years' },
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

  // Retrieve initial account values passed from signup
  const initialName = searchParams.get('name') || '';
  const initialOwner = searchParams.get('owner') || '';
  const initialEmail = searchParams.get('email') || '';
  const initialPhone = searchParams.get('phone') || '';
  const isEmailVerified = searchParams.get('verified') === 'true';

  // 4-step interactive onboarding + Step 5 completion screen
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Business Type, Scale & Experience
  const [businessType, setBusinessType] = useState<BusinessType>('sme_partnership');
  const [businessScale, setBusinessScale] = useState<BusinessScale>('small_team');
  const [operatingYears, setOperatingYears] = useState<OperatingYears>('1_to_3');

  // Step 2: Business Name, Industry Sector & Offerings
  const [businessName, setBusinessName] = useState(initialName || '');
  const [sector, setSector] = useState(INDUSTRY_CATEGORIES[0].name);
  const [customSector, setCustomSector] = useState('');
  const [offeringType, setOfferingType] = useState<OfferingType>('both');
  const [description, setDescription] = useState('');
  const [step2Error, setStep2Error] = useState('');

  // Step 3: Location & Contact Details
  const [serviceMode, setServiceMode] = useState<ServiceMode>('both_modes');
  const [province, setProvince] = useState(searchParams.get('province') || PROVINCES[0]);
  const [city, setCity] = useState('Harare');
  const [streetAddress, setStreetAddress] = useState('');
  const [contactPhone, setContactPhone] = useState(initialPhone || '');
  const [contactEmail, setContactEmail] = useState(initialEmail || '');
  const [step3Error, setStep3Error] = useState('');

  // Step 4: Verification Documents
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSkipped, setVerificationSkipped] = useState(false);

  const selectedTypeObj =
    BUSINESS_TYPES.find((t) => t.id === businessType) || BUSINESS_TYPES[1];
  const selectedScaleObj =
    BUSINESS_SCALES.find((s) => s.id === businessScale) || BUSINESS_SCALES[1];
  const selectedYearsObj =
    OPERATING_YEARS.find((y) => y.id === operatingYears) || OPERATING_YEARS[1];

  const handleFileUpload = (docType: string, file: File) => {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr =
      file.size > 1024 * 1024
        ? `${sizeMb} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;
    const newDoc: UploadedDocument = {
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: sizeStr,
      type: file.type || 'application/octet-stream',
      docType,
    };
    setUploadedDocs((prev) => [...prev.filter((d) => d.docType !== docType), newDoc]);
  };

  const handleRemoveDoc = (docType: string) => {
    setUploadedDocs((prev) => prev.filter((d) => d.docType !== docType));
  };

  const goToStep = (step: 1 | 2 | 3 | 4 | 5) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    goToStep(2);
  };

  const handleContinueFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep2Error('');
    if (!businessName.trim()) {
      setStep2Error('Please enter your business or trading name.');
      return;
    }
    if (sector.startsWith('Other') && !customSector.trim()) {
      setStep2Error('Please specify your custom industry or trade.');
      return;
    }
    goToStep(3);
  };

  const handleContinueFromStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep3Error('');
    if (!city.trim()) {
      setStep3Error('Please enter the city or town where your business operates.');
      return;
    }
    goToStep(4);
  };

  const handleCompleteOnboarding = (skipped: boolean) => {
    setIsSubmitting(true);
    setVerificationSkipped(skipped);
    setTimeout(() => {
      setIsSubmitting(false);
      goToStep(5);
    }, 600);
  };

  const displayBusinessName = businessName.trim() || initialName || 'Your Business Name';
  const displaySector = sector.startsWith('Other')
    ? customSector.trim() || 'Specialized Business'
    : sector;

  const initials = displayBusinessName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'BZ';

  const STEPS = [
    { num: 1, title: 'Business Type & Size', subtitle: 'Structure & team scale' },
    { num: 2, title: 'Industry & Offerings', subtitle: 'What your business does' },
    { num: 3, title: 'Location & Contact', subtitle: 'Where customers find you' },
    { num: 4, title: 'Verification & Finish', subtitle: 'Confirm & launch profile' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col">
      {/* =========================================================================
          TOP ENTERPRISE NAVIGATION BAR
          ========================================================================= */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo size="md" priority />
            <div className="hidden md:flex items-center gap-2.5 pl-4 border-l border-slate-200 dark:border-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Business Profile Setup
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {(isEmailVerified || initialEmail) && (
              <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  Email Confirmed{initialEmail ? `: ${initialEmail}` : ''}
                </span>
              </div>
            )}
            <ThemeToggle />
            <Link
              href="/"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Save &amp; Exit
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================================
          CLEAR, MATURE 4-STEP PROGRESS BAR
          ========================================================================= */}
      {currentStep <= 4 && (
        <div className="border-b border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 py-5 px-4 sm:px-8 shadow-xs">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {STEPS.map((step) => {
                const isActive = currentStep === step.num;
                const isCompleted = currentStep > step.num;
                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={() => {
                      if (step.num < currentStep) {
                        goToStep(step.num);
                      }
                    }}
                    disabled={step.num > currentStep}
                    className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border text-left transition-all ${
                      isActive
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 shadow-xs'
                        : isCompleted
                        ? 'border-emerald-300 dark:border-emerald-800/70 bg-emerald-50/30 dark:bg-emerald-950/20 cursor-pointer hover:border-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 opacity-70 cursor-default'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isActive
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : step.num}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-sm sm:text-base font-bold truncate ${
                          isActive
                            ? 'text-emerald-950 dark:text-emerald-200'
                            : isCompleted
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {step.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN FULL-SCALE CONTENT WORKSPACE
          ========================================================================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {currentStep <= 4 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* LEFT / MAIN INTERACTIVE QUESTIONNAIRE COLUMN (8 Columns on Desktop) */}
            <div className="lg:col-span-8 space-y-8">
              {/* =================================================================
                  STEP 1: WHAT TYPE OF BUSINESS DO YOU OPERATE?
                  ================================================================= */}
              {currentStep === 1 && (
                <form
                  onSubmit={handleContinueFromStep1}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm space-y-10"
                >
                  {/* Step 1 Intro Header */}
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-3">
                      <span>Step 1 of 4 • Business Classification</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {initialOwner
                        ? `Welcome, ${initialOwner.split(' ')[0]}. Tell us about your business.`
                        : 'Tell us what type of business you operate'}
                    </h1>
                    <p className="mt-2.5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                      Every business is different. Whether you run a solo trade on your own, a growing local shop, a registered company, or a cooperative, we tailor your profile and verification to fit how you work.
                    </p>
                  </div>

                  {/* Question 1: Business Structure / Type */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        1. Which of these best describes your business? <span className="text-emerald-600">*</span>
                      </h2>
                      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
                        Select the option that matches how your business is currently operated or registered.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pt-1">
                      {BUSINESS_TYPES.map((typeOption) => {
                        const IconComponent = typeOption.icon;
                        const isSelected = businessType === typeOption.id;

                        return (
                          <div
                            key={typeOption.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              setBusinessType(typeOption.id);
                              if (typeOption.id === 'sole_proprietor') {
                                setBusinessScale('solo');
                              } else if (typeOption.id === 'sme_partnership' && businessScale === 'solo') {
                                setBusinessScale('small_team');
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setBusinessType(typeOption.id);
                              }
                            }}
                            className={`relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl border-2 cursor-pointer transition-all text-left ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-md'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-3">
                                <div
                                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  <IconComponent className="h-6 w-6" />
                                </div>

                                <div
                                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                                    isSelected
                                      ? 'border-emerald-600 bg-emerald-600 text-white'
                                      : 'border-slate-300 dark:border-slate-600'
                                  }`}
                                >
                                  {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                </div>
                              </div>

                              <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                {typeOption.title}
                              </h3>
                              <p className="mt-1 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                {typeOption.subtitle}
                              </p>
                              <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                {typeOption.description}
                              </p>
                            </div>

                            <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-700/70 space-y-1.5">
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {typeOption.examples}
                              </p>
                              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>{typeOption.verificationNote}</span>
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question 2: Business Size / Team Scale */}
                  <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        2. How big is your business or team right now? <span className="text-emerald-600">*</span>
                      </h2>
                      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
                        This helps us match your business with appropriate customers, bulk buyers, or suppliers.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {BUSINESS_SCALES.map((scale) => {
                        const isSelected = businessScale === scale.id;
                        return (
                          <div
                            key={scale.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setBusinessScale(scale.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setBusinessScale(scale.id);
                              }
                            }}
                            className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all text-left ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-base font-bold text-slate-900 dark:text-white">
                                {scale.label}
                              </span>
                              <span
                                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {scale.teamRange}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                              {scale.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question 3: Years in Operation */}
                  <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        3. How long have you been in business?
                      </h2>
                      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
                        New businesses and long-standing enterprises are equally welcome.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                      {OPERATING_YEARS.map((yr) => {
                        const isSelected = operatingYears === yr.id;
                        return (
                          <button
                            key={yr.id}
                            type="button"
                            onClick={() => setOperatingYears(yr.id)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300'
                            }`}
                          >
                            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                              {yr.label}
                            </div>
                            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {yr.sub}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 1 Footer Navigation */}
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Link
                      href="/signup?type=business"
                      className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      <span>Back to Account Registration</span>
                    </Link>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-base font-semibold py-3.5 px-8 rounded-xl shadow-md"
                    >
                      <span>Continue: Industry &amp; Offerings</span>
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </form>
              )}

              {/* =================================================================
                  STEP 2: WHAT KIND OF BUSINESS ARE YOU DOING? (INDUSTRY & OFFERINGS)
                  ================================================================= */}
              {currentStep === 2 && (
                <form
                  onSubmit={handleContinueFromStep2}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm space-y-10 animate-in fade-in duration-200"
                >
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-3">
                      <span>Step 2 of 4 • Industry &amp; Core Offerings</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                      What kind of business do you do?
                    </h1>
                    <p className="mt-2.5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                      Let customers and business partners know your trading name, the industry sector you operate in, and the main products or services you provide.
                    </p>
                  </div>

                  {step2Error && (
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-sm sm:text-base font-medium text-rose-700 dark:text-rose-300">
                      {step2Error}
                    </div>
                  )}

                  {/* Question 1: Business / Trading Name */}
                  <div className="space-y-3">
                    <label
                      htmlFor="business-name-input"
                      className="block text-lg sm:text-xl font-bold text-slate-900 dark:text-white"
                    >
                      1. What is your Business or Trading Name? <span className="text-emerald-600">*</span>
                    </label>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
                      Enter the name that customers see on your shop, invoices, or business profile.
                    </p>
                    <input
                      id="business-name-input"
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Midlands Solar & Agro Solutions"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3.5 px-4 text-base sm:text-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                    />
                  </div>

                  {/* Question 2: Primary Industry Sector */}
                  <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        2. Which industry or sector is your business in? <span className="text-emerald-600">*</span>
                      </label>
                      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
                        Search from 20 commercial sectors below, or pick a popular category. If your trade is unique, select &ldquo;Other&rdquo; to enter your exact specialty.
                      </p>
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

                    {/* Quick-Select Sector Pills for immediate 1-click selection */}
                    <div className="pt-2">
                      <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 block mb-2.5">
                        Or quick-select a common business sector:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {INDUSTRY_CATEGORIES.slice(0, 8).map((cat) => {
                          const active = sector === cat.name;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setSector(cat.name);
                                setCustomSector('');
                              }}
                              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                                active
                                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                              }`}
                            >
                              {cat.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Specialty Input when "Other" is selected */}
                    {sector.startsWith('Other') && (
                      <div className="p-5 rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
                        <label className="block text-base font-bold text-slate-900 dark:text-white">
                          Please specify your exact business trade or specialty <span className="text-emerald-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={customSector}
                          onChange={(e) => setCustomSector(e.target.value)}
                          placeholder="e.g. Borehole Drilling, Poultry Hatchery, Event Equipment Hire, Borehole Siting..."
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-3.5 px-4 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                    )}
                  </div>

                  {/* Question 3: What do you offer? (Products vs Services vs Both) */}
                  <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        3. What does your business provide to customers? <span className="text-emerald-600">*</span>
                      </h2>
                      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
                        Choose whether you sell physical goods, deliver services, or offer both.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        {
                          id: 'products' as OfferingType,
                          title: 'Physical Products',
                          desc: 'We sell goods, stock, equipment, farm produce, or retail items.',
                          icon: Package,
                        },
                        {
                          id: 'services' as OfferingType,
                          title: 'Professional Services',
                          desc: 'We provide repairs, installations, transport, consulting, or skilled work.',
                          icon: Wrench,
                        },
                        {
                          id: 'both' as OfferingType,
                          title: 'Both Products & Services',
                          desc: 'We supply products and also install, maintain, or deliver them.',
                          icon: Layers,
                        },
                      ].map((item) => {
                        const IconComp = item.icon;
                        const isSelected = offeringType === item.id;
                        return (
                          <div
                            key={item.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setOfferingType(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setOfferingType(item.id);
                              }
                            }}
                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all text-left ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300'
                            }`}
                          >
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl mb-3 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <IconComp className="h-5 w-5" />
                            </div>
                            <div className="text-base font-bold text-slate-900 dark:text-white">
                              {item.title}
                            </div>
                            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question 4: Clear Business Description */}
                  <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <label
                      htmlFor="business-description"
                      className="block text-lg sm:text-xl font-bold text-slate-900 dark:text-white"
                    >
                      4. Briefly describe your main products or services
                    </label>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
                      Write 1 or 2 clear sentences explaining what customers can buy from you or hire you for.
                    </p>
                    <textarea
                      id="business-description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={`e.g. We supply and install reliable ${displaySector.toLowerCase()} solutions for homes, farms, and businesses with full after-sales support.`}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3.5 px-4 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Step 2 Footer Navigation */}
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      <span>Back to Business Type</span>
                    </button>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-base font-semibold py-3.5 px-8 rounded-xl shadow-md"
                    >
                      <span>Continue: Location &amp; Contact</span>
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </form>
              )}

              {/* =================================================================
                  STEP 3: OPERATING LOCATION & CUSTOMER CONTACT
                  ================================================================= */}
              {currentStep === 3 && (
                <form
                  onSubmit={handleContinueFromStep3}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm space-y-10 animate-in fade-in duration-200"
                >
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-3">
                      <span>Step 3 of 4 • Operating Location &amp; Contact</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Where is your business located?
                    </h1>
                    <p className="mt-2.5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                      Help customers find your premises or know which areas you serve, and confirm the phone number and email they should use to reach you.
                    </p>
                  </div>

                  {step3Error && (
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-sm sm:text-base font-medium text-rose-700 dark:text-rose-300">
                      {step3Error}
                    </div>
                  )}

                  {/* Question 1: How do customers interact with your location? */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        1. How do you serve your customers? <span className="text-emerald-600">*</span>
                      </h2>
                      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
                        Let customers know whether they can visit your shop/office or if you deliver to them.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        {
                          id: 'physical_premises' as ServiceMode,
                          title: 'Physical Shop / Office',
                          desc: 'Customers visit our shop, office, workshop, or farm.',
                          icon: Store,
                        },
                        {
                          id: 'mobile_delivery' as ServiceMode,
                          title: 'Mobile / Delivery Only',
                          desc: 'We travel to clients or deliver orders directly to their location.',
                          icon: Truck,
                        },
                        {
                          id: 'both_modes' as ServiceMode,
                          title: 'Premises & Delivery',
                          desc: 'Customers can visit our premises or request delivery / on-site callouts.',
                          icon: MapPin,
                        },
                      ].map((mode) => {
                        const IconComp = mode.icon;
                        const isSelected = serviceMode === mode.id;
                        return (
                          <div
                            key={mode.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setServiceMode(mode.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setServiceMode(mode.id);
                              }
                            }}
                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all text-left ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300'
                            }`}
                          >
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl mb-3 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <IconComp className="h-5 w-5" />
                            </div>
                            <div className="text-base font-bold text-slate-900 dark:text-white">
                              {mode.title}
                            </div>
                            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                              {mode.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question 2: Province, City & Address */}
                  <div className="space-y-5 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        2. Operating Location &amp; Address <span className="text-emerald-600">*</span>
                      </h2>
                      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
                        Used to list your business in local and provincial searches.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="province-select"
                          className="block text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 mb-2"
                        >
                          Province / Region <span className="text-emerald-600">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <MapPin className="pointer-events-none absolute left-4 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          <select
                            id="province-select"
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3.5 pl-12 pr-8 text-base text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer font-medium"
                          >
                            {PROVINCES.map((prov) => (
                              <option
                                key={prov}
                                value={prov}
                                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                              >
                                {prov}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="city-input"
                          className="block text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 mb-2"
                        >
                          City or Town <span className="text-emerald-600">*</span>
                        </label>
                        <input
                          id="city-input"
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Harare, Bulawayo, Gweru, Mutare"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3.5 px-4 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="street-address-input"
                          className="block text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 mb-2"
                        >
                          Physical Street Address, Stand Number, or Operating Area
                        </label>
                        <input
                          id="street-address-input"
                          type="text"
                          value={streetAddress}
                          onChange={(e) => setStreetAddress(e.target.value)}
                          placeholder="e.g. Stand 405, 5th Street, Light Industrial Site, or CBD Shop 12"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3.5 px-4 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Question 3: Business Phone / WhatsApp & Email */}
                  <div className="space-y-5 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        3. Direct Business Contact Details
                      </h2>
                      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
                        Customers will use these details to call, WhatsApp, or email your business for inquiries.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="business-phone"
                          className="block text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 mb-2"
                        >
                          Business Phone / WhatsApp Number
                        </label>
                        <div className="relative flex items-center">
                          <Phone className="pointer-events-none absolute left-4 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          <input
                            id="business-phone"
                            type="tel"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="e.g. +263 77 123 4567"
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3.5 pl-12 pr-4 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="business-email"
                          className="block text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 mb-2"
                        >
                          Business Contact Email
                        </label>
                        <div className="relative flex items-center">
                          <Mail className="pointer-events-none absolute left-4 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          <input
                            id="business-email"
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="e.g. sales@yourbusiness.co.zw"
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3.5 pl-12 pr-4 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 Footer Navigation */}
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      <span>Back to Industry &amp; Offerings</span>
                    </button>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-base font-semibold py-3.5 px-8 rounded-xl shadow-md"
                    >
                      <span>Continue: Verification &amp; Review</span>
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </form>
              )}

              {/* =================================================================
                  STEP 4: TAILORED VERIFICATION & FINAL LAUNCH
                  ================================================================= */}
              {currentStep === 4 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm space-y-8 animate-in fade-in duration-200">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-3">
                      <span>Step 4 of 4 • Verification &amp; Profile Completion</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Verify your {selectedTypeObj.badgeText} profile
                    </h1>
                    <p className="mt-2.5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                      Because you selected <strong className="text-slate-900 dark:text-white">{selectedTypeObj.title}</strong>, we have tailored the verification checklist below to match your exact business structure. You can upload these documents now or skip and upload them later from your dashboard.
                    </p>
                  </div>

                  {/* Tailored Document Upload Checklist */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        Recommended Documents for {selectedTypeObj.badgeText}
                      </h2>
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {uploadedDocs.length} Document{uploadedDocs.length === 1 ? '' : 's'} Attached
                      </span>
                    </div>

                    {businessType === 'sole_proprietor' && (
                      <div className="space-y-4">
                        <DocumentUploadCard
                          title="Owner National ID or Passport"
                          badge="No CR14 Required"
                          description="Upload a clear photo or scan of your National ID card or valid Passport to confirm your identity as the sole proprietor."
                          docType="national_id"
                          icon={User}
                          uploadedDoc={uploadedDocs.find((d) => d.docType === 'national_id')}
                          onUpload={(file) => handleFileUpload('national_id', file)}
                          onRemove={() => handleRemoveDoc('national_id')}
                        />
                        <DocumentUploadCard
                          title="Proof of Trade, Vendor Permit, or Workspace Photo (Optional)"
                          badge="Builds Customer Trust"
                          description="A photo of your workshop, market stall, stock, trade certificate, or local council permit."
                          docType="proof_of_trade"
                          icon={Store}
                          uploadedDoc={uploadedDocs.find((d) => d.docType === 'proof_of_trade')}
                          onUpload={(file) => handleFileUpload('proof_of_trade', file)}
                          onRemove={() => handleRemoveDoc('proof_of_trade')}
                        />
                      </div>
                    )}

                    {businessType === 'sme_partnership' && (
                      <div className="space-y-4">
                        <DocumentUploadCard
                          title="Owner or Partner National ID / Passport"
                          badge="Identity Confirmation"
                          description="National ID or Passport of the primary business owner or managing partner."
                          docType="owner_id"
                          icon={User}
                          uploadedDoc={uploadedDocs.find((d) => d.docType === 'owner_id')}
                          onUpload={(file) => handleFileUpload('owner_id', file)}
                          onRemove={() => handleRemoveDoc('owner_id')}
                        />
                        <DocumentUploadCard
                          title="Shop Trading License, Lease Agreement, or PBC Certificate"
                          badge="Business Operation Proof"
                          description="Local council shop license, commercial lease agreement, or Private Business Corporation (PBC) registration."
                          docType="sme_license"
                          icon={Store}
                          uploadedDoc={uploadedDocs.find((d) => d.docType === 'sme_license')}
                          onUpload={(file) => handleFileUpload('sme_license', file)}
                          onRemove={() => handleRemoveDoc('sme_license')}
                        />
                      </div>
                    )}

                    {businessType === 'registered_company' && (
                      <div className="space-y-4">
                        <DocumentUploadCard
                          title="Certificate of Incorporation or CR14 / CR6"
                          badge="Registrar of Companies"
                          description="Official company registration certificate or CR14 listing the company directors and registered address."
                          docType="cr14"
                          icon={Building2}
                          uploadedDoc={uploadedDocs.find((d) => d.docType === 'cr14')}
                          onUpload={(file) => handleFileUpload('cr14', file)}
                          onRemove={() => handleRemoveDoc('cr14')}
                        />
                        <DocumentUploadCard
                          title="ZIMRA Tax Clearance Certificate (ITF263)"
                          badge="Tax Compliance"
                          description="Valid tax clearance certificate or proof of tax registration for corporate directory verification."
                          docType="tax_clearance"
                          icon={FileText}
                          uploadedDoc={uploadedDocs.find((d) => d.docType === 'tax_clearance')}
                          onUpload={(file) => handleFileUpload('tax_clearance', file)}
                          onRemove={() => handleRemoveDoc('tax_clearance')}
                        />
                      </div>
                    )}

                    {businessType === 'cooperative' && (
                      <div className="space-y-4">
                        <DocumentUploadCard
                          title="Cooperative Registration Certificate or Group Constitution"
                          badge="Group Registration"
                          description="Official registration certificate, ministry letter, or signed constitution of your cooperative or association."
                          docType="coop_cert"
                          icon={Handshake}
                          uploadedDoc={uploadedDocs.find((d) => d.docType === 'coop_cert')}
                          onUpload={(file) => handleFileUpload('coop_cert', file)}
                          onRemove={() => handleRemoveDoc('coop_cert')}
                        />
                        <DocumentUploadCard
                          title="Chairperson or Representative National ID"
                          badge="Representative ID"
                          description="National ID or Passport of the authorized representative managing this cooperative account."
                          docType="rep_id"
                          icon={Users}
                          uploadedDoc={uploadedDocs.find((d) => d.docType === 'rep_id')}
                          onUpload={(file) => handleFileUpload('rep_id', file)}
                          onRemove={() => handleRemoveDoc('rep_id')}
                        />
                      </div>
                    )}
                  </div>

                  {/* Benefits of Verification */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-3">
                      What you get when your business profile goes live:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        <span>Public listing in the national business directory</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        <span>Direct WhatsApp &amp; phone inquiries from buyers</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        <span>Ability to post products, services, and job openings</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        <span>Verified Business badge once documents are reviewed</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 Action Buttons */}
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      <span>Back to Location &amp; Contact</span>
                    </button>

                    <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
                      {uploadedDocs.length === 0 && (
                        <button
                          type="button"
                          onClick={() => handleCompleteOnboarding(true)}
                          className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          Skip Documents &amp; Finish Setup
                        </button>
                      )}

                      <Button
                        type="button"
                        onClick={() => handleCompleteOnboarding(uploadedDocs.length === 0)}
                        variant="primary"
                        size="lg"
                        loading={isSubmitting}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-base font-semibold py-3.5 px-8 rounded-xl shadow-md"
                      >
                        <span>
                          {uploadedDocs.length > 0
                            ? `Submit & Launch Business Profile (${uploadedDocs.length})`
                            : 'Complete Business Setup Now'}
                        </span>
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* =================================================================
                RIGHT SIDEBAR: LIVE BUSINESS PROFILE SUMMARY (4 Columns on Desktop)
                ================================================================= */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Your Business Summary
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Preview
                  </span>
                </div>

                {/* Business Identity Header */}
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-lg shadow-sm">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white break-words">
                      {displayBusinessName}
                    </h3>
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {displaySector}
                    </p>
                  </div>
                </div>

                {/* Structured Profile Details */}
                <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-500 dark:text-slate-400">Business Type</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-right">
                      {selectedTypeObj.badgeText}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-500 dark:text-slate-400">Team Size</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-right">
                      {selectedScaleObj.label} ({selectedScaleObj.teamRange})
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-500 dark:text-slate-400">Experience</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-right">
                      {selectedYearsObj.sub}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-500 dark:text-slate-400">Main Offering</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-right capitalize">
                      {offeringType === 'both'
                        ? 'Products & Services'
                        : offeringType === 'products'
                        ? 'Physical Products'
                        : 'Services'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-500 dark:text-slate-400">Location</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-right">
                      {city || 'City'}, {province.split(' ')[0]}
                    </span>
                  </div>

                  {initialOwner && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-slate-500 dark:text-slate-400">Account Owner</span>
                      <span className="font-semibold text-slate-900 dark:text-white text-right">
                        {initialOwner}
                      </span>
                    </div>
                  )}
                </div>

                {description.trim() && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    &ldquo;{description.trim()}&rdquo;
                  </div>
                )}

                {/* Reassuring Helper Box */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 text-sm text-emerald-900 dark:text-emerald-200 space-y-1.5">
                  <div className="font-bold flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Tailored to Your Business</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
                    You can update any of your business details, products, or verification documents at any time from your account settings.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          /* =====================================================================
             STEP 5: COMPLETED & LIVE BUSINESS PROFILE SUMMARY
             ===================================================================== */
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
            <div className="rounded-3xl border-2 border-emerald-500/30 bg-white dark:bg-slate-900 p-8 sm:p-10 text-center shadow-lg">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <Award className="h-9 w-9" />
              </div>
              <h1 className="mt-5 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Your Business Profile is Ready!
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                {verificationSkipped
                  ? `${displayBusinessName} is now listed on Sadza Connect as a ${selectedTypeObj.badgeText}. You can upload verification documents anytime from your dashboard.`
                  : `${displayBusinessName} is now active and your verification documents have been submitted to our review team.`}
              </p>
            </div>

            {/* Official Business Profile Summary Card */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-xl">
                    {initials}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {displaySector}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {selectedTypeObj.badgeText}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {displayBusinessName}
                    </h2>
                  </div>
                </div>

                <div>
                  {!verificationSkipped ? (
                    <span className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>Verification Submitted</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span>Standard Profile (Verify Anytime)</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm sm:text-base">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-xs uppercase font-bold">
                    Structure &amp; Scale
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-1 block">
                    {selectedTypeObj.badgeText} ({selectedScaleObj.teamRange})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-xs uppercase font-bold">
                    Location
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-1 block">
                    {city}, {province.split(' ')[0]}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-xs uppercase font-bold">
                    Direct Contact
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-1 block">
                    {contactPhone || initialEmail || 'Configured'}
                  </span>
                </div>
              </div>

              {/* Next Step Actions */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => goToStep(4)}
                  className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Verification Step</span>
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <Link href="/businesses" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full text-base font-semibold py-3.5 px-6 rounded-xl"
                    >
                      View Business Directory
                    </Button>
                  </Link>

                  <Link href="/" className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-base font-semibold py-3.5 px-8 rounded-xl shadow-md"
                    >
                      <span>Go to Business Dashboard</span>
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function DocumentUploadCard({
  title,
  badge,
  description,
  icon: Icon,
  uploadedDoc,
  onUpload,
  onRemove,
}: {
  title: string;
  badge: string;
  description: string;
  docType: string;
  icon: React.ComponentType<{ className?: string }>;
  uploadedDoc?: UploadedDocument;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`rounded-2xl border-2 p-5 sm:p-6 transition-all ${
        uploadedDoc
          ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20'
          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              uploadedDoc
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {uploadedDoc ? <FileCheck className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {badge}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {description}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-end">
          {uploadedDoc ? (
            <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 px-4 py-2.5 rounded-xl">
              <FileCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <div className="text-sm">
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[160px] inline-block align-middle">
                  {uploadedDoc.name}
                </span>
                <span className="text-slate-500 ml-1.5">({uploadedDoc.size})</span>
              </div>
              <button
                type="button"
                onClick={onRemove}
                className="text-slate-400 hover:text-rose-600 p-1 ml-1"
                aria-label="Remove document"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onUpload(file);
                    e.target.value = '';
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-600 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <UploadCloud className="h-5 w-5" />
                <span>Select File to Upload</span>
              </button>
            </>
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16]">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
        </div>
      }
    >
      <BusinessOnboardingContent />
    </Suspense>
  );
}
