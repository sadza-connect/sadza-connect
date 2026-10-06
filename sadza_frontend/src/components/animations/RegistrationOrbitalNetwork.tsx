'use client';

import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, MapPin, CheckCircle2, Sparkles, Users } from 'lucide-react';

const RECENT_REGISTRATIONS = [
  { name: 'Midlands Solar & Agro Solutions', hub: 'Gweru, Midlands', time: 'Just now', tier: 'Corporate Pvt Ltd' },
  { name: 'Batanai Building Supplies', hub: 'Bulawayo Metro', time: '3 mins ago', tier: 'Verified SME' },
  { name: 'Zambezi Eco-Lodge & Safaris', hub: 'Victoria Falls', time: '7 mins ago', tier: 'Corporate Pvt Ltd' },
  { name: 'Chitungwiza Agro Chemicals', hub: 'Harare Province', time: '11 mins ago', tier: 'Verified SME' },
  { name: 'Eastern Highlands Coffee Roasters', hub: 'Mutare, Manicaland', time: '16 mins ago', tier: 'Corporate Pvt Ltd' },
];

export function RegistrationOrbitalNetwork() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % RECENT_REGISTRATIONS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const activeEntry = RECENT_REGISTRATIONS[currentIndex];

  return (
    <div className="relative w-full max-w-md mx-auto my-6 select-none">
      {/* 1. Concentric Circular Network Visual Element (The Zimbabwe Commercial Circle) */}
      <div className="relative mx-auto h-64 w-64 sm:h-72 sm:w-72 flex items-center justify-center">
        {/* Deep ambient radial glow */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-60 dark:opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(246, 172, 2, 0.1) 40%, transparent 70%)',
          }}
        />

        {/* Outer Coordinate Ring (Rotating slowly) */}
        <div className="absolute inset-0 rounded-full border border-slate-700/60 animate-[spin_100s_linear_infinite]">
          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-emerald-400/80">000°</span>
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-500">180°</span>
          <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] font-mono text-slate-500">270°</span>
          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-mono text-slate-500">090°</span>

          {/* Orbiting Satellite Particle */}
          <div className="absolute top-[12%] left-[82%] h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
        </div>

        {/* Concentric Middle Ring (Dashed, Counter-rotating) */}
        <div
          className="absolute inset-8 rounded-full border border-dashed border-emerald-500/30 animate-[spin_70s_linear_infinite_reverse]"
          style={{ strokeDasharray: '5 6' }}
        />

        {/* Inner Hairline Ring */}
        <div className="absolute inset-16 rounded-full border border-slate-700/70" />

        {/* Constellation Link Vector Lines between Provinces */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 288 288">
          <line x1="160" y1="100" x2="105" y2="185" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="160" y1="100" x2="140" y2="145" stroke="rgba(16, 185, 129, 0.35)" strokeWidth="1" />
          <line x1="140" y1="145" x2="105" y2="185" stroke="rgba(16, 185, 129, 0.35)" strokeWidth="1" />
          <line x1="160" y1="100" x2="215" y2="135" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="105" y1="185" x2="60" y2="90" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
        </svg>

        {/* Commercial Node 1: Harare Province */}
        <div className="absolute top-[34%] right-[32%] flex flex-col items-center">
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[9px] font-mono font-medium text-emerald-300 mt-0.5">Harare</span>
        </div>

        {/* Commercial Node 2: Bulawayo Metro */}
        <div className="absolute bottom-[28%] left-[28%] flex flex-col items-center">
          <div className="h-2 w-2 rounded-full bg-slate-300 shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
          <span className="text-[9px] font-mono text-slate-400 mt-0.5">Bulawayo</span>
        </div>

        {/* Commercial Node 3: Victoria Falls */}
        <div className="absolute top-[30%] left-[18%] flex flex-col items-center">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          <span className="text-[8px] font-mono text-slate-400">Vic Falls</span>
        </div>

        {/* Commercial Node 4: Mutare */}
        <div className="absolute top-[46%] right-[14%] flex flex-col items-center">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          <span className="text-[8px] font-mono text-slate-400">Mutare</span>
        </div>

        {/* Center Node: New Member Joining (Pulse Effect) */}
        <div className="relative z-10 flex flex-col items-center justify-center p-3.5 rounded-full bg-slate-900/90 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <Building2 className="h-4.5 w-4.5" />
          </div>
          <span className="text-[10px] font-bold text-white mt-1">Join Network</span>
          <span className="text-[8px] font-mono text-emerald-400">ZW-PORTAL</span>
        </div>
      </div>

      {/* 2. Live Registration Ticker (Dynamic Social Proof & Motion) */}
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 shadow-sm backdrop-blur-md transition-all duration-300">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold uppercase tracking-wider text-[10px]">Live Directory Activity</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{activeEntry.time}</span>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate">{activeEntry.name}</div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
                {activeEntry.hub}
              </span>
              <span>•</span>
              <span className="text-emerald-300 font-mono text-[10px] shrink-0">{activeEntry.tier}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Platform Growth Counter Strip */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2">
          <div className="font-mono text-sm font-bold text-white">5,240+</div>
          <div className="text-[10px] text-slate-400">Enterprises</div>
        </div>
        <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2">
          <div className="font-mono text-sm font-bold text-emerald-400">10 / 10</div>
          <div className="text-[10px] text-slate-400">Provinces</div>
        </div>
        <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2">
          <div className="font-mono text-sm font-bold text-amber-400">CR14</div>
          <div className="text-[10px] text-slate-400">Verified</div>
        </div>
      </div>
    </div>
  );
}
