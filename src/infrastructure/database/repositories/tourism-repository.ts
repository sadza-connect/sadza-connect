import { getDb } from '../connection.js';
import type { TourismListing } from '@/data/tourismStore';

export interface TourismRow {
  id: string;
  user_id: string | null;
  name: string;
  slug: string;
  category: string;
  destination_area: string;
  province: string;
  city: string;
  address_or_location: string;
  price_per_night_usd: string | number;
  guests_capacity: number | null;
  bedrooms: number | null;
  amenities: any;
  description: string;
  images: any;
  host_name: string;
  host_type: string;
  is_verified: boolean;
  is_featured: boolean;
  whatsapp: string;
  phone: string;
  email: string | null;
  rating: string | number;
  reviews_count: number;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TourismFilterOptions {
  search?: string;
  category?: string;
  destinationArea?: string;
  province?: string;
  isFeatured?: boolean;
  isVerified?: boolean;
  userId?: string;
  limit?: number;
  offset?: number;
}

export interface CreateTourismDTO {
  id?: string;
  userId?: string | null;
  name: string;
  slug?: string;
  category: TourismListing['category'];
  destinationArea: string;
  province: string;
  city: string;
  addressOrLocation: string;
  pricePerNightUSD: number;
  guestsCapacity?: number | null;
  bedrooms?: number | null;
  amenities?: string[];
  description: string;
  images?: string[];
  hostName: string;
  hostType?: TourismListing['hostType'];
  isVerified?: boolean;
  isFeatured?: boolean;
  whatsapp: string;
  phone: string;
  email?: string;
  rating?: number;
  reviewsCount?: number;
  postedAt?: string;
}

export type UpdateTourismDTO = Partial<CreateTourismDTO>;

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return [];
    }
  }
  return [];
}

export function mapRowToTourism(row: TourismRow): TourismListing & { userId?: string | null } {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    slug: row.slug,
    category: row.category as TourismListing['category'],
    destinationArea: row.destination_area,
    province: row.province,
    city: row.city,
    addressOrLocation: row.address_or_location,
    pricePerNightUSD: Number(row.price_per_night_usd),
    guestsCapacity: row.guests_capacity ?? undefined,
    bedrooms: row.bedrooms ?? undefined,
    amenities: parseJsonArray(row.amenities),
    description: row.description,
    images: parseJsonArray(row.images),
    hostName: row.host_name,
    hostType: (row.host_type as TourismListing['hostType']) || 'Private BnB Host',
    isVerified: Boolean(row.is_verified),
    isFeatured: Boolean(row.is_featured),
    whatsapp: row.whatsapp,
    phone: row.phone,
    email: row.email || undefined,
    rating: Number(row.rating || 5.0),
    reviewsCount: Number(row.reviews_count || 0),
    postedAt: row.posted_at || 'Recently',
  };
}

export class TourismRepository {
  private get db() {
    return getDb();
  }

  async findMany(
    options: TourismFilterOptions = {}
  ): Promise<{ listings: (TourismListing & { userId?: string | null })[]; total: number }> {
    const {
      search,
      category,
      destinationArea,
      province,
      isFeatured,
      isVerified,
      userId,
      limit = 50,
      offset = 0,
    } = options;

    let query = this.db('tourism_listings');

    if (userId) {
      query = query.where('user_id', userId);
    }

    if (category && category !== 'All' && category !== 'All Categories') {
      query = query.where('category', category);
    }

    if (destinationArea && destinationArea !== 'All' && destinationArea !== 'All Destinations') {
      query = query.where('destination_area', destinationArea);
    }

    if (province && province !== 'All' && province !== 'All Provinces') {
      query = query.whereRaw('LOWER(province) = ?', [province.trim().toLowerCase()]);
    }

    if (typeof isFeatured === 'boolean') {
      query = query.where('is_featured', isFeatured);
    }

    if (typeof isVerified === 'boolean') {
      query = query.where('is_verified', isVerified);
    }

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      query = query.where((builder) => {
        builder
          .whereRaw('LOWER(name) LIKE ?', [q])
          .orWhereRaw('LOWER(destination_area) LIKE ?', [q])
          .orWhereRaw('LOWER(city) LIKE ?', [q])
          .orWhereRaw('LOWER(province) LIKE ?', [q])
          .orWhereRaw('LOWER(description) LIKE ?', [q])
          .orWhereRaw('LOWER(host_name) LIKE ?', [q]);
      });
    }

    const countRes = await query.clone().count<{ count: string | number }[]>('id as count');
    const total = Number(countRes[0]?.count || 0);

    const rows = await query
      .clone()
      .orderBy([
        { column: 'is_featured', order: 'desc' },
        { column: 'created_at', order: 'desc' },
      ])
      .limit(limit)
      .offset(offset);

    return {
      listings: rows.map(mapRowToTourism),
      total,
    };
  }

  async findById(id: string): Promise<(TourismListing & { userId?: string | null }) | null> {
    const row = await this.db('tourism_listings').where('id', id).first();
    if (!row) return null;
    return mapRowToTourism(row);
  }

  async findBySlug(slug: string): Promise<(TourismListing & { userId?: string | null }) | null> {
    const row = await this.db('tourism_listings').where('slug', slug).first();
    if (!row) return null;
    return mapRowToTourism(row);
  }

  async create(data: CreateTourismDTO): Promise<TourismListing & { userId?: string | null }> {
    const id = data.id || `tour-${Date.now()}`;
    const baseSlug = (data.slug || data.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug || `tourism-${id}`;
    const existingSlug = await this.db('tourism_listings').where('slug', slug).first();
    if (existingSlug) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const insertData = {
      id,
      user_id: data.userId || null,
      name: data.name,
      slug,
      category: data.category,
      destination_area: data.destinationArea,
      province: data.province,
      city: data.city,
      address_or_location: data.addressOrLocation,
      price_per_night_usd: data.pricePerNightUSD,
      guests_capacity: data.guestsCapacity ?? 2,
      bedrooms: data.bedrooms ?? 1,
      amenities: JSON.stringify(data.amenities || []),
      description: data.description,
      images: JSON.stringify(data.images || []),
      host_name: data.hostName,
      host_type: data.hostType || 'Private BnB Host',
      is_verified: data.isVerified !== undefined ? data.isVerified : false,
      is_featured: data.isFeatured !== undefined ? data.isFeatured : false,
      whatsapp: data.whatsapp,
      phone: data.phone,
      email: data.email || null,
      rating: data.rating !== undefined ? data.rating : 5.0,
      reviews_count: data.reviewsCount !== undefined ? data.reviewsCount : 1,
      posted_at: data.postedAt || 'Just now',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const [row] = await this.db('tourism_listings').insert(insertData).returning('*');
    return mapRowToTourism(row);
  }

  async update(id: string, data: UpdateTourismDTO): Promise<(TourismListing & { userId?: string | null }) | null> {
    const existing = await this.db('tourism_listings').where('id', id).first();
    if (!existing) return null;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.destinationArea !== undefined) updateData.destination_area = data.destinationArea;
    if (data.province !== undefined) updateData.province = data.province;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.addressOrLocation !== undefined) updateData.address_or_location = data.addressOrLocation;
    if (data.pricePerNightUSD !== undefined) updateData.price_per_night_usd = data.pricePerNightUSD;
    if (data.guestsCapacity !== undefined) updateData.guests_capacity = data.guestsCapacity;
    if (data.bedrooms !== undefined) updateData.bedrooms = data.bedrooms;
    if (data.amenities !== undefined) updateData.amenities = JSON.stringify(data.amenities);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.images !== undefined) updateData.images = JSON.stringify(data.images);
    if (data.hostName !== undefined) updateData.host_name = data.hostName;
    if (data.hostType !== undefined) updateData.host_type = data.hostType;
    if (data.isVerified !== undefined) updateData.is_verified = data.isVerified;
    if (data.isFeatured !== undefined) updateData.is_featured = data.isFeatured;
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.reviewsCount !== undefined) updateData.reviews_count = data.reviewsCount;

    const [updatedRow] = await this.db('tourism_listings').where('id', id).update(updateData).returning('*');
    return mapRowToTourism(updatedRow);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db('tourism_listings').where('id', id).del();
    return deleted > 0;
  }

  async toggleVerification(id: string, isVerified?: boolean): Promise<(TourismListing & { userId?: string | null }) | null> {
    const row = await this.db('tourism_listings').where('id', id).first();
    if (!row) return null;

    const nextVal = isVerified !== undefined ? isVerified : !row.is_verified;
    const [updated] = await this.db('tourism_listings')
      .where('id', id)
      .update({
        is_verified: nextVal,
        updated_at: new Date().toISOString(),
      })
      .returning('*');

    return mapRowToTourism(updated);
  }

  async toggleFeatured(id: string, isFeatured?: boolean): Promise<(TourismListing & { userId?: string | null }) | null> {
    const row = await this.db('tourism_listings').where('id', id).first();
    if (!row) return null;

    const nextVal = isFeatured !== undefined ? isFeatured : !row.is_featured;
    const [updated] = await this.db('tourism_listings')
      .where('id', id)
      .update({
        is_featured: nextVal,
        updated_at: new Date().toISOString(),
      })
      .returning('*');

    return mapRowToTourism(updated);
  }

  async getStats() {
    const [totalRes, verifiedRes, featuredRes, safariRes, vicFallsRes] = await Promise.all([
      this.db('tourism_listings').count<{ count: string | number }[]>('id as count'),
      this.db('tourism_listings').where('is_verified', true).count<{ count: string | number }[]>('id as count'),
      this.db('tourism_listings').where('is_featured', true).count<{ count: string | number }[]>('id as count'),
      this.db('tourism_listings').where('category', 'Lodges & Safari Camps').count<{ count: string | number }[]>('id as count'),
      this.db('tourism_listings').where('destination_area', 'Victoria Falls').count<{ count: string | number }[]>('id as count'),
    ]);

    return {
      total: Number(totalRes[0]?.count || 0),
      verified: Number(verifiedRes[0]?.count || 0),
      featured: Number(featuredRes[0]?.count || 0),
      safariCount: Number(safariRes[0]?.count || 0),
      vicFallsCount: Number(vicFallsRes[0]?.count || 0),
    };
  }
}

export const tourismRepository = new TourismRepository();
