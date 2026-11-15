import { getDb } from '../connection.js';
import { randomUUID } from 'node:crypto';
import type { PropertyListing } from '@/data/propertiesStore';

export interface PropertyRow {
  id: string;
  user_id: string | null;
  title: string;
  slug: string;
  property_type: string;
  category: string;
  province: string;
  city: string;
  suburb: string;
  price_usd: string | number;
  price_period: string;
  bedrooms: number | null;
  bathrooms: number | null;
  features: any;
  description: string;
  images: any;
  advertiser_name: string;
  advertiser_type: string;
  is_verified: boolean;
  whatsapp: string;
  phone: string;
  posted_at: string | null;
  is_featured: boolean;
  occupancy_status: string;
  is_occupied: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyFilterOptions {
  search?: string;
  province?: string;
  propertyType?: string;
  category?: string;
  occupancyStatus?: string;
  isFeatured?: boolean;
  userId?: string;
  limit?: number;
  offset?: number;
}

export interface CreatePropertyDTO {
  id?: string;
  userId?: string | null;
  title: string;
  slug?: string;
  propertyType: PropertyListing['propertyType'];
  category: PropertyListing['category'];
  province: string;
  city: string;
  suburb: string;
  priceUSD: number;
  pricePeriod?: PropertyListing['pricePeriod'];
  bedrooms?: number | null;
  bathrooms?: number | null;
  features?: string[];
  description: string;
  images?: string[];
  advertiserName: string;
  advertiserType?: PropertyListing['advertiserType'];
  isVerified?: boolean;
  whatsapp: string;
  phone: string;
  postedAt?: string;
  isFeatured?: boolean;
  occupancyStatus?: 'Available' | 'Occupied' | 'Taken';
  isOccupied?: boolean;
}

export interface UpdatePropertyDTO extends Partial<CreatePropertyDTO> {}

function parseJsonArray(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

export function mapRowToProperty(row: PropertyRow): PropertyListing & { userId?: string | null } {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    slug: row.slug,
    propertyType: row.property_type as any,
    category: row.category as any,
    province: row.province,
    city: row.city,
    suburb: row.suburb,
    priceUSD: Number(row.price_usd),
    pricePeriod: (row.price_period as any) || 'per_month',
    bedrooms: row.bedrooms ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    features: parseJsonArray(row.features),
    description: row.description,
    images: parseJsonArray(row.images),
    advertiserName: row.advertiser_name,
    advertiserType: (row.advertiser_type as any) || 'Direct Landlord',
    isVerified: Boolean(row.is_verified),
    whatsapp: row.whatsapp,
    phone: row.phone,
    postedAt: row.posted_at || 'Recently',
    isFeatured: Boolean(row.is_featured),
    occupancyStatus: (row.occupancy_status as any) || (row.is_occupied ? 'Taken' : 'Available'),
    isOccupied: Boolean(row.is_occupied),
  };
}

export class PropertyRepository {
  private get db() {
    return getDb();
  }

  async findMany(options: PropertyFilterOptions = {}): Promise<{ properties: (PropertyListing & { userId?: string | null })[]; total: number }> {
    const {
      search,
      province,
      propertyType,
      category,
      occupancyStatus,
      isFeatured,
      userId,
      limit = 50,
      offset = 0,
    } = options;

    let query = this.db('properties');

    if (userId) {
      query = query.where('user_id', userId);
    }

    if (province && province !== 'All' && province !== 'All Provinces') {
      query = query.where('province', province);
    }

    if (propertyType && propertyType !== 'All' && propertyType !== 'All Types') {
      query = query.where('property_type', propertyType);
    }

    if (category && category !== 'All' && category !== 'All Categories') {
      query = query.where('category', category);
    }

    if (occupancyStatus && occupancyStatus !== 'All' && occupancyStatus !== 'All Statuses') {
      if (occupancyStatus === 'Available' || occupancyStatus === 'Available Only') {
        query = query.where((q) => q.where('occupancy_status', 'Available').andWhere('is_occupied', false));
      } else if (occupancyStatus === 'Taken' || occupancyStatus === 'Taken / Occupied' || occupancyStatus === 'Occupied') {
        query = query.where((q) => q.whereIn('occupancy_status', ['Taken', 'Occupied']).orWhere('is_occupied', true));
      }
    }

    if (typeof isFeatured === 'boolean') {
      query = query.where('is_featured', isFeatured);
    }

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      query = query.where((builder) => {
        builder
          .whereRaw('LOWER(title) LIKE ?', [q])
          .orWhereRaw('LOWER(suburb) LIKE ?', [q])
          .orWhereRaw('LOWER(city) LIKE ?', [q])
          .orWhereRaw('LOWER(description) LIKE ?', [q])
          .orWhereRaw('LOWER(advertiser_name) LIKE ?', [q]);
      });
    }

    // Get total count
    const countRes = await query.clone().count<{ count: string | number }[]>('id as count');
    const total = Number(countRes[0]?.count || 0);

    // Order by featured first, then newest
    const rows = await query
      .clone()
      .orderBy([
        { column: 'is_featured', order: 'desc' },
        { column: 'created_at', order: 'desc' },
      ])
      .limit(limit)
      .offset(offset);

    return {
      properties: rows.map(mapRowToProperty),
      total,
    };
  }

  async findById(id: string): Promise<(PropertyListing & { userId?: string | null }) | null> {
    const row = await this.db('properties').where('id', id).first();
    if (!row) return null;
    return mapRowToProperty(row);
  }

  async findBySlug(slug: string): Promise<(PropertyListing & { userId?: string | null }) | null> {
    const row = await this.db('properties').where('slug', slug).first();
    if (!row) return null;
    return mapRowToProperty(row);
  }

  async create(data: CreatePropertyDTO): Promise<PropertyListing & { userId?: string | null }> {
    const id = data.id || `prop-${Date.now()}`;
    const baseSlug = (data.slug || data.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Ensure slug uniqueness
    let slug = baseSlug || `property-${id}`;
    const existingSlug = await this.db('properties').where('slug', slug).first();
    if (existingSlug) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const isOccupied =
      data.isOccupied !== undefined
        ? data.isOccupied
        : data.occupancyStatus === 'Taken' || data.occupancyStatus === 'Occupied';
    const occupancyStatus = data.occupancyStatus || (isOccupied ? 'Taken' : 'Available');

    const insertData = {
      id,
      user_id: data.userId || null,
      title: data.title,
      slug,
      property_type: data.propertyType,
      category: data.category,
      province: data.province,
      city: data.city,
      suburb: data.suburb,
      price_usd: data.priceUSD,
      price_period: data.pricePeriod || 'per_month',
      bedrooms: data.bedrooms !== undefined ? data.bedrooms : null,
      bathrooms: data.bathrooms !== undefined ? data.bathrooms : null,
      features: JSON.stringify(data.features || []),
      description: data.description,
      images: JSON.stringify(data.images || []),
      advertiser_name: data.advertiserName,
      advertiser_type: data.advertiserType || 'Direct Landlord',
      is_verified: data.isVerified !== undefined ? data.isVerified : false,
      whatsapp: data.whatsapp,
      phone: data.phone,
      posted_at: data.postedAt || 'Just now',
      is_featured: data.isFeatured !== undefined ? data.isFeatured : false,
      occupancy_status: occupancyStatus,
      is_occupied: isOccupied,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const [row] = await this.db('properties').insert(insertData).returning('*');
    return mapRowToProperty(row);
  }

  async update(id: string, data: UpdatePropertyDTO): Promise<(PropertyListing & { userId?: string | null }) | null> {
    const existing = await this.db('properties').where('id', id).first();
    if (!existing) return null;

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.propertyType !== undefined) updateData.property_type = data.propertyType;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.province !== undefined) updateData.province = data.province;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.suburb !== undefined) updateData.suburb = data.suburb;
    if (data.priceUSD !== undefined) updateData.price_usd = data.priceUSD;
    if (data.pricePeriod !== undefined) updateData.price_period = data.pricePeriod;
    if (data.bedrooms !== undefined) updateData.bedrooms = data.bedrooms;
    if (data.bathrooms !== undefined) updateData.bathrooms = data.bathrooms;
    if (data.features !== undefined) updateData.features = JSON.stringify(data.features);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.images !== undefined) updateData.images = JSON.stringify(data.images);
    if (data.advertiserName !== undefined) updateData.advertiser_name = data.advertiserName;
    if (data.advertiserType !== undefined) updateData.advertiser_type = data.advertiserType;
    if (data.isVerified !== undefined) updateData.is_verified = data.isVerified;
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.isFeatured !== undefined) updateData.is_featured = data.isFeatured;

    if (data.occupancyStatus !== undefined || data.isOccupied !== undefined) {
      const isOccupied =
        data.isOccupied !== undefined
          ? data.isOccupied
          : data.occupancyStatus === 'Taken' || data.occupancyStatus === 'Occupied';
      updateData.is_occupied = isOccupied;
      updateData.occupancy_status = data.occupancyStatus || (isOccupied ? 'Taken' : 'Available');
    }

    const [updatedRow] = await this.db('properties').where('id', id).update(updateData).returning('*');
    return mapRowToProperty(updatedRow);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db('properties').where('id', id).del();
    return deleted > 0;
  }

  async toggleOccupancy(id: string, targetStatus?: 'Available' | 'Taken'): Promise<PropertyListing | null> {
    const row = await this.db('properties').where('id', id).first();
    if (!row) return null;

    let nextOccupied: boolean;
    let nextStatus: string;

    if (targetStatus) {
      nextOccupied = targetStatus === 'Taken';
      nextStatus = targetStatus;
    } else {
      const isCurrentlyOccupied = row.is_occupied || row.occupancy_status === 'Occupied' || row.occupancy_status === 'Taken';
      nextOccupied = !isCurrentlyOccupied;
      nextStatus = nextOccupied ? 'Taken' : 'Available';
    }

    const [updated] = await this.db('properties')
      .where('id', id)
      .update({
        is_occupied: nextOccupied,
        occupancy_status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .returning('*');

    return mapRowToProperty(updated);
  }

  async toggleVerification(id: string, isVerified?: boolean): Promise<PropertyListing | null> {
    const row = await this.db('properties').where('id', id).first();
    if (!row) return null;

    const nextVal = isVerified !== undefined ? isVerified : !row.is_verified;
    const [updated] = await this.db('properties')
      .where('id', id)
      .update({
        is_verified: nextVal,
        updated_at: new Date().toISOString(),
      })
      .returning('*');

    return mapRowToProperty(updated);
  }

  async toggleFeatured(id: string, isFeatured?: boolean): Promise<PropertyListing | null> {
    const row = await this.db('properties').where('id', id).first();
    if (!row) return null;

    const nextVal = isFeatured !== undefined ? isFeatured : !row.is_featured;
    const [updated] = await this.db('properties')
      .where('id', id)
      .update({
        is_featured: nextVal,
        updated_at: new Date().toISOString(),
      })
      .returning('*');

    return mapRowToProperty(updated);
  }

  async recordUnlock(data: {
    propertyId: string;
    userId?: string | null;
    customerPhone?: string | null;
    paymentMethod: string;
    paymentReference: string;
    amountUsd?: number;
  }) {
    const [row] = await this.db('property_contact_unlocks')
      .insert({
        id: randomUUID(),
        property_id: data.propertyId,
        user_id: data.userId || null,
        customer_phone: data.customerPhone || null,
        payment_method: data.paymentMethod,
        payment_reference: data.paymentReference,
        amount_usd: data.amountUsd || 2.0,
        created_at: new Date().toISOString(),
      })
      .returning('*');

    return row;
  }

  async getUnlocksForUser(userId: string) {
    return this.db('property_contact_unlocks').where('user_id', userId).orderBy('created_at', 'desc');
  }

  async getUnlockCount(): Promise<number> {
    const res = await this.db('property_contact_unlocks').count<{ count: string | number }[]>('id as count');
    return Number(res[0]?.count || 0);
  }

  async getStats() {
    const [totalRes, availableRes, takenRes, verifiedRes, featuredRes, unlocksRes, revenueRes] = await Promise.all([
      this.db('properties').count<{ count: string | number }[]>('id as count'),
      this.db('properties').where('is_occupied', false).count<{ count: string | number }[]>('id as count'),
      this.db('properties').where('is_occupied', true).count<{ count: string | number }[]>('id as count'),
      this.db('properties').where('is_verified', true).count<{ count: string | number }[]>('id as count'),
      this.db('properties').where('is_featured', true).count<{ count: string | number }[]>('id as count'),
      this.db('property_contact_unlocks').count<{ count: string | number }[]>('id as count'),
      this.db('property_contact_unlocks').sum<{ sum: string | number }[]>('amount_usd as sum'),
    ]);

    return {
      total: Number(totalRes[0]?.count || 0),
      available: Number(availableRes[0]?.count || 0),
      taken: Number(takenRes[0]?.count || 0),
      verified: Number(verifiedRes[0]?.count || 0),
      featured: Number(featuredRes[0]?.count || 0),
      totalUnlocks: Number(unlocksRes[0]?.count || 0),
      unlockRevenueUsd: Number(revenueRes[0]?.sum || 0),
    };
  }
}

export const propertyRepository = new PropertyRepository();
