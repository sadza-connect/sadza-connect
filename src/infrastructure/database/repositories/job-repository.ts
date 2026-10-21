import { getDb } from '../connection.js';
import { NotFoundError } from '../../../shared/errors/index.js';

export interface JobRow {
  id: string;
  business_id: string;
  company_name: string;
  title: string;
  slug: string;
  province: string;
  city: string | null;
  job_type: string;
  salary_usd: string | null;
  category: string | null;
  whatsapp: string | null;
  description: string;
  requirements: any;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined from businesses
  business_slug?: string;
  business_logo?: string;
}

export interface JobFilterOptions {
  search?: string;
  category?: string;
  province?: string;
  jobType?: string;
  businessId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateJobDTO {
  business_id: string;
  company_name: string;
  title: string;
  slug?: string;
  province: string;
  city?: string | null;
  job_type?: string;
  salary_usd?: string | null;
  category?: string | null;
  whatsapp?: string | null;
  description: string;
  requirements?: string[];
  is_featured?: boolean;
  is_active?: boolean;
}

export interface UpdateJobDTO {
  title?: string;
  slug?: string;
  province?: string;
  city?: string | null;
  job_type?: string;
  salary_usd?: string | null;
  category?: string | null;
  whatsapp?: string | null;
  description?: string;
  requirements?: string[];
  is_featured?: boolean;
  is_active?: boolean;
}

export interface JobApplicationRow {
  id: string;
  job_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  experience_summary: string | null;
  cv_file_name: string | null;
  cv_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  // Joined from jobs & businesses
  job_title?: string;
  company_name?: string;
  job_province?: string;
  business_id?: string;
}

export interface CreateJobApplicationDTO {
  job_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  experience_summary?: string | null;
  cv_file_name?: string | null;
  cv_url?: string | null;
}

export class JobRepository {
  private generateSlug(title: string, company: string): string {
    const raw = `${title}-${company}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `${raw}-${Date.now().toString().slice(-4)}`;
  }

  async findJobs(filters: JobFilterOptions = {}): Promise<{
    jobs: JobRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = getDb();
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 20));
    const offset = (page - 1) * limit;

    let query = db('jobs')
      .leftJoin('businesses', 'jobs.business_id', 'businesses.id')
      .select('jobs.*', 'businesses.slug as business_slug', 'businesses.logo_url as business_logo');

    if (filters.isActive !== undefined) {
      query = query.where('jobs.is_active', filters.isActive);
    }

    if (filters.isFeatured !== undefined) {
      query = query.where('jobs.is_featured', filters.isFeatured);
    }

    if (filters.businessId) {
      query = query.where('jobs.business_id', filters.businessId);
    }

    if (filters.province && filters.province !== 'All' && filters.province !== 'All Provinces') {
      query = query.whereRaw('LOWER(jobs.province) = LOWER(?)', [filters.province]);
    }

    if (filters.category && filters.category !== 'All' && filters.category !== 'All Sectors' && filters.category !== 'All Commercial Sectors') {
      query = query.whereRaw('LOWER(jobs.category) = LOWER(?)', [filters.category]);
    }

    if (filters.jobType && filters.jobType !== 'All' && filters.jobType !== 'All Types') {
      query = query.whereRaw('LOWER(jobs.job_type) = LOWER(?)', [filters.jobType]);
    }

    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      query = query.where((q) => {
        q.whereILike('jobs.title', term)
          .orWhereILike('jobs.company_name', term)
          .orWhereILike('jobs.description', term)
          .orWhereILike('jobs.category', term);
      });
    }

    const countResult = await query
      .clone()
      .clearSelect()
      .count('jobs.id as total')
      .first();

    const total = countResult ? parseInt(String(countResult.total), 10) : 0;

    const jobs: JobRow[] = await query
      .orderBy([
        { column: 'jobs.is_featured', order: 'desc' },
        { column: 'jobs.created_at', order: 'desc' },
      ])
      .limit(limit)
      .offset(offset);

    return {
      jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findBySlug(slug: string): Promise<JobRow | null> {
    const db = getDb();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    let query = db('jobs')
      .leftJoin('businesses', 'jobs.business_id', 'businesses.id')
      .select('jobs.*', 'businesses.slug as business_slug', 'businesses.logo_url as business_logo');

    if (isUuid) {
      query = query.where((q) => q.where('jobs.slug', slug).orWhere('jobs.id', slug));
    } else {
      query = query.where('jobs.slug', slug);
    }

    const job = await query.first();
    return job || null;
  }

  async findById(id: string): Promise<JobRow | null> {
    const db = getDb();
    const job = await db('jobs')
      .leftJoin('businesses', 'jobs.business_id', 'businesses.id')
      .select('jobs.*', 'businesses.slug as business_slug', 'businesses.logo_url as business_logo')
      .where('jobs.id', id)
      .first();
    return job || null;
  }

  async create(data: CreateJobDTO): Promise<JobRow> {
    const db = getDb();
    const slug = data.slug || this.generateSlug(data.title, data.company_name);

    const insertData: any = {
      business_id: data.business_id,
      company_name: data.company_name,
      title: data.title,
      slug,
      province: data.province,
      city: data.city || data.province,
      job_type: data.job_type || 'Full-time',
      salary_usd: data.salary_usd || 'Negotiable USD',
      category: data.category || 'General Commercial',
      whatsapp: data.whatsapp || null,
      description: data.description,
      requirements: JSON.stringify(data.requirements || []),
      is_featured: data.is_featured ?? false,
      is_active: data.is_active ?? true,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    };

    const [created] = await db('jobs').insert(insertData).returning('*');
    return created;
  }

  async update(id: string, data: UpdateJobDTO): Promise<JobRow> {
    const db = getDb();
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError(`Job opening '${id}' was not found`);
    }

    const updateData: any = {
      updated_at: db.fn.now(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.province !== undefined) updateData.province = data.province;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.job_type !== undefined) updateData.job_type = data.job_type;
    if (data.salary_usd !== undefined) updateData.salary_usd = data.salary_usd;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.requirements !== undefined) updateData.requirements = JSON.stringify(data.requirements);
    if (data.is_featured !== undefined) updateData.is_featured = data.is_featured;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    const [updated] = await db('jobs')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb();
    const count = await db('jobs').where('id', id).del();
    return count > 0;
  }

  // Application methods
  async createApplication(data: CreateJobApplicationDTO): Promise<JobApplicationRow> {
    const db = getDb();
    const insertData: any = {
      job_id: data.job_id,
      applicant_name: data.applicant_name,
      applicant_email: data.applicant_email,
      applicant_phone: data.applicant_phone,
      experience_summary: data.experience_summary || null,
      cv_file_name: data.cv_file_name || null,
      cv_url: data.cv_url || null,
      status: 'Submitted',
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    };

    const [created] = await db('job_applications').insert(insertData).returning('*');
    return created;
  }

  async findApplications(filters: {
    jobId?: string;
    businessId?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    applications: JobApplicationRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = getDb();
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 20));
    const offset = (page - 1) * limit;

    let query = db('job_applications')
      .join('jobs', 'job_applications.job_id', 'jobs.id')
      .select(
        'job_applications.*',
        'jobs.title as job_title',
        'jobs.company_name as company_name',
        'jobs.province as job_province',
        'jobs.business_id as business_id'
      );

    if (filters.jobId) {
      query = query.where('job_applications.job_id', filters.jobId);
    }

    if (filters.businessId) {
      query = query.where('jobs.business_id', filters.businessId);
    }

    if (filters.status && filters.status !== 'all') {
      query = query.where('job_applications.status', filters.status);
    }

    const countResult = await query
      .clone()
      .clearSelect()
      .count('job_applications.id as total')
      .first();

    const total = countResult ? parseInt(String(countResult.total), 10) : 0;

    const applications: JobApplicationRow[] = await query
      .orderBy('job_applications.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async updateApplicationStatus(id: string, status: string): Promise<JobApplicationRow> {
    const db = getDb();
    const [updated] = await db('job_applications')
      .where('id', id)
      .update({
        status,
        updated_at: db.fn.now(),
      })
      .returning('*');

    if (!updated) {
      throw new NotFoundError(`Job application '${id}' was not found`);
    }

    return updated;
  }

  async findApplicationById(id: string): Promise<JobApplicationRow | null> {
    const db = getDb();
    const app = await db('job_applications')
      .join('jobs', 'job_applications.job_id', 'jobs.id')
      .select(
        'job_applications.*',
        'jobs.title as job_title',
        'jobs.company_name as company_name',
        'jobs.province as job_province',
        'jobs.business_id as business_id'
      )
      .where('job_applications.id', id)
      .first();
    return app || null;
  }
}

export const jobRepository = new JobRepository();
