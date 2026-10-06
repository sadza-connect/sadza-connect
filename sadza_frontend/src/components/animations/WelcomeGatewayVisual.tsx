'use client';

import React, { useState } from 'react';
import { ShieldCheck, KeyRound, ArrowRight, CheckCircle2, Building2, Bell } from 'lucide-react';

export function WelcomeGatewayVisual() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative w-full max-w-md mx-auto my-6 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Concentric Welcome Portal Circle (The Gateway) */}
      <div className="relative mx-auto h-64 w-64 sm:h-72 sm:w-72 flex items-center justify-center">
        {/* Warm ambient radial aura */}
        <div
          className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-700 ${
            isHovered ? 'opacity-80' : 'opacity-60'
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, rgba(246, 172, 2, 0.12) 40%, transparent 70%)',
          }}
        />

        {/* Outer Coordinate Ring (Rotating slowly) */}
        <div className="absolute inset-0 rounded-full border border-slate-700/60 animate-[spin_110s_linear_infinite]">
          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-emerald-400">000°</span>
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-500">180°</span>
          <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] font-mono text-slate-500">270°</span>
          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-mono text-slate-500">090°</span>

          {/* Luminous beacon particle orbiting */}
          <div className="absolute top-[15%] left-[80%] h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#10b981]" />
        </div>

        {/* Middle Dashed Ring (Counter-rotating) */}
        <div
          className="absolute inset-8 rounded-full border border-dashed border-emerald-500/30 animate-[spin_80s_linear_infinite_reverse]"
          style={{ strokeDasharray: '6 6' }}
        />

        {/* Inner Hairline Ring */}
        <div className="absolute inset-16 rounded-full border border-slate-700/80" />

        {/* Center Gateway Core (Welcoming Key & Shield) */}
        <div className="relative z-10 flex flex-col items-center justify-center p-4 rounded-full bg-slate-900/90 border border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-transform duration-300 hover:scale-105">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>
          <span className="text-[11px] font-bold text-white mt-1.5">Trade Gateway</span>
          <span className="text-[8px] font-mono text-emerald-400">AUTHENTICATED</span>
        </div>
      </div>

      {/* 2. Warm Welcome Card (Recognizing returning partner) */}
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-slate-700">
        <div className="flex items-center justify-between text-[11px] mb-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Merchant Session</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">ZW-HRE-01</span>
        </div>

        <div className="text-sm font-semibold text-white">
          Titambire • Samukele • Welcome Back
        </div>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Your verified listings, client inquiries, and commercial dashboard are ready for you.
        </p>

        {/* Quick status bullets */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Verified company badge active</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Direct WhatsApp inquiries enabled</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>10 Provincial commercial nodes online</span>
          </div>
        </div>
      </div>

      {/* 3. Quick System Footnote */}
      <div className="mt-3 flex items-center justify-between px-1 text-[11px] text-slate-400 font-mono">
        <span>SECURITY: ENCRYPTED TLS 1.3</span>
        <span>HARARE · BULAWAYO · GWERU</span>
      </div>
    </div>
  );
}
