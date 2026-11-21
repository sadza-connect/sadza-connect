'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  Phone,
  ShieldCheck,
  Bell,
  Lock,
  Truck,
  DollarSign,
  CheckCircle2,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';
import {
  AdminPageHeader,
  Panel,
  PanelHeading,
  AdminButton,
  AdminInput,
  AdminTextarea,
  AdminBadge,
} from '@/components/admin/AdminUI';
import { ImageUploader, type UploadedMediaItem } from '@/components/admin/ImageUploader';
import { useToast } from '@/components/providers/ToastProvider';
import {
  getPlatformSettings,
  savePlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
  PlatformSettings,
} from '@/data/platformStore';
import { PLATFORM_PRICING } from '@/lib/constants/pricing';
import { getClientAccessToken } from '@/shared/utils/api-client';
import { detectCountryFromPhone, normalizePhoneNumber, CountryDialInfo } from '@/lib/data/countries';
import { sanitizePhoneNumber } from '@/lib/utils/whatsapp';

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
  { id: 'pricing', label: 'Fees & Rates (Static)', icon: Lock },
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

  // Company profile — intentionally blank by default (no hardcoded demo values)
  const [profile, setProfile] = useState({
    name: '',
    cr14Number: '',
    zimraTin: '',
    tagline: '',
    established: '',
    vision: '',
    mission: '',
  });

  const [logoAsset, setLogoAsset] = useState<UploadedMediaItem[]>([]);
  const [signatureAsset, setSignatureAsset] = useState<UploadedMediaItem[]>([]);

  // Contact details — intentionally blank by default (no hardcoded demo values)
  const [contact, setContact] = useState({
    email: '',
    phone: '',
    whatsapp: '',
    hours: '',
    line1: '',
    line2: '',
    city: '',
    province: '',
  });
  const [detectedPhoneCountry, setDetectedPhoneCountry] = useState<CountryDialInfo | null>(null);
  const [detectedWhatsappCountry, setDetectedWhatsappCountry] = useState<CountryDialInfo | null>(null);

  // Commercial Pricing & USD/ZiG Rates
  const [pricing, setPricing] = useState({
    graceDays: '30',
    standardListingUsd: '15',
    soloListingUsd: '5',
    coopListingUsd: '10',
    corporateListingUsd: '15',
    sponsoredAdvertUsd: '20',
    homepageSlotsCap: '6',
    zigExchangeRate: '27.50',
    zesaServiceFeePct: '1.5',
    vatPct: '15',
    ecocashMerchantCode: '774920',
    innbucksMerchantCode: 'SC-ZW-881',
    tierStarterName: 'Starter Storefront',
    tierStarterLimit: '25',
    tierStarterPriceUsd: '15.00',
    tierGrowthName: 'Growth Storefront',
    tierGrowthLimit: '100',
    tierGrowthPriceUsd: '25.00',
    tierEnterpriseName: 'Enterprise Wholesaler',
    tierEnterpriseLimit: '300',
    tierEnterprisePriceUsd: '50.00',
  });

  // Shipping & Logistics
  const [shipping, setShipping] = useState({
    pickupEnabled: true,
    pickupName: 'MySadza Connect Central Dispatch Hub (Graniteside)',
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

  // Verification portals & Platform Governance
  const [verification, setVerification] = useState({
    receiptPortal: true,
    staffPortal: true,
    cr14StrictCheck: true,
    autoApproveTier1: false,
    allowPublicReviews: true,
    allowBusinessRegistration: true,
    allowPropertySubmissions: true,
    maintenanceMode: false,
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    newEnquiry: true,
    graceExpiryAlerts: true,
    weeklyDigest: true,
    smsAlerts: false,
  });

  // Security & Two-Factor Authentication (2FA)
  const [security, setSecurity] = useState({ current: '', next: '', confirm: '' });
  const [securityPolicies, setSecurityPolicies] = useState({
    twoFactorAdmin: true,
    twoFactorBusiness: false,
    requireEmailVerification: true,
    requirePasswordOnDelete: true,
    revokeTokensOnSuspend: true,
    sessionTimeoutMinutes: '240',
  });

  // Synchronize with database and persistent platform store on mount
  useEffect(() => {
    const local = getPlatformSettings();
    if (local) {
      setPricing((prev) => ({
        ...prev,
        graceDays: local.freeGracePeriodDays.toString(),
        standardListingUsd: (local.corporateMonthlyPriceUsd ?? local.monthlySubscriptionPriceUsd ?? 15).toString(),
        soloListingUsd: (local.soloMonthlyPriceUsd ?? 5).toString(),
        coopListingUsd: (local.coopMonthlyPriceUsd ?? 10).toString(),
        corporateListingUsd: (local.corporateMonthlyPriceUsd ?? local.monthlySubscriptionPriceUsd ?? 15).toString(),
        sponsoredAdvertUsd: local.sponsoredAdvertPriceUsd.toString(),
        zigExchangeRate: local.usdToZigRate.toString(),
        vatPct: (local.vatPct ?? 15).toString(),
        zesaServiceFeePct: (local.zesaServiceFeePct ?? 1.5).toString(),
        ecocashMerchantCode: local.ecocashMerchantCode ?? prev.ecocashMerchantCode,
        innbucksMerchantCode: local.innbucksMerchantCode ?? prev.innbucksMerchantCode,
      }));
      if (local.shipping) setShipping((s) => ({ ...s, ...local.shipping }));
      if (local.verification) setVerification((v) => ({ ...v, ...local.verification }));
      if (local.notifications) setNotifications((n) => ({ ...n, ...local.notifications }));
    }

    // Sync directly from PostgreSQL API
    fetch('/api/v1/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.settings) {
          const s = json.data.settings;
          const extra = s.extra_config || {};
          setPricing((prev) => ({
            ...prev,
            graceDays: s.free_grace_period_days?.toString() || prev.graceDays,
            standardListingUsd: (extra.corporateMonthlyPriceUsd ?? s.monthly_subscription_price_usd)?.toString() || prev.standardListingUsd,
            soloListingUsd: (extra.soloMonthlyPriceUsd ?? 5)?.toString() || prev.soloListingUsd,
            coopListingUsd: (extra.coopMonthlyPriceUsd ?? 10)?.toString() || prev.coopListingUsd,
            corporateListingUsd: (extra.corporateMonthlyPriceUsd ?? s.monthly_subscription_price_usd ?? 15)?.toString() || prev.corporateListingUsd,
            sponsoredAdvertUsd: s.sponsored_advert_price_usd?.toString() || prev.sponsoredAdvertUsd,
            zigExchangeRate: s.usd_to_zig_rate?.toString() || prev.zigExchangeRate,
            vatPct: extra.vatPct?.toString() || prev.vatPct,
            zesaServiceFeePct: extra.zesaServiceFeePct?.toString() || prev.zesaServiceFeePct,
            ecocashMerchantCode: extra.ecocashMerchantCode || prev.ecocashMerchantCode,
            innbucksMerchantCode: extra.innbucksMerchantCode || prev.innbucksMerchantCode,
            tierStarterName: s.tier_starter_name || prev.tierStarterName,
            tierStarterLimit: s.tier_starter_limit?.toString() || prev.tierStarterLimit,
            tierStarterPriceUsd: s.tier_starter_price_usd?.toString() || prev.tierStarterPriceUsd,
            tierGrowthName: s.tier_growth_name || prev.tierGrowthName,
            tierGrowthLimit: s.tier_growth_limit?.toString() || prev.tierGrowthLimit,
            tierGrowthPriceUsd: s.tier_growth_price_usd?.toString() || prev.tierGrowthPriceUsd,
            tierEnterpriseName: s.tier_enterprise_name || prev.tierEnterpriseName,
            tierEnterpriseLimit: s.tier_enterprise_limit?.toString() || prev.tierEnterpriseLimit,
            tierEnterprisePriceUsd: s.tier_enterprise_price_usd?.toString() || prev.tierEnterprisePriceUsd,
          }));
          // Only hydrate Company Profile & Contact Details if explicitly saved by admin
          if (extra.profile_configured && extra.profile) {
            setProfile({
              name: extra.profile.name || '',
              cr14Number: extra.profile.cr14Number || '',
              zimraTin: extra.profile.zimraTin || '',
              tagline: extra.profile.tagline || '',
              established: extra.profile.established || '',
              vision: extra.profile.vision || '',
              mission: extra.profile.mission || '',
            });
            if (Array.isArray(extra.profile.logoAsset)) setLogoAsset(extra.profile.logoAsset);
            if (Array.isArray(extra.profile.signatureAsset)) setSignatureAsset(extra.profile.signatureAsset);
          }
          if (extra.contact_configured && extra.contact) {
            setContact({
              email: extra.contact.email || '',
              phone: extra.contact.phone || '',
              whatsapp: extra.contact.whatsapp || '',
              hours: extra.contact.hours || '',
              line1: extra.contact.line1 || '',
              line2: extra.contact.line2 || '',
              city: extra.contact.city || '',
              province: extra.contact.province || '',
            });
          }
          if (extra.shipping) setShipping((prev) => ({ ...prev, ...extra.shipping }));
          if (extra.verification) setVerification((prev) => ({ ...prev, ...extra.verification }));
          if (extra.notifications) setNotifications((prev) => ({ ...prev, ...extra.notifications }));
          if (extra.security) setSecurityPolicies((prev) => ({ ...prev, ...extra.security }));
        }
      })
      .catch(() => {});
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const [isRotatingPassword, setIsRotatingPassword] = useState(false);

  async function handleSave(
    sectionLabel: string,
    overrides?: {
      profileOverride?: typeof profile;
      contactOverride?: typeof contact;
      logoOverride?: UploadedMediaItem[];
      signatureOverride?: UploadedMediaItem[];
      profileConfiguredOverride?: boolean;
      contactConfiguredOverride?: boolean;
      securityOverride?: typeof securityPolicies;
      verificationOverride?: typeof verification;
    }
  ) {
    const activeProfile = overrides?.profileOverride ?? profile;
    const activeContact = overrides?.contactOverride ?? contact;
    const activeLogo = overrides?.logoOverride ?? logoAsset;
    const activeSignature = overrides?.signatureOverride ?? signatureAsset;
    const activeSecurity = overrides?.securityOverride ?? securityPolicies;
    const activeVerification = overrides?.verificationOverride ?? verification;

    const hasProfileValues =
      overrides?.profileConfiguredOverride ??
      Boolean(
        activeProfile.name.trim() ||
          activeProfile.cr14Number.trim() ||
          activeProfile.zimraTin.trim() ||
          activeProfile.tagline.trim() ||
          activeProfile.established.trim() ||
          activeProfile.vision.trim() ||
          activeProfile.mission.trim() ||
          activeLogo.length > 0 ||
          activeSignature.length > 0
      );

    const hasContactValues =
      overrides?.contactConfiguredOverride ??
      Boolean(
        activeContact.email.trim() ||
          activeContact.phone.trim() ||
          activeContact.whatsapp.trim() ||
          activeContact.hours.trim() ||
          activeContact.line1.trim() ||
          activeContact.line2.trim() ||
          activeContact.city.trim() ||
          activeContact.province.trim()
      );

    const usdToZig =
      parseFloat(pricing.zigExchangeRate) || PLATFORM_PRICING.STATUTORY.REFERENCE_USD_TO_ZIG;
    const listingUsd = PLATFORM_PRICING.SUBSCRIPTIONS.STANDARD_MONTHLY_USD;
    const soloUsd = PLATFORM_PRICING.SUBSCRIPTIONS.TRACK_B_SOLO_OPERATOR_USD;
    const coopUsd = PLATFORM_PRICING.SUBSCRIPTIONS.TRACK_C_COOPERATIVE_USD;
    const corporateUsd = PLATFORM_PRICING.SUBSCRIPTIONS.TRACK_A_CORPORATE_USD;
    const advertUsd = PLATFORM_PRICING.SINGLE_SPONSORED_ADVERT_USD;
    const graceDays = PLATFORM_PRICING.GRACE_PERIOD.DAYS;
    const starterLimit = Math.max(1, parseInt(pricing.tierStarterLimit, 10) || 25);
    const growthLimit = Math.max(1, parseInt(pricing.tierGrowthLimit, 10) || 100);
    const enterpriseLimit = Math.max(1, parseInt(pricing.tierEnterpriseLimit, 10) || 300);

    const computedHqAddress = [activeProfile.name.trim(), activeContact.line1.trim(), activeContact.city.trim()]
      .filter(Boolean)
      .join(', ');
    const computedHarareAddress = [activeContact.line1.trim(), activeContact.line2.trim(), activeContact.city.trim()]
      .filter(Boolean)
      .join(', ');

    const updatedPlatformSettings: PlatformSettings = {
      siteName: activeProfile.name.trim() || DEFAULT_PLATFORM_SETTINGS.siteName,
      tagline: activeProfile.tagline.trim() || DEFAULT_PLATFORM_SETTINGS.tagline,
      announcementText: `New Business Registrations Receive a ${graceDays}-Day Free Grace Period • Active Monthly Listing from $${soloUsd}/mo • Direct WhatsApp Trade`,
      usdToZigRate: usdToZig,
      monthlySubscriptionPriceUsd: listingUsd,
      soloMonthlyPriceUsd: soloUsd,
      coopMonthlyPriceUsd: coopUsd,
      corporateMonthlyPriceUsd: corporateUsd,
      tierStarterName: pricing.tierStarterName || 'Starter Storefront',
      tierStarterLimit: starterLimit,
      tierStarterPriceUsd: 15.0,
      tierGrowthName: pricing.tierGrowthName || 'Growth Storefront',
      tierGrowthLimit: growthLimit,
      tierGrowthPriceUsd: 25.0,
      tierEnterpriseName: pricing.tierEnterpriseName || 'Enterprise Wholesaler',
      tierEnterpriseLimit: enterpriseLimit,
      tierEnterprisePriceUsd: 50.0,
      sponsoredAdvertPriceUsd: advertUsd,
      freeGracePeriodDays: graceDays,
      supportWhatsApp: activeContact.whatsapp.trim() || DEFAULT_PLATFORM_SETTINGS.supportWhatsApp,
      supportPhone: activeContact.phone.trim() || DEFAULT_PLATFORM_SETTINGS.supportPhone,
      supportEmail: activeContact.email.trim() || DEFAULT_PLATFORM_SETTINGS.supportEmail,
      hqAddress: computedHqAddress || DEFAULT_PLATFORM_SETTINGS.hqAddress,
      harareAddress: computedHarareAddress || DEFAULT_PLATFORM_SETTINGS.harareAddress,
      operatingHours: activeContact.hours.trim() || DEFAULT_PLATFORM_SETTINGS.operatingHours,
      autoApproveTier1: activeVerification.autoApproveTier1,
      requireEmailVerification: activeSecurity.requireEmailVerification,
      allowPublicReviews: activeVerification.allowPublicReviews,
      aboutHeadline: activeProfile.tagline.trim() || DEFAULT_PLATFORM_SETTINGS.aboutHeadline,
      aboutMission: activeProfile.mission.trim() || DEFAULT_PLATFORM_SETTINGS.aboutMission,
      aboutVision: activeProfile.vision.trim() || DEFAULT_PLATFORM_SETTINGS.aboutVision,
      companyLogoUrl: hasProfileValues ? activeLogo[0]?.src || '' : '',
      registrarSignatureUrl: hasProfileValues ? activeSignature[0]?.src || '' : '',
      cr14Number: hasProfileValues ? activeProfile.cr14Number.trim() : '',
      zimraTin: hasProfileValues ? activeProfile.zimraTin.trim() : '',
      vatPct: PLATFORM_PRICING.STATUTORY.ZIMBABWE_VAT_PCT,
      zesaServiceFeePct: PLATFORM_PRICING.COMMISSIONS.ZESA_UTILITY_SERVICE_FEE_PCT,
      ecocashMerchantCode: pricing.ecocashMerchantCode,
      innbucksMerchantCode: pricing.innbucksMerchantCode,
      homepageSlotsCap: 6,
      shipping,
      verification: activeVerification,
      notifications,
    };

    try {
      setIsSaving(true);
      const token = getClientAccessToken();

      const res = await fetch('/api/v1/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          usd_to_zig_rate: usdToZig,
          support_whatsapp: activeContact.whatsapp.trim()
            ? sanitizePhoneNumber(activeContact.whatsapp)
            : DEFAULT_PLATFORM_SETTINGS.supportWhatsApp,
          support_phone: activeContact.phone.trim()
            ? normalizePhoneNumber(activeContact.phone)
            : DEFAULT_PLATFORM_SETTINGS.supportPhone,
          support_email:
            activeContact.email.trim() && activeContact.email.includes('@')
              ? activeContact.email.trim()
              : DEFAULT_PLATFORM_SETTINGS.supportEmail,
          hq_address: computedHqAddress || DEFAULT_PLATFORM_SETTINGS.hqAddress,
          harare_address: computedHarareAddress || DEFAULT_PLATFORM_SETTINGS.harareAddress,
          operating_hours: activeContact.hours.trim() || DEFAULT_PLATFORM_SETTINGS.operatingHours,
          about_headline: activeProfile.tagline.trim() || DEFAULT_PLATFORM_SETTINGS.aboutHeadline,
          about_mission: activeProfile.mission.trim() || DEFAULT_PLATFORM_SETTINGS.aboutMission,
          about_vision: activeProfile.vision.trim() || DEFAULT_PLATFORM_SETTINGS.aboutVision,
          tier_starter_name: pricing.tierStarterName || 'Starter Storefront',
          tier_starter_limit: starterLimit,
          tier_growth_name: pricing.tierGrowthName || 'Growth Storefront',
          tier_growth_limit: growthLimit,
          tier_enterprise_name: pricing.tierEnterpriseName || 'Enterprise Wholesaler',
          tier_enterprise_limit: enterpriseLimit,
          extra_config: {
            profile_configured: hasProfileValues,
            contact_configured: hasContactValues,
            profile: {
              ...activeProfile,
              logoAsset: activeLogo,
              signatureAsset: activeSignature,
            },
            contact: activeContact,
            shipping,
            verification: activeVerification,
            notifications,
            security: activeSecurity,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'Failed to persist settings to server');
      }

      // 1. Dispatch update to all components across the browser
      savePlatformSettings(updatedPlatformSettings);

      toast({
        title: `${sectionLabel} Saved`,
        description: 'Your configuration updates are now live across MySadza Connect.',
        variant: 'success',
      });
    } catch (err: any) {
      console.error('Failed to sync settings with server:', err);
      toast({
        title: `Failed to Save ${sectionLabel}`,
        description: err.message || 'Could not persist settings to server. Check your admin privileges.',
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!security.current) {
      toast({
        title: 'Current Password Required',
        description: 'Please enter your current administrator password.',
        variant: 'error',
      });
      return;
    }
    if (security.next !== security.confirm) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'New password and confirmation must match.',
        variant: 'error',
      });
      return;
    }
    if (security.next.length < 8) {
      toast({
        title: 'Password Too Short',
        description: 'New password must be at least 8 characters long.',
        variant: 'error',
      });
      return;
    }

    try {
      setIsRotatingPassword(true);
      const token = getClientAccessToken();
      const res = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: security.current,
          newPassword: security.next,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'Failed to rotate administrator credentials');
      }

      toast({
        title: 'Executive Password Updated',
        description: 'Your administrator credentials have been rotated successfully in the database.',
        variant: 'success',
      });
      setSecurity({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      toast({
        title: 'Password Rotation Failed',
        description: err.message || 'Failed to update credentials. Please check your current password.',
        variant: 'error',
      });
    } finally {
      setIsRotatingPassword(false);
    }
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
                hint="All fields are blank by default. Only values you explicitly enter and save here will override the default corporate profile."
              />

              <div className="mt-4 rounded-xl border border-blue-200/80 bg-blue-50/60 p-3.5 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">Where Company Profile updates appear in the app:</p>
                <p className="text-slate-600 leading-relaxed">
                  • <strong>Tagline, Corporate Vision, Corporate Mission &amp; Registration Details</strong> reflect live on the{' '}
                  <a href="/about" target="_blank" rel="noopener noreferrer" className="font-bold text-[#1e57eb] underline">
                    About Us (/about)
                  </a>{' '}
                  page.<br />
                  • <strong>Registered Corporate Name</strong> reflects in the{' '}
                  <a href="/" target="_blank" rel="noopener noreferrer" className="font-bold text-[#1e57eb] underline">
                    Public Website Footer
                  </a>{' '}
                  and{' '}
                  <a href="/contact" target="_blank" rel="noopener noreferrer" className="font-bold text-[#1e57eb] underline">
                    Contact Us (/contact)
                  </a>{' '}
                  header.<br />
                  • <strong>Company Logo &amp; Registrar Signature</strong> are stored for official{' '}
                  <a href="/admin/id-cards" className="font-bold text-[#1e57eb] underline">
                    Digital ID Cards (/admin/id-cards)
                  </a>{' '}
                  and verification records.
                </p>
              </div>

              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <AdminInput
                    label="Registered Corporate Name"
                    placeholder="Leave blank for default or enter corporate name"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  />
                  <AdminInput
                    label="CR14 / Corporate Registration Number"
                    placeholder="Leave blank or enter CR14 registration number"
                    value={profile.cr14Number}
                    onChange={(e) => setProfile((p) => ({ ...p, cr14Number: e.target.value }))}
                  />
                  <AdminInput
                    label="ZIMRA TIN Number"
                    placeholder="Leave blank or enter ZIMRA TIN"
                    value={profile.zimraTin}
                    onChange={(e) => setProfile((p) => ({ ...p, zimraTin: e.target.value }))}
                  />
                  <AdminInput
                    label="Year Established"
                    type="number"
                    placeholder="e.g. 2024"
                    value={profile.established}
                    onChange={(e) => setProfile((p) => ({ ...p, established: e.target.value }))}
                  />
                  <div className="sm:col-span-2">
                    <AdminInput
                      label="Platform Tagline (About Us Headline)"
                      placeholder="Leave blank for default or enter custom headline"
                      value={profile.tagline}
                      onChange={(e) => setProfile((p) => ({ ...p, tagline: e.target.value }))}
                    />
                  </div>
                </div>
                <AdminTextarea
                  label="Corporate Vision"
                  rows={3}
                  placeholder="Leave blank for default or enter custom corporate vision..."
                  value={profile.vision}
                  onChange={(e) => setProfile((p) => ({ ...p, vision: e.target.value }))}
                />
                <AdminTextarea
                  label="Corporate Mission"
                  rows={3}
                  placeholder="Leave blank for default or enter custom corporate mission..."
                  value={profile.mission}
                  onChange={(e) => setProfile((p) => ({ ...p, mission: e.target.value }))}
                />

                <div className="space-y-4 border-t border-slate-100 pt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1e57eb]">
                    Company Brand Crest &amp; Authorized ID Card Signature
                  </h4>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <ImageUploader
                      label="Company Logo Asset"
                      hint="Upload official company crest from device (blank by default)"
                      multiple={false}
                      images={logoAsset}
                      onChange={setLogoAsset}
                    />
                    <ImageUploader
                      label="Authorized Signature (For ID Cards & Receipts)"
                      hint="Upload registrar signature for PVC ID cards & official receipts (blank by default)"
                      multiple={false}
                      images={signatureAsset}
                      onChange={setSignatureAsset}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <AdminButton
                    variant="secondary"
                    disabled={isSaving}
                    onClick={() => {
                      const emptyProfile = {
                        name: '',
                        cr14Number: '',
                        zimraTin: '',
                        tagline: '',
                        established: '',
                        vision: '',
                        mission: '',
                      };
                      setProfile(emptyProfile);
                      setLogoAsset([]);
                      setSignatureAsset([]);
                      handleSave('Company Profile (Cleared)', {
                        profileOverride: emptyProfile,
                        logoOverride: [],
                        signatureOverride: [],
                        profileConfiguredOverride: false,
                      });
                    }}
                  >
                    Clear to Blank
                  </AdminButton>
                  <AdminButton
                    loading={isSaving}
                    disabled={isSaving}
                    onClick={() => handleSave('Company Profile')}
                  >
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
                hint="All fields are blank by default. Only values you explicitly enter and save here will override the default support contact details."
              />

              <div className="mt-4 rounded-xl border border-blue-200/80 bg-blue-50/60 p-3.5 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">Where Contact Details updates appear in the app:</p>
                <p className="text-slate-600 leading-relaxed">
                  • <strong>Operations Email, Desk Phone, WhatsApp Hotline, Operating Hours &amp; Addresses</strong> reflect live on the{' '}
                  <a href="/contact" target="_blank" rel="noopener noreferrer" className="font-bold text-[#1e57eb] underline">
                    Contact Us (/contact)
                  </a>{' '}
                  page.<br />
                  • <strong>Headquarters Address, Operations Email &amp; WhatsApp Support Button</strong> reflect in the{' '}
                  <a href="/" target="_blank" rel="noopener noreferrer" className="font-bold text-[#1e57eb] underline">
                    Public Website Footer
                  </a>{' '}
                  across all pages.
                </p>
              </div>

              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <AdminInput
                    label="Operations Email"
                    type="email"
                    placeholder="Leave blank or enter operations email"
                    value={contact.email}
                    onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                  />
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Primary Landline / Desk Phone
                      </label>
                      {detectedPhoneCountry && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <span>{detectedPhoneCountry.flag}</span>
                          <span>{detectedPhoneCountry.name} ({detectedPhoneCountry.dialCode})</span>
                        </span>
                      )}
                    </div>
                    <AdminInput
                      label=""
                      placeholder="Leave blank or enter desk phone"
                      value={contact.phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContact((c) => ({ ...c, phone: val }));
                        const res = detectCountryFromPhone(val);
                        if (res.detected && res.country) {
                          setDetectedPhoneCountry(res.country);
                        } else if (!val.trim()) {
                          setDetectedPhoneCountry(null);
                        }
                      }}
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData('text');
                        if (pasted) {
                          const res = detectCountryFromPhone(pasted);
                          if (res.detected && res.country) {
                            setDetectedPhoneCountry(res.country);
                          }
                        }
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Official WhatsApp Hotline
                      </label>
                      {detectedWhatsappCountry && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <span>{detectedWhatsappCountry.flag}</span>
                          <span>{detectedWhatsappCountry.name} ({detectedWhatsappCountry.dialCode})</span>
                        </span>
                      )}
                    </div>
                    <AdminInput
                      label=""
                      placeholder="Leave blank or enter WhatsApp number"
                      value={contact.whatsapp}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContact((c) => ({ ...c, whatsapp: val }));
                        const res = detectCountryFromPhone(val);
                        if (res.detected && res.country) {
                          setDetectedWhatsappCountry(res.country);
                        } else if (!val.trim()) {
                          setDetectedWhatsappCountry(null);
                        }
                      }}
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData('text');
                        if (pasted) {
                          const res = detectCountryFromPhone(pasted);
                          if (res.detected && res.country) {
                            setDetectedWhatsappCountry(res.country);
                          }
                        }
                      }}
                    />
                  </div>
                  <AdminInput
                    label="Operating Hours"
                    placeholder="Leave blank or enter operating hours"
                    value={contact.hours}
                    onChange={(e) => setContact((c) => ({ ...c, hours: e.target.value }))}
                  />
                  <AdminInput
                    label="Address Line 1"
                    placeholder="Leave blank or enter street address"
                    value={contact.line1}
                    onChange={(e) => setContact((c) => ({ ...c, line1: e.target.value }))}
                  />
                  <AdminInput
                    label="Address Line 2"
                    placeholder="Leave blank or enter building / suite"
                    value={contact.line2}
                    onChange={(e) => setContact((c) => ({ ...c, line2: e.target.value }))}
                  />
                  <AdminInput
                    label="City"
                    placeholder="Leave blank or enter city"
                    value={contact.city}
                    onChange={(e) => setContact((c) => ({ ...c, city: e.target.value }))}
                  />
                  <AdminInput
                    label="Province (Clean Name)"
                    placeholder="Leave blank or enter province"
                    value={contact.province}
                    onChange={(e) => setContact((c) => ({ ...c, province: e.target.value }))}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 pt-2">
                  <AdminButton
                    variant="secondary"
                    disabled={isSaving}
                    onClick={() => {
                      const emptyContact = {
                        email: '',
                        phone: '',
                        whatsapp: '',
                        hours: '',
                        line1: '',
                        line2: '',
                        city: '',
                        province: '',
                      };
                      setContact(emptyContact);
                      setDetectedPhoneCountry(null);
                      setDetectedWhatsappCountry(null);
                      handleSave('Contact Details (Cleared)', {
                        contactOverride: emptyContact,
                        contactConfiguredOverride: false,
                      });
                    }}
                  >
                    Clear to Blank
                  </AdminButton>
                  <AdminButton
                    loading={isSaving}
                    disabled={isSaving}
                    onClick={() => handleSave('Contact Details')}
                  >
                    Save Contact Details
                  </AdminButton>
                </div>
              </div>
            </Panel>
          )}

          {active === 'pricing' && (
            <div className="space-y-6">
              <Panel>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-base font-bold text-slate-900">
                        Official Platform Financial Schedule &amp; Fixed Tariffs
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Standard, immutable platform financial architecture synchronized with Flutterwave, EcoCash, and InnBucks gateway integrations.
                    </p>
                  </div>
                  <AdminBadge tone="success" dot>
                    Locked &amp; Verified
                  </AdminBadge>
                </div>

                {/* Important Integrity Callout */}
                <div className="mt-5 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 text-xs text-amber-900 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">
                      Immutable Financial Configuration (Flutterwave Gateway Compliance)
                    </p>
                    <p className="text-amber-800 leading-relaxed">
                      All platform membership fees, storefront product limits, advert campaign packages, and tenant unlock rates are fixed in code. Modifications from the admin console are disabled to ensure strict commercial reconciliation and prevent unauthorized rate adjustments.
                    </p>
                  </div>
                </div>

                {/* Section 1: Business Memberships & Grace Period */}
                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <span>1. Business Directory &amp; Membership Subscriptions</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Month 1 Onboarding</span>
                      <div className="mt-1 text-2xl font-black text-emerald-600">$0.00 Free</div>
                      <p className="mt-1 text-xs text-slate-600 font-medium">{PLATFORM_PRICING.GRACE_PERIOD.DAYS}-Day Full Grace Period</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Track A: Corporate</span>
                      <div className="mt-1 text-2xl font-black text-slate-900">${PLATFORM_PRICING.SUBSCRIPTIONS.TRACK_A_CORPORATE_USD} <span className="text-xs font-normal text-slate-500">USD/mo</span></div>
                      <p className="mt-1 text-xs text-slate-600">Pvt Ltd, PBC, Wholesalers</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Track B: Solo Operator</span>
                      <div className="mt-1 text-2xl font-black text-slate-900">${PLATFORM_PRICING.SUBSCRIPTIONS.TRACK_B_SOLO_OPERATOR_USD} <span className="text-xs font-normal text-slate-500">USD/mo</span></div>
                      <p className="mt-1 text-xs text-slate-600">Sole Proprietors &amp; Artisans</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Track C: Cooperative</span>
                      <div className="mt-1 text-2xl font-black text-slate-900">${PLATFORM_PRICING.SUBSCRIPTIONS.TRACK_C_COOPERATIVE_USD} <span className="text-xs font-normal text-slate-500">USD/mo</span></div>
                      <p className="mt-1 text-xs text-slate-600">Agro-Collectives &amp; NGOs</p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Storefront Catalog Quotas */}
                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <span>2. Storefront Catalog Quotas &amp; Tier Pricing</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PLATFORM_PRICING.STOREFRONT_TIERS.map((tier) => (
                      <div key={tier.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{tier.name}</span>
                          <span className="text-xs font-bold text-emerald-600">${tier.priceUsd} USD/mo</span>
                        </div>
                        <div className="mt-2 text-xs text-slate-600">
                          Quota: <strong className="text-slate-900">Up to {tier.productQuota} products</strong>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">{tier.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3: Advert Packages */}
                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <span>3. Classified &amp; Business Advert Packages (/adverts)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {PLATFORM_PRICING.ADVERT_PACKAGES.map((pkg) => (
                      <div key={pkg.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{pkg.name}</span>
                            <span className="text-xs font-bold text-amber-600">
                              {pkg.priceUsd === 0 ? '$0 Free' : `$${pkg.priceUsd} /mo`}
                            </span>
                          </div>
                          <div className="mt-1.5 text-xs font-semibold text-slate-700">
                            ⚡ {pkg.advertLimitText}
                          </div>
                          <p className="mt-1 text-[11px] text-slate-500">{pkg.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Real Estate & Core Platform Terms */}
                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <span>4. Core Platform Tariffs &amp; Commission Rules</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Property Phone Unlock</span>
                      <div className="mt-1 text-2xl font-black text-slate-900">${PLATFORM_PRICING.PROPERTY_PHONE_UNLOCK_FEE_USD}.00 <span className="text-xs font-normal text-slate-500">USD</span></div>
                      <p className="mt-1 text-xs text-slate-600">Paid by inquiring tenant per listing</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Marketplace Commission</span>
                      <div className="mt-1 text-2xl font-black text-emerald-600">0.0% <span className="text-xs font-normal text-slate-500">Zero Commission</span></div>
                      <p className="mt-1 text-xs text-slate-600">Direct WhatsApp trade &amp; settlement</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">ZESA Utility Token Fee</span>
                      <div className="mt-1 text-2xl font-black text-slate-900">{PLATFORM_PRICING.COMMISSIONS.ZESA_UTILITY_SERVICE_FEE_PCT}%</div>
                      <p className="mt-1 text-xs text-slate-600">Token processing surcharge</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Statutory VAT</span>
                      <div className="mt-1 text-2xl font-black text-slate-900">{PLATFORM_PRICING.STATUTORY.ZIMBABWE_VAT_PCT}%</div>
                      <p className="mt-1 text-xs text-slate-600">Official Zimbabwe Tax Baseline</p>
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
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
            <div className="space-y-5">
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
                    label="Staff & Field Inspector ID Verification (/verify-id)"
                    description="Allow businesses to scan and verify MySadza Connect field agent PVC ID cards."
                    checked={verification.staffPortal}
                    onChange={(v) => setVerification((s) => ({ ...s, staffPortal: v }))}
                  />
                  <Toggle
                    label="Strict CR14 / ZIMRA Tax Clearance Matching"
                    description="Require exact document reference format before granting the Verified Business badge."
                    checked={verification.cr14StrictCheck}
                    onChange={(v) => setVerification((s) => ({ ...s, cr14StrictCheck: v }))}
                  />
                </div>
              </Panel>

              <Panel>
                <PanelHeading
                  title="Platform Access & Onboarding Governance"
                  hint="Control self-service business onboarding, public reviews, property submissions, and maintenance mode."
                />
                <div className="mt-5 space-y-3">
                  <Toggle
                    label="Open Self-Service Business Registration"
                    description="Allow new businesses to register and start their 30-day complimentary grace period."
                    checked={verification.allowBusinessRegistration}
                    onChange={(v) => setVerification((s) => ({ ...s, allowBusinessRegistration: v }))}
                  />
                  <Toggle
                    label="Auto-Approve Tier 1 Basic Directory Profiles"
                    description="Automatically publish basic directory profiles upon registration while CR14 KYC review is pending."
                    checked={verification.autoApproveTier1}
                    onChange={(v) => setVerification((s) => ({ ...s, autoApproveTier1: v }))}
                  />
                  <Toggle
                    label="Allow Public Business & Marketplace Reviews"
                    description="Let verified buyers submit star ratings and reviews on business profiles."
                    checked={verification.allowPublicReviews}
                    onChange={(v) => setVerification((s) => ({ ...s, allowPublicReviews: v }))}
                  />
                  <Toggle
                    label="Open Property & Tourism Host Submissions"
                    description="Allow verified landlords, agents, and hospitality operators to submit new listings for moderation."
                    checked={verification.allowPropertySubmissions}
                    onChange={(v) => setVerification((s) => ({ ...s, allowPropertySubmissions: v }))}
                  />
                  <Toggle
                    label="Platform Maintenance Mode Banner"
                    description="Display a scheduled maintenance notice across public pages while keeping admin access active."
                    checked={verification.maintenanceMode}
                    onChange={(v) => setVerification((s) => ({ ...s, maintenanceMode: v }))}
                  />
                  <div className="flex justify-end pt-3">
                    <AdminButton
                      loading={isSaving}
                      disabled={isSaving}
                      onClick={() => handleSave('Verification & Governance Settings')}
                    >
                      Save Verification &amp; Governance Settings
                    </AdminButton>
                  </div>
                </div>
              </Panel>
            </div>
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
                  <AdminButton
                    loading={isSaving}
                    disabled={isSaving}
                    onClick={() => handleSave('Notification Preferences')}
                  >
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
                  title="Two-Factor Authentication (2FA) & Session Security"
                  hint="Configure two-factor authentication, login verification gates, and destructive action safeguards."
                />
                <div className="mt-5 space-y-3">
                  <Toggle
                    label="Require Admin Two-Factor Authentication (2FA)"
                    description="Enforce 6-digit verification code (TOTP / Email OTP) when signing in to the Super Admin Console."
                    checked={securityPolicies.twoFactorAdmin}
                    onChange={(v) => {
                      const next = { ...securityPolicies, twoFactorAdmin: v };
                      setSecurityPolicies(next);
                      handleSave(
                        v ? 'Admin 2FA Enabled' : 'Admin 2FA Disabled',
                        { securityOverride: next }
                      );
                    }}
                  />
                  <Toggle
                    label="Enable Two-Factor Authentication (2FA) for Business Accounts"
                    description="Allow verified business owners to enable 2FA security on their merchant dashboard."
                    checked={securityPolicies.twoFactorBusiness}
                    onChange={(v) => {
                      const next = { ...securityPolicies, twoFactorBusiness: v };
                      setSecurityPolicies(next);
                      handleSave(
                        v ? 'Merchant 2FA Enabled' : 'Merchant 2FA Disabled',
                        { securityOverride: next }
                      );
                    }}
                  />
                  <Toggle
                    label="Require Email Verification Before Login"
                    description="Block newly registered email/password accounts from signing in until their email is verified."
                    checked={securityPolicies.requireEmailVerification}
                    onChange={(v) => {
                      const next = { ...securityPolicies, requireEmailVerification: v };
                      setSecurityPolicies(next);
                      handleSave('Email Verification Policy', { securityOverride: next });
                    }}
                  />
                  <Toggle
                    label="Require Admin Password Confirmation on User/Business Deletion"
                    description="Prompt Super Admins to re-enter their password before permanently deleting any user or business."
                    checked={securityPolicies.requirePasswordOnDelete}
                    onChange={(v) => {
                      const next = { ...securityPolicies, requirePasswordOnDelete: v };
                      setSecurityPolicies(next);
                      handleSave('Deletion Safeguard Policy', { securityOverride: next });
                    }}
                  />
                  <Toggle
                    label="Immediate Session & Token Revocation on Account Suspension"
                    description="Automatically revoke all active JWT sessions and refresh tokens the moment a user is suspended."
                    checked={securityPolicies.revokeTokensOnSuspend}
                    onChange={(v) => {
                      const next = { ...securityPolicies, revokeTokensOnSuspend: v };
                      setSecurityPolicies(next);
                      handleSave('Session Revocation Policy', { securityOverride: next });
                    }}
                  />

                  <div className="pt-2 max-w-xs">
                    <AdminInput
                      label="Admin Session Idle Timeout (Minutes)"
                      type="number"
                      value={securityPolicies.sessionTimeoutMinutes}
                      onChange={(e) =>
                        setSecurityPolicies((s) => ({ ...s, sessionTimeoutMinutes: e.target.value }))
                      }
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <AdminButton
                      loading={isSaving}
                      disabled={isSaving}
                      onClick={() => handleSave('Security & 2FA Policies')}
                    >
                      Save Security &amp; 2FA Settings
                    </AdminButton>
                  </div>
                </div>
              </Panel>

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
                    <AdminButton type="submit" loading={isRotatingPassword} disabled={isRotatingPassword}>
                      Update Password
                    </AdminButton>
                  </div>
                </form>
              </Panel>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
