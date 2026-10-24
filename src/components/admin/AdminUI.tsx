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
  ShieldAlert,
  Eye,
  EyeOff,
  Lock,
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
  loading?: boolean;
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
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#c8d2e0]/75 bg-white p-5 animate-pulse shadow-xs">
        <div className="flex items-center justify-between">
          <div className="h-3 w-28 bg-[#e6eaf1] rounded" />
          <div className="h-9 w-9 rounded-xl bg-[#e6eaf1]" />
        </div>
        <div className="mt-4 h-7 w-24 bg-[#e6eaf1] rounded" />
        <div className="mt-3 h-3 w-40 bg-[#f4f6f9] rounded" />
      </div>
    );
  }

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

export function TableSkeleton({
  columns = 6,
  rows = 5,
  className,
}: {
  columns?: number;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn('overflow-x-auto animate-pulse', className)}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#e6eaf1] bg-[#f4f6f9]/80">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-5 py-3">
                <div className="h-3.5 w-20 rounded bg-slate-200/80" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e6eaf1]">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="px-5 py-4">
                  <div
                    className={cn(
                      'h-4 rounded bg-slate-200/70',
                      c === 0 ? 'w-36' : c === columns - 1 ? 'w-16 ml-auto' : 'w-24'
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================================
 * 5. FORM FIELDS (INPUT, TEXTAREA, SELECT)
 * ========================================================================== */

const fieldBase =
  'w-full rounded-xl border border-[#c8d2e0] bg-white px-4 text-base text-[#0a1018] placeholder:text-[#9aabc4] transition-colors focus:border-[#1e57eb] focus:outline-none focus:ring-4 focus:ring-[#1e57eb]/10 disabled:opacity-60 read-only:bg-[#f4f6f9] read-only:text-[#465a7e] sm:text-sm';

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
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-[#2c3a52]">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
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
 * 6. RESPONSIVE MODAL SYSTEM
 *
 *  - Phones (< 640px): full-width bottom sheet that slides up, with drag handle.
 *  - Tablet/Desktop:   centred dialog.
 *  - Header is fixed, body scrolls, and <ModalFooter> sticks to the bottom so
 *    the primary action is ALWAYS visible — no scrolling to find "Save".
 *
 *  Recommended structure:
 *
 *    <AdminModal open onClose title description icon={Plus}>
 *      <form onSubmit={save}>
 *        <ModalBody>
 *          <ModalSection title="Basics" description="Optional helper text">
 *            <ModalGrid> ...fields... </ModalGrid>
 *          </ModalSection>
 *        </ModalBody>
 *        <ModalFooter>
 *          <AdminButton variant="outline" type="button" onClick={close}>Cancel</AdminButton>
 *          <AdminButton type="submit">Save</AdminButton>
 *        </ModalFooter>
 *      </form>
 *    </AdminModal>
 * ========================================================================== */

const MODAL_SIZES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-3xl',
  '2xl': 'sm:max-w-4xl',
  full: 'sm:max-w-[min(96vw,1200px)]',
};

function useIsPhone() {
  const [isPhone, setIsPhone] = React.useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsPhone(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isPhone;
}

export function AdminModal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  size = 'lg',
  className,
  bare = false,
  tone = 'default',
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  children: React.ReactNode;
  size?: keyof typeof MODAL_SIZES;
  className?: string;
  bare?: boolean;
  tone?: 'default' | 'danger';
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const isPhone = useIsPhone();
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const lastFocused = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => panelRef.current?.focus({ preventScroll: true }), 30);

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCloseRef.current();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      lastFocused?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (typeof document === 'undefined') return null;

  const motionProps = isPhone
    ? {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' },
        transition: { type: 'spring' as const, stiffness: 420, damping: 40 },
      }
    : {
        initial: { opacity: 0, y: 12, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 8, scale: 0.98 },
        transition: { type: 'spring' as const, stiffness: 420, damping: 34 },
      };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-[#0a1018]/55 backdrop-blur-[3px] print:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            className={cn(
              'relative z-10 flex w-full flex-col overflow-hidden bg-white text-[#0a1018] outline-none',
              'max-h-[92svh] rounded-t-3xl shadow-[0_-12px_40px_-8px_rgba(10,16,24,0.35)]',
              'sm:max-h-[min(88svh,920px)] sm:rounded-2xl sm:border sm:border-[#c8d2e0]/80 sm:shadow-[0_24px_60px_-12px_rgba(10,16,24,0.38)]',
              MODAL_SIZES[size],
              className
            )}
            {...motionProps}
          >
            {/* Drag handle (phones) */}
            <div className="flex shrink-0 justify-center pt-2.5 sm:hidden" aria-hidden>
              <span className="h-1.5 w-10 rounded-full bg-[#c8d2e0]" />
            </div>

            {!bare && (title || description) && (
              <div className="flex shrink-0 items-start gap-3 border-b border-[#e6eaf1] px-5 pb-4 pt-3 sm:px-7 sm:py-5">
                {Icon && (
                  <span
                    className={cn(
                      'mt-0.5 hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:flex',
                      tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-[#eef5ff] text-[#1e57eb]'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  {title && (
                    <h3
                      id={titleId}
                      className="font-display text-base font-bold leading-snug text-[#0a1018] sm:text-lg"
                    >
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="mt-1 text-[13px] leading-relaxed text-[#5a6e90]">{description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="-mr-1.5 -mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#6b81a5] transition-colors hover:bg-[#f0f3f8] hover:text-[#0a1018] cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {bare && (
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-[#6b81a5] shadow-sm transition-colors hover:bg-white hover:text-[#0a1018] cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [&>form]:flex [&>form]:min-h-full [&>form]:flex-col">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/** Padded, vertically spaced content area for a modal. */
export function ModalBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex-1 space-y-6 px-5 py-5 sm:px-7 sm:py-6', className)}>{children}</div>
  );
}

/** A titled group of fields. Consecutive sections get a subtle divider. */
export function ModalSection({
  title,
  description,
  children,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'space-y-4 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-[#eef1f6] [&:not(:first-child)]:pt-6',
        className
      )}
    >
      {(title || description) && (
        <div>
          {title && <h4 className="text-sm font-semibold text-[#0a1018]">{title}</h4>}
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-[#6b81a5]">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

/** Responsive field grid: 1 column on phones, 2 (or 3) on larger screens. */
export function ModalGrid({
  children,
  cols = 2,
  className,
}: {
  children: React.ReactNode;
  cols?: 2 | 3;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4',
        cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  );
}

/** Sticky action bar. Buttons stack full-width on phones (primary on top). */
export function ModalFooter({
  children,
  className,
  start,
}: {
  children: React.ReactNode;
  className?: string;
  /** Optional left-aligned content on desktop (e.g. a hint or a destructive action). */
  start?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-10 mt-auto border-t border-[#e6eaf1] bg-white/95 px-5 pt-3.5 backdrop-blur supports-[backdrop-filter]:bg-white/85 sm:px-7 sm:py-4',
        'pb-[max(0.875rem,env(safe-area-inset-bottom))]',
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {start ? <div className="text-xs text-[#6b81a5]">{start}</div> : <span className="hidden sm:block" />}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center [&>*]:w-full sm:[&>*]:w-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Pre-built confirmation dialog (delete / remove / irreversible actions). */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger',
  icon,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: React.ReactNode;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
  icon?: LucideIcon;
}) {
  return (
    <AdminModal open={open} onClose={onClose} size="sm" title={title} icon={icon} tone={tone}>
      <ModalBody>
        <div className="text-sm leading-relaxed text-[#374966]">{message}</div>
      </ModalBody>
      <ModalFooter>
        <AdminButton variant="outline" type="button" onClick={onClose}>
          {cancelLabel}
        </AdminButton>
        <AdminButton
          variant={tone === 'danger' ? 'danger' : 'primary'}
          type="button"
          onClick={onConfirm}
        >
          {confirmLabel}
        </AdminButton>
      </ModalFooter>
    </AdminModal>
  );
}

export interface AdminPasswordConfirmationModalProps {
  open: boolean;
  title: React.ReactNode;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  actionType?: 'danger' | 'warning';
  onConfirm: (password: string) => Promise<void> | void;
  onClose: () => void;
}

export function AdminPasswordConfirmationModal({
  open,
  title,
  description,
  confirmLabel = 'Authorize & Proceed',
  cancelLabel = 'Cancel',
  actionType = 'danger',
  onConfirm,
  onClose,
}: AdminPasswordConfirmationModalProps) {
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setPassword('');
      setError(null);
      setLoading(false);
      setShowPassword(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Please enter your administrator password (at least 6 characters).');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onConfirm(password);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Password verification failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={() => {
        if (!loading) onClose();
      }}
      size="sm"
      title={title}
      icon={actionType === 'danger' ? ShieldAlert : Lock}
      tone={actionType === 'danger' ? 'danger' : 'default'}
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="space-y-4">
            <div className="text-sm leading-relaxed text-[#374966]">
              {description}
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Administrator Verification:</strong> Re-enter your password to authorize this destructive operation.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0a1018]">
                Administrator Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your admin password…"
                  disabled={loading}
                  autoFocus
                  className="h-10 w-full rounded-xl border border-[#c8d2e0] bg-white px-3.5 pr-10 text-sm text-[#0a1018] outline-none transition-colors placeholder:text-[#6b81a5] focus:border-[#1e57eb] focus:ring-1 focus:ring-[#1e57eb]"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b81a5] hover:text-[#0a1018]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && <p className="text-xs font-semibold text-red-600 mt-1">{error}</p>}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <AdminButton
            variant="outline"
            type="button"
            disabled={loading}
            onClick={onClose}
          >
            {cancelLabel}
          </AdminButton>
          <AdminButton
            variant={actionType === 'danger' ? 'danger' : 'primary'}
            type="submit"
            loading={loading}
            disabled={loading || password.length < 6}
          >
            {confirmLabel}
          </AdminButton>
        </ModalFooter>
      </form>
    </AdminModal>
  );
}

/** Switch row for boolean settings inside forms (Featured, Verified, etc.). */
export function ModalToggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: React.ReactNode;
  description?: React.ReactNode;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#dfe5ee] bg-white px-4 py-3.5 transition-colors hover:border-[#c8d2e0]',
        checked && 'border-[#bcd7ff] bg-[#f5f9ff]',
        disabled && 'cursor-not-allowed opacity-60'
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-[#0a1018]">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs leading-relaxed text-[#6b81a5]">{description}</span>
        )}
      </span>
      <span className="relative inline-flex shrink-0">
        <input
          id={id}
          type="checkbox"
          role="switch"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="h-6 w-11 rounded-full bg-[#c8d2e0] transition-colors peer-checked:bg-[#1e57eb] peer-focus-visible:ring-2 peer-focus-visible:ring-[#1e57eb] peer-focus-visible:ring-offset-2" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
