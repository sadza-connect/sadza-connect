import { getDb } from '../connection.js';
import { InternalError, NotFoundError } from '../../../shared/errors/index.js';

export interface BusinessRow {
  id: string;
  user_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  province: string;
  city: string | null;
  address: string | null;
  sector: string | null;
  business_type: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  website: string | null;
  logo_url: string | null;
  cover_url: string | null;
  gallery: any;
  operating_hours: any;
  is_verified: boolean;
  verification_status: string;
  is_featured: boolean;
  rating_avg: number | string;
  reviews_count: number;
  views_count: number;
  whatsapp_clicks: number;
  kyc_documents: any;
  onboarding_track?: string | null;
  legal_form?: string | null;
  applicant_role?: string | null;
  verification_badge?: string | null;
  registration_number?: string | null;
  custom_monthly_price_usd?: number | string | null;
  subscription_status?: string;
  subscription_expires_at?: string | null;
  first_verified_at?: string | null;
  verified_at?: string | null;
  product_limit?: number;
  catalog_tier?: string;
  custom_product_limit?: number | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessFilterOptions {
  search?: string;
  province?: string;
  sector?: string;
  businessType?: string;
  onboardingTrack?: string;
  legalForm?: string;
  isVerified?: boolean;
  verificationStatus?: string;
  isFeatured?: boolean;
  includeExpired?: boolean;
  page?: number;
  limit?: number;
  sort?: 'featured' | 'rating' | 'newest' | 'name' | 'views';
}

export interface CreateBusinessDTO {
  user_id?: string | null;
  name: string;
  slug?: string | null;
  description?: string | null;
  province: string;
  city?: string | null;
  address?: string | null;
  sector?: string | null;
  business_type?: string | null;
  onboarding_track?: string | null;
  legal_form?: string | null;
  applicant_role?: string | null;
  verification_badge?: string | null;
  registration_number?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  logo_url?: string | null;
  cover_url?: string | null;
  gallery?: any[];
  operating_hours?: Record<string, any>;
  kyc_documents?: any[];
  is_verified?: boolean;
  verification_status?: string;
  custom_monthly_price_usd?: number | null;
  subscription_status?: string;
  subscription_expires_at?: string | Date | null;
  first_verified_at?: string | Date | null;
  verified_at?: string | Date | null;
  product_limit?: number;
  catalog_tier?: string;
  custom_product_limit?: number | null;
}

export interface UpdateBusinessDTO {
  name?: string;
  description?: string | null;
  province?: string;
  city?: string | null;
  address?: string | null;
  sector?: string | null;
  business_type?: string | null;
  onboarding_track?: string | null;
  legal_form?: string | null;
  applicant_role?: string | null;
  verification_badge?: string | null;
  registration_number?: string | null;
  custom_monthly_price_usd?: number | null;
  subscription_status?: string;
  subscription_expires_at?: string | Date | null;
  first_verified_at?: string | Date | null;
  verified_at?: string | Date | null;
  product_limit?: number;
  catalog_tier?: string;
  custom_product_limit?: number | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  logo_url?: string | null;
  cover_url?: string | null;
  gallery?: any[];
  operating_hours?: Record<string, any>;
  kyc_documents?: any[];
  is_verified?: boolean;
  verification_status?: string;
  is_featured?: boolean;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export class BusinessRepository {
  public async findBusinesses(filters: BusinessFilterOptions = {}): Promise<{
    businesses: BusinessRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = getDb();
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 12));
    const offset = (page - 1) * limit;

    const baseQuery = db('businesses');

    // 1. Search Query
    if (filters.search && filters.search.trim().length > 0) {
      const q = `%${filters.search.trim()}%`;
      baseQuery.where((builder) => {
        builder
          .whereILike('name', q)
          .orWhereILike('description', q)
          .orWhereILike('sector', q)
          .orWhereILike('city', q)
          .orWhereILike('address', q);
      });
    }

    // 2. Province Filter
    if (
      filters.province &&
      filters.province !== 'All' &&
      filters.province !== 'All Provinces' &&
      filters.province !== 'all'
    ) {
      baseQuery.whereILike('province', filters.province);
    }

    // 3. Sector / Category Filter
    if (
      filters.sector &&
      filters.sector !== 'All' &&
      filters.sector !== 'All Sectors' &&
      filters.sector !== 'all'
    ) {
      baseQuery.whereILike('sector', filters.sector);
    }

    // 4. Business Type Filter
    if (
      filters.businessType &&
      filters.businessType !== 'All' &&
      filters.businessType !== 'All Types' &&
      filters.businessType !== 'all'
    ) {
      baseQuery.where('business_type', filters.businessType);
    }

    // 5. Verification status filter
    if (filters.isVerified !== undefined) {
      baseQuery.where('is_verified', filters.isVerified);
    }

    if (filters.verificationStatus && filters.verificationStatus !== 'all') {
      baseQuery.where('verification_status', filters.verificationStatus);
    }

    if (filters.isFeatured !== undefined) {
      baseQuery.where('is_featured', filters.isFeatured);
    }

    // 6. Active Storefront / 30-Day Free Trial Filter
    // Unpaid expired businesses become invisible in public views.
    // For verified businesses, the 30-day grace period is counted from first_verified_at.
    // For unverified/pending businesses, an onboarding window of 14 days from created_at is granted.
    if (!filters.includeExpired) {
      baseQuery.where((builder) => {
        builder
          .where('subscription_status', 'Paid Subscriber')
          .orWhere((subBuilder) => {
            subBuilder
              .where('subscription_status', 'Month 1 Grace Period')
              .andWhere((graceBuilder) => {
                graceBuilder
                  .where((vBuilder) => {
                    vBuilder
                      .whereNotNull('first_verified_at')
                      .andWhere('first_verified_at', '>=', db.raw("NOW() - INTERVAL '30 days'"));
                  })
                  .orWhere((uBuilder) => {
                    uBuilder
                      .whereNull('first_verified_at')
                      .andWhere('created_at', '>=', db.raw("NOW() - INTERVAL '14 days'"));
                  });
              });
          });
      });
    }

    // Count total matching
    const countQuery = baseQuery.clone();
    const [{ total }] = await countQuery.count<{ total: string | number }[]>('id as total');
    const totalCount = Number(total);

    // Apply Sorting
    switch (filters.sort) {
      case 'rating':
        baseQuery.orderBy('rating_avg', 'desc').orderBy('reviews_count', 'desc');
        break;
      case 'newest':
        baseQuery.orderBy('created_at', 'desc');
        break;
      case 'name':
        baseQuery.orderBy('name', 'asc');
        break;
      case 'views':
        baseQuery.orderBy('views_count', 'desc');
        break;
      case 'featured':
      default:
        baseQuery
          .orderBy('is_featured', 'desc')
          .orderBy('is_verified', 'desc')
          .orderBy('rating_avg', 'desc')
          .orderBy('created_at', 'desc');
        break;
    }

    // Apply Pagination
    const rows = await baseQuery.offset(offset).limit(limit);

    return {
      businesses: rows,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  }

  public async findBySlug(slug: string): Promise<BusinessRow | null> {
    const db = getDb();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    let query = db('businesses').where({ slug });
    if (isUuid) {
      query = db('businesses').where({ slug }).orWhere({ id: slug });
    }

    const row = await query.first();
    return row || null;
  }

  public async findById(id: string): Promise<BusinessRow | null> {
    const db = getDb();
    const row = await db('businesses').where({ id }).first();
    return row || null;
  }

  public async findByUserId(userId: string): Promise<BusinessRow[]> {
    const db = getDb();
    return db('businesses').where({ user_id: userId }).orderBy('created_at', 'desc');
  }

  public async findBusinessWithDetails(slugOrId: string): Promise<{
    business: BusinessRow;
    products: any[];
    jobs: any[];
  } | null> {
    const business = await this.findBySlug(slugOrId);
    if (!business) return null;

    const db = getDb();
    const [products, jobs] = await Promise.all([
      db('products').where({ business_id: business.id, is_active: true }).orderBy('created_at', 'desc'),
      db('jobs').where({ business_id: business.id, is_active: true }).orderBy('created_at', 'desc'),
    ]);

    return {
      business,
      products,
      jobs,
    };
  }

  public async create(data: CreateBusinessDTO): Promise<BusinessRow> {
    const db = getDb();

    let slug = data.slug ? slugify(data.slug) : slugify(data.name);
    // Ensure slug uniqueness
    const existing = await db('businesses').where({ slug }).first();
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const [created] = await db('businesses')
      .insert({
        user_id: data.user_id || null,
        name: data.name,
        slug,
        description: data.description || null,
        province: data.province,
        city: data.city || null,
        address: data.address || null,
        sector: data.sector || null,
        business_type: data.business_type || 'Registered Company (Pvt Ltd)',
        onboarding_track: data.onboarding_track || 'registered_entity',
        legal_form: data.legal_form || 'pvt_ltd',
        applicant_role: data.applicant_role || 'owner',
        verification_badge: data.is_verified ? (data.verification_badge || 'Verified Registered Company') : null,
        registration_number: data.registration_number || null,
        custom_monthly_price_usd:
          data.custom_monthly_price_usd !== undefined ? data.custom_monthly_price_usd : null,
        product_limit: data.product_limit ?? 25,
        catalog_tier: data.catalog_tier || 'starter',
        custom_product_limit: data.custom_product_limit !== undefined ? data.custom_product_limit : null,
        subscription_status: data.subscription_status || 'Month 1 Grace Period',
        subscription_expires_at:
          data.subscription_expires_at ||
          (data.is_verified ? db.raw("NOW() + INTERVAL '30 days'") : null),
        first_verified_at: data.first_verified_at || (data.is_verified ? db.fn.now() : null),
        verified_at: data.verified_at || (data.is_verified ? db.fn.now() : null),
        phone: data.phone || null,
        email: data.email || null,
        whatsapp: data.whatsapp || null,
        website: data.website || null,
        logo_url: data.logo_url || null,
        cover_url: data.cover_url || null,
        gallery: JSON.stringify(data.gallery || []),
        operating_hours: JSON.stringify(data.operating_hours || {}),
        kyc_documents: JSON.stringify(data.kyc_documents || []),
        is_verified: data.is_verified || false,
        verification_status: data.verification_status || 'Pending',
        is_featured: false,
        rating_avg: 0.0,
        reviews_count: 0,
        views_count: 0,
        whatsapp_clicks: 0,
      })
      .returning('*');

    return created;
  }

  public async update(id: string, data: UpdateBusinessDTO): Promise<BusinessRow> {
    const db = getDb();

    const patch: Record<string, any> = {
      updated_at: db.fn.now(),
    };

    if (data.name !== undefined) patch.name = data.name;
    if (data.description !== undefined) patch.description = data.description;
    if (data.province !== undefined) patch.province = data.province;
    if (data.city !== undefined) patch.city = data.city;
    if (data.address !== undefined) patch.address = data.address;
    if (data.sector !== undefined) patch.sector = data.sector;
    if (data.business_type !== undefined) patch.business_type = data.business_type;
    if (data.onboarding_track !== undefined) patch.onboarding_track = data.onboarding_track;
    if (data.legal_form !== undefined) patch.legal_form = data.legal_form;
    if (data.applicant_role !== undefined) patch.applicant_role = data.applicant_role;
    if (data.verification_badge !== undefined) patch.verification_badge = data.verification_badge;
    if (data.registration_number !== undefined) patch.registration_number = data.registration_number;
    if (data.custom_monthly_price_usd !== undefined)
      patch.custom_monthly_price_usd = data.custom_monthly_price_usd;
    if (data.product_limit !== undefined) patch.product_limit = data.product_limit;
    if (data.catalog_tier !== undefined) patch.catalog_tier = data.catalog_tier;
    if (data.custom_product_limit !== undefined) patch.custom_product_limit = data.custom_product_limit;
    if (data.subscription_status !== undefined) patch.subscription_status = data.subscription_status;
    if (data.subscription_expires_at !== undefined) patch.subscription_expires_at = data.subscription_expires_at;
    if (data.first_verified_at !== undefined) patch.first_verified_at = data.first_verified_at;
    if (data.verified_at !== undefined) patch.verified_at = data.verified_at;
    if (data.phone !== undefined) patch.phone = data.phone;
    if (data.email !== undefined) patch.email = data.email;
    if (data.whatsapp !== undefined) patch.whatsapp = data.whatsapp;
    if (data.website !== undefined) patch.website = data.website;
    if (data.logo_url !== undefined) patch.logo_url = data.logo_url;
    if (data.cover_url !== undefined) patch.cover_url = data.cover_url;
    if (data.gallery !== undefined) patch.gallery = JSON.stringify(data.gallery);
    if (data.operating_hours !== undefined) patch.operating_hours = JSON.stringify(data.operating_hours);
    if (data.kyc_documents !== undefined) patch.kyc_documents = JSON.stringify(data.kyc_documents);
    if (data.is_verified !== undefined) {
      patch.is_verified = data.is_verified;
      if (data.verification_status === undefined) {
        patch.verification_status = data.is_verified ? 'Verified' : 'Pending';
      }
      if (data.verification_badge === undefined && !data.is_verified) {
        patch.verification_badge = null;
      }
    }
    if (data.verification_status !== undefined) {
      patch.verification_status = data.verification_status;
      if (data.is_verified === undefined) {
        patch.is_verified = data.verification_status === 'Verified';
      }
      if (data.verification_badge === undefined && data.verification_status !== 'Verified') {
        patch.verification_badge = null;
      }
    }
    if (data.is_featured !== undefined) patch.is_featured = data.is_featured;

    const [updated] = await db('businesses')
      .where({ id })
      .update(patch)
      .returning('*');

    if (!updated) {
      throw new NotFoundError(`Business with ID ${id} not found`);
    }

    return updated;
  }

  public async verify(id: string, status: 'Verified' | 'Rejected' | 'Pending', reason?: string): Promise<BusinessRow> {
    const db = getDb();
    const isVerified = status === 'Verified';

    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError(`Business with ID ${id} not found`);
    }

    let badge: string | null = null;
    if (isVerified) {
      const btLower = (existing.business_type || '').toLowerCase();
      const track = existing.onboarding_track || (
        btLower.includes('owner-operated') ||
        btLower.includes('sole proprietor') ||
        btLower.includes('informal') ||
        btLower.includes('artisan')
          ? 'owner_operated'
          : btLower.includes('cooperative') ||
            btLower.includes('association') ||
            btLower.includes('trust')
          ? 'association_institutional'
          : 'registered_entity'
      );

      if (track === 'owner_operated') {
        if (existing.legal_form === 'artisan_workshop') {
          badge = 'Verified Artisan Enterprise';
        } else if (existing.legal_form === 'informal_trader') {
          badge = 'Verified Informal Business (National ID)';
        } else {
          badge = 'Verified Owner-Operated Business (National ID)';
        }
      } else if (track === 'association_institutional') {
        badge = existing.legal_form === 'cooperative' ? 'Verified Cooperative' : 'Verified Organisation';
      } else {
        badge = existing.legal_form === 'pbc' ? 'Verified Registered Business (PBC)' : 'Verified Registered Company';
      }
    }

    const updatePayload: Record<string, any> = {
      verification_status: status,
      is_verified: isVerified,
      verification_badge: badge,
      updated_at: db.fn.now(),
    };

    if (isVerified) {
      updatePayload.verified_at = db.fn.now();
      // If verified for the first time, activate the 30-day free grace period!
      if (!existing.first_verified_at) {
        updatePayload.first_verified_at = db.fn.now();
        if (existing.subscription_status !== 'Paid Subscriber') {
          updatePayload.subscription_status = 'Month 1 Grace Period';
          updatePayload.subscription_expires_at = db.raw("NOW() + INTERVAL '30 days'");
        }
      }
    }

    const [updated] = await db('businesses')
      .where({ id })
      .update(updatePayload)
      .returning('*');

    if (!updated) {
      throw new NotFoundError(`Business with ID ${id} not found`);
    }

    return updated;
  }

  public async incrementViews(idOrSlug: string): Promise<void> {
    const db = getDb();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    let query = db('businesses').where({ slug: idOrSlug });
    if (isUuid) {
      query = db('businesses').where({ slug: idOrSlug }).orWhere({ id: idOrSlug });
    }
    await query.increment('views_count', 1);
  }

  public async incrementWhatsappClicks(idOrSlug: string): Promise<void> {
    const db = getDb();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    let query = db('businesses').where({ slug: idOrSlug });
    if (isUuid) {
      query = db('businesses').where({ slug: idOrSlug }).orWhere({ id: idOrSlug });
    }
    await query.increment('whatsapp_clicks', 1);
  }

  public async delete(id: string): Promise<boolean> {
    const db = getDb();
    const count = await db('businesses').where({ id }).delete();
    return count > 0;
  }
}

export const businessRepository = new BusinessRepository();
