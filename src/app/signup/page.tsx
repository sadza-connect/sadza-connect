'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
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
} from '@/components/ui/Icons';
import { Store, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { VerifyEmailModal } from '@/components/ui/VerifyEmailModal';
import { ActionLoader } from '@/components/ui/ActionLoader';
import { useAuth } from '@/context/AuthContext';
import { useCelebration } from '@/context/CelebrationContext';
import { safeFetchJson, getApiBaseUrl } from '@/shared/utils/api-client';

const PROVINCES = [
  'Harare',
  'Bulawayo',
  'Midlands',
  'Manicaland',
  'Masvingo',
  'Mashonaland East',
  'Mashonaland West',
  'Mashonaland Central',
  'Matabeleland North',
  'Matabeleland South',
  'Diaspora',
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
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [province, setProvince] = useState(PROVINCES[0]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { triggerCelebration } = useCelebration();
  const { login } = useAuth();
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isNavigatingToNextStage, setIsNavigatingToNextStage] = useState(false);

  const handleOtpVerified = (sessionData?: any) => {
    setIsNavigatingToNextStage(true);
    setShowOtpModal(false);

    if (sessionData?.accessToken && sessionData?.user) {
      login({
        user: sessionData.user,
        accessToken: sessionData.accessToken,
        refreshToken: sessionData.refreshToken,
      });
    }

    if (selectedType === 'business') {
      triggerCelebration({
        type: 'register',
        title: 'Account Created!',
        message: `Welcome to Sadza Connect, ${fullName}! Proceeding to Business Onboarding.`,
        userName: fullName,
      });

      const params = new URLSearchParams({
        owner: fullName,
        email: email,
        phone: phoneNumber,
        verified: 'true',
      });
      router.push(`/onboarding/business?${params.toString()}`);
    } else {
      triggerCelebration({
        type: 'register',
        title: 'Welcome to Sadza Connect!',
        message: `Your personal account for ${fullName} is ready. Start discovering verified businesses.`,
        userName: fullName,
      });

      router.push('/');
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


  const handleSendRegistrationCode = async () => {
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length < 8 || cleanDigits.length > 15) {
      throw new Error('Please enter a valid phone number with 8 to 15 digits (e.g., 77 123 4567).');
    }

    const formattedPhone = cleanDigits.startsWith('263')
      ? `+${cleanDigits}`
      : `+263${cleanDigits.replace(/^0+/, '')}`;

    const cleanEmail = email.trim().toLowerCase();
    const emailDomain = cleanEmail.split('@')[1];
    const typoDomains: Record<string, string> = {
      'gmai.com': 'gmail.com',
      'gamil.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gmaill.com': 'gmail.com',
      'yaho.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
    };
    if (emailDomain && typoDomains[emailDomain]) {
      throw new Error(`Email typo detected: Did you mean @${typoDomains[emailDomain]} instead of @${emailDomain}?`);
    }

    const payload: Record<string, any> = {
      accountType: selectedType,
      fullName: fullName.trim(),
      email: cleanEmail,
      password,
      phoneNumber: formattedPhone,
    };

    if (selectedType === 'business') {
      payload.businessStructure = 'sole_proprietorship';
    } else if (province) {
      payload.province = province;
    }

    const apiUrl = getApiBaseUrl();
    const result = await safeFetchJson(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!result.ok) {
      throw new Error(result.error || 'Registration failed. Please check your details.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address (e.g., you@company.co.zw).');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailDomain = cleanEmail.split('@')[1];
    const typoDomains: Record<string, string> = {
      'gmai.com': 'gmail.com',
      'gamil.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gmaill.com': 'gmail.com',
      'yaho.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
    };
    if (emailDomain && typoDomains[emailDomain]) {
      setErrorMessage(`Typo detected in email: Did you mean @${typoDomains[emailDomain]}? You entered "@${emailDomain}". Please correct it.`);
      return;
    }

    // Reject any emails or non-numeric characters in phone number
    const hasInvalidChars = /[a-zA-Z@]/.test(phoneNumber);
    const phoneDigits = phoneNumber.replace(/\D/g, '');
    if (hasInvalidChars || phoneDigits.length < 8 || phoneDigits.length > 15) {
      setErrorMessage('Please enter a valid mobile phone number with digits only (e.g., 77 123 4567). Email addresses are not accepted in the phone field.');
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

    // Open confirmation alert before dispatching email
    setShowOtpModal(true);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300">
      {/* Top navigation */}
      <header className="w-full max-w-5xl mx-auto p-4 sm:p-6 flex flex-wrap items-center justify-between gap-2 sm:gap-4 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1.5"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to directory</span>
        </Link>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <span className="hidden xs:inline">Already registered? </span>
            <Link href="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              Sign in
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Centered Registration Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        {/* =========================================================================
            STATE 1: SELECTION SCREEN (When no user type is preselected)
            ========================================================================= */}
        {!selectedType ? (
          <div className="w-full max-w-xl my-auto">
            <div className="mb-6 flex justify-center">
              <Logo size="md" />
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 md:p-10 shadow-xs">
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3 py-1 text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Choose Your Account Type</span>
                </div>

                <h2 className="font-display mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  How would you like to register?
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  Select your profile type to enter your tailored registration flow.
                </p>
              </div>

              {/* The Two Primary Selection Cards */}
              <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 sm:gap-5">
                {/* 1. Register as a Business */}
                <div
                  onClick={() => router.push('/signup?type=business')}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/50 p-4 sm:p-6 transition-all duration-200 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 hover:shadow-lg cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    {/* Card Header: Icon + Badge & Title */}
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">
                        <Store className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1">
                          Companies &amp; SMEs
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                          Register as a Business
                        </h3>
                      </div>
                    </div>

                    {/* Full-width description & checklist */}
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      List your company in the national directory, sell products, post job vacancies, and reach buyers nationwide.
                    </p>
                    <div className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Directory listing</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Marketplace sales</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Verified badge</span>
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 pt-2 sm:pt-0 border-t border-slate-200/70 dark:border-slate-700/60 sm:border-0 flex items-center">
                    <span className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white px-5 py-2.5 text-xs sm:text-sm font-semibold transition-colors shadow-xs">
                      <span>Select</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </span>
                  </div>
                </div>

                {/* 2. Register as a Regular User */}
                <div
                  onClick={() => router.push('/signup?type=personal')}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/50 p-4 sm:p-6 transition-all duration-200 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 hover:shadow-lg cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    {/* Card Header: Icon + Badge & Title */}
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform">
                        <User className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="inline-block rounded-full bg-blue-100 dark:bg-blue-950/90 border border-blue-300 dark:border-blue-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 mb-1">
                          Individual Shoppers
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                          Register as a Regular User
                        </h3>
                      </div>
                    </div>

                    {/* Full-width description & checklist */}
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      For everyday citizens and shoppers: buy electricity tokens (ZESA), contact local suppliers, and apply for jobs.
                    </p>
                    <div className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>ZESA tokens</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>Verified suppliers</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>1-min setup</span>
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 pt-2 sm:pt-0 border-t border-slate-200/70 dark:border-slate-700/60 sm:border-0 flex items-center">
                    <span className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white px-5 py-2.5 text-xs sm:text-sm font-semibold transition-colors shadow-xs">
                      <span>Select</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Sign in Helper */}
              <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                  Sign in here
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
              STATE 2: TAILORED REGISTRATION FORM (Dedicated per User Type)
              ========================================================================= */
          <div className="w-full max-w-[480px] my-auto">
            <div className="mb-6 flex justify-center">
              <Logo size="md" />
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
              {/* Form Title & Context Badge */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  {selectedType === 'business' ? (
                    <>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <BuildingIcon className="h-3.5 w-3.5" />
                        <span>Business Registration</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => router.push('/signup?type=personal')}
                        className="text-[11px] font-medium text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Switch to Personal
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 px-3 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                        <UserIcon className="h-3.5 w-3.5" />
                        <span>Personal Account</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => router.push('/signup?type=business')}
                        className="text-[11px] font-medium text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer"
                      >
                        Switch to Business
                      </button>
                    </>
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

              <form onSubmit={handleSubmit} className="space-y-4">

                  {errorMessage && (
                    <div className="rounded-xl border border-rose-300 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Full Name Field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                      {selectedType === 'business' ? 'Full name (Account Owner / Representative)' : 'Full name'}
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
                        onChange={(e) => {
                          // Reject letters, @, and non-phone characters in real time
                          const sanitized = e.target.value.replace(/[^0-9\s\-()+]/g, '');
                          setPhoneNumber(sanitized);
                          if (errorMessage) setErrorMessage('');
                        }}
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
                        ? 'Continue & Verify Email'
                        : 'Continue & Verify Email'}
                    </span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>

                  {selectedType === 'business' && (
                    <p className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
                      ⚡ Stage 1 of 2. You will confirm your email address with a 6-digit PIN before proceeding to business storefront &amp; documents setup.
                    </p>
                  )}
                </form>

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


            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 z-10">
        <div>© {new Date().getFullYear()} Sadza Connect. National Commercial Network of Zimbabwe.</div>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <Link href="#" className="hover:text-slate-800 dark:hover:text-slate-200">Privacy Policy</Link>
          <Link href="#" className="hover:text-slate-800 dark:hover:text-slate-200">Terms of Service</Link>
          <Link href="#" className="hover:text-slate-800 dark:hover:text-slate-200">Compliance</Link>
        </div>
      </footer>

      {/* Full-Screen Transition Loader to Stage 2 */}
      {isNavigatingToNextStage && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md text-white animate-in fade-in duration-300 p-6">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
            <Store className="h-9 w-9 text-emerald-400 animate-pulse" />
          </div>
          <h3 className="mt-6 text-xl font-bold tracking-tight text-white text-center">
            {selectedType === 'business'
              ? 'Loading Business Onboarding Studio...'
              : 'Preparing Your Account Dashboard...'}
          </h3>
          <p className="mt-2 text-xs text-slate-300 max-w-sm text-center leading-relaxed">
            Your email is verified. We are preparing Stage 2 (Storefront Setup &amp; Compliance Documents Vault).
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-950/80 border border-emerald-700/60 px-4 py-1.5 text-xs text-emerald-300 font-semibold shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Redirecting to next stage...</span>
          </div>
        </div>
      )}

      {/* Global Action Loader Feedback */}
      <ActionLoader
        isVisible={isLoading || isNavigatingToNextStage}
        title={isNavigatingToNextStage ? "Preparing Workspace..." : "Registering Account..."}
        subtitle="Processing your details and establishing your secure session..."
      />

      {/* 2-Step Email Verification Pop-up Modal (Confirmation Alert -> 6-Digit PIN) */}
      <VerifyEmailModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={email}
        accountType={selectedType || 'business'}
        initialStep="confirm"
        onConfirmSendCode={handleSendRegistrationCode}
        onEditEmail={() => setShowOtpModal(false)}
        onVerified={handleOtpVerified}
      />
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
