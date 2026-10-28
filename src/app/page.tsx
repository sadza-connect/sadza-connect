import { AnnouncementBar } from '@/components/landing/AnnouncementBar';
import { Navbar } from '@/components/landing/Navbar';
import { HomeBannerSlideshow } from '@/components/landing/HomeBannerSlideshow';
import { Hero } from '@/components/landing/Hero';
import { CommercialPortalWorkspace } from '@/components/landing/CommercialPortalWorkspace';
import { Footer } from '@/components/landing/Footer';
import { StarfieldCanvas } from '@/components/animations/StarfieldCanvas';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-slate-50/70 dark:bg-[#07090e]/80 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 overflow-x-clip">
      {/* Interactive Celestial Starfield Background */}
      <StarfieldCanvas className="z-0 opacity-70 dark:opacity-90" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1">
          {/* 1. SLIDESHOW COMES FIRST IMMEDIATELY AFTER NAVBAR BEFORE ANY OTHER DESIGN OR TEXT */}
          <section
            aria-label="Homepage Featured Banners Slideshow"
            className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-1"
          >
            <HomeBannerSlideshow />
          </section>

          <Hero />
          <CommercialPortalWorkspace />
        </main>
        <Footer />
      </div>
    </div>
  );
}
