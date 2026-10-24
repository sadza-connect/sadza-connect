'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/Button';
import { Modal, PublicModalBody, PublicModalFooter } from '@/components/ui/Modal';
import { useToast } from '@/components/providers/ToastProvider';
import {
  getPlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
  PlatformSettings,
  BusinessSubscriptionInvoice,
  getStoredInvoices,
  saveStoredInvoices,
} from '@/data/platformStore';
import { mapDbInvoiceToSubscriptionInvoice } from '@/lib/data/invoice-mapper';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Building2,
  Sparkles,
  Tag,
  Clock,
  Printer,
  QrCode,
  Check,
  AlertCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';

interface PlanOption {
  id: 'listing' | 'advert' | 'bundle';
  name: string;
  badge?: string;
  monthlyUsd: number;
  description: string;
  features: string[];
}

const PLANS: PlanOption[] = [
  {
    id: 'listing',
    name: 'Verified Business Directory Listing',
    badge: 'Core Foundation',
    monthlyUsd: 10,
    description: 'Establish permanent presence with official blue verified shield and priority provincial search.',
    features: [
      'Official Blue Verified Commercial Shield badge',
      'Priority placement in Provincial Search results',
      'Direct 1-Click WhatsApp Client Lead Generation',
      'Showcase up to 10 company products or services',
      '0% commission on direct B2B deals & inquiries',
    ],
  },
  {
    id: 'advert',
    name: 'Homepage Sponsored Advert Campaign',
    badge: 'High Impact',
    monthlyUsd: 20,
    description: 'Promote special offers, seasonal discounts, and clearance packages with top-6 homepage visibility.',
    features: [
      'Top-6 Homepage & Sector Directory hero placement',
      'Dual-currency pricing display (USD & ZiG)',
      'High-conversion direct WhatsApp promo button',
      'Custom discount badge ribbon (e.g. SAVE 20%)',
      'Promoted across all 10 provinces nationwide',
    ],
  },
  {
    id: 'bundle',
    name: 'Enterprise Duo Growth Bundle',
    badge: 'Most Popular • Save $5/mo',
    monthlyUsd: 25,
    description: 'Maximum market dominance: Combine permanent verified listing with an active sponsored advert.',
    features: [
      'Everything in Verified Directory Listing plan',
      'Everything in Homepage Sponsored Advert plan',
      'Dedicated Sadza Connect Account Executive',
      'Priority Zimbabwe B2B supplier verification',
      'Quarterly performance and buyer analytics report',
    ],
  },
];

const DURATIONS = [
  { months: 1, label: '1 Month', discount: 0, tag: 'Standard' },
  { months: 3, label: '3 Months', discount: 10, tag: 'Save 10%' },
  { months: 12, label: '12 Months', discount: 20, tag: 'Save 20% (Best Value)' },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);

  useEffect(() => {
    setSettings(getPlatformSettings());
    const sync = () => setSettings(getPlatformSettings());
    window.addEventListener('sadza-platform-updated', sync);
    return () => window.removeEventListener('sadza-platform-updated', sync);
  }, []);

  const dynamicPlans: PlanOption[] = useMemo(() => {
    const listingUsd = settings.monthlySubscriptionPriceUsd;
    const advertUsd = settings.sponsoredAdvertPriceUsd;
    const bundleUsd = Math.max(1, listingUsd + advertUsd - 5);
    return [
      {
        id: 'listing',
        name: 'Verified Business Directory Listing',
        badge: 'Core Foundation',
        monthlyUsd: listingUsd,
        description: 'Establish permanent presence with official blue verified shield and priority provincial search.',
        features: [
          'Official Blue Verified Commercial Shield badge',
          'Priority placement in Provincial Search results',
          'Direct 1-Click WhatsApp Client Lead Generation',
          'Showcase up to 10 company products or services',
          '0% commission on direct B2B deals & inquiries',
        ],
      },
      {
        id: 'advert',
        name: 'Homepage Sponsored Advert Campaign',
        badge: 'High Impact',
        monthlyUsd: advertUsd,
        description: 'Promote special offers, seasonal discounts, and clearance packages with top-6 homepage visibility.',
        features: [
          'Top-6 Homepage & Sector Directory hero placement',
          'Dual-currency pricing display (USD & ZiG)',
          'High-conversion direct WhatsApp promo button',
          'Custom discount badge ribbon (e.g. SAVE 20%)',
          'Promoted across all 10 provinces nationwide',
        ],
      },
      {
        id: 'bundle',
        name: 'Enterprise Duo Growth Bundle',
        badge: 'Most Popular • Save $5/mo',
        monthlyUsd: bundleUsd,
        description: 'Maximum market dominance: Combine permanent verified listing with an active sponsored advert.',
        features: [
          'Everything in Verified Directory Listing plan',
          'Everything in Homepage Sponsored Advert plan',
          'Dedicated Sadza Connect Account Executive',
          'Priority Zimbabwe B2B supplier verification',
          'Quarterly performance and buyer analytics report',
        ],
      },
    ];
  }, [settings.monthlySubscriptionPriceUsd, settings.sponsoredAdvertPriceUsd]);

  const preselectedPlan = searchParams.get('plan') || 'bundle';
  const initialPlan = dynamicPlans.find((p) => p.id === preselectedPlan)?.id || 'bundle';

  const [selectedPlanId, setSelectedPlanId] = useState<'listing' | 'advert' | 'bundle'>(initialPlan);
  const [selectedDuration, setSelectedDuration] = useState<number>(3);
  const [currency, setCurrency] = useState<'USD' | 'ZiG'>('USD');
  const [paymentMethod, setPaymentMethod] = useState<'EcoCash USD' | 'InnBucks' | 'Visa / Mastercard' | 'Bank Transfer'>('EcoCash USD');

  // Customer Form
  const [businessName, setBusinessName] = useState('Midlands Solar & Power Systems');
  const [contactEmail, setContactEmail] = useState('billing@midlandssolar.co.zw');
  const [phoneNumber, setPhoneNumber] = useState('+263 77 333 3444');
  const [taxBpnNumber, setTaxBpnNumber] = useState('BPN-0029410-ZW');
  const [notes, setNotes] = useState('');

  // Processing & Success State
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<BusinessSubscriptionInvoice | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const activePlan = useMemo(() => {
    return dynamicPlans.find((p) => p.id === selectedPlanId) || dynamicPlans[0];
  }, [dynamicPlans, selectedPlanId]);

  const activeDurationObj = useMemo(() => {
    return DURATIONS.find((d) => d.months === selectedDuration) || DURATIONS[0];
  }, [selectedDuration]);

  // Pricing calculations
  const rawSubtotalUSD = activePlan.monthlyUsd * selectedDuration;
  const discountAmountUSD = (rawSubtotalUSD * activeDurationObj.discount) / 100;
  const finalSubtotalUSD = rawSubtotalUSD - discountAmountUSD;
  const vatRate = (settings.vatPct ?? 15) / 100; // Dynamic Zimbabwe VAT from admin settings
  const vatAmountUSD = Number((finalSubtotalUSD * vatRate).toFixed(2));
  const totalAmountUSD = Number((finalSubtotalUSD + vatAmountUSD).toFixed(2));

  const usdToZigRate = settings.usdToZigRate;
  const totalAmountZiG = Math.round(totalAmountUSD * usdToZigRate);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !contactEmail.trim() || !phoneNumber.trim()) {
      toast({ title: 'Please complete all required business details', variant: 'error' });
      return;
    }

    setIsProcessing(true);

    const startDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const endDate = new Date(Date.now() + selectedDuration * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const planTitle =
      selectedPlanId === 'bundle'
        ? 'Enterprise Duo Listing & Advert ($25/mo)'
        : selectedPlanId === 'advert'
        ? 'Sponsored Product Advert ($20/mo)'
        : 'Monthly Business Listing ($10/mo)';

    let serverInvoice: BusinessSubscriptionInvoice | null = null;

    try {
      const res = await fetch('/api/v1/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          business_name: businessName.trim(),
          plan_type: planTitle,
          amount_usd: totalAmountUSD,
          payment_method: paymentMethod,
          period_covered: `${startDate} – ${endDate}`,
          status: 'Paid',
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.invoice) {
        serverInvoice = mapDbInvoiceToSubscriptionInvoice(json.data.invoice);
      }
    } catch (err) {
      console.error('Failed to save invoice to database:', err);
    }

    // If campaign includes an advert, auto-publish promotion
    if (selectedPlanId === 'bundle' || selectedPlanId === 'advert') {
      try {
        await fetch('/api/v1/adverts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            business_name: businessName.trim(),
            province: 'Harare',
            category: 'Solar & Clean Energy',
            offer_type: 'Special Package',
            headline: `${businessName.trim()} Verified Promotion`,
            offer_text: `Commercial partner promotion with direct nationwide delivery and WhatsApp support.`,
            promo_badge: 'FEATURED PROMO',
            promo_price_usd: activePlan.monthlyUsd,
            whatsapp: phoneNumber.replace(/\D/g, '') || '',
            phone: phoneNumber,
            image: '',
            featured_on_home: true,
          }),
        });
      } catch (err) {
        console.error('Failed to create campaign advert:', err);
      }
    }

    const fallbackInvoiceNum = `SC-INV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newInvoice: BusinessSubscriptionInvoice = serverInvoice || {
      id: `inv-${Date.now()}`,
      invoiceNumber: fallbackInvoiceNum,
      businessId: `biz-${Date.now()}`,
      businessName: businessName.trim(),
      planType: planTitle,
      amountUsd: totalAmountUSD,
      paymentMethod,
      date: startDate,
      periodCovered: `${startDate} – ${endDate}`,
      status: 'Paid',
    };

    // Save to platform store
    const existingInvoices = getStoredInvoices();
    saveStoredInvoices([newInvoice, ...existingInvoices]);

    setIsProcessing(false);
    setCompletedInvoice(newInvoice);
    setShowSuccessModal(true);
    toast({
      title: 'Payment Confirmed & Subscription Activated',
      description: `Official Tax Invoice ${newInvoice.invoiceNumber} generated.`,
      variant: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="space-y-3">
            <Link
              href="/dashboard/business"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Business Dashboard</span>
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Commercial Subscription & Checkout
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Select your commercial tier, duration, and settlement method to activate verified network privileges.
                </p>
              </div>

              {/* Currency Selector Pill */}
              <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto shadow-sm">
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    currency === 'USD'
                      ? 'bg-[#1e57eb] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('ZiG')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    currency === 'ZiG'
                      ? 'bg-[#1e57eb] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  ZiG (Rate: {usdToZigRate})
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleCheckoutSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form & Configuration (7 cols) */}
              <div className="lg:col-span-7 space-y-8">
                {/* Step 1: Select Plan Tier */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-[#1e57eb] dark:text-blue-400 text-xs flex items-center justify-center font-bold">
                      1
                    </span>
                    <span>Choose Commercial Membership Tier</span>
                  </div>

                  <div className="space-y-3">
                    {dynamicPlans.map((plan) => {
                      const isSelected = selectedPlanId === plan.id;
                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`relative p-4 rounded-xl border-2 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isSelected
                              ? 'border-[#1e57eb] bg-blue-50/40 dark:bg-blue-950/20'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                {plan.name}
                              </h3>
                              {plan.badge && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#1e57eb] dark:bg-blue-900/60 dark:text-blue-300">
                                  {plan.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              {plan.description}
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="text-lg font-extrabold text-[#1e57eb] dark:text-blue-400">
                              {currency === 'USD' ? `$${plan.monthlyUsd}` : `ZiG ${(plan.monthlyUsd * usdToZigRate).toLocaleString()}`}
                            </span>
                            <span className="text-xs text-slate-500 block">/ month</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Feature Checklist for Active Plan */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Included with {activePlan.name}:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                      {activePlan.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 2: Duration Selector */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-[#1e57eb] dark:text-blue-400 text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    <span>Billing Duration & Term Discount</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {DURATIONS.map((dur) => {
                      const isSelected = selectedDuration === dur.months;
                      return (
                        <div
                          key={dur.months}
                          onClick={() => setSelectedDuration(dur.months)}
                          className={`p-3.5 rounded-xl border-2 cursor-pointer transition text-center space-y-1 ${
                            isSelected
                              ? 'border-[#1e57eb] bg-blue-50/50 dark:bg-blue-950/30'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                            {dur.tag}
                          </span>
                          <span className="text-base font-bold text-slate-900 dark:text-white block">
                            {dur.label}
                          </span>
                          <span className="text-xs text-slate-500 block">
                            {dur.discount > 0 ? `${dur.discount}% savings` : 'Billed monthly'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Business Details */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-[#1e57eb] dark:text-blue-400 text-xs flex items-center justify-center font-bold">
                      3
                    </span>
                    <span>Business Invoice Profile</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Registered Business Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-[#1e57eb]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Accounts / Billing Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-[#1e57eb]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        EcoCash / Contact Phone Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-[#1e57eb]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tax BPN / VAT Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={taxBpnNumber}
                        onChange={(e) => setTaxBpnNumber(e.target.value)}
                        placeholder="e.g. BPN-0029410-ZW"
                        className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-[#1e57eb]"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 4: Settlement Method */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-[#1e57eb] dark:text-blue-400 text-xs flex items-center justify-center font-bold">
                      4
                    </span>
                    <span>Select Settlement Gateway</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: 'EcoCash USD',
                        title: 'EcoCash USD / ZiG',
                        desc: 'Handset USSD push prompt (*151#)',
                      },
                      {
                        id: 'InnBucks',
                        title: 'InnBucks Cash Code',
                        desc: 'Pay via InnBucks App or Simbisa Till',
                      },
                      {
                        id: 'Visa / Mastercard',
                        title: 'Visa / Mastercard',
                        desc: 'Instant online card settlement',
                      },
                      {
                        id: 'Bank Transfer',
                        title: 'Bank Transfer / RTGS',
                        desc: 'Proforma Invoice with CBZ/Stanbic details',
                      },
                    ].map((method) => {
                      const isSelected = paymentMethod === method.id;
                      return (
                        <div
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`p-3.5 rounded-xl border-2 cursor-pointer transition ${
                            isSelected
                              ? 'border-[#1e57eb] bg-blue-50/40 dark:bg-blue-950/30'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={isSelected}
                              onChange={() => {}}
                              className="text-[#1e57eb] focus:ring-[#1e57eb]"
                            />
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {method.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-5">
                            {method.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary Sidebar (5 cols) */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                    Order Summary & Tax Invoice Preview
                  </h2>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Selected Plan:</span>
                      <span className="font-bold text-slate-900 dark:text-white text-right max-w-[180px] truncate">
                        {activePlan.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Monthly Base Rate:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        ${activePlan.monthlyUsd.toFixed(2)} USD
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Billing Duration:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {activeDurationObj.label}
                      </span>
                    </div>

                    {discountAmountUSD > 0 && (
                      <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>Term Discount ({activeDurationObj.discount}%):</span>
                        <span>-${discountAmountUSD.toFixed(2)} USD</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Subtotal (Net):</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        ${finalSubtotalUSD.toFixed(2)} USD
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Zimbabwe VAT (15%):</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        ${vatAmountUSD.toFixed(2)} USD
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-baseline justify-between">
                      <div>
                        <span className="text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 block">
                          Total Due Now:
                        </span>
                        {currency === 'ZiG' && (
                          <span className="text-[11px] text-slate-500">
                            (Converted at 1 USD = {usdToZigRate} ZiG)
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-[#1e57eb] dark:text-blue-400">
                          {currency === 'USD'
                            ? `$${totalAmountUSD.toFixed(2)} USD`
                            : `ZiG ${totalAmountZiG.toLocaleString()}`}
                        </span>
                        {currency === 'ZiG' && (
                          <span className="text-xs text-slate-400 block font-medium">
                            (${totalAmountUSD.toFixed(2)} USD)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isProcessing}
                    className="py-3.5 rounded-xl font-bold text-sm shadow-md"
                  >
                    <span>Complete Order & Activate</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>

                  {/* Trust guarantees */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Instant verification status activation on confirmation.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Official Zimbabwe ZIMRA compliant VAT tax invoice issued.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Post-Payment Voucher Modal */}
      <Modal
        open={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push('/dashboard/business');
        }}
        title="Subscription Voucher & Tax Invoice"
        size="lg"
      >
        {completedInvoice && (
          <div className="flex flex-col flex-1 min-h-0">
            <PublicModalBody>
              <div className="space-y-5">
                <div className="text-center py-2 space-y-1">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Subscription Activated Successfully!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your business listing has been verified. A copy of this receipt has been saved to your account.
                  </p>
                </div>

                {/* Printable Invoice Voucher Card */}
                <div
                  id="printable-tax-voucher"
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-4 text-xs font-mono shadow-sm"
                >
                  <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        SADZA CONNECT (PVT) LTD
                      </p>
                      <p className="text-[11px] text-slate-500">VAT Reg: 10098421 • Harare, Zimbabwe</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        PAID & VERIFIED
                      </span>
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white mt-1">
                        {completedInvoice.invoiceNumber}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">BILLED TO:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {completedInvoice.businessName}
                      </span>
                      <span className="text-slate-500 block">{contactEmail}</span>
                      <span className="text-slate-500 block">{taxBpnNumber}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block">DATE & COVERAGE:</span>
                      <span className="text-slate-800 dark:text-slate-200 block">{completedInvoice.date}</span>
                      <span className="text-slate-500 block">{completedInvoice.periodCovered}</span>
                      <span className="text-slate-500 block font-semibold">Via {completedInvoice.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="py-2.5 border-y border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {completedInvoice.planType}
                      </span>
                      <span className="text-[11px] text-slate-500">Commercial Directory Membership</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      ${completedInvoice.amountUsd.toFixed(2)} USD
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-8 h-8 text-slate-700 dark:text-slate-300" />
                      <span className="text-[10px] text-slate-400 leading-tight">
                        Scan to verify validity on ZW National Registry
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">TOTAL SETTLED:</span>
                      <span className="text-base font-extrabold text-[#1e57eb] dark:text-blue-400">
                        ${completedInvoice.amountUsd.toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </PublicModalBody>

            <PublicModalFooter>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') window.print();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/dashboard/business');
                }}
                className="text-xs font-bold"
              >
                <span>Go to Business Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </PublicModalFooter>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e57eb]" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
