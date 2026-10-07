import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MapPin,
  ShieldCheck,
  Star,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Share2,
  ArrowLeft,
  Building2,
  Calendar,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/Button';
import { SAMPLE_BUSINESSES } from '@/lib/data/zimbabwe';
import { createBusinessInquiryLink } from '@/lib/utils/whatsapp';

interface Props {
  params: {
    slug: string;
  };
}

export default function BusinessProfilePage({ params }: Props) {
  const business = SAMPLE_BUSINESSES.find((b) => b.slug === params.slug);

  if (!business) {
    notFound();
  }

  const whatsappLink = createBusinessInquiryLink(business.name, business.whatsapp);

  return (
    <div className="min-h-screen bg-white dark:bg-ink-950 text-ink-950 dark:text-ink-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="container-x">
          {/* Back breadcrumb */}
          <div className="mb-6">
            <Link
              href="/businesses"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-brand-600 dark:hover:text-brand-400"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Directory</span>
            </Link>
          </div>

          {/* Profile Header Card */}
          <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 sm:p-8 shadow-sm mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    {business.categoryName}
                  </span>
                  {business.cr14Verified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                      CR14 Certified Corporate
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                      Artisan Verified
                    </span>
                  )}
                  {business.zimraVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      ZIMRA Tax Compliant
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-950 dark:text-white">
                  {business.name}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-ink-600 dark:text-ink-300">
                  <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    {business.rating} ({business.reviewCount} reviews)
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-brand-600" />
                    {business.address}, {business.province}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-ink-400" />
                    {business.openingHours}
                  </span>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
                <a
                  href={`tel:${business.phone}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-ink-800 dark:text-ink-100 font-bold text-sm hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
                >
                  <Phone className="w-4 h-4 text-brand-600" />
                  <span>Call Business</span>
                </a>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: About & Services */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-ink-950 dark:text-white mb-4">
                  About {business.name}
                </h2>
                <p className="text-sm sm:text-base text-ink-600 dark:text-ink-300 leading-relaxed">
                  {business.description}
                </p>

                <h3 className="text-base font-bold text-ink-900 dark:text-white mt-6 mb-3">
                  Services & Specialties
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {business.services.map((service, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-3 rounded-xl bg-ink-50 dark:bg-ink-950/70 border border-ink-100 dark:border-ink-800/80 text-xs sm:text-sm font-semibold text-ink-800 dark:text-ink-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-2 pt-6 border-t border-ink-100 dark:border-ink-800/60">
                  {business.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-ink-100 dark:bg-ink-800 text-xs font-medium text-ink-700 dark:text-ink-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Contact & Verification Details */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6">
                <h3 className="text-lg font-bold text-ink-950 dark:text-white mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3.5 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-ink-900 dark:text-white">Physical Address</div>
                      <div className="text-ink-600 dark:text-ink-300">{business.address}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-ink-900 dark:text-white">Direct Phone</div>
                      <a href={`tel:${business.phone}`} className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                        {business.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-ink-900 dark:text-white">Email</div>
                      <a href={`mailto:${business.email}`} className="text-ink-600 dark:text-ink-300 hover:underline">
                        {business.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-ink-900 dark:text-white">Operating Hours</div>
                      <div className="text-ink-600 dark:text-ink-300">{business.openingHours}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* KYC Trust Guarantee Badge */}
              <div className="rounded-3xl border border-brand-200 dark:border-brand-900/60 bg-brand-50/50 dark:bg-brand-950/30 p-6">
                <div className="flex items-center gap-2 mb-2 text-brand-800 dark:text-brand-300 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-brand-600" />
                  <span>Trust & Safety Verification</span>
                </div>
                <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                  This enterprise has passed official identity and business licensing verification on the Sadza Connect platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
