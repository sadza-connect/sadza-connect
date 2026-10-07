'use client';

import React from 'react';

interface OrbitalRingProps {
  className?: string;
  size?: number;
}

export function OrbitalRing({ className = '', size = 880 }: OrbitalRingProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute left-1/2 -top-28 sm:-top-36 -translate-x-1/2 select-none overflow-visible ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 1. Deep Celestial Radial Aura */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-75 dark:opacity-60 transition-opacity"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.16) 0%, rgba(255, 255, 255, 0.05) 35%, transparent 70%)',
        }}
      />

      {/* 2. Top Eclipse Luminous Arc (The glowing crescent horizon) */}
      <div
        className="absolute inset-4 rounded-full"
        style={{
          background:
            'conic-gradient(from 180deg at 50% 50%, transparent 0deg, transparent 70deg, rgba(16, 185, 129, 0.45) 120deg, rgba(255, 255, 255, 0.7) 180deg, rgba(16, 185, 129, 0.45) 240deg, transparent 290deg, transparent 360deg)',
          maskImage: 'radial-gradient(circle, transparent 69.5%, black 70%, black 70.8%, transparent 71.3%)',
          WebkitMaskImage: 'radial-gradient(circle, transparent 69.5%, black 70%, black 70.8%, transparent 71.3%)',
          filter: 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.6))',
        }}
      />

      {/* 3. Outer Rotating Coordinate Ring with Ticks */}
      <div
        className="absolute inset-0 rounded-full border border-slate-300/40 dark:border-slate-700/40 animate-[spin_120s_linear_infinite]"
        style={{
          boxShadow: 'inset 0 0 30px rgba(16, 185, 129, 0.04)',
        }}
      >
        {/* Cardinal North/South/East/West markers */}
        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-widest text-emerald-600/70 dark:text-emerald-400/80">
          000°
        </span>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-widest text-slate-400 dark:text-slate-600">
          180°
        </span>
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] font-mono tracking-widest text-slate-400 dark:text-slate-600">
          270°
        </span>
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-mono tracking-widest text-slate-400 dark:text-slate-600">
          090°
        </span>

        {/* Small radial orbit dot */}
        <div className="absolute top-[8%] left-[85%] h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
      </div>

      {/* 4. Middle Concentric Dashed Ring (Counter-rotating) */}
      <div
        className="absolute inset-16 rounded-full border border-dashed border-slate-300/60 dark:border-slate-700/60 animate-[spin_90s_linear_infinite_reverse]"
        style={{
          strokeDasharray: '6 8',
        }}
      >
        <div className="absolute top-[30%] left-[5%] h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-300 shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
      </div>

      {/* 5. Inner Hairline Concentric Ring */}
      <div className="absolute inset-36 rounded-full border border-slate-200/60 dark:border-slate-800/80" />

      {/* 6. 3D Elliptical Latitudes (Giving Spherical Depth) */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-300/30 dark:border-slate-700/30"
        style={{
          width: '84%',
          height: '42%',
          transform: 'translate(-50%, -50%) rotate(-12deg)',
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-slate-300/20 dark:border-slate-700/20"
        style={{
          width: '74%',
          height: '24%',
          transform: 'translate(-50%, -50%) rotate(-12deg)',
        }}
      />

      {/* 7. Center Crosshair & Focal Core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className="h-14 w-14 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 backdrop-blur-xs border border-emerald-500/20 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
        </div>
      </div>

      {/* Bottom fade scrim so content below remains super legible */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            'linear-gradient(to bottom, transparent, rgba(var(--color-bg), 0.75) 60%, rgba(var(--color-bg), 1) 100%)',
        }}
      />
    </div>
  );
}
