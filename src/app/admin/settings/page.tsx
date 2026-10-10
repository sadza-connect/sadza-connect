'use client';

import { useState } from 'react';
import {
  Building2,
  Phone,
  ShieldCheck,
  Bell,
  Lock,
  Truck,
  DollarSign,
  type LucideIcon,
} from 'lucide-react';
import {
  AdminPageHeader,
  Panel,
  PanelHeading,
  AdminButton,
  AdminInput,
  AdminTextarea,
} from '@/components/admin/AdminUI';
import { ImageUploader, type UploadedMediaItem } from '@/components/admin/ImageUploader';
import { useToast } from '@/components/providers/ToastProvider';

type SectionId =
  | 'profile'
  | 'contact'
  | 'pricing'
  | 'shipping'
  | 'verification'
  | 'notifications'
  | 'security';

const SECTIONS: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: 'profile', label: 'Company profile', icon: Building2 },
  { id: 'contact', label: 'Contact details', icon: Phone },
  { id: 'pricing', label: 'Subscriptions & Rates', icon: DollarSign },
  { id: 'shipping', label: 'Shipping & Logistics', icon: Truck },
  { id: 'verification', label: 'Verification portals', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
];

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3.5 text-left transition-colors hover:border-slate-300 bg-white"
    >
      <span>
        <span className="block text-sm font-semibold text-slate-800">{label}</span>
        <span className="block text-xs text-slate-400 mt-0.5">{description}</span>
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-[#1e57eb]' : 'bg-slate-200'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [active, setActive] = useState<SectionId>('profile');

  // Company profile
  const [profile, setProfile] = useState({
    name: 'Sadza Connect Integrated Commerce Ltd',
    cr14Number: 'CR14-ZW-2025-88412',
    zimraTin: '1004928174',
    tagline: "Zimbabwe's Trusted B2B & Retail Digital Commerce Infrastructure",
    established: '2024',
    vision:
      'To connect every verified enterprise, agro-processor, manufacturer, and service provider across all 10 provinces of Zimbabwe with transparent digital trade.',
    mission:
      'Delivering verified business directories, inter-provincial marketplace logistics, instant ZESA/utility bill settlement, and executive recruitment in one unified platform.',
  });

  const [logoAsset, setLogoAsset] = useState<UploadedMediaItem[]>([
    {
      src: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=600&q=80',
      caption: 'Sadza Connect Official Crest',
    },
  ]);

  const [signatureAsset, setSignatureAsset] = useState<UploadedMediaItem[]>([
    {
      src: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
      caption: 'Authorized Registrar Signature (ID Cards & Receipts)',
    },
  ]);

  // Contact details
  const [contact, setContact] = useState({
    email: 'operations@sadzaconnect.co.zw',
    phone: '+263 242 708 411',
    whatsapp: '+263 77 200 1001',
    hours: 'Mon – Sat, 07:30 – 18:00 CAT',
    line1: 'Joina City Commercial Tower, 11th Floor',
    line2: 'Jason Moyo Avenue / Julius Nyerere Way',
    city: 'Harare',
    province: 'Harare',
  });

  // Commercial Pricing & USD/ZiG Rates
  const [pricing, setPricing] = useState({
    graceDays: '30',
    standardListingUsd: '10',
    sponsoredAdvertUsd: '20',
    homepageSlotsCap: '6',
    zigExchangeRate: '27.50',
    zesaServiceFeePct: '1.5',
    vatPct: '15',
    ecocashMerchantCode: '774920',
    innbucksMerchantCode: 'SC-ZW-881',
  });

  // Shipping & Logistics
  const [shipping, setShipping] = useState({
    pickupEnabled: true,
    pickupName: 'Sadza Connect Central Dispatch Hub (Graniteside)',
    pickupPhone: '+263 77 200 1001',
    pickupHours: 'Mon – Sat: 08:00 – 17:00',
    pickupAddress: 'Stand 412 Seke Road, Graniteside Industrial Area, Harare',
    pickupInstructions:
      'Present your official Order Waybill Code or QR Receipt at Dispatch Bay 2 for immediate loading.',
    zone0Fee: '5',
    zone0Days: 'Same Day / 24 Hours',
    zone1Fee: '15',
    zone1Days: '1 – 2 Business Days',
    zone2Fee: '25',
    zone2Days: '2 – 3 Business Days',
    zone3Fee: '35',
    zone3Days: '2 – 4 Business Days',
    solarFreeUnits: '4',
    solarExtraFee: '6',
    batteryFreeUnits: '1',
    batteryExtraFee: '10',
  });

  // Verification portals
  const [verification, setVerification] = useState({
    receiptPortal: true,
    staffPortal: true,
    cr14StrictCheck: true,
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    newEnquiry: true,
    graceExpiryAlerts: true,
    weeklyDigest: true,
    smsAlerts: false,
  });

  // Security
  const [security, setSecurity] = useState({ current: '', next: '', confirm: '' });
  const [twoFactor, setTwoFactor] = useState(true);

  function handleSave(sectionLabel: string) {
    toast({
      title: `${sectionLabel} Saved`,
      description: 'Your configuration updates are now live across Sadza Connect.',
      variant: 'success',
    });
  }

  function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (security.next !== security.confirm) {
      toast({ title: 'Passwords do not match', variant: 'error' });
      return;
    }
    if (security.next.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Use at least 8 characters.',
        variant: 'error',
      });
      return;
    }
    toast({
      title: 'Executive Password Updated',
      description: 'Your administrator credentials have been rotated.',
      variant: 'success',
    });
    setSecurity({ current: '', next: '', confirm: '' });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Platform Settings & Commercial Rules"
        description="Configure company profile, subscription pricing ($10/mo & $20/mo), 30-day grace automation, inter-provincial logistics rates, and verification portals."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_1fr]">
        {/* Vertical Section Nav */}
        <nav className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id)}
                className={`inline-flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#0a1018] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-950'
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-[#6390ff]' : 'text-slate-400'}`} />
                {s.label}
              </button>
            );
          })}
        </nav>

        {/* Section Content */}
        <div>
          {active === 'profile' && (
            <Panel>
              <PanelHeading
                title="Company Profile & Official Assets"
                hint="Displayed across official receipts, ID cards, and public verification footers."
              />
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <AdminInput
                    label="Registered Corporate Name"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  />
                  <AdminInput
                    label="CR14 / Corporate Registration Number"
                    value={profile.cr14Number}
                    onChange={(e) => setProfile((p) => ({ ...p, cr14Number: e.target.value }))}
                  />
                  <AdminInput
                    label="ZIMRA TIN Number"
                    value={profile.zimraTin}
                    onChange={(e) => setProfile((p) => ({ ...p, zimraTin: e.target.value }))}
                  />
                  <AdminInput
                    label="Year Established"
                    type="number"
                    value={profile.established}
                    onChange={(e) => setProfile((p) => ({ ...p, established: e.target.value }))}
                  />
                  <div className="sm:col-span-2">
                    <AdminInput
                      label="Platform Tagline"
                      value={profile.tagline}
                      onChange={(e) => setProfile((p) => ({ ...p, tagline: e.target.value }))}
                    />
                  </div>
                </div>
                <AdminTextarea
                  label="Corporate Vision"
                  rows={3}
                  value={profile.vision}
                  onChange={(e) => setProfile((p) => ({ ...p, vision: e.target.value }))}
                />
                <AdminTextarea
                  label="Corporate Mission"
                  rows={3}
                  value={profile.mission}
                  onChange={(e) => setProfile((p) => ({ ...p, mission: e.target.value }))}
                />

                <div className="space-y-4 border-t border-slate-100 pt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1e57eb]">
                    Company Brand Crest & Authorized ID Card Signature
                  </h4>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <ImageUploader
                      label="Company Logo Asset"
                      hint="Upload official company crest from device or select preset"
                      multiple={false}
                      images={logoAsset}
                      onChange={setLogoAsset}
                    />
                    <ImageUploader
                      label="Authorized Signature (For ID Cards & Receipts)"
                      hint="Upload registrar signature for PVC ID cards & official receipts"
                      multiple={false}
                      images={signatureAsset}
                      onChange={setSignatureAsset}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <AdminButton onClick={() => handleSave('Company Profile')}>
                    Save Company Profile
                  </AdminButton>
                </div>
              </div>
            </Panel>
          )}

          {active === 'contact' && (
            <Panel>
              <PanelHeading
                title="Headquarters & Contact Details"
                hint="Used in public headers, footers, receipts, and customer support routing."
              />
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <AdminInput
                    label="Operations Email"
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                  />
                  <AdminInput
                    label="Primary Landline / Desk Phone"
                    value={contact.phone}
                    onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                  />
                  <AdminInput
                    label="Official WhatsApp Hotline"
                    value={contact.whatsapp}
                    onChange={(e) => setContact((c) => ({ ...c, whatsapp: e.target.value }))}
                  />
                  <AdminInput
                    label="Operating Hours"
                    value={contact.hours}
                    onChange={(e) => setContact((c) => ({ ...c, hours: e.target.value }))}
                  />
                  <AdminInput
                    label="Address Line 1"
                    value={contact.line1}
                    onChange={(e) => setContact((c) => ({ ...c, line1: e.target.value }))}
                  />
                  <AdminInput
                    label="Address Line 2"
                    value={contact.line2}
                    onChange={(e) => setContact((c) => ({ ...c, line2: e.target.value }))}
                  />
                  <AdminInput
                    label="City"
                    value={contact.city}
                    onChange={(e) => setContact((c) => ({ ...c, city: e.target.value }))}
                  />
                  <AdminInput
                    label="Province (Clean Name)"
                    value={contact.province}
                    onChange={(e) => setContact((c) => ({ ...c, province: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <AdminButton onClick={() => handleSave('Contact Details')}>
                    Save Contact Details
                  </AdminButton>
                </div>
              </div>
            </Panel>
          )}

          {active === 'pricing' && (
            <Panel>
              <PanelHeading
                title="Subscriptions, Adverts & Multi-Currency Settlement"
                hint="Control the 30-day onboarding grace period, $10/mo listing fee, $20/mo sponsored adverts, and USD/ZiG settlement."
              />
              <div className="mt-5 space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <AdminInput
                    label="Onboarding Grace Period (Days)"
                    type="number"
                    value={pricing.graceDays}
                    onChange={(e) => setPricing((p) => ({ ...p, graceDays: e.target.value }))}
                  />
                  <AdminInput
                    label="Standard Business Listing ($ USD / mo)"
                    type="number"
                    value={pricing.standardListingUsd}
                    onChange={(e) => setPricing((p) => ({ ...p, standardListingUsd: e.target.value }))}
                  />
                  <AdminInput
                    label="Sponsored Advert Slot ($ USD / mo)"
                    type="number"
                    value={pricing.sponsoredAdvertUsd}
                    onChange={(e) => setPricing((p) => ({ ...p, sponsoredAdvertUsd: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <AdminInput
                    label="Homepage Pinned Adverts Cap"
                    type="number"
                    value={pricing.homepageSlotsCap}
                    onChange={(e) => setPricing((p) => ({ ...p, homepageSlotsCap: e.target.value }))}
                  />
                  <AdminInput
                    label="Reference USD → ZiG Rate"
                    value={pricing.zigExchangeRate}
                    onChange={(e) => setPricing((p) => ({ ...p, zigExchangeRate: e.target.value }))}
                  />
                  <AdminInput
                    label="Standard VAT Rate (%)"
                    type="number"
                    value={pricing.vatPct}
                    onChange={(e) => setPricing((p) => ({ ...p, vatPct: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-slate-100 pt-4">
                  <AdminInput
                    label="EcoCash Biller Merchant Code"
                    value={pricing.ecocashMerchantCode}
                    onChange={(e) =>
                      setPricing((p) => ({ ...p, ecocashMerchantCode: e.target.value }))
                    }
                  />
                  <AdminInput
                    label="InnBucks Corporate Code"
                    value={pricing.innbucksMerchantCode}
                    onChange={(e) =>
                      setPricing((p) => ({ ...p, innbucksMerchantCode: e.target.value }))
                    }
                  />
                  <AdminInput
                    label="ZESA / Utility Service Fee (%)"
                    value={pricing.zesaServiceFeePct}
                    onChange={(e) =>
                      setPricing((p) => ({ ...p, zesaServiceFeePct: e.target.value }))
                    }
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <AdminButton onClick={() => handleSave('Commercial Pricing & Rates')}>
                    Save Commercial Pricing
                  </AdminButton>
                </div>
              </div>
            </Panel>
          )}

          {active === 'shipping' && (
            <div className="space-y-6">
              <Panel>
                <PanelHeading
                  title="🏢 Central Warehouse & Storefront Self-Pickup ($0 Free)"
                  hint="Allow buyers to collect equipment directly from Harare Graniteside hub or verified merchant depots."
                />
                <div className="mt-5 space-y-4">
                  <Toggle
                    label="Enable Central Depot & Merchant Self-Pickup ($0 Free)"
                    description="Buyers can opt for self-collection at checkout and bypass inter-provincial waybill fees."
                    checked={shipping.pickupEnabled}
                    onChange={(v) => setShipping((s) => ({ ...s, pickupEnabled: v }))}
                  />
                  {shipping.pickupEnabled && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                      <AdminInput
                        label="Dispatch Facility Name"
                        value={shipping.pickupName}
                        onChange={(e) => setShipping((s) => ({ ...s, pickupName: e.target.value }))}
                      />
                      <AdminInput
                        label="Dispatch Contact Phone"
                        value={shipping.pickupPhone}
                        onChange={(e) => setShipping((s) => ({ ...s, pickupPhone: e.target.value }))}
                      />
                      <div className="sm:col-span-2">
                        <AdminInput
                          label="Collection Hours"
                          value={shipping.pickupHours}
                          onChange={(e) =>
                            setShipping((s) => ({ ...s, pickupHours: e.target.value }))
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <AdminTextarea
                          label="Physical Dispatch Address"
                          rows={2}
                          value={shipping.pickupAddress}
                          onChange={(e) =>
                            setShipping((s) => ({ ...s, pickupAddress: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Panel>

              <Panel>
                <PanelHeading
                  title="🚚 Inter-Provincial Waybill Base Rates (All 10 Provinces)"
                  hint="Base freight tariffs for standard marketplace shipments across Zimbabwe."
                />
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Zone 0: Harare Metropolitan Local Dispatch
                        </h4>
                        <p className="text-xs text-slate-500">Covered: Harare</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-xs font-bold text-emerald-700">
                        ${shipping.zone0Fee} USD
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <AdminInput
                        label="Base Fee ($ USD)"
                        type="number"
                        value={shipping.zone0Fee}
                        onChange={(e) => setShipping((s) => ({ ...s, zone0Fee: e.target.value }))}
                      />
                      <AdminInput
                        label="Estimated Delivery Window"
                        value={shipping.zone0Days}
                        onChange={(e) => setShipping((s) => ({ ...s, zone0Days: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Zone 1: Mashonaland Corridor
                        </h4>
                        <p className="text-xs text-slate-500">
                          Covered: Mashonaland East, Mashonaland West, Mashonaland Central
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-xs font-bold text-emerald-700">
                        ${shipping.zone1Fee} USD
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <AdminInput
                        label="Base Fee ($ USD)"
                        type="number"
                        value={shipping.zone1Fee}
                        onChange={(e) => setShipping((s) => ({ ...s, zone1Fee: e.target.value }))}
                      />
                      <AdminInput
                        label="Estimated Delivery Window"
                        value={shipping.zone1Days}
                        onChange={(e) => setShipping((s) => ({ ...s, zone1Days: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Zone 2: Midlands, Manicaland & Masvingo
                        </h4>
                        <p className="text-xs text-slate-500">
                          Covered: Midlands, Manicaland, Masvingo
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-xs font-bold text-emerald-700">
                        ${shipping.zone2Fee} USD
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <AdminInput
                        label="Base Fee ($ USD)"
                        type="number"
                        value={shipping.zone2Fee}
                        onChange={(e) => setShipping((s) => ({ ...s, zone2Fee: e.target.value }))}
                      />
                      <AdminInput
                        label="Estimated Delivery Window"
                        value={shipping.zone2Days}
                        onChange={(e) => setShipping((s) => ({ ...s, zone2Days: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#1e57eb]/25 bg-[#eef4ff]/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-950">
                          Zone 3: Bulawayo & Matabeleland Trunk Route
                        </h4>
                        <p className="text-xs text-slate-500">
                          Covered: Bulawayo, Matabeleland North, Matabeleland South
                        </p>
                      </div>
                      <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 font-mono text-xs font-bold text-[#1e57eb]">
                        ${shipping.zone3Fee} USD
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <AdminInput
                        label="Base Fee ($ USD)"
                        type="number"
                        value={shipping.zone3Fee}
                        onChange={(e) => setShipping((s) => ({ ...s, zone3Fee: e.target.value }))}
                      />
                      <AdminInput
                        label="Estimated Delivery Window"
                        value={shipping.zone3Days}
                        onChange={(e) => setShipping((s) => ({ ...s, zone3Days: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </Panel>

              <Panel>
                <PanelHeading
                  title="📦 Bulky & Heavy Hardware Freight Surcharges"
                  hint="Protect margins when dispatching heavy solar arrays, lithium batteries, or agricultural machinery."
                />
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                    <h4 className="text-sm font-bold text-slate-900">Solar PV Modules (550W+)</h4>
                    <AdminInput
                      label="Free Panels Included in Base Rate"
                      type="number"
                      value={shipping.solarFreeUnits}
                      onChange={(e) =>
                        setShipping((s) => ({ ...s, solarFreeUnits: e.target.value }))
                      }
                    />
                    <AdminInput
                      label="Extra Surcharge Per Panel ($ USD)"
                      type="number"
                      value={shipping.solarExtraFee}
                      onChange={(e) =>
                        setShipping((s) => ({ ...s, solarExtraFee: e.target.value }))
                      }
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                    <h4 className="text-sm font-bold text-slate-900">LiFePO4 & Heavy Batteries</h4>
                    <AdminInput
                      label="Free Batteries Included in Base Rate"
                      type="number"
                      value={shipping.batteryFreeUnits}
                      onChange={(e) =>
                        setShipping((s) => ({ ...s, batteryFreeUnits: e.target.value }))
                      }
                    />
                    <AdminInput
                      label="Extra Surcharge Per Battery ($ USD)"
                      type="number"
                      value={shipping.batteryExtraFee}
                      onChange={(e) =>
                        setShipping((s) => ({ ...s, batteryExtraFee: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <AdminButton onClick={() => handleSave('Provincial Shipping & Freight Rules')}>
                    Save Shipping Rates & Settings
                  </AdminButton>
                </div>
              </Panel>
            </div>
          )}

          {active === 'verification' && (
            <Panel>
              <PanelHeading
                title="Public Verification & KYC Portals"
                hint="Control QR receipt validation, inspector ID verification, and CR14/ZIMRA checks."
              />
              <div className="mt-5 space-y-3">
                <Toggle
                  label="Official QR Receipt Verification Portal"
                  description="Allow customers and auditors to verify subscription, advert, and ZESA receipts online."
                  checked={verification.receiptPortal}
                  onChange={(v) => setVerification((s) => ({ ...s, receiptPortal: v }))}
                />
                <Toggle
                  label="Staff & Field Inspector ID Verification"
                  description="Allow businesses to scan and verify Sadza Connect field agent PVC ID cards."
                  checked={verification.staffPortal}
                  onChange={(v) => setVerification((s) => ({ ...s, staffPortal: v }))}
                />
                <Toggle
                  label="Strict CR14 / ZIMRA Tax Clearance Matching"
                  description="Require exact document reference format before granting the Verified Business badge."
                  checked={verification.cr14StrictCheck}
                  onChange={(v) => setVerification((s) => ({ ...s, cr14StrictCheck: v }))}
                />
                <div className="flex justify-end pt-3">
                  <AdminButton onClick={() => handleSave('Verification Portals')}>
                    Save Verification Settings
                  </AdminButton>
                </div>
              </div>
            </Panel>
          )}

          {active === 'notifications' && (
            <Panel>
              <PanelHeading
                title="Executive Alerts & Notifications"
                hint="Configure real-time email and WhatsApp/SMS notifications for platform events."
              />
              <div className="mt-5 space-y-3">
                <Toggle
                  label="New Business KYC & Quote Enquiry Alerts"
                  description="Send immediate email alert when a business submits CR14 documents or a buyer sends an enquiry."
                  checked={notifications.newEnquiry}
                  onChange={(v) => setNotifications((n) => ({ ...n, newEnquiry: v }))}
                />
                <Toggle
                  label="Automated 30-Day Grace Period Expiry Reminders"
                  description="Automatically notify businesses 7 days and 48 hours before their 30-day complimentary trial expires."
                  checked={notifications.graceExpiryAlerts}
                  onChange={(v) => setNotifications((n) => ({ ...n, graceExpiryAlerts: v }))}
                />
                <Toggle
                  label="Monday Executive Revenue & Traffic Digest"
                  description="Weekly summary of subscriptions, $20/mo sponsored adverts, and marketplace GMV."
                  checked={notifications.weeklyDigest}
                  onChange={(v) => setNotifications((n) => ({ ...n, weeklyDigest: v }))}
                />
                <Toggle
                  label="SMS Alerts for High-Value Orders ($1,000+ USD)"
                  description="Dispatch SMS to the primary operations hotline for high-value corporate orders."
                  checked={notifications.smsAlerts}
                  onChange={(v) => setNotifications((n) => ({ ...n, smsAlerts: v }))}
                />
                <div className="flex justify-end pt-3">
                  <AdminButton onClick={() => handleSave('Notification Preferences')}>
                    Save Notification Preferences
                  </AdminButton>
                </div>
              </div>
            </Panel>
          )}

          {active === 'security' && (
            <div className="space-y-5">
              <Panel>
                <PanelHeading
                  title="Rotate Administrator Password"
                  hint="Ensure your executive console credentials use a strong passphrase."
                />
                <form onSubmit={handlePasswordUpdate} className="mt-5 space-y-4">
                  <AdminInput
                    label="Current Password"
                    type="password"
                    value={security.current}
                    onChange={(e) => setSecurity((s) => ({ ...s, current: e.target.value }))}
                    required
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <AdminInput
                      label="New Password (min 8 chars)"
                      type="password"
                      value={security.next}
                      onChange={(e) => setSecurity((s) => ({ ...s, next: e.target.value }))}
                      required
                    />
                    <AdminInput
                      label="Confirm New Password"
                      type="password"
                      value={security.confirm}
                      onChange={(e) => setSecurity((s) => ({ ...s, confirm: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <AdminButton type="submit">Update Password</AdminButton>
                  </div>
                </form>
              </Panel>

              <Panel>
                <PanelHeading
                  title="Two-Factor Authentication (2FA)"
                  hint="Protect administrative actions and payout approvals."
                />
                <div className="mt-5">
                  <Toggle
                    label="Require Authenticator App Code (TOTP)"
                    description="Prompt for a 6-digit verification code when signing in to the Executive Admin Console."
                    checked={twoFactor}
                    onChange={(v) => {
                      setTwoFactor(v);
                      toast({
                        title: v ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication Disabled',
                        variant: 'success',
                      });
                    }}
                  />
                </div>
              </Panel>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
