'use client';

import { useState } from 'react';
import {
  Zap,
  Droplets,
  Tv,
  CheckCircle2,
  Copy,
  Receipt,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/Button';
import { DEFAULT_USD_TO_ZIG_RATE } from '@/lib/utils/currency';

export default function BillPaymentsPage() {
  const [activeTab, setActiveTab] = useState<'zesa' | 'water' | 'dstv'>('zesa');

  // ZESA State
  const [meterNumber, setMeterNumber] = useState('37148920194');
  const [currency, setCurrency] = useState<'USD' | 'ZiG'>('USD');
  const [amount, setAmount] = useState('20');
  const [phone, setPhone] = useState('0772123456');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tokenResult, setTokenResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Water State
  const [council, setCouncil] = useState('Harare City Council');
  const [accountNumber, setAccountNumber] = useState('ACC-883921');
  const [waterAmount, setWaterAmount] = useState('15');
  const [waterSuccess, setWaterSuccess] = useState(false);

  // DSTV State
  const [smartcard, setSmartcard] = useState('1029384756');
  const [packageType, setPackageType] = useState('DStv Compact ($39/mo)');
  const [dstvSuccess, setDstvSuccess] = useState(false);

  const handleGenerateToken = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      // Generate realistic 20-digit token
      const seg1 = Math.floor(1000 + Math.random() * 9000);
      const seg2 = Math.floor(1000 + Math.random() * 9000);
      const seg3 = Math.floor(1000 + Math.random() * 9000);
      const seg4 = Math.floor(1000 + Math.random() * 9000);
      const seg5 = Math.floor(1000 + Math.random() * 9000);
      setTokenResult(`${seg1} ${seg2} ${seg3} ${seg4} ${seg5}`);
      setIsGenerating(false);
    }, 1200);
  };

  const copyToClipboard = () => {
    if (tokenResult) {
      navigator.clipboard.writeText(tokenResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const calculatedKwh =
    currency === 'USD'
      ? (parseFloat(amount || '0') * 6.2).toFixed(1)
      : ((parseFloat(amount || '0') / DEFAULT_USD_TO_ZIG_RATE) * 6.2).toFixed(1);

  return (
    <div className="min-h-screen bg-white dark:bg-ink-950 text-ink-950 dark:text-ink-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="container-x">
          {/* Header */}
          <div className="max-w-3xl mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-50 dark:bg-gold-950/60 text-gold-700 dark:text-gold-300 border border-gold-200 dark:border-gold-800 mb-3">
              <Zap className="w-3.5 h-3.5 text-gold-500" />
              Utility Settlements
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-950 dark:text-white">
              Zimbabwe Bill Payments & Token Engine
            </h1>
            <p className="mt-2 text-base text-ink-600 dark:text-ink-300">
              Instant settlement for ZESA prepaid electricity tokens, city council water rates, and DSTV renewals via EcoCash, InnBucks, and Zipit.
            </p>
          </div>

          {/* Service Tabs */}
          <div className="flex border-b border-ink-200 dark:border-ink-800 mb-8 gap-4 sm:gap-8">
            <button
              type="button"
              onClick={() => setActiveTab('zesa')}
              className={`pb-3 font-bold text-sm sm:text-base flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'zesa'
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-ink-500 hover:text-ink-800 dark:hover:text-ink-200'
              }`}
            >
              <Zap className="w-4 h-4 text-gold-500" />
              <span>ZESA Electricity Tokens</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('water')}
              className={`pb-3 font-bold text-sm sm:text-base flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'water'
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-ink-500 hover:text-ink-800 dark:hover:text-ink-200'
              }`}
            >
              <Droplets className="w-4 h-4 text-blue-500" />
              <span>Municipal Water Rates</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dstv')}
              className={`pb-3 font-bold text-sm sm:text-base flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'dstv'
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-ink-500 hover:text-ink-800 dark:hover:text-ink-200'
              }`}
            >
              <Tv className="w-4 h-4 text-purple-500" />
              <span>DStv Renewals</span>
            </button>
          </div>

          {/* Tab 1: ZESA Token Generator */}
          {activeTab === 'zesa' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-ink-950 dark:text-white mb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-gold-500" />
                  <span>Buy Prepaid Electricity (ZETDC)</span>
                </h2>
                <p className="text-xs text-ink-500 mb-6">
                  Enter your 11-digit or 12-digit ZETDC prepaid meter number to generate an instant token.
                </p>

                <form onSubmit={handleGenerateToken} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                      ZETDC Meter Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 37148920194"
                      value={meterNumber}
                      onChange={(e) => setMeterNumber(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                        Settlement Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as 'USD' | 'ZiG')}
                        className="w-full px-3 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="ZiG">ZiG (Zimbabwe Gold)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                        Purchase Amount ({currency})
                      </label>
                      <input
                        type="number"
                        min="5"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                      Notification WhatsApp / SMS (+263)
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-ink-50 dark:bg-ink-950/80 border border-ink-100 dark:border-ink-800 text-xs flex justify-between items-center">
                    <span className="text-ink-500">Estimated Power Units:</span>
                    <span className="font-extrabold text-brand-600 dark:text-brand-400">
                      ≈ {calculatedKwh} kWh
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-current text-gold-400" />
                    <span>{isGenerating ? 'Generating Official Token...' : 'Generate 20-Digit Token'}</span>
                  </button>
                </form>
              </div>

              {/* Output Token Receipt */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 sm:p-8">
                  <h3 className="text-base font-bold text-ink-950 dark:text-white mb-4 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-brand-600" />
                    <span>Official ZETDC Voucher Simulation</span>
                  </h3>

                  {tokenResult ? (
                    <div className="p-5 rounded-2xl bg-brand-50/70 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/80 space-y-4 animate-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between text-xs text-brand-800 dark:text-brand-300">
                        <span className="font-bold">STATUS: COMPLETED</span>
                        <span>ZETDC METER #{meterNumber}</span>
                      </div>

                      <div>
                        <div className="text-[11px] font-semibold text-ink-500 uppercase">Prepaid Recharge Token:</div>
                        <div className="mt-1 font-mono text-lg sm:text-xl font-black text-brand-700 dark:text-brand-300 tracking-wider">
                          {tokenResult}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-brand-200 dark:border-brand-800/60 text-xs">
                        <span className="text-ink-600 dark:text-ink-400">Units: {calculatedKwh} kWh</span>
                        <button
                          type="button"
                          onClick={copyToClipboard}
                          className="inline-flex items-center gap-1 font-bold text-brand-700 dark:text-brand-400 hover:underline"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copied ? 'Copied!' : 'Copy Token'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-ink-400 space-y-2">
                      <Zap className="w-8 h-8 text-gold-500/50 mx-auto" />
                      <div>Fill in the meter number and click generate to test real-time voucher issuance.</div>
                    </div>
                  )}

                  {/* Payment rail logos */}
                  <div className="mt-6 pt-4 border-t border-ink-100 dark:border-ink-800">
                    <div className="text-[11px] font-bold text-ink-400 uppercase tracking-wider mb-2">
                      Supported Zimbabwean Settlement Rails
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-ink-700 dark:text-ink-300">
                      <span className="px-2.5 py-1 rounded-lg bg-ink-100 dark:bg-ink-800">EcoCash USD</span>
                      <span className="px-2.5 py-1 rounded-lg bg-ink-100 dark:bg-ink-800">EcoCash ZiG</span>
                      <span className="px-2.5 py-1 rounded-lg bg-ink-100 dark:bg-ink-800">InnBucks</span>
                      <span className="px-2.5 py-1 rounded-lg bg-ink-100 dark:bg-ink-800">Zipit</span>
                      <span className="px-2.5 py-1 rounded-lg bg-ink-100 dark:bg-ink-800">Cash USD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Municipal Water */}
          {activeTab === 'water' && (
            <div className="max-w-xl mx-auto rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-ink-950 dark:text-white mb-2 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span>Municipal Water Rates & Council Bills</span>
              </h2>
              <p className="text-xs text-ink-500 mb-6">
                Settle municipal utility rates directly to verified city council billing accounts.
              </p>

              {waterSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-brand-600 mx-auto" />
                  <h3 className="text-lg font-bold">Payment Dispatched!</h3>
                  <p className="text-xs text-ink-500">
                    Receipt voucher #ZW-WTR-{Math.floor(10000 + Math.random() * 90000)} issued to {council}.
                  </p>
                  <Button variant="secondary" onClick={() => setWaterSuccess(false)}>
                    New Settlement
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setWaterSuccess(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                      Local Council / Municipality
                    </label>
                    <select
                      value={council}
                      onChange={(e) => setCouncil(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option>Harare City Council</option>
                      <option>City of Bulawayo</option>
                      <option>City of Gweru</option>
                      <option>City of Mutare</option>
                      <option>Masvingo City Council</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                      Council Account Number
                    </label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                      Payment Amount (USD)
                    </label>
                    <input
                      type="number"
                      required
                      value={waterAmount}
                      onChange={(e) => setWaterAmount(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-colors"
                  >
                    Pay Municipal Rate
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Tab 3: DSTV */}
          {activeTab === 'dstv' && (
            <div className="max-w-xl mx-auto rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-ink-950 dark:text-white mb-2 flex items-center gap-2">
                <Tv className="w-5 h-5 text-purple-500" />
                <span>DStv Zimbabwe Subscription Renewal</span>
              </h2>
              <p className="text-xs text-ink-500 mb-6">
                Instant clearance on MultiChoice DStv Zimbabwe decoders.
              </p>

              {dstvSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-brand-600 mx-auto" />
                  <h3 className="text-lg font-bold">Subscription Activated!</h3>
                  <p className="text-xs text-ink-500">
                    Smartcard #{smartcard} renewed with {packageType}. Signal active immediately.
                  </p>
                  <Button variant="secondary" onClick={() => setDstvSuccess(false)}>
                    Renew Another
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setDstvSuccess(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                      Decoder Smartcard Number
                    </label>
                    <input
                      type="text"
                      required
                      value={smartcard}
                      onChange={(e) => setSmartcard(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                      Bouquet / Package
                    </label>
                    <select
                      value={packageType}
                      onChange={(e) => setPackageType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option>DStv Premium ($85/mo)</option>
                      <option>DStv Compact Plus ($55/mo)</option>
                      <option>DStv Compact ($39/mo)</option>
                      <option>DStv Family ($22/mo)</option>
                      <option>DStv Access ($13/mo)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-colors"
                  >
                    Renew Subscription Now
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
