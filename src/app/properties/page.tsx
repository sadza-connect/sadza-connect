'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Home,
  MapPin,
  Search,
  Plus,
  Building,
  Bed,
  Bath,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  Phone,
  Filter,
  X,
  Layers,
  Sparkles,
  ArrowRight,
  Maximize2,
  Camera,
  Upload,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Modal, PublicModalBody, PublicModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  PropertyListing,
  PROPERTY_TYPES,
  PROPERTY_CATEGORIES,
  getStoredProperties,
  saveStoredProperty,
  togglePropertyOccupancy,
} from '@/data/propertiesStore';
import { CLEAN_PROVINCES } from '@/data/advertsStore';
import { sanitizePhoneNumber } from '@/lib/utils/whatsapp';

export default function PropertiesDirectoryPage() {
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedOccupancy, setSelectedOccupancy] = useState('All Statuses');

  // Modal State for Viewing Details
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);

  // Modal State for Listing New Property
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<PropertyListing['propertyType']>('Residential Rent');
  const [newCategory, setNewCategory] = useState<PropertyListing['category']>('House');
  const [newOccupancyStatus, setNewOccupancyStatus] = useState<'Available' | 'Taken'>('Available');
  const [newProvince, setNewProvince] = useState('Harare');
  const [newCity, setNewCity] = useState('Harare');
  const [newSuburb, setNewSuburb] = useState('');
  const [newPriceUSD, setNewPriceUSD] = useState('');
  const [newPricePeriod, setNewPricePeriod] = useState<PropertyListing['pricePeriod']>('per_month');
  const [newBedrooms, setNewBedrooms] = useState('3');
  const [newBathrooms, setNewBathrooms] = useState('2');
  const [newFeatures, setNewFeatures] = useState('Borehole, 5kVA Solar, Walled & Gated');
  const [newDescription, setNewDescription] = useState('');
  const [newAdvertiserName, setNewAdvertiserName] = useState('');
  const [newAdvertiserType, setNewAdvertiserType] = useState<PropertyListing['advertiserType']>('Direct Landlord');
  const [newWhatsapp, setNewWhatsapp] = useState('263771000000');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [propertyImageUpload, setPropertyImageUpload] = useState('');
  const propertyFileInputRef = useRef<HTMLInputElement>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handlePropertyImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Property photo must be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPropertyImageUpload(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const loadProps = () => {
      setProperties(getStoredProperties());
      setIsLoading(false);
    };
    loadProps();
    window.addEventListener('sadza-properties-updated', loadProps);
    return () => window.removeEventListener('sadza-properties-updated', loadProps);
  }, []);

  const filteredProperties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return properties.filter((p) => {
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.suburb.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.features.some((f) => f.toLowerCase().includes(q));

      const matchesProvince =
        selectedProvince === 'All Provinces' || p.province === selectedProvince;

      const matchesType =
        selectedType === 'All Types' || p.propertyType === selectedType;

      const matchesCategory =
        selectedCategory === 'All Categories' || p.category === selectedCategory;

      const isOccupied =
        p.occupancyStatus === 'Taken' ||
        p.occupancyStatus === 'Occupied' ||
        Boolean(p.isOccupied);

      const matchesOccupancy =
        selectedOccupancy === 'All Statuses' ||
        (selectedOccupancy === 'Available Only' && !isOccupied) ||
        (selectedOccupancy === 'Taken / Occupied' && isOccupied);

      return matchesSearch && matchesProvince && matchesType && matchesCategory && matchesOccupancy;
    });
  }, [properties, searchQuery, selectedProvince, selectedType, selectedCategory, selectedOccupancy]);

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPriceUSD || !newSuburb.trim()) return;

    const created: PropertyListing = {
      id: `prop-${Date.now()}`,
      title: newTitle.trim(),
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      propertyType: newType,
      category: newCategory,
      province: newProvince,
      city: newCity.trim() || 'Harare',
      suburb: newSuburb.trim(),
      priceUSD: Number(newPriceUSD),
      pricePeriod: newPricePeriod,
      bedrooms: newBedrooms ? Number(newBedrooms) : undefined,
      bathrooms: newBathrooms ? Number(newBathrooms) : undefined,
      features: newFeatures.split(',').map((f) => f.trim()).filter(Boolean),
      description: newDescription.trim() || 'Newly listed property on Sadza Connect.',
      images: [
        propertyImageUpload ||
          newImageUrl.trim() ||
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80',
      ],
      advertiserName: newAdvertiserName.trim() || 'Direct Property Contact',
      advertiserType: newAdvertiserType,
      isVerified: true,
      whatsapp: sanitizePhoneNumber(newWhatsapp),
      phone: `+${sanitizePhoneNumber(newWhatsapp)}`,
      postedAt: 'Just now',
      isFeatured: false,
      occupancyStatus: newOccupancyStatus,
      isOccupied: newOccupancyStatus === 'Taken',
    };

    saveStoredProperty(created);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setCreateModalOpen(false);
      // Reset form
      setNewTitle('');
      setNewPriceUSD('');
      setNewSuburb('');
      setNewDescription('');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-10 border-b border-emerald-900/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_50%)] pointer-events-none" />
          
          <div className="w-full max-w-[1680px] mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide">
                  <Home className="h-3.5 w-3.5" />
                  <span>Dedicated Property &amp; Rentals Portal</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                  Property &amp; Rentals in Zimbabwe
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Discover residential rentals, commercial offices, industrial warehouses, and serviced stands across all 10 provinces. Verified listings with direct landlord and registered agent WhatsApp communication.
                </p>
              </div>

              <div className="shrink-0 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>List a Property / Stand</span>
                </Button>
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
                <div className="text-xs text-slate-400 font-medium">Available Units</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">{properties.length} Listings</div>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
                <div className="text-xs text-slate-400 font-medium">Covered Regions</div>
                <div className="text-xl sm:text-2xl font-black text-white">10 Provinces</div>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
                <div className="text-xs text-slate-400 font-medium">Verification Status</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">Direct Contact</div>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
                <div className="text-xs text-slate-400 font-medium">Currency Supported</div>
                <div className="text-xl sm:text-2xl font-black text-amber-300">USD &amp; ZiG</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="sticky top-20 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs py-4 px-4 sm:px-6 lg:px-10">
          <div className="w-full max-w-[1680px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search suburb, city, borehole, solar..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-10 pr-9 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-900 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                {PROPERTY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                {CLEAN_PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>

              <select
                value={selectedOccupancy}
                onChange={(e) => setSelectedOccupancy(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Available Only">Available Only</option>
                <option value="Taken / Occupied">Taken / Occupied</option>
              </select>

              {(searchQuery || selectedType !== 'All Types' || selectedCategory !== 'All Categories' || selectedProvince !== 'All Provinces' || selectedOccupancy !== 'All Statuses') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('All Types');
                    setSelectedCategory('All Categories');
                    setSelectedProvince('All Provinces');
                    setSelectedOccupancy('All Statuses');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Property Grid Results */}
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 pt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Featured Properties &amp; Rentals
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing {filteredProperties.length} active spaces matching your search
              </p>
            </div>
          </div>

          {filteredProperties.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900/50">
              <Building className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No matching properties found
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
                Try widening your search terms or resetting province filters to view more listings across Zimbabwe.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('All Types');
                  setSelectedCategory('All Categories');
                  setSelectedProvince('All Provinces');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Property Image Cover */}
                  <div className="relative h-56 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-slate-900/90 text-white backdrop-blur-md border border-white/20">
                          {property.propertyType}
                        </span>
                        {(property.occupancyStatus === 'Taken' || property.occupancyStatus === 'Occupied' || property.isOccupied) ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-md border border-white/30 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            TAKEN / OCCUPIED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600/90 text-white shadow-xs backdrop-blur-md border border-white/20">
                            Available
                          </span>
                        )}
                      </div>
                      {property.isFeatured && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md">
                          <Sparkles className="h-3 w-3 fill-current" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>

                    {/* Bottom Price in Cover */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
                      <div>
                        <span className="text-2xl font-black text-emerald-400">
                          USD ${property.priceUSD.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-300 ml-1 font-medium">
                          {property.pricePeriod === 'per_month' ? '/ month' : property.pricePeriod === 'total' ? 'outright' : '/ year'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-amber-300">
                        ~ZiG {(property.priceUSD * 26.5).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{property.suburb}, {property.city} ({property.province})</span>
                      </div>

                      <h3
                        onClick={() => setSelectedProperty(property)}
                        className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-emerald-600 transition-colors cursor-pointer"
                      >
                        {property.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {property.description}
                      </p>
                    </div>

                    {/* Key Specs Pills */}
                    <div className="flex flex-wrap items-center gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                      {property.bedrooms !== undefined && (
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md font-semibold">
                          <Bed className="h-3.5 w-3.5 text-slate-500" />
                          <span>{property.bedrooms} Beds</span>
                        </span>
                      )}
                      {property.bathrooms !== undefined && (
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md font-semibold">
                          <Bath className="h-3.5 w-3.5 text-slate-500" />
                          <span>{property.bathrooms} Baths</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md font-semibold">
                        <Layers className="h-3.5 w-3.5 text-slate-500" />
                        <span>{property.category}</span>
                      </span>
                    </div>

                    {/* Features snippet */}
                    <div className="flex flex-wrap gap-1.5">
                      {property.features.slice(0, 3).map((feat, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40"
                        >
                          ✓ {feat}
                        </span>
                      ))}
                    </div>

                    {/* Advertiser & Direct Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="text-[11px]">
                        <div className="font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                          {property.advertiserName}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-[10px]">
                          {property.advertiserType}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <button
                          type="button"
                          onClick={() => togglePropertyOccupancy(property.id)}
                          title="Click to toggle Occupied / Available"
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            (property.occupancyStatus === 'Taken' || property.occupancyStatus === 'Occupied' || property.isOccupied)
                              ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {(property.occupancyStatus === 'Taken' || property.occupancyStatus === 'Occupied' || property.isOccupied)
                            ? 'Mark Available'
                            : 'Mark Taken'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedProperty(property)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          View
                        </button>
                        <a
                          href={`https://wa.me/${property.whatsapp}?text=${encodeURIComponent(
                            (property.occupancyStatus === 'Taken' || property.occupancyStatus === 'Occupied' || property.isOccupied)
                              ? `Hello, I saw your listing for "${property.title}" in ${property.suburb} on Sadza Connect. I see it is currently taken/occupied — do you have any upcoming vacancies or similar units?`
                              : `Hello, I saw your listing for "${property.title}" in ${property.suburb} on Sadza Connect. Is it still available to view?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-transform active:scale-95 shadow-sm"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Property Details Modal */}
      {selectedProperty && (
        <Modal
          isOpen={Boolean(selectedProperty)}
          onClose={() => setSelectedProperty(null)}
          title={selectedProperty.title}
        >
          <PublicModalBody>
            <div className="space-y-5">
              <div className="relative h-64 w-full rounded-xl overflow-hidden bg-slate-900">
                <Image
                  src={selectedProperty.images[0]}
                  alt={selectedProperty.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {selectedProperty.propertyType}
                </div>
              </div>

              {/* Occupancy Status Banner in Modal */}
              {(selectedProperty.occupancyStatus === 'Taken' || selectedProperty.occupancyStatus === 'Occupied' || selectedProperty.isOccupied) ? (
                <div className="rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 p-3.5 flex items-center justify-between text-xs font-bold text-rose-800 dark:text-rose-200">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-600 animate-pulse" />
                    <span>STATUS: CURRENTLY TAKEN / OCCUPIED</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      togglePropertyOccupancy(selectedProperty.id);
                      setSelectedProperty((prev) =>
                        prev
                          ? {
                              ...prev,
                              occupancyStatus: 'Available',
                              isOccupied: false,
                            }
                          : null
                      );
                    }}
                    className="text-[11px] underline hover:text-rose-950 cursor-pointer"
                  >
                    Change to Available
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/40 p-2.5 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-200">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>STATUS: AVAILABLE NOW</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      togglePropertyOccupancy(selectedProperty.id);
                      setSelectedProperty((prev) =>
                        prev
                          ? {
                              ...prev,
                              occupancyStatus: 'Taken',
                              isOccupied: true,
                            }
                          : null
                      );
                    }}
                    className="text-[11px] underline hover:text-emerald-950 cursor-pointer"
                  >
                    Mark as Taken / Occupied
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    USD ${selectedProperty.priceUSD.toLocaleString()}
                    <span className="text-xs text-slate-500 font-normal ml-1">
                      {selectedProperty.pricePeriod === 'per_month' ? '/ month' : 'total'}
                    </span>
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                    Official ZiG Rate: ~{(selectedProperty.priceUSD * 26.5).toLocaleString()} ZiG
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 justify-end">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{selectedProperty.suburb}, {selectedProperty.city}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">{selectedProperty.province} Province</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Description &amp; Specifications
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedProperty.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Key Amenities &amp; Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedProperty.features.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs font-medium text-slate-800 dark:text-slate-200"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedProperty.advertiserName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {selectedProperty.advertiserType} • Verified Sadza Desk
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedProperty.phone}`}
                    className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors"
                    title="Direct Phone Call"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                  <a
                    href={`https://wa.me/${selectedProperty.whatsapp}?text=${encodeURIComponent(
                      `Hello, I am interested in viewing "${selectedProperty.title}" listed for USD $${selectedProperty.priceUSD} on Sadza Connect.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition-transform active:scale-95"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp Inquiry</span>
                  </a>
                </div>
              </div>
            </div>
          </PublicModalBody>
        </Modal>
      )}

      {/* Create Listing Modal */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="List a Property, Stand or Commercial Rental"
        >
          <PublicModalBody>
            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 animate-bounce" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Property Listed Successfully!
                </h3>
                <p className="text-xs text-slate-500">
                  Your property is now visible in the Zimbabwe Property &amp; Rentals Directory.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateProperty} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Listing Title *
                  </label>
                  <Input
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. 3-Bed Cluster Home with Solar & Borehole"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Property Type *
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                    >
                      {PROPERTY_TYPES.filter((t) => t !== 'All Types').map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                    >
                      {PROPERTY_CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Occupancy Status
                    </label>
                    <select
                      value={newOccupancyStatus}
                      onChange={(e) => setNewOccupancyStatus(e.target.value as 'Available' | 'Taken')}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      <option value="Available">Available Now</option>
                      <option value="Taken">Taken / Occupied</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Province *
                    </label>
                    <select
                      value={newProvince}
                      onChange={(e) => setNewProvince(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                    >
                      {CLEAN_PROVINCES.filter((p) => p !== 'All Provinces').map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      City / Town *
                    </label>
                    <Input
                      required
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="e.g. Harare"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Suburb / Area *
                    </label>
                    <Input
                      required
                      value={newSuburb}
                      onChange={(e) => setNewSuburb(e.target.value)}
                      placeholder="e.g. Borrowdale"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Price (USD) *
                    </label>
                    <Input
                      required
                      type="number"
                      value={newPriceUSD}
                      onChange={(e) => setNewPriceUSD(e.target.value)}
                      placeholder="e.g. 1200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Frequency
                    </label>
                    <select
                      value={newPricePeriod}
                      onChange={(e) => setNewPricePeriod(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="per_month">Per Month (Rent)</option>
                      <option value="total">Outright Sale / Stand Price</option>
                      <option value="per_year">Per Year (Commercial Lease)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Key Features (comma separated)
                  </label>
                  <Input
                    value={newFeatures}
                    onChange={(e) => setNewFeatures(e.target.value)}
                    placeholder="Borehole, 5kVA Solar, Walled & Gated, Title Deeds"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description &amp; Terms
                  </label>
                  <textarea
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Detail bedroom sizes, lease conditions, power setup..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Advertiser Name / Agency *
                    </label>
                    <Input
                      required
                      value={newAdvertiserName}
                      onChange={(e) => setNewAdvertiserName(e.target.value)}
                      placeholder="e.g. Primrose Real Estate or Mr. Moyo"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      WhatsApp Contact (for inquiries) *
                    </label>
                    <Input
                      required
                      value={newWhatsapp}
                      onChange={(e) => setNewWhatsapp(e.target.value)}
                      placeholder="e.g. 263772123456"
                    />
                  </div>
                </div>

                {/* Property Photo Upload from Device */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Property Photo Upload
                  </label>
                  <div className="flex items-center gap-3">
                    {propertyImageUpload ? (
                      <div className="relative h-20 w-32 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm shrink-0">
                        <img src={propertyImageUpload} alt="Property Preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPropertyImageUpload('')}
                          title="Remove photo"
                          className="absolute top-1 right-1 bg-black/75 hover:bg-black rounded-full p-1 text-white cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => propertyFileInputRef.current?.click()}
                        className="h-20 w-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 flex flex-col items-center justify-center text-slate-400 hover:text-emerald-500 cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800 shrink-0"
                      >
                        <Camera className="h-5 w-5 mb-1" />
                        <span className="text-[10px] font-bold">Select Photo</span>
                      </div>
                    )}
                    <div className="flex-1 space-y-1.5">
                      <input
                        ref={propertyFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePropertyImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => propertyFileInputRef.current?.click()}
                        className="text-xs"
                      >
                        <Upload className="h-3.5 w-3.5 mr-1" /> {propertyImageUpload ? 'Change Photo' : 'Upload Photo from Device'}
                      </Button>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        PNG, JPG, or WebP up to 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Or Direct Photo URL (Optional)
                  </label>
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://... (Used if no file is uploaded above)"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl cursor-pointer"
                  >
                    Publish Property Listing
                  </Button>
                </div>
              </form>
            )}
          </PublicModalBody>
        </Modal>
      )}

      <Footer />
    </div>
  );
}
