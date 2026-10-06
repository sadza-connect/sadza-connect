'use client';

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  className?: string;
  animateOn?: 'view' | 'hover';
}

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';

export function DecryptedText({
  text,
  speed = 40,
  maxIterations = 10,
  className = '',
  animateOn = 'view',
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);

    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return text[index];
            }
            return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
          })
          .join('')
      );

      iteration += 1 / 3;

      if (iteration >= text.length) {
        setDisplayText(text);
        setIsScrambling(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, speed);
  };

  useEffect(() => {
    if (animateOn === 'view') {
      startScramble();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  return (
    <span
      onMouseEnter={() => {
        if (animateOn === 'hover') startScramble();
      }}
      className={cn('inline-block font-mono tracking-tight cursor-default', className)}
    >
      {displayText}
    </span>
  );
}
