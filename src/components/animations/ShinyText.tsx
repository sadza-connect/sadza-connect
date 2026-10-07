'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ShinyTextProps {
  text: string;
  className?: string;
  shimmerWidth?: number;
  speed?: number; // seconds
}

export function ShinyText({
  text,
  className = '',
  speed = 4,
}: ShinyTextProps) {
  return (
    <span
      className={cn(
        'inline-block bg-[linear-gradient(110deg,#64748b,45%,#ffffff,55%,#64748b)] dark:bg-[linear-gradient(110deg,#94a3b8,45%,#ffffff,55%,#94a3b8)] bg-[length:250%_100%] bg-clip-text text-transparent font-medium animate-shimmer',
        className
      )}
      style={{
        animationDuration: `${speed}s`,
      }}
    >
      {text}
    </span>
  );
}
