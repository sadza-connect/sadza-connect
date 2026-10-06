'use client';

import { useState } from 'react';
import { Briefcase, Trash2, Search } from 'lucide-react';
import { SAMPLE_JOBS, JobOpening } from '@/lib/data/zimbabwe';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobOpening[]>(SAMPLE_JOBS);
  const [search, setSearch] = useState('');

  const handleDelete = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink-950 dark:text-white">
          Jobs Board Moderation
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1">
          Review open vacancies, ensure legitimate Zimbabwean employer contacts, and remove expired postings.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search job title or employer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="text-xs text-ink-500">
          Active Vacancies: <span className="font-bold text-ink-900 dark:text-white">{jobs.length}</span>
        </div>
      </div>

      <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ink-50 dark:bg-ink-950/70 border-b border-ink-100 dark:border-ink-800 text-ink-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Position Title</th>
                <th className="px-6 py-4">Employer</th>
                <th className="px-6 py-4">Province</th>
                <th className="px-6 py-4">Salary Range</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {filtered.map((job) => (
                <tr key={job.id} className="hover:bg-ink-50/50 dark:hover:bg-ink-950/50">
                  <td className="px-6 py-4 font-bold text-ink-950 dark:text-white">
                    {job.title}
                  </td>
                  <td className="px-6 py-4 text-ink-600 dark:text-ink-300">
                    {job.company}
                  </td>
                  <td className="px-6 py-4 text-ink-600 dark:text-ink-300">
                    {job.province}
                  </td>
                  <td className="px-6 py-4 font-bold text-brand-700 dark:text-brand-400">
                    {job.salaryUsd}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      {job.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(job.id)}
                      className="p-1.5 rounded-lg text-ruby-600 hover:bg-ruby-50 dark:hover:bg-ruby-950/50 transition-colors"
                      title="Remove job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
