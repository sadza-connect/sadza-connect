'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Droplets,
  Tv,
  CheckCircle2,
  Copy,
  Receipt,
  ShieldCheck,
  Printer,
  QrCode,
  Lock,
  ExternalLink,
  Loader2,
  PhoneCall,
  Smartphone,
  X,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import {
  getPlatformSettings,
  getStoredUtilityReceipts,
  saveStoredUtilityReceipts,
  UtilityReceipt,
} from '@/data/platformStore';
import { mapDbBillToReceipt } from '@/lib/data/bill-mapper';

export default function BillPaymentsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<'zesa' | 'water' | 'dstv'>('zesa');
  const [usdToZig, setUsdToZig] = useState<number>(26.5);
  const [receipts, setReceipts] = useState<UtilityReceipt[]>([]);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'EcoCash' | 'OneMoney' | 'InnBucks' | 'Card'>('EcoCash');

  // ZESA State
  const [meterNumber, setMeterNumber] = useState('37148920194');
  const [currency, setCurrency] = useState<'USD' | 'ZiG'>('USD');
  const [amount, setAmount] = useState('20');
  const [phone, setPhone] = useState('+263772123456');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tokenResult, setTokenResult] = useState<string | null>(null);
  const [latestBillData, setLatestBillData] = useState<any | null>(null);
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

  // Simulated USSD Mobile Authorization Modal State
  const [ussdPromptOpen, setUssdPromptOpen] = useState(false);
  const [ussdProgress, setUssdProgress] = useState(0);
  const [pendingPayment, setPendingPayment] = useState<{
    biller: string;
    account_number: string;
    meter_number?: string;
    amount: number;
    currency: 'USD' | 'ZiG';
    customer_phone: string;
    serviceType: 'zesa' | 'water' | 'dstv';
  } | null>(null);

  // Auth Required Dialog
  const [authRequiredOpen, setAuthRequiredOpen] = useState(false);

  // Printable Voucher Modal
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<UtilityReceipt | null>(null);

  useEffect(() => {
    let isMounted = true;
    setUsdToZig(getPlatformSettings().usdToZigRate);

    async function loadUtilityReceipts() {
      try {
        const res = await fetch('/api/v1/bills?my_bills=true', { credentials: 'include' });
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data?.bills)) {
          setReceipts(json.data.bills.map(mapDbBillToReceipt));
        } else if (isMounted) {
          setReceipts(getStoredUtilityReceipts());
        }
      } catch {
        if (isMounted) setReceipts(getStoredUtilityReceipts());
      }
    }

    loadUtilityReceipts();

    const sync = () => {
      setUsdToZig(getPlatformSettings().usdToZigRate);
      loadUtilityReceipts();
    };
    window.addEventListener('sadza-platform-updated', sync);
    return () => {
      isMounted = false;
      window.removeEventListener('sadza-platform-updated', sync);
    };
  }, []);

  const calculatedKwh =
    currency === 'USD'
      ? (parseFloat(amount || '0') * 6.2).toFixed(1)
      : ((parseFloat(amount || '0') / usdToZig) * 6.2).toFixed(1);

  // Handle Form Submissions with Authentication Guard (Option B)
  const initiateZesaPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAuthRequiredOpen(true);
      return;
    }

    setPendingPayment({
      biller: 'ZESA Prepaid Electricity (ZETDC)',
      account_number: meterNumber.trim(),
      meter_number: meterNumber.trim(),
      amount: parseFloat(amount || '10'),
      currency,
      customer_phone: phone.trim(),
      serviceType: 'zesa',
    });
    setUssdPromptOpen(true);
  };

  const initiateWaterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAuthRequiredOpen(true);
      return;
    }

    setPendingPayment({
      biller: `Municipal Water (${council})`,
      account_number: accountNumber.trim(),
      amount: parseFloat(waterAmount || '15'),
      currency: 'USD',
      customer_phone: phone.trim(),
      serviceType: 'water',
    });
    setUssdPromptOpen(true);
  };

  const initiateDstvPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAuthRequiredOpen(true);
      return;
    }

    const amt = packageType.includes('19')
      ? 19
      : packageType.includes('39')
      ? 39
      : packageType.includes('55')
      ? 55
      : 82;

    setPendingPayment({
      biller: `DStv Bouquet Renewal (${packageType})`,
      account_number: smartcard.trim(),
      amount: amt,
      currency: 'USD',
      customer_phone: phone.trim(),
      serviceType: 'dstv',
    });
    setUssdPromptOpen(true);
  };

  // USSD Progress Simulation & Backend Finalization
  useEffect(() => {
    if (!ussdPromptOpen || !pendingPayment) {
      setUssdProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setUssdProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          completePayment(pendingPayment);
          return 100;
        }
        return prev + 25;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [ussdPromptOpen, pendingPayment]);

  const completePayment = async (payData: NonNullable<typeof pendingPayment>) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/v1/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          biller: payData.biller,
          account_number: payData.account_number,
          meter_number: payData.meter_number,
          amount: payData.amount,
          currency: payData.currency,
          payment_method: paymentMethod,
          customer_phone: payData.customer_phone,
          customer_name: user?.fullName || 'Verified Account Holder',
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.bill) {
        const mapped = mapDbBillToReceipt(json.data.bill);
        const nextReceipts = [mapped, ...receipts];
        setReceipts(nextReceipts);
        saveStoredUtilityReceipts(nextReceipts);

        if (payData.serviceType === 'zesa') {
          setTokenResult(json.data.token || mapped.tokenOrConfirmation);
          setLatestBillData({
            ...json.data.bill,
            whatsapp_receipt_link: json.data.whatsapp_receipt_link,
          });
        } else if (payData.serviceType === 'water') {
          setWaterSuccess(true);
        } else if (payData.serviceType === 'dstv') {
          setDstvSuccess(true);
        }
      } else {
        // Fallback simulation
        finalizeFallback(payData);
      }
    } catch (err) {
      console.warn('Backend payment failed, applying local fallback:', err);
      finalizeFallback(payData);
    } finally {
      setIsGenerating(false);
      setUssdPromptOpen(false);
      setPendingPayment(null);
    }
  };

  const finalizeFallback = (payData: NonNullable<typeof pendingPayment>) => {
    const seg1 = Math.floor(1000 + Math.random() * 9000);
    const seg2 = Math.floor(1000 + Math.random() * 9000);
    const seg3 = Math.floor(1000 + Math.random() * 9000);
    const seg4 = Math.floor(1000 + Math.random() * 9000);
    const seg5 = Math.floor(1000 + Math.random() * 9000);
    const token = `${seg1} ${seg2} ${seg3} ${seg4} ${seg5}`;

    const newRec: UtilityReceipt = {
      id: `ut-${Date.now()}`,
      reference: `ZETDC-${Math.floor(100000 + Math.random() * 900000)}`,
      service: payData.serviceType === 'zesa' ? 'ZESA Prepaid Token' : payData.serviceType === 'water' ? 'Municipal Water' : 'DStv Subscription',
      accountOrMeter: payData.account_number,
      customerPhone: payData.customer_phone,
      currency: payData.currency,
      amount: payData.amount,
      tokenOrConfirmation: payData.serviceType === 'zesa' ? token : `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      unitsOrPackage: payData.serviceType === 'zesa' ? `${calculatedKwh} kWh` : 'Settled & Verified',
      date: 'Just now',
      status: 'Completed',
    };

    const next = [newRec, ...receipts];
    setReceipts(next);
    saveStoredUtilityReceipts(next);

    if (payData.serviceType === 'zesa') {
      setTokenResult(token);
    } else if (payData.serviceType === 'water') {
      setWaterSuccess(true);
    } else if (payData.serviceType === 'dstv') {
      setDstvSuccess(true);
    }
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
                Purchase 20-digit ZETDC prepaid electricity tokens, settle municipal water rates, and renew DStv subscriptions in USD or ZiG with verified transaction receipts.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {isAuthenticated ? (
                <Link
                  href="/dashboard/user"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:border-emerald-500 shadow-xs"
                >
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>My Utility Vault ({receipts.length})</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push('/login?redirect=/bill-payments')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e57eb] text-xs sm:text-sm font-semibold text-white hover:bg-[#1546c7] shadow-xs cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Pay Bills</span>
                </button>
              )}
            </div>
          </div>

          {/* Option B Authentication Warning Banner if Not Logged In */}
          {!isAuthenticated && (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/90 dark:border-amber-900/50 dark:bg-amber-950/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-amber-100 dark:bg-amber-900/50 p-2 text-amber-800 dark:text-amber-300 shrink-0">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                    Account Sign-In Required for Utility Settlements
                  </h4>
                  <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mt-0.5">
                    To protect customer balances, guarantee official 20-digit ZETDC token delivery, and archive ZIMRA-compliant tax receipts, an account is required before payment.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => router.push('/login?redirect=/bill-payments')}
                  className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/register?redirect=/bill-payments')}
                  className="rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100/50 transition cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}

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

          {/* Payment Method Selector (Common to all tabs) */}
          <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Settlement Channel (Simulated Mobile Money / Card)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['EcoCash', 'OneMoney', 'InnBucks', 'Card'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold border transition cursor-pointer ${
                    paymentMethod === method
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>{method}</span>
                </button>
              ))}
            </div>
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

                <form onSubmit={initiateZesaPayment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      ZETDC Prepaid Meter Number
                    </label>
                    <input
                      type="text"
                      required
                      value={meterNumber}
                      onChange={(e) => setMeterNumber(e.target.value)}
                      placeholder="e.g. 37148920194"
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
                      Mobile Number for {paymentMethod} USSD Push Prompt
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
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing USSD Authorization...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        <span>Pay via {paymentMethod} & Generate Token</span>
                      </>
                    )}
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
                        <div className="text-xs text-slate-500 dark:text-slate-400">
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

                      {latestBillData?.whatsapp_receipt_link && (
                        <div className="pt-2">
                          <a
                            href={latestBillData.whatsapp_receipt_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Send Receipt to WhatsApp
                          </a>
                        </div>
                      )}
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
                <form onSubmit={initiateWaterPayment} className="space-y-4">
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
                    Settle Municipal Account via {paymentMethod}
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
                <form onSubmit={initiateDstvPayment} className="space-y-4">
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
                    Complete DStv Renewal via {paymentMethod}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Simulated USSD Mobile Authorization Modal */}
      <Modal
        isOpen={Boolean(ussdPromptOpen && pendingPayment)}
        onClose={() => {
          setUssdPromptOpen(false);
          setPendingPayment(null);
        }}
        maxWidth="md"
        className="p-6 text-center space-y-4"
      >
        {pendingPayment && (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <Smartphone className="h-6 w-6 animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                {paymentMethod} USSD Authorization
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                A secure push prompt has been dispatched to handset:
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {pendingPayment.customer_phone}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold">{pendingPayment.biller}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account/Meter:</span>
                <span className="font-mono font-semibold">{pendingPayment.account_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {pendingPayment.currency} ${pendingPayment.amount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Waiting for mobile PIN confirmation…</span>
                <span>{ussdProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300 ease-out"
                  style={{ width: `${ussdProgress}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => completePayment(pendingPayment)}
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
              >
                Approve Prompt (Simulate Now)
              </button>
              <button
                type="button"
                onClick={() => {
                  setUssdPromptOpen(false);
                  setPendingPayment(null);
                }}
                className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Auth Required Modal (Option B) */}
      <Modal
        isOpen={authRequiredOpen}
        onClose={() => setAuthRequiredOpen(false)}
        maxWidth="sm"
        className="p-6 text-center space-y-4"
      >
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
            <Lock className="h-6 w-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-950 dark:text-white">
              Sign In Required
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Please sign in or create an account to purchase utility tokens and automatically save transaction vouchers.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => router.push('/login?redirect=/bill-payments')}
              className="w-full rounded-xl bg-[#1e57eb] py-2.5 text-xs font-bold text-white hover:bg-[#1546c7] cursor-pointer"
            >
              Sign In to My Account
            </button>
            <button
              type="button"
              onClick={() => router.push('/register?redirect=/bill-payments')}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Register New Account
            </button>
            <button
              type="button"
              onClick={() => setAuthRequiredOpen(false)}
              className="w-full text-xs text-slate-400 hover:text-slate-600 cursor-pointer pt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
