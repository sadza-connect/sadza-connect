'use client';

import { useState, useRef, useEffect } from 'react';
import { Mail, CheckCircle2, ArrowRight, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface VerifyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  accountType?: 'business' | 'personal';
  onVerified: () => void;
}

export function VerifyEmailModal({
  isOpen,
  onClose,
  email,
  accountType = 'business',
  onVerified,
}: VerifyEmailModalProps) {
  const [pin, setPin] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(45);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on open
  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '', '', '']);
      setErrorMessage('');
      setIsSuccess(false);
      setResendSuccess(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Resend cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, resendCooldown]);

  const handleChange = (index: number, value: string) => {
    // Only accept numeric inputs
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newPin = [...pin];
    newPin[index] = cleanVal;
    setPin(newPin);
    setErrorMessage('');

    // Advance to next input if digit entered
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits filled
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

    // Focus last filled or next input
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
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
      setTimeout(() => {
        onVerified();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the PIN.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage('');
    setResendSuccess(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
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
      onClose={isSuccess ? () => {} : onClose}
      maxWidth="md"
      className="p-6 sm:p-8"
    >
      <div className="text-center">
        {/* Animated Icon Hero */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/10">
          {isSuccess ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-500 animate-in zoom-in-75 duration-300" />
          ) : (
            <Mail className="h-7 w-7" />
          )}
        </div>

        {/* Title & Badge */}
        <div className="mt-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            <Sparkles className="h-3 w-3" />
            <span>2-Step Email Verification</span>
          </div>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isSuccess ? 'Account Verified!' : 'Enter 6-Digit PIN'}
          </h2>

          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
            {isSuccess ? (
              accountType === 'business'
                ? 'Your email is confirmed. Redirecting you to business onboarding...'
                : 'Your email has been verified. Welcome to Sadza Connect!'
            ) : (
              <>
                We sent a 6-digit verification code to{' '}
                <span className="font-semibold text-slate-900 dark:text-white underline decoration-emerald-500/40">
                  {email}
                </span>
                . Enter it below to activate your account.
              </>
            )}
          </p>
        </div>

        {/* Success Animation Container */}
        {isSuccess ? (
          <div className="mt-8 py-6 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-center animate-in zoom-in-95">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Proceeding to next step...</span>
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
                  disabled={isLoading}
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
              disabled={!isComplete || isLoading}
              onClick={() => handleVerify()}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 text-white font-semibold"
            >
              <span>Verify &amp; Continue</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
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
                  disabled={isResending}
                  className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>Resend 6-Digit PIN</span>
                </button>
              )}

              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Tip: Check your spam or promotions folder if you don&rsquo;t see it within a minute.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
