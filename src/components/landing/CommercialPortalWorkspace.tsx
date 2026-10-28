'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Building2,
  Briefcase,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  CreditCard,
  Megaphone,
  Plus,
  Layers,
  Map as MapIcon,
  List,
  Star,
  ChevronRight,
  X,
  Package,
  Store,
  Users,
  Handshake,
  SlidersHorizontal,
  ExternalLink,
  Zap,
  UploadCloud,
  Eye,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  PaidAdvertItem,
  CLEAN_PROVINCES,
  COMMERCIAL_SECTORS,
  DEFAULT_PAID_ADVERTS,
  saveStoredAdverts,
  getDeletedAdvertIds,
} from '@/data/advertsStore';
import {
  getPlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
  PlatformSettings,
  getStoredBusinesses,
  saveStoredBusinesses,
  getStoredProducts,
} from '@/data/platformStore';
import { BusinessListing, MarketplaceProduct } from '@/lib/data/zimbabwe';
import { mapDbBusinessToListing } from '@/lib/data/business-mapper';
import { mapDbAdvertToPaidAdvert } from '@/lib/data/advert-mapper';
import { mapDbProductToMarketplaceProduct } from '@/lib/data/product-mapper';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { ProductDetailModal } from '@/components/marketplace/ProductDetailModal';
import { sanitizePhoneNumber } from '@/lib/utils/whatsapp';

const BUSINESS_SCALES = [
  { id: 'All', label: 'All Business Types', icon: Layers },
  { id: 'Registered Company (Pvt Ltd)', label: 'Registered Company (Pvt Ltd)', icon: Building2 },
  { id: 'SME / Partnership', label: 'SME / Partnership', icon: Users },
  { id: 'Sole Proprietor', label: 'Sole Proprietor', icon: Store },
  { id: 'Cooperative / Association', label: 'Cooperative / Association', icon: Handshake },
] as const;

// ---------------------------------------------------------------------------
// LIVE MARKETPLACE PRODUCTS ("Products Coming & Going")
// ---------------------------------------------------------------------------
interface ProductListing {
  id: string;
  title: string;
  category: string;
  province: string;
  priceUSD: number;
  priceZiG: number;
  unit: string;
  movementBadge: 'Just Arrived' | 'Fast Moving' | 'Bulk Stock' | 'New Upload';
  postedAgo: string;
  stockNote: string;
  sellerName: string;
  sellerType:
    | 'Registered Company (Pvt Ltd)'
    | 'SME / Partnership'
    | 'Sole Proprietor'
    | 'Cooperative / Association';
  sellerPlan: 'Paid Subscriber' | 'Month 1 Free Grace';
  whatsapp: string;
  image: string;
  description: string;
}

// ---------------------------------------------------------------------------
// ACTIVE DIRECTORY BUSINESSES (Paid Subscribers + Month 1 Free Grace)
// ---------------------------------------------------------------------------
interface DirectoryBusiness {
  id: string;
  name: string;
  category: string;
  province: string;
  address: string;
  businessType:
    | 'Registered Company (Pvt Ltd)'
    | 'SME / Partnership'
    | 'Sole Proprietor'
    | 'Cooperative / Association';
  subscriptionStatus: 'Paid Subscriber' | 'Month 1 Grace Period' | 'Expired';
  verifiedCR14: boolean;
  rating: number;
  reviews: number;
  specialty: string;
  whatsapp: string;
  phone: string;
  image: string;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
  activeProductsCount: number;
  slug?: string;
  onboardingTrack?: string;
  verificationBadge?: string;
  verifiedTier?: string;
}

const PROVINCE_MAP_COORDS: Record<string, { mapX: number; mapY: number; lat: number; lng: number }> = {
  Harare: { mapX: 62, mapY: 32, lat: -17.8292, lng: 31.0522 },
  Bulawayo: { mapX: 38, mapY: 72, lat: -20.15, lng: 28.5833 },
  Midlands: { mapX: 48, mapY: 54, lat: -19.4522, lng: 29.8167 },
  Manicaland: { mapX: 82, mapY: 46, lat: -18.9707, lng: 32.6709 },
  'Mashonaland Central': { mapX: 64, mapY: 24, lat: -17.5167, lng: 30.9833 },
  'Mashonaland East': { mapX: 72, mapY: 36, lat: -18.1833, lng: 31.55 },
  'Mashonaland West': { mapX: 45, mapY: 30, lat: -17.3667, lng: 30.2 },
  Masvingo: { mapX: 65, mapY: 70, lat: -20.0744, lng: 30.8328 },
  'Matabeleland North': { mapX: 18, mapY: 38, lat: -17.9317, lng: 25.8307 },
  'Matabeleland South': { mapX: 40, mapY: 85, lat: -20.95, lng: 29.0 },
};

function mapListingToDirectoryBusiness(b: BusinessListing): DirectoryBusiness {
  const coords = PROVINCE_MAP_COORDS[b.province] || { mapX: 50, mapY: 50, lat: -19.0, lng: 30.0 };

  const normType: DirectoryBusiness['businessType'] =
    b.onboardingTrack === 'owner_operated'
      ? 'Sole Proprietor'
      : b.onboardingTrack === 'association_institutional'
      ? 'Cooperative / Association'
      : 'Registered Company (Pvt Ltd)';

  return {
    id: b.id,
    slug: b.slug,
    name: b.name,
    category: b.categoryName || 'General Commercial',
    province: b.province || 'Harare',
    address: b.address || 'Central Business District',
    businessType: normType,
    subscriptionStatus:
      b.subscriptionStatus === 'Paid Subscriber'
        ? 'Paid Subscriber'
        : b.subscriptionStatus === 'Expired'
        ? 'Expired'
        : 'Month 1 Grace Period',
    verifiedCR14: Boolean(b.cr14Verified && b.verificationStatus === 'Verified'),
    rating: b.rating || 5.0,
    reviews: b.reviewCount || 1,
    specialty: b.description || 'Verified Zimbabwean commercial supplier and service provider.',
    whatsapp: b.whatsapp || b.phone || '',
    phone: b.phone || '+263 77 000 0000',
    image: b.image || '',
    lat: coords.lat,
    lng: coords.lng,
    mapX: coords.mapX,
    mapY: coords.mapY,
    activeProductsCount: Number((b as any).productsCount || 0),
    onboardingTrack: b.onboardingTrack,
    verificationBadge: b.verificationBadge,
    verifiedTier: b.verifiedTier,
  };
}

function mapDbProductToProductListing(p: any): ProductListing {
  return {
    id: p.id,
    title: p.name || p.title || 'Untitled Product',
    category: p.category || 'General Goods',
    province: p.province || p.business?.province || 'Harare',
    priceUSD: Number(p.price_usd || p.priceUSD || 0),
    priceZiG: Number(p.price_zig || p.priceZiG || (p.price_usd ? Number(p.price_usd) * 26.5 : 0)),
    unit: p.unit || 'Each',
    movementBadge: (p.movementBadge || (p.is_featured ? 'Fast Moving' : 'New Upload')) as any,
    postedAgo: p.postedAgo || 'Recently',
    stockNote: p.stockNote || (p.in_stock !== false ? 'In stock' : 'Out of stock'),
    sellerName: p.business?.name || p.sellerName || 'Verified Merchant',
    sellerType:
      p.business?.onboardingTrack === 'owner_operated'
        ? 'Sole Proprietor'
        : p.business?.onboardingTrack === 'association_institutional'
        ? 'Cooperative / Association'
        : 'Registered Company (Pvt Ltd)',
    sellerPlan: 'Paid Subscriber',
    whatsapp: (p.business?.whatsapp || p.whatsapp || '263771000000').replace(/\D/g, ''),
    image:
      (Array.isArray(p.images) && p.images[0]) ||
      p.image ||
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=700&q=80',
    description: p.description || '',
  };
}

function mapDbJobToJobItem(j: any): JobItem {
  return {
    id: j.id,
    title: j.title || 'Untitled Job',
    company: j.business?.name || j.company || 'Verified Employer',
    province: j.province || 'Harare',
    type: j.job_type || j.type || 'Full-Time',
    salary: j.salary_usd ? `USD $${j.salary_usd}` : 'Negotiable',
    posted: 'Recently',
    category: j.category || 'General',
  };
}

const INITIAL_PRODUCTS: ProductListing[] = [];

const DIRECTORY_BUSINESSES: DirectoryBusiness[] = [];

// ---------------------------------------------------------------------------
// LATEST JOBS & COMMERCIAL TENDERS
// ---------------------------------------------------------------------------
interface JobItem {
  id: string;
  title: string;
  company: string;
  province: string;
  type: string;
  salary: string;
  posted: string;
  category: string;
}

const LATEST_JOBS: JobItem[] = [];

type AccountViewMode =
  | 'visitor'
  | 'grace_active'
  | 'grace_expiring'
  | 'grace_expired'
  | 'paid_subscriber';
type FeedFocusTab = 'all' | 'products' | 'businesses' | 'jobs' | 'adverts';

export function CommercialPortalWorkspace() {
  const { user } = useAuth();

  // Dynamic Platform Settings
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);

  useEffect(() => {
    setSettings(getPlatformSettings());
    const sync = () => setSettings(getPlatformSettings());
    window.addEventListener('sadza-platform-updated', sync);
    return () => window.removeEventListener('sadza-platform-updated', sync);
  }, []);

  // Dynamic Account Status Mode
  const [accountMode, setAccountMode] = useState<AccountViewMode>('visitor');
  const [userBusiness, setUserBusiness] = useState<{
    id: string;
    name: string;
    subscriptionStatus: string;
    graceDaysRemaining?: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!user) {
      setAccountMode('visitor');
      setUserBusiness(null);
      return;
    }

    const isBusiness =
      user.role === 'business' || user.role === 'merchant' || user.accountType === 'business';

    if (!isBusiness) {
      setAccountMode('visitor');
      return;
    }

    // Fetch user's registered business to get live dynamic grace period
    const fetchUserBusiness = async () => {
      try {
        const res = await fetch('/api/v1/businesses?my_business=true');
        const json = await res.json();
        if (isMounted && json.success && json.data?.primaryBusiness) {
          const b = json.data.primaryBusiness;
          const createdTime = b.created_at ? new Date(b.created_at).getTime() : Date.now();
          const daysPassed = Math.floor((Date.now() - createdTime) / (1000 * 60 * 60 * 24));
          const daysRemaining = Math.max(0, settings.freeGracePeriodDays - daysPassed);

          setUserBusiness({
            id: b.id,
            name: b.name,
            subscriptionStatus: b.subscription_status,
            graceDaysRemaining: daysRemaining,
          });

          if (b.subscription_status === 'Paid Subscriber') {
            setAccountMode('paid_subscriber');
          } else if (daysRemaining > 3) {
            setAccountMode('grace_active');
          } else if (daysRemaining > 0) {
            setAccountMode('grace_expiring');
          } else {
            setAccountMode('grace_expired');
          }
        } else if (isMounted) {
          setAccountMode('visitor');
        }
      } catch {
        if (isMounted) setAccountMode('visitor');
      }
    };

    fetchUserBusiness();
    return () => {
      isMounted = false;
    };
  }, [user, settings.freeGracePeriodDays]);

  // Filtering State
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedProvince, setSelectedProvince] = useState<string>('All Provinces');
  const [selectedScale, setSelectedScale] = useState<string>('All');
  const [feedFocus, setFeedFocus] = useState<FeedFocusTab>('all');
  const [productFilterPill, setProductFilterPill] = useState<
    'All' | 'Just Arrived' | 'Fast Moving' | 'Bulk Stock'
  >('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Adverts State & Filtering Mode
  const [paidAdverts, setPaidAdverts] = useState<PaidAdvertItem[]>(DEFAULT_PAID_ADVERTS);
  const [advertFilterMode, setAdvertFilterMode] = useState<'matching' | 'all'>('matching');

  useEffect(() => {
    let isMounted = true;

    async function fetchLiveAdverts() {
      try {
        let liveAdverts: PaidAdvertItem[] = [];
        try {
          const res = await fetch('/api/v1/adverts?limit=50');
          if (res.ok) {
            const json = await res.json();
            const dbAds = json.data?.adverts || json.adverts || [];
            if (Array.isArray(dbAds)) {
              liveAdverts = dbAds.map(mapDbAdvertToPaidAdvert);
            }
          }
        } catch (apiErr) {
          console.warn('API fetch for adverts failed:', apiErr);
        }

        const deletedIds = new Set(getDeletedAdvertIds());
        const validAds = liveAdverts.filter((item) => item && item.id && !deletedIds.has(item.id));

        if (isMounted) {
          setPaidAdverts(validAds);
        }
      } catch (err) {
        console.error('Failed to load adverts for landing page:', err);
        if (isMounted) setPaidAdverts([]);
      }
    }

    fetchLiveAdverts();
    const handleSync = () => fetchLiveAdverts();
    window.addEventListener('sadza-adverts-updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      isMounted = false;
      window.removeEventListener('sadza-adverts-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Directory View Mode (List vs Interactive Map)
  const [directoryView, setDirectoryView] = useState<'list' | 'map'>('list');
  const [selectedMapBusinessId, setSelectedMapBusinessId] = useState<string>('b1');

  // Mobile Filter Drawer State
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Interactive Modals State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<
    'monthly_listing' | 'Listing_plus_advert'
  >('monthly_listing');
  const [paymentMethod, setPaymentMethod] = useState<'ecocash' | 'innbucks' | 'card'>('ecocash');
  const [paymentCurrency, setPaymentCurrency] = useState<'USD' | 'ZiG'>('USD');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Publish New Paid Advert Modal State
  const [createAdvertOpen, setCreateAdvertOpen] = useState(false);
  const [adBizName, setAdBizName] = useState('');
  const [adCategory, setAdCategory] = useState('Solar & Clean Energy');
  const [adProvince, setAdProvince] = useState('Harare');
  const [adHeadline, setAdHeadline] = useState('');
  const [adOfferText, setAdOfferText] = useState('');
  const [adBadge, setAdBadge] = useState('SPECIAL OFFER');
  const [adPriceUSD, setAdPriceUSD] = useState('');
  const [adWhatsapp, setAdWhatsapp] = useState('263772111222');

  // Upload Product Modal State
  const [uploadProductOpen, setUploadProductOpen] = useState(false);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Solar & Clean Energy');
  const [newProdProvince, setNewProdProvince] = useState('Harare');
  const [newProdPriceUSD, setNewProdPriceUSD] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('Each');
  const [newProdStock, setNewProdStock] = useState('Available in stock');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImages, setNewProdImages] = useState<string[]>([]);
  const [newProdImageInput, setNewProdImageInput] = useState('');
  const [newProdBusinessId, setNewProdBusinessId] = useState('');
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [quickViewImageIndex, setQuickViewImageIndex] = useState(0);

  // Quick Apply Job Modal State
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Product Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<MarketplaceProduct | null>(null);

  // Directory Businesses State (Live DB)
  const [businesses, setBusinesses] = useState<DirectoryBusiness[]>([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState<boolean>(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // Instant local cache hydration for zero-second initial paint
    const cachedBiz = getStoredBusinesses();
    if (cachedBiz && cachedBiz.length > 0) {
      setBusinesses(cachedBiz.map(mapListingToDirectoryBusiness));
    }

    const cachedProds = getStoredProducts();
    if (cachedProds && cachedProds.length > 0) {
      setProducts(cachedProds.map(mapDbProductToMarketplaceProduct));
    }

    const loadAllBusinesses = async () => {
      try {
        let liveListings: BusinessListing[] = [];
        try {
          const res = await fetch('/api/v1/businesses?limit=50');
          if (res.ok) {
            const data = await res.json();
            const dbBizList = data.data?.businesses || data.businesses || [];
            if (Array.isArray(dbBizList)) {
              liveListings = dbBizList
                .map((b: any) => mapDbBusinessToListing(b))
                .filter((b: BusinessListing) => b.subscriptionStatus !== 'Expired');
            }
          }
        } catch (apiErr) {
          console.warn('API fetch for directory businesses failed:', apiErr);
        }

        if (isMounted) {
          const mappedDb = liveListings.map(mapListingToDirectoryBusiness);
          setBusinesses(mappedDb);
          setIsLoadingBusinesses(false);
          if (liveListings.length > 0) {
            saveStoredBusinesses(liveListings);
          }
        }
      } catch (err) {
        console.error('Failed to load businesses for landing page:', err);
        if (isMounted) {
          setBusinesses([]);
          setIsLoadingBusinesses(false);
        }
      }
    };

    const loadAllProducts = async () => {
      try {
        let liveProds: MarketplaceProduct[] = [];
        try {
          const res = await fetch('/api/v1/products?limit=50');
          if (res.ok) {
            const data = await res.json();
            const dbProdList = data.data?.products || data.products || [];
            if (Array.isArray(dbProdList)) {
              liveProds = dbProdList.map(mapDbProductToMarketplaceProduct);
            }
          }
        } catch (apiErr) {
          console.warn('API fetch for products failed:', apiErr);
        }

        if (isMounted) {
          setProducts(liveProds);
          setIsLoadingProducts(false);
        }
      } catch (err) {
        console.error('Failed to load products for landing page:', err);
        if (isMounted) {
          setProducts([]);
          setIsLoadingProducts(false);
        }
      }
    };

    const loadAllJobs = async () => {
      try {
        let liveJobs: JobItem[] = [];
        try {
          const res = await fetch('/api/v1/jobs?limit=50');
          if (res.ok) {
            const data = await res.json();
            const dbJobList = data.data?.jobs || data.jobs || [];
            if (Array.isArray(dbJobList)) {
              liveJobs = dbJobList.map(mapDbJobToJobItem);
            }
          }
        } catch (apiErr) {
          console.warn('API fetch for jobs failed:', apiErr);
        }

        if (isMounted) {
          setJobs(liveJobs);
          setIsLoadingJobs(false);
        }
      } catch (err) {
        console.error('Failed to load jobs for landing page:', err);
        if (isMounted) {
          setJobs([]);
          setIsLoadingJobs(false);
        }
      }
    };

    loadAllBusinesses();
    loadAllProducts();
    loadAllJobs();

    const handleSync = () => {
      loadAllBusinesses();
      loadAllProducts();
      loadAllJobs();
    };
    window.addEventListener('sadza-platform-updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      isMounted = false;
      window.removeEventListener('sadza-platform-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchSector = selectedSector === 'All' || item.category === selectedSector;
      const matchProvince =
        selectedProvince === 'All Provinces' || item.province === selectedProvince;
      const matchScale = selectedScale === 'All' || item.sellerType === selectedScale;
      const matchPill = productFilterPill === 'All' || item.movementBadge === productFilterPill;
      const matchQuery =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSector && matchProvince && matchScale && matchPill && matchQuery;
    });
  }, [products, selectedSector, selectedProvince, selectedScale, productFilterPill, searchQuery]);

  // Filtered Businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((biz) => {
      const matchSector = selectedSector === 'All' || biz.category === selectedSector;
      const matchProvince =
        selectedProvince === 'All Provinces' || biz.province === selectedProvince;
      const matchScale = selectedScale === 'All' || biz.businessType === selectedScale;
      const matchQuery =
        !searchQuery.trim() ||
        biz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        biz.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        biz.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSector && matchProvince && matchScale && matchQuery;
    });
  }, [businesses, selectedSector, selectedProvince, selectedScale, searchQuery]);

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchSector = selectedSector === 'All' || job.category === selectedSector;
      const matchProvince =
        selectedProvince === 'All Provinces' || job.province === selectedProvince;
      const matchQuery =
        !searchQuery.trim() ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSector && matchProvince && matchQuery;
    });
  }, [jobs, selectedSector, selectedProvince, searchQuery]);

  // Filtered Paid Adverts in Right Sidebar
  const displayedAdverts = useMemo(() => {
    if (advertFilterMode === 'all') {
      return paidAdverts.slice(0, 4);
    }
    const matching = paidAdverts.filter((ad) => {
      const matchSector = selectedSector === 'All' || ad.category === selectedSector;
      const matchProv = selectedProvince === 'All Provinces' || ad.province === selectedProvince;
      const matchQuery =
        !searchQuery.trim() ||
        ad.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.businessName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSector && matchProv && matchQuery;
    });
    return matching.length > 0 ? matching.slice(0, 4) : paidAdverts.slice(0, 4);
  }, [paidAdverts, advertFilterMode, selectedSector, selectedProvince, searchQuery]);

  const hasExactMatchingAdverts = useMemo(() => {
    return paidAdverts.some((ad) => {
      const matchSector = selectedSector === 'All' || ad.category === selectedSector;
      const matchProv = selectedProvince === 'All Provinces' || ad.province === selectedProvince;
      return matchSector && matchProv;
    });
  }, [paidAdverts, selectedSector, selectedProvince]);

  const selectedMapBusiness =
    filteredBusinesses.find((b) => b.id === selectedMapBusinessId) ||
    filteredBusinesses[0] ||
    businesses[0] ||
    null;

  const activeFiltersCount =
    (selectedSector !== 'All' ? 1 : 0) +
    (selectedProvince !== 'All Provinces' ? 1 : 0) +
    (selectedScale !== 'All' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedSector('All');
    setSelectedProvince('All Provinces');
    setSelectedScale('All');
    setProductFilterPill('All');
    setSearchQuery('');
  };

  const handleUploadProductAction = () => {
    if (accountMode === 'grace_expired') {
      setPaymentModalOpen(true);
      return;
    }
    setUploadProductOpen(true);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle.trim()) return;

    setIsSubmittingProduct(true);
    const usd = parseFloat(newProdPriceUSD) || 25;
    const targetBusiness =
      businesses.find((b) => b.id === newProdBusinessId) ||
      businesses[0];

    const finalImages = (
      newProdImages.length > 0
        ? newProdImages
        : [
            'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
          ]
    ).slice(0, 5);

    try {
      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          business_id: targetBusiness?.id,
          business_slug: targetBusiness?.slug,
          name: newProdTitle.trim(),
          category: newProdCategory,
          price_usd: usd,
          description:
            newProdDesc.trim() ||
            `Supplied directly by ${targetBusiness?.name || 'Verified Commercial Supplier'} in ${newProdProvince}.`,
          images: finalImages,
          in_stock: true,
          condition: 'Brand New',
          is_featured: false,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data?.product) {
        const mapped = mapDbProductToMarketplaceProduct(json.data.product);
        setProducts((prev) => [mapped, ...prev.filter((p) => p.id !== mapped.id)]);
      } else {
        const created: MarketplaceProduct = {
          id: `p-${Date.now()}`,
          slug: `prod-${Date.now()}`,
          title: newProdTitle.trim() || 'Commercial Supply Item',
          category: newProdCategory,
          province: newProdProvince,
          priceUsd: usd,
          priceZig: Math.round(usd * 26.5),
          unit: newProdUnit || 'Each',
          movementBadge: 'Just Arrived',
          postedAgo: 'Just now',
          stockNote: newProdStock || 'In stock',
          location: `${newProdProvince}, Zimbabwe`,
          condition: 'Brand New',
          sellerId: targetBusiness?.id || 'biz-current',
          sellerSlug: targetBusiness?.slug || 'user-business',
          sellerName: targetBusiness?.name || user?.fullName || 'Your Registered Business',
          sellerType: 'Registered Company (Pvt Ltd)',
          sellerPlan: accountMode === 'paid_subscriber' ? 'Paid Subscriber' : 'Month 1 Free Grace',
          sellerPhone: targetBusiness?.phone || '263772111222',
          sellerWhatsapp: targetBusiness?.phone || '263772111222',
          sellerVerified: true,
          image: finalImages[0],
          images: finalImages,
          description:
            newProdDesc.trim() ||
            `Supplied directly by ${targetBusiness?.name || 'Verified Commercial Supplier'} in ${newProdProvince}.`,
          highlights: ['Uploaded directly via Sadza Connect Commercial Portal.'],
          featured: false,
        };
        setProducts((prev) => [created, ...prev]);
      }
    } catch (err) {
      console.error('Failed to create product:', err);
    } finally {
      setIsSubmittingProduct(false);
      setUploadProductOpen(false);
      setNewProdTitle('');
      setNewProdPriceUSD('');
      setNewProdDesc('');
      setNewProdImages([]);
      setNewProdImageInput('');
    }
  };

  const handlePublishNewAdvert = async (e: React.FormEvent) => {
    e.preventDefault();
    const usd = parseFloat(adPriceUSD) || undefined;
    const cleanWhatsapp = adWhatsapp.replace(/\D/g, '') || '263772111222';

    let createdAdvertObj: PaidAdvertItem | null = null;
    try {
      const res = await fetch('/api/v1/adverts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          business_name: adBizName.trim() || user?.fullName || 'Verified Business Partner',
          business_type: 'Registered Company (Pvt Ltd)',
          province: adProvince,
          category: adCategory,
          offer_type: 'Special Package',
          headline: adHeadline.trim() || 'Commercial Promotional Offer',
          offer_text:
            adOfferText.trim() ||
            'Direct wholesale and commercial supply promotion available via WhatsApp.',
          promo_badge: adBadge.trim().toUpperCase() || 'PAID PROMO',
          promo_price_usd: usd,
          valid_until: 'Valid 30 days',
          whatsapp: cleanWhatsapp,
          phone: `+${cleanWhatsapp}`,
          image:
            'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
          featured_on_home: true,
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.advert) {
        createdAdvertObj = mapDbAdvertToPaidAdvert(json.data.advert);
      }
    } catch (err) {
      console.error('Failed to publish advert to database:', err);
    }

    const createdAd: PaidAdvertItem = createdAdvertObj || {
      id: `ad-${Date.now()}`,
      businessName: adBizName.trim() || user?.fullName || 'Verified Business Partner',
      businessType: 'Registered Company (Pvt Ltd)',
      province: adProvince,
      category: adCategory,
      offerType: 'Special Package',
      headline: adHeadline.trim() || 'Commercial Promotional Offer',
      offerText:
        adOfferText.trim() ||
        'Direct wholesale and commercial supply promotion available via WhatsApp.',
      promoBadge: adBadge.trim().toUpperCase() || 'PAID PROMO',
      promoPriceUSD: usd,
      priceZiG: usd ? Math.round(usd * 26.5) : undefined,
      validUntil: 'Valid 30 days',
      whatsapp: cleanWhatsapp,
      phone: `+${cleanWhatsapp}`,
      image:
        'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
      featuredOnHome: true,
      postedAt: 'Just now',
    };
    const nextAdverts = [createdAd, ...paidAdverts.filter((a) => a.id !== createdAd.id)];
    setPaidAdverts(nextAdverts);
    saveStoredAdverts(nextAdverts);
    setCreateAdvertOpen(false);
    setAccountMode('paid_subscriber');
    setAdHeadline('');
    setAdOfferText('');
    setAdPriceUSD('');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      setAccountMode('paid_subscriber');
    }, 800);
  };

  return (
    <section
      id="commercial-portal"
      aria-label="Sadza Connect Commercial Portal"
      className="relative bg-slate-100/90 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pb-24 transition-colors"
    >
      {/* =====================================================================
          1. TOP BUSINESS & 1-MONTH GRACE PERIOD NOTIFICATION STRIP
      ===================================================================== */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3.5">
          {/* Contextual Banner based on Account / Grace Period State */}
          {accountMode === 'visitor' && (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 px-5 py-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Own a Business in Zimbabwe? Enjoy a {settings.freeGracePeriodDays}-Day Free Grace Period
                    </span>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      First {settings.freeGracePeriodDays} Days Free
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Register your Sole Proprietorship, SME, Pvt Ltd Company, or Cooperative today. Get listed in the directory and upload products free for {settings.freeGracePeriodDays} days before any monthly payment is required.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  href="/signup?role=business"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-xs transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Register Business ({settings.freeGracePeriodDays} Days Free)</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setCreateAdvertOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  <Megaphone className="h-4 w-4 text-amber-600" />
                  <span>Advertise a Product / Deal</span>
                </button>
              </div>
            </div>
          )}

          {accountMode === 'grace_active' && (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 px-5 py-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {settings.freeGracePeriodDays}-Day Free Grace Period Active — {userBusiness?.graceDaysRemaining ?? settings.freeGracePeriodDays} Days Remaining
                    </span>
                    <span className="rounded-md bg-emerald-600 text-white px-2.5 py-0.5 text-xs font-bold">
                      Day {Math.min(settings.freeGracePeriodDays, Math.max(1, settings.freeGracePeriodDays - (userBusiness?.graceDaysRemaining ?? settings.freeGracePeriodDays)))} of {settings.freeGracePeriodDays}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1">
                    Your business directory profile and product uploads are live across Zimbabwe. Your first monthly subscription (${settings.monthlySubscriptionPriceUsd}/mo) will only be due after your {settings.freeGracePeriodDays}-day grace period ends.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleUploadProductAction}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Upload Product Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentPlan('monthly_listing');
                    setPaymentSuccess(false);
                    setPaymentModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Pay Subscription Early</span>
                </button>
              </div>
            </div>
          )}

          {accountMode === 'grace_expiring' && (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 px-5 py-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Renewal Reminder: Your {settings.freeGracePeriodDays}-Day Grace Period Ends in {userBusiness?.graceDaysRemaining ?? 3} {(userBusiness?.graceDaysRemaining ?? 3) === 1 ? 'Day' : 'Days'}
                    </span>
                    <span className="rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2.5 py-0.5 text-xs font-bold">
                      Action Required Soon
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1">
                    Activate your monthly business subscription (${settings.monthlySubscriptionPriceUsd} USD / ZiG equivalent) via EcoCash, InnBucks, or Card so your business listing and marketplace products remain live without interruption.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentPlan('monthly_listing');
                    setPaymentSuccess(false);
                    setPaymentModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Make Payment Now (${settings.monthlySubscriptionPriceUsd}/mo)</span>
                </button>
              </div>
            </div>
          )}

          {accountMode === 'grace_expired' && (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 px-5 py-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-sm sm:text-base font-bold text-rose-950 dark:text-white">
                      Your {settings.freeGracePeriodDays}-Day Free Grace Period Has Ended — Subscription Payment Required
                    </span>
                    <span className="rounded-md bg-rose-600 text-white px-2.5 py-0.5 text-xs font-bold uppercase">
                      Listing Paused
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-rose-900 dark:text-rose-200 mt-1">
                    Your {settings.freeGracePeriodDays}-day free trial is complete. Complete your monthly payment (${settings.monthlySubscriptionPriceUsd}/mo) to restore your public directory visibility and unlock new product &amp; advert uploads.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentPlan('monthly_listing');
                    setPaymentSuccess(false);
                    setPaymentModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Pay Subscription to Unlock (${settings.monthlySubscriptionPriceUsd}/mo)</span>
                </button>
              </div>
            </div>
          )}

          {accountMode === 'paid_subscriber' && (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl bg-slate-900 text-white px-5 py-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-slate-950">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-sm sm:text-base font-bold text-white">
                      Verified Paid Business Account — Priority Directory &amp; Marketplace Access
                    </span>
                    <span className="rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-2.5 py-0.5 text-xs font-bold">
                      Subscription Active
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    Your business and products receive priority placement. You can upload unlimited stock and publish sponsored sidebar adverts.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleUploadProductAction}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Upload Product</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateAdvertOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  <Megaphone className="h-4 w-4 text-amber-400" />
                  <span>Publish Paid Advert</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          2. MOBILE & TABLET STICKY QUICK TOOLBAR (< 1024px)
      ===================================================================== */}
      <div className="lg:hidden sticky top-[72px] z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-xs">
        <div className="w-full max-w-[1760px] mx-auto flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* Filter Drawer Button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100"
            >
              <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
              <span>Sectors &amp; Provinces</span>
              {activeFiltersCount > 0 && (
                <span className="ml-0.5 rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[11px]">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Quick Province Select for Mobile/Tablet */}
            <div className="relative flex-1 max-w-[220px]">
              <select
                aria-label="Select Province"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-3 pr-7 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
              >
                {CLEAN_PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            {/* Post Product CTA on Mobile */}
            <button
              type="button"
              onClick={handleUploadProductAction}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs sm:text-sm font-bold shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Sell</span>
            </button>
          </div>

          {/* Horizontal Scrollable Section Pills on Mobile/Tablet */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {(
              [
                { id: 'all', label: 'All Activity' },
                { id: 'products', label: `Products (${filteredProducts.length})` },
                { id: 'businesses', label: `Businesses (${filteredBusinesses.length})` },
                { id: 'jobs', label: `Jobs (${filteredJobs.length})` },
                { id: 'adverts', label: `Paid Adverts (${paidAdverts.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFeedFocus(tab.id)}
                className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-bold transition-colors ${
                  feedFocus === tab.id
                    ? 'bg-slate-900 text-white dark:bg-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. MAIN 3-COLUMN COMMERCIAL PORTAL WORKSPACE (WIDE DESKTOP CONTAINER)
          Utilizes desktop screen width comfortably (`max-w-[1760px]`) with
          audible, comfortable typography across Left, Center & Right columns
      ===================================================================== */}
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
          {/* =================================================================
              LEFT SIDEBAR: DIRECTORY SECTORS, 10 PROVINCES & BUSINESS SCALE
          ================================================================= */}
          <aside
            aria-label="Directory Navigation and Filters"
            className="hidden lg:block lg:col-span-3 sticky top-24 space-y-6"
          >
            {/* Active Filters Reset Banner */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-4 py-3">
                <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  {activeFiltersCount} Active Filter{activeFiltersCount > 1 ? 's' : ''}
                </span>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              </div>
            )}

            {/* Card 1: Commercial Sectors */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
              <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Layers className="h-4.5 w-4.5 text-emerald-600" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Commercial Sectors
                  </h2>
                </div>
                <Link
                  href="/businesses"
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  All 20 →
                </Link>
              </div>

              <div className="p-2.5 max-h-[420px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {COMMERCIAL_SECTORS.map((sector) => {
                  const active = selectedSector === sector.id;
                  return (
                    <button
                      key={sector.id}
                      type="button"
                      onClick={() => setSelectedSector(sector.id)}
                      className={`w-full flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                        active
                          ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                      }`}
                    >
                      <span className="truncate">{sector.label}</span>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          active
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {sector.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card 2: Browse by Province (Strictly Clean Province Names) */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
              <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4.5 w-4.5 text-emerald-600" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Filter by Province
                  </h2>
                </div>
                <span className="text-xs font-semibold text-slate-500">10 Provinces</span>
              </div>

              <div className="p-2.5 grid grid-cols-1 gap-1">
                {CLEAN_PROVINCES.map((province) => {
                  const active = selectedProvince === province;
                  return (
                    <button
                      key={province}
                      type="button"
                      onClick={() => setSelectedProvince(province)}
                      className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2 text-left text-sm transition-colors cursor-pointer ${
                        active
                          ? 'bg-slate-900 text-white dark:bg-emerald-600 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                      }`}
                    >
                      <span className="truncate">{province}</span>
                      {active && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 dark:text-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card 3: Filter by Business Structure */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
              <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 px-5 py-3.5 flex items-center gap-2.5">
                <Building2 className="h-4.5 w-4.5 text-emerald-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Business Classification
                </h2>
              </div>

              <div className="p-2.5 space-y-1">
                {BUSINESS_SCALES.map((scale) => {
                  const Icon = scale.icon;
                  const active = selectedScale === scale.id;
                  return (
                    <button
                      key={scale.id}
                      type="button"
                      onClick={() => setSelectedScale(scale.id)}
                      className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                        active
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="truncate">{scale.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* =================================================================
              CENTER MAIN COMMERCIAL FEED (6 cols on Desktop, Full width on <lg)
          ================================================================= */}
          <div
            className={`${
              feedFocus === 'adverts' ? 'hidden lg:block' : 'block'
            } lg:col-span-6 space-y-7 min-w-0`}
          >
            {/* Top Feed Control Bar */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-2xs space-y-3.5">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
                {/* Desktop Section Tabs */}
                <div className="hidden lg:flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
                  {(
                    [
                      { id: 'all', label: 'All Activity' },
                      { id: 'products', label: `Products (${filteredProducts.length})` },
                      { id: 'businesses', label: `Businesses (${filteredBusinesses.length})` },
                      { id: 'jobs', label: `Jobs (${filteredJobs.length})` },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFeedFocus(tab.id)}
                      className={`rounded-lg px-3.5 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        feedFocus === tab.id
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Instant Keyword Filter within Feed */}
                <div className="relative flex-1 xl:max-w-xs">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter products, companies, specs..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2 pl-9 pr-8 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-900"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear filter"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Active Breadcrumb Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
                <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-slate-200">Showing:</span>
                  <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-semibold text-slate-800 dark:text-slate-200">
                    {selectedSector === 'All' ? 'All Sectors' : selectedSector}
                  </span>
                  <span>•</span>
                  <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-semibold text-slate-800 dark:text-slate-200">
                    {selectedProvince}
                  </span>
                  {selectedScale !== 'All' && (
                    <>
                      <span>•</span>
                      <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 font-semibold">
                        {selectedScale}
                      </span>
                    </>
                  )}
                </div>

                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  Dual Pricing: USD &amp; ZiG
                </span>
              </div>
            </div>



            {/* ---------------------------------------------------------------
                FEED SECTION A: PRODUCTS COMING & GOING (LIVE MARKETPLACE)
            --------------------------------------------------------------- */}
            {(feedFocus === 'all' || feedFocus === 'products') && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
                {/* Section Header */}
                <div className="border-b border-slate-200 dark:border-slate-800 px-5 sm:px-6 py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/40">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600" />
                      </span>
                      <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        Live Marketplace — Products Coming &amp; Going
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Fresh commercial stock uploaded by verified &amp; active businesses across Zimbabwe
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleUploadProductAction}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Upload Product</span>
                    </button>
                    <Link
                      href="/marketplace"
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <span>View All</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {/* Movement Sub-Filter Bar */}
                <div className="px-5 sm:px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-2">
                    {(['All', 'Just Arrived', 'Fast Moving', 'Bulk Stock'] as const).map((pill) => (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => setProductFilterPill(pill)}
                        className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                          productFilterPill === pill
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {pill === 'All' ? 'All Live Stock' : pill}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-slate-400 shrink-0 hidden sm:inline">
                    {isLoadingProducts && products.length === 0 ? '...' : filteredProducts.length} items matching
                  </span>
                </div>

                {/* Products Grid */}
                {isLoadingProducts && products.length === 0 ? (
                  <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs"
                      >
                        <div className="aspect-[16/10] w-full bg-slate-200 dark:bg-slate-800" />
                        <div className="p-4 sm:p-5 space-y-3">
                          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                          <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="p-10 text-center space-y-3">
                    <Package className="h-9 w-9 text-slate-400 mx-auto" />
                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                      No products match your current filter combination
                    </p>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                      Try clearing the sector or province filter to see all live products moving across Zimbabwe.
                    </p>
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 text-white px-4 py-2 text-xs sm:text-sm font-bold"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {filteredProducts.map((item) => (
                      <ProductCard
                        key={item.id}
                        product={item}
                        onViewProduct={(prod) => {
                          setQuickViewProduct(prod);
                          setQuickViewImageIndex(0);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------------------
                FEED SECTION B: VERIFIED & ACTIVE BUSINESSES DIRECTORY
            --------------------------------------------------------------- */}
            {(feedFocus === 'all' || feedFocus === 'businesses') && (
              <div
                id="directory"
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs"
              >
                {/* Section Header */}
                <div className="border-b border-slate-200 dark:border-slate-800 px-5 sm:px-6 py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/40">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <Building2 className="h-5 w-5 text-emerald-600" />
                      <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        Active &amp; Verified Businesses Directory
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Subscribed enterprises and newly onboarded businesses (in 30-day free grace period)
                    </p>
                  </div>

                  {/* List vs Map Toggle */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1">
                      <button
                        type="button"
                        onClick={() => setDirectoryView('list')}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                          directoryView === 'list'
                            ? 'bg-slate-900 text-white dark:bg-emerald-600'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <List className="h-4 w-4" />
                        <span>List</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDirectoryView('map')}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                          directoryView === 'map'
                            ? 'bg-slate-900 text-white dark:bg-emerald-600'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <MapIcon className="h-4 w-4" />
                        <span>Map View</span>
                      </button>
                    </div>

                    <Link
                      href="/businesses"
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <span>Full Directory</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {/* Directory Content: List View vs Interactive Map View */}
                {directoryView === 'list' ? (
                  <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {isLoadingBusinesses && businesses.length === 0 ? (
                      <div className="p-4 sm:p-6 space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="animate-pulse flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                          >
                            <div className="h-28 w-28 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                            <div className="flex-1 space-y-2.5">
                              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                              <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                              <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                              <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredBusinesses.length === 0 ? (
                      <div className="p-10 text-center space-y-2">
                        <Building2 className="h-9 w-9 text-slate-400 mx-auto" />
                        <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                          No businesses found for this filter
                        </p>
                        <button
                          type="button"
                          onClick={resetAllFilters}
                          className="text-xs sm:text-sm font-bold text-emerald-600 hover:underline"
                        >
                          Show all provinces &amp; sectors
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 sm:p-6 space-y-4">
                        {filteredBusinesses.map((biz) => {
                          const bizProductsCount = products.filter(
                            (p) =>
                              (p as any).business_id === biz.id ||
                              (biz.slug && (p as any).sellerSlug === biz.slug) ||
                              (biz.name && p.sellerName?.toLowerCase() === biz.name.toLowerCase())
                          ).length;

                          return (
                            <div
                              key={biz.id}
                              className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 hover:border-emerald-500/60 dark:hover:border-emerald-500/50 hover:shadow-lg dark:hover:shadow-emerald-950/20 transition-all duration-200 group flex flex-col md:flex-row gap-5"
                            >
                              {/* Thumbnail / Branded Emblem */}
                              <Link
                                href={`/businesses/${biz.slug || biz.id}`}
                                className="relative h-44 md:h-36 md:w-48 shrink-0 rounded-xl overflow-hidden block group/thumb"
                              >
                                {biz.image ? (
                                  <>
                                    <Image
                                      src={biz.image}
                                      alt={biz.name}
                                      fill
                                      sizes="(max-width: 768px) 100vw, 192px"
                                      className="object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                                    />
                                    <div className="absolute top-2.5 left-2.5">
                                      <span className="rounded-lg bg-white/95 dark:bg-slate-900/95 px-2.5 py-1 text-[11px] font-bold text-slate-900 dark:text-white shadow-2xs">
                                        {biz.province}
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-3.5 flex flex-col justify-between relative shadow-xs">
                                    <div className="flex items-center justify-between">
                                      <span className="rounded-md bg-black/40 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white tracking-wider uppercase">
                                        {biz.province}
                                      </span>
                                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                                    </div>
                                    <div className="text-center my-auto">
                                      <div className="h-11 w-11 rounded-xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center text-white text-lg font-black shadow-inner border border-white/25">
                                        {biz.name.charAt(0).toUpperCase()}
                                      </div>
                                      <p className="text-xs font-bold text-white truncate mt-1.5 px-1">{biz.name}</p>
                                    </div>
                                    <div className="text-[10px] text-emerald-100/80 truncate text-center font-medium">
                                      {biz.category}
                                    </div>
                                  </div>
                                )}
                              </Link>

                              {/* Details */}
                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {biz.businessType}
                                      </span>
                                      {biz.verifiedCR14 ? (
                                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs">
                                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                          {biz.verificationBadge ||
                                            (biz.onboardingTrack === 'owner_operated' || biz.businessType === 'Sole Proprietor'
                                              ? 'National ID Verified'
                                              : 'CR14 Verified')}
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
                                          <Sparkles className="h-3 w-3 text-blue-600" />
                                          New Listing • Month 1 Grace
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                      <span>{biz.rating.toFixed(1)}</span>
                                      <span className="text-slate-400 font-normal">
                                        ({biz.reviews})
                                      </span>
                                    </div>
                                  </div>

                                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-2">
                                    <Link
                                      href={`/businesses/${biz.slug || biz.id}`}
                                      className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                                    >
                                      <span>{biz.name}</span>
                                      <ArrowUpRight className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                                    </Link>
                                  </h3>

                                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                                    <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                                    <span className="truncate">
                                      {biz.address} •{' '}
                                      <strong className="text-slate-700 dark:text-slate-300">
                                        {biz.province}
                                      </strong>
                                    </span>
                                  </p>

                                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                                    {biz.specialty}
                                  </p>
                                </div>

                                {/* Bottom Actions Bar */}
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    {bizProductsCount > 0 ? (
                                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        <Package className="h-3.5 w-3.5 text-emerald-600" />
                                        <span>
                                          <strong className="text-slate-900 dark:text-white">{bizProductsCount}</strong>{' '}
                                          {bizProductsCount === 1 ? 'product' : 'products'} in marketplace
                                        </span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span>Direct Orders &amp; WhatsApp Quotes Active</span>
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Link
                                      href={`/businesses/${biz.slug || biz.id}`}
                                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
                                    >
                                      <span>Storefront</span>
                                      <ArrowUpRight className="h-3.5 w-3.5" />
                                    </Link>
                                    <a
                                      href={`tel:${biz.phone}`}
                                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
                                    >
                                      <Phone className="h-3.5 w-3.5" />
                                      <span>Call</span>
                                    </a>
                                    <a
                                      href={`https://wa.me/${sanitizePhoneNumber(biz.whatsapp)}?text=Hi%20${encodeURIComponent(
                                        biz.name
                                      )},%20I%20found%20your%20business%20on%20Sadza%20Connect`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition-colors shadow-xs"
                                    >
                                      <MessageCircle className="h-3.5 w-3.5" />
                                      <span>WhatsApp</span>
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Interactive Map View inside the Center Feed */
                  <div className="p-5 space-y-4">
                    <div className="relative h-[420px] w-full rounded-2xl bg-[#182338] overflow-hidden border border-slate-300 dark:border-slate-700">
                      <svg
                        className="absolute inset-0 h-full w-full opacity-30"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M 0,180 Q 150,160 300,140 T 600,220"
                          fill="none"
                          stroke="#60a5fa"
                          strokeWidth="3"
                        />
                        <path
                          d="M 120,0 Q 200,200 240,400"
                          fill="none"
                          stroke="#facc15"
                          strokeWidth="2.5"
                        />
                        <path
                          d="M 350,40 Q 300,220 400,400"
                          fill="none"
                          stroke="#4ade80"
                          strokeWidth="2"
                        />
                      </svg>

                      {filteredBusinesses.map((biz) => {
                        const isSelected = selectedMapBusiness ? biz.id === selectedMapBusiness.id : false;
                        return (
                          <button
                            key={biz.id}
                            type="button"
                            onClick={() => setSelectedMapBusinessId(biz.id)}
                            style={{ left: `${biz.mapX}%`, top: `${biz.mapY}%` }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                          >
                            <div
                              className={`flex items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform ${
                                isSelected
                                  ? 'h-11 w-11 bg-emerald-600 text-white scale-110 ring-4 ring-emerald-500/40'
                                  : 'h-9 w-9 bg-slate-900 text-amber-400 hover:scale-110'
                              }`}
                            >
                              <MapPin className="h-4.5 w-4.5" />
                            </div>
                            <span className="mt-1 block rounded bg-slate-950/90 px-2.5 py-0.5 text-xs font-bold text-white whitespace-nowrap shadow">
                              {biz.province}
                            </span>
                          </button>
                        );
                      })}

                      {/* Selected Pin Card */}
                      {selectedMapBusiness && (
                        <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-slate-900/95 border border-slate-700 p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-30">
                          <div className="min-w-0">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                              {selectedMapBusiness.category} • {selectedMapBusiness.province}
                            </span>
                            <h4 className="text-base font-bold text-white truncate">
                              {selectedMapBusiness.name}
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-300 truncate">
                              {selectedMapBusiness.address}
                            </p>
                          </div>
                          <div className="flex items-center gap-2.5 shrink-0">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${selectedMapBusiness.lat},${selectedMapBusiness.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white inline-flex items-center gap-1"
                            >
                              <span>GPS</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                            <a
                              href={`https://wa.me/${sanitizePhoneNumber(selectedMapBusiness.whatsapp)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white inline-flex items-center gap-1.5"
                            >
                              <MessageCircle className="h-4 w-4" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------------------
                FEED SECTION C: LATEST COMMERCIAL VACANCIES & TENDERS
            --------------------------------------------------------------- */}
            {(feedFocus === 'all' || feedFocus === 'jobs') && (
              <div
                id="jobs"
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs"
              >
                <div className="border-b border-slate-200 dark:border-slate-800 px-5 sm:px-6 py-4.5 flex items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/40">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="h-5 w-5 text-emerald-600" />
                      <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        Latest Job Vacancies from Verified Businesses
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Direct recruitment by active employers across Zimbabwe
                    </p>
                  </div>

                  <Link
                    href="/jobs"
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                  >
                    <span>All Jobs</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {isLoadingJobs && jobs.length === 0 ? (
                    <div className="p-5 sm:p-6 space-y-4">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="animate-pulse flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                        >
                          <div className="space-y-2 flex-1">
                            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                            <div className="h-5 w-44 bg-slate-200 dark:bg-slate-800 rounded" />
                            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                          </div>
                          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                        </div>
                      ))}
                    </div>
                  ) : filteredJobs.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <Briefcase className="h-8 w-8 text-slate-400 mx-auto" />
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        No open vacancies posted yet
                      </p>
                      <p className="text-xs text-slate-500">
                        Check back soon or post a new vacancy for your enterprise.
                      </p>
                    </div>
                  ) : (
                    filteredJobs.map((job) => (
                      <div
                        key={job.id}
                        className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                              {job.category}
                            </span>
                            <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 text-xs font-bold">
                              {job.type}
                            </span>
                            <span className="text-xs text-slate-400">{job.posted}</span>
                          </div>

                          <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            {job.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {job.company}
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                              {job.province}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">
                              {job.salary}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedJob(job);
                            setAppliedSuccess(false);
                          }}
                          className="shrink-0 rounded-xl bg-slate-900 hover:bg-emerald-600 dark:bg-white dark:text-slate-900 dark:hover:bg-emerald-500 dark:hover:text-white text-white px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                        >
                          Quick Apply
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* =================================================================
              RIGHT SIDEBAR: PAID BUSINESS ADVERTS, 30-DAY GRACE RULES & UTILITIES
              Filterable by Province/Sector + linked to dedicated `/adverts` page!
          ================================================================= */}
          <aside
            aria-label="Sponsored Business Adverts and Business Tools"
            className={`${
              feedFocus !== 'all' && feedFocus !== 'adverts' ? 'hidden lg:block' : 'block'
            } lg:col-span-3 lg:sticky lg:top-24 space-y-6`}
          >
            {/* Card 1: PAID BUSINESS ADVERTS (Filterable + Dedicated Page Link) */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
              <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white px-5 py-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4.5 w-4.5 text-amber-400" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">
                      Sponsored Adverts
                    </h2>
                  </div>
                  <Link
                    href="/adverts"
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 px-2.5 py-1 text-xs font-bold text-amber-300 transition-colors"
                  >
                    <span>All Adverts ({paidAdverts.length})</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Filter Mode Toggle inside Sidebar */}
                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <span className="text-slate-300 truncate">
                    {advertFilterMode === 'matching' &&
                    (selectedSector !== 'All' || selectedProvince !== 'All Provinces')
                      ? hasExactMatchingAdverts
                        ? `Filtered: ${
                            selectedProvince !== 'All Provinces' ? selectedProvince : selectedSector
                          }`
                        : 'Showing National Featured Ads'
                      : 'Showing Active Paid Promotions'}
                  </span>

                  <div className="inline-flex rounded-lg bg-slate-800 p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setAdvertFilterMode('matching')}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer ${
                        advertFilterMode === 'matching'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Match Filter
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdvertFilterMode('all')}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer ${
                        advertFilterMode === 'all'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All Ads
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {displayedAdverts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center space-y-2">
                    <Megaphone className="h-7 w-7 text-slate-400 mx-auto" />
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      No featured adverts active yet
                    </p>
                    <p className="text-xs text-slate-500">
                      Promote your business deals and reach thousands across Zimbabwe.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-4">
                    {displayedAdverts.map((ad) => (
                      <div
                        key={ad.id}
                        className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 overflow-hidden hover:border-amber-500/60 transition-colors"
                      >
                        <div>
                          <div className="relative h-36 w-full bg-slate-200 dark:bg-slate-800">
                            <Image
                              src={ad.image}
                              alt={ad.headline}
                              fill
                              sizes="(max-width: 1024px) 100vw, 25vw"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                              <span className="rounded-md bg-amber-400 text-slate-950 px-2.5 py-0.5 text-[11px] font-extrabold uppercase">
                                {ad.promoBadge}
                              </span>
                              <span className="rounded-md bg-slate-900/90 text-white px-2.5 py-0.5 text-[11px] font-semibold">
                                {ad.province}
                              </span>
                            </div>
                            <div className="absolute bottom-2.5 left-3 right-3">
                              <p className="text-xs font-bold text-amber-300 truncate">
                                {ad.businessName}
                              </p>
                            </div>
                          </div>

                          <div className="p-3.5 space-y-2">
                            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white leading-snug">
                              {ad.headline}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                              {ad.offerText}
                            </p>
                            {ad.promoPriceUSD && (
                              <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                                Promo: USD ${ad.promoPriceUSD.toLocaleString()}{' '}
                                {ad.priceZiG ? `/ ${ad.priceZiG.toLocaleString()} ZiG` : ''}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="px-3.5 pb-3.5 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/70 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {ad.validUntil}
                          </span>
                          <a
                            href={`https://wa.me/${sanitizePhoneNumber(ad.whatsapp)}?text=Hi%20${encodeURIComponent(
                              ad.businessName
                            )},%20I'm%20inquiring%20about%20your%20sponsored%20advert%20"${encodeURIComponent(
                              ad.headline
                            )}"%20on%20Sadza%20Connect.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-bold transition-colors"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>Claim Offer</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions: Publish Advert & View All Adverts Page */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setCreateAdvertOpen(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-amber-500/70 bg-amber-50/70 dark:bg-amber-950/20 hover:bg-amber-100/80 py-3 px-3.5 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300 transition-colors cursor-pointer"
                  >
                    <Megaphone className="h-4 w-4 text-amber-600" />
                    <span>Advertise Your Product Here ($20)</span>
                  </button>

                  <Link
                    href="/adverts"
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2.5 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <span>Browse All {paidAdverts.length} Business Adverts &amp; Filter</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 2: How Business Registration & 1-Month Grace Period Works */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Business Listing Policy
                  </h3>
                  <p className="text-xs text-slate-500">Transparent 30-Day Grace Model</p>
                </div>
              </div>

              <ol className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    1
                  </span>
                  <span>
                    <strong className="text-slate-900 dark:text-white">Month 1 Free Grace:</strong>{' '}
                    Every new business gets 30 days of free directory listing and product uploads upon registration.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    2
                  </span>
                  <span>
                    <strong className="text-slate-900 dark:text-white">Automated Reminders:</strong>{' '}
                    Receive dashboard, email, and WhatsApp notices 7 days and 3 days before your grace period expires.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    3
                  </span>
                  <span>
                    <strong className="text-slate-900 dark:text-white">Monthly Subscription:</strong>{' '}
                    Continue after Day 30 for{' '}
                    <strong className="text-emerald-700 dark:text-emerald-400">$15/month</strong>{' '}
                    (EcoCash, InnBucks, or Card) to keep products &amp; adverts active.
                  </span>
                </li>
              </ol>

              <div className="pt-1 flex flex-col gap-2.5">
                <Link
                  href="/signup?role=business"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-3.5 text-xs sm:text-sm font-bold transition-colors"
                >
                  <span>Start 1-Month Free Grace</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentPlan('monthly_listing');
                    setPaymentSuccess(false);
                    setPaymentModalOpen(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 py-2.5 px-3.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span>Make Business Payment</span>
                </button>
              </div>
            </div>

            {/* Card 3: Quick Utility & Trade Desk */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="h-4.5 w-4.5 text-emerald-600" />
                  Quick Utility &amp; Trade Desk
                </span>
                <span className="text-xs font-semibold text-emerald-600">24/7 Live</span>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <Link
                  href="/bill-payments"
                  className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3 hover:border-emerald-500 transition-colors"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">ZESA Prepaid Tokens</p>
                    <p className="text-xs text-slate-500">Instant 20-digit meter recharge</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>

                <Link
                  href="/adverts"
                  className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3 hover:border-emerald-500 transition-colors"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      All Sponsored Business Adverts
                    </p>
                    <p className="text-xs text-slate-500">
                      Filter promotions across 10 provinces
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* =====================================================================
          MOBILE / TABLET SLIDE-OVER FILTER DRAWER (< 1024px)
      ===================================================================== */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative z-10 w-full max-w-xs bg-white dark:bg-slate-900 h-full overflow-y-auto p-5 flex flex-col justify-between shadow-2xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Filter Commercial Portal
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Province Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Province (10 Provinces)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {CLEAN_PROVINCES.map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setSelectedProvince(prov)}
                      className={`rounded-lg px-2.5 py-2 text-left text-xs font-semibold truncate ${
                        selectedProvince === prov
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
              </div>

              {/* Business Classification */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Business Type
                </label>
                <div className="space-y-1.5">
                  {BUSINESS_SCALES.map((scale) => (
                    <button
                      key={scale.id}
                      type="button"
                      onClick={() => setSelectedScale(scale.id)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-xs font-semibold ${
                        selectedScale === scale.id
                          ? 'bg-slate-900 text-white dark:bg-emerald-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {scale.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sector Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Commercial Sector
                </label>
                <div className="space-y-1">
                  {COMMERCIAL_SECTORS.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setSelectedSector(sec.id)}
                      className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold ${
                        selectedSector === sec.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{sec.label}</span>
                      <span className="text-[10px] opacity-80">{sec.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: BUSINESS SUBSCRIPTION PAYMENT DESK
      ===================================================================== */}
      {paymentModalOpen && (
        <Modal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          title="Business Subscription & Renewal Desk"
          description="After your 1-month free grace period, keep your business and products active across Sadza Connect."
        >
          {paymentSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Payment Confirmed — Account Active!
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                Your business subscription is now active for the next 30 days. Your directory profile, marketplace products, and promotional tools are unlocked.
              </p>
              <Button variant="primary" size="md" onClick={() => setPaymentModalOpen(false)}>
                Return to Commercial Portal
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentPlan('monthly_listing')}
                  className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                    selectedPaymentPlan === 'monthly_listing'
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Standard Business Plan
                    </span>
                    <span className="text-sm font-extrabold text-emerald-600">$15/mo</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Active directory listing + unlimited marketplace product uploads after your 1-month grace.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentPlan('Listing_plus_advert')}
                  className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                    selectedPaymentPlan === 'Listing_plus_advert'
                      ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Subscribed + Paid Advert
                    </span>
                    <span className="text-sm font-extrabold text-amber-600">$35/mo</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Full subscription + Sponsored Right-Sidebar Advert Banner seen across the homepage.
                  </p>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Settlement Currency
                  </label>
                  <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5">
                    {(['USD', 'ZiG'] as const).map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => setPaymentCurrency(curr)}
                        className={`flex-1 rounded-md py-1.5 text-xs font-bold ${
                          paymentCurrency === curr
                            ? 'bg-slate-900 text-white dark:bg-emerald-600'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as 'ecocash' | 'innbucks' | 'card')
                    }
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="ecocash">EcoCash Express</option>
                    <option value="innbucks">InnBucks</option>
                    <option value="card">Visa / Mastercard / ZimSwitch</option>
                  </select>
                </div>
              </div>

              <Input
                label="Mobile Wallet Number or Billing Phone"
                placeholder="+263 77 123 4567"
                required
              />

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  Total Due Today:
                </span>
                <span className="font-display text-base font-extrabold text-emerald-600">
                  {paymentCurrency === 'USD'
                    ? `USD $${selectedPaymentPlan === 'monthly_listing' ? '15.00' : '35.00'}`
                    : `${selectedPaymentPlan === 'monthly_listing' ? '398' : '928'} ZiG`}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" loading={isProcessingPayment}>
                  Confirm &amp; Activate
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* =====================================================================
          MODAL 2: PUBLISH PAID BUSINESS ADVERT (Appears immediately in Sidebar & /adverts)
      ===================================================================== */}
      {createAdvertOpen && (
        <Modal
          isOpen={createAdvertOpen}
          onClose={() => setCreateAdvertOpen(false)}
          title="Advertise Your Product or Business Promotion"
          description="Once published, your advert appears immediately in the Homepage Right Sidebar and on the All Adverts (/adverts) page."
        >
          <form onSubmit={handlePublishNewAdvert} className="space-y-3.5">
            <Input
              label="Business Name"
              placeholder="e.g. Midlands Solar & Power Systems"
              required
              value={adBizName}
              onChange={(e) => setAdBizName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Commercial Sector (For Filtering)
                </label>
                <select
                  value={adCategory}
                  onChange={(e) => setAdCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {COMMERCIAL_SECTORS.filter((s) => s.id !== 'All').map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Province (For Filtering)
                </label>
                <select
                  value={adProvince}
                  onChange={(e) => setAdProvince(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {CLEAN_PROVINCES.filter((p) => p !== 'All Provinces').map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Advert Headline"
              placeholder="e.g. 15% Off Bulk PPC Cement + Free Flatbed Delivery"
              required
              value={adHeadline}
              onChange={(e) => setAdHeadline(e.target.value)}
            />

            <Input
              label="Offer Description"
              placeholder="Describe the promotion, minimum order, or warranty..."
              required
              value={adOfferText}
              onChange={(e) => setAdOfferText(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Promo Badge"
                placeholder="e.g. SAVE $250"
                required
                value={adBadge}
                onChange={(e) => setAdBadge(e.target.value)}
              />
              <Input
                label="Promo Price (USD)"
                type="number"
                step="0.01"
                placeholder="e.g. 495"
                value={adPriceUSD}
                onChange={(e) => setAdPriceUSD(e.target.value)}
              />
              <Input
                label="WhatsApp Number"
                placeholder="263772111222"
                required
                value={adWhatsapp}
                onChange={(e) => setAdWhatsapp(e.target.value)}
              />
            </div>

            <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                30-Day Sponsored Sidebar + Adverts Directory Placement:
              </span>
              <span className="font-display text-base font-extrabold text-amber-700 dark:text-amber-400">
                USD $20.00
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="md"
                type="button"
                onClick={() => setCreateAdvertOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit">
                Publish Advert Live
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* =====================================================================
          MODAL 3: UPLOAD PRODUCT TO LIVE STREAM ("Products Coming & Going")
      ===================================================================== */}
      {uploadProductOpen && (
        <Modal
          isOpen={uploadProductOpen}
          onClose={() => setUploadProductOpen(false)}
          title="Upload Product to Live Marketplace"
          description="Available to businesses in their 1-Month Free Grace Period or Paid Subscribers."
        >
          <form onSubmit={handleCreateProduct} className="space-y-3.5">
            {/* Listing Business Profile */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Listing Business Profile *
              </label>
              <select
                value={newProdBusinessId}
                onChange={(e) => {
                  setNewProdBusinessId(e.target.value);
                  const selected = businesses.find((b) => b.id === e.target.value);
                  if (selected?.province) setNewProdProvince(selected.province);
                }}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.province || 'Zimbabwe'})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Product Title / Specification *"
              placeholder="e.g. 550W Monocrystalline Solar Panel or 5kVA Hybrid Inverter"
              required
              value={newProdTitle}
              onChange={(e) => setNewProdTitle(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Commercial Sector
                </label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {COMMERCIAL_SECTORS.filter((s) => s.id !== 'All').map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Province Location
                </label>
                <select
                  value={newProdProvince}
                  onChange={(e) => setNewProdProvince(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {CLEAN_PROVINCES.filter((p) => p !== 'All Provinces').map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Price in USD ($) *"
                type="number"
                step="0.01"
                placeholder="e.g. 180"
                required
                value={newProdPriceUSD}
                onChange={(e) => setNewProdPriceUSD(e.target.value)}
              />
              <Input
                label="Unit / Packaging *"
                placeholder="e.g. Each / Per 50kg Bag"
                required
                value={newProdUnit}
                onChange={(e) => setNewProdUnit(e.target.value)}
              />
            </div>

            <Input
              label="Stock Availability Note"
              placeholder="e.g. 40 units in warehouse • Delivery available"
              value={newProdStock}
              onChange={(e) => setNewProdStock(e.target.value)}
            />

            {/* Product Photos (Each product accepts up to 5 images) */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-900 dark:text-white">
                    Product Photos (Up to 5 images)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Each product can accept up to 5 images. Slot 1 is the primary showcase photo.
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    newProdImages.length >= 5
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {newProdImages.length}/5 photos
                </span>
              </div>

              {/* Photo Input Row */}
              {newProdImages.length < 5 && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste image URL (e.g. Unsplash or direct photo link)..."
                      value={newProdImageInput}
                      onChange={(e) => setNewProdImageInput(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      disabled={!newProdImageInput.trim() || newProdImages.length >= 5}
                      onClick={() => {
                        const trimmed = newProdImageInput.trim();
                        if (trimmed && newProdImages.length < 5) {
                          setNewProdImages([...newProdImages, trimmed]);
                          setNewProdImageInput('');
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shrink-0 transition cursor-pointer"
                    >
                      + Add Image
                    </button>
                  </div>

                  {/* Preset photo tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-semibold text-slate-500">Quick presets:</span>
                    {[
                      { name: 'Solar Panel', url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80' },
                      { name: 'Solar Inverter', url: 'https://images.unsplash.com/photo-1548611716-ad888c3a50d2?auto=format&fit=crop&w=800&q=80' },
                      { name: 'Agro Tractor', url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80' },
                      { name: 'PPC Cement', url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80' },
                      { name: 'Generator', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80' },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        disabled={newProdImages.length >= 5}
                        onClick={() => {
                          if (newProdImages.length < 5) {
                            setNewProdImages([...newProdImages, preset.url]);
                          }
                        }}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-medium text-slate-700 dark:text-slate-200 hover:border-emerald-600 hover:text-emerald-600 transition disabled:opacity-50 cursor-pointer"
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded Photos Grid (up to 5 slots) */}
              {newProdImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {newProdImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                    >
                      <Image src={img} alt={`Slot ${idx + 1}`} fill className="object-cover" />
                      <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                        {idx === 0 ? '1/5 (Cover)' : `${idx + 1}/5`}
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewProdImages(newProdImages.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="md"
                type="button"
                onClick={() => setUploadProductOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" disabled={isSubmittingProduct}>
                {isSubmittingProduct ? 'Publishing SKU...' : 'Publish to Live Feed'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* =====================================================================
          MODAL 4: PRODUCT QUICK VIEW / DETAILS MODAL
          (Figma Replica pop-up with specs, verified seller, related products)
      ===================================================================== */}
      <ProductDetailModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onSelectProduct={(p) => setQuickViewProduct(p)}
        allProducts={products}
      />

      {/* =====================================================================
          MODAL 5: JOB QUICK APPLY
      ===================================================================== */}
      {selectedJob && (
        <Modal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title={`Apply: ${selectedJob.title}`}
          description={`${selectedJob.company} • ${selectedJob.province}`}
        >
          {appliedSuccess ? (
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
              <h4 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Application Sent to {selectedJob.company}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                The employer will contact you directly via WhatsApp or email.
              </p>
              <Button variant="primary" size="md" onClick={() => setSelectedJob(null)}>
                Done
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAppliedSuccess(true);
              }}
              className="space-y-3.5"
            >
              <Input
                label="Full Name"
                required
                placeholder="e.g. Tendai Moyo"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="tendai@example.co.zw"
                value={applicantEmail}
                onChange={(e) => setApplicantEmail(e.target.value)}
              />
              <Input
                label="WhatsApp Phone Number"
                type="tel"
                required
                placeholder="+263 77 123 4567"
                value={applicantPhone}
                onChange={(e) => setApplicantPhone(e.target.value)}
              />
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-3.5 text-center bg-slate-50 dark:bg-slate-800/40">
                <UploadCloud className="mx-auto h-5 w-5 text-emerald-600" />
                <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Attach CV / Resume (PDF)
                </p>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  onClick={() => setSelectedJob(null)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit">
                  Submit Application
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </section>
  );
}
