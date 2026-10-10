'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  Droplets,
  Tv,
  CheckCircle2,
  Copy,
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import {
  getPlatformSettings,
  getStoredUtilityReceipts,
  saveStoredUtilityReceipts,
  UtilityReceipt,
} from '@/data/platformStore';

export default function BillPaymentsPage() {
  const [activeTab, setActiveTab] = useState<'zesa' | 'water' | 'dstv'>('zesa');
  const [usdToZig, setUsdToZig] = useState<number>(26.5);
  const [receipts, setReceipts] = useState<UtilityReceipt[]>([]);

  // ZESA State
  const [meterNumber, setMeterNumber] = useState('37148920194');
  const [currency, setCurrency] = useState<'USD' | 'ZiG'>('USD');
  const [amount, setAmount] = useState('20');
  const [phone, setPhone] = useState('+263772123456');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tokenResult, setTokenResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Water State
  const [council, setCouncil] = useState('Harare Municipal Water');
  const [accountNumber, setAccountNumber] = useState('ACC-883921');
  const [waterAmount, setWaterAmount] = useState('15');
  const [waterSuccess, setWaterSuccess] = useState(false);

  // DSTV State
  const [smartcard, setSmartcard] = useState('1029384756');
  const [packageType, setPackageType] = useState('DStv Compact ($39/mo)');
  const [dstvSuccess, setDstvSuccess] = useState(false);

  useEffect(() => {
    setUsdToZig(getPlatformSettings().usdToZigRate);
    setReceipts(getStoredUtilityReceipts());
    const sync = () => {
      setUsdToZig(getPlatformSettings().usdToZigRate);
      setReceipts(getStoredUtilityReceipts());
    };
    window.addEventListener('sadza-platform-updated', sync);
    return () => window.removeEventListener('sadza-platform-updated', sync);
  }, []);

  const calculatedKwh =
    currency === 'USD'
      ? (parseFloat(amount || '0') * 6.2).toFixed(1)
      : ((parseFloat(amount || '0') / usdToZig) * 6.2).toFixed(1);

  const handleGenerateToken = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      const seg1 = Math.floor(1000 + Math.random() * 9000);
      const seg2 = Math.floor(1000 + Math.random() * 9000);
      const seg3 = Math.floor(1000 + Math.random() * 9000);
      const seg4 = Math.floor(1000 + Math.random() * 9000);
      const seg5 = Math.floor(1000 + Math.random() * 9000);
      const token = `${seg1} ${seg2} ${seg3} ${seg4} ${seg5}`;
      setTokenResult(token);
      setIsGenerating(false);

      const newRec: UtilityReceipt = {
        id: `ut-${Date.now()}`,
        reference: `ZETDC-${Math.floor(100000 + Math.random() * 900000)}`,
        service: 'ZESA Prepaid Token',
        accountOrMeter: meterNumber,
        customerPhone: phone,
        currency,
        amount: parseFloat(amount || '0'),
        tokenOrConfirmation: token,
        unitsOrPackage: `${calculatedKwh} kWh`,
        date: 'Just now',
        status: 'Completed',
      };
      const updated = [newRec, ...getStoredUtilityReceipts()];
      setReceipts(updated);
      saveStoredUtilityReceipts(updated);
    }, 800);
  };

  const handlePayWater = (e: React.FormEvent) => {
    e.preventDefault();
    const newRec: UtilityReceipt = {
      id: `ut-${Date.now()}`,
      reference: `MUN-${Math.floor(100000 + Math.random() * 900000)}`,
      service: 'Municipal Water',
      accountOrMeter: `${accountNumber} (${council})`,
      customerPhone: phone,
      currency: 'USD',
      amount: parseFloat(waterAmount || '0'),
      tokenOrConfirmation: `WATER-REC-${accountNumber}`,
      unitsOrPackage: 'Municipal Water & Rates Settlement',
      date: 'Just now',
      status: 'Completed',
    };
    const updated = [newRec, ...getStoredUtilityReceipts()];
    setReceipts(updated);
    saveStoredUtilityReceipts(updated);
    setWaterSuccess(true);
  };

  const handlePayDstv = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = packageType.includes('19')
      ? 19
      : packageType.includes('39')
      ? 39
      : packageType.includes('55')
      ? 55
      : 82;
    const newRec: UtilityReceipt = {
      id: `ut-${Date.now()}`,
      reference: `DSTV-${Math.floor(100000 + Math.random() * 900000)}`,
      service: 'DStv Subscription',
      accountOrMeter: smartcard,
      customerPhone: phone,
      currency: 'USD',
      amount: amt,
      tokenOrConfirmation: 'DSTV-BOUQUET-RENEWED',
      unitsOrPackage: packageType,
      date: 'Just now',
      status: 'Completed',
    };
    const updated = [newRec, ...getStoredUtilityReceipts()];
    setReceipts(updated);
    saveStoredUtilityReceipts(updated);
    setDstvSuccess(true);
  };

  const copyToClipboard = () => {
    if (tokenResult) {
      navigator.clipboard.writeText(tokenResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
                <Zap className="w-3.5 h-3.5" />
                <span>National Utility Settlements</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                ZESA Tokens, Municipal Water & Bill Payments
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
                Purchase 20-digit ZETDC prepaid electricity tokens, settle municipal water rates, and renew DStv subscriptions in USD or ZiG. All receipts are saved automatically.
              </p>
            </div>

            <Link
              href="/dashboard/user?tab=utilities"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:border-emerald-500 shrink-0"
            >
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>View Saved Meters & Receipts ({receipts.length})</span>
            </Link>
          </div>

          {/* Service Tabs */}
          <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 mb-8 gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('zesa')}
              className={`pb-3.5 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'zesa'
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ZESA Prepaid Electricity (ZETDC)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('water')}
              className={`pb-3.5 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'water'
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Droplets className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Municipal Water & Council Rates</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dstv')}
              className={`pb-3.5 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'dstv'
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Tv className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>DStv Bouquet Renewals</span>
            </button>
          </div>

          {/* Tab 1: ZESA */}
          {activeTab === 'zesa' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1.5">
                  Buy Prepaid Electricity Token (ZETDC)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mb-6">
                  Enter your 11-digit or 12-digit ZETDC prepaid meter number to generate an instant recharge voucher.
                </p>

                <form onSubmit={handleGenerateToken} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      ZETDC Prepaid Meter Number
                    </label>
                    <input
                      type="text"
                      required
                      value={meterNumber}
                      onChange={(e) => setMeterNumber(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Settlement Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as 'USD' | 'ZiG')}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-medium"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="ZiG">ZiG (1 USD = {usdToZig} ZiG)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Purchase Amount ({currency})
                      </label>
                      <input
                        type="number"
                        min="5"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      SMS / WhatsApp Receipt Number (+263)
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">
                      Estimated Energy Allocation:
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      ≈ {calculatedKwh} kWh
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors cursor-pointer"
                  >
                    {isGenerating
                      ? 'Generating 20-Digit Token...'
                      : 'Purchase & Generate 20-Digit Token'}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Official Token Voucher</span>
                  </h3>

                  {tokenResult ? (
                    <div className="p-5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-4">
                      <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        <span>STATUS: SETTLED</span>
                        <span>METER #{meterNumber}</span>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">
                          20-Digit Prepaid Recharge Token:
                        </div>
                        <div className="mt-1 font-mono text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-wider">
                          {tokenResult}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          Units: {calculatedKwh} kWh
                        </span>
                        <button
                          type="button"
                          onClick={copyToClipboard}
                          className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copied ? 'Copied!' : 'Copy Token'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4">
                      <Zap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm text-slate-500">
                        Submit your meter number and purchase amount on the left to generate your 20-digit token voucher.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Municipal Water */}
          {activeTab === 'water' && (
            <div className="max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                Municipal Water & Council Rates Settlement
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-6">
                Settle monthly water and property rate accounts across major municipal authorities.
              </p>

              {waterSuccess ? (
                <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Municipal Payment Recorded
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    USD ${waterAmount} credited to account {accountNumber} ({council}).
                  </p>
                  <button
                    type="button"
                    onClick={() => setWaterSuccess(false)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
                  >
                    Make Another Payment
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePayWater} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Local Authority / Municipality
                    </label>
                    <select
                      value={council}
                      onChange={(e) => setCouncil(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
                    >
                      <option>Harare Municipal Water</option>
                      <option>Bulawayo Municipal Water</option>
                      <option>Midlands Municipal Authority</option>
                      <option>Manicaland Municipal Authority</option>
                      <option>Masvingo Municipal Authority</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Municipal Account Number
                    </label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Amount (USD)
                    </label>
                    <input
                      type="number"
                      min="5"
                      required
                      value={waterAmount}
                      onChange={(e) => setWaterAmount(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm cursor-pointer"
                  >
                    Settle Municipal Account
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Tab 3: DStv */}
          {activeTab === 'dstv' && (
            <div className="max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                DStv Bouquet Subscription Renewal
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-6">
                Instant reconnection and monthly renewal for residential and commercial hospitality decoders.
              </p>

              {dstvSuccess ? (
                <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    DStv Subscription Renewed
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    Smartcard #{smartcard} activated on {packageType}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setDstvSuccess(false)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
                  >
                    Renew Another Smartcard
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePayDstv} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      10-Digit Smartcard / IUC Number
                    </label>
                    <input
                      type="text"
                      required
                      value={smartcard}
                      onChange={(e) => setSmartcard(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Select Bouquet Package
                    </label>
                    <select
                      value={packageType}
                      onChange={(e) => setPackageType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
                    >
                      <option>DStv Family ($19/mo)</option>
                      <option>DStv Compact ($39/mo)</option>
                      <option>DStv Compact Plus ($55/mo)</option>
                      <option>DStv Premium ($82/mo)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm cursor-pointer"
                  >
                    Complete DStv Renewal
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
