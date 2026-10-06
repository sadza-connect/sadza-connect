import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { ShieldCheck } from 'lucide-react';

export type BadgeTone = 'brand' | 'gold' | 'verified' | 'ruby' | 'neutral' | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

const TONES: Record<BadgeTone, string> = {
  brand:
    'bg-brand-50 text-brand-700 border-brand-200/80 dark:bg-brand-950/70 dark:text-brand-300 dark:border-brand-800',
  gold:
    'bg-gold-50 text-gold-800 border-gold-300 dark:bg-gold-950/60 dark:text-gold-300 dark:border-gold-800',
  verified:
    'bg-brand-50 text-brand-700 border-brand-200 font-semibold inline-flex items-center gap-1 dark:bg-brand-950/80 dark:text-brand-300 dark:border-brand-700',
  ruby:
    'bg-ruby-50 text-ruby-700 border-ruby-200 dark:bg-ruby-950/60 dark:text-ruby-300 dark:border-ruby-800',
  neutral:
    'bg-ink-100 text-ink-700 border-ink-200 dark:bg-ink-800 dark:text-ink-200 dark:border-ink-700',
  outline:
    'bg-white text-ink-700 border-ink-200 dark:bg-ink-900 dark:text-ink-300 dark:border-ink-700',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = 'neutral', size = 'sm', className, children, ...rest },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium tracking-tight whitespace-nowrap',
        size === 'sm' ? 'text-xs' : 'text-sm px-3 py-1',
        TONES[tone],
        className
      )}
      {...rest}
    >
      {tone === 'verified' && <ShieldCheck className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400 inline shrink-0" />}
      {children}
    </span>
  );
});
