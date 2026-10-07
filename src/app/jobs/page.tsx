'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Search,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  CheckCircle2,
  Send,
  Upload,
  X,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/Button';
import { SAMPLE_JOBS, JobOpening, ZIMBABWE_PROVINCES } from '@/lib/data/zimbabwe';
import { createJobInquiryLink } from '@/lib/utils/whatsapp';

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [applyingJob, setApplyingJob] = useState<JobOpening | null>(null);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');

  const filteredJobs = SAMPLE_JOBS.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProvince =
      selectedProvince === 'All' || job.province.includes(selectedProvince);

    const matchesType = selectedType === 'All' || job.type === selectedType;

    return matchesSearch && matchesProvince && matchesType;
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplicationSuccess(true);
    setTimeout(() => {
      setApplicationSuccess(false);
      setApplyingJob(null);
      setApplicantName('');
      setApplicantPhone('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-ink-950 text-ink-950 dark:text-ink-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="container-x">
          {/* Header */}
          <div className="max-w-3xl mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 mb-3">
              <Briefcase className="w-3.5 h-3.5 text-gold-500" />
              Careers & Opportunities
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-950 dark:text-white">
              Zimbabwe Jobs Portal
            </h1>
            <p className="mt-2 text-base text-ink-600 dark:text-ink-300">
              Browse vacancies from verified enterprises across engineering, hospitality, agriculture, culinary arts, and professional services.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 mb-8 space-y-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="relative md:col-span-6">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="text"
                  placeholder="Search job title, solar engineer, chef, agronomist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-ink-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="relative md:col-span-3">
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-ink-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="All">All Provinces</option>
                  {ZIMBABWE_PROVINCES.map((p) => (
                    <option key={p.id} value={p.name.split(' ')[0]}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative md:col-span-3">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-950 text-ink-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="All">All Employment Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Apprenticeship">Apprenticeship</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-ink-500 pt-2 border-t border-ink-200 dark:border-ink-800">
              Showing <span className="font-bold text-ink-900 dark:text-white">{filteredJobs.length}</span> open position{filteredJobs.length === 1 ? '' : 's'}
            </div>
          </div>

          {/* Job Listings List */}
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-sm hover:border-brand-500 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      {job.type}
                    </span>
                    <span className="text-xs text-ink-400">• Posted {job.postedDate}</span>
                  </div>

                  <h2 className="text-xl font-bold text-ink-950 dark:text-white">
                    {job.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-ink-600 dark:text-ink-300">
                    <span className="flex items-center gap-1 font-semibold text-ink-900 dark:text-white">
                      <Building2 className="w-4 h-4 text-brand-600" />
                      {job.company}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-ink-400" />
                      {job.city}, {job.province}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-brand-700 dark:text-brand-400">
                      {job.salaryUsd}
                    </span>
                  </div>

                  <p className="text-sm text-ink-600 dark:text-ink-300 max-w-2xl line-clamp-2">
                    {job.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setApplyingJob(job)}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition-colors"
                  >
                    Quick Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Application Modal */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-ink-100 dark:border-ink-800">
              <div>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase">
                  Job Application
                </span>
                <h3 className="text-lg font-bold text-ink-950 dark:text-white">
                  {applyingJob.title}
                </h3>
                <p className="text-xs text-ink-500">{applyingJob.company}</p>
              </div>
              <button
                type="button"
                onClick={() => setApplyingJob(null)}
                className="p-1 rounded-lg text-ink-400 hover:text-ink-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applicationSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-brand-600 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-ink-950 dark:text-white">
                  Application Submitted!
                </h4>
                <p className="text-xs text-ink-600 dark:text-ink-300">
                  Your profile and simulated CV have been dispatched directly to {applyingJob.company}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tinashe Moyo"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1">
                    WhatsApp Phone Number (+263)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+263 77 123 4567"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1">
                    Upload Curriculum Vitae (PDF / Word)
                  </label>
                  <div className="border-2 border-dashed border-ink-200 dark:border-ink-700 rounded-2xl p-4 text-center hover:border-brand-500 cursor-pointer">
                    <Upload className="w-6 h-6 text-brand-600 mx-auto mb-1" />
                    <span className="text-xs font-medium text-ink-600 dark:text-ink-300">
                      Click to attach CV or drag & drop file (max 5MB)
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Application</span>
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
