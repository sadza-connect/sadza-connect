'use client';

import React, { forwardRef, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Search,
  ChevronDown,
  X,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/* ============================================================================
 * 1. BADGE & STATUS TONE
 * ========================================================================== */

export type BadgeTone =
  | 'neutral'
  | 'brand'
  | 'signal'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline';

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-[#e6eaf1] text-[#2c3a52]',
  brand: 'bg-[#eef5ff] text-[#1743d4] border border-[#bcd7ff]/60',
  signal: 'bg-[#fff1c6] text-[#943c0c] border border-[#ffe088]/60',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200/60',
  danger: 'bg-red-50 text-red-700 border border-red-200/60',
  info: 'bg-[#eef5ff] text-[#1743d4] border border-[#bcd7ff]/60',
  outline: 'border border-[#c8d2e0] text-[#374966] bg-white',
};

export function AdminBadge({
  children,
  tone = 'neutral',
  dot = false,
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-none',
        BADGE_TONES[tone],
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-85" aria-hidden />}
      {children}
    </span>
  );
}

export function statusTone(status: string): BadgeTone {
  const s = (status || '').toLowerCase();
  if (
    [
      'paid',
      'paid subscriber',
      'active',
      'resolved',
      'in stock',
      'delivered',
      'completed',
      'verified',
      'hired',
      'open',
    ].includes(s)
  ) {
    return 'success';
  }
  if (
    [
      'free grace period',
      'partial',
      'in progress',
      'processing',
      'in transit',
      'reviewing',
      'shortlisted',
      'interviewed',
      'pending',
    ].includes(s)
  ) {
    return 'brand';
  }
  if (['high', 'urgent', 'grace expired', 'void', 'expired', 'suspended', 'rejected', 'cancelled'].includes(s)) {
    return 'danger';
  }
  if (['new', 'featured', 'normal'].includes(s)) {
    return 'signal';
  }
  return 'neutral';
}

/* ============================================================================
 * 2. BUTTON
 * ========================================================================== */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'signal' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_BASE =
  'relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e57eb] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 whitespace-nowrap cursor-pointer';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-[#1e57eb] text-white shadow-[0_1px_2px_rgba(10,16,24,0.08),0_8px_20px_-8px_rgba(30,87,235,0.55)] hover:bg-[#1743d4]',
  secondary: 'bg-[#0a1018] text-white hover:bg-[#1f2a3d] shadow-xs',
  outline: 'border border-[#c8d2e0] bg-white text-[#0a1018] hover:border-[#9aabc4] hover:bg-[#f4f6f9]',
  ghost: 'text-[#374966] hover:bg-[#e6eaf1]/70 hover:text-[#0a1018]',
  signal: 'bg-[#ffb020] text-[#0a1018] hover:bg-[#ffc94a] shadow-xs',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-xs',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-6 text-sm',
};

export function AdminButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  href,
  target,
  className,
  children,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  href?: string;
  target?: string;
}) {
  const classes = cn(
    BUTTON_BASE,
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    fullWidth && 'w-full',
    className
  );

  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      <span className="inline-flex items-center gap-2">{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} target={target} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
}

/* ============================================================================
 * 3. PAGE HEADER, PANEL, STAT CARD & ICON BUTTON
 * ========================================================================== */

export function AdminPageHeader({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#0a1018]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-[#465a7e]">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2.5">{children}</div>}
    </div>
  );
}

export function Panel({
  children,
  className,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#c8d2e0]/75 bg-white shadow-[0_1px_2px_rgba(10,16,24,0.04),0_8px_24px_-12px_rgba(10,16,24,0.10)]',
        padded && 'p-5 sm:p-6',
        className
      )}
    >
      {children}
    </div>
  );
}

export function PanelHeading({
  title,
  hint,
  action,
  className,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div>
        <h2 className="text-sm font-bold text-[#0a1018]">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-[#6b81a5]">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export interface StatCardProps {
  label: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  delta?: number;
  trend?: 'up' | 'down';
  hint?: string;
  icon?: LucideIcon;
}

export function StatCard({
  label,
  value,
  prefix,
  suffix,
  delta,
  trend = 'up',
  hint,
  icon: Icon,
}: StatCardProps) {
  const positive = trend === 'up';
  const TrendIcon = positive ? TrendingUp : TrendingDown;
  return (
    <div className="rounded-2xl border border-[#c8d2e0]/75 bg-white p-5 shadow-[0_1px_2px_rgba(10,16,24,0.04),0_8px_24px_-12px_rgba(10,16,24,0.10)] transition-shadow hover:shadow-[0_2px_4px_rgba(10,16,24,0.06),0_20px_40px_-20px_rgba(10,16,24,0.18)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6b81a5]">{label}</p>
        {Icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef5ff] text-[#1e57eb]">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0a1018] tabular-nums">
          {prefix}
          {value}
          {suffix}
        </p>
        {typeof delta === 'number' && (
          <span
            className={cn(
              'mb-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
              positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {delta > 0 ? '+' : ''}
            {delta}%
          </span>
        )}
      </div>
      {hint && <p className="mt-1.5 text-xs text-[#6b81a5]">{hint}</p>}
    </div>
  );
}

export function IconButton({
  icon: Icon,
  label,
  onClick,
  href,
  tone = 'neutral',
  className,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
  tone?: 'neutral' | 'danger' | 'brand';
  className?: string;
}) {
  const classes = cn(
    'inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#465a7e] transition-colors cursor-pointer',
    tone === 'danger'
      ? 'hover:bg-red-50 hover:text-red-600'
      : tone === 'brand'
      ? 'hover:bg-[#eef5ff] hover:text-[#1e57eb]'
      : 'hover:bg-[#e6eaf1] hover:text-[#0a1018]',
    className
  );
  if (href) {
    return (
      <Link href={href} className={classes} aria-label={label} title={label}>
        <Icon className="h-4 w-4" />
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes} aria-label={label} title={label}>
      <Icon className="h-4 w-4" />
    </button>
  );
}

/* ============================================================================
 * 4. TOOLBAR, SEARCH, FILTER & EMPTY STATE
 * ========================================================================== */

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative flex-1', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b81a5]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-[#c8d2e0] bg-white pl-10 pr-3.5 text-sm text-[#0a1018] outline-none transition-colors placeholder:text-[#6b81a5] focus:border-[#1e57eb] focus:ring-4 focus:ring-[#1e57eb]/10"
      />
    </div>
  );
}

export function FilterSelect({
  value,
  onChange,
  children,
  className,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-10 w-full appearance-none rounded-xl border border-[#c8d2e0] bg-white pl-3.5 pr-9 text-sm font-medium text-[#1f2a3d] outline-none transition-colors focus:border-[#1e57eb] focus:ring-4 focus:ring-[#1e57eb]/10"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b81a5]" />
    </div>
  );
}

export function Toolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-[#e6eaf1]',
        className
      )}
    >
      {children}
    </div>
  );
}

export function ResultCount({
  shown,
  total,
  noun,
}: {
  shown: number;
  total: number;
  noun: string;
}) {
  return (
    <p className="text-xs text-[#6b81a5] shrink-0">
      Showing <span className="font-bold text-[#1f2a3d] tabular-nums">{shown}</span> of{' '}
      <span className="font-semibold tabular-nums">{total}</span> {noun}
    </p>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#1e57eb]">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-3 text-sm font-bold text-[#0a1018]">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-[#6b81a5]">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ============================================================================
 * 5. FORM FIELDS (INPUT, TEXTAREA, SELECT)
 * ========================================================================== */

const fieldBase =
  'w-full rounded-xl border border-[#c8d2e0] bg-white px-4 text-sm text-[#0a1018] placeholder:text-[#9aabc4] transition-colors focus:border-[#1e57eb] focus:outline-none focus:ring-4 focus:ring-[#1e57eb]/10 disabled:opacity-60 read-only:bg-[#f4f6f9] read-only:text-[#465a7e]';

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: {
  label?: React.ReactNode;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-xs font-bold uppercase tracking-wider text-[#2c3a52]">
          {label}
          {required && <span className="ml-0.5 text-[#1e57eb]">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-[#6b81a5]">{hint}</p>
      ) : null}
    </div>
  );
}

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  hint?: string;
  error?: string;
  wrapClassName?: string;
}

export const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(function AdminInput(
  { label, hint, error, className, wrapClassName, required, id, ...props },
  ref
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Field
      label={label}
      htmlFor={fieldId}
      hint={hint}
      error={error}
      required={required}
      className={wrapClassName}
    >
      <input
        ref={ref}
        id={fieldId}
        required={required}
        className={cn(fieldBase, 'h-11', error && 'border-red-300', className)}
        {...props}
      />
    </Field>
  );
});

interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  hint?: string;
  error?: string;
  wrapClassName?: string;
}

export const AdminTextarea = forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  function AdminTextarea(
    { label, hint, error, className, wrapClassName, required, id, ...props },
    ref
  ) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <Field
        label={label}
        htmlFor={fieldId}
        hint={hint}
        error={error}
        required={required}
        className={wrapClassName}
      >
        <textarea
          ref={ref}
          id={fieldId}
          required={required}
          className={cn(fieldBase, 'min-h-[100px] resize-y py-3 leading-relaxed', className)}
          {...props}
        />
      </Field>
    );
  }
);

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode;
  hint?: string;
  error?: string;
  wrapClassName?: string;
  children: React.ReactNode;
}

export const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(function AdminSelect(
  { label, hint, error, className, wrapClassName, required, id, children, ...props },
  ref
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Field
      label={label}
      htmlFor={fieldId}
      hint={hint}
      error={error}
      required={required}
      className={wrapClassName}
    >
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          required={required}
          className={cn(fieldBase, 'h-11 appearance-none pr-10', className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b81a5]" />
      </div>
    </Field>
  );
});

/* ============================================================================
 * 6. PORTAL-RENDERED EXECUTIVE MODAL (WITH FRAMER MOTION SPRING)
 * ========================================================================== */

const MODAL_SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-5xl',
  full: 'max-w-[96vw]',
};

export function AdminModal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'lg',
  className,
  bare = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  size?: keyof typeof MODAL_SIZES;
  className?: string;
  bare?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCloseRef.current();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5">
          <motion.div
            className="absolute inset-0 bg-[#0a1018]/60 backdrop-blur-sm print:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            className={cn(
              'relative z-10 flex max-h-[calc(100svh-2rem)] w-full flex-col overflow-hidden rounded-2xl border border-[#c8d2e0]/80 bg-white text-[#0a1018] shadow-[0_24px_60px_-12px_rgba(10,16,24,0.38)]',
              MODAL_SIZES[size],
              className
            )}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            tabIndex={-1}
          >
            {!bare && (
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e6eaf1] bg-[#f4f6f9]/60 px-6 py-5">
                <div>
                  {title && (
                    <h3 className="font-display text-lg font-bold text-[#0a1018]">{title}</h3>
                  )}
                  {description && <p className="mt-1 text-xs text-[#465a7e]">{description}</p>}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="-m-1.5 rounded-xl border border-[#c8d2e0]/80 bg-white p-2 text-[#465a7e] transition-colors hover:bg-[#e6eaf1] hover:text-[#0a1018] cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {bare ? (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
