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
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = HOME_BANNERS.length;

  const triggerSlide = useCallback(
    (targetIndex: number, direction: 'next' | 'prev') => {
      if (incomingIndex !== null || targetIndex === currentIndex) return;

      setIncomingIndex(targetIndex);
      setSlideDirection(direction);
      setIsAnimating(false);

      // Force two browser animation frames so initial off-screen transform paints before transitioning
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    },
    [currentIndex, incomingIndex]
  );

  const goToNext = useCallback(() => {
    const nextIdx = (currentIndex + 1) % totalSlides;
    triggerSlide(nextIdx, 'next');
  }, [currentIndex, totalSlides, triggerSlide]);

  const goToPrev = useCallback(() => {
    const prevIdx = (currentIndex - 1 + totalSlides) % totalSlides;
    triggerSlide(prevIdx, 'prev');
  }, [currentIndex, totalSlides, triggerSlide]);

  const goToSlide = (targetIdx: number) => {
    if (targetIdx === currentIndex || incomingIndex !== null) return;
    const direction = targetIdx > currentIndex ? 'next' : 'prev';
    triggerSlide(targetIdx, direction);
  };

  // Complete transition cleanup
  useEffect(() => {
    if (incomingIndex === null || !isAnimating) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setCurrentIndex(incomingIndex);
      setIncomingIndex(null);
      setIsAnimating(false);
    }, 700);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [incomingIndex, isAnimating]);

  // Auto-play timer
  useEffect(() => {
    if (isHovered || incomingIndex !== null) return;

    const timer = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isHovered, incomingIndex, autoPlayInterval, goToNext]);

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

  const currentBanner = HOME_BANNERS[currentIndex];
  const incomingBanner = incomingIndex !== null ? HOME_BANNERS[incomingIndex] : null;

  return (
    <div
      className={`relative w-full overflow-hidden select-none group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Zimbabwe Commercial Highlights Carousel"
    >
      {/* Slides Viewport: Edge-to-edge full width slide track */}
      <div className="relative w-full">
        {/* Outgoing or Static Current Slide */}
        <div
          className={`w-full flex justify-center px-4 sm:px-6 lg:px-8 ${
            incomingIndex !== null
              ? 'transition-transform duration-700 ease-out will-change-transform'
              : ''
          }`}
          style={{
            transform:
              incomingIndex !== null && isAnimating
                ? `translateX(${slideDirection === 'next' ? '-100%' : '100%'})`
                : 'translateX(0%)',
          }}
        >
          <div className="w-full max-w-7xl rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm bg-slate-950 overflow-hidden">
            <div className="relative aspect-[16/9] sm:aspect-[2/1] md:aspect-[2.2/1] lg:aspect-[2.45/1] xl:aspect-[2.55/1] w-full overflow-hidden">
              <Link
                href={currentBanner.href}
                className="block relative h-full w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-label={`${currentBanner.title} - ${currentBanner.ctaText}`}
              >
                <Image
                  src={currentBanner.image}
                  alt={currentBanner.title}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1500px"
                  className="object-cover object-center group-hover:scale-[1.01] transition-transform duration-700 ease-out"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Incoming Slide: Enters from the extreme right/left edge of the page */}
        {incomingBanner !== null && (
          <div
            className="absolute inset-0 w-full flex justify-center px-4 sm:px-6 lg:px-8 transition-transform duration-700 ease-out will-change-transform"
            style={{
              transform: isAnimating
                ? 'translateX(0%)'
                : `translateX(${slideDirection === 'next' ? '100%' : '-100%'})`,
            }}
          >
            <div className="w-full max-w-7xl rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm bg-slate-950 overflow-hidden">
              <div className="relative aspect-[16/9] sm:aspect-[2/1] md:aspect-[2.2/1] lg:aspect-[2.45/1] xl:aspect-[2.55/1] w-full overflow-hidden">
                <Link
                  href={incomingBanner.href}
                  className="block relative h-full w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  aria-label={`${incomingBanner.title} - ${incomingBanner.ctaText}`}
                >
                  <Image
                    src={incomingBanner.image}
                    alt={incomingBanner.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1500px"
                    className="object-cover object-center group-hover:scale-[1.01] transition-transform duration-700 ease-out"
                  />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Controls Overlay: Anchored steadily so controls don't slide away */}
      <div className="pointer-events-none absolute inset-0 z-30">
        <div className="relative w-full max-w-7xl h-full mx-auto px-4 sm:px-6 lg:px-8">
          {/* Previous Button (<) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            className="pointer-events-auto absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg transition-all duration-200 opacity-90 sm:opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
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
            className="pointer-events-auto absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg transition-all duration-200 opacity-90 sm:opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Top-Right Slide Counter Pill */}
          <div className="pointer-events-none absolute top-3 right-6 sm:top-4 sm:right-10 z-10">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md text-white/90 text-[10px] sm:text-[11px] font-mono font-bold border border-white/15">
              {(incomingIndex !== null ? incomingIndex : currentIndex) + 1} / {totalSlides}
            </span>
          </div>

          {/* Bottom-Center Pagination Indicators */}
          <div className="pointer-events-auto absolute bottom-2 sm:bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/10">
            {HOME_BANNERS.map((banner, index) => {
              const active = (incomingIndex !== null ? incomingIndex : currentIndex) === index;
              return (
                <button
                  key={banner.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(index);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    active
                      ? 'w-5 sm:w-6 bg-emerald-500 shadow-xs ring-1 ring-white/60'
                      : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${index + 1}: ${banner.title}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
