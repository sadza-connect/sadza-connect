import { AnnouncementBar } from '@/components/landing/AnnouncementBar';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { CategoryGrid } from '@/components/landing/CategoryGrid';
import { SplitMapDirectory } from '@/components/landing/SplitMapDirectory';
import { FeaturedBusinesses } from '@/components/landing/FeaturedBusinesses';
import { MarketplaceJobsPreview } from '@/components/landing/MarketplaceJobsPreview';
import { BillPaySection } from '@/components/landing/BillPaySection';
import { AiAssistantSection } from '@/components/landing/AiAssistantSection';
import { ProvincialHubsSection } from '@/components/landing/ProvincialHubsSection';
import { TrustSafetySection } from '@/components/landing/TrustSafetySection';
import { MobileAppBanner } from '@/components/landing/MobileAppBanner';
import { Footer } from '@/components/landing/Footer';
import { StarfieldCanvas } from '@/components/animations/StarfieldCanvas';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-slate-50/70 dark:bg-[#07090e]/80 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 overflow-x-clip">
      {/* Interactive Celestial Starfield Background (Stars all over the place) */}
      <StarfieldCanvas className="z-0 opacity-70 dark:opacity-90" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1">
          <Hero />
          <CategoryGrid />
          <SplitMapDirectory />
          <FeaturedBusinesses />
          <MarketplaceJobsPreview />
          <BillPaySection />
          <AiAssistantSection />
          <ProvincialHubsSection />
          <TrustSafetySection />
          <MobileAppBanner />
        </main>
        <Footer />
      </div>
    </div>
  );
}
