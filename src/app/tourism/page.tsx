'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Compass,
  MapPin,
  Search,
  Plus,
  Building,
  Bed,
  Users,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  Phone,
  Filter,
  X,
  Layers,
  Sparkles,
  ArrowRight,
  Camera,
  Upload,
  Star,
  Coffee,
  Waves,
  Sun,
  Flame,
  Calendar,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Modal, PublicModalBody } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  TourismListing,
  TOURISM_CATEGORIES,
  TOURISM_DESTINATIONS,
  getStoredTourisms,
  saveStoredTourism,
} from '@/data/tourismStore';
import { CLEAN_PROVINCES } from '@/data/advertsStore';
import { sanitizePhoneNumber } from '@/lib/utils/whatsapp';

export default function TourismDirectoryPage() {
  const [listings, setListings] = useState<TourismListing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedDestination, setSelectedDestination] = useState<string>('All Destinations');
  const [selectedProvince, setSelectedProvince] = useState<string>('All Provinces');

  // Details Modal
  const [selectedListing, setSelectedListing] = useState<TourismListing | null>(null);

  // Create Listing Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<TourismListing['category']>('Lodges & Safari Camps');
  const [newDestination, setNewDestination] = useState('Victoria Falls');
  const [newProvince, setNewProvince] = useState('Matabeleland North');
  const [newCity, setNewCity] = useState('Victoria Falls');
  const [newLocation, setNewLocation] = useState('');
  const [newPricePerNight, setNewPricePerNight] = useState('');
  const [newGuests, setNewGuests] = useState('2');
  const [newBedrooms, setNewBedrooms] = useState('1');
  const [newAmenities, setNewAmenities] = useState('Swimming Pool, Solar Power, Wi-Fi, Breakfast Included');
  const [newDescription, setNewDescription] = useState('');
  const [newHostName, setNewHostName] = useState('');
  const [newHostType, setNewHostType] = useState<TourismListing['hostType']>('Safari Lodge Operator');
  const [newWhatsapp, setNewWhatsapp] = useState('263771000000');
  const [newPhone, setNewPhone] = useState('+263 77 100 0000');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [tourismImageUpload, setTourismImageUpload] = useState('');
  const tourismFileInputRef = useRef<HTMLInputElement>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleTourismImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setTourismImageUpload(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const loadListings = () => {
      setListings(getStoredTourisms());
      setIsLoading(false);
    };
    loadListings();
    window.addEventListener('sadza-tourism-updated', loadListings);
    return () => window.removeEventListener('sadza-tourism-updated', loadListings);
  }, []);

  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return listings.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.destinationArea.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.amenities.some((a) => a.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'All Categories' || item.category === selectedCategory;

      const matchesDestination =
        selectedDestination === 'All Destinations' || item.destinationArea === selectedDestination;

      const matchesProvince =
        selectedProvince === 'All Provinces' || item.province === selectedProvince;

      return matchesSearch && matchesCategory && matchesDestination && matchesProvince;
    });
  }, [listings, searchQuery, selectedCategory, selectedDestination, selectedProvince]);

  const handleCreateTourism = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPricePerNight || !newHostName.trim()) return;

    const created: TourismListing = {
      id: `tour-${Date.now()}`,
      name: newName.trim(),
      slug: newName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: newCategory,
      destinationArea: newDestination,
      province: newProvince,
      city: newCity.trim() || 'Harare',
      addressOrLocation: newLocation.trim() || `${newDestination}, Zimbabwe`,
      pricePerNightUSD: Number(newPricePerNight),
      guestsCapacity: newGuests ? Number(newGuests) : 2,
      bedrooms: newBedrooms ? Number(newBedrooms) : 1,
      amenities: newAmenities.split(',').map((a) => a.trim()).filter(Boolean),
      description: newDescription.trim() || 'Newly listed tourism and hospitality retreat on Sadza Connect.',
      images: [
        tourismImageUpload ||
          newImageUrl.trim() ||
          'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80',
      ],
      hostName: newHostName.trim() || 'Verified Hospitality Desk',
      hostType: newHostType,
      isVerified: true,
      isFeatured: false,
      whatsapp: sanitizePhoneNumber(newWhatsapp),
      phone: newPhone.trim() || `+${sanitizePhoneNumber(newWhatsapp)}`,
      rating: 5.0,
      reviewsCount: 1,
      postedAt: 'Just now',
    };

    saveStoredTourism(created);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setCreateModalOpen(false);
      // Reset form
      setNewName('');
      setNewPricePerNight('');
      setNewDescription('');
      setTourismImageUpload('');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-teal-950 via-slate-900 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-10 border-b border-teal-900/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.18),transparent_50%)] pointer-events-none" />

          <div className="w-full max-w-[1680px] mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold tracking-wide">
                  <Compass className="h-3.5 w-3.5" />
                  <span>Zimbabwe Tourism, Hospitality &amp; Lodging Portal</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                  Lodges, BnBs, Hotels &amp; Resorts
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Discover premier safari game lodges, Kariba houseboats, misty Nyanga mountain chalets, executive Harare BnBs, and Matobo granite retreats. Connect directly with verified hosts and reservation desks on WhatsApp with zero booking commission.
                </p>
              </div>

              <div className="shrink-0 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-teal-900/30 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>List a Lodge, BnB or Hotel</span>
                </Button>
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
                <div className="text-xs text-slate-400 font-medium">Verified Retreats</div>
                <div className="text-xl sm:text-2xl font-black text-teal-400">{listings.length} Stays</div>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
                <div className="text-xs text-slate-400 font-medium">Covered Regions</div>
                <div className="text-xl sm:text-2xl font-black text-white">10 Provinces</div>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
                <div className="text-xs text-slate-400 font-medium">Direct Booking</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">Zero Commission</div>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
                <div className="text-xs text-slate-400 font-medium">Guest Currency</div>
                <div className="text-xl sm:text-2xl font-black text-amber-300">USD &amp; ZiG</div>
              </div>
            </div>
          </div>
        </div>

        {/* Destination Corridors Quick Bar */}
        <div className="bg-teal-900/10 dark:bg-teal-950/20 border-b border-teal-200/50 dark:border-teal-900/30 py-3 px-4 sm:px-6 lg:px-10 overflow-x-auto no-scrollbar">
          <div className="w-full max-w-[1680px] mx-auto flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400 uppercase tracking-wider text-[11px] font-bold shrink-0 mr-1">
              Popular Corridors:
            </span>
            {TOURISM_DESTINATIONS.map((dest) => (
              <button
                key={dest}
                type="button"
                onClick={() => setSelectedDestination(dest)}
                className={`shrink-0 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                  selectedDestination === dest
                    ? 'bg-teal-600 text-white font-extrabold shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-500'
                }`}
              >
                {dest}
              </button>
            ))}
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
                placeholder="Search lodge, pool, safari, Nyanga, Kariba..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-10 pr-9 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white dark:focus:bg-slate-900 transition-colors"
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
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                {TOURISM_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                {TOURISM_DESTINATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                {CLEAN_PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>

              {(searchQuery || selectedCategory !== 'All Categories' || selectedDestination !== 'All Destinations' || selectedProvince !== 'All Provinces') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All Categories');
                    setSelectedDestination('All Destinations');
                    setSelectedProvince('All Provinces');
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

        {/* Results Grid */}
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 pt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Featured Zimbabwean Lodges, BnBs &amp; Hotels
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing {filteredListings.length} verified retreats matching your itinerary
              </p>
            </div>
          </div>

          {filteredListings.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900/50">
              <Compass className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No matching lodges or stays found
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
                Try widening your search terms or resetting destination filters to explore more stays across Zimbabwe.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Categories');
                  setSelectedDestination('All Destinations');
                  setSelectedProvince('All Provinces');
                }}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Image Cover */}
                  <div className="relative h-60 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-slate-900/90 text-white backdrop-blur-md border border-white/20">
                          {item.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-600/90 text-white shadow-xs backdrop-blur-md border border-white/20">
                          {item.destinationArea}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded-full text-[11px] font-black shadow-sm">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{item.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Bottom Price in Cover */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
                      <div>
                        <span className="text-2xl font-black text-teal-400">
                          USD ${item.pricePerNightUSD.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-300 ml-1 font-medium">/ night</span>
                      </div>
                      <span className="text-xs font-bold text-amber-300">
                        ~ZiG {(item.pricePerNightUSD * 26.5).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{item.city}, {item.province}</span>
                      </div>

                      <h3
                        onClick={() => setSelectedListing(item)}
                        className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-teal-600 transition-colors cursor-pointer"
                      >
                        {item.name}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Key Specs */}
                    <div className="flex flex-wrap items-center gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                      {item.guestsCapacity !== undefined && (
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md font-semibold">
                          <Users className="h-3.5 w-3.5 text-slate-500" />
                          <span>Up to {item.guestsCapacity} Guests</span>
                        </span>
                      )}
                      {item.bedrooms !== undefined && (
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md font-semibold">
                          <Bed className="h-3.5 w-3.5 text-slate-500" />
                          <span>{item.bedrooms} Bed{item.bedrooms > 1 ? 's' : ''}</span>
                        </span>
                      )}
                    </div>

                    {/* Amenities Snippet */}
                    <div className="flex flex-wrap gap-1.5">
                      {item.amenities.slice(0, 3).map((amenity, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/40"
                        >
                          ✓ {amenity}
                        </span>
                      ))}
                    </div>

                    {/* Host & Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="text-[11px]">
                        <div className="font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                          {item.hostName}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-[10px]">
                          {item.hostType}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedListing(item)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          View
                        </button>
                        <a
                          href={`https://wa.me/${item.whatsapp}?text=${encodeURIComponent(
                            `Hello, I saw your listing for "${item.name}" in ${item.destinationArea} on Sadza Connect. I'd like to check room availability and rates.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-transform active:scale-95 shadow-sm"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>WhatsApp Desk</span>
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

      {/* Listing Details Modal */}
      {selectedListing && (
        <Modal
          isOpen={Boolean(selectedListing)}
          onClose={() => setSelectedListing(null)}
          title={selectedListing.name}
        >
          <PublicModalBody>
            <div className="space-y-5">
              <div className="relative h-64 w-full rounded-xl overflow-hidden bg-slate-900">
                <Image
                  src={selectedListing.images[0]}
                  alt={selectedListing.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {selectedListing.category}
                </div>
                <div className="absolute top-3 right-3 bg-teal-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
                  {selectedListing.destinationArea}
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
                    USD ${selectedListing.pricePerNightUSD.toLocaleString()}
                    <span className="text-xs text-slate-500 font-normal ml-1">/ night</span>
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                    Official ZiG Rate: ~{(selectedListing.pricePerNightUSD * 26.5).toLocaleString()} ZiG
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 justify-end">
                    <MapPin className="h-3.5 w-3.5 text-teal-600" />
                    <span>{selectedListing.city}, {selectedListing.province}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">{selectedListing.addressOrLocation}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  About this Lodge / Stay
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedListing.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Featured Amenities &amp; Activities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedListing.amenities.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs font-medium text-slate-800 dark:text-slate-200"
                    >
                      <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedListing.hostName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {selectedListing.hostType} • Verified Sadza Desk
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedListing.phone}`}
                    className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors"
                    title="Direct Phone Call"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                  <a
                    href={`https://wa.me/${selectedListing.whatsapp}?text=${encodeURIComponent(
                      `Hello, I would like to book / inquire about "${selectedListing.name}" in ${selectedListing.destinationArea} on Sadza Connect.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition-transform active:scale-95"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp Booking Desk</span>
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
          title="List a Lodge, BnB, Hotel or Holiday Stay"
        >
          <PublicModalBody>
            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="mx-auto h-12 w-12 text-teal-600 animate-bounce" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Listing Published Successfully!
                </h3>
                <p className="text-xs text-slate-500">
                  Your retreat is now live in the Zimbabwe Tourism &amp; Hospitality Directory.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateTourism} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lodge / Stay Name *
                  </label>
                  <Input
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Zambezi Sunset Safari Lodge"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hospitality Category *
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                    >
                      {TOURISM_CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Destination Corridor *
                    </label>
                    <select
                      value={newDestination}
                      onChange={(e) => setNewDestination(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                    >
                      {TOURISM_DESTINATIONS.filter((d) => d !== 'All Destinations').map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
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
                      placeholder="e.g. Victoria Falls"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Price per Night (USD) *
                    </label>
                    <Input
                      required
                      type="number"
                      value={newPricePerNight}
                      onChange={(e) => setNewPricePerNight(e.target.value)}
                      placeholder="e.g. 150"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Guest Capacity
                    </label>
                    <Input
                      type="number"
                      value={newGuests}
                      onChange={(e) => setNewGuests(e.target.value)}
                      placeholder="e.g. 4"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Bedrooms
                    </label>
                    <Input
                      type="number"
                      value={newBedrooms}
                      onChange={(e) => setNewBedrooms(e.target.value)}
                      placeholder="e.g. 2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Amenities (comma separated)
                  </label>
                  <Input
                    value={newAmenities}
                    onChange={(e) => setNewAmenities(e.target.value)}
                    placeholder="Swimming Pool, Solar Power, Game Drives, Fibre Wi-Fi, Breakfast"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description &amp; Highlights
                  </label>
                  <textarea
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe views, wildlife, proximity to attractions, dining..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Operator / Host Name *
                    </label>
                    <Input
                      required
                      value={newHostName}
                      onChange={(e) => setNewHostName(e.target.value)}
                      placeholder="e.g. Matobo Safaris or Mrs. Moyo"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      WhatsApp Booking Number *
                    </label>
                    <Input
                      required
                      value={newWhatsapp}
                      onChange={(e) => setNewWhatsapp(e.target.value)}
                      placeholder="e.g. 263772123456"
                    />
                  </div>
                </div>

                {/* Photo Upload from Device */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Lodge / Stay Photo Upload
                  </label>
                  <div className="flex items-center gap-3">
                    {tourismImageUpload ? (
                      <div className="relative h-20 w-32 rounded-xl overflow-hidden border-2 border-teal-500 shadow-sm shrink-0">
                        <img src={tourismImageUpload} alt="Stay Preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setTourismImageUpload('')}
                          title="Remove photo"
                          className="absolute top-1 right-1 bg-black/75 hover:bg-black rounded-full p-1 text-white cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => tourismFileInputRef.current?.click()}
                        className="h-20 w-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 flex flex-col items-center justify-center text-slate-400 hover:text-teal-500 cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800 shrink-0"
                      >
                        <Camera className="h-5 w-5 mb-1" />
                        <span className="text-[10px] font-bold">Select Photo</span>
                      </div>
                    )}
                    <div className="flex-1 space-y-1.5">
                      <input
                        ref={tourismFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleTourismImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => tourismFileInputRef.current?.click()}
                        className="text-xs"
                      >
                        <Upload className="h-3.5 w-3.5 mr-1" /> {tourismImageUpload ? 'Change Photo' : 'Upload Photo from Device'}
                      </Button>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        PNG, JPG, or WebP up to 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl cursor-pointer"
                  >
                    Publish Tourism Listing
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
