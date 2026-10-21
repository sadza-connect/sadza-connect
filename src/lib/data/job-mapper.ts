import type { JobOpening } from './zimbabwe';
import type { JobApplicationRecord } from '@/data/platformStore';

export function mapDbJobToOpening(job: any): JobOpening {
  let reqs: string[] = [];
  try {
    if (typeof job.requirements === 'string') {
      reqs = JSON.parse(job.requirements);
    } else if (Array.isArray(job.requirements)) {
      reqs = job.requirements;
    }
  } catch {
    reqs = [];
  }

  const dateStr = job.created_at
    ? new Date(job.created_at).toLocaleDateString('en-GB')
    : 'Recently Posted';

  return {
    id: String(job.id),
    slug: job.slug,
    title: job.title,
    company: job.company_name || job.business_name || 'Verified Zimbabwean Employer',
    companySlug: job.business_slug || '',
    province: job.province || 'Harare',
    city: job.city || job.province || 'Harare',
    type: (job.job_type as any) || 'Full-time',
    salaryUsd: job.salary_usd || 'Competitive USD',
    postedDate: dateStr,
    category: job.category || 'General Commercial',
    whatsapp: job.whatsapp || undefined,
    description: job.description || '',
    requirements: reqs.length > 0 ? reqs : [
      'Minimum 2 years experience in relevant commercial field',
      'Clean track record and professional references',
      'Valid National ID or Zimbabwean Work Authorization',
    ],
  };
}

export function mapDbApplicationToRecord(app: any): JobApplicationRecord {
  const dateStr = app.created_at
    ? new Date(app.created_at).toLocaleDateString('en-GB')
    : 'Recently Applied';

  return {
    id: String(app.id),
    jobId: String(app.job_id),
    jobTitle: app.job_title || 'Position Vacancy',
    companyName: app.company_name || 'Hiring Enterprise',
    province: app.job_province || 'Harare',
    applicantName: app.applicant_name,
    applicantEmail: app.applicant_email,
    applicantPhone: app.applicant_phone,
    experienceSummary: app.experience_summary || 'No written summary provided.',
    cvFileName: app.cv_file_name || 'Curriculum_Vitae.pdf',
    appliedDate: dateStr,
    status: (app.status as any) || 'Submitted',
  };
}
