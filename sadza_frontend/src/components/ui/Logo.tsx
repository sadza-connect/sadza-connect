import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  priority?: boolean;
}

export function Logo({
  className,
  size = 'md',
  showTagline = true,
  priority = false,
}: LogoProps) {
  const heightClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
  };

  return (
    <Link
      href="/"
      className={cn('group inline-flex items-center gap-3 select-none', className)}
      aria-label="Sadza Connect Homepage"
    >
      {/* 
        Logo Badge Container: 
        A crisp, high-contrast capsule ensuring the black text 'SADZA' and magnifying glass 
        remain 100% sharp and brand-accurate in both Light and Dark themes.
      */}
      <div className="flex items-center justify-center rounded-xl bg-white px-2 py-1 shadow-sm border border-slate-200/80 dark:border-white/20 transition-transform duration-200 group-hover:scale-[1.02]">
        <div className={cn('relative aspect-[570/380] overflow-hidden', heightClasses[size])}>
          <Image
            src="/logo.png"
            alt="Sadza Connect Zimbabwe"
            width={180}
            height={120}
            className="h-full w-auto object-contain"
            priority={priority}
          />
        </div>
      </div>

      {showTagline && (
        <div className="hidden sm:flex flex-col border-l border-ink-200/90 dark:border-ink-800 pl-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-extrabold tracking-tight text-ink-950 dark:text-white leading-tight">
              Sadza Connect
            </span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-600" />
            <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              Zimbabwe
            </span>
          </div>
          <span className="text-[10px] font-medium tracking-normal text-ink-500 dark:text-ink-400">
            Connecting People, Businesses & Opportunities
          </span>
        </div>
      )}
    </Link>
  );
}
