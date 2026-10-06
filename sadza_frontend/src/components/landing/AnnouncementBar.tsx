'use client';

import { useState } from 'react';
import { Sparkles, Phone, ArrowRight, X } from 'lucide-react';

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      aria-label="National announcement and exchange rate bar"
      className="relative z-50 w-full border-b border-brand-800/40 bg-gradient-to-r from-brand-950 via-ink-950 to-brand-950 px-4 py-2 text-xs text-white"
    >
      <div className="container-x flex items-center justify-between gap-3">
        {/* Left: Multilingual Greeting */}
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="flex h-5 items-center gap-1.5 rounded-full bg-brand-500/20 px-2 text-[10px] font-bold uppercase tracking-wider text-brand-300 border border-brand-500/30">
            <Sparkles className="h-3 w-3 text-gold-400" />
            <span>National Directory</span>
          </span>
          <p className="hidden md:inline font-medium text-ink-200">
            <span className="text-white font-bold">Titambire</span> (Shona) •{' '}
            <span className="text-white font-bold">Samukele</span> (Ndebele) • Welcome to Zimbabwe’s Commercial Network
          </p>
          <p className="md:hidden font-medium text-ink-200 text-[11px] truncate">
            Titambire • Samukele • Welcome to Sadza Connect
          </p>
        </div>

        {/* Right: Currency Indicator & WhatsApp Support */}
        <div className="flex items-center gap-4 shrink-0 text-[11px]">
          <div className="hidden lg:flex items-center gap-2 rounded-md bg-white/10 px-2 py-0.5 text-gold-300 font-mono">
            <span>Dual-Currency:</span>
            <span className="text-white font-bold">USD / ZiG Supported</span>
          </div>

          <a
            href="https://wa.me/263771234567?text=Hello%20Sadza%20Connect%20Support"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-semibold text-brand-300 hover:text-white transition-colors"
          >
            <Phone className="h-3 w-3 text-brand-400" />
            <span className="hidden sm:inline">WhatsApp Help:</span>
            <span>+263 77 123 4567</span>
          </a>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="text-ink-400 hover:text-white transition-colors ml-1 p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
