'use client';

import React from 'react';

interface BalloonConfig {
  id: number;
  leftPercent: number; // 0 - 100%
  size: number; // width in px
  delaySeconds: number; // animation delay
  durationSeconds: number; // float duration
  driftPx: number; // horizontal drift
  rotationDeg: number; // rotation
  gradient: {
    start: string;
    end: string;
    accent: string;
  };
}

const BALLOON_PALETTE: BalloonConfig[] = [
  {
    id: 1,
    leftPercent: 6,
    size: 44,
    delaySeconds: 0,
    durationSeconds: 4.2,
    driftPx: 25,
    rotationDeg: 8,
    gradient: { start: '#10b981', end: '#047857', accent: '#6ee7b7' }, // Emerald
  },
  {
    id: 2,
    leftPercent: 18,
    size: 38,
    delaySeconds: 0.4,
    durationSeconds: 4.6,
    driftPx: -20,
    rotationDeg: -6,
    gradient: { start: '#f59e0b', end: '#b45309', accent: '#fde68a' }, // Gold
  },
  {
    id: 3,
    leftPercent: 32,
    size: 48,
    delaySeconds: 0.1,
    durationSeconds: 3.9,
    driftPx: 18,
    rotationDeg: 7,
    gradient: { start: '#3b82f6', end: '#1d4ed8', accent: '#93c5fd' }, // Sapphire
  },
  {
    id: 4,
    leftPercent: 48,
    size: 42,
    delaySeconds: 0.6,
    durationSeconds: 4.4,
    driftPx: -15,
    rotationDeg: -5,
    gradient: { start: '#ec4899', end: '#be185d', accent: '#fbcfe8' }, // Rose
  },
  {
    id: 5,
    leftPercent: 64,
    size: 46,
    delaySeconds: 0.2,
    durationSeconds: 4.0,
    driftPx: 22,
    rotationDeg: 9,
    gradient: { start: '#10b981', end: '#059669', accent: '#a7f3d0' }, // Green
  },
  {
    id: 6,
    leftPercent: 78,
    size: 40,
    delaySeconds: 0.5,
    durationSeconds: 4.5,
    driftPx: -24,
    rotationDeg: -8,
    gradient: { start: '#f59e0b', end: '#d97706', accent: '#fef08a' }, // Amber
  },
  {
    id: 7,
    leftPercent: 90,
    size: 44,
    delaySeconds: 0.15,
    durationSeconds: 4.1,
    driftPx: 16,
    rotationDeg: 6,
    gradient: { start: '#8b5cf6', end: '#6d28d9', accent: '#c4b5fd' }, // Violet
  },
];

export function CelebrationBalloons() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden z-10"
    >
      {BALLOON_PALETTE.map((balloon) => {
        const height = Math.round(balloon.size * 1.5);
        return (
          <div
            key={balloon.id}
            className="absolute bottom-0 balloon-item motion-reduce:opacity-40"
            style={
              {
                left: `${balloon.leftPercent}%`,
                width: `${balloon.size}px`,
                height: `${height}px`,
                animationDelay: `${balloon.delaySeconds}s`,
                animationDuration: `${balloon.durationSeconds}s`,
                '--balloon-drift': `${balloon.driftPx}px`,
                '--balloon-rot': `${balloon.rotationDeg}deg`,
              } as React.CSSProperties
            }
          >
            <svg
              viewBox="0 0 60 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-md"
            >
              <defs>
                <radialGradient
                  id={`balloon-grad-${balloon.id}`}
                  cx="35%"
                  cy="35%"
                  r="65%"
                  fx="30%"
                  fy="30%"
                >
                  <stop offset="0%" stopColor={balloon.gradient.accent} stopOpacity="0.95" />
                  <stop offset="45%" stopColor={balloon.gradient.start} />
                  <stop offset="100%" stopColor={balloon.gradient.end} />
                </radialGradient>
              </defs>

              {/* Balloon String */}
              <path
                d="M30 57 C28 66, 34 74, 29 82 C27 85, 30 88, 31 90"
                stroke="rgba(148, 163, 184, 0.6)"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />

              {/* Balloon Body */}
              <ellipse
                cx="30"
                cy="30"
                rx="24"
                ry="27"
                fill={`url(#balloon-grad-${balloon.id})`}
              />

              {/* Balloon Glare / Shine reflection */}
              <ellipse
                cx="22"
                cy="20"
                rx="5"
                ry="10"
                fill="white"
                fillOpacity="0.35"
                transform="rotate(-25 22 20)"
              />

              {/* Balloon Knot */}
              <polygon
                points="26,56 34,56 30,60"
                fill={balloon.gradient.end}
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
