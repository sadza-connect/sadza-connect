import { forwardRef } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'secondary' | 'gold' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const BASE =
  'relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ink-950 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap cursor-pointer select-none';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white shadow-emerald hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500 hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-ink-950 text-white hover:bg-ink-800 dark:bg-white dark:text-ink-950 dark:hover:bg-ink-100 hover:-translate-y-0.5 active:translate-y-0 shadow-sm',
  gold:
    'bg-gold-500 text-ink-950 font-bold hover:bg-gold-400 dark:bg-gold-400 dark:hover:bg-gold-300 hover:-translate-y-0.5 active:translate-y-0 shadow-sm',
  outline:
    'border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-800 dark:text-ink-100 hover:border-ink-300 dark:hover:border-ink-600 hover:bg-ink-50 dark:hover:bg-ink-800 shadow-sm',
  ghost:
    'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-ink-950 dark:hover:text-white',
  danger:
    'bg-ruby-600 text-white hover:bg-ruby-700 dark:bg-ruby-600 dark:hover:bg-ruby-500 hover:-translate-y-0.5 active:translate-y-0 shadow-sm',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    as?: 'button';
  };

type ButtonAsLink = CommonProps &
  Omit<React.ComponentProps<typeof Link>, keyof CommonProps> & {
    as: 'link';
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export const Button = forwardRef<HTMLButtonElement & HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      children,
      ...rest
    } = props;

    const classes = cn(
      BASE,
      VARIANTS[variant],
      SIZES[size],
      fullWidth && 'w-full',
      className
    );

    if (props.as === 'link') {
      const { href, ...linkRest } = rest as React.ComponentProps<typeof Link>;
      return (
        <Link
          href={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          {...linkRest}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
          {children}
        </Link>
      );
    }

    const buttonRest = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        disabled={buttonRest.disabled || loading}
        className={classes}
        {...buttonRest}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
