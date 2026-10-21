/**
 * Onboarding State Management and Gating Utility
 * Provides client-side helpers to inspect merchant onboarding progress,
 * determine gating states, calculate step completion percentages, and manage drafts.
 */

export interface OnboardingDraft {
  onboardingTrack?: string | null;
  legalForm?: string | null;
  applicantRole?: string | null;
  businessScale?: string | null;
  operatingYears?: string | null;
  step4Completed?: boolean;
  registeredBusinessName?: string;
  registrationNumber?: string;
  tradingName?: string;
  sector?: string;
  customSector?: string;
  offeringType?: string | null;
  description?: string;
  step5Completed?: boolean;
  serviceMode?: string | null;
  province?: string;
  city?: string;
  streetAddress?: string;
  publicWhatsApp?: string;
  publicEmail?: string;
  step6Completed?: boolean;
}

export interface OnboardingStepItem {
  step: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface OnboardingProgressInfo {
  hasDraft: boolean;
  isCompleted: boolean;
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
  stepTitle: string;
  businessName: string;
  sector: string;
  steps: OnboardingStepItem[];
  resumeUrl: string;
}

const STORAGE_KEY = 'sadza_business_onboarding_draft';
const ONBOARDED_KEY = 'sadza_business_onboarded';

export function getOnboardingDraft(): OnboardingDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ONBOARDED_KEY) === 'true';
}

export function setOnboardingCompleted(completed: boolean): void {
  if (typeof window === 'undefined') return;
  if (completed) {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.removeItem(ONBOARDED_KEY);
  }
  window.dispatchEvent(new Event('sadza-onboarding-updated'));
}

export function calculateOnboardingProgress(): OnboardingProgressInfo {
  const isComplete = isOnboardingCompleted();
  const draft = getOnboardingDraft();

  const step1Done = Boolean(draft?.onboardingTrack);
  const step2Done = Boolean(draft?.legalForm);
  const step3Done = Boolean(draft?.applicantRole);
  const step4Done = Boolean(draft?.step4Completed || (draft?.businessScale && draft?.operatingYears));
  const step5Done = Boolean(
    draft?.step5Completed ||
      (draft?.registeredBusinessName?.trim() && draft?.sector?.trim() && draft?.offeringType)
  );
  const step6Done = Boolean(
    draft?.step6Completed ||
      (draft?.province?.trim() && draft?.city?.trim() && draft?.serviceMode)
  );
  const step7Done = isComplete;

  const steps: OnboardingStepItem[] = [
    {
      step: 1,
      title: 'Onboarding Track',
      description: 'Business formalisation category',
      completed: step1Done,
    },
    {
      step: 2,
      title: 'Legal Entity Form',
      description: 'Pvt Ltd, PBC, Sole Trader, or Trust',
      completed: step2Done,
    },
    {
      step: 3,
      title: 'Applicant Authority',
      description: 'Director, Owner, or Trustee mandate',
      completed: step3Done,
    },
    {
      step: 4,
      title: 'Scale & Operations',
      description: 'Team size & operational experience',
      completed: step4Done,
    },
    {
      step: 5,
      title: 'Profile & Offerings',
      description: 'Trading name, sector & product/service scope',
      completed: step5Done,
    },
    {
      step: 6,
      title: 'Location & Contacts',
      description: 'Province, city & WhatsApp channels',
      completed: step6Done,
    },
    {
      step: 7,
      title: 'Compliance Documents',
      description: 'KYC, CR6, or National Identity files',
      completed: step7Done,
    },
  ];

  let currentStep = 1;
  let stepTitle = 'Choose Onboarding Track';

  if (!step1Done) {
    currentStep = 1;
    stepTitle = 'Choose Onboarding Track';
  } else if (!step2Done) {
    currentStep = 2;
    stepTitle = 'Select Exact Legal Form';
  } else if (!step3Done) {
    currentStep = 3;
    stepTitle = 'Specify Authority Role';
  } else if (!step4Done) {
    currentStep = 4;
    stepTitle = 'Scale & Experience';
  } else if (!step5Done) {
    currentStep = 5;
    stepTitle = 'Business Profile & Offerings';
  } else if (!step6Done) {
    currentStep = 6;
    stepTitle = 'Location & Contact Details';
  } else if (!step7Done) {
    currentStep = 7;
    stepTitle = 'Verification Documents';
  } else {
    currentStep = 7;
    stepTitle = 'Setup Finalized';
  }

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.min(100, Math.round((completedCount / 7) * 100));

  const businessName =
    draft?.tradingName?.trim() || draft?.registeredBusinessName?.trim() || 'Your Storefront';
  const sector = draft?.sector || 'General Commerce';

  const hasDraft = Boolean(draft && Object.keys(draft).length > 0) && !isComplete;

  return {
    hasDraft,
    isCompleted: isComplete,
    currentStep,
    totalSteps: 7,
    progressPercent: isComplete ? 100 : progressPercent,
    stepTitle,
    businessName,
    sector,
    steps,
    resumeUrl: '/onboarding/business',
  };
}
