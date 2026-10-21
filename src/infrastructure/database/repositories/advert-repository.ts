import { getDb } from '../connection.js';
import { NotFoundError } from '../../../shared/errors/index.js';

export interface AdvertRow {
  id: string;
  business_id: string | null;
  business_name: string;
  business_type: string | null;
  province: string;
  category: string;
  offer_type: string;
  headline: string;
  offer_text: string;
  promo_badge: string | null;
  original_price_usd: number | string | null;
  promo_price_usd: number | string | null;
  price_zig: number | string | null;
  valid_until: string | null;
  whatsapp: string | null;
  phone: string | null;
  image: string | null;
  featured_on_home: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdvertFilterOptions {
  search?: string;
  category?: string;
  province?: string;
  offerType?: string;
  featuredOnHome?: boolean;
  isActive?: boolean;
  businessId?: string;
  page?: number;
  limit?: number;
}

export interface CreateAdvertDTO {
  id?: string;
  business_id?: string | null;
  business_name: string;
  business_type?: string | null;
  province: string;
  category: string;
  offer_type: string;
  headline: string;
  offer_text: string;
  promo_badge?: string | null;
  original_price_usd?: number | null;
  promo_price_usd?: number | null;
  price_zig?: number | null;
  valid_until?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  image?: string | null;
  featured_on_home?: boolean;
  is_active?: boolean;
}

export interface UpdateAdvertDTO {
  business_name?: string;
  business_type?: string | null;
  province?: string;
  category?: string;
  offer_type?: string;
  headline?: string;
  offer_text?: string;
  promo_badge?: string | null;
  original_price_usd?: number | null;
  promo_price_usd?: number | null;
  price_zig?: number | null;
  valid_until?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  image?: string | null;
  featured_on_home?: boolean;
  is_active?: boolean;
}

export class AdvertRepository {
  private async getUsdToZigRate(): Promise<number> {
    try {
      const db = getDb();
      const settings = await db('platform_settings').first();
      return settings?.usd_to_zig_rate ? Number(settings.usd_to_zig_rate) : 26.5;
    } catch {
      return 26.5;
    }
  }

  async findAdverts(filters: AdvertFilterOptions = {}): Promise<{
    adverts: AdvertRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = getDb();
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 20));
    const offset = (page - 1) * limit;

    let query = db('adverts').select('adverts.*');

    if (filters.isActive !== undefined) {
      query = query.where('adverts.is_active', filters.isActive);
    }

    if (filters.featuredOnHome !== undefined) {
      query = query.where('adverts.featured_on_home', filters.featuredOnHome);
    }

    if (filters.province && filters.province !== 'All' && filters.province !== 'All Provinces') {
      query = query.whereRaw('LOWER(adverts.province) = LOWER(?)', [filters.province]);
    }

    if (filters.category && filters.category !== 'All' && filters.category !== 'All Commercial Sectors') {
      query = query.whereRaw('LOWER(adverts.category) = LOWER(?)', [filters.category]);
    }

    if (filters.offerType && filters.offerType !== 'All' && filters.offerType !== 'All Offer Types') {
      query = query.whereRaw('LOWER(adverts.offer_type) = LOWER(?)', [filters.offerType]);
    }

    if (filters.businessId) {
      query = query.where('adverts.business_id', filters.businessId);
    }

    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      query = query.where((q) => {
        q.whereILike('adverts.headline', term)
          .orWhereILike('adverts.business_name', term)
          .orWhereILike('adverts.offer_text', term)
          .orWhereILike('adverts.category', term);
      });
    }

    // Count query
    const countResult = await query
      .clone()
      .clearSelect()
      .count('adverts.id as total')
      .first();

    const total = countResult ? parseInt(String(countResult.total), 10) : 0;

    // Sorting and pagination
    const adverts: AdvertRow[] = await query
      .orderBy([
        { column: 'adverts.featured_on_home', order: 'desc' },
        { column: 'adverts.created_at', order: 'desc' },
      ])
      .limit(limit)
      .offset(offset);

    return {
      adverts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findById(id: string): Promise<AdvertRow | null> {
    const db = getDb();
    const advert = await db('adverts').where('id', id).first();
    return advert || null;
  }

  async create(data: CreateAdvertDTO): Promise<AdvertRow> {
    const db = getDb();
    const rate = await this.getUsdToZigRate();

    const promoUsd = data.promo_price_usd ? Number(data.promo_price_usd) : null;
    const computedZig = data.price_zig !== undefined && data.price_zig !== null
      ? Number(data.price_zig)
      : promoUsd ? Math.round(promoUsd * rate) : null;

    const advertId = data.id || `ad-${Date.now()}`;

    const insertData: any = {
      id: advertId,
      business_id: data.business_id || null,
      business_name: data.business_name,
      business_type: data.business_type || 'Registered Company (Pvt Ltd)',
      province: data.province,
      category: data.category,
      offer_type: data.offer_type,
      headline: data.headline,
      offer_text: data.offer_text,
      promo_badge: data.promo_badge || 'SPECIAL OFFER',
      original_price_usd: data.original_price_usd !== undefined ? data.original_price_usd : null,
      promo_price_usd: promoUsd,
      price_zig: computedZig,
      valid_until: data.valid_until || 'Valid this month',
      whatsapp: data.whatsapp || null,
      phone: data.phone || null,
      image: data.image || null,
      featured_on_home: data.featured_on_home ?? true,
      is_active: data.is_active ?? true,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    };

    const [created] = await db('adverts').insert(insertData).returning('*');
    return created;
  }

  async update(id: string, data: UpdateAdvertDTO): Promise<AdvertRow> {
    const db = getDb();
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError(`Advert '${id}' was not found`);
    }

    const updateData: any = {
      updated_at: db.fn.now(),
    };

    if (data.business_name !== undefined) updateData.business_name = data.business_name;
    if (data.business_type !== undefined) updateData.business_type = data.business_type;
    if (data.province !== undefined) updateData.province = data.province;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.offer_type !== undefined) updateData.offer_type = data.offer_type;
    if (data.headline !== undefined) updateData.headline = data.headline;
    if (data.offer_text !== undefined) updateData.offer_text = data.offer_text;
    if (data.promo_badge !== undefined) updateData.promo_badge = data.promo_badge;
    if (data.original_price_usd !== undefined) updateData.original_price_usd = data.original_price_usd;
    if (data.valid_until !== undefined) updateData.valid_until = data.valid_until;
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.featured_on_home !== undefined) updateData.featured_on_home = data.featured_on_home;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    if (data.promo_price_usd !== undefined) {
      updateData.promo_price_usd = data.promo_price_usd;
      if (data.price_zig === undefined) {
        const rate = await this.getUsdToZigRate();
        updateData.price_zig = data.promo_price_usd ? Math.round(Number(data.promo_price_usd) * rate) : null;
      }
    }

    if (data.price_zig !== undefined) {
      updateData.price_zig = data.price_zig;
    }

    const [updated] = await db('adverts')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb();
    const count = await db('adverts').where('id', id).del();
    return count > 0;
  }
}

export const advertRepository = new AdvertRepository();
