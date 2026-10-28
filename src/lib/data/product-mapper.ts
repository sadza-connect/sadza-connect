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

  const defaultImage = images[0] || p.image || '';
  const allImages = images.length > 0 ? images : (defaultImage ? [defaultImage] : []);

  const usdPrice = typeof p.price_usd === 'number' ? p.price_usd : parseFloat(p.price_usd || '0');
  const zigPrice = p.price_zig
    ? typeof p.price_zig === 'number'
      ? p.price_zig
      : parseFloat(p.price_zig)
    : Math.round(usdPrice * 26.5);
  const isVerified = Boolean(p.business_is_verified ?? p.seller_verified ?? p.is_verified ?? false);

  // Generate or extract 3 key specifications
  let specs: { label: string; value: string; icon?: string }[] = [];
  if (p.specs && Array.isArray(p.specs)) {
    specs = p.specs;
  } else if (p.category?.toLowerCase().includes('solar') || p.category?.toLowerCase().includes('energy') || p.name?.toLowerCase().includes('solar') || p.title?.toLowerCase().includes('solar')) {
    specs = [
      { label: 'Power Output', value: p.name?.includes('550W') ? '550W' : (p.name?.includes('5kVA') ? '5kVA' : '550W'), icon: 'zap' },
      { label: 'Warranty', value: '25 Years', icon: 'shield' },
      { label: 'Efficiency', value: '22.5%', icon: 'sun' },
    ];
  } else if (p.category?.toLowerCase().includes('agri') || p.name?.toLowerCase().includes('tractor')) {
    specs = [
      { label: 'Engine Power', value: '80 HP', icon: 'zap' },
      { label: 'Warranty', value: '3 Years', icon: 'shield' },
      { label: 'Drive Train', value: '4WD Heavy', icon: 'sun' },
    ];
  } else if (p.category?.toLowerCase().includes('hardware') || p.category?.toLowerCase().includes('construction') || p.name?.toLowerCase().includes('cement')) {
    specs = [
      { label: 'Net Weight', value: '50 KG', icon: 'zap' },
      { label: 'Standard', value: 'ZWS/SABS', icon: 'shield' },
      { label: 'Strength', value: '32.5R Grade', icon: 'sun' },
    ];
  } else {
    specs = [
      { label: 'Condition', value: p.condition || 'Brand New', icon: 'zap' },
      { label: 'Warranty', value: 'Guaranteed', icon: 'shield' },
      { label: 'Availability', value: p.in_stock ? 'In Stock' : 'Pre-order', icon: 'sun' },
    ];
  }

  return {
    id: p.id,
    slug: p.slug,
    title: p.name || p.title,
    category: p.category || 'General Commercial',
    province: p.business_province || p.province || p.seller_province || 'Harare',
    priceUsd: usdPrice,
    priceZig: zigPrice,
    unit: p.unit || 'Per Unit',
    movementBadge: p.stock_quantity > 10 ? 'Bulk Stock' : 'Fast Moving',
    postedAgo: 'Recently Listed',
    stockNote: p.in_stock ? `${p.stock_quantity || 1} available in warehouse` : 'Out of Stock',
    location: `${p.business_city || p.city || p.business_province || p.province || 'Harare'}, Zimbabwe`,
    condition: (p.condition as any) || 'Brand New',
    sellerId: p.business_id || p.seller_id || '',
    sellerSlug: p.business_slug || p.seller_slug || '',
    sellerName: p.business_name || p.seller_name || 'Verified Supplier',
    sellerType: p.business_type || 'Registered Company (Pvt Ltd)',
    sellerPlan: isVerified ? 'Paid Subscriber' : 'Month 1 Free Grace',
    sellerPhone: p.business_phone || p.business_whatsapp || '',
    sellerWhatsapp: p.business_whatsapp || p.business_phone || p.whatsapp || p.phone || '',
    sellerVerified: isVerified,
    sellerLogo: p.business_logo_url || p.business_logo || p.logo_url || undefined,
    sellerCity: p.business_city || p.city || 'Harare',
    sellerAddress: p.business_address || (p.business_city ? `${p.business_city}, Zimbabwe` : 'Harare, Zimbabwe'),
    image: defaultImage,
    images: allImages,
    description: p.description || '',
    highlights: [
      `Supplied by ${p.business_name || 'Verified Commercial Supplier'}`,
      `Dual Currency: USD & ZiG available`,
      `Nationwide waybill delivery supported`,
    ],
    specs,
    featured: Boolean(p.is_featured),
  };
}
