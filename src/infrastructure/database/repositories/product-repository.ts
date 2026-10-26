import { getDb } from '../connection.js';
import { NotFoundError } from '../../../shared/errors/index.js';

export interface ProductRow {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  price_usd: number | string;
  price_zig: number | string | null;
  images: any;
  in_stock: boolean;
  stock_quantity: number;
  condition: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields from businesses
  business_name?: string;
  business_slug?: string;
  business_province?: string;
  business_type?: string;
  business_phone?: string;
  business_whatsapp?: string;
  business_is_verified?: boolean;
}

export interface ProductFilterOptions {
  search?: string;
  category?: string;
  province?: string;
  condition?: string;
  businessId?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  includeExpired?: boolean;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'featured' | 'name';
}

export interface CreateProductDTO {
  business_id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  category?: string | null;
  price_usd: number;
  price_zig?: number | null;
  images?: string[];
  in_stock?: boolean;
  stock_quantity?: number;
  condition?: string;
  is_featured?: boolean;
  is_active?: boolean;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string | null;
  category?: string | null;
  price_usd?: number;
  price_zig?: number | null;
  images?: string[];
  in_stock?: boolean;
  stock_quantity?: number;
  condition?: string;
  is_featured?: boolean;
  is_active?: boolean;
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

export class ProductRepository {
  public async findProducts(filters: ProductFilterOptions = {}): Promise<{
    products: ProductRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = getDb();
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 12));
    const offset = (page - 1) * limit;

    const baseQuery = db('products')
      .join('businesses', 'products.business_id', 'businesses.id')
      .select(
        'products.*',
        'businesses.name as business_name',
        'businesses.slug as business_slug',
        'businesses.province as business_province',
        'businesses.business_type as business_type',
        'businesses.phone as business_phone',
        'businesses.whatsapp as business_whatsapp',
        'businesses.is_verified as business_is_verified'
      );

    // Default: only show active products unless explicitly requested
    if (filters.isActive !== undefined) {
      baseQuery.where('products.is_active', filters.isActive);
    } else {
      baseQuery.where('products.is_active', true);
    }

    if (filters.businessId) {
      baseQuery.where('products.business_id', filters.businessId);
    }

    // Active Storefront Rule: Hide products belonging to businesses whose trial expired without payment
    // For verified businesses, the 30-day grace period is counted from first_verified_at.
    // For unverified/pending businesses, an onboarding window of 14 days from created_at is granted.
    if (!filters.includeExpired && !filters.businessId) {
      baseQuery.where((builder) => {
        builder
          .where('businesses.subscription_status', 'Paid Subscriber')
          .orWhere((subBuilder) => {
            subBuilder
              .where('businesses.subscription_status', 'Month 1 Grace Period')
              .andWhere((graceBuilder) => {
                graceBuilder
                  .where((vBuilder) => {
                    vBuilder
                      .whereNotNull('businesses.first_verified_at')
                      .andWhere('businesses.first_verified_at', '>=', db.raw("NOW() - INTERVAL '30 days'"));
                  })
                  .orWhere((uBuilder) => {
                    uBuilder
                      .whereNull('businesses.first_verified_at')
                      .andWhere('businesses.created_at', '>=', db.raw("NOW() - INTERVAL '14 days'"));
                  });
              });
          });
      });
    }

    if (filters.search && filters.search.trim().length > 0) {
      const q = `%${filters.search.trim()}%`;
      baseQuery.where((builder) => {
        builder
          .whereILike('products.name', q)
          .orWhereILike('products.description', q)
          .orWhereILike('products.category', q)
          .orWhereILike('businesses.name', q);
      });
    }

    if (
      filters.category &&
      filters.category !== 'All' &&
      filters.category !== 'All Sectors' &&
      filters.category !== 'all'
    ) {
      baseQuery.whereILike('products.category', filters.category);
    }

    if (
      filters.province &&
      filters.province !== 'All' &&
      filters.province !== 'All Provinces' &&
      filters.province !== 'all'
    ) {
      baseQuery.whereILike('businesses.province', filters.province);
    }

    if (
      filters.condition &&
      filters.condition !== 'All' &&
      filters.condition !== 'All Conditions' &&
      filters.condition !== 'all'
    ) {
      baseQuery.where('products.condition', filters.condition);
    }

    if (filters.isFeatured !== undefined) {
      baseQuery.where('products.is_featured', filters.isFeatured);
    }

    // Count
    const countQuery = baseQuery.clone().clearSelect();
    const [{ total }] = await countQuery.count<{ total: string | number }[]>('products.id as total');
    const totalCount = Number(total);

    // Sort
    switch (filters.sort) {
      case 'price_asc':
        baseQuery.orderBy('products.price_usd', 'asc');
        break;
      case 'price_desc':
        baseQuery.orderBy('products.price_usd', 'desc');
        break;
      case 'name':
        baseQuery.orderBy('products.name', 'asc');
        break;
      case 'newest':
        baseQuery.orderBy('products.created_at', 'desc');
        break;
      case 'featured':
      default:
        baseQuery
          .orderBy('products.is_featured', 'desc')
          .orderBy('businesses.is_verified', 'desc')
          .orderBy('products.created_at', 'desc');
        break;
    }

    const rows = await baseQuery.offset(offset).limit(limit);

    return {
      products: rows,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  }

  public async findBySlug(slug: string): Promise<ProductRow | null> {
    const db = getDb();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    let query = db('products')
      .join('businesses', 'products.business_id', 'businesses.id')
      .select(
        'products.*',
        'businesses.name as business_name',
        'businesses.slug as business_slug',
        'businesses.province as business_province',
        'businesses.business_type as business_type',
        'businesses.phone as business_phone',
        'businesses.whatsapp as business_whatsapp',
        'businesses.is_verified as business_is_verified'
      );

    if (isUuid) {
      query = query.where('products.slug', slug).orWhere('products.id', slug);
    } else {
      query = query.where('products.slug', slug);
    }

    const row = await query.first();
    return row || null;
  }

  public async findById(id: string): Promise<ProductRow | null> {
    const db = getDb();
    const row = await db('products')
      .join('businesses', 'products.business_id', 'businesses.id')
      .select(
        'products.*',
        'businesses.name as business_name',
        'businesses.slug as business_slug',
        'businesses.province as business_province',
        'businesses.business_type as business_type',
        'businesses.phone as business_phone',
        'businesses.whatsapp as business_whatsapp',
        'businesses.is_verified as business_is_verified'
      )
      .where('products.id', id)
      .first();

    return row || null;
  }

  public async create(data: CreateProductDTO): Promise<ProductRow> {
    const db = getDb();

    let slug = data.slug ? slugify(data.slug) : slugify(data.name);
    const existing = await db('products').where({ slug }).first();
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // Auto-calculate ZiG if not provided
    let priceZig = data.price_zig;
    if (priceZig === undefined || priceZig === null) {
      const settings = await db('platform_settings').first();
      const rate = Number(settings?.usd_to_zig_rate || 26.5);
      priceZig = Math.round(data.price_usd * rate * 100) / 100;
    }

    const [created] = await db('products')
      .insert({
        business_id: data.business_id,
        name: data.name,
        slug,
        description: data.description || null,
        category: data.category || null,
        price_usd: data.price_usd,
        price_zig: priceZig,
        images: JSON.stringify(data.images || []),
        in_stock: data.in_stock ?? true,
        stock_quantity: data.stock_quantity ?? 1,
        condition: data.condition || 'Brand New',
        is_featured: data.is_featured ?? false,
        is_active: data.is_active ?? true,
      })
      .returning('*');

    return created;
  }

  public async update(id: string, data: UpdateProductDTO): Promise<ProductRow> {
    const db = getDb();

    const patch: Record<string, any> = {
      updated_at: db.fn.now(),
    };

    if (data.name !== undefined) patch.name = data.name;
    if (data.description !== undefined) patch.description = data.description;
    if (data.category !== undefined) patch.category = data.category;
    if (data.price_usd !== undefined) {
      patch.price_usd = data.price_usd;
      if (data.price_zig === undefined) {
        const settings = await db('platform_settings').first();
        const rate = Number(settings?.usd_to_zig_rate || 26.5);
        patch.price_zig = Math.round(data.price_usd * rate * 100) / 100;
      }
    }
    if (data.price_zig !== undefined) patch.price_zig = data.price_zig;
    if (data.images !== undefined) patch.images = JSON.stringify(data.images);
    if (data.in_stock !== undefined) patch.in_stock = data.in_stock;
    if (data.stock_quantity !== undefined) patch.stock_quantity = data.stock_quantity;
    if (data.condition !== undefined) patch.condition = data.condition;
    if (data.is_featured !== undefined) patch.is_featured = data.is_featured;
    if (data.is_active !== undefined) patch.is_active = data.is_active;

    const [updated] = await db('products')
      .where({ id })
      .update(patch)
      .returning('*');

    if (!updated) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    return updated;
  }

  public async delete(id: string): Promise<boolean> {
    const db = getDb();
    const count = await db('products').where({ id }).delete();
    return count > 0;
  }

  public async toggleFeatured(id: string, isFeatured: boolean): Promise<ProductRow> {
    return this.update(id, { is_featured: isFeatured });
  }

  public async toggleActive(id: string, isActive: boolean): Promise<ProductRow> {
    return this.update(id, { is_active: isActive });
  }
}

export const productRepository = new ProductRepository();
