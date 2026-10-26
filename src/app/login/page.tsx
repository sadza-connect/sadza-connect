'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  Sparkles,
} from '@/components/ui/Icons';
import { VerifyEmailModal } from '@/components/ui/VerifyEmailModal';
import { ActionLoader } from '@/components/ui/ActionLoader';
import { useAuth } from '@/context/AuthContext';
import { useCelebration } from '@/context/CelebrationContext';
import { safeFetchJson, getApiBaseUrl } from '@/shared/utils/api-client';

function formatLoginError(errorMsg?: string): string {
  if (!errorMsg) return 'Authentication failed. Please verify your email or phone number and password.';
  const lower = errorMsg.toLowerCase();

  if (
    lower.includes('econnreset') ||
    lower.includes('read econnreset') ||
    lower.includes('socket hang up') ||
    lower.includes('connection terminated') ||
    lower.includes('database') ||
    lower.includes('knex') ||
    lower.includes('select ')
  ) {
    return 'Database connection was temporarily interrupted. Please try signing in again.';
  }

  if (
    lower.includes('getaddrinfo') ||
    lower.includes('networkerror') ||
    lower.includes('failed to fetch') ||
    lower.includes('offline')
  ) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  return errorMsg;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { triggerCelebration } = useCelebration();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password reset modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // Email verification modal state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyEmailAddress, setVerifyEmailAddress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter your registered email address or phone number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = getApiBaseUrl();
      const result = await safeFetchJson(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      if (!result.ok) {
        throw new Error(result.error || 'Invalid email or password.');
      }

      const data = result.data;

      if (data?.data?.accessToken) {
        login({
          user: data.data.user,
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
        });
      }

      // Trigger celebratory pop-up (persisted to sessionStorage for the destination page)
      triggerCelebration({
        type: 'login',
        title: 'Welcome Back!',
        message: `Signed in successfully as ${data?.data?.user?.fullName || data?.data?.user?.email || identifier}.`,
        userName: data?.data?.user?.fullName,
      });

      const role = data?.data?.user?.role;
      const accountType = data?.data?.user?.accountType;

      const redirectParam = searchParams.get('redirect');
      let destination = '/';
      if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
        destination = redirectParam;
      } else if (role === 'admin') {
        destination = '/admin';
      } else if (role === 'merchant' || accountType === 'business') {
        destination = '/dashboard/business';
      } else {
        destination = '/dashboard/user';
      }

      router.push(destination);
    } catch (err: any) {
      const formatted = formatLoginError(err?.message);
      setErrorMessage(formatted);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) return;

    setIsLoading(true);
    setForgotError('');
    try {
      const apiUrl = getApiBaseUrl();
      const res = await safeFetchJson(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotInput.trim().toLowerCase() }),
      });
      if (!res.ok) {
        setForgotError(res.error || 'Failed to dispatch password reset link. Please try again.');
        return;
      }
      setForgotSent(true);
    } catch (err: any) {
      setForgotError(err?.message || 'Failed to dispatch password reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300">
      {/* Top navigation */}
      <header className="w-full max-w-5xl mx-auto p-4 sm:p-6 flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1.5"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to directory</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
            Don&rsquo;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              Create an account
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Centered Auth Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-[440px]">
          <div className="mb-6 flex justify-center">
            <Logo size="md" />
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Sign in to your account
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Enter your registered email address or phone number and password to sign in.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="rounded-xl border border-rose-300 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Email or Phone Input */}
              <div>
                <label htmlFor="identifier" className="block text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                  Email address or phone number
                </label>
                <div className="relative flex items-center group">
                  <MailIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    autoComplete="username"
                    inputMode="email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@company.co.zw or 077 123 4567"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 dark:focus:ring-emerald-400/25 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="current-password" className="block text-xs font-semibold text-slate-800 dark:text-slate-100">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative flex items-center group">
                  <LockIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    id="current-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 dark:focus:ring-emerald-400/25 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Keep me signed in */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 dark:bg-slate-950"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Keep me signed in on this device
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
                className="mt-4 text-xs font-semibold py-3 rounded-xl shadow-emerald"
              >
                <span>Sign in</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Button>

              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setVerifyEmailAddress(identifier.includes('@') ? identifier.trim() : '');
                    setShowVerifyModal(true);
                  }}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Received a code? <span className="font-semibold text-emerald-600 dark:text-emerald-400 underline">Enter 6-digit PIN</span>
                </button>
              </div>
            </form>

            {/* Registration Navigation Link */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
              <span>Don&rsquo;t have an account? </span>
              <Link
                href="/signup"
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Global Action Loader Feedback */}
      <ActionLoader
        isVisible={isLoading}
        title="Signing You In..."
        subtitle="Verifying credentials and establishing your encrypted session..."
      />

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 z-10">
        <div>© {new Date().getFullYear()} Sadza Connect. National Commercial Network of Zimbabwe.</div>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <Link href="#" className="hover:text-slate-800 dark:hover:text-slate-200">Privacy Policy</Link>
          <Link href="#" className="hover:text-slate-800 dark:hover:text-slate-200">Terms of Service</Link>
          <Link href="#" className="hover:text-slate-800 dark:hover:text-slate-200">Security</Link>
        </div>
      </footer>

      {/* FORGOT PASSWORD MODAL */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => {
          setShowForgotModal(false);
          setForgotSent(false);
        }}
        title="Reset your password"
        description="Enter your registered email address to receive password reset instructions."
        maxWidth="sm"
      >
        {forgotSent ? (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-800 text-center">
            <CheckCircleIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">Reset link sent</div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
              We sent verification instructions to <span className="font-mono text-slate-900 dark:text-slate-100">{forgotInput}</span>.
            </div>
            <button
              type="button"
              onClick={() => {
                setShowForgotModal(false);
                setForgotSent(false);
              }}
              className="mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold shadow-xs"
            >
              Return to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="mt-2 space-y-3.5">
            {forgotError && (
              <div className="rounded-xl border border-rose-300 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 p-2.5 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={forgotInput}
                onChange={(e) => setForgotInput(e.target.value)}
                placeholder="you@company.co.zw"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <Button type="submit" variant="primary" size="sm">
                Send reset link
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 6-DIGIT EMAIL VERIFICATION POP-UP MODAL */}
      <VerifyEmailModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        email={verifyEmailAddress || (identifier.includes('@') ? identifier.trim() : 'your registered email address')}
        accountType="personal"
        onVerified={() => {
          setShowVerifyModal(false);
          setErrorMessage('');
          triggerCelebration({
            type: 'login',
            title: 'Email Verified!',
            message: 'Your email address is verified. Welcome to Sadza Connect!',
          });
          router.push('/');
        }}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#07090e]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
