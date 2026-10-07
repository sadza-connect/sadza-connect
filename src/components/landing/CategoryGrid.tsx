import Link from 'next/link';
import {
  Utensils,
  Sun,
  Sprout,
  Compass,
  Briefcase,
  Activity,
  Hammer,
  Car,
  ChevronRight,
} from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';

const CATEGORIES = [
  {
    name: 'Restaurants & Dining',
    description: 'Traditional sadza rezviyo, road runner chicken, grills & cafes',
    count: '420+ Listings',
    icon: Utensils,
    href: '#directory',
  },
  {
    name: 'Solar & Clean Energy',
    description: 'Tier-1 inverters, lithium batteries, solar panels & borehole pumps',
    count: '280+ Listings',
    icon: Sun,
    href: '#directory',
  },
  {
    name: 'Agriculture & Farm Inputs',
    description: 'Certified seeds, Compound D fertilizer, chemicals & equipment',
    count: '530+ Listings',
    icon: Sprout,
    href: '#directory',
  },
  {
    name: 'Hotels & Tourism Lodges',
    description: 'Victoria Falls stays, safari lodges, houseboats & transfers',
    count: '210+ Listings',
    icon: Compass,
    href: '#directory',
  },
  {
    name: 'Hardware & Construction',
    description: 'PPC cement, Chromadek roofing, structural timber & bricks',
    count: '360+ Listings',
    icon: Hammer,
    href: '#directory',
  },
  {
    name: 'Healthcare & Pharmacies',
    description: '24-hour pharmacies, medical clinics, dental care & wellness',
    count: '290+ Listings',
    icon: Activity,
    href: '#directory',
  },
  {
    name: 'Professional & Legal Services',
    description: 'Auditing, ZIMRA tax consultancy, legal advisory & tech support',
    count: '480+ Listings',
    icon: Briefcase,
    href: '#directory',
  },
  {
    name: 'Vehicles & Automotive Spares',
    description: 'Japanese auto spares, mobile mechanics, tires & panel beating',
    count: '340+ Listings',
    icon: Car,
    href: '#directory',
  },
];

export function CategoryGrid() {
  return (
    <section id="categories" className="py-20 bg-slate-50/70 dark:bg-slate-950/60 border-y border-slate-200 dark:border-slate-800 transition-colors">
      <div className="container-x">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <SectionHeading
            eyebrow="Explore Key Sectors"
            title="Browse Zimbabwe's Vital Industries"
            description="Quickly connect with verified service providers and trusted companies across the country."
          />
          <Link
            href="#directory"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group"
          >
            <span>View All 32 Sub-Categories</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 8-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                href={cat.href}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 group-hover:border-emerald-500/40 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all duration-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                      {cat.count}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {cat.name}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <span>Explore listings</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
