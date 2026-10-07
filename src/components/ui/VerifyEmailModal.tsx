'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Mail,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Edit2,
  Lock,
  Loader2,
  Building2,
  Store,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface VerifyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  accountType?: 'business' | 'personal';
  initialStep?: 'confirm' | 'otp';
  onConfirmSendCode?: () => Promise<void>;
  onEditEmail?: () => void;
  onVerified: () => void;
}

const DISPATCH_MESSAGES = [
  'Securing registration credentials...',
  'Generating secure 6-digit verification PIN...',
  'Dispatching email via Resend mailer...',
  'Finalizing security handshake...',
];

export function VerifyEmailModal({
  isOpen,
  onClose,
  email,
  accountType = 'business',
  initialStep = 'otp',
  onConfirmSendCode,
  onEditEmail,
  onVerified,
}: VerifyEmailModalProps) {
  const [step, setStep] = useState<'confirm' | 'otp'>(initialStep);
  const [pin, setPin] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [dispatchStatusIndex, setDispatchStatusIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(45);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync initial step & reset states on open
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setPin(['', '', '', '', '', '']);
      setErrorMessage('');
      setIsSuccess(false);
      setIsNavigating(false);
      setResendSuccess(false);
      setDispatchStatusIndex(0);

      if (initialStep === 'otp') {
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 150);
      }
    }
  }, [isOpen, initialStep]);

  // Focus input when moving to OTP step
  useEffect(() => {
    if (isOpen && step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen, step]);

  // Cycle dispatch status messages during registration send
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading && step === 'confirm') {
      interval = setInterval(() => {
        setDispatchStatusIndex((prev) => (prev + 1) % DISPATCH_MESSAGES.length);
      }, 1500);
    } else {
      setDispatchStatusIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading, step]);

  // Resend cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && step === 'otp' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, step, resendCooldown]);

  const handleConfirmAndSend = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (onConfirmSendCode) {
        await onConfirmSendCode();
      } else {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
        const res = await fetch(`${apiUrl}/auth/resend-verification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error?.message || 'Failed to dispatch verification code');
        }
      }

      setStep('otp');
      setResendCooldown(45);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to send verification code. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newPin = [...pin];
    newPin[index] = cleanVal;
    setPin(newPin);
    setErrorMessage('');

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (cleanVal && index === 5 && newPin.every((d) => d !== '')) {
      handleVerify(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newPin = [...pin];
    for (let i = 0; i < 6; i++) {
      newPin[i] = pastedData[i] || '';
    }
    setPin(newPin);
    setErrorMessage('');

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const fullPin = codeToVerify || pin.join('');
    if (fullPin.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const res = await fetch(`${apiUrl}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: fullPin }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || data.message || 'Invalid or expired verification PIN.');
      }

      setIsSuccess(true);
      setIsNavigating(true);

      // Keep smooth loading transition while triggering parent routing
      setTimeout(() => {
        onVerified();
      }, 1400);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the PIN.');
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage('');
    setResendSuccess(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const res = await fetch(`${apiUrl}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to resend code');
      }

      setResendSuccess(true);
      setResendCooldown(60);
      setPin(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code. Please try again shortly.');
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = pin.every((d) => d !== '');

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSuccess || isNavigating ? () => {} : onClose}
      maxWidth="md"
      className="p-6 sm:p-8"
    >
      <div className="text-center">
        {/* =========================================================================
            STAGE 1: EMAIL VERIFICATION CONFIRMATION ALERT (Before dispatching email)
            ========================================================================= */}
        {step === 'confirm' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Top Security Hero Badge */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/10">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
              ) : (
                <ShieldCheck className="h-8 w-8" />
              )}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <Sparkles className="h-3 w-3" />
                <span>Verification Required Before Continuing</span>
              </div>

              <h2 className="mt-2.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {isLoading ? 'Dispatching Verification PIN...' : 'Confirm Your Email Address'}
              </h2>

              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
                {isLoading
                  ? 'Please hold on while we secure your account credentials and dispatch the code to your inbox.'
                  : accountType === 'business'
                  ? 'Before proceeding to Stage 2 of registration, you must verify your business email address to ensure verified Zimbabwean merchant credibility.'
                  : 'Before proceeding to the next stage of registration, you must verify ownership of your email address.'}
              </p>
            </div>

            {/* Email Preview & Check Card */}
            <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/30 p-4 text-left">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span className="font-medium">Verification code will be sent to:</span>
                {onEditEmail && !isLoading && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEditEmail();
                    }}
                    className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
              <div className="font-mono text-base font-bold text-slate-900 dark:text-white break-all">
                {email}
              </div>

              {isLoading ? (
                <div className="mt-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>{DISPATCH_MESSAGES[dispatchStatusIndex]}</span>
                    </span>
                    <span className="font-mono text-[11px] opacity-75">~3s</span>
                  </div>
                  {/* Animated Progress Bar */}
                  <div className="h-1.5 w-full bg-emerald-200 dark:bg-emerald-900/60 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-full w-2/3 animate-[pulse_1s_ease-in-out_infinite]" />
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>A secure 6-digit confirmation PIN will be dispatched immediately.</span>
                </div>
              )}
            </div>

            {!isLoading && (
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Are you ready to confirm your email and proceed?
              </p>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 p-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
                onClick={handleConfirmAndSend}
                className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 text-white font-semibold"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Dispatching 6-Digit PIN...</span>
                  </span>
                ) : (
                  <>
                    <span>Confirm Email &amp; Send PIN</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </Button>

              {!isLoading && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Review Details
                </button>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 2: ENTER 6-DIGIT VERIFICATION PIN & TRANSITION
            ========================================================================= */}
        {step === 'otp' && (
          <div>
            {/* Animated Icon Hero */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/10">
              {isNavigating ? (
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              ) : isSuccess ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-500 animate-in zoom-in-75 duration-300" />
              ) : (
                <Mail className="h-7 w-7" />
              )}
            </div>

            {/* Title & Badge */}
            <div className="mt-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <Sparkles className="h-3 w-3" />
                <span>
                  {isNavigating
                    ? 'Preparing Next Stage...'
                    : isSuccess
                    ? 'Verification Confirmed'
                    : '6-Digit Verification Code'}
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {isNavigating
                  ? accountType === 'business'
                    ? 'Loading Business Onboarding...'
                    : 'Loading Your Dashboard...'
                  : isSuccess
                  ? 'Email Confirmed!'
                  : 'Enter 6-Digit PIN'}
              </h2>

              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                {isNavigating ? (
                  accountType === 'business'
                    ? 'Your email is verified. Redirecting you to Stage 2: Storefront Studio & Verification Documents...'
                    : 'Your account is active. Redirecting you to the verified dashboard...'
                ) : isSuccess ? (
                  'Email verification successful! Proceeding...'
                ) : (
                  <>
                    We&rsquo;ve sent a 6-digit confirmation PIN to{' '}
                    <span className="font-semibold text-slate-900 dark:text-white underline decoration-emerald-500/40">
                      {email}
                    </span>
                    . Enter it below to proceed to the next stage.
                  </>
                )}
              </p>

              {onEditEmail && !isSuccess && !isNavigating && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditEmail();
                  }}
                  className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  Entered the wrong email? Click to change
                </button>
              )}
            </div>

            {/* Active Transition Loading State */}
            {isNavigating ? (
              <div className="mt-7 py-6 px-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-center animate-in zoom-in-95 space-y-3.5">
                <div className="flex items-center justify-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                    <Store className="h-5 w-5 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Stage 2: Storefront &amp; Compliance Vault
                    </div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      Initializing onboarding studio...
                    </div>
                  </div>
                </div>

                {/* Animated Progress Track */}
                <div className="h-2 w-full bg-emerald-200/80 dark:bg-emerald-900/60 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 rounded-full w-full animate-[pulse_1.2s_ease-in-out_infinite]" />
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
                  <span>Loading next page, please do not close this window...</span>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {/* 6 Digit Input Boxes */}
                <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                  {pin.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      disabled={isLoading || isNavigating}
                      className={`h-12 w-11 sm:h-14 sm:w-12 rounded-xl text-center text-xl sm:text-2xl font-mono font-bold tracking-tight transition-all duration-150 outline-hidden ${
                        digit
                          ? 'border-2 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 text-emerald-900 dark:text-white shadow-xs'
                          : 'border-2 border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:border-emerald-500 focus:bg-emerald-50/20 dark:focus:bg-emerald-950/20'
                      }`}
                    />
                  ))}
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 p-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Resend Confirmation Banner */}
                {resendSuccess && (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/40 p-2.5 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>A fresh 6-digit PIN has been dispatched to your inbox!</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  disabled={!isComplete || isLoading || isNavigating}
                  onClick={() => handleVerify()}
                  className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 text-white font-semibold"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying PIN...</span>
                    </span>
                  ) : (
                    <>
                      <span>Verify &amp; Proceed to Next Stage</span>
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </>
                  )}
                </Button>

                {/* Resend Helper & Timer */}
                <div className="pt-2 flex flex-col items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  {resendCooldown > 0 ? (
                    <p>
                      Didn&rsquo;t receive the email? Resend code in{' '}
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {resendCooldown}s
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending || isLoading}
                      className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
                      <span>{isResending ? 'Dispatching fresh code...' : 'Resend 6-Digit PIN'}</span>
                    </button>
                  )}

                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Tip: Check your spam or promotions folder if you don&rsquo;t see it within a minute.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
