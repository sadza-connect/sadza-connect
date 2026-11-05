/**
 * Sadza Connect - Static Platform Financial Configuration & Pricing Constants
 * 
 * CRITICAL ARCHITECTURAL NOTE:
 * These pricing constants are FIXED and IMMUTABLE.
 * They cannot be altered from the admin dashboard or via API endpoints.
 * All payment gateways (Flutterwave, EcoCash, InnBucks, Card) must strictly sync
 * with these hardcoded amounts to guarantee commercial integrity across Zimbabwe.
 */

export const PLATFORM_PRICING = {
  // 1. Business Directory & Membership Subscriptions
  GRACE_PERIOD: {
    DAYS: 30,
    PRICE_USD: 0.0,
    LABEL: '30-Day Free Grace Period',
    DESCRIPTION: 'Every newly registered enterprise starts with 1 full month of full directory & marketplace access at zero cost.',
  },

  SUBSCRIPTIONS: {
    STANDARD_MONTHLY_USD: 15.0,
    TRACK_A_CORPORATE_USD: 15.0, // Pvt Ltd, PBC, Incorporated Companies
    TRACK_B_SOLO_OPERATOR_USD: 5.0, // Sole Proprietors, Traders & Artisans
    TRACK_C_COOPERATIVE_USD: 10.0, // Agricultural Collectives, NGOs & Co-ops
  },

  // 2. Storefront Catalog Tiers (Product Listing Quotas)
  STOREFRONT_TIERS: [
    {
      id: 'starter',
      name: 'Starter Storefront',
      productQuota: 25,
      priceUsd: 15.0,
      period: '/ month',
      description: 'Ideal for local retailers and boutiques listing up to 25 catalog items.',
    },
    {
      id: 'growth',
      name: 'Growth Storefront',
      productQuota: 100,
      priceUsd: 25.0,
      period: '/ month',
      description: 'Designed for expanding suppliers, electronics dealers, and auto parts stores.',
    },
    {
      id: 'enterprise',
      name: 'Enterprise Wholesaler',
      productQuota: 300,
      priceUsd: 50.0,
      period: '/ month',
      description: 'High-volume distributors and industrial suppliers needing up to 300 products.',
    },
  ],

  // 3. Classified & Business Sponsored Advert Packages (/adverts)
  ADVERT_PACKAGES: [
    {
      id: 'free_starter',
      name: 'Free Starter Trial',
      priceUsd: 0.0,
      pricePeriod: 'forever free',
      advertLimitText: '2 Free Adverts',
      frequencyText: '2 adverts total',
      monthlyCount: 2,
      badge: 'Free Trial',
      description: 'Test the platform, post your initial commercial flyers, and receive direct WhatsApp customer inquiries without spending a cent.',
    },
    {
      id: 'starter_15',
      name: 'Starter Advert Tier',
      priceUsd: 15.0,
      pricePeriod: '/ month',
      advertLimitText: '2 Adverts / Week (8 / Month)',
      frequencyText: '2 times per week',
      monthlyCount: 8,
      badge: 'Local Value',
      description: 'Affordable consistency for local shops, sole proprietors, and artisans to keep fresh weekly offers in front of shoppers.',
    },
    {
      id: 'growth_25',
      name: 'Growth Advert Tier',
      priceUsd: 25.0,
      pricePeriod: '/ month',
      advertLimitText: '3 Adverts / Week (12 / Month)',
      frequencyText: '3 times per week',
      monthlyCount: 12,
      badge: 'Most Popular',
      popular: true,
      description: 'For active retailers running mid-week specials, bulk deals, and weekend clearances with priority homepage exposure.',
    },
    {
      id: 'premium_40',
      name: 'Premium Pro Unlimited',
      priceUsd: 40.0,
      pricePeriod: '/ month',
      advertLimitText: 'Unlimited Adverts (Daily Campaigns)',
      frequencyText: 'Unlimited daily posting',
      monthlyCount: 999,
      badge: 'Best Value',
      description: 'Complete freedom to advertise every single day. Top Featured Gold badge & permanent pinned placement across Homepage & Marketplace.',
    },
  ],

  // Single Standalone Sponsored Advert Slot
  SINGLE_SPONSORED_ADVERT_USD: 20.0, // 30-day campaign

  // 4. Growth Bundles (Checkout)
  ENTERPRISE_DUO_BUNDLE: {
    NAME: 'Enterprise Duo Growth Bundle',
    PRICE_USD: 25.0, // Combines Listing ($15) + Sponsored Advert ($20) = Save $10/mo ($25 instead of $35)
    SAVINGS_USD: 10.0,
  },

  // 5. Subscription Duration Discounts
  DURATION_DISCOUNTS: [
    { months: 1, label: '1 Month', discountPct: 0, tag: 'Standard' },
    { months: 3, label: '3 Months', discountPct: 10, tag: 'Save 10%' },
    { months: 12, label: '12 Months', discountPct: 20, tag: 'Save 20% (Best Value)' },
  ],

  // 6. Real Estate & Rental Landlord Phone Unlock Micro-Fee (/properties)
  PROPERTY_PHONE_UNLOCK_FEE_USD: 2.0, // One-time micro-fee paid by tenant/buyer to reveal landlord direct phone & WhatsApp

  // 7. Commission & Transaction Surcharges
  COMMISSIONS: {
    MARKETPLACE_SALES_PCT: 0.0, // 0% Sales Commission (Buyers settle directly with verified merchants)
    ZESA_UTILITY_SERVICE_FEE_PCT: 1.5, // 1.5% token generation & settlement fee
    WATER_AND_DSTV_SURCHARGE_PCT: 0.0, // 0% platform surcharge on municipal utilities
  },

  // 8. Shipping & Waybill Inter-Provincial Tariffs (Self-Pickup is $0 Free)
  SHIPPING: {
    SELF_PICKUP_HARARE_USD: 0.0, // Free collection at Central Depot Graniteside
    LOCAL_HARARE_DISPATCH_USD: 5.0, // Zone 0 Local metropolitan courier
    MAJOR_CORRIDORS_USD: 12.0, // Zone 1 (Bulawayo, Gweru, Mutare, Masvingo, Kwekwe)
    REGIONAL_AND_BORDER_HUBS_USD: 18.0, // Zone 2 (Beitbridge, Victoria Falls, Chinhoyi, Kariba)
  },

  // 9. Statutory Taxes & Exchange Rate References
  STATUTORY: {
    ZIMBABWE_VAT_PCT: 15.0, // 15% Standard VAT
    REFERENCE_USD_TO_ZIG: 26.5, // 1 USD = 26.50 ZiG reference baseline
  },
} as const;
