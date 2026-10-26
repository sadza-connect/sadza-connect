'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Briefcase,
  ShoppingBag,
  ArrowRight,
  Clock,
  MapPin,
  Tag,
  MessageCircle,
  CheckCircle2,
  UploadCloud,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { sanitizePhoneNumber } from '@/lib/utils/whatsapp';

const LATEST_JOBS = [
  {
    id: 'j1',
    title: 'Solar Technical Sales Engineer',
    company: 'Midlands Solar & Power',
    location: 'Harare & Gweru',
    type: 'Full-Time',
    salary: 'USD $800 - $1,200 /mo',
    posted: '2 hours ago',
    category: 'Renewable Energy',
  },
  {
    id: 'j2',
    title: 'Senior Farm Agronomist',
    company: 'Mazowe Citrus & Agro',
    location: 'Mashonaland Central',
    type: 'Contract',
    salary: 'USD $1,000 - $1,500 /mo',
    posted: '5 hours ago',
    category: 'Agriculture',
  },
  {
    id: 'j3',
    title: 'Front Desk Hospitality Supervisor',
    company: 'Victoria Falls Safari Lodge',
    location: 'Victoria Falls',
    type: 'Full-Time',
    salary: 'USD $650 - $900 /mo',
    posted: '1 day ago',
    category: 'Hospitality',
  },
];

const MARKETPLACE_ITEMS = [
  {
    id: 'm1',
    title: '5kVA Growatt Hybrid Solar Inverter (48V)',
    seller: 'Africdominion Energy Ltd',
    priceUSD: 495,
    priceZiG: 13115,
    condition: 'Brand New',
    location: 'Gweru & Harare',
    image: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=400&q=80',
    whatsapp: '263773333444',
  },
  {
    id: 'm2',
    title: 'Fertilizer Compound D (50kg Bags - Bulk Stock)',
    seller: 'Kwekwe Agri-Chemicals',
    priceUSD: 36,
    priceZiG: 954,
    condition: 'Fresh Seed Stock',
    location: 'Midlands',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=400&q=80',
    whatsapp: '263775666777',
  },
  {
    id: 'm3',
    title: 'Lenovo ThinkPad Core i7 (16GB RAM / 512GB SSD)',
    seller: 'First Choice Tech Zimbabwe',
    priceUSD: 320,
    priceZiG: 8480,
    condition: 'Refurbished Grade A',
    location: 'Harare CBD',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80',
    whatsapp: '263772111222',
  },
];

export function MarketplaceJobsPreview() {
  const [selectedJob, setSelectedJob] = useState<(typeof LATEST_JOBS)[0] | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setAppliedSuccess(true);
    }, 1000);
  };

  const closeApplyModal = () => {
    setSelectedJob(null);
    setAppliedSuccess(false);
    setApplicantName('');
    setApplicantEmail('');
    setApplicantPhone('');
  };

  return (
    <section id="marketplace" className="py-20 bg-white dark:bg-ink-950 transition-colors">
      <div className="container-x">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <SectionHeading
            eyebrow="Marketplace & Opportunities"
            title="Trade Products & Discover Career Openings"
            description="Buy and sell directly with Zimbabwean merchants or find verified career vacancies."
          />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-500 dark:text-ink-400">
              Dual Pricing in USD & ZiG
            </span>
          </div>
        </div>

        {/* 2-Column Split: Marketplace on Left, Jobs on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Column 1: Marketplace Deals (Col Span 6) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between border-b border-ink-100 dark:border-ink-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                <h3 className="font-display text-lg font-bold text-ink-950 dark:text-white">
                  Trending Marketplace Items
                </h3>
              </div>
              <Link
                href="/marketplace"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Browse Marketplace (1,800+) →
              </Link>
            </div>

            <div className="space-y-4">
              {MARKETPLACE_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-4 shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-hover-dark transition-all duration-200"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-800">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-ink-100 dark:bg-ink-800 px-2 py-0.5 text-[10px] font-bold text-ink-700 dark:text-ink-300">
                        {item.condition}
                      </span>
                      <span className="text-xs text-ink-500 dark:text-ink-400">
                        {item.location}
                      </span>
                    </div>

                    <h4 className="font-display text-sm font-bold text-ink-950 dark:text-white mt-1 truncate">
                      {item.title}
                    </h4>

                    <p className="text-xs text-ink-500 dark:text-ink-400">
                      Seller: <strong className="text-ink-700 dark:text-ink-300">{item.seller}</strong>
                    </p>

                    {/* Dual Price Lockup */}
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-display text-base font-extrabold text-brand-600 dark:text-brand-400">
                        USD ${item.priceUSD}
                      </span>
                      <span className="text-xs font-semibold text-ink-500 dark:text-ink-400">
                        / {item.priceZiG.toLocaleString()} ZiG
                      </span>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${sanitizePhoneNumber(item.whatsapp)}?text=Hi,%20I'm%20interested%20in%20your%20listing:%20${encodeURIComponent(item.title)}%20on%20Sadza%20Connect`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Zimbabwe Jobs Board (Col Span 6) */}
          <div id="jobs" className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between border-b border-ink-100 dark:border-ink-800 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-gold-600 dark:text-gold-400" />
                <h3 className="font-display text-lg font-bold text-ink-950 dark:text-white">
                  Latest Zimbabwe Vacancies
                </h3>
              </div>
              <Link
                href="/jobs"
                className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline"
              >
                Browse All Jobs (1,420+) →
              </Link>
            </div>

            <div className="space-y-4">
              {LATEST_JOBS.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5 shadow-card dark:shadow-card-dark hover:border-gold-500/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-md bg-gold-50 dark:bg-gold-950/60 text-gold-800 dark:text-gold-300 px-2 py-0.5 text-[10px] font-bold border border-gold-200 dark:border-gold-800">
                        {job.category}
                      </span>
                      <h4 className="font-display text-base font-bold text-ink-950 dark:text-white mt-1.5">
                        {job.title}
                      </h4>
                      <p className="text-xs font-semibold text-ink-700 dark:text-ink-300">
                        {job.company}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full whitespace-nowrap">
                      {job.type}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-ink-500 dark:text-ink-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5 text-gold-500" />
                      {job.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-ink-400" />
                      {job.posted}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-ink-100 dark:border-ink-800 flex items-center justify-between">
                    <span className="text-xs text-ink-400">CV / Resume required</span>
                    <button
                      type="button"
                      onClick={() => setSelectedJob(job)}
                      className="rounded-xl bg-ink-950 dark:bg-white text-white dark:text-ink-950 px-4 py-1.5 text-xs font-bold hover:bg-brand-600 dark:hover:bg-brand-500 dark:hover:text-white transition-colors"
                    >
                      Quick Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Apply Interactive Modal */}
      {selectedJob && (
        <Modal
          isOpen={!!selectedJob}
          onClose={closeApplyModal}
          title={`Apply for ${selectedJob.title}`}
          description={`Submit your credentials directly to ${selectedJob.company} (${selectedJob.location})`}
        >
          {appliedSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="font-display text-lg font-bold text-ink-950 dark:text-white">
                Application Successfully Dispatched!
              </h4>
              <p className="text-xs text-ink-600 dark:text-ink-300 max-w-sm mx-auto">
                Your profile and CV have been forwarded to {selectedJob.company}&rsquo;s hiring desk.
                A confirmation has been sent to your WhatsApp.
              </p>
              <Button variant="primary" size="md" onClick={closeApplyModal} className="mt-2">
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4">
              <Input
                label="Full Name"
                required
                placeholder="e.g. Nyasha Chigumba"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="nyasha@example.co.zw"
                value={applicantEmail}
                onChange={(e) => setApplicantEmail(e.target.value)}
              />
              <Input
                label="WhatsApp Phone Number"
                type="tel"
                required
                placeholder="+263 77 123 4567"
                value={applicantPhone}
                onChange={(e) => setApplicantPhone(e.target.value)}
              />

              {/* Upload CV simulated area */}
              <div className="rounded-xl border border-dashed border-ink-300 dark:border-ink-700 p-4 text-center bg-ink-50/50 dark:bg-ink-800/40">
                <UploadCloud className="mx-auto h-6 w-6 text-brand-600 dark:text-brand-400" />
                <p className="mt-1 text-xs font-semibold text-ink-800 dark:text-ink-200">
                  Attach PDF Curriculum Vitae (Max 5MB)
                </p>
                <p className="text-[11px] text-ink-500">CV will be reviewed by verified employer</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button variant="outline" size="md" onClick={closeApplyModal} type="button">
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" loading={isSubmitting}>
                  Submit Application
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </section>
  );
}
