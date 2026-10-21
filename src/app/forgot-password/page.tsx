'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  MailIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  Sparkles,
} from '@/components/ui/Icons';
import { ShieldCheck, MessageCircle, KeyRound, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';
import { safeFetchJson, getApiBaseUrl } from '@/shared/utils/api-client';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'whatsapp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter your registered email address or mobile phone number.');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = getApiBaseUrl();
      const res = await safeFetchJson(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      if (!res.ok) {
        throw new Error(res.error || 'Failed to dispatch security verification code.');
      }

      setCodeSent(true);
      setCountdown(60);
      toast({
        title: deliveryMethod === 'email' ? 'Reset Code Sent to Email' : 'OTP Dispatched to Phone',
        description: 'A 6-digit security reset PIN has been dispatched to your contact.',
        variant: 'info',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to dispatch reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPin = otpCode.trim();
    if (!cleanPin || cleanPin.length !== 6) {
      setErrorMessage('Please enter the 6-digit security reset PIN.');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = getApiBaseUrl();
      const res = await safeFetchJson(`${apiUrl}/auth/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          otp: cleanPin,
        }),
      });

      if (!res.ok) {
        throw new Error(res.error || 'Invalid or expired 6-digit PIN. Please re-check.');
      }

      const resetToken = res.data?.data?.resetToken;
      if (!resetToken) {
        throw new Error('Unable to generate password reset token. Please try again.');
      }

      toast({
        title: 'Identity Verified',
        description: 'Redirecting to secure password reset...',
        variant: 'success',
      });

      const query = new URLSearchParams({
        account: identifier.trim(),
        token: resetToken,
      }).toString();

      router.push(`/reset-password?${query}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the PIN.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300">
      {/* Top navigation */}
      <header className="w-full max-w-5xl mx-auto p-4 sm:p-6 flex items-center justify-between z-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1.5"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to sign in</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Center Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-[440px] my-auto">
          <div className="mb-6 flex justify-center">
            <Logo size="md" />
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
            {!codeSent ? (
              <>
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Forgot Password?
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Enter your registered email address or Zimbabwe phone number to receive a secure recovery code.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Account Identifier (Email or Phone)
                    </label>
                    <div className="relative flex items-center group">
                      <MailIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. director@company.co.zw or +263771..."
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Send Verification Code Via
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('email')}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                          deliveryMethod === 'email'
                            ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <MailIcon className="w-3.5 h-3.5" />
                        <span>Email Inbox</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('whatsapp')}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                          deliveryMethod === 'whatsapp'
                            ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp OTP</span>
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    loading={isLoading}
                    className="mt-2 text-xs font-semibold py-3 rounded-xl shadow-emerald"
                  >
                    <span>Send Recovery Code</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Enter Security PIN
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    We sent a 6-digit one-time PIN to{' '}
                    <strong className="text-slate-900 dark:text-white font-mono">{identifier}</strong>.
                  </p>
                </div>

                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between">
                  <span>
                    Security reset code dispatched. Check your inbox or SMS for the 6-digit PIN.
                  </span>
                </div>

                {errorMessage && (
                  <div className="mb-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      6-Digit Recovery PIN
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-[0.5em] text-xl font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition font-bold"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <button
                      type="button"
                      disabled={countdown > 0}
                      onClick={handleSendCode}
                      className={`flex items-center gap-1 font-semibold ${
                        countdown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-emerald-600 dark:text-emerald-400 hover:underline'
                      }`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${countdown > 0 ? '' : 'hover:rotate-180 transition duration-300'}`} />
                      <span>{countdown > 0 ? `Resend in ${countdown}s` : 'Resend PIN'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCodeSent(false)}
                      className="text-slate-500 hover:underline"
                    >
                      Change contact
                    </button>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    loading={isLoading}
                    className="mt-2 text-xs font-semibold py-3 rounded-xl shadow-emerald"
                  >
                    <span>Verify & Set New Password</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                </form>
              </>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <Link
                href="/login"
                className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                Remember your password? <span className="font-semibold underline">Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto p-4 sm:p-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 z-10">
        &copy; {new Date().getFullYear()} Sadza Connect. National Commercial Network of Zimbabwe.
      </footer>
    </div>
  );
}
