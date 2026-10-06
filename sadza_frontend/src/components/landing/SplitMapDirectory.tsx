'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Star,
  MapPin,
  MessageCircle,
  Phone,
  Navigation,
  Eye,
  Check,
  Layers,
  ExternalLink,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface BusinessItem {
  id: number;
  name: string;
  category: string;
  city: string;
  image: string;
  address: string;
  rating: number;
  reviews: number;
  specialty: string;
  whatsapp: string;
  phone: string;
  lat: number;
  lng: number;
  tier: 'CR14 Corporate' | 'Artisan Verified';
  status: 'Open Now' | 'Closes 6PM';
  mapX: number; // percentage coordinates for visual canvas
  mapY: number;
}

const BUSINESSES: BusinessItem[] = [
  {
    id: 1,
    name: "Gava's Traditional Restaurant",
    category: 'Restaurants & Dining',
    city: 'Harare',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80',
    address: 'Belgravia Sports Club, 2nd St Extension, Harare',
    rating: 4.9,
    reviews: 218,
    specialty: 'Sadza rezviyo, Road runner chicken, Oxtail stew',
    whatsapp: '263772111222',
    phone: '+263 77 211 1222',
    lat: -17.8012,
    lng: 31.0421,
    tier: 'CR14 Corporate',
    status: 'Open Now',
    mapX: 62,
    mapY: 32,
  },
  {
    id: 2,
    name: 'Midlands Solar & Power Systems',
    category: 'Solar & Clean Energy',
    city: 'Midlands',
    image: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=700&q=80',
    address: '54 Robert Mugabe Way, Gweru CBD',
    rating: 4.8,
    reviews: 94,
    specialty: '5kVA Lithium Packages, Borehole solar submersible pumps',
    whatsapp: '263773333444',
    phone: '+263 77 333 3444',
    lat: -19.4522,
    lng: 29.8167,
    tier: 'CR14 Corporate',
    status: 'Open Now',
    mapX: 48,
    mapY: 54,
  },
  {
    id: 3,
    name: 'Victoria Falls Safari Eco-Lodge',
    category: 'Hotels & Tourism',
    city: 'Victoria Falls',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=700&q=80',
    address: 'Stand 471 Squire Cummings Ave, Victoria Falls',
    rating: 5.0,
    reviews: 412,
    specialty: 'Zambezi sunset waterhole chalets, Safari game drives',
    whatsapp: '263774555666',
    phone: '+263 83 284 3211',
    lat: -17.9317,
    lng: 25.8307,
    tier: 'CR14 Corporate',
    status: 'Open Now',
    mapX: 18,
    mapY: 38,
  },
  {
    id: 4,
    name: 'Batanai Building Supplies & Timber',
    category: 'Hardware & Timber',
    city: 'Bulawayo',
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=700&q=80',
    address: 'Kelvin North Industrial Area, Bulawayo',
    rating: 4.7,
    reviews: 83,
    specialty: 'PPC Cement, Chromadek roofing, structural angle iron',
    whatsapp: '263775666777',
    phone: '+263 77 566 6777',
    lat: -20.15,
    lng: 28.5833,
    tier: 'CR14 Corporate',
    status: 'Closes 6PM',
    mapX: 38,
    mapY: 72,
  },
  {
    id: 5,
    name: 'Mazowe Citrus & Agro Supplies',
    category: 'Agriculture & Farm Inputs',
    city: 'Harare',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=700&q=80',
    address: 'Mazowe Valley Junction, Mashonaland Central',
    rating: 4.9,
    reviews: 137,
    specialty: 'Certified seed maize, bulk Compound D fertilizer, irrigation piping',
    whatsapp: '263776777888',
    phone: '+263 77 677 7888',
    lat: -17.5167,
    lng: 30.9833,
    tier: 'CR14 Corporate',
    status: 'Open Now',
    mapX: 64,
    mapY: 24,
  },
];

const CITIES = ['All', 'Harare', 'Bulawayo', 'Midlands', 'Victoria Falls'];

export function SplitMapDirectory() {
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedId, setSelectedId] = useState<number>(1);
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite' | 'terrain'>('street');

  const filteredBusinesses =
    selectedCity === 'All'
      ? BUSINESSES
      : BUSINESSES.filter((b) => b.city === selectedCity);

  const selectedBusiness =
    BUSINESSES.find((b) => b.id === selectedId) || BUSINESSES[0];

  return (
    <section id="directory" className="py-20 bg-white dark:bg-ink-950 transition-colors">
      <div className="container-x">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              <Compass className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
              <span>Interactive Geolocation Directory</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink-950 dark:text-white mt-2">
              Explore Verified Zimbabwean Businesses
            </h2>
          </div>

          {/* City Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setSelectedCity(city);
                  const firstMatch =
                    city === 'All'
                      ? BUSINESSES[0]
                      : BUSINESSES.find((b) => b.city === city);
                  if (firstMatch) setSelectedId(firstMatch.id);
                }}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  selectedCity === city
                    ? 'bg-brand-600 text-white shadow-emerald'
                    : 'bg-ink-100 dark:bg-ink-900 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-800 border border-ink-200 dark:border-ink-800'
                }`}
              >
                {city === 'All' ? 'All Zimbabwe' : city}
              </button>
            ))}
          </div>
        </div>

        {/* Split Grid: Feed (Left) & Interactive Map Canvas (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Scrollable Feed */}
          <div className="lg:col-span-6 space-y-4 max-h-[640px] overflow-y-auto pr-1 sm:pr-2">
            {filteredBusinesses.map((b) => {
              const isSelected = b.id === selectedId;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedId(b.id)}
                  className={`cursor-pointer rounded-2xl border p-4 sm:p-5 transition-all duration-200 flex flex-col sm:flex-row gap-4 ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/20 shadow-card-hover dark:shadow-card-hover-dark ring-2 ring-brand-500/20'
                      : 'border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 hover:border-ink-300 dark:hover:border-ink-700 shadow-card dark:shadow-card-dark'
                  }`}
                >
                  {/* Photo */}
                  <div className="relative h-32 sm:h-auto sm:w-36 shrink-0 overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-800">
                    <Image
                      src={b.image}
                      alt={b.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="rounded-md bg-white/95 dark:bg-ink-950/90 px-1.5 py-0.5 text-[10px] font-bold text-ink-900 dark:text-white shadow-sm">
                        {b.city}
                      </span>
                    </div>
                  </div>

                  {/* Information */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <Badge tone="verified" size="sm">
                          {b.tier}
                        </Badge>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {b.status}
                        </span>
                      </div>

                      <h3 className="font-display text-base font-bold text-ink-950 dark:text-white mt-1.5 leading-snug">
                        {b.name}
                      </h3>

                      <p className="flex items-center gap-1 text-xs text-ink-500 dark:text-ink-400 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                        <span className="truncate">{b.address}</span>
                      </p>

                      <p className="mt-2 text-xs text-ink-600 dark:text-ink-300 line-clamp-2">
                        <strong className="text-ink-900 dark:text-white">Specialty: </strong>
                        {b.specialty}
                      </p>
                    </div>

                    {/* Actions Strip */}
                    <div className="mt-4 pt-3 border-t border-ink-100 dark:border-ink-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-xs font-bold text-ink-900 dark:text-white">
                        <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                        <span>{b.rating.toFixed(1)}</span>
                        <span className="text-ink-400 font-normal">({b.reviews})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${b.whatsapp}?text=Hi%20${encodeURIComponent(b.name)},%20I%20found%20your%20business%20on%20Sadza%20Connect`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={`tel:${b.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 p-1.5 text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-700"
                          title="Call business"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Interactive Simulated OpenStreetMap Canvas */}
          <div className="lg:col-span-6 sticky top-24 rounded-3xl border border-ink-200 dark:border-ink-800 bg-ink-950 text-white overflow-hidden shadow-2xl">
            {/* Map Top Bar */}
            <div className="flex items-center justify-between border-b border-ink-800 bg-ink-900/90 px-4 py-3 backdrop-blur">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-ink-300">
                  {selectedBusiness.lat.toFixed(4)}° S, {selectedBusiness.lng.toFixed(4)}° E
                </span>
              </div>

              {/* Map Layer Switcher */}
              <div className="flex items-center gap-1 text-[11px] font-semibold bg-ink-950 p-1 rounded-lg border border-ink-800">
                {(['street', 'satellite', 'terrain'] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setMapStyle(style)}
                    className={`capitalize px-2.5 py-1 rounded-md transition-all ${
                      mapStyle === style
                        ? 'bg-brand-600 text-white'
                        : 'text-ink-400 hover:text-white'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Map Visual Simulation Area */}
            <div className="relative h-[480px] w-full bg-[#182338] overflow-hidden select-none">
              {/* Simulated Map Topography / Roads */}
              <svg className="absolute inset-0 h-full w-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                {/* Major Zimbabwean Highways (A1, A3, A5 Harare-Bulawayo, A9) */}
                <path d="M 0,200 Q 150,180 300,160 T 600,240" fill="none" stroke="#60a5fa" strokeWidth="3" />
                <path d="M 120,0 Q 200,250 240,500" fill="none" stroke="#facc15" strokeWidth="2.5" />
                <path d="M 350,50 Q 300,280 400,500" fill="none" stroke="#4ade80" strokeWidth="2" />
                <path d="M 0,350 Q 250,300 500,450" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
                {/* Secondary grid lines */}
                <circle cx="280" cy="180" r="140" fill="none" stroke="#334155" strokeWidth="1" />
                <circle cx="280" cy="180" r="60" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
              </svg>

              {/* Waterway / Zambezi Representation */}
              <div className="absolute top-0 left-0 w-full h-14 bg-blue-500/10 border-b border-blue-400/20 backdrop-blur-[1px]">
                <span className="absolute top-2 left-4 text-[10px] font-mono tracking-widest uppercase text-blue-300/60">
                  Zambezi Basin · Zimbabwe Northern Border
                </span>
              </div>

              {/* Interactive Location Marker Pins */}
              {filteredBusinesses.map((b) => {
                const isActive = b.id === selectedId;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedId(b.id)}
                    style={{ left: `${b.mapX}%`, top: `${b.mapY}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-300 hover:scale-125 z-20 group"
                  >
                    {isActive ? (
                      <div className="relative">
                        <div className="absolute -inset-2 rounded-full bg-brand-500/30 animate-ping" />
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white shadow-emerald border-2 border-white ring-4 ring-brand-500/40">
                          <MapPin className="h-5 w-5 fill-white text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-gold-400 border-2 border-gold-400/80 shadow-md">
                        <MapPin className="h-4 w-4" />
                      </div>
                    )}

                    {/* Tooltip on Hover */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap rounded-lg bg-ink-950 px-2 py-1 text-[11px] font-bold text-white shadow-xl border border-ink-800">
                      {b.name}
                    </div>
                  </div>
                );
              })}

              {/* Active Business Float Card on Bottom of Map */}
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-ink-900/95 border border-ink-700 p-4 shadow-2xl backdrop-blur-md z-30">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                        {selectedBusiness.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white truncate mt-0.5">
                      {selectedBusiness.name}
                    </h4>
                    <p className="text-xs text-ink-300 truncate">{selectedBusiness.address}</p>
                  </div>

                  <a
                    href={`https://wa.me/${selectedBusiness.whatsapp}?text=Hi,%20I'm%20viewing%20${encodeURIComponent(selectedBusiness.name)}%20on%20Sadza%20Connect`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-emerald hover:bg-brand-500 transition-colors flex items-center gap-1.5"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Map Footer Information */}
            <div className="flex items-center justify-between bg-ink-900 px-4 py-2.5 text-xs text-ink-400 border-t border-ink-800">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
                <span>OpenStreetMap Geolocation Verified</span>
              </span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedBusiness.lat},${selectedBusiness.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-brand-400 hover:text-white transition-colors"
              >
                <span>Open GPS Directions</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
