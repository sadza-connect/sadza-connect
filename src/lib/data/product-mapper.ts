import type { MarketplaceProduct } from './zimbabwe';

export function mapDbProductToMarketplaceProduct(p: any): MarketplaceProduct {
  let images: string[] = [];
  try {
    if (typeof p.images === 'string') {
      images = JSON.parse(p.images);
    } else if (Array.isArray(p.images)) {
      images = p.images;
    }
  } catch {
    images = [];
  }

  const defaultImage =
    images[0] ||
    p.image ||
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80';

  const usdPrice = typeof p.price_usd === 'number' ? p.price_usd : parseFloat(p.price_usd || '0');
  const isVerified = Boolean(p.seller_verified ?? p.is_verified ?? false);

  return {
    id: p.id,
    slug: p.slug,
    title: p.name || p.title,
    category: p.category || 'General Commercial',
    province: p.province || p.seller_province || 'Harare',
    priceUsd: usdPrice,
    unit: p.unit || 'Per Unit',
    movementBadge: p.stock_quantity > 10 ? 'Bulk Stock' : 'Fast Moving',
    postedAgo: 'Recently Listed',
    stockNote: p.in_stock ? `${p.stock_quantity || 1} available in warehouse` : 'Out of Stock',
    location: `${p.province || p.seller_province || 'Nationwide'} • Direct Dispatch`,
    condition: (p.condition as any) || 'Brand New',
    sellerId: p.business_id || p.seller_id || '',
    sellerSlug: p.business_slug || p.seller_slug || '',
    sellerName: p.business_name || p.seller_name || 'Verified Supplier',
    sellerType: p.business_type || 'Registered Company (Pvt Ltd)',
    sellerPlan: p.is_verified ? 'Paid Subscriber' : 'Month 1 Free Grace',
    sellerPhone: p.business_phone || p.business_whatsapp || '+263770000000',
    sellerVerified: isVerified,
    image: defaultImage,
    description: p.description || '',
    highlights: [
      `Supplied by ${p.business_name || 'Verified Commercial Supplier'}`,
      `Dual Currency: USD & ZiG available`,
      `Nationwide waybill delivery supported`,
    ],
    featured: Boolean(p.is_featured),
  };
}
