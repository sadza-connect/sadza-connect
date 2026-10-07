import { cn } from '@/lib/utils/cn';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('space-y-2.5', centered && 'text-center mx-auto max-w-2xl', className)}>
      {eyebrow && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-950/70 border border-brand-200/80 dark:border-brand-800 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-600 dark:bg-brand-400" />
          {eyebrow}
        </div>
      )}
      <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink-950 dark:text-white sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="text-base text-ink-600 dark:text-ink-300 sm:text-lg leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
