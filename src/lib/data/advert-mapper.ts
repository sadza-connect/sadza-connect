import type { PaidAdvertItem } from '@/data/advertsStore';

export function mapDbAdvertToPaidAdvert(ad: any): PaidAdvertItem {
  const origUsd = ad.original_price_usd !== null && ad.original_price_usd !== undefined
    ? Number(ad.original_price_usd)
    : undefined;

  const promoUsd = ad.promo_price_usd !== null && ad.promo_price_usd !== undefined
    ? Number(ad.promo_price_usd)
    : undefined;

  const priceZig = ad.price_zig !== null && ad.price_zig !== undefined
    ? Number(ad.price_zig)
    : promoUsd ? Math.round(promoUsd * 26.5) : undefined;

  return {
    id: String(ad.id),
    businessName: ad.business_name || 'Verified Zimbabwean Enterprise',
    businessType: (ad.business_type as any) || 'Registered Company (Pvt Ltd)',
    province: ad.province || 'Harare',
    category: ad.category || 'General Commercial',
    offerType: (ad.offer_type as any) || 'Special Package',
    headline: ad.headline || 'Special Commercial Promotion',
    offerText: ad.offer_text || '',
    promoBadge: ad.promo_badge || 'SPECIAL OFFER',
    originalPriceUSD: origUsd,
    promoPriceUSD: promoUsd,
    priceZiG: priceZig,
    validUntil: ad.valid_until || 'Valid this month',
    whatsapp: ad.whatsapp ? String(ad.whatsapp).replace(/\D/g, '') : '263772111222',
    phone: ad.phone ? String(ad.phone) : '+263 77 211 1222',
    image:
      ad.image ||
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    featuredOnHome: Boolean(ad.featured_on_home),
    postedAt: ad.created_at ? new Date(ad.created_at).toLocaleDateString('en-GB') : 'Recently Listed',
  };
}
