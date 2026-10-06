import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  isPassword?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    helper,
    leftIcon,
    rightElement,
    isPassword = false,
    className,
    id,
    type = 'text',
    ...rest
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="block text-xs font-bold uppercase tracking-wider text-ink-700 dark:text-ink-300"
          >
            {label}
            {rest.required && <span className="ml-1 text-ruby-500">*</span>}
          </label>
        </div>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="pointer-events-none absolute left-3.5 flex items-center text-ink-400 dark:text-ink-500">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          className={cn(
            'w-full rounded-xl border bg-white dark:bg-ink-900/90 py-3 text-sm text-ink-950 dark:text-white placeholder:text-ink-400 dark:placeholder:text-ink-500 transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60',
            leftIcon ? 'pl-11' : 'pl-4',
            isPassword || rightElement ? 'pr-11' : 'pr-4',
            error
              ? 'border-ruby-500 dark:border-ruby-500 focus:border-ruby-500 focus:ring-ruby-500/20'
              : 'border-ink-200 dark:border-ink-700 focus:border-brand-500 dark:focus:border-brand-500 focus:ring-brand-500/20',
            className
          )}
          {...rest}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 flex items-center text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : (
          rightElement && <div className="absolute right-3.5 flex items-center">{rightElement}</div>
        )}
      </div>

      {error ? (
        <p className="text-xs font-semibold text-ruby-600 dark:text-ruby-400">{error}</p>
      ) : helper ? (
        <p className="text-xs text-ink-500 dark:text-ink-400">{helper}</p>
      ) : null}
    </div>
  );
});
