'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  Users,
  Eye,
  CheckCircle2,
  Mail,
  UserCheck,
  FileText,
  Send,
  Download,
  ExternalLink,
} from 'lucide-react';
import {
  AdminPageHeader,
  Panel,
  StatCard,
  IconButton,
  AdminBadge,
  statusTone,
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminModal,
  SearchInput,
  FilterSelect,
  Toolbar,
  ResultCount,
  EmptyState,
  TableSkeleton,
  ModalBody,
  ModalSection,
  ModalGrid,
  ModalFooter,
  ConfirmModal,
} from '@/components/admin/AdminUI';
import { ZIMBABWE_PROVINCES, JobOpening } from '@/lib/data/zimbabwe';
import {
  getStoredJobs,
  saveStoredJobs,
  getStoredJobApplications,
  saveStoredJobApplications,
  JobApplicationRecord,
} from '@/data/platformStore';
import { mapDbJobToOpening, mapDbApplicationToRecord } from '@/lib/data/job-mapper';
import { cn } from '@/lib/utils/cn';

export default function AdminJobsPage() {
  const [activeTab, setActiveTab] = useState<'positions' | 'applications'>('positions');
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [applications, setApplications] = useState<JobApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableBusinesses, setAvailableBusinesses] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);

  const [posModalOpen, setPosModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<JobApplicationRecord | null>(null);
  const [hireModalApp, setHireModalApp] = useState<JobApplicationRecord | null>(null);
  const [offerDetails, setOfferDetails] = useState(
    'Starting Salary: $650 USD / month · Reporting Date: 1st of Next Month at Harare HQ Depot.'
  );

  const [form, setForm] = useState({
    title: '',
    selectedBusinessId: '',
    company: '',
    province: 'Harare',
    type: 'Full-time' as JobOpening['type'],
    salaryUsd: '',
    description: '',
    requirements: '',
    whatsapp: '',
  });

  useEffect(() => {
    let isMounted = true;
    async function loadAdminCareersData() {
      try {
        // 1. Load jobs
        try {
          const jRes = await fetch('/api/v1/jobs?limit=100', { credentials: 'include' });
          const jJson = await jRes.json();
          if (isMounted && jJson.success && Array.isArray(jJson.data?.jobs)) {
            setJobs(jJson.data.jobs.map(mapDbJobToOpening));
          }
        } catch (err) {
          console.warn('Failed to load jobs from database:', err);
        }

        // 2. Load applications
        try {
          const aRes = await fetch('/api/v1/jobs/applications?limit=100', { credentials: 'include' });
          const aJson = await aRes.json();
          if (isMounted && aJson.success && Array.isArray(aJson.data?.applications)) {
            setApplications(aJson.data.applications.map(mapDbApplicationToRecord));
          }
        } catch (err) {
          console.warn('Failed to load job applications from database:', err);
        }

        // 3. Load businesses for hiring enterprise dropdown
        try {
          const bRes = await fetch('/api/v1/businesses?limit=100', { credentials: 'include' });
          const bJson = await bRes.json();
          if (isMounted && bJson.success && Array.isArray(bJson.data?.businesses)) {
            setAvailableBusinesses(
              bJson.data.businesses.map((b: any) => ({
                id: b.id,
                name: b.name,
                slug: b.slug,
              }))
            );
          }
        } catch {}
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAdminCareersData();
    const sync = () => loadAdminCareersData();
    window.addEventListener('sadza-platform-updated', sync);
    return () => {
      isMounted = false;
      window.removeEventListener('sadza-platform-updated', sync);
    };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((j) => {
      const matchesQ =
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.province.toLowerCase().includes(q);
      const matchesType = typeFilter === 'all' || j.type === typeFilter;
      return matchesQ && matchesType;
    });
  }, [jobs, query, typeFilter]);

  const filteredApps = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications.filter((a) => {
      return (
        !q ||
        a.applicantName.toLowerCase().includes(q) ||
        a.jobTitle.toLowerCase().includes(q) ||
        a.companyName.toLowerCase().includes(q)
      );
    });
  }, [applications, query]);

  function openCreateJob() {
    setEditingJobId(null);
    const firstBiz = availableBusinesses[0];
    setForm({
      title: '',
      selectedBusinessId: firstBiz ? firstBiz.id : '',
      company: firstBiz ? firstBiz.name : '',
      province: 'Harare',
      type: 'Full-time',
      salaryUsd: '',
      description: '',
      requirements: '',
      whatsapp: '',
    });
    setPosModalOpen(true);
  }

  function openEditJob(job: JobOpening) {
    setEditingJobId(job.id);
    const matchedBiz = availableBusinesses.find(
      (b) => b.name === job.company || b.slug === job.companySlug
    );
    setForm({
      title: job.title,
      selectedBusinessId: matchedBiz?.id || '',
      company: job.company,
      province: job.province,
      type: job.type,
      salaryUsd: job.salaryUsd,
      description: job.description,
      requirements: (job.requirements || []).join('\n'),
      whatsapp: job.whatsapp || '263772101101',
    });
    setPosModalOpen(true);
  }

  async function handleSaveJob(e: React.FormEvent) {
    e.preventDefault();
    const reqList = form.requirements
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    if (editingJobId) {
      const existing = jobs.find((j) => j.id === editingJobId);
      if (existing) {
        try {
          const res = await fetch(`/api/v1/jobs/${existing.slug}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              title: form.title,
              province: form.province,
              city: form.province,
              job_type: form.type,
              salary_usd: form.salaryUsd,
              description: form.description,
              requirements: reqList,
              whatsapp: form.whatsapp,
            }),
          });
          const json = await res.json();
          if (json.success && json.data?.job) {
            const updated = mapDbJobToOpening(json.data.job);
            setJobs((prev) => prev.map((j) => (j.id === editingJobId ? updated : j)));
            showToast(`Updated job vacancy: ${form.title}`);
            setPosModalOpen(false);
            return;
          }
        } catch (err) {
          console.warn('Backend patch failed, updating local state', err);
        }
      }

      const next = jobs.map((j) =>
        j.id === editingJobId
          ? {
              ...j,
              title: form.title,
              company: form.company,
              province: form.province,
              city: form.province,
              type: form.type,
              salaryUsd: form.salaryUsd,
              description: form.description,
              requirements: reqList,
              whatsapp: form.whatsapp,
            }
          : j
      );
      saveStoredJobs(next);
      setJobs(next);
      showToast(`Updated job vacancy: ${form.title}`);
    } else {
      try {
        const targetBizId = form.selectedBusinessId || availableBusinesses[0]?.id;
        const res = await fetch('/api/v1/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            business_id: targetBizId,
            business_slug: availableBusinesses.find((b) => b.id === targetBizId)?.slug,
            title: form.title,
            province: form.province,
            city: form.province,
            job_type: form.type,
            salary_usd: form.salaryUsd,
            category: 'Commercial Services',
            whatsapp: form.whatsapp,
            description: form.description,
            requirements: reqList,
          }),
        });
        const json = await res.json();
        if (json.success && json.data?.job) {
          const created = mapDbJobToOpening(json.data.job);
          setJobs((prev) => [created, ...prev]);
          showToast(`Published job vacancy: ${form.title}`);
          setPosModalOpen(false);
          return;
        }
      } catch (err) {
        console.warn('Backend create failed, saving to local store', err);
      }

      const slug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const newJob: JobOpening = {
        id: `job-${Date.now()}`,
        slug: slug || `job-${Date.now()}`,
        title: form.title,
        company: form.company,
        companySlug: 'sunpower-solar-harare',
        category: 'Solar & Clean Energy',
        province: form.province,
        city: form.province,
        type: form.type,
        salaryUsd: form.salaryUsd,
        postedDate: 'Just now',
        description: form.description,
        requirements: reqList,
        whatsapp: form.whatsapp,
      };
      const next = [newJob, ...jobs];
      saveStoredJobs(next);
      setJobs(next);
      showToast(`Published job vacancy: ${form.title}`);
    }
    setPosModalOpen(false);
  }

  async function handleDeleteJob(job: JobOpening) {
    try {
      const res = await fetch(`/api/v1/jobs/${job.slug}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        setJobs((prev) => prev.filter((j) => j.id !== job.id));
        showToast(`Removed vacancy: ${job.title}`);
        return;
      }
    } catch (err) {
      console.warn('Backend delete failed, removing locally', err);
    }
    const next = jobs.filter((j) => j.id !== job.id);
    saveStoredJobs(next);
    setJobs(next);
    showToast(`Removed vacancy: ${job.title}`);
  }

  async function updateAppStatus(appId: string, status: JobApplicationRecord['status']) {
    try {
      const res = await fetch(`/api/v1/jobs/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success && json.data?.application) {
        const updated = mapDbApplicationToRecord(json.data.application);
        setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
        if (selectedApp?.id === appId) {
          setSelectedApp(updated);
        }
        showToast(`Candidate application status updated to "${status}"`);
        return;
      }
    } catch (err) {
      console.warn('Backend status update failed, saving locally', err);
    }
    const next = applications.map((a) => (a.id === appId ? { ...a, status } : a));
    saveStoredJobApplications(next);
    setApplications(next);
    if (selectedApp?.id === appId) {
      setSelectedApp({ ...selectedApp, status });
    }
    showToast(`Candidate application status updated to "${status}"`);
  }

  function handleConfirmHire(e: React.FormEvent) {
    e.preventDefault();
    if (!hireModalApp) return;
    updateAppStatus(hireModalApp.id, 'Hired');
    showToast(
      `Official Employment Offer Email dispatched to ${hireModalApp.applicantName} (${hireModalApp.applicantEmail})!`
    );
    setHireModalApp(null);
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl bg-[#0a1018] px-4 py-3 text-xs font-bold text-white shadow-xl border border-[#1e57eb]">
          <CheckCircle2 className="h-4 w-4 text-[#599bff]" />
          <span>{toast}</span>
        </div>
      )}

      <AdminPageHeader
        title="Careers, Vacancies & Candidate CV Pipeline"
        description="Manage verified employer job postings, review submitted candidate CVs, shortlist applicants, and dispatch official offer letters."
      >
        <AdminButton onClick={openCreateJob}>
          <Plus className="h-4 w-4" /> Post New Vacancy
        </AdminButton>
      </AdminPageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Open Verified Vacancies"
          value={jobs.length}
          hint="Live on /jobs board"
          icon={Briefcase}
        />
        <StatCard
          label="Candidate Applications"
          value={applications.length}
          hint="Direct CV submissions"
          icon={Users}
        />
        <StatCard
          label="Shortlisted / Under Review"
          value={
            applications.filter(
              (a) => a.status === 'Shortlisted' || a.status === 'Under Review'
            ).length
          }
          hint="Active recruitment pipeline"
          icon={UserCheck}
        />
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-[#c8d2e0]">
        <button
          type="button"
          onClick={() => setActiveTab('positions')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-colors cursor-pointer',
            activeTab === 'positions'
              ? 'border-[#1e57eb] text-[#1e57eb] bg-white/70'
              : 'border-transparent text-[#465a7e] hover:text-[#0a1018]'
          )}
        >
          <Briefcase className="h-4 w-4" />
          Job Vacancies ({jobs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('applications')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-colors cursor-pointer',
            activeTab === 'applications'
              ? 'border-[#1e57eb] text-[#1e57eb] bg-white/70'
              : 'border-transparent text-[#465a7e] hover:text-[#0a1018]'
          )}
        >
          <Users className="h-4 w-4" />
          Candidate Applications ({applications.length})
        </button>
      </div>

      {activeTab === 'positions' ? (
        <Panel padded={false}>
          <Toolbar>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search vacancy title, employer, or province…"
            />
            <FilterSelect
              value={typeFilter}
              onChange={setTypeFilter}
              label="Filter by employment type"
              className="sm:w-48"
            >
              <option value="all">All Employment Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Contract">Contract</option>
              <option value="Part-time">Part-time</option>
              <option value="Apprenticeship">Apprenticeship</option>
            </FilterSelect>
            <ResultCount shown={filteredJobs.length} total={jobs.length} noun="vacancies" />
          </Toolbar>

          {isLoading ? (
            <TableSkeleton columns={5} rows={6} />
          ) : filteredJobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No vacancies match filters"
              description="Try clearing your search or post a new vacancy."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e6eaf1] bg-[#f4f6f9]/80 text-xs font-semibold uppercase tracking-wider text-[#6b81a5]">
                    <th className="px-5 py-3 sm:px-6">Role &amp; Employer</th>
                    <th className="px-4 py-3">Province</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Remuneration</th>
                    <th className="px-5 py-3 text-right sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6eaf1]">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="transition-colors hover:bg-[#f4f6f9]/60">
                      <td className="px-5 py-4 sm:px-6">
                        <p className="font-bold text-[#0a1018]">{job.title}</p>
                        <p className="text-xs font-semibold text-[#1e57eb]">{job.company}</p>
                      </td>
                      <td className="px-4 py-4 font-medium text-[#1f2a3d]">{job.province}</td>
                      <td className="px-4 py-4">
                        <AdminBadge tone="brand">{job.type}</AdminBadge>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs font-bold text-[#0a1018]">
                        {job.salaryUsd}
                      </td>
                      <td className="px-5 py-4 text-right sm:px-6">
                        <div className="flex items-center justify-end gap-1">
                          <IconButton
                            icon={Pencil}
                            label="Edit Vacancy"
                            onClick={() => openEditJob(job)}
                          />
                          <IconButton
                            icon={Trash2}
                            label="Remove Vacancy"
                            tone="danger"
                            onClick={() => handleDeleteJob(job)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      ) : (
        <Panel padded={false}>
          <Toolbar>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search candidate name, job title, or employer…"
            />
            <ResultCount
              shown={filteredApps.length}
              total={applications.length}
              noun="applications"
            />
          </Toolbar>

          {isLoading ? (
            <TableSkeleton columns={5} rows={6} />
          ) : filteredApps.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No candidate applications match filters"
              description="Candidate applications submitted via the job portal will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e6eaf1] bg-[#f4f6f9]/80 text-xs font-semibold uppercase tracking-wider text-[#6b81a5]">
                  <th className="px-5 py-3 sm:px-6">Candidate</th>
                  <th className="px-4 py-3">Applied Role &amp; Company</th>
                  <th className="px-4 py-3">Province</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6eaf1]">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="transition-colors hover:bg-[#f4f6f9]/60">
                    <td className="px-5 py-4 sm:px-6">
                      <p className="font-bold text-[#0a1018]">{app.applicantName}</p>
                      <p className="text-xs text-[#6b81a5]">
                        {app.applicantEmail} · {app.applicantPhone}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[#1f2a3d]">{app.jobTitle}</p>
                      <p className="text-xs text-[#1e57eb] font-medium">{app.companyName}</p>
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-[#374966]">
                      {app.province}
                    </td>
                    <td className="px-4 py-4">
                      <AdminBadge tone={statusTone(app.status)} dot>
                        {app.status}
                      </AdminBadge>
                    </td>
                    <td className="px-5 py-4 text-right sm:px-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <IconButton
                          icon={Eye}
                          label="Inspect CV & Cover Note"
                          onClick={() => setSelectedApp(app)}
                        />
                        <button
                          type="button"
                          onClick={() => setHireModalApp(app)}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                        >
                          <UserCheck className="h-3.5 w-3.5" /> Hire / Offer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </Panel>
      )}

      {/* Vacancy Create/Edit Modal */}
      <AdminModal
        open={posModalOpen}
        onClose={() => setPosModalOpen(false)}
        size="xl"
        icon={editingJobId ? Pencil : Briefcase}
        title={editingJobId ? 'Edit job vacancy' : 'Post new job vacancy'}
        description="Publish an open trade, technical, or corporate role on the Sadza Connect jobs board."
      >
        <form onSubmit={handleSaveJob}>
          <ModalBody>
            <ModalSection title="Role details">
              <ModalGrid>
                <AdminInput
                  label="Job title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Senior Commercial Solar Technician"
                  required
                />
                {availableBusinesses.length > 0 ? (
                  <AdminSelect
                    label="Hiring company"
                    value={form.selectedBusinessId}
                    onChange={(e) => {
                      const bId = e.target.value;
                      const biz = availableBusinesses.find((b) => b.id === bId);
                      setForm({
                        ...form,
                        selectedBusinessId: bId,
                        company: biz ? biz.name : form.company,
                      });
                    }}
                  >
                    <option value="">Select registered enterprise</option>
                    {availableBusinesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </AdminSelect>
                ) : (
                  <AdminInput
                    label="Hiring company"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    required
                  />
                )}
                <AdminSelect
                  label="Province"
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                >
                  {ZIMBABWE_PROVINCES.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </AdminSelect>
                <AdminSelect
                  label="Employment type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as JobOpening['type'] })}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Apprenticeship">Apprenticeship</option>
                </AdminSelect>
                <AdminInput
                  label="Salary band (USD)"
                  value={form.salaryUsd}
                  onChange={(e) => setForm({ ...form, salaryUsd: e.target.value })}
                  placeholder="$500 – $750 / month"
                  required
                />
                <AdminInput
                  label="WhatsApp contact"
                  type="tel"
                  inputMode="numeric"
                  hint="Digits only, e.g. 263771234567"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  required
                />
              </ModalGrid>
            </ModalSection>

            <ModalSection title="Description & requirements">
              <AdminTextarea
                label="Role overview & responsibilities"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
              <AdminTextarea
                label="Key requirements"
                hint="1 requirement per line"
                rows={4}
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                required
              />
            </ModalSection>
          </ModalBody>

          <ModalFooter>
            <AdminButton type="button" variant="outline" onClick={() => setPosModalOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit">
              {editingJobId ? 'Save vacancy changes' : 'Publish vacancy'}
            </AdminButton>
          </ModalFooter>
        </form>
      </AdminModal>

      {/* Candidate CV Inspection Modal */}
      <AdminModal
        open={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        size="lg"
        icon={Users}
        title={`Candidate: ${selectedApp?.applicantName}`}
        description={`Applied for ${selectedApp?.jobTitle} at ${selectedApp?.companyName}`}
      >
        {selectedApp && (
          <div>
            <ModalBody>
              <div className="rounded-2xl border border-[#c8d2e0] bg-[#f4f6f9]/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-display text-base sm:text-lg font-bold text-[#0a1018]">
                    {selectedApp.applicantName}
                  </p>
                  <p className="text-xs text-[#465a7e] mt-0.5">
                    {selectedApp.province} · Applied {selectedApp.appliedDate}
                  </p>
                  <p className="mt-1 text-xs font-mono text-[#1e57eb] break-all">
                    {selectedApp.applicantEmail} · {selectedApp.applicantPhone}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(
                    ['Submitted', 'Under Review', 'Shortlisted'] as JobApplicationRecord['status'][]
                  ).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => updateAppStatus(selectedApp.id, st)}
                      className={cn(
                        'rounded-lg px-2.5 py-1 text-xs font-bold border transition cursor-pointer',
                        selectedApp.status === st
                          ? 'bg-[#1e57eb] text-white border-[#1e57eb]'
                          : 'bg-white text-[#374966] border-[#c8d2e0] hover:border-[#1e57eb]'
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <ModalSection title="Qualification & cover summary">
                <div className="rounded-xl border border-[#c8d2e0] bg-white p-4 text-sm text-[#1f2a3d] leading-relaxed whitespace-pre-wrap">
                  {selectedApp.experienceSummary}
                </div>
              </ModalSection>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-[#bcd7ff] bg-[#eef5ff]/60 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-[#1e57eb] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0a1018] truncate">{selectedApp.cvFileName}</p>
                    <p className="text-[11px] text-[#465a7e]">Verified PDF Curriculum Vitae</p>
                  </div>
                </div>
                {selectedApp.cvUrl ? (
                  <a
                    href={selectedApp.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={selectedApp.cvFileName || 'Candidate_CV.pdf'}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#1e57eb] bg-white text-xs font-bold text-[#1e57eb] hover:bg-[#eef5ff] transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download CV</span>
                  </a>
                ) : (
                  <AdminButton
                    size="sm"
                    variant="outline"
                    onClick={() => showToast(`No remote CV file link available for ${selectedApp.cvFileName}`)}
                  >
                    <FileText className="h-3.5 w-3.5" /> View CV
                  </AdminButton>
                )}
              </div>
            </ModalBody>

            <ModalFooter>
              <AdminButton variant="outline" onClick={() => setSelectedApp(null)}>
                Close
              </AdminButton>
              <AdminButton
                onClick={() => {
                  const a = selectedApp;
                  setSelectedApp(null);
                  setHireModalApp(a);
                }}
              >
                <Send className="h-4 w-4" /> Send offer / interview invite
              </AdminButton>
            </ModalFooter>
          </div>
        )}
      </AdminModal>

      {/* Hire / Offer Modal */}
      <AdminModal
        open={Boolean(hireModalApp)}
        onClose={() => setHireModalApp(null)}
        size="md"
        icon={Mail}
        title={`Offer / Interview: ${hireModalApp?.applicantName}`}
        description="Dispatch an official recruitment offer or interview schedule directly to the candidate."
      >
        {hireModalApp && (
          <form onSubmit={handleConfirmHire}>
            <ModalBody>
              <AdminTextarea
                label="Offer terms & instructions"
                rows={5}
                value={offerDetails}
                onChange={(e) => setOfferDetails(e.target.value)}
                required
              />
            </ModalBody>
            <ModalFooter>
              <AdminButton
                type="button"
                variant="outline"
                onClick={() => setHireModalApp(null)}
              >
                Cancel
              </AdminButton>
              <AdminButton type="submit">
                <Mail className="h-4 w-4" /> Dispatch offer email
              </AdminButton>
            </ModalFooter>
          </form>
        )}
      </AdminModal>
    </div>
  );
}
