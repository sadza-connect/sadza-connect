'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  Package,
  Megaphone,
  Briefcase,
  Star,
  ShieldCheck,
  CreditCard,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Lock,
  Eye,
  TrendingUp,
  MapPin,
  Menu,
  X,
  ArrowUpRight,
  Printer,
  QrCode,
  Sparkles,
  Phone,
  Mail,
  Send,
} from 'lucide-react';
import {
  ZIMBABWE_PROVINCES,
  BUSINESS_CATEGORIES,
  BusinessListing,
  MarketplaceProduct,
  JobOpening,
} from '@/lib/data/zimbabwe';
import {
  getPlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
  PlatformSettings,
  saveStoredBusinesses,
  saveStoredProducts,
  saveStoredJobs,
  saveStoredJobApplications,
  JobApplicationRecord,
  saveStoredInvoices,
  BusinessSubscriptionInvoice,
} from '@/data/platformStore';
import {
  saveStoredAdverts,
  markAdvertDeleted,
  getDeletedAdvertIds,
  DEFAULT_PAID_ADVERTS,
  PaidAdvertItem,
} from '@/data/advertsStore';
import {
  Panel,
  PanelHeading,
  StatCard,
  AdminBadge,
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminModal,
  EmptyState,
  ModalBody,
  ModalSection,
  ModalGrid,
  ModalFooter,
} from '@/components/admin/AdminUI';
import { ImageUploader, type UploadedMediaItem } from '@/components/admin/ImageUploader';
import { useToast } from '@/components/providers/ToastProvider';
import { mapDbBusinessToListing } from '@/lib/data/business-mapper';
import { mapDbProductToMarketplaceProduct } from '@/lib/data/product-mapper';
import { mapDbAdvertToPaidAdvert } from '@/lib/data/advert-mapper';
import { mapDbInvoiceToSubscriptionInvoice } from '@/lib/data/invoice-mapper';
import { mapDbJobToOpening, mapDbApplicationToRecord } from '@/lib/data/job-mapper';
import {
  calculateOnboardingProgress,
  type OnboardingProgressInfo,
} from '@/lib/utils/onboarding-state';

type DashboardTab =
  | 'overview'
  | 'products'
  | 'adverts'
  | 'jobs'
  | 'reviews'
  | 'profile'
  | 'billing';

const PRESET_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
];

const EMPTY_FALLBACK_BUSINESS: BusinessListing = {
  id: '',
  name: 'Your Business',
  slug: '',
  categorySlug: 'general',
  categoryName: 'General Commercial',
  businessType: 'Registered Company (Pvt Ltd)',
  province: 'Harare',
  city: 'Harare',
  address: 'Commercial District',
  phone: '',
  whatsapp: '',
  email: '',
  openingHours: 'Mon - Fri: 08:00 - 17:00',
  description: 'Register your business on Sadza Connect to start selling and receiving verified customer enquiries.',
  rating: 5.0,
  reviewCount: 0,
  subscriptionStatus: 'Month 1 Grace Period',
  verifiedTier: 'unverified',
  cr14Verified: false,
  zimraVerified: false,
  featured: false,
  image: '',
  services: [],
  tags: [],
  onboardingTrack: 'registered_entity',
  graceDaysRemaining: 30,
};

export default function BusinessDashboardPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [adverts, setAdverts] = useState<PaidAdvertItem[]>([]);
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [applications, setApplications] = useState<JobApplicationRecord[]>([]);
  const [invoices, setInvoices] = useState<BusinessSubscriptionInvoice[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Onboarding Gating & Draft Progress State
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgressInfo | null>(null);
  const [showGateModal, setShowGateModal] = useState(false);
  const [gateActionName, setGateActionName] = useState('publishing marketplace items');

  const handleOpenProductModal = () => {
    if (onboardingProgress?.hasDraft && !onboardingProgress?.isCompleted) {
      setGateActionName('publishing marketplace products');
      setShowGateModal(true);
      return;
    }
    setShowProductModal(true);
  };

  const handleOpenAdvertModal = () => {
    if (onboardingProgress?.hasDraft && !onboardingProgress?.isCompleted) {
      setGateActionName('launching sponsored adverts');
      setShowGateModal(true);
      return;
    }
    setShowAdvertModal(true);
  };

  const handleOpenJobModal = () => {
    if (onboardingProgress?.hasDraft && !onboardingProgress?.isCompleted) {
      setGateActionName('posting career vacancies');
      setShowGateModal(true);
      return;
    }
    setShowJobModal(true);
  };

  // Modals
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState<
    'EcoCash USD' | 'InnBucks' | 'Visa / Mastercard' | 'Bank Transfer'
  >('EcoCash USD');
  const [payPhone, setPayPhone] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<BusinessSubscriptionInvoice | null>(null);

  // Product Form Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState<string>(
    BUSINESS_CATEGORIES[0]?.name || 'Solar & Clean Energy'
  );
  const [prodPriceUsd, setProdPriceUsd] = useState('');
  const [prodUnit, setProdUnit] = useState('Per Unit');
  const [prodStockNote, setProdStockNote] = useState('');
  const [prodImages, setProdImages] = useState<UploadedMediaItem[]>([]);
  const [prodDesc, setProdDesc] = useState('');

  // Advert Form Modal
  const [showAdvertModal, setShowAdvertModal] = useState(false);
  const [adHeadline, setAdHeadline] = useState('');
  const [adOfferType, setAdOfferType] = useState<
    'Bulk / Wholesale' | 'Price Discount' | 'Free Delivery' | 'Special Package'
  >('Special Package');
  const [adPromoBadge, setAdPromoBadge] = useState('');
  const [adOrigUsd, setAdOrigUsd] = useState('');
  const [adPromoUsd, setAdPromoUsd] = useState('');
  const [adValidUntil, setAdValidUntil] = useState('');
  const [adOfferText, setAdOfferText] = useState('');
  const [adImages, setAdImages] = useState<UploadedMediaItem[]>([]);

  // Job Form Modal
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Apprenticeship'>(
    'Full-time'
  );
  const [jobSalary, setJobSalary] = useState('');
  const [jobSummary, setJobSummary] = useState('');
  const [jobReqs, setJobReqs] = useState('');

  // Profile Editable State
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editProvince, setEditProvince] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editHours, setEditHours] = useState('');
  const [editServices, setEditServices] = useState('');
  const [editEntityType, setEditEntityType] = useState<BusinessListing['businessType']>(
    'Registered Company (Pvt Ltd)'
  );
  const [kycAssets, setKycAssets] = useState<UploadedMediaItem[]>([]);


  useEffect(() => {
    let isMounted = true;

    const syncAll = async () => {
      setSettings(getPlatformSettings());

      // Fetch live businesses from database
      try {
        const res = await fetch('/api/v1/businesses?limit=50');
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data?.businesses)) {
          const mapped = json.data.businesses.map(mapDbBusinessToListing);
          setBusinesses(mapped);
          if (mapped[0]) {
            setSelectedBusinessId(mapped[0].id);
          }
        } else if (isMounted) {
          setBusinesses([]);
        }
      } catch {
        if (isMounted) setBusinesses([]);
      }

      // Check if user has their own registered business
      try {
        const myRes = await fetch('/api/v1/businesses?my_business=true');
        const myJson = await myRes.json();
        if (isMounted && myJson.success && myJson.data?.primaryBusiness) {
          const myMapped = mapDbBusinessToListing(myJson.data.primaryBusiness);
          setBusinesses((prev) => {
            const exists = prev.some((b) => b.id === myMapped.id);
            return exists ? prev : [myMapped, ...prev];
          });
          setSelectedBusinessId(myMapped.id);
        }
      } catch {}

      // Load Products from database
      try {
        const prodRes = await fetch('/api/v1/products?limit=50', { credentials: 'include' });
        const prodJson = await prodRes.json();
        if (isMounted && prodJson.success && Array.isArray(prodJson.data?.products)) {
          setProducts(prodJson.data.products.map(mapDbProductToMarketplaceProduct));
        } else if (isMounted) {
          setProducts([]);
        }
      } catch {
        if (isMounted) setProducts([]);
      }

      // Load Adverts from database
      try {
        const adRes = await fetch('/api/v1/adverts?limit=50');
        const adJson = await adRes.json();
        const dbAds = adJson.data?.adverts || adJson.adverts || [];
        const deletedIds = new Set(getDeletedAdvertIds());
        if (isMounted && Array.isArray(dbAds)) {
          const validAds = dbAds
            .map(mapDbAdvertToPaidAdvert)
            .filter((item) => item && item.id && !deletedIds.has(item.id));
          setAdverts(validAds);
        } else if (isMounted) {
          setAdverts([]);
        }
      } catch {
        if (isMounted) setAdverts([]);
      }

      // Load Invoices from database
      try {
        const invRes = await fetch('/api/v1/invoices?limit=50', { credentials: 'include' });
        const invJson = await invRes.json();
        if (isMounted && invJson.success && Array.isArray(invJson.data?.invoices)) {
          setInvoices(invJson.data.invoices.map(mapDbInvoiceToSubscriptionInvoice));
        } else if (isMounted) {
          setInvoices([]);
        }
      } catch {
        if (isMounted) setInvoices([]);
      }

      // Load Jobs from database
      try {
        const jRes = await fetch('/api/v1/jobs?limit=50', { credentials: 'include' });
        const jJson = await jRes.json();
        if (isMounted && jJson.success && Array.isArray(jJson.data?.jobs)) {
          setJobs(jJson.data.jobs.map(mapDbJobToOpening));
        } else if (isMounted) {
          setJobs([]);
        }
      } catch {
        if (isMounted) setJobs([]);
      }

      // Load Applications from database
      try {
        const aRes = await fetch('/api/v1/jobs/applications?limit=50', { credentials: 'include' });
        const aJson = await aRes.json();
        if (isMounted && aJson.success && Array.isArray(aJson.data?.applications)) {
          setApplications(aJson.data.applications.map(mapDbApplicationToRecord));
        } else if (isMounted) {
          setApplications([]);
        }
      } catch {
        if (isMounted) setApplications([]);
      }
    };

    const updateOnboarding = () => {
      try {
        const prog = calculateOnboardingProgress();
        setOnboardingProgress(prog);
      } catch {
        setOnboardingProgress(null);
      }
    };

    syncAll();
    updateOnboarding();
    window.addEventListener('sadza-platform-updated', syncAll);
    window.addEventListener('sadza-adverts-updated', syncAll);
    window.addEventListener('sadza-onboarding-updated', updateOnboarding);
    return () => {
      isMounted = false;
      window.removeEventListener('sadza-platform-updated', syncAll);
      window.removeEventListener('sadza-adverts-updated', syncAll);
      window.removeEventListener('sadza-onboarding-updated', updateOnboarding);
    };
  }, []);

  const currentBusiness = useMemo(() => {
    return businesses.find((b) => b.id === selectedBusinessId) || businesses[0] || EMPTY_FALLBACK_BUSINESS;
  }, [businesses, selectedBusinessId]);

  const defaultTrackRate = useMemo(() => {
    const track = currentBusiness?.onboardingTrack || 'registered_entity';
    if (track === 'owner_operated') {
      return settings.soloMonthlyPriceUsd ?? 5;
    }
    if (track === 'association_institutional') {
      return settings.coopMonthlyPriceUsd ?? 10;
    }
    return settings.corporateMonthlyPriceUsd ?? settings.monthlySubscriptionPriceUsd ?? 15;
  }, [currentBusiness?.onboardingTrack, settings]);

  const activeMonthlyRate = useMemo(() => {
    if (
      currentBusiness?.customMonthlyPriceUsd !== undefined &&
      currentBusiness?.customMonthlyPriceUsd !== null
    ) {
      return currentBusiness.customMonthlyPriceUsd;
    }
    return defaultTrackRate;
  }, [currentBusiness?.customMonthlyPriceUsd, defaultTrackRate]);

  const isCustomPrice =
    currentBusiness?.customMonthlyPriceUsd !== undefined &&
    currentBusiness?.customMonthlyPriceUsd !== null;

  const activeMonthlyRateStr = `$${activeMonthlyRate.toFixed(2)}`;
  const activeMonthlyRateZiGStr = `${(
    Math.round(activeMonthlyRate * settings.usdToZigRate * 100) / 100
  ).toLocaleString()} ZiG`;

  // Track B (Solo Operator) WhatsApp Quick Receipt Hub state
  const [receiptBuyer, setReceiptBuyer] = useState('');
  const [receiptAmount, setReceiptAmount] = useState('');
  const [receiptCurrency, setReceiptCurrency] = useState<'USD' | 'ZiG'>('USD');
  const [receiptItem, setReceiptItem] = useState('');

  function handleDispatchReceipt(e: React.FormEvent) {
    e.preventDefault();
    if (!receiptAmount || !currentBusiness) {
      toast({ title: 'Please enter amount', variant: 'error' });
      return;
    }
    const text =
      `*OFFICIAL RECEIPT — ${currentBusiness.name}*\n` +
      `Date: ${new Date().toLocaleDateString('en-GB')}\n` +
      `Receipt #: SC-REC-${Math.floor(1000 + Math.random() * 9000)}\n` +
      `Customer: ${receiptBuyer.trim() || 'Valued Client'}\n` +
      `Items / Services: ${receiptItem.trim() || 'Commercial Goods / Services'}\n` +
      `Amount Paid: ${receiptCurrency === 'USD' ? '$' : ''}${receiptAmount} ${receiptCurrency}\n` +
      `Payment Channel: Mobile Wallet (EcoCash / InnBucks)\n` +
      `Verified Store: https://sadzaconnect.co.zw/businesses/${currentBusiness.slug}\n` +
      `*Sadza Connect Zimbabwe Verified Retail Merchant*`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    toast({
      title: 'WhatsApp Receipt Ready',
      description: 'Proof-of-payment receipt opened in WhatsApp for your buyer.',
      variant: 'success',
    });
  }

  useEffect(() => {
    if (!currentBusiness) return;
    setEditDescription(currentBusiness.description || '');
    setEditCategory(currentBusiness.categoryName);
    setEditProvince(currentBusiness.province);
    setEditAddress(currentBusiness.address);
    setEditWhatsapp(currentBusiness.whatsapp);
    setEditHours(currentBusiness.openingHours || 'Mon - Sat: 08:00 - 17:00');
    setEditServices((currentBusiness.services || []).join(', '));
    setEditEntityType(currentBusiness.businessType || 'Registered Company (Pvt Ltd)');
  }, [currentBusiness]);

  const showToast = (msg: string) => {
    toast({
      title: 'Storefront Updated',
      description: msg,
      variant: 'success',
    });
  };

  const myProducts = useMemo(() => {
    if (!currentBusiness) return [];
    return products.filter(
      (p) =>
        p.sellerId === currentBusiness.id ||
        p.sellerName.toLowerCase() === currentBusiness.name.toLowerCase()
    );
  }, [products, currentBusiness]);

  const myAdverts = useMemo(() => {
    if (!currentBusiness) return [];
    return adverts.filter(
      (a) => a.businessName.toLowerCase() === currentBusiness.name.toLowerCase()
    );
  }, [adverts, currentBusiness]);

  const myJobs = useMemo(() => {
    if (!currentBusiness) return [];
    return jobs.filter(
      (j) =>
        j.companySlug === currentBusiness.slug ||
        j.company.toLowerCase() === currentBusiness.name.toLowerCase()
    );
  }, [jobs, currentBusiness]);

  const myApplications = useMemo(() => {
    if (!currentBusiness) return [];
    const jobIds = new Set(myJobs.map((j) => j.id));
    return applications.filter(
      (app) =>
        jobIds.has(app.jobId) ||
        app.companyName.toLowerCase() === currentBusiness.name.toLowerCase()
    );
  }, [applications, currentBusiness, myJobs]);

  const myInvoices = useMemo(() => {
    if (!currentBusiness) return [];
    return invoices.filter(
      (inv) =>
        inv.businessId === currentBusiness.id ||
        inv.businessName.toLowerCase() === currentBusiness.name.toLowerCase()
    );
  }, [invoices, currentBusiness]);

  if (!currentBusiness) {
    return null;
  }

  const handlePaySubscription = async (e: React.FormEvent) => {
    e.preventDefault();

    let createdInvoiceObj: BusinessSubscriptionInvoice | null = null;
    try {
      const invRes = await fetch('/api/v1/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          business_id: currentBusiness.id,
          business_name: currentBusiness.name,
          plan_type: `Monthly Business Listing (${activeMonthlyRateStr}/mo)`,
          amount_usd: activeMonthlyRate,
          payment_method: payMethod,
          status: 'Paid',
        }),
      });
      const invJson = await invRes.json();
      if (invJson.success && invJson.data?.invoice) {
        createdInvoiceObj = mapDbInvoiceToSubscriptionInvoice(invJson.data.invoice);
      }
    } catch (err) {
      console.error('Failed to create subscription invoice in database:', err);
    }

    const updatedBusinesses = businesses.map((b) =>
      b.id === currentBusiness.id
        ? {
            ...b,
            subscriptionStatus: 'Paid Subscriber' as const,
            graceDaysRemaining: undefined,
          }
        : b
    );
    saveStoredBusinesses(updatedBusinesses);
    setBusinesses(updatedBusinesses);

    const newInvoice: BusinessSubscriptionInvoice = createdInvoiceObj || {
      id: `inv-${Date.now()}`,
      invoiceNumber: `SC-INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      businessId: currentBusiness.id,
      businessName: currentBusiness.name,
      planType: `Monthly Business Listing (${activeMonthlyRateStr}/mo)`,
      amountUsd: activeMonthlyRate,
      paymentMethod: payMethod,
      date: 'Today',
      periodCovered: 'Next 30 Calendar Days',
      status: 'Paid',
    };
    const nextInvoices = [newInvoice, ...invoices];
    saveStoredInvoices(nextInvoices);
    setInvoices(nextInvoices);
    setShowPayModal(false);
    showToast(
      `Subscription payment of ${activeMonthlyRateStr} USD confirmed! Storefront is active.`
    );
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const usd = Math.max(1, Number(prodPriceUsd) || 10);
    const chosenImage = prodImages[0]?.src || '';

    try {
      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: currentBusiness.id,
          business_slug: currentBusiness.slug,
          name: prodTitle.trim(),
          category: prodCategory,
          price_usd: usd,
          images: chosenImage ? [chosenImage] : [],
          stock_quantity: 10,
          condition: 'Brand New',
          description:
            prodDesc.trim() ||
            `Supplied directly by ${currentBusiness.name} in ${currentBusiness.province}. Contact via WhatsApp for dispatch and bulk pricing.`,
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.product) {
        const mapped = mapDbProductToMarketplaceProduct({
          ...json.data.product,
          business_name: currentBusiness.name,
          business_slug: currentBusiness.slug,
          business_province: currentBusiness.province,
          business_phone: currentBusiness.phone,
          business_whatsapp: currentBusiness.whatsapp,
          business_is_verified: currentBusiness.cr14Verified,
          business_type: currentBusiness.businessType,
        });
        setProducts((prev) => [mapped, ...prev]);
      }
    } catch (err) {
      console.error('Failed to publish product to database:', err);
    }

    const slug = `${prodTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-4)}`;

    const newProd: MarketplaceProduct = {
      id: `p-${Date.now()}`,
      slug,
      title: prodTitle.trim(),
      category: prodCategory,
      province: currentBusiness.province,
      priceUsd: usd,
      unit: prodUnit.trim() || 'Per Unit',
      movementBadge: 'New Upload',
      postedAgo: 'Just now',
      stockNote: prodStockNote.trim() || 'In Stock',
      location: `${currentBusiness.province} • Direct Dispatch`,
      condition: 'Brand New',
      sellerId: currentBusiness.id,
      sellerSlug: currentBusiness.slug,
      sellerName: currentBusiness.name,
      sellerType: currentBusiness.businessType,
      sellerPlan:
        currentBusiness.subscriptionStatus === 'Paid Subscriber'
          ? 'Paid Subscriber'
          : 'Month 1 Free Grace',
      sellerPhone: currentBusiness.whatsapp,
      sellerVerified: currentBusiness.cr14Verified,
      image: chosenImage,
      description:
        prodDesc.trim() ||
        `Supplied directly by ${currentBusiness.name} in ${currentBusiness.province}. Contact via WhatsApp for dispatch and bulk pricing.`,
      highlights: [
        `Direct supply from ${currentBusiness.name}`,
        `Available in USD and ZiG at 1:${settings.usdToZigRate}`,
      ],
      featured: true,
    };

    const nextProducts = [newProd, ...products];
    saveStoredProducts(nextProducts);
    setShowProductModal(false);
    setProdTitle('');
    setProdDesc('');
    showToast('Product published to Marketplace & your Business Storefront!');
  };

  const handleDeleteProduct = async (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (prod) {
      try {
        await fetch(`/api/v1/products/${encodeURIComponent(prod.slug)}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Failed to delete product from database:', err);
      }
    }
    const next = products.filter((p) => p.id !== id);
    saveStoredProducts(next);
    setProducts(next);
    showToast('Product removed from Marketplace.');
  };

  const handleAddAdvert = async (e: React.FormEvent) => {
    e.preventDefault();
    const promoUsd = Math.max(1, Number(adPromoUsd) || 50);
    const origUsd = Math.max(promoUsd, Number(adOrigUsd) || promoUsd);
    const zig = Math.round(promoUsd * settings.usdToZigRate);
    const chosenImage = adImages[0]?.src || '';

    let createdAdObj: PaidAdvertItem | null = null;
    try {
      const res = await fetch('/api/v1/adverts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          business_id: currentBusiness.id,
          business_name: currentBusiness.name,
          business_type: currentBusiness.businessType || 'Registered Company (Pvt Ltd)',
          province: currentBusiness.province,
          category: currentBusiness.categoryName,
          offer_type: adOfferType,
          headline: adHeadline.trim(),
          offer_text:
            adOfferText.trim() ||
            `Official promotional offer from ${currentBusiness.name}. Direct WhatsApp ordering available.`,
          promo_badge: adPromoBadge.trim().toUpperCase() || 'SPECIAL OFFER',
          original_price_usd: origUsd,
          promo_price_usd: promoUsd,
          valid_until: adValidUntil.trim() || 'Valid 30 days',
          whatsapp: currentBusiness.whatsapp.replace(/\D/g, ''),
          phone: currentBusiness.phone,
          image: chosenImage,
          featured_on_home: true,
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.advert) {
        createdAdObj = mapDbAdvertToPaidAdvert(json.data.advert);
      }
    } catch (err) {
      console.error('Failed to create advert in database:', err);
    }

    let createdInvoiceObj: BusinessSubscriptionInvoice | null = null;
    try {
      const invRes = await fetch('/api/v1/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          business_id: currentBusiness.id,
          business_name: currentBusiness.name,
          plan_type: 'Sponsored Product Advert ($20/mo)',
          amount_usd: settings.sponsoredAdvertPriceUsd,
          payment_method: 'EcoCash USD',
          status: 'Paid',
        }),
      });
      const invJson = await invRes.json();
      if (invJson.success && invJson.data?.invoice) {
        createdInvoiceObj = mapDbInvoiceToSubscriptionInvoice(invJson.data.invoice);
      }
    } catch (err) {
      console.error('Failed to create advert invoice in database:', err);
    }

    const newAd: PaidAdvertItem = createdAdObj || {
      id: `ad-${Date.now()}`,
      businessName: currentBusiness.name,
      businessType: currentBusiness.businessType || 'Registered Company (Pvt Ltd)',
      province: currentBusiness.province,
      category: currentBusiness.categoryName,
      offerType: adOfferType,
      headline: adHeadline.trim(),
      offerText:
        adOfferText.trim() ||
        `Official promotional offer from ${currentBusiness.name}. Direct WhatsApp ordering available.`,
      promoBadge: adPromoBadge.trim().toUpperCase() || 'SPECIAL OFFER',
      originalPriceUSD: origUsd,
      promoPriceUSD: promoUsd,
      priceZiG: zig,
      validUntil: adValidUntil.trim() || 'Valid 30 days',
      whatsapp: currentBusiness.whatsapp.replace(/\D/g, ''),
      phone: currentBusiness.phone,
      image: chosenImage,
      featuredOnHome: true,
      postedAt: 'Just now',
    };

    const nextAds = [newAd, ...adverts];
    saveStoredAdverts(nextAds);
    setAdverts(nextAds);

    const adInvoice: BusinessSubscriptionInvoice = createdInvoiceObj || {
      id: `inv-${Date.now()}`,
      invoiceNumber: `SC-ADV-2026-${Math.floor(100 + Math.random() * 900)}`,
      businessId: currentBusiness.id,
      businessName: currentBusiness.name,
      planType: 'Sponsored Product Advert ($20/mo)',
      amountUsd: settings.sponsoredAdvertPriceUsd,
      paymentMethod: 'EcoCash USD',
      date: 'Today',
      periodCovered: '30-Day Homepage & Deals Placement',
      status: 'Paid',
    };
    const nextInvoices = [adInvoice, ...invoices];
    saveStoredInvoices(nextInvoices);
    setInvoices(nextInvoices);

    setShowAdvertModal(false);
    setAdHeadline('');
    setAdOfferText('');
    showToast(
      `Sponsored Advert launched ($${settings.sponsoredAdvertPriceUsd}/mo) & published on Homepage and /adverts!`
    );
  };

  const handleDeleteAdvert = async (id: string) => {
    markAdvertDeleted(id);
    try {
      await fetch(`/api/v1/adverts/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Failed to delete advert from database:', err);
    }
    const next = adverts.filter((a) => a.id !== id);
    saveStoredAdverts(next);
    setAdverts(next);
    showToast('Sponsored Advert removed.');
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const reqList = jobReqs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/v1/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          business_id: currentBusiness.id,
          business_slug: currentBusiness.slug,
          title: jobTitle.trim(),
          province: currentBusiness.province,
          city: currentBusiness.city || currentBusiness.province,
          job_type: jobType,
          salary_usd: jobSalary.trim(),
          category: currentBusiness.categoryName,
          whatsapp: currentBusiness.whatsapp,
          description:
            jobSummary.trim() ||
            `${currentBusiness.name} is hiring a ${jobTitle.trim()} in ${currentBusiness.province}.`,
          requirements: reqList.length > 0 ? reqList : ['Relevant work experience', 'Valid ID / references'],
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.job) {
        const created = mapDbJobToOpening(json.data.job);
        const nextJobs = [created, ...jobs];
        setJobs(nextJobs);
        saveStoredJobs(nextJobs);
        setShowJobModal(false);
        setJobTitle('');
        setJobSummary('');
        showToast('Job vacancy published to the national Jobs Board!');
        return;
      }
    } catch (err) {
      console.warn('Backend job create failed, falling back to local store', err);
    }

    const slug = `${jobTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-3)}`;

    const newJob: JobOpening = {
      id: `job-${Date.now()}`,
      slug,
      title: jobTitle.trim(),
      company: currentBusiness.name,
      companySlug: currentBusiness.slug,
      province: currentBusiness.province,
      city: currentBusiness.city || currentBusiness.province,
      category: currentBusiness.categoryName,
      type: jobType,
      salaryUsd: jobSalary.trim(),
      postedDate: 'Just now',
      whatsapp: currentBusiness.whatsapp,
      description:
        jobSummary.trim() ||
        `${currentBusiness.name} is hiring a ${jobTitle.trim()} in ${currentBusiness.province}.`,
      requirements: reqList,
    };

    const nextJobs = [newJob, ...jobs];
    saveStoredJobs(nextJobs);
    setJobs(nextJobs);
    setShowJobModal(false);
    setJobTitle('');
    setJobSummary('');
    showToast('Job vacancy published to the national Jobs Board!');
  };

  const handleDeleteJob = async (id: string) => {
    const targetJob = jobs.find((j) => j.id === id);
    if (targetJob?.slug) {
      try {
        const res = await fetch(`/api/v1/jobs/${targetJob.slug}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        const json = await res.json();
        if (json.success) {
          const next = jobs.filter((j) => j.id !== id);
          saveStoredJobs(next);
          setJobs(next);
          showToast('Job vacancy removed.');
          return;
        }
      } catch (err) {
        console.warn('Backend delete job failed, removing locally', err);
      }
    }

    const next = jobs.filter((j) => j.id !== id);
    saveStoredJobs(next);
    setJobs(next);
    showToast('Job vacancy removed.');
  };

  const handleUpdateApplicantStatus = async (
    appId: string,
    status: JobApplicationRecord['status']
  ) => {
    try {
      const res = await fetch(`/api/v1/jobs/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success && json.data?.application) {
        const updated = mapDbApplicationToRecord(json.data.application);
        const next = applications.map((a) => (a.id === appId ? updated : a));
        saveStoredJobApplications(next);
        setApplications(next);
        showToast(`Applicant status updated to "${status}".`);
        return;
      }
    } catch (err) {
      console.warn('Backend status update failed, saving locally', err);
    }

    const next = applications.map((a) => (a.id === appId ? { ...a, status } : a));
    saveStoredJobApplications(next);
    setApplications(next);
    showToast(`Applicant status updated to "${status}".`);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const matchedCat = BUSINESS_CATEGORIES.find((c) => c.name === editCategory);

    // Persist to database while strictly preserving locked fields
    try {
      await fetch(`/api/v1/businesses/${encodeURIComponent(currentBusiness.slug)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: editDescription.trim(),
          province: editProvince,
          address: editAddress.trim(),
          sector: editCategory,
          business_type: editEntityType,
          whatsapp: editWhatsapp.trim(),
          operating_hours: { summary: editHours.trim() },
        }),
      });
    } catch (err) {
      console.error('Failed to update business in database:', err);
    }

    const updated = businesses.map((b) =>
      b.id === currentBusiness.id
        ? {
            ...b,
            businessType: editEntityType,
            categoryName: editCategory,
            categorySlug: matchedCat ? matchedCat.slug : b.categorySlug,
            province: editProvince,
            address: editAddress.trim(),
            whatsapp: editWhatsapp.trim(),
            openingHours: editHours.trim(),
            description: editDescription.trim(),
            services: editServices
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          }
        : b
    );
    saveStoredBusinesses(updated);
    setBusinesses(updated);
    showToast('Business Storefront Profile updated and synced across Directory!');
  };

  const NAV_ITEMS: { id: DashboardTab; label: string; badge?: number; icon: typeof TrendingUp }[] = [
    { id: 'overview', label: 'Overview & KPIs', icon: TrendingUp },
    { id: 'products', label: 'Products Catalogue', badge: myProducts.length, icon: Package },
    { id: 'adverts', label: 'Sponsored Adverts', badge: myAdverts.length, icon: Megaphone },
    { id: 'jobs', label: 'Jobs & Applicant CVs', badge: myJobs.length, icon: Briefcase },
    {
      id: 'reviews',
      label: 'Customer Reviews',
      badge: currentBusiness.reviews?.length || 0,
      icon: Star,
    },
    { id: 'profile', label: 'Storefront & KYC Vault', icon: ShieldCheck },
    { id: 'billing', label: 'Billing & QR Receipts', badge: myInvoices.length, icon: CreditCard },
  ];

  const SidebarContent = (
    <div className="flex h-full flex-col bg-[#0c1424] text-white">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e57eb] to-emerald-500 font-bold text-white shadow-sm">
            SC
          </div>
          <div>
            <span className="block text-sm font-bold tracking-tight text-white">Sadza Connect</span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
              Merchant Workspace
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileNavOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Active Business Card */}
      <div className="border-b border-white/10 p-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Storefront
            </span>
            {currentBusiness.cr14Verified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                <ShieldCheck className="h-3 w-3" /> {currentBusiness.verificationBadge || 'Verified Company'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                <Clock className="h-3 w-3" /> Unverified (Pending)
              </span>
            )}
          </div>
          <select
            value={currentBusiness.id}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-[#070c16] px-2.5 py-2 text-xs font-bold text-white focus:border-[#1e57eb] focus:outline-none cursor-pointer"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id} className="bg-[#0c1424] text-white">
                {b.name}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>{currentBusiness.province}</span>
            <span className="text-emerald-400 font-semibold">★ {currentBusiness.rating}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Storefront Operations
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                setMobileNavOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? 'bg-[#1e57eb] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </span>
              {typeof item.badge === 'number' && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    active ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 30-Day Grace / Subscription Footer Widget */}
      <div className="border-t border-white/10 p-4 space-y-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Plan Status
            </span>
            {currentBusiness.subscriptionStatus === 'Paid Subscriber' ? (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                Paid ({activeMonthlyRateStr}/mo)
              </span>
            ) : (
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                {currentBusiness.graceDaysRemaining !== undefined ? currentBusiness.graceDaysRemaining : 30}d Grace Left
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {currentBusiness.subscriptionStatus === 'Paid Subscriber'
              ? 'Full Directory & Marketplace visibility active across all 10 provinces.'
              : `Complimentary ${settings.freeGracePeriodDays}-day onboarding trial active.`}
          </p>
          <button
            type="button"
            onClick={() => setShowPayModal(true)}
            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-bold text-white transition cursor-pointer"
          >
            {currentBusiness.subscriptionStatus === 'Paid Subscriber'
              ? `Extend ${activeMonthlyRateStr}/mo Plan`
              : `Activate ${activeMonthlyRateStr}/mo Plan`}
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs">
          <Link
            href={`/businesses/${currentBusiness.slug}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 py-2 text-[11px] font-semibold text-slate-200 hover:bg-white/10"
          >
            <Eye className="h-3.5 w-3.5" /> Public Store
          </Link>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 py-2 text-[11px] font-semibold text-slate-200 hover:bg-white/10"
          >
            Main Site <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#eef2f6] text-slate-900">
      {/* Desktop Fixed Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-[280px] shadow-2xl">{SidebarContent}</div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="lg:pl-[272px] flex min-h-screen flex-col">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-base font-bold text-slate-950 sm:text-lg">
                    {currentBusiness.name}
                  </h1>
                  <AdminBadge tone={currentBusiness.cr14Verified ? 'success' : 'warning'} dot>
                    {currentBusiness.cr14Verified
                      ? (currentBusiness.verificationBadge || 'Verified Company')
                      : 'Unverified (Pending Admin Review)'}
                  </AdminBadge>
                </div>
                <p className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-[#1e57eb]" />
                  <span>{currentBusiness.province}</span>
                  <span>•</span>
                  <span>{currentBusiness.categoryName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AdminButton
                variant="outline"
                size="sm"
                onClick={handleOpenProductModal}
                className="hidden sm:inline-flex"
              >
                <Plus className="h-3.5 w-3.5" /> Upload Product
              </AdminButton>
              <AdminButton
                variant="secondary"
                size="sm"
                onClick={handleOpenAdvertModal}
              >
                <Megaphone className="h-3.5 w-3.5 text-amber-600" />
                <span className="hidden sm:inline">Promote Deal ($20/mo)</span>
                <span className="sm:hidden">Promote</span>
              </AdminButton>
              <AdminButton size="sm" onClick={() => setShowPayModal(true)}>
                <CreditCard className="h-3.5 w-3.5" />
                <span className="hidden md:inline">
                  {currentBusiness.subscriptionStatus === 'Paid Subscriber'
                    ? `Extend ${activeMonthlyRateStr}/mo`
                    : `Activate ${activeMonthlyRateStr}/mo`}
                </span>
              </AdminButton>
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {/* Onboarding Draft Setup & Progress Card */}
          {onboardingProgress?.hasDraft && !onboardingProgress?.isCompleted && (
            <div className="relative overflow-hidden rounded-2xl border border-amber-300/80 dark:border-amber-700/60 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      Draft Profile • Action Required
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Step {onboardingProgress.currentStep} of 7
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Complete Your Business Setup to Start Receiving Orders
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Your storefront for <span className="font-semibold text-slate-900 dark:text-white">{onboardingProgress.businessName}</span> is saved as a draft. Finalize your location and sector details so customers across Harare, Bulawayo, and all Zimbabwe provinces can find you, see your verified badge, and submit quotation inquiries.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
                  <div className="text-right hidden lg:block">
                    <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                      {onboardingProgress.progressPercent}%
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Profile Completion</div>
                  </div>
                  <Link
                    href={onboardingProgress.resumeUrl}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    <span>Resume Setup ({onboardingProgress.stepTitle})</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Progress Steps Checklist */}
              <div className="mt-5 pt-4 border-t border-amber-200/60 dark:border-amber-800/40">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {onboardingProgress.steps.map((s) => (
                    <div
                      key={s.step}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${
                        s.completed
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium'
                          : s.step === onboardingProgress.currentStep
                          ? 'bg-amber-100/80 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 font-bold ring-1 ring-amber-400'
                          : 'bg-white/60 dark:bg-slate-800/40 text-slate-400'
                      }`}
                    >
                      {s.completed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <span
                          className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                            s.step === onboardingProgress.currentStep
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}
                        >
                          {s.step}
                        </span>
                      )}
                      <span className="truncate">{s.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Subscription / 30-Day Grace Executive Banner */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  currentBusiness.subscriptionStatus === 'Paid Subscriber'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                {currentBusiness.subscriptionStatus === 'Paid Subscriber' ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <Clock className="h-6 w-6" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Storefront Subscription
                  </span>
                  <AdminBadge
                    tone={
                      currentBusiness.subscriptionStatus === 'Paid Subscriber'
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {currentBusiness.subscriptionStatus === 'Paid Subscriber'
                      ? `Paid Subscriber (${activeMonthlyRateStr}/mo)`
                      : `Month 1 Free Grace (${currentBusiness.graceDaysRemaining !== undefined ? currentBusiness.graceDaysRemaining : 30} of ${
                          settings.freeGracePeriodDays
                        } Days Left)`}
                  </AdminBadge>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  {currentBusiness.subscriptionStatus === 'Paid Subscriber'
                    ? `Your storefront, ${myProducts.length} marketplace SKUs, and direct WhatsApp buyer leads are live across Zimbabwe.`
                    : `Enjoy full platform access during your ${settings.freeGracePeriodDays}-day complimentary grace period. Renew at ${activeMonthlyRateStr}/month anytime for uninterrupted visibility.`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                href={`/businesses/${currentBusiness.slug}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <Eye className="h-3.5 w-3.5" /> View Public Storefront
                <ExternalLink className="h-3 w-3" />
              </Link>
              <AdminButton size="sm" onClick={() => setShowPayModal(true)}>
                <CreditCard className="h-3.5 w-3.5" />
                {currentBusiness.subscriptionStatus === 'Paid Subscriber'
                  ? `Extend Subscription (${activeMonthlyRateStr})`
                  : `Pay ${activeMonthlyRateStr}/mo Subscription`}
              </AdminButton>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Active Marketplace SKUs"
                  value={myProducts.length}
                  hint={`Dual USD & ZiG (1:${settings.usdToZigRate})`}
                  icon={Package}
                />
                <StatCard
                  label="Sponsored Adverts ($20/mo)"
                  value={myAdverts.length}
                  hint="Homepage & /adverts spotlight"
                  icon={Megaphone}
                />
                <StatCard
                  label="Open Jobs & Candidate CVs"
                  value={`${myJobs.length} / ${myApplications.length}`}
                  hint="Direct applicant pipeline"
                  icon={Briefcase}
                />
                <StatCard
                  label="Storefront Trust Rating"
                  value={`${currentBusiness.rating} ★`}
                  hint={`${currentBusiness.reviewCount} verified buyer reviews`}
                  icon={Star}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Panel>
                  <PanelHeading
                    title="Recent Marketplace Products"
                    hint="Live inventory synced to your public storefront"
                    action={
                      <AdminButton size="sm" onClick={handleOpenProductModal}>
                        <Plus className="h-3.5 w-3.5" /> Add Product
                      </AdminButton>
                    }
                  />
                  {myProducts.length === 0 ? (
                    <div className="mt-4">
                      <EmptyState
                        icon={Package}
                        title="No products listed yet"
                        description="Upload your first product with photos and USD/ZiG pricing."
                      />
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {myProducts.slice(0, 4).map((prod) => (
                        <div
                          key={prod.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={prod.image}
                              alt={prod.title}
                              className="h-12 w-12 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-slate-950">
                                {prod.title}
                              </p>
                              <p className="text-[11px] font-semibold text-emerald-700">
                                ${prod.priceUsd.toLocaleString()} USD •{' '}
                                {Math.round(prod.priceUsd * settings.usdToZigRate).toLocaleString()}{' '}
                                ZiG
                              </p>
                            </div>
                          </div>
                          <AdminBadge tone="success">{prod.stockNote}</AdminBadge>
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>

                <Panel>
                  <PanelHeading
                    title="Recent Candidate Applications"
                    hint="Job seekers who applied to your vacancies"
                    action={
                      <AdminButton
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('jobs')}
                      >
                        Manage Jobs →
                      </AdminButton>
                    }
                  />
                  {myApplications.length === 0 ? (
                    <div className="mt-4">
                      <EmptyState
                        icon={Briefcase}
                        title="No job applications yet"
                        description="Post a job vacancy to receive candidate CVs directly."
                      />
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {myApplications.slice(0, 4).map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-slate-950">
                              {app.applicantName}
                            </p>
                            <p className="truncate text-[11px] text-slate-500">
                              Role: {app.jobTitle} • CV: {app.cvFileName}
                            </p>
                          </div>
                          <AdminBadge
                            tone={
                              app.status === 'Shortlisted'
                                ? 'success'
                                : app.status === 'Under Review'
                                ? 'info'
                                : 'neutral'
                            }
                          >
                            {app.status}
                          </AdminBadge>
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
              </div>

              {/* TRACK-SPECIFIC OPERATIONS HUB */}
              {currentBusiness.onboardingTrack === 'owner_operated' ? (
                /* TRACK B: WHATSAPP DIRECT SALES & MOBILE RECEIPT HUB */
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 p-5 sm:p-6 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 dark:border-emerald-900/60 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        💬
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            WhatsApp Direct Trade &amp; Quick Mobile Receipt Hub
                          </h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                            Track B: Solo Operator
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          Streamlined for Zimbabwean sole traders, artisans, and shop owners. Zero corporate compliance friction.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${currentBusiness.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hello! I am viewing ${currentBusiness.name} on Sadza Connect and would like to enquire about your products.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition"
                      >
                        <Phone className="h-3.5 w-3.5" /> Test My Buyer WhatsApp Link
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Receipt Generator Form */}
                    <div className="lg:col-span-7 bg-white dark:bg-slate-800/80 rounded-xl border border-emerald-100 dark:border-emerald-900/40 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <QrCode className="h-3.5 w-3.5 text-emerald-600" /> Instant EcoCash / InnBucks WhatsApp Receipt Maker
                        </h4>
                        <span className="text-[10px] text-slate-400">Generates instant digital receipt</span>
                      </div>
                      <form onSubmit={handleDispatchReceipt} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                              Buyer Name or Phone
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Mai Chipo (+263 77 123 4567)"
                              value={receiptBuyer}
                              onChange={(e) => setReceiptBuyer(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                              Amount Paid &amp; Currency
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                step="0.01"
                                placeholder="e.g. 25.00"
                                value={receiptAmount}
                                onChange={(e) => setReceiptAmount(e.target.value)}
                                required
                                className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                              />
                              <select
                                value={receiptCurrency}
                                onChange={(e) => setReceiptCurrency(e.target.value as 'USD' | 'ZiG')}
                                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                              >
                                <option value="USD">USD ($)</option>
                                <option value="ZiG">ZiG</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            Goods / Services Sold
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 2x Solar Lanterns + Delivery"
                            value={receiptItem}
                            onChange={(e) => setReceiptItem(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
                          >
                            <Send className="h-3.5 w-3.5" /> Dispatch Receipt via WhatsApp
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Sole Trader Exemption & Regulatory Badge */}
                    <div className="lg:col-span-5 bg-white dark:bg-slate-800/80 rounded-xl border border-emerald-100 dark:border-emerald-900/40 p-4 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            Zero-Bureaucracy Sole Trader Status
                          </h4>
                        </div>
                        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          Operating under Zimbabwe Sole Proprietor laws. You are <strong>exempt</strong> from corporate CR6 director registers, formal annual company secretarial returns, and ITF263 tax clearance certificates.
                        </p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 p-3 border border-emerald-200/60 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> National Directory Active
                        </div>
                        <div>
                          Monthly Rate: <span className="font-bold">{activeMonthlyRateStr}/mo</span>{' '}
                          {isCustomPrice ? '(Admin Custom Rate)' : '(Track B Solo Default)'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : currentBusiness.onboardingTrack === 'association_institutional' ? (
                /* TRACK C: COOPERATIVE MEMBER REGISTRY & BULK SUPPLY AGGREGATOR */
                <div className="rounded-2xl border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/80 via-white to-purple-50/30 dark:from-purple-950/30 dark:via-slate-900 dark:to-slate-900 p-5 sm:p-6 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 dark:border-purple-900/60 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        🤝
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Cooperative Member Aggregation &amp; Producer Network Hub
                          </h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300">
                            Track C: Cooperative / NGO
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          Designed for agricultural producer unions, artisanal associations, NGOs, and community trusts.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                        <ShieldCheck className="h-3.5 w-3.5" /> Ministry Certified Association
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-slate-800/80 p-4 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Producer Members Represented
                      </span>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        Multi-Member Collective
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Pooling harvest, equipment, and livestock across {currentBusiness.province}.
                      </p>
                    </div>

                    <div className="rounded-xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-slate-800/80 p-4 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Bulk Offtaker Supply
                      </span>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        Direct Wholesale Aggregation
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Facilitating bulk supply contracts with food processors and commercial exporters.
                      </p>
                    </div>

                    <div className="rounded-xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-slate-800/80 p-4 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Cooperative Compliance
                      </span>
                      <div className="text-sm font-bold text-purple-700 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Constitution on File
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Exempt from corporate share capital minimums under cooperative statutes.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* TRACK A: CORPORATE B2B TENDER & ZIMRA COMPLIANCE HUB */
                <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-900 p-5 sm:p-6 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100 dark:border-blue-900/60 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        🏢
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Corporate Enterprise B2B &amp; ZIMRA Compliance Hub
                          </h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300">
                            Track A: Registered Company
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          Configured for Zimbabwean Private Limited (Pvt Ltd) companies and PBCs engaging in formal B2B trade and state tenders.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentBusiness.cr14Verified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="h-3.5 w-3.5" /> Corporate Grade Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="h-3.5 w-3.5" /> Pending Verification (Under Review)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-white dark:bg-slate-800/80 p-4 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        CR14 / CR6 Registration
                      </span>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {currentBusiness.registrationNumber ||
                          (currentBusiness.cr14Verified ? 'CR14 Verified' : 'Pending Verification')}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Incorporation filed with Registrar of Companies &amp; Deeds.
                      </p>
                    </div>

                    <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-white dark:bg-slate-800/80 p-4 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        ZIMRA Fiscal &amp; VAT Rate
                      </span>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {settings.vatPct ?? 15}% Standard VAT Rate
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Eligible for corporate tax deductible invoicing and input tax credits.
                      </p>
                    </div>

                    <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-white dark:bg-slate-800/80 p-4 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        PRAZ &amp; Tender Pre-Qualification
                      </span>
                      <div className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Eligible for B2B Supply
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Verified badge visible to mining houses, NGOs &amp; public sector buyers.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOGUE */}
          {activeTab === 'products' && (
            <Panel>
              <PanelHeading
                title="Marketplace Products Catalogue"
                hint="Products uploaded here appear on the national Marketplace and your Business Storefront with dual USD/ZiG pricing."
                action={
                  <AdminButton onClick={handleOpenProductModal}>
                    <Plus className="h-4 w-4" /> Upload New Product
                  </AdminButton>
                }
              />
              {myProducts.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    icon={Package}
                    title="No products listed yet"
                    description="Your active subscription includes unlimited product listings."
                    action={
                      <AdminButton onClick={handleOpenProductModal}>
                        <Plus className="h-4 w-4" /> Upload First Product
                      </AdminButton>
                    }
                  />
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {myProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-slate-300"
                    >
                      <img
                        src={prod.image}
                        alt={prod.title}
                        className="h-24 w-24 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/marketplace/${prod.slug}`}
                            className="truncate text-sm font-bold text-slate-950 hover:text-[#1e57eb]"
                          >
                            {prod.title}
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs font-bold text-emerald-700">
                          ${prod.priceUsd.toLocaleString()} USD{' '}
                          <span className="font-normal text-slate-400">
                            ({Math.round(prod.priceUsd * settings.usdToZigRate).toLocaleString()}{' '}
                            ZiG)
                          </span>
                        </p>
                        <p className="line-clamp-2 text-xs text-slate-500">{prod.description}</p>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <AdminBadge tone="neutral">{prod.category}</AdminBadge>
                          <AdminBadge tone="success">{prod.stockNote}</AdminBadge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}

          {/* TAB 3: SPONSORED ADVERTS ($20/MO) */}
          {activeTab === 'adverts' && (
            <Panel>
              <PanelHeading
                title={`Sponsored Product Adverts ($${settings.sponsoredAdvertPriceUsd}/month)`}
                hint="Pin wholesale specials, price discounts, or seasonal packages onto the Homepage Top-6 and /adverts hub."
                action={
                  <AdminButton onClick={handleOpenAdvertModal}>
                    <Sparkles className="h-4 w-4" /> Launch ${settings.sponsoredAdvertPriceUsd}/mo Advert
                  </AdminButton>
                }
              />
              {myAdverts.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    icon={Megaphone}
                    title="No active sponsored adverts"
                    description="Launch a $20/month Sponsored Advert to capture high-intent buyers on the Homepage."
                    action={
                      <AdminButton onClick={handleOpenAdvertModal}>
                        <Plus className="h-4 w-4" /> Create Sponsored Campaign
                      </AdminButton>
                    }
                  />
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {myAdverts.map((ad) => (
                    <div
                      key={ad.id}
                      className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
                    >
                      <img
                        src={ad.image}
                        alt={ad.headline}
                        className="h-24 w-24 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <AdminBadge tone="warning">{ad.promoBadge}</AdminBadge>
                          <button
                            type="button"
                            onClick={() => handleDeleteAdvert(ad.id)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                            title="Delete Advert"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="truncate text-sm font-bold text-slate-950">{ad.headline}</p>
                        <p className="text-xs font-bold text-emerald-700">
                          Promo: ${ad.promoPriceUSD} USD{' '}
                          <span className="line-through font-normal text-slate-400">
                            ${ad.originalPriceUSD}
                          </span>{' '}
                          • {ad.validUntil}
                        </p>
                        <p className="line-clamp-2 text-xs text-slate-500">{ad.offerText}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}

          {/* TAB 4: JOBS & APPLICANT CVs */}
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <Panel>
                <PanelHeading
                  title={`Published Job Vacancies (${myJobs.length})`}
                  hint="Recruit qualified engineers, technicians, sales reps, and operations staff across Zimbabwe."
                  action={
                    <AdminButton onClick={handleOpenJobModal}>
                      <Plus className="h-4 w-4" /> Post Job Vacancy
                    </AdminButton>
                  }
                />
                {myJobs.length === 0 ? (
                  <div className="mt-6">
                    <EmptyState
                      icon={Briefcase}
                      title="No job vacancies posted"
                      description="Publish a vacancy to start receiving verified candidate CVs."
                    />
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {myJobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-950">{job.title}</span>
                            <AdminBadge tone="brand">{job.type}</AdminBadge>
                          </div>
                          <p className="text-xs text-slate-500">
                            {job.province} • Salary: <strong className="text-slate-800">{job.salaryUsd}</strong> • Posted: {job.postedDate}
                          </p>
                        </div>
                        <AdminButton
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteJob(job.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Close Vacancy
                        </AdminButton>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>

              <Panel>
                <PanelHeading
                  title={`Submitted Candidate Applications & CVs (${myApplications.length})`}
                  hint="Review candidate experience summaries, shortlist applicants, or message them directly on WhatsApp."
                />
                {myApplications.length === 0 ? (
                  <div className="mt-6">
                    <EmptyState
                      icon={Briefcase}
                      title="No candidate applications yet"
                      description="Applications submitted on /jobs for your company will appear here automatically."
                    />
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {myApplications.map((app) => (
                      <div
                        key={app.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-slate-950">
                              {app.applicantName}{' '}
                              <span className="font-normal text-xs text-slate-500">
                                • Applied for {app.jobTitle}
                              </span>
                            </p>
                            <p className="text-xs text-slate-500">
                              {app.applicantEmail} • {app.applicantPhone} • CV:{' '}
                              <strong className="text-slate-800">{app.cvFileName}</strong>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={app.status}
                              onChange={(e) =>
                                handleUpdateApplicantStatus(
                                  app.id,
                                  e.target.value as JobApplicationRecord['status']
                                )
                              }
                              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800"
                            >
                              <option value="Submitted">Submitted</option>
                              <option value="Under Review">Under Review</option>
                              <option value="Shortlisted">Shortlisted</option>
                            </select>
                            <a
                              href={`https://wa.me/${app.applicantPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                            >
                              WhatsApp
                            </a>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {app.experienceSummary}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </div>
          )}

          {/* TAB 5: CUSTOMER REVIEWS */}
          {activeTab === 'reviews' && (
            <Panel>
              <PanelHeading
                title={`Verified Customer Reviews (${currentBusiness.reviews?.length || 0})`}
                hint="Authentic ratings and feedback submitted by buyers on your public storefront."
              />
              {!currentBusiness.reviews || currentBusiness.reviews.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    icon={Star}
                    title="No customer reviews yet"
                    description="Invite satisfied customers to review your storefront."
                  />
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {currentBusiness.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-950">
                          {rev.author}{' '}
                          <span className="ml-1 text-amber-500">{'★'.repeat(rev.rating)}</span>
                        </span>
                        <span className="text-[11px] text-slate-400">{rev.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}

          {/* TAB 6: STOREFRONT PROFILE, LOCKED CREDENTIALS, LIVE PREVIEW & KYC VAULT */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Locked Primary Credentials */}
              <Panel>
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1e57eb]">
                      <Lock className="h-3.5 w-3.5" /> Locked Registration Identity (Non-Editable)
                    </span>
                    <h2 className="mt-1 text-base font-bold text-slate-950">
                      Primary Business Registration Credentials
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      For buyer trust, fraud prevention, and statutory compliance integrity, your
                      Registered Business Name, Registration Email, Primary Registration Phone, and
                      statutory legal track classification are permanently locked. You may freely
                      update your active WhatsApp sales line, province, physical address, and
                      description below.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-100/80 p-3.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                      <span>Registered Business Name</span>
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={currentBusiness.name}
                      className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-not-allowed"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-100/80 p-3.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                      <span>Registration Email (Unique)</span>
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      readOnly
                      value={currentBusiness.email}
                      className="w-full bg-transparent text-xs font-mono font-bold text-slate-900 focus:outline-none cursor-not-allowed"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-100/80 p-3.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                      <span>Primary Registration Phone</span>
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={currentBusiness.phone}
                      className="w-full bg-transparent text-xs font-mono font-bold text-slate-900 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Statutory Legal Compliance Information */}
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 border-t border-slate-100 pt-3">
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Onboarding Track
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-900">
                      {currentBusiness.onboardingTrack === 'owner_operated'
                        ? 'Track B: Owner-Operated'
                        : currentBusiness.onboardingTrack === 'association_institutional'
                        ? 'Track C: Association / Trust'
                        : 'Track A: Registered Entity'}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Legal Form Declared
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-900 capitalize">
                      {currentBusiness.legalForm
                        ? currentBusiness.legalForm.replace(/_/g, ' ')
                        : currentBusiness.businessType}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Statutory Badge
                    </div>
                    <div
                      className={`mt-1 text-xs font-bold flex items-center gap-1 ${
                        currentBusiness.cr14Verified ? 'text-emerald-700' : 'text-amber-600'
                      }`}
                    >
                      {currentBusiness.cr14Verified ? (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{currentBusiness.verificationBadge || 'Verified Registered Company'}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                          <span>Unverified (Awaiting Admin Review)</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Official Permit / Entity #
                    </div>
                    <div className="mt-1 text-xs font-mono font-bold text-slate-900">
                      {currentBusiness.registrationNumber || 'Not Required / Pending'}
                    </div>
                  </div>
                </div>
              </Panel>

              {/* Split Editor + Live Storefront Preview */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                <div className="xl:col-span-7">
                  <Panel>
                    <PanelHeading
                      title="Editable Operational & Storefront Profile"
                      hint="Updates sync immediately to your public listing and live preview."
                    />
                    <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <AdminSelect
                          label="Entity Structure"
                          value={editEntityType}
                          onChange={(e) =>
                            setEditEntityType(e.target.value as BusinessListing['businessType'])
                          }
                        >
                          <option value="Registered Company (Pvt Ltd)">
                            Registered Company (Pvt Ltd)
                          </option>
                          <option value="SME / Partnership">SME / Partnership</option>
                          <option value="Sole Proprietor">Sole Proprietor</option>
                          <option value="Cooperative / Association">
                            Cooperative / Association
                          </option>
                        </AdminSelect>

                        <AdminSelect
                          label="Commercial Sector"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                        >
                          {BUSINESS_CATEGORIES.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </AdminSelect>

                        <AdminSelect
                          label="Province"
                          value={editProvince}
                          onChange={(e) => setEditProvince(e.target.value)}
                        >
                          {ZIMBABWE_PROVINCES.map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                        </AdminSelect>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <AdminInput
                          label="Active WhatsApp Sales Line"
                          value={editWhatsapp}
                          onChange={(e) => setEditWhatsapp(e.target.value)}
                        />
                        <AdminInput
                          label="Operating Hours"
                          value={editHours}
                          onChange={(e) => setEditHours(e.target.value)}
                        />
                      </div>

                      <AdminInput
                        label="Physical Operating Address"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                      />

                      <AdminTextarea
                        label="Business Description & Capabilities"
                        rows={4}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />

                      <AdminInput
                        label="Core Services Offered (comma-separated)"
                        value={editServices}
                        onChange={(e) => setEditServices(e.target.value)}
                      />

                      <div className="flex justify-end pt-2">
                        <AdminButton type="submit">Save Storefront Changes</AdminButton>
                      </div>
                    </form>
                  </Panel>
                </div>

                {/* Live Storefront Preview (Strictly Contained with break-words whitespace-pre-wrap) */}
                <div className="xl:col-span-5">
                  <Panel className="sticky top-24 overflow-hidden">
                    <PanelHeading
                      title="Live Public Storefront Preview"
                      hint="Real-time preview of how buyers see your card."
                    />
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 overflow-hidden">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="inline-block rounded-md bg-[#eef4ff] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1e57eb]">
                            {editCategory || currentBusiness.categoryName}
                          </span>
                          <h3 className="mt-1.5 text-base font-bold text-slate-950 break-words">
                            {currentBusiness.name}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">
                              {editProvince || currentBusiness.province} •{' '}
                              {editAddress || currentBusiness.address}
                            </span>
                          </p>
                        </div>
                        <AdminBadge tone={currentBusiness.cr14Verified ? 'success' : 'warning'}>
                          {currentBusiness.cr14Verified
                            ? (currentBusiness.verificationBadge || 'Verified Company')
                            : 'Unverified (Pending Review)'}
                        </AdminBadge>
                      </div>

                      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 max-h-48 overflow-y-auto">
                        <p className="text-xs text-slate-700 leading-relaxed break-words whitespace-pre-wrap">
                          {editDescription ||
                            'Enter your business description on the left to preview how it renders on your public directory listing...'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {editServices
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .slice(0, 5)
                          .map((srv) => (
                            <span
                              key={srv}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700"
                            >
                              {srv}
                            </span>
                          ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t border-slate-200/80 pt-3 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1.5 truncate">
                          <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{editWhatsapp || currentBusiness.whatsapp}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="h-3.5 w-3.5 text-[#1e57eb] shrink-0" />
                          <span className="truncate">{currentBusiness.email}</span>
                        </div>
                      </div>
                    </div>
                  </Panel>
                </div>
              </div>

              {/* KYC Verification Documents Vault with Track-Specific Guidance */}
              <Panel>
                <PanelHeading
                  title={
                    currentBusiness.onboardingTrack === 'owner_operated'
                      ? 'Statutory Verification & Trader Credentials Vault'
                      : currentBusiness.onboardingTrack === 'association_institutional'
                      ? 'Institutional Verification & Governance Charter Vault'
                      : 'COBE Registration & ZIMRA Compliance KYC Vault'
                  }
                  hint={
                    currentBusiness.onboardingTrack === 'owner_operated'
                      ? 'Upload or refresh your National ID, Municipal Stall Permit / Lease, or Trade photos for Admin verification.'
                      : currentBusiness.onboardingTrack === 'association_institutional'
                      ? 'Upload or refresh your Constitution, Trust Deed, or Committee Minutes for Admin verification.'
                      : 'Upload Certificate of Incorporation, Form CR6 (Directors), Form CR5 (Address), or ZIMRA Tax Clearance.'
                  }
                />

                {/* Track Guidance Notice */}
                <div className="mt-4 rounded-xl border border-blue-200/80 bg-blue-50/70 p-4 text-xs text-blue-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-blue-950">
                    <ShieldCheck className="h-4 w-4 text-[#1e57eb]" />
                    <span>
                      {currentBusiness.onboardingTrack === 'owner_operated'
                        ? 'Track B Checklist: Owner-Operated / Informal Verification'
                        : currentBusiness.onboardingTrack === 'association_institutional'
                        ? 'Track C Checklist: Association, Cooperative or Trust Verification'
                        : 'Track A Checklist: Registered Entity (COBE / ZIMRA) Verification'}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-blue-800">
                    {currentBusiness.onboardingTrack === 'owner_operated'
                      ? 'To maintain verification, please provide: 1) Zimbabwe National ID / Passport of the Operator, 2) Local Council Stall Permit, Market Lease, or Utility Bill, 3) Workshop / Trade Operation Photo, and 4) Trade References.'
                      : currentBusiness.onboardingTrack === 'association_institutional'
                      ? 'To maintain verification, please provide: 1) Constitution, Trust Deed, or Notarial Deed, 2) Committee Minutes of Appointment, 3) Official Letterhead / Proof of Physical Base, and 4) National ID of Secretary / Chairperson.'
                      : 'To maintain verification, please provide: 1) Certificate of Incorporation, 2) Form CR6 / List of Directors, 3) Form CR5 / Registered Office, and 4) ZIMRA ITF263 Tax Clearance Certificate.'}
                  </p>
                  <div className="pt-1 text-[11px] font-semibold text-blue-950 flex items-center gap-1.5">
                    <span>Target Verification Badge:</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-[#1e57eb] font-bold">
                      {currentBusiness.verificationBadge ||
                        (currentBusiness.onboardingTrack === 'owner_operated'
                          ? 'Verified Informal Business'
                          : currentBusiness.onboardingTrack === 'association_institutional'
                          ? 'Verified Organisation'
                          : 'Verified Registered Company')}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-normal">Encrypted in secure private storage (Confidential)</span>
                  </div>
                </div>

                <div className="mt-5">
                  <ImageUploader
                    label={
                      currentBusiness.onboardingTrack === 'owner_operated'
                        ? 'National ID & Stall Permit / Trade Scans'
                        : currentBusiness.onboardingTrack === 'association_institutional'
                        ? 'Constitution, Trust Deed & Committee Scans'
                        : 'Corporate KYC & Tax Clearance Scans'
                    }
                    hint="Upload clear scans or photos (PNG, JPG, PDF, WEBP)"
                    multiple={true}
                    images={kycAssets}
                    onChange={(items) => {
                      setKycAssets(items);
                      showToast('KYC compliance documents updated and queued for Admin review.');
                    }}
                  />
                </div>
              </Panel>
            </div>
          )}

          {/* TAB 7: BILLING & PRINTABLE QR RECEIPTS */}
          {activeTab === 'billing' && (
            <Panel>
              <PanelHeading
                title="Subscription & Advertising Invoices"
                hint={`Official QR-verified payment receipts for your ${activeMonthlyRateStr}/mo Business Listing and $${settings.sponsoredAdvertPriceUsd}/mo Sponsored Adverts.`}
                action={
                  <AdminButton onClick={() => setShowPayModal(true)}>
                    <CreditCard className="h-4 w-4" /> Pay Monthly Subscription ({activeMonthlyRateStr})
                  </AdminButton>
                }
              />

              {myInvoices.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    icon={CreditCard}
                    title="No paid invoices yet"
                    description={`You are currently in your ${settings.freeGracePeriodDays}-day complimentary onboarding grace period.`}
                  />
                </div>
              ) : (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-y border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-400">
                        <th className="px-4 py-3 font-medium">Invoice #</th>
                        <th className="px-4 py-3 font-medium">Service Plan</th>
                        <th className="px-4 py-3 font-medium">Period Covered</th>
                        <th className="px-4 py-3 font-medium">Payment Channel</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 text-right font-medium">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {myInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3.5 font-mono font-bold text-slate-950">
                            {inv.invoiceNumber}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-slate-800">
                            {inv.planType}
                          </td>
                          <td className="px-4 py-3.5 text-slate-500">{inv.periodCovered}</td>
                          <td className="px-4 py-3.5 text-slate-700">{inv.paymentMethod}</td>
                          <td className="px-4 py-3.5 font-mono font-bold text-emerald-700">
                            ${inv.amountUsd.toFixed(2)} USD
                          </td>
                          <td className="px-4 py-3.5">
                            <AdminBadge tone="success">{inv.status}</AdminBadge>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <AdminButton
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedInvoice(inv)}
                            >
                              <QrCode className="h-3.5 w-3.5" /> View Receipt
                            </AdminButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          )}
        </main>
      </div>

      {/* MODAL 1: DYNAMIC MONTHLY SUBSCRIPTION */}
      <AdminModal
        open={showPayModal}
        onClose={() => setShowPayModal(false)}
        size="md"
        title={`Monthly Business Subscription (${activeMonthlyRateStr} USD)`}
        description={`Activate or extend 30 calendar days of full directory, marketplace, and job board visibility for ${currentBusiness.name} (${
          currentBusiness.onboardingTrack === 'owner_operated'
            ? 'Owner-Operated Solo Trader'
            : currentBusiness.onboardingTrack === 'association_institutional'
            ? 'Cooperative / Association'
            : 'Corporate Registered Company'
        }${isCustomPrice ? ' • Custom Admin Rate' : ''}).`}
      >
        <form onSubmit={handlePaySubscription} className="flex flex-col flex-1 min-h-0">
          <ModalBody>
            <AdminSelect
              label="Select Zimbabwean Payment Gateway"
              value={payMethod}
              onChange={(e) =>
                setPayMethod(
                  e.target.value as
                    | 'EcoCash USD'
                    | 'InnBucks'
                    | 'Visa / Mastercard'
                    | 'Bank Transfer'
                )
              }
            >
              <option value="EcoCash USD">EcoCash USD / ZiG Instant Push</option>
              <option value="InnBucks">InnBucks Authorization Code</option>
              <option value="Visa / Mastercard">Visa / Mastercard Corporate Card</option>
              <option value="Bank Transfer">ZimSwitch / RTGS Bank Transfer</option>
            </AdminSelect>

            <AdminInput
              label="Mobile Wallet Number / Account Reference"
              required
              value={payPhone}
              onChange={(e) => setPayPhone(e.target.value)}
            />

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Total Due (30 Calendar Days):</span>
              <span className="font-mono text-sm font-bold text-emerald-700">
                {activeMonthlyRateStr} USD ({activeMonthlyRateZiGStr})
              </span>
            </div>
          </ModalBody>

          <ModalFooter>
            <AdminButton type="button" variant="outline" onClick={() => setShowPayModal(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit">
              <CheckCircle2 className="h-4 w-4" /> Confirm &amp; Activate Plan
            </AdminButton>
          </ModalFooter>
        </form>
      </AdminModal>

      {/* MODAL: ONBOARDING INTERCEPT GATING MODAL */}
      <AdminModal
        open={showGateModal}
        onClose={() => setShowGateModal(false)}
        size="md"
        title="Complete Business Setup Required"
        description={`Before ${gateActionName}, you must finalize your storefront profile.`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          <ModalBody>
            <div className="flex flex-col items-center text-center py-2 space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 shadow-xs">
                <Building2 className="h-7 w-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Your Storefront is in Draft Mode
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm">
                  Sadza Connect requires merchants to complete profile verification and location details
                  before publishing items to Zimbabwe buyers.
                </p>
              </div>

              {/* Progress Card Preview */}
              <div className="w-full bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 text-left space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Current Progress: Step {onboardingProgress?.currentStep} of 7
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {onboardingProgress?.progressPercent}% Done
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${onboardingProgress?.progressPercent || 0}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Next required step: <span className="font-semibold text-slate-700 dark:text-slate-200">{onboardingProgress?.stepTitle}</span>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <AdminButton
              type="button"
              variant="outline"
              onClick={() => setShowGateModal(false)}
            >
              Stay in Dashboard
            </AdminButton>
            <Link
              href="/onboarding/business"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Resume Setup (Step {onboardingProgress?.currentStep}) &rarr;</span>
            </Link>
          </ModalFooter>
        </div>
      </AdminModal>

      {/* MODAL 2: UPLOAD NEW PRODUCT WITH IMAGEUPLOADER */}
      <AdminModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        size="xl"
        title="Upload Marketplace Product"
        description={`Publish a new product SKU under ${currentBusiness.name} with automatic USD & ZiG pricing.`}
      >
        <form onSubmit={handleAddProduct} className="flex flex-col flex-1 min-h-0">
          <ModalBody>
            <AdminInput
              label="Product or Package Title *"
              required
              placeholder="e.g. 5kVA Deye Hybrid Inverter + 100Ah LiFePO4 Battery"
              value={prodTitle}
              onChange={(e) => setProdTitle(e.target.value)}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <AdminSelect
                label="Commercial Sector *"
                value={prodCategory}
                onChange={(e) => setProdCategory(e.target.value)}
              >
                {BUSINESS_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </AdminSelect>

              <AdminInput
                label="Unit Price ($ USD) *"
                type="number"
                min="1"
                required
                value={prodPriceUsd}
                onChange={(e) => setProdPriceUsd(e.target.value)}
                hint={`≈ ${(Math.round(Number(prodPriceUsd || 0) * settings.usdToZigRate * 100) / 100).toLocaleString()} ZiG (1 USD = ${settings.usdToZigRate} ZiG)`}
              />

              <AdminInput
                label="Pricing Unit"
                value={prodUnit}
                onChange={(e) => setProdUnit(e.target.value)}
                placeholder="Per Unit / Per Tonne"
              />
            </div>

            <AdminInput
              label="Stock & Dispatch Availability Note"
              value={prodStockNote}
              onChange={(e) => setProdStockNote(e.target.value)}
            />

            <ImageUploader
              label="Product Photo"
              hint="Upload product photo from your device or choose a commercial preset"
              multiple={false}
              images={prodImages}
              onChange={setProdImages}
            />

            <AdminTextarea
              label="Technical Specifications & Delivery Terms *"
              rows={3}
              required
              value={prodDesc}
              onChange={(e) => setProdDesc(e.target.value)}
              placeholder="Include warranty, specifications, and inter-provincial delivery details..."
            />
          </ModalBody>

          <ModalFooter>
            <AdminButton type="button" variant="outline" onClick={() => setShowProductModal(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit">
              <Plus className="h-4 w-4" /> Publish Product to Marketplace
            </AdminButton>
          </ModalFooter>
        </form>
      </AdminModal>

      {/* MODAL 3: LAUNCH $20/MO SPONSORED ADVERT WITH IMAGEUPLOADER */}
      <AdminModal
        open={showAdvertModal}
        onClose={() => setShowAdvertModal(false)}
        size="xl"
        title={`Launch Sponsored Product Advert ($${settings.sponsoredAdvertPriceUsd}/mo)`}
        description="Pin your promotional campaign to the Homepage Top-6 and the dedicated /adverts hub."
      >
        <form onSubmit={handleAddAdvert} className="flex flex-col flex-1 min-h-0">
          <ModalBody>
            <AdminInput
              label="Promotional Headline *"
              required
              placeholder="e.g. Contractor Bulk Cement & IBR Roofing Clearance"
              value={adHeadline}
              onChange={(e) => setAdHeadline(e.target.value)}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AdminSelect
                label="Offer Category"
                value={adOfferType}
                onChange={(e) =>
                  setAdOfferType(
                    e.target.value as
                      | 'Bulk / Wholesale'
                      | 'Price Discount'
                      | 'Free Delivery'
                      | 'Special Package'
                  )
                }
              >
                <option value="Special Package">Special Package</option>
                <option value="Price Discount">Price Discount</option>
                <option value="Bulk / Wholesale">Bulk / Wholesale</option>
                <option value="Free Delivery">Free Delivery</option>
              </AdminSelect>

              <AdminInput
                label="Promo Badge Ribbon *"
                required
                value={adPromoBadge}
                onChange={(e) => setAdPromoBadge(e.target.value)}
                placeholder="e.g. SAVE 15% THIS MONTH"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <AdminInput
                label="Regular Price ($ USD)"
                type="number"
                value={adOrigUsd}
                onChange={(e) => setAdOrigUsd(e.target.value)}
              />
              <AdminInput
                label="Promo Offer Price ($ USD) *"
                type="number"
                required
                value={adPromoUsd}
                onChange={(e) => setAdPromoUsd(e.target.value)}
              />
              <AdminInput
                label="Offer Validity Window"
                value={adValidUntil}
                onChange={(e) => setAdValidUntil(e.target.value)}
              />
            </div>

            <ImageUploader
              label="Promotional Campaign Banner"
              hint="Upload promotional creative from your device or choose preset"
              multiple={false}
              images={adImages}
              onChange={setAdImages}
            />

            <AdminTextarea
              label="Promotional Offer Details *"
              rows={3}
              required
              value={adOfferText}
              onChange={(e) => setAdOfferText(e.target.value)}
              placeholder="Describe minimum order quantities, included accessories, or delivery perks..."
            />
          </ModalBody>

          <ModalFooter>
            <AdminButton type="button" variant="outline" onClick={() => setShowAdvertModal(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit">
              <Sparkles className="h-4 w-4" /> Pay ${settings.sponsoredAdvertPriceUsd} USD &amp; Launch Advert
            </AdminButton>
          </ModalFooter>
        </form>
      </AdminModal>

      {/* MODAL 4: POST JOB VACANCY */}
      <AdminModal
        open={showJobModal}
        onClose={() => setShowJobModal(false)}
        size="lg"
        title={`Post Job Vacancy — ${currentBusiness.name}`}
        description="Publish an open position to the verified Sadza Connect Careers Board."
      >
        <form onSubmit={handleAddJob} className="flex flex-col flex-1 min-h-0">
          <ModalBody>
            <AdminInput
              label="Position / Role Title *"
              required
              placeholder="e.g. Senior Solar Installation Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AdminSelect
                label="Employment Type"
                value={jobType}
                onChange={(e) =>
                  setJobType(
                    e.target.value as 'Full-time' | 'Part-time' | 'Contract' | 'Apprenticeship'
                  )
                }
              >
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
                <option value="Apprenticeship">Apprenticeship</option>
              </AdminSelect>
              <AdminInput
                label="Monthly Salary Range ($ USD) *"
                required
                value={jobSalary}
                onChange={(e) => setJobSalary(e.target.value)}
              />
            </div>
            <AdminTextarea
              label="Role Responsibilities & Summary *"
              rows={3}
              required
              value={jobSummary}
              onChange={(e) => setJobSummary(e.target.value)}
            />
            <AdminInput
              label="Key Qualifications (comma-separated)"
              value={jobReqs}
              onChange={(e) => setJobReqs(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>
            <AdminButton type="button" variant="outline" onClick={() => setShowJobModal(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit">
              <Plus className="h-4 w-4" /> Publish Job Vacancy
            </AdminButton>
          </ModalFooter>
        </form>
      </AdminModal>

      {/* MODAL 5: PRINTABLE OFFICIAL QR INVOICE RECEIPT */}
      <AdminModal
        open={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        size="md"
        title={`Official Tax Receipt — ${selectedInvoice?.invoiceNumber ?? ''}`}
        description="ZIMRA-compliant commercial subscription & advertising receipt."
      >
        {selectedInvoice && (
          <div className="flex flex-col flex-1 min-h-0">
            <ModalBody>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4">
                <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#1e57eb]">
                      Sadza Connect Integrated Commerce
                    </p>
                    <p className="text-sm font-bold text-slate-950 mt-0.5">
                      {selectedInvoice.businessName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Receipt #: {selectedInvoice.invoiceNumber}
                    </p>
                  </div>
                  <AdminBadge tone="success">PAID VERIFIED</AdminBadge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service Plan:</span>
                    <span className="font-bold text-slate-900">{selectedInvoice.planType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Billing Period:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedInvoice.periodCovered}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Channel:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedInvoice.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                    <span className="font-bold text-slate-900">Total Paid:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      ${selectedInvoice.amountUsd.toFixed(2)} USD
                    </span>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <AdminButton variant="outline" onClick={() => setSelectedInvoice(null)}>
                Close
              </AdminButton>
              <AdminButton onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print Official Receipt
              </AdminButton>
            </ModalFooter>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
