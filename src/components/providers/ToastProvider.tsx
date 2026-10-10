'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

type ToastInput = Omit<Toast, 'id' | 'variant'> & { id?: string; variant?: ToastVariant };

interface ToastContextValue {
  toast: (t: ToastInput) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let counter = 0;

function dispatchGlobalToast(t: ToastInput) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sadza-global-toast', { detail: t }));
  }
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;
  return {
    toast: (t) => dispatchGlobalToast(t),
    dismiss: () => {},
  };
}

const VARIANT_META: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; accent: string; ring: string }
> = {
  success: { icon: CheckCircle2, accent: 'text-emerald-500', ring: 'ring-emerald-500/20' },
  error: { icon: XCircle, accent: 'text-rose-500', ring: 'ring-rose-500/20' },
  info: { icon: Info, accent: 'text-[#1e57eb]', ring: 'ring-[#1e57eb]/20' },
  warning: { icon: AlertTriangle, accent: 'text-amber-500', ring: 'ring-amber-500/20' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue['toast']>(
    ({ id, title, description, variant = 'info' }) => {
      const toastId = id ?? `t-${++counter}`;
      setToasts((prev) => {
        if (prev.some((t) => t.id === toastId)) return prev;
        return [...prev, { id: toastId, title, description, variant }];
      });
      const timeout = window.setTimeout(() => dismiss(toastId), 4500);
      return () => window.clearTimeout(timeout);
    },
    [dismiss]
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<ToastInput>;
      if (custom.detail) {
        toast(custom.detail);
      }
    };
    window.addEventListener('sadza-global-toast', handler);
    return () => window.removeEventListener('sadza-global-toast', handler);
  }, [toast]);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] flex flex-col items-center gap-2 p-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:items-end sm:p-0"
        role="region"
        aria-label="Notifications"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const meta = VARIANT_META[t.variant];
            const Icon = meta.icon;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className={cn(
                  'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xl ring-1',
                  meta.ring
                )}
                role="status"
              >
                <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', meta.accent)} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900">{t.title}</p>
                  {t.description && (
                    <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{t.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="-m-1 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-700 cursor-pointer"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
