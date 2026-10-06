'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SpotlightCard } from '@/components/animations/SpotlightCard';
import { StarfieldCanvas } from '@/components/animations/StarfieldCanvas';
import { RegistrationOrbitalNetwork } from '@/components/animations/RegistrationOrbitalNetwork';
import {
  BuildingIcon,
  UserIcon,
  MailIcon,
  LockIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
} from '@/components/ui/Icons';
import { Store, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { VerifyEmailModal } from '@/components/ui/VerifyEmailModal';

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

function SignupFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL query parameter: ?type=business or ?type=personal
  const typeParam = searchParams.get('type') || searchParams.get('role');
  
  // Normalized registration type: 'business' | 'personal' | null
  const selectedType: 'business' | 'personal' | null =
    typeParam === 'business'
      ? 'business'
      : typeParam === 'personal' || typeParam === 'user'
      ? 'personal'
      : null;

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [province, setProvince] = useState(PROVINCES[0]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  const handleOtpVerified = () => {
    setShowOtpModal(false);
    if (selectedType === 'business') {
      const params = new URLSearchParams({
        name: businessName,
        owner: fullName,
        email: email,
        phone: phoneNumber,
        verified: 'true',
      });
      router.push(`/onboarding/business?${params.toString()}`);
    } else {
      setSubmitted(true);
    }
  };

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const strengthScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

  const strengthLabels = ['Weak', 'Moderate', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-400'];

  // Quick fill helper for testing
  const handleQuickFill = (type: 'business' | 'personal') => {
    setErrorMessage('');
    if (type === 'business') {
      setFullName('Kudzai Moyo');
      setBusinessName('Midlands Solar & Agro Solutions');
      setEmail('kudzai@midlandssolar.co.zw');
      setPhoneNumber('77 345 6789');
      setPassword('SadzaZim2026!');
      setConfirmPassword('SadzaZim2026!');
    } else {
      setFullName('Tinashe Sibanda');
      setBusinessName('');
      setEmail('tinashe.sibanda@gmail.com');
      setPhoneNumber('71 890 1234');
      setProvince('Bulawayo Province (Bulawayo Metro)');
      setPassword('SadzaZim2026!');
      setConfirmPassword('SadzaZim2026!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (selectedType === 'business' && !businessName.trim()) {
      setErrorMessage('Please enter your business or trading name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter your mobile phone number.');
      return;
    }
    if (!hasMinLength) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the terms of service to continue.');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const cleanPhone = phoneNumber.replace(/^0+/, '').replace(/\s+/g, '');
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+263${cleanPhone}`;

      const payload: Record<string, any> = {
        accountType: selectedType,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phoneNumber: formattedPhone,
      };

      if (selectedType === 'business') {
        payload.businessName = businessName.trim();
        payload.businessStructure = 'sole_proprietorship';
      } else if (province) {
        payload.province = province;
      }

      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || data.message || 'Registration failed. Please check your details.');
      }

      // Launch the 6-Digit Email Verification Pop-up Modal!
      setShowOtpModal(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50/70 dark:bg-[#07090e]/80 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row transition-colors duration-300 overflow-x-clip">
      {/* Interactive Celestial Starfield Background */}
      <StarfieldCanvas className="z-0 opacity-70 dark:opacity-85" />

      {/* LEFT ENGAGING PANEL (Desktop 46%) */}
      <div className="relative hidden lg:flex lg:w-5/12 flex-col justify-between overflow-hidden bg-slate-900/95 dark:bg-[#0b0f19]/95 p-12 text-white border-r border-slate-800 z-10 backdrop-blur-sm">
        {/* Subtle background ambient lights */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[450px] w-[450px] rounded-full bg-emerald-900/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-slate-800/40 blur-[100px]" />

        {/* Brand header */}
        <div className="relative z-10">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl inline-block shadow-sm">
            <Logo size="md" priority />
          </div>

          <div className="mt-10 space-y-3">
            {selectedType === 'business' ? (
              <>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>National Enterprise Registration</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
                  Join thousands of verified businesses on Sadza Connect.
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                  Create a verified company profile to reach buyers across Zimbabwe, showcase your products on the marketplace, and receive direct inquiries across all 10 provinces.
                </p>
              </>
            ) : selectedType === 'personal' ? (
              <>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300">
                  <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                  <span>Personal Account Registration</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
                  Everyday shopping, jobs & utilities across Zimbabwe.
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                  Discover verified local businesses, buy prepaid electricity tokens (ZESA), shop marketplace deals, and apply for open job vacancies nationwide.
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Zimbabwe Digital Commercial Grid</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
                  Connect to Zimbabwe’s commercial ecosystem.
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                  Choose whether you are registering a company or creating a personal account to access verified trade, utilities, and services.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Circular Network Visual Element */}
        <div className="relative z-10 my-3">
          <RegistrationOrbitalNetwork />
        </div>

        {/* Trust Footer */}
        <div className="relative z-10 border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>5,240+ businesses verified nationwide</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">CR14 & ZIMRA AUDITED</span>
        </div>
      </div>

      {/* RIGHT AUTH FORM PANEL (Desktop 54%) */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 z-10">
        {/* Top navigation */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors py-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to directory</span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="text-xs text-slate-600 dark:text-slate-300">
              Already registered?{' '}
              <Link href="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================================
            STATE 1: SELECTION SCREEN (When no user type is preselected)
            ========================================================================= */}
        {!selectedType ? (
          <div className="mx-auto w-full max-w-xl py-8">
            <div className="lg:hidden mb-6 flex justify-center">
              <Logo size="md" />
            </div>

            <SpotlightCard
              spotlightColor="rgba(16, 185, 129, 0.12)"
              borderColor="rgba(16, 185, 129, 0.3)"
              className="!p-8 sm:!p-10 shadow-lg dark:shadow-[0_12px_40px_-15px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/95 backdrop-blur-md rounded-3xl"
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="h-3 w-3" />
                  <span>Choose Your Account Type</span>
                </div>

                <h2 className="font-display mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  How would you like to register?
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Select your profile type to enter your tailored registration flow.
                </p>
              </div>

              {/* The Two Primary Selection Cards */}
              <div className="mt-8 grid grid-cols-1 gap-4">
                {/* 1. Register as a Business */}
                <div
                  onClick={() => router.push('/signup?type=business')}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 p-5 sm:p-6 transition-all duration-200 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 hover:shadow-lg cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">
                      <Store className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          Register as a Business
                        </h3>
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                          Companies & SMEs
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
                        List your company in the national directory, sell products, post job vacancies, and reach buyers nationwide.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          Directory listing
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          Marketplace sales
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          Verified badge
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end sm:justify-center">
                    <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-semibold transition-colors shadow-xs">
                      <span>Select</span>
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>

                {/* 2. Register as a Regular User */}
                <div
                  onClick={() => router.push('/signup?type=personal')}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 p-5 sm:p-6 transition-all duration-200 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 hover:shadow-lg cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          Register as a Regular User
                        </h3>
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                          Individual Shoppers
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
                        For everyday citizens and shoppers: buy electricity tokens (ZESA), contact local suppliers, and apply for jobs.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          ZESA tokens
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          Verified suppliers
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          1-min setup
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end sm:justify-center">
                    <span className="inline-flex items-center gap-1 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-semibold transition-colors shadow-xs">
                      <span>Select</span>
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Sign in Helper */}
              <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                  Sign in here
                </Link>
              </div>
            </SpotlightCard>
          </div>
        ) : (
          /* =========================================================================
              STATE 2: TAILORED REGISTRATION FORM (Dedicated per User Type)
              ========================================================================= */
          <div className="mx-auto w-full max-w-[480px] py-6">
            <div className="lg:hidden mb-6 flex justify-center">
              <Logo size="md" />
            </div>

            <SpotlightCard
              spotlightColor={
                selectedType === 'business'
                  ? 'rgba(16, 185, 129, 0.12)'
                  : 'rgba(59, 130, 246, 0.12)'
              }
              borderColor={
                selectedType === 'business'
                  ? 'rgba(16, 185, 129, 0.3)'
                  : 'rgba(59, 130, 246, 0.3)'
              }
              className="!p-8 shadow-lg dark:shadow-[0_12px_40px_-15px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/95 backdrop-blur-md rounded-2xl"
            >
              {/* Form Title & Context Badge */}
              <div className="mb-6">
                <div className="mb-2">
                  {selectedType === 'business' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      <BuildingIcon className="h-3.5 w-3.5" />
                      <span>Business Registration</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 px-3 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                      <UserIcon className="h-3.5 w-3.5" />
                      <span>Regular User Registration</span>
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {selectedType === 'business' ? 'Register Your Business' : 'Register as a Regular User'}
                </h2>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {selectedType === 'business'
                    ? 'Set up your verified commercial enterprise profile on Sadza Connect.'
                    : 'Create your personal account to shop, buy electricity tokens, and apply for jobs.'}
                </p>
              </div>

              {/* Success Confirmation state (for Personal Users) */}
              {submitted ? (
                <div className="rounded-2xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/70 dark:bg-blue-950/40 p-6 text-center animate-in zoom-in-95 duration-200">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-600/30">
                    <CheckCircleIcon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                    Welcome to Sadza Connect!
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                    Your personal account for <span className="font-semibold text-slate-900 dark:text-slate-100">{fullName}</span> is now active.
                    You can start discovering verified suppliers, shopping marketplace deals, and buying electricity tokens.
                  </p>

                  <div className="mt-5 flex gap-2.5">
                    <Link href="/" className="w-full">
                      <Button variant="primary" size="md" fullWidth className="bg-blue-600 hover:bg-blue-700">
                        Explore Platform
                      </Button>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Google Quick Registration */}
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleQuickFill(selectedType);
                        if (selectedType === 'business') {
                          const params = new URLSearchParams({
                            name: 'Midlands Solar & Agro Solutions',
                            owner: 'Kudzai Moyo',
                            email: 'kudzai@midlandssolar.co.zw',
                            phone: '77 345 6789',
                          });
                          router.push(`/onboarding/business?${params.toString()}`);
                        } else {
                          setSubmitted(true);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-xs active:scale-[0.99]"
                    >
                      <GoogleIcon size={18} />
                      <span>
                        {selectedType === 'business'
                          ? 'Sign up with Google as Business'
                          : 'Sign up with Google'}
                      </span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative my-4 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700/80" />
                    </div>
                    <span className="relative bg-white dark:bg-slate-900 px-3 text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      or enter details
                    </span>
                  </div>

                  {errorMessage && (
                    <div className="rounded-xl border border-rose-300 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Name & Business Name Fields */}
                  {selectedType === 'business' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                          Full name
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Tendai Chikore"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 py-2.5 px-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 dark:focus:ring-emerald-400/25 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                          Business name
                        </label>
                        <input
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Midlands Solar & Agro"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 py-2.5 px-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 dark:focus:ring-emerald-400/25 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                        Full name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Tendai Chikore"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 py-2.5 px-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/25 dark:focus:ring-blue-400/25 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                      />
                    </div>
                  )}

                  {/* Business form fields simplified: Category, structure & docs moved to /onboarding/business */}

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                      Email address
                    </label>
                    <div className="relative flex items-center group">
                      <MailIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={selectedType === 'business' ? 'you@company.co.zw' : 'you@gmail.com'}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 dark:focus:ring-emerald-400/25 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                      Phone / Contact number
                    </label>
                    <div className="relative flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 hover:border-slate-400 dark:hover:border-slate-500 focus-within:border-emerald-500 dark:focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/25 dark:focus-within:ring-emerald-400/25 transition-all">
                      <div className="flex items-center gap-1.5 pl-3.5 pr-2 border-r border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 select-none">
                        <span>🇿🇼</span>
                        <span>+263</span>
                      </div>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="77 123 4567"
                        className="flex-1 py-2.5 px-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 bg-transparent focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Province / Location Selector (Personal accounts only — Business accounts configure this in Onboarding) */}
                  {selectedType === 'personal' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                        Where are you based?
                      </label>
                      <div className="relative flex items-center group">
                        <MapPinIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <select
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 py-2.5 pl-10 pr-8 text-xs text-slate-900 dark:text-white hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/25 cursor-pointer font-medium"
                        >
                          {PROVINCES.map((prov) => (
                            <option key={prov} value={prov} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                              {prov}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                        Password
                      </label>
                      <div className="relative flex items-center group">
                        <LockIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 py-2.5 pl-10 pr-9 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 dark:focus:ring-emerald-400/25 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                        Confirm password
                      </label>
                      <div className="relative flex items-center group">
                        <LockIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 dark:focus:ring-emerald-400/25 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Password strength:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {strengthLabels[strengthScore - 1] || 'Weak'}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-1.5">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`rounded-full transition-colors duration-200 ${
                              strengthScore >= step ? strengthColors[strengthScore - 1] : 'bg-slate-200 dark:bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Terms Consent */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        required
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 dark:bg-slate-950"
                      />
                      <span className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                        I agree to the{' '}
                        <Link href="#" className="font-semibold text-emerald-600 dark:text-emerald-400 underline underline-offset-2">
                          Terms of Service
                        </Link>
                        {' '}and{' '}
                        <Link href="#" className="font-semibold text-emerald-600 dark:text-emerald-400 underline underline-offset-2">
                          Privacy Policy
                        </Link>.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    loading={isLoading}
                    className={`mt-4 text-xs font-semibold py-3 rounded-xl ${
                      selectedType === 'business' ? 'shadow-emerald bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <span>
                      {selectedType === 'business'
                        ? 'Create Account & Continue to Business Setup'
                        : 'Create Regular User Account'}
                    </span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>

                  {selectedType === 'business' && (
                    <p className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
                      ⚡ Quick 20-second signup. You will set up your trade category &amp; verification documents next.
                    </p>
                  )}
                </form>
              )}

              {/* Seamless Flow Switch Link (Instead of a tab bar) */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                {selectedType === 'business' ? (
                  <span>
                    Looking to register as an individual / regular user instead?{' '}
                    <button
                      type="button"
                      onClick={() => router.push('/signup?type=personal')}
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Switch to regular user
                    </button>
                  </span>
                ) : (
                  <span>
                    Representing a company or commercial enterprise?{' '}
                    <button
                      type="button"
                      onClick={() => router.push('/signup?type=business')}
                      className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Switch to business registration
                    </button>
                  </span>
                )}
              </div>

              {/* Demo Fill Helper */}
              <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>Demo testing:</span>
                <button
                  type="button"
                  onClick={() => handleQuickFill(selectedType || 'business')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-slate-600 dark:text-slate-300"
                >
                  Quick autofill
                </button>
              </div>
            </SpotlightCard>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div>© {new Date().getFullYear()} Sadza Connect. Africdominion Group (Pvt) Ltd.</div>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href="#" className="hover:text-slate-800 dark:hover:text-slate-200">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-800 dark:hover:text-slate-200">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-800 dark:hover:text-slate-200">Compliance</Link>
          </div>
        </div>

        {/* 6-Digit Email Verification Pop-up Modal */}
        <VerifyEmailModal
          isOpen={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          email={email}
          accountType={selectedType || 'business'}
          onVerified={handleOtpVerified}
        />
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#07090e]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      }
    >
      <SignupFormContent />
    </Suspense>
  );
}
