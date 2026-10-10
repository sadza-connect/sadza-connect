'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Search,
  MapPin,
  Building2,
  CheckCircle2,
  Upload,
  X,
  Plus,
  RotateCcw,
  MessageCircle,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { SAMPLE_JOBS, JobOpening } from '@/lib/data/zimbabwe';
import { CLEAN_PROVINCES, COMMERCIAL_SECTORS } from '@/data/advertsStore';
import {
  getStoredJobs,
  getStoredJobApplications,
  saveStoredJobApplications,
  JobApplicationRecord,
} from '@/data/platformStore';
import { createJobInquiryLink } from '@/lib/utils/whatsapp';

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobOpening[]>(SAMPLE_JOBS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [selectedType, setSelectedType] = useState('All Types');

  // Application Modal State
  const [applyingJob, setApplyingJob] = useState<JobOpening | null>(null);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [cvFileName, setCvFileName] = useState('');

  useEffect(() => {
    setJobs(getStoredJobs());
    const sync = () => setJobs(getStoredJobs());
    window.addEventListener('sadza-platform-updated', sync);
    return () => window.removeEventListener('sadza-platform-updated', sync);
  }, []);

  const filteredJobs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q);

      const matchesProvince =
        selectedProvince === 'All Provinces' || job.province === selectedProvince;

      const matchesSector =
        selectedSector === 'All Sectors' ||
        job.category.toLowerCase() === selectedSector.toLowerCase();

      const matchesType =
        selectedType === 'All Types' || job.type === selectedType;

      return matchesSearch && matchesProvince && matchesSector && matchesType;
    });
  }, [jobs, searchTerm, selectedProvince, selectedSector, selectedType]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;

    const newApp: JobApplicationRecord = {
      id: `app-${Date.now()}`,
      jobId: applyingJob.id,
      jobTitle: applyingJob.title,
      companyName: applyingJob.company,
      province: applyingJob.province,
      applicantName: applicantName.trim(),
      applicantEmail: applicantEmail.trim() || 'applicant@sadzaconnect.co.zw',
      applicantPhone: applicantPhone.trim(),
      experienceSummary:
        experienceSummary.trim() || 'Qualified candidate applying via Sadza Connect.',
      cvFileName:
        cvFileName ||
        `${applicantName.trim().replace(/\s+/g, '_')}_Curriculum_Vitae.pdf`,
      appliedDate: 'Just now',
      status: 'Submitted',
    };

    const existing = getStoredJobApplications();
    saveStoredJobApplications([newApp, ...existing]);

    setApplicationSuccess(true);
    setTimeout(() => {
      setApplicationSuccess(false);
      setApplyingJob(null);
      setApplicantName('');
      setApplicantEmail('');
      setApplicantPhone('');
      setExperienceSummary('');
      setCvFileName('');
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
                <Briefcase className="w-3.5 h-3.5" />
                <span>National Employment & Vacancies</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Zimbabwe Commercial Jobs Portal
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
                Browse verified job vacancies from active companies, SMEs, and cooperatives across all 10 provinces. Apply online or inquire directly via WhatsApp.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/dashboard/business?tab=jobs"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Post a Job Vacancy</span>
              </Link>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-8 space-y-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              <div className="relative lg:col-span-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search job title, solar engineer, agronomist, chef..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="lg:col-span-3">
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value="All Sectors">All Commercial Sectors (20)</option>
                  {COMMERCIAL_SECTORS.map((sec) => (
                    <option key={sec.name} value={sec.name}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-3">
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-emerald-600"
                >
                  {CLEAN_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value="All Types">All Job Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Apprenticeship">Apprenticeship</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <div>
                Showing{' '}
                <strong className="text-slate-900 dark:text-white">
                  {filteredJobs.length}
                </strong>{' '}
                open position{filteredJobs.length === 1 ? '' : 's'}
              </div>
              {(searchTerm ||
                selectedProvince !== 'All Provinces' ||
                selectedSector !== 'All Sectors' ||
                selectedType !== 'All Types') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedProvince('All Provinces');
                    setSelectedSector('All Sectors');
                    setSelectedType('All Types');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Job Listings List */}
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-emerald-500/70 transition-colors"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {job.type}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {job.category}
                    </span>
                    <span className="text-xs text-slate-500">
                      Posted {job.postedDate}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {job.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {job.companySlug ? (
                      <Link
                        href={`/businesses/${job.companySlug}`}
                        className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white hover:text-emerald-600"
                      >
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span>{job.company}</span>
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span>{job.company}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {job.province}
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {job.salaryUsd}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                    {job.description}
                  </p>

                  {job.requirements && job.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {job.requirements.map((req, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300"
                        >
                          • {req}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                  {job.whatsapp && (
                    <a
                      href={createJobInquiryLink(
                        job.title,
                        job.company,
                        job.whatsapp
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp HR</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setApplyingJob(job)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Application Modal */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                  Direct Job Application
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {applyingJob.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {applyingJob.company} • {applyingJob.province}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setApplyingJob(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applicationSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Application Dispatched!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                  Your application and CV have been sent to {applyingJob.company} and saved to your User Dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4 pt-4">
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Relevant Experience & Qualifications *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Briefly summarize your qualifications and years of experience..."
                    value={experienceSummary}
                    onChange={(e) => setExperienceSummary(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
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

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setApplyingJob(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
