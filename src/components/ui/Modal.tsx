'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

const MODAL_SIZES = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-2xl',
  '2xl': 'sm:max-w-4xl',
  full: 'sm:max-w-[min(96vw,1200px)]',
};

function useIsPhone() {
  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsPhone(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isPhone;
}

export function Modal({
  isOpen,
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  size,
  className,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const visible = Boolean(isOpen ?? open);
  const resolvedSize = size ?? maxWidth;
  const isPhone = useIsPhone();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible]);

  if (!mounted) return null;

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
      {visible && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-[3px] print:hidden"
            aria-hidden
          />

          {/* Modal Sheet / Dialog */}
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            className={cn(
              'relative z-10 flex w-full flex-col overflow-hidden bg-white text-slate-900 shadow-2xl outline-none dark:bg-slate-900 dark:text-white',
              'max-h-[92svh] rounded-t-3xl shadow-[0_-12px_40px_-8px_rgba(10,16,24,0.35)]',
              'sm:max-h-[min(88svh,900px)] sm:rounded-2xl sm:border sm:border-slate-200/90 dark:sm:border-slate-800',
              MODAL_SIZES[resolvedSize],
              className
            )}
            {...motionProps}
          >
            {/* Drag Handle on Phones */}
            <div className="flex shrink-0 justify-center pt-2.5 sm:hidden" aria-hidden>
              <span className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Header */}
            {(title || description) && (
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 pb-4 pt-3 dark:border-slate-800 sm:px-6 sm:py-5">
                <div className="min-w-0 flex-1">
                  {title && (
                    <h3 className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="-mr-1.5 -mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Scrollable Content */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/** Padded, scrollable content area for public modal */
export function PublicModalBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('p-5 sm:p-6 space-y-5', className)}>
      {children}
    </div>
  );
}

/** Sticky action footer for public modal with mobile button stacking */
export function PublicModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-10 mt-auto border-t border-slate-100 bg-white/95 px-5 py-3.5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-6 sm:py-4',
        'pb-[max(0.875rem,env(safe-area-inset-bottom))]',
        className
      )}
    >
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end [&>*]:w-full sm:[&>*]:w-auto">
        {children}
      </div>
    </div>
  );
}

