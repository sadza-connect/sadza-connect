import type { BusinessListing } from './zimbabwe';

export function mapDbBusinessToListing(b: any): BusinessListing {
  const operatingHoursStr =
    typeof b.operating_hours === 'object' && b.operating_hours !== null
      ? b.operating_hours.summary || b.operating_hours.text || 'Mon - Sat: 08:00 - 17:00'
      : typeof b.operating_hours === 'string'
      ? b.operating_hours
      : 'Mon - Sat: 08:00 - 17:00';

  const defaultImage =
    b.logo_url ||
    b.cover_url ||
    b.image ||
    'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80';

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
    businessType: b.business_type || 'Registered Company (Pvt Ltd)',
    onboardingTrack: b.onboarding_track || undefined,
    legalForm: b.legal_form || undefined,
    applicantRole: b.applicant_role || undefined,
    verificationBadge: isVerified ? (b.verification_badge || 'Verified Registered Company') : undefined,
    registrationNumber: b.registration_number || undefined,
    customMonthlyPriceUsd:
      b.custom_monthly_price_usd !== undefined && b.custom_monthly_price_usd !== null
        ? parseFloat(b.custom_monthly_price_usd)
        : (b.customMonthlyPriceUsd ?? null),
    teamScale: '1 – 10 People',
    subscriptionStatus:
      b.subscription_status === 'Paid Subscriber'
        ? 'Paid Subscriber'
        : b.subscription_status === 'Expired'
        ? 'Expired'
        : Math.max(0, 30 - Math.floor((Date.now() - (b.created_at ? new Date(b.created_at).getTime() : Date.now())) / (1000 * 60 * 60 * 24))) > 0
        ? 'Month 1 Grace Period'
        : 'Expired',
    graceDaysRemaining:
      b.subscription_status === 'Paid Subscriber'
        ? undefined
        : Math.max(0, 30 - Math.floor((Date.now() - (b.created_at ? new Date(b.created_at).getTime() : Date.now())) / (1000 * 60 * 60 * 24))),
    rating: typeof b.rating_avg === 'number' ? b.rating_avg : parseFloat(b.rating_avg || '4.5'),
    reviewCount: b.reviews_count || 12,
    province: b.province,
    city: b.city || 'Harare',
    address: b.address || 'Central Business District',
    phone: b.phone || '+263 77 000 0000',
    whatsapp: b.whatsapp || b.phone || '+263770000000',
    email: b.email || `contact@${b.slug}.co.zw`,
    openingHours: operatingHoursStr,
    verifiedTier: isVerified ? 'tier2_corporate' : 'unverified',
    verificationStatus: isVerified ? 'Verified' : 'Pending',
    cr14Verified: isVerified,
    zimraVerified: isVerified,
    featured: Boolean(b.is_featured),
    image: defaultImage,
    description: b.description || (isVerified ? 'Verified Zimbabwean Commercial Supplier & Enterprise.' : 'Zimbabwean Commercial Supplier & Enterprise (Pending Verification).'),
    services: [
      b.sector ? `${b.sector} Supplies` : 'General Wholesale',
      'Nationwide Delivery',
      'Direct WhatsApp Quotes',
    ],
    tags: [
      b.sector,
      b.province,
      isVerified ? 'CR14 Verified' : 'Pending Verification',
    ].filter(Boolean) as string[],
    reviews: [
      {
        id: `rev-${b.id}-1`,
        author: 'Verified Buyer',
        role: 'Commercial Client',
        rating: 5,
        date: 'Recent',
        comment: 'Fast communication on WhatsApp and genuine products supplied in good time.',
      },
    ],
  };
}
