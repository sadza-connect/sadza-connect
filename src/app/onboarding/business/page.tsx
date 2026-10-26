'use client';

import React, { Suspense, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { CategoryCombobox } from '@/components/ui/CategoryCombobox';
import { ActionLoader } from '@/components/ui/ActionLoader';
import { INDUSTRY_CATEGORIES } from '@/lib/data/categories';
import { setOnboardingCompleted } from '@/lib/utils/onboarding-state';
import { formatE164Phone, parsePhoneComponents } from '@/lib/data/countries';
import { CountryCodeSelect } from '@/components/ui/CountryCodeSelect';
import { sanitizePhoneNumber } from '@/lib/utils/whatsapp';
import {
  Building2,
  User,
  Users,
  Store,
  ShieldCheck,
  FileText,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  FileCheck,
  X,
  Check,
  Award,
  Layers,
  Truck,
  Wrench,
  Package,
  Handshake,
  Lock,
} from 'lucide-react';

export type OnboardingTrack = 'registered_entity' | 'owner_operated' | 'association_institutional';
export type BusinessType = 'sole_proprietor' | 'sme_partnership' | 'registered_company' | 'cooperative';
export type BusinessScale = 'solo' | 'small_team' | 'medium_enterprise' | 'large_enterprise';
export type OperatingYears = 'under_1' | '1_to_3' | '3_to_10' | 'over_10';
export type OfferingType = 'products' | 'services' | 'both';
export type ServiceMode = 'physical_premises' | 'mobile_delivery' | 'both_modes';

const PROVINCES = [
  'Harare',
  'Bulawayo',
  'Midlands',
  'Manicaland',
  'Masvingo',
  'Mashonaland East',
  'Mashonaland West',
  'Mashonaland Central',
  'Matabeleland North',
  'Matabeleland South',
  'Diaspora',
];

export interface OnboardingTrackOption {
  id: OnboardingTrack;
  trackCode: string;
  title: string;
  subtitle: string;
  badgePreview: string;
  description: string;
  statutoryBasis: string;
  examples: string;
  verificationSummary: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ONBOARDING_TRACKS: OnboardingTrackOption[] = [
  {
    id: 'registered_entity',
    trackCode: 'Track A',
    title: 'Formally Registered Business',
    subtitle: 'Private Limited (Pvt Ltd), PBC, or Corporate',
    badgePreview: 'Verified Registered Company',
    description:
      'Incorporated under the Companies and Other Business Entities Act (COBE Chapter 24:31) or Deeds Registry.',
    statutoryBasis: 'COBE Act [Chapter 24:31] • Form CR6 / CR5 / Incorporation Cert',
    examples: 'Companies, PBCs, manufacturers, logistics hauliers, corporate contractors',
    verificationSummary: 'Verified with Certificate of Incorporation, Form CR6 (Directors), and CR5 (Office)',
    icon: Building2,
  },
  {
    id: 'owner_operated',
    trackCode: 'Track B',
    title: 'Owner-Operated or Informal Enterprise',
    subtitle: 'Sole trader, market vendor, artisan, or contractor',
    badgePreview: 'Verified Owner-Operated Business',
    description:
      'Owned and operated directly by you or a local crew, without corporate incorporation requirements.',
    statutoryBasis: 'Direct Individual Enterprise • National Identity Document + Trade Proof',
    examples: 'Market stall vendor, solar installer, caterer, auto mechanic, retail shop, artisan',
    verificationSummary: 'Verified with National ID / Passport, location permit, and workspace photo (No CR6 required)',
    icon: Store,
  },
  {
    id: 'association_institutional',
    trackCode: 'Track C',
    title: 'Cooperative, Trust, Church, or Association',
    subtitle: 'Producer cooperative, community trust, church, or NGO',
    badgePreview: 'Verified Organisation',
    description:
      'Formed under the Cooperative Societies Act, Deeds Registries Act (Trust Deed), church constitution, or PVO charter.',
    statutoryBasis: 'Cooperative Societies Act • Deeds Registries • Group Constitution',
    examples: 'Agricultural cooperatives, churches, charitable trusts, trade associations',
    verificationSummary: 'Verified with Group Constitution or Trust Deed, Registration Cert, and Committee Resolution',
    icon: Handshake,
  },
];

export interface LegalFormOption {
  id: string;
  label: string;
  sub: string;
  badge: string;
}

export const LEGAL_FORMS_BY_TRACK: Record<OnboardingTrack, LegalFormOption[]> = {
  registered_entity: [
    {
      id: 'pvt_ltd',
      label: 'Private Limited Company (Pvt Ltd)',
      sub: 'Most common commercial company under COBE Act [Chapter 24:31]',
      badge: 'Verified Registered Company',
    },
    {
      id: 'pbc',
      label: 'Private Business Corporation (PBC)',
      sub: 'Simplified corporate structure with members instead of directors',
      badge: 'Verified Registered Business (PBC)',
    },
    {
      id: 'registered_partnership',
      label: 'Registered Partnership / Firm',
      sub: 'Formally documented partnership with joint liability',
      badge: 'Verified Registered Partnership',
    },
    {
      id: 'foreign_company',
      label: 'Foreign Company / Local Branch',
      sub: 'External company registered to establish a place of business in Zimbabwe',
      badge: 'Verified Registered Company',
    },
  ],
  owner_operated: [
    {
      id: 'sole_trader',
      label: 'Sole Trader / Independent Business',
      sub: 'Individual entrepreneur trading under personal or business name',
      badge: 'Verified Owner-Operated Business',
    },
    {
      id: 'informal_trader',
      label: 'Informal Trader / Market Vendor',
      sub: 'Market stall, booth, tuckshop, or designated municipal trading area',
      badge: 'Verified Informal Business',
    },
    {
      id: 'artisan_workshop',
      label: 'Artisan Workshop / Tradesperson',
      sub: 'Carpenter, welder, mechanic, tailor, electrician, or craftsman',
      badge: 'Verified Artisan Enterprise',
    },
    {
      id: 'small_contractor',
      label: 'Contractor / Independent Service Crew',
      sub: 'Building contractor, transport operator, landscaper, or service provider',
      badge: 'Verified Owner-Operated Business',
    },
  ],
  association_institutional: [
    {
      id: 'cooperative',
      label: 'Cooperative Society',
      sub: 'Producer, farming, housing, or savings cooperative under Cooperative Act',
      badge: 'Verified Cooperative',
    },
    {
      id: 'registered_trust',
      label: 'Registered Trust',
      sub: 'Established by Notarial Deed of Trust registered with the Registrar of Deeds',
      badge: 'Verified Trust',
    },
    {
      id: 'church_faith',
      label: 'Church / Faith-Based Organisation',
      sub: 'Religious ministry, church assembly, or religious institution with a constitution',
      badge: 'Verified Faith-Based Organisation',
    },
    {
      id: 'association',
      label: 'Association / Society / Club',
      sub: 'Trade body, community union, sports club, or voluntary association',
      badge: 'Verified Organisation',
    },
    {
      id: 'pvo_ngo',
      label: 'Non-Governmental Organisation (PVO / NGO)',
      sub: 'Charity or development organisation registered under the PVO Act',
      badge: 'Verified Organisation',
    },
  ],
};

export interface ApplicantRoleOption {
  id: string;
  label: string;
  description: string;
}

export const APPLICANT_ROLES_BY_TRACK: Record<OnboardingTrack, ApplicantRoleOption[]> = {
  registered_entity: [
    { id: 'director', label: 'Registered Director', description: 'Listed on Form CR6 / CR14 with statutory authority' },
    { id: 'secretary', label: 'Company Secretary', description: 'Official secretary responsible for corporate filings' },
    { id: 'owner', label: 'Principal Shareholder / Owner', description: 'Majority shareholder or ultimate beneficial owner' },
    { id: 'authorised_rep', label: 'Authorised Representative', description: 'Appointed officer holding a written board resolution mandate' },
  ],
  owner_operated: [
    { id: 'owner', label: 'Business Owner / Sole Proprietor', description: 'Primary owner with full operational control' },
    { id: 'authorised_rep', label: 'Authorised Manager / Family Rep', description: 'Authorized manager or family partner operating on behalf of the owner' },
  ],
  association_institutional: [
    { id: 'trustee', label: 'Board Trustee', description: 'Named trustee under the registered Notarial Deed of Trust' },
    { id: 'office_bearer', label: 'Executive Committee Member / Pastor', description: 'Chairman, Secretary, Treasurer, or Ordained Minister' },
    { id: 'coop_member', label: 'Cooperative Chairperson / Member', description: 'Elected officer on the cooperative management board' },
    { id: 'authorised_rep', label: 'Authorised Representative', description: 'Appointed representative with an official committee resolution' },
  ],
};

export function computeBadge(track: OnboardingTrack | null, legalForm: string | null): string {
  if (!track) return 'Verified Business';
  const forms = LEGAL_FORMS_BY_TRACK[track] || [];
  const found = legalForm ? forms.find((f) => f.id === legalForm) : null;
  if (found) return found.badge;
  if (track === 'registered_entity') return 'Verified Registered Company';
  if (track === 'owner_operated') return 'Verified Owner-Operated Business';
  return 'Verified Organisation';
}

export interface TrackDocumentRequirement {
  docType: string;
  title: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isRecommended: boolean;
  legalNote?: string;
}

export const DOCUMENT_REQUIREMENTS_BY_TRACK: Record<OnboardingTrack, TrackDocumentRequirement[]> = {
  registered_entity: [
    {
      docType: 'incorporation_cert',
      title: 'Certificate of Incorporation or PBC Charter',
      badge: 'Registrar of Companies',
      description:
        'Official Certificate of Incorporation or PBC Founding Statement issued under the COBE Act [Chapter 24:31].',
      icon: Building2,
      isRecommended: true,
      legalNote: 'Statutory proof of corporate legal personality.',
    },
    {
      docType: 'cr6_cr14',
      title: 'Form CR6 (or CR14) — Register of Directors',
      badge: 'Current Directorship',
      description:
        'Form CR6 (or legacy CR14) stamped by the Registrar, listing active directors and secretaries.',
      icon: Users,
      isRecommended: true,
      legalNote: 'Confirms authorized signatories and directors.',
    },
    {
      docType: 'cr5_office',
      title: 'Form CR5 — Notice of Registered Office',
      badge: 'Registered Address',
      description:
        'Official Form CR5 specifying the registered physical and postal address in Zimbabwe.',
      icon: MapPin,
      isRecommended: true,
      legalNote: 'Prevents fraudulent or non-existent physical entities.',
    },
    {
      docType: 'director_rep_id',
      title: 'Director / Representative National ID or Passport',
      badge: 'Representative KYC',
      description:
        'Clear copy of the Zimbabwean National ID (metal or plastic) or valid Passport of the director.',
      icon: User,
      isRecommended: true,
      legalNote: 'Personal identity verification for applicant authority.',
    },
  ],
  owner_operated: [
    {
      docType: 'owner_national_id',
      title: 'Owner National ID (Metal/Plastic) or Passport',
      badge: 'Identity Verification',
      description:
        'Clear photo or scan of your official Zimbabwean National ID card or valid Passport.',
      icon: User,
      isRecommended: true,
      legalNote: 'Guarantees the identity of the sole proprietor or artisan.',
    },
    {
      docType: 'proof_of_location',
      title: 'Proof of Operating Location / Permit / Lease',
      badge: 'Trading Presence',
      description:
        'Municipal stall permit, market receipt, commercial lease agreement, or letter from premise owner.',
      icon: MapPin,
      isRecommended: true,
      legalNote: 'Validates real physical presence in the community.',
    },
    {
      docType: 'storefront_photo',
      title: 'Storefront, Workshop, or Inventory Photo',
      badge: 'Visual Trade Proof',
      description:
        'A photo showing your workshop, tools, retail counter, stall, vehicle, or stock ready for customers.',
      icon: Store,
      isRecommended: true,
      legalNote: 'Builds direct visual credibility for prospective buyers.',
    },
    {
      docType: 'owner_declaration',
      title: 'Owner Operating Statement / Trade Card (Optional)',
      badge: 'Self-Declaration',
      description:
        'A brief written letterhead, trade card, or declaration confirming your active commercial trade.',
      icon: FileCheck,
      isRecommended: false,
      legalNote: 'Expedites fast-track same-day verification.',
    },
  ],
  association_institutional: [
    {
      docType: 'governing_doc',
      title: 'Constitution, Trust Deed, or Society Charter',
      badge: 'Governing Instrument',
      description:
        'Signed Constitution, registered Notarial Deed of Trust, or cooperative bylaws defining entity objectives.',
      icon: FileText,
      isRecommended: true,
      legalNote: 'Foundational legal instrument establishing governance.',
    },
    {
      docType: 'institution_reg_cert',
      title: 'Registration Certificate or Recognition',
      badge: 'Official Recognition',
      description:
        'Cooperative registration certificate, Deeds Registry certificate, Ministry approval, or council permit.',
      icon: Award,
      isRecommended: true,
      legalNote: 'Confirms official institutional standing.',
    },
    {
      docType: 'committee_list',
      title: 'Executive Committee or Trustees List',
      badge: 'Leadership Roster',
      description:
        'Official document or letterhead identifying current trustees, pastors, elders, or committee members.',
      icon: Users,
      isRecommended: true,
      legalNote: 'Verifies entity governance structure and office bearers.',
    },
    {
      docType: 'rep_resolution_id',
      title: 'Authorised Representative ID & Resolution',
      badge: 'Mandate & KYC',
      description:
        'National ID of applicant plus signed committee minutes/resolution authorizing profile management.',
      icon: Handshake,
      isRecommended: true,
      legalNote: 'Prevents unauthorized representation of institutions.',
    },
  ],
};

const BUSINESS_SCALES: {
  id: BusinessScale;
  label: string;
  teamRange: string;
  description: string;
}[] = [
  {
    id: 'solo',
    label: 'Just Me (Solo)',
    teamRange: '1 Person',
    description: 'I handle all daily operations and customer inquiries myself.',
  },
  {
    id: 'small_team',
    label: 'Small Business Team',
    teamRange: '2 – 10 People',
    description: 'A small crew, shop staff, or workshop team working together.',
  },
  {
    id: 'medium_enterprise',
    label: 'Medium Enterprise',
    teamRange: '11 – 50 People',
    description: 'Established operations with dedicated staff or multiple branches.',
  },
  {
    id: 'large_enterprise',
    label: 'Large Organization',
    teamRange: '50+ People',
    description: 'Full-scale commercial, industrial, or nationwide workforce.',
  },
];

const OPERATING_YEARS: { id: OperatingYears; label: string; sub: string }[] = [
  { id: 'under_1', label: 'Newly Starting', sub: '< 1 year' },
  { id: '1_to_3', label: 'Growing', sub: '1 – 3 yrs' },
  { id: '3_to_10', label: 'Established', sub: '3 – 10 yrs' },
  { id: 'over_10', label: 'Long-Standing', sub: '10+ yrs' },
];

interface UploadedDocument {
  id: string;
  name: string;
  size: string;
  type: string;
  docType: string;
  url?: string;
  key?: string;
  storageType?: string;
  isPublic?: boolean;
}

function BusinessOnboardingContent() {
  const searchParams = useSearchParams();

  // Query parameters pre-population
  const [registeredBusinessName, setRegisteredBusinessName] = useState(() => searchParams.get('name') || '');
  const registeredOwner = searchParams.get('owner') || '';
  const registeredEmail = searchParams.get('email') || 'verified@business.co.zw';
  const registeredPhone = searchParams.get('phone') || '+263 77 000 0000';
  const isEmailVerified = searchParams.get('verified') === 'true';

  // Progressive disclosure selection states - default to null (no pre-selection)
  const [onboardingTrack, setOnboardingTrack] = useState<OnboardingTrack | null>(null);
  const [legalForm, setLegalForm] = useState<string | null>(null);
  const [applicantRole, setApplicantRole] = useState<string | null>(null);

  // Step 4: Scale & Experience states - default to null (no pre-selection)
  const [businessScale, setBusinessScale] = useState<BusinessScale | null>(null);
  const [operatingYears, setOperatingYears] = useState<OperatingYears | null>(null);
  const [step4Completed, setStep4Completed] = useState(false);
  const [step4Error, setStep4Error] = useState('');

  // Step 5: Business Name, Industry & Offerings states - empty / null by default
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [tradingName, setTradingName] = useState('');
  const [sector, setSector] = useState(''); // EMPTY BY DEFAULT - Forces user selection
  const [customSector, setCustomSector] = useState('');
  const [offeringType, setOfferingType] = useState<OfferingType | null>(null); // NULL BY DEFAULT - Forces user selection
  const [description, setDescription] = useState('');
  const [step5Completed, setStep5Completed] = useState(false);
  const [step5Error, setStep5Error] = useState('');

  // Step 6: Operating Location & Contact states - empty / null by default
  const [serviceMode, setServiceMode] = useState<ServiceMode | null>(null); // NULL BY DEFAULT - Forces user selection
  const [province, setProvince] = useState(() => {
    const paramProv = searchParams.get('province');
    if (paramProv && PROVINCES.includes(paramProv)) return paramProv;
    return ''; // EMPTY BY DEFAULT - Forces user selection
  });
  const [city, setCity] = useState(''); // EMPTY BY DEFAULT - Forces user entry
  const [streetAddress, setStreetAddress] = useState('');
  const [publicWhatsApp, setPublicWhatsApp] = useState('');
  const [whatsAppCountryCode, setWhatsAppCountryCode] = useState(() => {
    return parsePhoneComponents(registeredPhone).dialCode || '+263';
  });
  const [whatsAppLocalNumber, setWhatsAppLocalNumber] = useState('');
  const [publicEmail, setPublicEmail] = useState('');
  const [step6Completed, setStep6Completed] = useState(false);
  const [step6Error, setStep6Error] = useState('');

  // Step 7: Verification KYC Documents states
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [uploadingDocTypes, setUploadingDocTypes] = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSkipped, setVerificationSkipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [createdSlug, setCreatedSlug] = useState('');

  // Restore draft progress on load if returning from Save & Exit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sadza_business_onboarding_draft');
        if (saved) {
          const draft = JSON.parse(saved);
          if (draft.onboardingTrack) setOnboardingTrack(draft.onboardingTrack);
          if (draft.legalForm) setLegalForm(draft.legalForm);
          if (draft.applicantRole) setApplicantRole(draft.applicantRole);
          if (draft.businessScale) setBusinessScale(draft.businessScale);
          if (draft.operatingYears) setOperatingYears(draft.operatingYears);
          if (draft.step4Completed) setStep4Completed(draft.step4Completed);
          if (draft.registeredBusinessName) setRegisteredBusinessName(draft.registeredBusinessName);
          if (draft.registrationNumber) setRegistrationNumber(draft.registrationNumber);
          if (draft.tradingName) setTradingName(draft.tradingName);
          if (draft.sector) setSector(draft.sector);
          if (draft.customSector) setCustomSector(draft.customSector);
          if (draft.offeringType) setOfferingType(draft.offeringType);
          if (draft.description) setDescription(draft.description);
          if (draft.step5Completed) setStep5Completed(draft.step5Completed);
          if (draft.serviceMode) setServiceMode(draft.serviceMode);
          if (draft.province) setProvince(draft.province);
          if (draft.city) setCity(draft.city);
          if (draft.streetAddress) setStreetAddress(draft.streetAddress);
          if (draft.publicWhatsApp) {
            setPublicWhatsApp(draft.publicWhatsApp);
            const parsed = parsePhoneComponents(draft.publicWhatsApp);
            if (parsed.dialCode) setWhatsAppCountryCode(parsed.dialCode);
            setWhatsAppLocalNumber(parsed.localNumber);
          }
          if (draft.publicEmail) setPublicEmail(draft.publicEmail);
          if (draft.step6Completed) setStep6Completed(draft.step6Completed);
        }
      } catch (err) {
        console.warn('Could not restore onboarding draft from localStorage', err);
      }
    }
  }, []);

  // Save current progress when clicking Save & Exit
  const handleSaveAndExit = () => {
    if (typeof window !== 'undefined') {
      const draft = {
        onboardingTrack,
        legalForm,
        applicantRole,
        businessScale,
        operatingYears,
        step4Completed,
        registeredBusinessName,
        registrationNumber,
        tradingName,
        sector,
        customSector,
        offeringType,
        description,
        step5Completed,
        serviceMode,
        province,
        city,
        streetAddress,
        publicWhatsApp,
        publicEmail,
        step6Completed,
      };
      try {
        localStorage.setItem('sadza_business_onboarding_draft', JSON.stringify(draft));
        window.dispatchEvent(new Event('sadza-onboarding-updated'));
      } catch (err) {
        console.warn('Could not save onboarding draft', err);
      }
    }
  };

  // DOM Refs for smooth offset scrolling
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);
  const step5Ref = useRef<HTMLDivElement>(null);
  const step6Ref = useRef<HTMLDivElement>(null);
  const step7Ref = useRef<HTMLDivElement>(null);

  // Smooth scroll with responsive header offset to avoid hiding beneath sticky header
  const scrollToStep = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      if (ref.current) {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
        const headerOffset = isMobile ? 84 : 100;
        const elementPosition = ref.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth',
        });
      }
    }, 120);
  };

  // Upstream Track change resets downstream answers
  const handleTrackChange = (track: OnboardingTrack) => {
    if (onboardingTrack === track) return;
    setOnboardingTrack(track);
    setLegalForm(null);
    setApplicantRole(null);
    setStep4Completed(false);
    setStep5Completed(false);
    setStep6Completed(false);
    scrollToStep(step2Ref);
  };

  // Upstream Legal Form change resets downstream answers
  const handleLegalFormChange = (formId: string) => {
    setLegalForm(formId);
    setApplicantRole(null);
    setStep4Completed(false);
    setStep5Completed(false);
    setStep6Completed(false);
    scrollToStep(step3Ref);
  };

  // Role selection advances to Step 4
  const handleRoleChange = (roleId: string) => {
    setApplicantRole(roleId);
    scrollToStep(step4Ref);
  };

  // Step 4 Continue Validation
  const handleContinueStep4 = () => {
    setStep4Error('');
    if (!businessScale) {
      setStep4Error('Please select your current business or team size.');
      return;
    }
    if (!operatingYears) {
      setStep4Error('Please select how long your business has been operating.');
      return;
    }
    setStep4Completed(true);
    scrollToStep(step5Ref);
  };

  // Step 5 Continue Validation - Forces explicit entry/selection for all fields
  const handleContinueStep5 = () => {
    setStep5Error('');
    if (!registeredBusinessName.trim()) {
      setStep5Error('Please enter your official registered business or enterprise name.');
      return;
    }
    if (!sector.trim()) {
      setStep5Error('Please search or select your business sector or industry.');
      return;
    }
    if (sector.startsWith('Other') && !customSector.trim()) {
      setStep5Error('Please specify your custom industry trade or specialty.');
      return;
    }
    if (!offeringType) {
      setStep5Error('Please choose what your business provides (Products, Services, or Both).');
      return;
    }
    setStep5Completed(true);
    scrollToStep(step6Ref);
  };

  // Step 6 Continue Validation - Forces explicit entry/selection for all fields
  const handleContinueStep6 = () => {
    setStep6Error('');
    if (!serviceMode) {
      setStep6Error('Please choose how you serve your customers (Service Mode).');
      return;
    }
    if (!province.trim()) {
      setStep6Error('Please select the province where your business is based.');
      return;
    }
    if (!city.trim()) {
      setStep6Error('Please enter the city or town where your business operates.');
      return;
    }
    setStep6Completed(true);
    scrollToStep(step7Ref);
  };

  // Step 7 Cloudflare R2 Upload
  const handleFileUpload = async (docType: string, file: File) => {
    setUploadingDocTypes((prev) => ({ ...prev, [docType]: true }));
    setUploadErrors((prev) => {
      const copy = { ...prev };
      delete copy[docType];
      return copy;
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('partition', 'kyc-documents');
      formData.append('is_public', 'false');

      const res = await fetch('/api/v1/storage/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.message || 'File upload failed');
      }

      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr =
        file.size > 1024 * 1024
          ? `${sizeMb} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`;

      const newDoc: UploadedDocument = {
        id: json.data?.key || Math.random().toString(36).substring(7),
        name: file.name,
        size: sizeStr,
        type: file.type || 'application/octet-stream',
        docType,
        url: json.data?.url,
        key: json.data?.key,
        storageType: json.data?.storageType || 'r2',
        isPublic: false,
      };

      setUploadedDocs((prev) => [...prev.filter((d) => d.docType !== docType), newDoc]);
    } catch (err: any) {
      console.error(`Upload error for ${docType}:`, err);
      setUploadErrors((prev) => ({
        ...prev,
        [docType]: err.message || 'Upload failed. Please check network or file format.',
      }));
    } finally {
      setUploadingDocTypes((prev) => ({ ...prev, [docType]: false }));
    }
  };

  const handleRemoveDoc = (docType: string) => {
    setUploadedDocs((prev) => prev.filter((d) => d.docType !== docType));
  };

  // Final Registration Submission
  const handleCompleteOnboarding = async (skipped: boolean) => {
    if (!onboardingTrack || !legalForm) return;
    setIsSubmitting(true);
    setVerificationSkipped(skipped);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('sadza_access_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const defaultDialCode = parsePhoneComponents(registeredPhone).dialCode || '+263';
      const normalizedWhatsApp = publicWhatsApp.trim()
        ? (publicWhatsApp.trim().startsWith('+')
            ? publicWhatsApp.trim()
            : formatE164Phone(defaultDialCode, publicWhatsApp.trim()))
        : registeredPhone;

      const res = await fetch('/api/v1/businesses', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          name: registeredBusinessName.trim(),
          province: province.trim() || 'Harare',
          city: city.trim(),
          address: streetAddress.trim(),
          sector: displaySector,
          business_type: selectedTrackObj?.title || 'Registered Business',
          onboarding_track: onboardingTrack,
          legal_form: legalForm,
          applicant_role: applicantRole || 'owner',
          verification_badge: calculatedBadge,
          registration_number: registrationNumber.trim() || undefined,
          phone: registeredPhone,
          email: registeredEmail,
          whatsapp: normalizedWhatsApp,
          description: description.trim(),
          kyc_documents: uploadedDocs,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.business?.slug) {
        setCreatedSlug(data.data.business.slug);
      }
      // Mark onboarding completed and purge draft
      setOnboardingCompleted(true);
    } catch (err) {
      console.error('Failed to submit onboarding business record:', err);
    } finally {
      setIsSubmitting(false);
      setIsCompleted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const selectedTrackObj = onboardingTrack
    ? ONBOARDING_TRACKS.find((t) => t.id === onboardingTrack) || null
    : null;
  const selectedLegalFormObj =
    onboardingTrack && legalForm
      ? (LEGAL_FORMS_BY_TRACK[onboardingTrack] || []).find((f) => f.id === legalForm) || null
      : null;
  const selectedApplicantRoleObj =
    onboardingTrack && applicantRole
      ? (APPLICANT_ROLES_BY_TRACK[onboardingTrack] || []).find((r) => r.id === applicantRole) || null
      : null;
  const calculatedBadge = computeBadge(onboardingTrack, legalForm);

  const displayBusinessName = tradingName.trim() || registeredBusinessName.trim() || 'Your Business';
  const displaySector = sector.startsWith('Other')
    ? customSector.trim() || 'Specialized Business'
    : sector || 'Business Profile';

  const initials = displayBusinessName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'BZ';

  // Dynamic Progress Calculation across 7 steps
  const getProgressInfo = () => {
    if (isCompleted) return { step: 7, total: 7, percent: 100, label: 'Profile Ready' };
    if (step6Completed) return { step: 7, total: 7, percent: 100, label: 'Step 7: Verification & Launch' };
    if (step5Completed) return { step: 6, total: 7, percent: 85, label: 'Step 6: Location & Contact' };
    if (step4Completed) return { step: 5, total: 7, percent: 70, label: 'Step 5: Business Name & Industry' };
    if (applicantRole) return { step: 4, total: 7, percent: 55, label: 'Step 4: Scale & Experience' };
    if (legalForm) return { step: 3, total: 7, percent: 40, label: 'Step 3: Your Authority / Role' };
    if (onboardingTrack) return { step: 2, total: 7, percent: 25, label: 'Step 2: Exact Legal Form' };
    return { step: 1, total: 7, percent: 10, label: 'Step 1: Choose Business Track' };
  };

  const progress = getProgressInfo();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col">
      {/* =========================================================================
          UNIFIED STICKY NAVIGATION & PROGRESS HEADER
          ========================================================================= */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs">
        {/* Top Navbar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Logo size="sm" priority className="sm:hidden shrink-0" />
            <div className="hidden sm:block shrink-0">
              <Logo size="md" priority />
            </div>
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                Business Profile Setup
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {(isEmailVerified || registeredEmail) && (
              <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate max-w-[180px]">{registeredEmail}</span>
              </div>
            )}
            <ThemeToggle />
            <Link
              href="/"
              onClick={handleSaveAndExit}
              className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Save &amp; Exit
            </Link>
          </div>
        </div>

        {/* Integrated Progress Indicator Bar */}
        {!isCompleted && (
          <div className="border-t border-slate-100 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2 bg-slate-50/70 dark:bg-slate-900/60">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 min-w-0">
                  <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] sm:text-[11px] font-bold text-white shrink-0">
                    {progress.step}
                  </span>
                  <span className="font-bold truncate text-xs sm:text-sm">{progress.label}</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2 text-xs sm:text-sm">
                  {progress.percent}% Completed
                </span>
              </div>
              <div className="h-1.5 sm:h-2 w-full bg-slate-200/70 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-500 ease-out rounded-full shadow-xs"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          MAIN BALANCED WORKSPACE (RESPONSIVE MULTI-COLUMN DESKTOP)
          ========================================================================= */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-16">
        {!isCompleted ? (
          <div className="space-y-5 sm:space-y-8">
            {/* =================================================================
                STEP 1: CHOOSE ONBOARDING TRACK (SIDE-BY-SIDE ON DESKTOP)
                ================================================================= */}
            <section
              ref={step1Ref}
              id="onboarding-step-1"
              className="scroll-mt-24 sm:scroll-mt-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-xs space-y-5 sm:space-y-6"
            >
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                  <span>Step 1 of 7 • Legal Track</span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                  {registeredOwner
                    ? `Welcome, ${registeredOwner.split(' ')[0]}. Select your business structure.`
                    : '1. Choose your Onboarding Track'}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
                  Sadza Connect supports registered companies, informal sole traders, artisans, cooperatives, churches, and trusts. Choose your track to receive the tailored statutory checklist and verified badge.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Select your business track: <span className="text-emerald-600">*</span>
                  </h2>
                  {onboardingTrack && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" /> Selected
                    </span>
                  )}
                </div>

                {/* 3 Tracks: Stacked on mobile, 3-column side-by-side on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
                  {ONBOARDING_TRACKS.map((trackOption) => {
                    const IconComponent = trackOption.icon;
                    const isSelected = onboardingTrack === trackOption.id;

                    return (
                      <div
                        key={trackOption.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleTrackChange(trackOption.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleTrackChange(trackOption.id);
                          }
                        }}
                        className={`relative flex flex-col justify-between p-4 sm:p-5 lg:p-6 rounded-2xl border-2 cursor-pointer transition-all text-left ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div>
                          {/* Top Row: Icon + Badge + Check Indicator */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div
                              className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {trackOption.trackCode}
                              </span>
                              <div
                                className={`flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                  isSelected
                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                    : 'border-slate-300 dark:border-slate-600'
                                }`}
                              >
                                {isSelected && <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3]" />}
                              </div>
                            </div>
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                            {trackOption.title}
                          </h3>
                          <p className="mt-1 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 leading-tight">
                            {trackOption.subtitle}
                          </p>

                          <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {trackOption.description}
                          </p>
                        </div>

                        {/* Bottom Anchored Details */}
                        <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-700/70 space-y-1.5 text-[11px] sm:text-xs">
                          <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                            <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{trackOption.statutoryBasis}</span>
                          </div>
                          <p className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="line-clamp-2">{trackOption.verificationSummary}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* =================================================================
                STEP 2: SELECT YOUR EXACT LEGAL FORM OR OPERATIONAL STATUS
                ================================================================= */}
            {onboardingTrack && (
              <section
                ref={step2Ref}
                id="onboarding-step-2"
                className="scroll-mt-24 sm:scroll-mt-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-xs space-y-5 sm:space-y-6 animate-in fade-in duration-300"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                    <span>Step 2 of 7 • Legal Subtype</span>
                  </div>
                  <h2 className="text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                    2. Select your exact legal form or operational status <span className="text-emerald-600">*</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Choose the formal or operational subtype that matches your business under{' '}
                    <strong className="text-slate-800 dark:text-slate-200">{selectedTrackObj?.trackCode}: {selectedTrackObj?.title}</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {(LEGAL_FORMS_BY_TRACK[onboardingTrack] || []).map((formOpt) => {
                    const isSelected = legalForm === formOpt.id;
                    return (
                      <div
                        key={formOpt.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleLegalFormChange(formOpt.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleLegalFormChange(formOpt.id);
                          }
                        }}
                        className={`p-4 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all text-left flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                              {formOpt.label}
                            </span>
                            <div
                              className={`flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors mt-0.5 ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {isSelected && <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 stroke-[3]" />}
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {formOpt.sub}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          <ShieldCheck className="h-3 w-3 shrink-0" />
                          <span className="truncate">{formOpt.badge}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* =================================================================
                STEP 3: WHAT IS YOUR ROLE OR AUTHORITY IN THIS BUSINESS?
                ================================================================= */}
            {onboardingTrack && legalForm && (
              <section
                ref={step3Ref}
                id="onboarding-step-3"
                className="scroll-mt-24 sm:scroll-mt-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-xs space-y-5 sm:space-y-6 animate-in fade-in duration-300"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                    <span>Step 3 of 7 • Capacity &amp; Authority</span>
                  </div>
                  <h2 className="text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                    3. What is your role or authority in this business? <span className="text-emerald-600">*</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Declare your legal authority to manage this profile on behalf of <strong className="text-slate-800 dark:text-slate-200">{selectedLegalFormObj?.label}</strong>.
                  </p>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 ${(APPLICANT_ROLES_BY_TRACK[onboardingTrack] || []).length > 2 ? 'lg:grid-cols-4' : ''} gap-3.5`}>
                  {(APPLICANT_ROLES_BY_TRACK[onboardingTrack] || []).map((roleOpt) => {
                    const isSelected = applicantRole === roleOpt.id;
                    return (
                      <div
                        key={roleOpt.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleRoleChange(roleOpt.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleRoleChange(roleOpt.id);
                          }
                        }}
                        className={`p-4 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all text-left flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                            {roleOpt.label}
                          </span>
                          <div
                            className={`flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors mt-0.5 ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {isSelected && <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 stroke-[3]" />}
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {roleOpt.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* =================================================================
                STEP 4: BUSINESS SCALE & OPERATING YEARS
                ================================================================= */}
            {applicantRole && (
              <section
                ref={step4Ref}
                id="onboarding-step-4"
                className="scroll-mt-24 sm:scroll-mt-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-xs space-y-5 sm:space-y-6 animate-in fade-in duration-300"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                    <span>Step 4 of 7 • Scale &amp; Maturity</span>
                  </div>
                  <h2 className="text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                    4. How big is your team and how long have you been operating?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Helps us match you with retail buyers, tenders, or wholesale partners.
                  </p>
                </div>

                {step4Error && (
                  <div className="p-3 sm:p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-300">
                    {step4Error}
                  </div>
                )}

                {/* Team Scale */}
                <div className="space-y-2.5">
                  <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Current Team Size <span className="text-emerald-600">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {BUSINESS_SCALES.map((scale) => {
                      const isSelected = businessScale === scale.id;
                      return (
                        <div
                          key={scale.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setBusinessScale(scale.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setBusinessScale(scale.id);
                            }
                          }}
                          className={`p-4 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all text-left flex flex-col justify-between ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                {scale.label}
                              </span>
                              <span
                                className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {scale.teamRange}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              {scale.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Operating Years */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Years in Operation <span className="text-emerald-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {OPERATING_YEARS.map((yr) => {
                      const isSelected = operatingYears === yr.id;
                      return (
                        <button
                          key={yr.id}
                          type="button"
                          onClick={() => setOperatingYears(yr.id)}
                          className={`p-3.5 rounded-xl sm:rounded-2xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {yr.label}
                          </div>
                          <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {yr.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    onClick={handleContinueStep4}
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-sm sm:text-base font-semibold py-3 sm:py-3.5 px-6 sm:px-8 rounded-xl shadow-md justify-center"
                  >
                    <span>Continue to Business Details</span>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                  </Button>
                </div>
              </section>
            )}

            {/* =================================================================
                STEP 5: BUSINESS NAME, INDUSTRY SECTOR & OFFERINGS
                ================================================================= */}
            {step4Completed && (
              <section
                ref={step5Ref}
                id="onboarding-step-5"
                className="scroll-mt-24 sm:scroll-mt-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-xs space-y-5 sm:space-y-6 animate-in fade-in duration-300"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                    <span>Step 5 of 7 • Business Profile</span>
                  </div>
                  <h2 className="text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                    5. What is your business name and what do you offer?
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Let buyers know your trading brand, industry, and main commercial offerings.
                  </p>
                </div>

                {step5Error && (
                  <div className="p-3 sm:p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-300">
                    {step5Error}
                  </div>
                )}

                {/* Name & Registration Inputs in 2-column Desktop Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="registered-business-name-input"
                      className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1.5"
                    >
                      Registered Business / Enterprise Name <span className="text-emerald-600">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Building2 className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                      <input
                        id="registered-business-name-input"
                        type="text"
                        required
                        value={registeredBusinessName}
                        onChange={(e) => setRegisteredBusinessName(e.target.value)}
                        placeholder="e.g. Midlands Solar & Agro Enterprises"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 pl-10 pr-3 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-number-field"
                      className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5"
                    >
                      {onboardingTrack === 'registered_entity'
                        ? 'COBE Registration / Inc Number'
                        : onboardingTrack === 'owner_operated'
                        ? 'Council Stall Permit or BP Number'
                        : 'Deeds Registry / Cooperative Reg'}{' '}
                      <span className="text-[11px] font-normal text-slate-500">(Optional)</span>
                    </label>
                    <div className="relative flex items-center">
                      <FileText className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                      <input
                        id="reg-number-field"
                        type="text"
                        maxLength={80}
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder={
                          onboardingTrack === 'registered_entity'
                            ? 'e.g. 10423/2023 or PBC/421/2022'
                            : onboardingTrack === 'owner_operated'
                            ? 'e.g. HCC/STALL/2024/098'
                            : 'e.g. MA 456/2018 or COOP/12/2021'
                        }
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 pl-10 pr-3 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Trading Name & Industry Sector in 2-column Desktop Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label
                      htmlFor="trading-name-field"
                      className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5"
                    >
                      Trading As / Storefront Display Name <span className="text-[11px] font-normal text-slate-500">(Optional)</span>
                    </label>
                    <input
                      id="trading-name-field"
                      type="text"
                      maxLength={80}
                      value={tradingName}
                      onChange={(e) => setTradingName(e.target.value)}
                      placeholder={`Leave blank to display "${registeredBusinessName.trim() || 'registered business name'}"`}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 px-3.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                      Industry Sector <span className="text-emerald-600">*</span>
                    </label>
                    <CategoryCombobox
                      value={sector}
                      onChange={(newSector) => {
                        setSector(newSector);
                        if (!newSector.startsWith('Other')) {
                          setCustomSector('');
                        }
                      }}
                      onSelectOtherWithSpecialty={(specialty) => {
                        setSector('Other (Please specify)');
                        setCustomSector(specialty);
                      }}
                      error={step5Error && !sector ? step5Error : undefined}
                    />
                  </div>
                </div>

                {/* Common Industry Quick-Pills */}
                <div className="pt-1">
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                    Or click a popular industry to select:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {INDUSTRY_CATEGORIES.slice(0, 10).map((cat) => {
                      const active = sector === cat.name;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSector(cat.name);
                            setCustomSector('');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            active
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                          }`}
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {sector.startsWith('Other') && (
                  <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 space-y-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Specify your exact specialty trade <span className="text-emerald-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={80}
                      value={customSector}
                      onChange={(e) => setCustomSector(e.target.value)}
                      placeholder="e.g. Borehole Drilling, Poultry Hatchery, Solar Inverters..."
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                )}

                {/* Offering Type: 3-column Grid on Desktop - Null by default */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    What does your business provide? <span className="text-emerald-600">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {[
                      {
                        id: 'products' as OfferingType,
                        title: 'Physical Products',
                        desc: 'Goods, merchandise, farm produce, or retail inventory.',
                        icon: Package,
                      },
                      {
                        id: 'services' as OfferingType,
                        title: 'Professional Services',
                        desc: 'Repairs, installations, skilled trade, consulting.',
                        icon: Wrench,
                      },
                      {
                        id: 'both' as OfferingType,
                        title: 'Products & Services',
                        desc: 'We supply products and provide installations or repairs.',
                        icon: Layers,
                      },
                    ].map((item) => {
                      const IconComp = item.icon;
                      const isSelected = offeringType === item.id;
                      return (
                        <div
                          key={item.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setOfferingType(item.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setOfferingType(item.id);
                            }
                          }}
                          className={`p-4 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all text-left flex items-start md:flex-col gap-3 md:gap-2.5 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300'
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <IconComp className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {item.title}
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Business Bio / Description */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="business-desc-input"
                      className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white"
                    >
                      Brief Profile Description
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {description.length}/500
                    </span>
                  </div>
                  <textarea
                    id="business-desc-input"
                    rows={3}
                    maxLength={500}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={`e.g. We supply reliable ${displaySector.toLowerCase()} solutions for homes and enterprises across Zimbabwe.`}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 px-3.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    onClick={handleContinueStep5}
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-sm sm:text-base font-semibold py-3 sm:py-3.5 px-6 sm:px-8 rounded-xl shadow-md justify-center"
                  >
                    <span>Continue to Operating Location</span>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                  </Button>
                </div>
              </section>
            )}

            {/* =================================================================
                STEP 6: OPERATING LOCATION & CUSTOMER CONTACT
                ================================================================= */}
            {step5Completed && (
              <section
                ref={step6Ref}
                id="onboarding-step-6"
                className="scroll-mt-24 sm:scroll-mt-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-xs space-y-5 sm:space-y-6 animate-in fade-in duration-300"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                    <span>Step 6 of 7 • Location &amp; Contact</span>
                  </div>
                  <h2 className="text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                    6. Where is your business located and how can customers reach you?
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Where buyers can find your shop or premises, or which areas you serve.
                  </p>
                </div>

                {step6Error && (
                  <div className="p-3 sm:p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-300">
                    {step6Error}
                  </div>
                )}

                {/* Service Mode in 3-column Desktop Grid - Null by default */}
                <div className="space-y-2.5">
                  <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Service Mode <span className="text-emerald-600">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {[
                      {
                        id: 'physical_premises' as ServiceMode,
                        title: 'Physical Premises',
                        desc: 'Clients visit our shop, workshop, stall, or office.',
                        icon: Store,
                      },
                      {
                        id: 'mobile_delivery' as ServiceMode,
                        title: 'Mobile / Delivery',
                        desc: 'We deliver or travel to client locations on-site.',
                        icon: Truck,
                      },
                      {
                        id: 'both_modes' as ServiceMode,
                        title: 'Both Modes',
                        desc: 'Physical premises plus mobile callouts & deliveries.',
                        icon: MapPin,
                      },
                    ].map((mode) => {
                      const IconComp = mode.icon;
                      const isSelected = serviceMode === mode.id;
                      return (
                        <div
                          key={mode.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setServiceMode(mode.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setServiceMode(mode.id);
                            }
                          }}
                          className={`p-4 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all text-left flex items-start md:flex-col gap-3 md:gap-2.5 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300'
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <IconComp className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {mode.title}
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              {mode.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Location Inputs in 3-column Desktop Grid - Province & City empty by default */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="province-dropdown"
                        className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
                      >
                        Province <span className="text-emerald-600">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <MapPin className="pointer-events-none absolute left-3.5 h-4 w-4 text-emerald-600" />
                        <select
                          id="province-dropdown"
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          className={`w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 pl-10 pr-8 text-base focus:outline-none focus:border-emerald-500 font-medium cursor-pointer ${
                            !province ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          <option value="" disabled className="text-slate-400">
                            Select your province...
                          </option>
                          {PROVINCES.map((prov) => (
                            <option key={prov} value={prov} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                              {prov}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="city-text-input"
                        className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
                      >
                        City or Town <span className="text-emerald-600">*</span>
                      </label>
                      <input
                        id="city-text-input"
                        type="text"
                        required
                        maxLength={60}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Harare, Bulawayo, Gweru"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 px-3.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="street-address-field"
                        className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
                      >
                        Street Address / Stand <span className="text-[11px] font-normal text-slate-500">(Optional)</span>
                      </label>
                      <input
                        id="street-address-field"
                        type="text"
                        maxLength={120}
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="e.g. Stand 405, 5th Street"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 px-3.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Locked Account Credentials */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Registered Account Details (Locked)</span>
                      </span>
                      <span className="text-xs font-semibold text-emerald-600">Verified</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div className="relative flex items-center">
                        <Phone className="pointer-events-none absolute left-3.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="tel"
                          readOnly
                          disabled
                          value={registeredPhone}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-900/70 py-2.5 pl-9 pr-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold cursor-not-allowed select-none"
                        />
                        <Lock className="pointer-events-none absolute right-3 h-3 w-3 text-slate-400" />
                      </div>

                      <div className="relative flex items-center">
                        <Mail className="pointer-events-none absolute left-3.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="email"
                          readOnly
                          disabled
                          value={registeredEmail}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-900/70 py-2.5 pl-9 pr-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold cursor-not-allowed select-none"
                        />
                        <Lock className="pointer-events-none absolute right-3 h-3 w-3 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="public-whatsapp-field"
                        className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1"
                      >
                        Public WhatsApp / Sales Line <span className="text-[11px] font-normal text-slate-500">(Optional)</span>
                      </label>
                      <div className="relative flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all overflow-hidden">
                        <div className="border-r border-slate-200 dark:border-slate-700">
                          <CountryCodeSelect
                            value={whatsAppCountryCode}
                            onChange={(code) => {
                              setWhatsAppCountryCode(code);
                              const formatted = whatsAppLocalNumber.trim()
                                ? formatE164Phone(code, whatsAppLocalNumber)
                                : '';
                              setPublicWhatsApp(formatted);
                            }}
                          />
                        </div>
                        <input
                          id="public-whatsapp-field"
                          type="tel"
                          maxLength={25}
                          value={whatsAppLocalNumber}
                          onChange={(e) => {
                            const sanitized = e.target.value.replace(/[^0-9\s\-()+]/g, '');
                            setWhatsAppLocalNumber(sanitized);
                            const formatted = sanitized.trim()
                              ? formatE164Phone(whatsAppCountryCode, sanitized)
                              : '';
                            setPublicWhatsApp(formatted);
                          }}
                          placeholder="Leave blank to use registered phone"
                          className="flex-1 py-2.5 px-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 bg-transparent focus:outline-none font-medium"
                        />
                      </div>

                      {/* Real-time Format & WhatsApp Preview */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">Buyers will reach you at:</span>
                        {publicWhatsApp ? (
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {publicWhatsApp} (wa.me/{sanitizePhoneNumber(publicWhatsApp)})
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">
                            Defaulting to registered phone: <strong className="text-slate-700 dark:text-slate-300">{registeredPhone}</strong> (wa.me/{sanitizePhoneNumber(registeredPhone)})
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="public-email-field"
                        className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1"
                      >
                        Public Sales Email <span className="text-[11px] font-normal text-slate-500">(Optional)</span>
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-emerald-600" />
                        <input
                          id="public-email-field"
                          type="email"
                          maxLength={80}
                          value={publicEmail}
                          onChange={(e) => setPublicEmail(e.target.value)}
                          placeholder="Leave blank to use registered email"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-2.5 pl-10 pr-3.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    onClick={handleContinueStep6}
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-sm sm:text-base font-semibold py-3 sm:py-3.5 px-6 sm:px-8 rounded-xl shadow-md justify-center"
                  >
                    <span>Continue to Verification</span>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                  </Button>
                </div>
              </section>
            )}

            {/* =================================================================
                STEP 7: TAILORED VERIFICATION KYC DOCUMENTS & PROFILE LAUNCH
                ================================================================= */}
            {step6Completed && onboardingTrack && (
              <section
                ref={step7Ref}
                id="onboarding-step-7"
                className="scroll-mt-24 sm:scroll-mt-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-xs space-y-5 sm:space-y-6 animate-in fade-in duration-300"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                    <span>Step 7 of 7 • Tailored Verification</span>
                  </div>
                  <h2 className="text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                    7. Verify your {calculatedBadge} profile
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Checklist for <strong className="text-slate-800 dark:text-slate-200">{selectedTrackObj?.trackCode}: {selectedTrackObj?.title}</strong>. You may upload files now or skip and complete in dashboard.
                  </p>
                </div>

                {/* Bank-Grade Security & Privacy Guarantee Callout */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200">
                      Bank-Grade Document Encryption &amp; Confidentiality
                    </h3>
                    <p className="mt-0.5 text-xs text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                      All business compliance documents and identification files are encrypted (AES-256) and strictly confidential. They are only reviewed by authorized Sadza Connect verification officers and are <strong>never</strong> displayed publicly or shared with third parties.
                    </p>
                  </div>
                </div>

                {/* Document Upload Checklist in 2-column Desktop Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Statutory Checklist:
                    </h3>
                    <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {uploadedDocs.length} Attached
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {(DOCUMENT_REQUIREMENTS_BY_TRACK[onboardingTrack] || []).map((req) => (
                      <DocumentUploadCard
                        key={req.docType}
                        title={req.title}
                        badge={req.badge}
                        description={req.description}
                        legalNote={req.legalNote}
                        docType={req.docType}
                        icon={req.icon}
                        uploadedDoc={uploadedDocs.find((d) => d.docType === req.docType)}
                        isUploading={Boolean(uploadingDocTypes[req.docType])}
                        uploadError={uploadErrors[req.docType]}
                        onUpload={(file) => handleFileUpload(req.docType, file)}
                        onRemove={() => handleRemoveDoc(req.docType)}
                      />
                    ))}
                  </div>
                </div>

                {/* Launch Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
                  {uploadedDocs.length === 0 && (
                    <button
                      type="button"
                      onClick={() => handleCompleteOnboarding(true)}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
                    >
                      Skip Documents &amp; Finish Setup
                    </button>
                  )}

                  <Button
                    type="button"
                    onClick={() => handleCompleteOnboarding(uploadedDocs.length === 0)}
                    variant="primary"
                    size="lg"
                    loading={isSubmitting}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-sm sm:text-base font-semibold py-3 sm:py-3.5 px-6 sm:px-8 rounded-xl shadow-md justify-center"
                  >
                    <span>
                      {uploadedDocs.length > 0
                        ? `Submit & Launch (${uploadedDocs.length})`
                        : 'Complete Business Setup Now'}
                    </span>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                  </Button>
                </div>
              </section>
            )}
          </div>
        ) : (
          /* =====================================================================
             STEP 8: COMPLETED & LIVE BUSINESS PROFILE SCREEN
             ===================================================================== */
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            <div className="rounded-2xl sm:rounded-3xl border-2 border-emerald-500/30 bg-white dark:bg-slate-900 p-6 sm:p-10 text-center shadow-lg">
              <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <Award className="h-8 w-8 sm:h-9 sm:w-9" />
              </div>
              <h1 className="mt-4 text-xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Your Business Profile is Ready!
              </h1>
              <p className="mt-2 text-xs sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed break-words [overflow-wrap:anywhere]">
                {verificationSkipped
                  ? `${displayBusinessName} is now listed on Sadza Connect with standard directory visibility. You can complete verification and claim your "${calculatedBadge}" badge anytime from your business dashboard.`
                  : `${displayBusinessName} is now active and your verification documents have been securely uploaded to our compliance team for review.`}
              </p>
            </div>

            {/* Official Business Profile Summary Card */}
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8 lg:p-10 shadow-xs space-y-6 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-lg sm:text-2xl shadow-xs">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 break-words [overflow-wrap:anywhere]">
                        {displaySector}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {selectedTrackObj?.trackCode}: {selectedLegalFormObj?.label}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5 break-words [overflow-wrap:anywhere]">
                      {displayBusinessName}
                    </h2>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{calculatedBadge}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-xs uppercase font-bold">
                    Legal Classification
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-1 block">
                    {selectedLegalFormObj?.label}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                    Role: {selectedApplicantRoleObj?.label}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-xs uppercase font-bold">
                    Registration &amp; Location
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-1 block break-words [overflow-wrap:anywhere]">
                    {city}, {province}
                  </span>
                  {registrationNumber.trim() && (
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-400 block mt-0.5">
                      Reg: {registrationNumber.trim()}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-xs uppercase font-bold">
                    Direct Contact &amp; KYC
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-1 block break-words [overflow-wrap:anywhere]">
                    {publicWhatsApp.trim() || registeredPhone || publicEmail.trim() || registeredEmail}
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                    {uploadedDocs.length} Document{uploadedDocs.length === 1 ? '' : 's'} Encrypted in R2
                  </span>
                </div>
              </div>

              {/* Review Timeline SLA Box */}
              <div className="p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">
                  Compliance Verification SLA (24 – 48 Hours):
                </p>
                <p>
                  Our legal compliance team will inspect your uploaded documents. Once approved, your profile displays the official verified trust badge across search and directory pages.
                </p>
              </div>

              {/* Next Step Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsCompleted(false)}
                  className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white py-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Review Form Fields</span>
                </button>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Link href="/businesses" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full text-xs sm:text-sm font-semibold py-3 px-5 rounded-xl justify-center"
                    >
                      View Directory
                    </Button>
                  </Link>

                  <Link href="/dashboard/business" className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm font-semibold py-3 px-6 rounded-xl shadow-md justify-center"
                    >
                      <span>Business Dashboard</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Action Loader Feedback */}
        <ActionLoader
          isVisible={isSubmitting}
          title="Registering Your Business..."
          subtitle="Creating storefront directory listing and provisioning verified KYC compliance profile..."
        />
      </main>
    </div>
  );
}

function DocumentUploadCard({
  title,
  badge,
  description,
  legalNote,
  icon: Icon,
  uploadedDoc,
  isUploading,
  uploadError,
  onUpload,
  onRemove,
}: {
  title: string;
  badge: string;
  description: string;
  legalNote?: string;
  docType: string;
  icon: React.ComponentType<{ className?: string }>;
  uploadedDoc?: UploadedDocument;
  isUploading?: boolean;
  uploadError?: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`rounded-xl sm:rounded-2xl border-2 p-3.5 sm:p-4 lg:p-5 transition-all flex flex-col justify-between ${
        uploadedDoc
          ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20'
          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={`flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl ${
            uploadedDoc
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          {uploadedDoc ? <FileCheck className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="text-xs sm:text-sm lg:text-base font-bold text-slate-900 dark:text-white leading-snug">
              {title}
            </h4>
            <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {badge}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {description}
          </p>
          {legalNote && (
            <p className="mt-1.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-400/90 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{legalNote}</span>
            </p>
          )}
          {uploadError && (
            <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
              {uploadError}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex justify-end">
        {isUploading ? (
          <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-semibold w-full sm:w-auto">
            <div className="h-3.5 w-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
            <span>Securing in R2...</span>
          </div>
        ) : uploadedDoc ? (
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 px-3 py-2 rounded-xl shadow-xs w-full sm:w-auto">
            <div className="flex items-center gap-2 min-w-0">
              <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <div className="text-xs min-w-0">
                <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-[180px]">
                  {uploadedDoc.name}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <span>{uploadedDoc.size}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-0.5 text-emerald-600">
                    <Lock className="h-2.5 w-2.5" /> R2 Encrypted
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer shrink-0 ml-2"
              aria-label="Remove document"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onUpload(file);
                  e.target.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-600 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Select File to Upload</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function BusinessOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16]">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
        </div>
      }
    >
      <BusinessOnboardingContent />
    </Suspense>
  );
}
