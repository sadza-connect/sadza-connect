'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SpotlightCard } from '@/components/animations/SpotlightCard';
import { StarfieldCanvas } from '@/components/animations/StarfieldCanvas';
import { WelcomeGatewayVisual } from '@/components/animations/WelcomeGatewayVisual';
import {
  GoogleIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  Sparkles,
} from '@/components/ui/Icons';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password reset modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Quick fill helper for testing
  const handleQuickFill = (type: 'merchant' | 'shopper') => {
    setErrorMessage('');
    if (type === 'merchant') {
      setIdentifier('tendai@midlandssolar.co.zw');
      setPassword('SadzaConnect2026!');
    } else {
      setIdentifier('tinashe.sibanda@gmail.com');
      setPassword('SadzaConnect2026!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 800);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) return;
    setForgotSent(true);
  };

  return (
    <div className="relative min-h-screen bg-slate-50/70 dark:bg-[#07090e]/80 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row transition-colors duration-300 overflow-x-clip">
      {/* Interactive Celestial Starfield Background */}
      <StarfieldCanvas className="z-0 opacity-70 dark:opacity-85" />

      {/* LEFT WELCOMING PANEL (Desktop 46%) */}
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
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>National Commerce Network</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
              Welcome back to Zimbabwe&rsquo;s Trade Gateway.
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              Sign in to manage your company catalog, respond to verified client inquiries,
              and coordinate business across all ten provinces.
            </p>
          </div>
        </div>

        {/* Dynamic Welcoming Gateway Visual Element (The Zimbabwe Circle) */}
        <div className="relative z-10 my-4">
          <WelcomeGatewayVisual />
        </div>

        {/* Authentic Trust Footer */}
        <div className="relative z-10 border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Over 5,200 Zimbabwean businesses active</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">ZW-PORTAL v2.4</span>
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
          </div>
        </div>

        {/* Center Auth Card */}
        <div className="mx-auto w-full max-w-[420px] py-6">
          <div className="lg:hidden mb-6 flex justify-center">
            <Logo size="md" />
          </div>

          <SpotlightCard
            spotlightColor="rgba(16, 185, 129, 0.12)"
            borderColor="rgba(16, 185, 129, 0.3)"
            className="!p-8 shadow-lg dark:shadow-[0_12px_40px_-15px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/95 backdrop-blur-md rounded-2xl"
          >
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Sign in
              </h2>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                Enter your credentials or continue with Google to access your account.
              </p>
            </div>

            {/* Google Authentication (Email & Google Only) */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => {
                  setIdentifier('tendai@midlandssolar.co.zw');
                  setSubmitted(true);
                }}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-xs active:scale-[0.99]"
              >
                <GoogleIcon size={18} />
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700/80" />
              </div>
              <span className="relative bg-white dark:bg-slate-900 px-3 text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                or sign in with email
              </span>
            </div>

            {submitted ? (
              <div className="rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 p-6 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 mb-3 shadow-sm">
                  <CheckCircleIcon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Welcome back!
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  Signed in as <span className="font-mono font-medium text-slate-900 dark:text-slate-100">{identifier}</span>
                </p>
                <div className="mt-5 flex gap-2.5">
                  <Link href="/" className="w-full">
                    <Button variant="primary" size="md" fullWidth>
                      Open Dashboard
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
                {errorMessage && (
                  <div className="rounded-xl border border-rose-300 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Email or Phone Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                    Email address or phone number
                  </label>
                  <div className="relative flex items-center group">
                    <MailIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      required
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
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-100">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotSent(false);
                        setShowForgotModal(true);
                      }}
                      className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative flex items-center group">
                    <LockIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 dark:focus:ring-emerald-400/25 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
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
              </form>
            )}

            {/* Quick Fill Test Accounts */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Demo accounts:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('merchant')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-300"
                >
                  Merchant
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('shopper')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-300"
                >
                  Individual
                </button>
              </div>
            </div>

            {/* Registration Navigation Link */}
            <div className="mt-4 text-center text-xs text-slate-600 dark:text-slate-300">
              <span>Don&rsquo;t have an account? </span>
              <Link
                href="/signup"
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Register here
              </Link>
            </div>
          </SpotlightCard>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div>© {new Date().getFullYear()} Sadza Connect. Africdominion Group (Pvt) Ltd.</div>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href="#" className="hover:text-slate-800 dark:hover:text-slate-200">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-800 dark:hover:text-slate-200">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-800 dark:hover:text-slate-200">Security</Link>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Reset your password</h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Enter your registered email address to receive password reset instructions.
            </p>

            {forgotSent ? (
              <div className="mt-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-800 text-center">
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
              <form onSubmit={handleForgotSubmit} className="mt-4 space-y-3.5">
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
          </div>
        </div>
      )}
    </div>
  );
}
