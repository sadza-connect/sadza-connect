'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Tv,
  Droplets,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  CreditCard,
  Banknote,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function BillPaySection() {
  const [selectedUtility, setSelectedUtility] = useState<'zesa' | 'dstv' | 'water'>('zesa');
  const [meterNumber, setMeterNumber] = useState('0419 8821 9032');
  const [amount, setAmount] = useState('20');
  const [currency, setCurrency] = useState<'USD' | 'ZiG'>('USD');
  const [isSimulating, setIsSimulating] = useState(false);
  const [tokenGenerated, setTokenGenerated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setTokenGenerated('4821 - 9901 - 3314 - 8820 - 7129');
    }, 900);
  };

  const copyToken = () => {
    if (!tokenGenerated) return;
    navigator.clipboard.writeText(tokenGenerated.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="bill-pay" className="py-20 bg-ink-50/50 dark:bg-ink-900/30 border-y border-ink-200 dark:border-ink-800/80 transition-colors">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-950 via-ink-950 to-brand-950 p-8 sm:p-12 text-white shadow-2xl border border-brand-800/40">
          {/* Subtle glow circles */}
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-gold-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Information */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-gold-300 backdrop-blur-sm border border-white/15">
                <Zap className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                <span>Instant Utility Settlements in USD & ZiG</span>
              </div>

              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Recharge ZESA, DSTV & Water in Under 60 Seconds
              </h2>

              <p className="text-sm sm:text-base text-ink-300 max-w-xl leading-relaxed">
                Receive your official 20-digit prepaid electricity token directly on screen
                and via WhatsApp. Settle local municipal water rates or renew digital satellite TV
                using whichever currency you hold.
              </p>

              {/* Trust assurances */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-ink-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Direct ZETDC Gateway</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Instant WhatsApp Receipt</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Zero Transaction Delays</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>All 10 Provinces Covered</span>
                </div>
              </div>

              {/* Payment methods supported */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs font-bold uppercase tracking-wider text-gold-300/90 mb-2.5">
                  Accepted Payment Channels
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white border border-white/10">
                    EcoCash USD
                  </span>
                  <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white border border-white/10">
                    EcoCash ZiG
                  </span>
                  <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white border border-white/10">
                    InnBucks
                  </span>
                  <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white border border-white/10">
                    Zipit / Bank Transfer
                  </span>
                  <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white border border-white/10">
                    Cash USD
                  </span>
                </div>
                <div className="pt-3">
                  <Link
                    href="/bill-payments"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-300 hover:text-white transition-colors"
                  >
                    <span>Open Dedicated Utilities & Token Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Interactive Utility Token Console */}
            <div className="lg:col-span-6 rounded-2xl bg-white/10 dark:bg-ink-900/80 border border-white/15 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
              {/* Utility Type Switcher */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-black/30 border border-white/10 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUtility('zesa');
                    setTokenGenerated(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    selectedUtility === 'zesa'
                      ? 'bg-gold-500 text-ink-950 shadow-md'
                      : 'text-ink-300 hover:text-white'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 fill-current" />
                  <span>ZESA Token</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedUtility('dstv');
                    setTokenGenerated(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    selectedUtility === 'dstv'
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'text-ink-300 hover:text-white'
                  }`}
                >
                  <Tv className="h-3.5 w-3.5" />
                  <span>DSTV Sub</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedUtility('water');
                    setTokenGenerated(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    selectedUtility === 'water'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-ink-300 hover:text-white'
                  }`}
                >
                  <Droplets className="h-3.5 w-3.5" />
                  <span>Council Water</span>
                </button>
              </div>

              {/* Form Simulator */}
              <form onSubmit={handleSimulate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-300 mb-1.5">
                    {selectedUtility === 'zesa'
                      ? 'ZETDC Meter / Account Number'
                      : selectedUtility === 'dstv'
                      ? 'DSTV Smartcard / IUC Number'
                      : 'Council Water Account Number'}
                  </label>
                  <input
                    type="text"
                    required
                    value={meterNumber}
                    onChange={(e) => setMeterNumber(e.target.value)}
                    className="w-full rounded-xl bg-black/40 border border-white/20 py-2.5 px-4 text-sm text-white font-mono placeholder:text-ink-500 focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-300 mb-1.5">
                      Amount
                    </label>
                    <div className="flex items-center rounded-xl bg-black/40 border border-white/20 px-3">
                      <span className="text-xs font-bold text-gold-400 mr-2">
                        {currency === 'USD' ? '$' : 'ZiG'}
                      </span>
                      <input
                        type="number"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-transparent py-2.5 text-sm text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-300 mb-1.5">
                      Currency
                    </label>
                    <div className="flex rounded-xl bg-black/40 p-1 border border-white/20">
                      <button
                        type="button"
                        onClick={() => setCurrency('USD')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          currency === 'USD' ? 'bg-gold-500 text-ink-950' : 'text-ink-300'
                        }`}
                      >
                        USD ($)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrency('ZiG')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          currency === 'ZiG' ? 'bg-gold-500 text-ink-950' : 'text-ink-300'
                        }`}
                      >
                        ZiG
                      </button>
                    </div>
                  </div>
                </div>

                {/* Amount Quick Select Pills */}
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="text-ink-400 text-[11px]">Quick Amounts:</span>
                  {['10', '20', '50', '100'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold transition-colors ${
                        amount === val
                          ? 'border-gold-400 bg-gold-400/20 text-gold-300'
                          : 'border-white/10 bg-white/5 text-ink-300 hover:text-white'
                      }`}
                    >
                      {currency === 'USD' ? `$${val}` : `${Number(val) * 26} ZiG`}
                    </button>
                  ))}
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="md"
                  fullWidth
                  loading={isSimulating}
                  className="mt-2"
                >
                  <Zap className="h-4 w-4" />
                  <span>Generate Instant 20-Digit Token</span>
                </Button>
              </form>

              {/* Instant Token Receipt Simulation Card */}
              {tokenGenerated && (
                <div className="mt-5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 p-4 text-emerald-200 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-emerald-500/30">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Token Successfully Generated</span>
                    </span>
                    <span className="text-[11px] text-emerald-300 font-mono">142.5 kWh Units</span>
                  </div>

                  <div className="my-3 text-center">
                    <div className="font-mono text-base sm:text-lg font-black tracking-wider text-white bg-black/40 py-2.5 px-3 rounded-xl border border-emerald-500/40 select-all">
                      {tokenGenerated}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={copyToken}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white transition-colors"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? 'Copied to Clipboard!' : 'Copy Token'}</span>
                    </button>

                    <a
                      href={`https://wa.me/?text=My%20ZESA%20Token:%20${encodeURIComponent(tokenGenerated)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-gold-400 hover:text-white transition-colors"
                    >
                      Forward to WhatsApp →
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
