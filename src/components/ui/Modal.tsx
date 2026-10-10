'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        onClose();
      }
    };
    if (visible) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onClose]);

  if (!mounted) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    '2xl': 'max-w-4xl',
  };

  return createPortal(
    <AnimatePresence>
      {visible && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm"
          />

          {/* Modal Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            className={cn(
              'relative z-10 w-full overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 text-slate-950 dark:text-white shadow-2xl',
              maxWidthClasses[resolvedSize],
              className
            )}
          >
            {/* Header */}
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                <div>
                  {title && (
                    <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="rounded-xl border border-slate-200 dark:border-slate-700 p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Content */}
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
