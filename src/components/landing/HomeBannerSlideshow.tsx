'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
  Building2,
  Briefcase,
  Store,
  Sparkles,
} from 'lucide-react';

export interface BannerSlide {
  id: string;
  image: string;
  title: string;
  tagline: string;
  ctaText: string;
  href: string;
  badge: string;
  badgeIcon: React.ElementType;
}

export const HOME_BANNERS: BannerSlide[] = [
  {
    id: 'marketplace',
    image: '/banners/banner-marketplace.png',
    title: 'Everything You Need, in One Place',
    tagline: 'Discover products, compare options and connect directly with suppliers',
    ctaText: 'Explore Marketplace',
    href: '/marketplace',
    badge: 'Commercial Marketplace',
    badgeIcon: ShoppingBag,
  },
  {
    id: 'businesses',
    image: '/banners/banner-businesses.png',
    title: 'Find trusted businesses across Zimbabwe',
    tagline: 'Discover verified services, products, jobs and opportunities near you',
    ctaText: 'Explore Directory',
    href: '/businesses',
    badge: 'Verified Directory',
    badgeIcon: Building2,
  },
  {
    id: 'jobs-tenders',
    image: '/banners/banner-jobs-mobile.png',
    title: 'Jobs & Tenders. New Opportunities.',
    tagline: 'Discover vacancies, procurement notices and business opportunities across Zimbabwe',
    ctaText: 'Explore Opportunities',
    href: '/jobs',
    badge: 'Jobs & Tenders',
    badgeIcon: Briefcase,
  },
  {
    id: 'careers',
    image: '/banners/banner-jobs-desk.png',
    title: 'Your Next Opportunity Starts Here',
    tagline: 'Discover job vacancies, tenders and business opportunities across Zimbabwe',
    ctaText: 'Browse Vacancies',
    href: '/jobs',
    badge: 'Careers & Procurement',
    badgeIcon: Sparkles,
  },
  {
    id: 'seller-tips',
    image: '/banners/banner-seller-tips.png',
    title: 'Sell Smarter. Grow Faster.',
    tagline: 'Simple tips to showcase your products and reach more customers with a 30-day free grace period',
    ctaText: 'List Your Business',
    href: '/onboarding/business',
    badge: 'Merchant Growth',
    badgeIcon: Store,
  },
];

interface HomeBannerSlideshowProps {
  className?: string;
  autoPlayInterval?: number;
}

export function HomeBannerSlideshow({
  className = '',
  autoPlayInterval = 5000,
}: HomeBannerSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const totalSlides = HOME_BANNERS.length;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Auto-play timer
  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isHovered, autoPlayInterval, goToNext]);

  // Touch swipe support for mobile & tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      goToNext();
    } else if (diff < -45) {
      goToPrev();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm bg-slate-950 group select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Zimbabwe Commercial Highlights Carousel"
    >
      {/* Aspect Ratio Container: perfectly balanced so height stays at ~450px while width expands */}
      <div className="relative aspect-[16/9] sm:aspect-[2/1] md:aspect-[2.2/1] lg:aspect-[2.45/1] xl:aspect-[2.55/1] w-full overflow-hidden">
        {/* Slides Track */}
        <div
          className="flex h-full w-full transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {HOME_BANNERS.map((banner, index) => {
            return (
              <div
                key={banner.id}
                className="relative h-full w-full shrink-0 overflow-hidden"
              >
                <Link
                  href={banner.href}
                  className="block relative h-full w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  aria-label={`${banner.title} - ${banner.ctaText}`}
                >
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1500px"
                    className="object-cover object-center group-hover:scale-[1.01] transition-transform duration-700 ease-out"
                  />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Previous Button (<) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg transition-all duration-200 opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Next Button (>) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg transition-all duration-200 opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Top-Right Slide Counter Pill */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 pointer-events-none">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md text-white/90 text-[10px] sm:text-[11px] font-mono font-bold border border-white/15">
            {currentIndex + 1} / {totalSlides}
          </span>
        </div>

        {/* Bottom-Center Pagination Indicators (Dots / Pills) */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/10">
          {HOME_BANNERS.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === index
                  ? 'w-6 sm:w-7 bg-emerald-500 shadow-xs ring-1 ring-white/60'
                  : 'w-2 sm:w-2.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}: ${banner.title}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
