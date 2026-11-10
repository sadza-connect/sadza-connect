'use client';

import { useState } from 'react';

interface GoogleAuthButtonProps {
  mode?: 'login' | 'signup_personal' | 'signup_business';
  redirect?: string;
  label?: string;
  disabled?: boolean;
}

export function GoogleAuthButton({
  mode = 'login',
  redirect,
  label,
  disabled = false,
}: GoogleAuthButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const defaultLabel =
    mode === 'signup_business'
      ? 'Continue as Business with Google'
      : mode === 'signup_personal'
      ? 'Continue with Google'
      : 'Continue with Google';

  const handleGoogleSignIn = () => {
    if (disabled || isRedirecting) return;
    setIsRedirecting(true);

    const params = new URLSearchParams();
    if (mode === 'signup_business') {
      params.set('type', 'business');
      params.set('source', 'signup');
    } else if (mode === 'signup_personal') {
      params.set('type', 'personal');
      params.set('source', 'signup');
    } else {
      params.set('type', 'personal');
      params.set('source', 'login');
    }

    if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
      params.set('redirect', redirect);
    }

    window.location.href = `/api/v1/auth/google?${params.toString()}`;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={disabled || isRedirecting}
      className="w-full inline-flex items-center justify-center gap-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isRedirecting ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-emerald-600" />
      ) : (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      <span>{isRedirecting ? 'Connecting to Google...' : label || defaultLabel}</span>
    </button>
  );
}
