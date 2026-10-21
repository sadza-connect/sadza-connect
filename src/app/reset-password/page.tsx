'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  Sparkles,
} from '@/components/ui/Icons';
import { ShieldCheck, Check, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';
import { safeFetchJson, getApiBaseUrl } from '@/shared/utils/api-client';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const account = searchParams.get('account') || '';
  const resetToken = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // 4-point dynamic security criteria
  const checks = useMemo(() => {
    return {
      minLength: newPassword.length >= 8,
      hasUpper: /[A-Z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
    };
  }, [newPassword]);

  const allPassed = checks.minLength && checks.hasUpper && checks.hasNumber && checks.hasSpecial;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Strength score 0 - 4
  const strengthScore = Object.values(checks).filter(Boolean).length;
  const strengthLabel =
    strengthScore <= 1
      ? 'Weak'
      : strengthScore === 2
      ? 'Moderate'
      : strengthScore === 3
      ? 'Good'
      : 'Enterprise Secure';

  const strengthColor =
    strengthScore <= 1
      ? 'bg-rose-500'
      : strengthScore === 2
      ? 'bg-amber-500'
      : strengthScore === 3
      ? 'bg-blue-500'
      : 'bg-emerald-500';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!resetToken) {
      setErrorMessage('Invalid or missing security reset token. Please request a new PIN from the Forgot Password page.');
      return;
    }

    if (!allPassed) {
      setErrorMessage('Please ensure your new password satisfies all 4 security criteria below.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('The passwords entered do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = getApiBaseUrl();
      const res = await safeFetchJson(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken,
          password: newPassword,
        }),
      });

      if (!res.ok) {
        throw new Error(res.error || 'Failed to update security credentials. Please try again.');
      }

      setIsSuccess(true);
      toast({
        title: 'Password Reset Complete',
        description: 'Your security credentials have been updated successfully.',
        variant: 'success',
      });

      // Auto redirect to login after 2.5 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset failed. Please request a new PIN code.');
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
            {!isSuccess ? (
              <>
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                    <LockIcon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Set New Password
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {account ? (
                      <>
                        Resetting credentials for <strong className="text-slate-800 dark:text-slate-200 font-mono">{account}</strong>
                      </>
                    ) : (
                      'Choose a robust password for your account.'
                    )}
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      New Password
                    </label>
                    <div className="relative flex items-center group">
                      <LockIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Create strong password"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Dynamic Strength Meter */}
                    {newPassword.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Strength: <strong>{strengthLabel}</strong></span>
                          <span>{strengthScore * 25}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${strengthColor} transition-all duration-300`}
                            style={{ width: `${Math.max(10, strengthScore * 25)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative flex items-center group">
                      <LockIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/90 py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && (
                      <p className={`mt-1 text-[11px] font-medium flex items-center gap-1 ${
                        passwordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {passwordsMatch ? (
                          <>
                            <Check className="w-3 h-3" /> Passwords match
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3" /> Passwords do not match
                          </>
                        )}
                      </p>
                    )}
                  </div>

                  {/* 4-Point Security Requirements Checklist */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5 text-xs">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider">
                      Security Policy Requirements:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                      <div className={`flex items-center gap-1.5 ${checks.minLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500'}`}>
                        {checks.minLength ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 ml-1 mr-1" />}
                        <span>8+ Characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${checks.hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500'}`}>
                        {checks.hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 ml-1 mr-1" />}
                        <span>1+ Uppercase (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${checks.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500'}`}>
                        {checks.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 ml-1 mr-1" />}
                        <span>1+ Number (0-9)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${checks.hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500'}`}>
                        {checks.hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 ml-1 mr-1" />}
                        <span>1+ Symbol (@$!%*?)</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    disabled={!allPassed || !passwordsMatch}
                    loading={isLoading}
                    className="mt-2 text-xs font-semibold py-3 rounded-xl shadow-emerald"
                  >
                    <span>Update Password & Log In</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircleIcon className="w-9 h-9" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Password Updated!
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Your credentials have been securely updated. You will now be redirected to the sign in page.
                </p>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                  >
                    <span>Proceed to Sign In Now</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
