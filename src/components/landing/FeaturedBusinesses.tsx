import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, MessageCircle, Phone, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { sanitizePhoneNumber } from '@/lib/utils/whatsapp';

const FEATURED_BUSINESSES = [
  {
    id: '1',
    name: "Gava's Traditional Restaurant",
    category: 'Restaurants & Dining',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    address: 'Belgravia Sports Club, Harare',
    city: 'Harare',
    rating: 4.9,
    reviews: 218,
    phone: '+263772111222',
    whatsapp: '263772111222',
    description: 'Renowned for fresh sadza rezviyo, crispy road runner chicken, oxtail, and fresh traditional greens.',
    tier: 'CR14 Corporate',
    openNow: true,
  },
  {
    id: '2',
    name: 'Midlands Solar & Power Systems',
    category: 'Solar & Renewable',
    image: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80',
    address: '54 Robert Mugabe Way, Gweru',
    city: 'Gweru',
    rating: 4.8,
    reviews: 94,
    phone: '+263773333444',
    whatsapp: '263773333444',
    description: 'Certified Deye & Growatt hybrid inverters, Tier-1 solar panels, and solar borehole installations.',
    tier: 'CR14 Corporate',
    openNow: true,
  },
  {
    id: '3',
    name: 'Victoria Falls Safari Eco-Lodge',
    category: 'Hotels & Tourism',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    address: 'Stand 471 Squire Cummings Ave, Victoria Falls',
    city: 'Victoria Falls',
    rating: 5.0,
    reviews: 412,
    phone: '+263832843211',
    whatsapp: '263774555666',
    description: 'Unmatched sunset views over the Zambezi National Park waterhole with luxury eco-chalets.',
    tier: 'CR14 Corporate',
    openNow: true,
  },
  {
    id: '4',
    name: 'Batanai Building Supplies & Hardware',
    category: 'Hardware & Timber',
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
    address: 'Kelvin North Industrial Area, Bulawayo',
    city: 'Bulawayo',
    rating: 4.7,
    reviews: 83,
    phone: '+263775666777',
    whatsapp: '263775666777',
    description: 'Direct distributors for PPC Cement, Chromadek roofing sheets, structural timber, and brick force.',
    tier: 'CR14 Corporate',
    openNow: true,
  },
];

export function FeaturedBusinesses() {
  return (
    <section id="businesses" className="py-20 bg-ink-50/50 dark:bg-ink-900/30 border-b border-ink-200 dark:border-ink-800/80 transition-colors">
      <div className="container-x">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <SectionHeading
            eyebrow="Trust & Verification"
            title="Featured Verified Zimbabwean Enterprises"
            description="Every featured business holds verified registration documents and community ratings."
          />
          <Link
            href="#directory"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors group"
          >
            <span>Explore All 5,200+ Businesses</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_BUSINESSES.map((b) => (
            <div
              key={b.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-hover-dark transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image & Badges */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-100 dark:bg-ink-800">
                <Image
                  src={b.image}
                  alt={b.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="rounded-lg bg-white/95 dark:bg-ink-950/90 px-2 py-0.5 text-[10px] font-bold text-ink-900 dark:text-white shadow-sm">
                    {b.city}
                  </span>
                  <span className="rounded-lg bg-emerald-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified</span>
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    {b.category}
                  </span>

                  <h3 className="font-display text-base font-bold text-ink-950 dark:text-white mt-1 leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {b.name}
                  </h3>

                  <p className="mt-1 flex items-center gap-1 text-xs text-ink-500 dark:text-ink-400">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-600 dark:text-brand-400" />
                    <span className="truncate">{b.address}</span>
                  </p>

                  <p className="mt-3 text-xs text-ink-600 dark:text-ink-300 line-clamp-2 leading-relaxed">
                    {b.description}
                  </p>
                </div>

                {/* Rating & Actions */}
                <div className="mt-5 pt-4 border-t border-ink-100 dark:border-ink-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-xs font-bold text-ink-900 dark:text-white">
                    <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                    <span>{b.rating.toFixed(1)}</span>
                    <span className="text-ink-400 font-normal">({b.reviews})</span>
                  </div>

                  <a
                    href={`https://wa.me/${sanitizePhoneNumber(b.whatsapp)}?text=Hi,%20I'm%20contacting%20${encodeURIComponent(b.name)}%20via%20Sadza%20Connect`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
