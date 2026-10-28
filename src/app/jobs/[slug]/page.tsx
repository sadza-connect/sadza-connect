'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import {
  Briefcase,
  MapPin,
  Building2,
  DollarSign,
  Clock,
  Calendar,
  Share2,
  CheckCircle2,
  Upload,
  ChevronRight,
  ShieldCheck,
  MessageCircle,
  Phone,
  ArrowLeft,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { SAMPLE_JOBS, JobOpening } from '@/lib/data/zimbabwe';
import {
  getStoredJobApplications,
  saveStoredJobApplications,
  JobApplicationRecord,
} from '@/data/platformStore';
import { mapDbJobToOpening } from '@/lib/data/job-mapper';
import { createJobInquiryLink } from '@/lib/utils/whatsapp';
import { Modal, PublicModalBody, PublicModalFooter } from '@/components/ui/Modal';
import { useToast } from '@/components/providers/ToastProvider';

export default function JobDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || '';
  const { toast } = useToast();

  const [allJobs, setAllJobs] = useState<JobOpening[]>(SAMPLE_JOBS);
  const [copiedLink, setCopiedLink] = useState(false);

  // Application Modal state
  const [applyOpen, setApplyOpen] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [cvFileName, setCvFileName] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadJobData() {

      // Fetch specific job
      try {
        const res = await fetch(`/api/v1/jobs/${encodeURIComponent(slug)}`);
        const json = await res.json();
        if (isMounted && json.success && json.data?.job) {
          const mapped = mapDbJobToOpening(json.data.job);
          setAllJobs((prev) => {
            const exists = prev.some((j) => j.id === mapped.id || j.slug === mapped.slug);
            return exists
              ? prev.map((j) => (j.id === mapped.id || j.slug === mapped.slug ? mapped : j))
              : [mapped, ...prev];
          });
        }
      } catch {}

      // Fetch similar jobs
      try {
        const listRes = await fetch('/api/v1/jobs?limit=20');
        const listJson = await listRes.json();
        if (isMounted && listJson.success && Array.isArray(listJson.data?.jobs)) {
          const listMapped = listJson.data.jobs.map(mapDbJobToOpening);
          setAllJobs((prev) => {
            const combined = [...prev];
            for (const item of listMapped) {
              if (!combined.some((j) => j.id === item.id)) {
                combined.push(item);
              }
            }
            return combined;
          });
        }
      } catch {}
    }

    if (slug) {
      loadJobData();
    }
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const job = useMemo(() => {
    return allJobs.find((j) => j.slug === slug || j.id === slug);
  }, [allJobs, slug]);

  const similarJobs = useMemo(() => {
    if (!job) return [];
    return allJobs
      .filter((j) => j.id !== job.id && (j.province === job.province || j.category === job.category))
      .slice(0, 3);
  }, [allJobs, job]);

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <Briefcase className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Job Vacancy Not Found
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            The job opening you are looking for may have been filled or expired.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/jobs"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors"
            >
              Browse All Jobs
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleCopyShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast({ title: 'Job link copied to clipboard', variant: 'info' });
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantEmail.trim() || !applicantPhone.trim()) {
      toast({ title: 'Please fill in all required fields', variant: 'error' });
      return;
    }

    try {
      await fetch(`/api/v1/jobs/${encodeURIComponent(job.slug)}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_name: applicantName.trim(),
          applicant_email: applicantEmail.trim(),
          applicant_phone: applicantPhone.trim(),
          experience_summary: experienceSummary.trim() || null,
          cv_file_name: cvFileName || 'Resume_Document.pdf',
        }),
      });
    } catch (err) {
      console.error('Failed to submit application to database:', err);
    }

    const newApplication: JobApplicationRecord = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.company,
      province: job.province,
      applicantName: applicantName.trim(),
      applicantEmail: applicantEmail.trim(),
      applicantPhone: applicantPhone.trim(),
      experienceSummary: experienceSummary.trim(),
      cvFileName: cvFileName || 'Resume_Document.pdf',
      appliedDate: 'Just now',
      status: 'Submitted',
    };

    const currentApps = getStoredJobApplications();
    saveStoredJobApplications([newApplication, ...currentApps]);
    setApplicationSuccess(true);
    toast({ title: 'Application submitted successfully!', variant: 'success' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-emerald-600">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/jobs" className="hover:text-emerald-600">Jobs</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-700 dark:text-slate-300 line-clamp-1">{job.category}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-900 dark:text-white font-medium line-clamp-1">{job.title}</span>
          </nav>

          {/* Job Hero Header Card */}
          <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="space-y-4 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {job.type}
                  </span>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {job.category}
                  </span>
                  <span className="rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified Employer
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {job.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {job.companySlug ? (
                    <Link
                      href={`/businesses/${job.companySlug}`}
                      className="flex items-center gap-2 font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors"
                    >
                      <Building2 className="h-4 w-4 text-emerald-600" />
                      <span>{job.company}</span>
                    </Link>
                  ) : (
                    <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <Building2 className="h-4 w-4 text-emerald-600" />
                      <span>{job.company}</span>
                    </span>
                  )}

                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{job.city ? `${job.city}, ${job.province}` : job.province}</span>
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>Posted {job.postedDate}</span>
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 px-4 py-2.5">
                  <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                      Target Compensation
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                      {job.salaryUsd}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:w-64 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setApplicationSuccess(false);
                    setApplyOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
                >
                  <Briefcase className="h-4 w-4" /> Apply for Position
                </button>

                {job.whatsapp && (
                  <a
                    href={createJobInquiryLink(job.title, job.company, job.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold text-sm hover:bg-emerald-100/60 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp HR
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleCopyShare}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Share Vacancy'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Grid: Job Content vs Employer Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8">
              {/* Description Card */}
              <article className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Job Overview &amp; Responsibilities
                  </h2>
                  <p className="mt-4 text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                {job.requirements && job.requirements.length > 0 && (
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                      Required Qualifications &amp; Core Skills
                    </h3>
                    <ul className="space-y-3">
                      {job.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                    Working Conditions &amp; Location
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <span className="text-slate-400 font-semibold block uppercase text-[11px]">Primary Base</span>
                      <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                        {job.city ? `${job.city}, ${job.province}` : job.province} Province
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <span className="text-slate-400 font-semibold block uppercase text-[11px]">Employment Format</span>
                      <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                        {job.type} On-Site / Field Operations
                      </span>
                    </div>
                  </div>
                </div>

                {/* Candidate Trust & Safety Notice */}
                <div className="rounded-2xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 p-4 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Sadza Connect Recruitment Shield:</strong> Genuine Zimbabwean employers will never request money, interview fees, or upfront processing charges from job seekers. Report suspicious solicitations immediately.
                  </p>
                </div>
              </article>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* About the Employer */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  About the Employer
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {job.company}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Verified commercial provider operating in {job.province}, registered and audited under Sadza Connect business verification.
                </p>

                {job.companySlug ? (
                  <Link
                    href={`/businesses/${job.companySlug}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span>View Company Directory Profile</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" /> Verified Commercial Entity
                  </div>
                )}
              </div>

              {/* Similar Vacancies */}
              {similarJobs.length > 0 && (
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Similar Openings in {job.province}
                  </h4>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {similarJobs.map((sim) => (
                      <Link
                        key={sim.id}
                        href={`/jobs/${sim.slug || sim.id}`}
                        className="py-3.5 block group first:pt-0 last:pb-0"
                      >
                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1">
                          {sim.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {sim.company} • {sim.salaryUsd}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Application Bottom-Sheet Modal */}
      <Modal
        open={applyOpen}
        onClose={() => {
          setApplyOpen(false);
          setApplicationSuccess(false);
        }}
        title={`Apply: ${job.title}`}
        description={`${job.company} • ${job.province} (${job.salaryUsd})`}
      >
        {applicationSuccess ? (
          <div className="flex flex-col flex-1 min-h-0">
            <PublicModalBody>
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Application Dispatched!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                  Your credentials and application have been sent to {job.company} and logged in your candidate records.
                </p>
              </div>
            </PublicModalBody>
            <PublicModalFooter>
              <button
                type="button"
                onClick={() => {
                  setApplyOpen(false);
                  setApplicationSuccess(false);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </PublicModalFooter>
          </div>
        ) : (
          <form onSubmit={handleApply} className="flex flex-col flex-1 min-h-0">
            <PublicModalBody className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tinashe Sibanda"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-base sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@gmail.com"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-base sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp Phone (+263) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+263 77 123 4567"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-base sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Relevant Experience &amp; Qualifications *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Briefly summarize your hands-on experience and certifications..."
                  value={experienceSummary}
                  onChange={(e) => setExperienceSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-base sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attach Curriculum Vitae (PDF / DOCX)
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:border-emerald-500 cursor-pointer">
                  <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {cvFileName || 'Click to select your CV document'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCvFileName(file.name);
                    }}
                  />
                </label>
              </div>
            </PublicModalBody>

            <PublicModalFooter>
              <button
                type="button"
                onClick={() => setApplyOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
              >
                Submit Application
              </button>
            </PublicModalFooter>
          </form>
        )}
      </Modal>

      <Footer />
    </div>
  );
}
