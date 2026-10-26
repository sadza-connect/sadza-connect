import type { BusinessListing } from './zimbabwe';

export function mapDbBusinessToListing(b: any): BusinessListing {
  const operatingHoursStr =
    typeof b.operating_hours === 'object' && b.operating_hours !== null
      ? b.operating_hours.summary || b.operating_hours.text || 'Mon - Sat: 08:00 - 17:00'
      : typeof b.operating_hours === 'string'
      ? b.operating_hours
      : 'Mon - Sat: 08:00 - 17:00';

  const defaultImage = b.logo_url || b.cover_url || b.image || '';

  let galleryItems: string[] = [];
  try {
    if (typeof b.gallery === 'string') {
      galleryItems = JSON.parse(b.gallery);
    } else if (Array.isArray(b.gallery)) {
      galleryItems = b.gallery;
    }
  } catch {
    galleryItems = [];
  }

  const isVerified = Boolean(b.is_verified || b.verification_status === 'Verified');

  const btLower = String(b.business_type || '').toLowerCase();
  const track = b.onboarding_track || (
    btLower.includes('owner-operated') ||
    btLower.includes('sole proprietor') ||
    btLower.includes('informal') ||
    btLower.includes('artisan')
      ? 'owner_operated'
      : btLower.includes('cooperative') ||
        btLower.includes('association') ||
        btLower.includes('trust')
      ? 'association_institutional'
      : 'registered_entity'
  );

  const isTrackB = track === 'owner_operated';
  const isTrackC = track === 'association_institutional';

  // Compute verified tier
  const verifiedTier: BusinessListing['verifiedTier'] = !isVerified
    ? 'unverified'
    : isTrackB
    ? 'tier1_artisan'
    : 'tier2_corporate';

  // Compute verification badge
  let computedBadge: string | undefined = undefined;
  if (isVerified) {
    if (b.verification_badge && b.verification_badge !== 'Verified Registered Company') {
      computedBadge = b.verification_badge;
    } else if (isTrackB) {
      if (b.legal_form === 'artisan_workshop') {
        computedBadge = 'Verified Artisan Enterprise';
      } else if (b.legal_form === 'informal_trader') {
        computedBadge = 'Verified Informal Business (National ID)';
      } else {
        computedBadge = 'Verified Owner-Operated Business (National ID)';
      }
    } else if (isTrackC) {
      computedBadge = b.legal_form === 'cooperative' ? 'Verified Cooperative' : 'Verified Organisation';
    } else {
      computedBadge = b.legal_form === 'pbc' ? 'Verified Registered Business (PBC)' : 'Verified Registered Company';
    }
  }

  const verificationTag = isVerified
    ? isTrackB
      ? 'Identity Verified (National ID)'
      : isTrackC
      ? 'Constitution Verified'
      : 'CR14 Verified'
    : 'Pending Verification';

  return {
    id: b.id,
    slug: b.slug,
    name: b.name,
    tradingName: b.name,
    categorySlug: (b.sector || 'general')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
    categoryName: b.sector || 'General Commercial',
    businessType: b.business_type || (isTrackB ? 'Owner-Operated or Informal Enterprise' : isTrackC ? 'Cooperative / Association' : 'Registered Company (Pvt Ltd)'),
    onboardingTrack: track,
    legalForm: b.legal_form || undefined,
    applicantRole: b.applicant_role || undefined,
    verificationBadge: computedBadge,
    registrationNumber: b.registration_number || undefined,
    customMonthlyPriceUsd:
      b.custom_monthly_price_usd !== undefined && b.custom_monthly_price_usd !== null
        ? parseFloat(b.custom_monthly_price_usd)
        : (b.customMonthlyPriceUsd ?? null),
    productLimit:
      b.product_limit !== undefined && b.product_limit !== null
        ? Number(b.product_limit)
        : 25,
    catalogTier: b.catalog_tier || 'starter',
    customProductLimit:
      b.custom_product_limit !== undefined && b.custom_product_limit !== null
        ? Number(b.custom_product_limit)
        : null,
    teamScale: '1 – 10 People',
    subscriptionStatus:
      b.subscription_status === 'Paid Subscriber'
        ? 'Paid Subscriber'
        : b.subscription_status === 'Expired'
        ? 'Expired'
        : b.first_verified_at
        ? Math.max(0, 30 - Math.floor((Date.now() - new Date(b.first_verified_at).getTime()) / (1000 * 60 * 60 * 24))) > 0
          ? 'Month 1 Grace Period'
          : 'Expired'
        : 'Month 1 Grace Period',
    graceDaysRemaining:
      b.subscription_status === 'Paid Subscriber'
        ? undefined
        : b.subscription_status === 'Expired'
        ? 0
        : b.first_verified_at
        ? Math.max(0, 30 - Math.floor((Date.now() - new Date(b.first_verified_at).getTime()) / (1000 * 60 * 60 * 24)))
        : 30,
    firstVerifiedAt: b.first_verified_at || undefined,
    verifiedAt: b.verified_at || undefined,
    rating: typeof b.rating_avg === 'number' ? b.rating_avg : (b.rating_avg ? parseFloat(b.rating_avg) : 0),
    reviewCount: Number(b.reviews_count || 0),
    province: b.province,
    city: b.city || 'Harare',
    address: b.address || 'Central Business District',
    phone: b.phone || '',
    whatsapp: b.whatsapp || b.phone || '',
    email: b.email || '',
    openingHours: operatingHoursStr,
    verifiedTier,
    verificationStatus: isVerified ? 'Verified' : 'Pending',
    cr14Verified: isVerified,
    zimraVerified: isVerified,
    featured: Boolean(b.is_featured),
    image: defaultImage,
    description: b.description || (isVerified
      ? (isTrackB ? 'Verified Zimbabwean Owner-Operated Enterprise.' : 'Verified Zimbabwean Commercial Supplier & Enterprise.')
      : (isTrackB ? 'Zimbabwean Enterprise (Pending Identity Verification).' : 'Zimbabwean Commercial Supplier & Enterprise (Pending Verification).')),
    services: [
      b.sector ? `${b.sector} Supplies` : 'General Wholesale',
      'Nationwide Delivery',
      'Direct WhatsApp Quotes',
    ],
    tags: [
      b.sector,
      b.province,
      verificationTag,
    ].filter(Boolean) as string[],
    reviews: Array.isArray(b.reviews) ? b.reviews : [],
    kycDocuments: Array.isArray(b.kyc_documents)
      ? b.kyc_documents
      : typeof b.kyc_documents === 'string'
      ? (() => {
          try {
            return JSON.parse(b.kyc_documents);
          } catch {
            return [];
          }
        })()
      : [],
  };
}
