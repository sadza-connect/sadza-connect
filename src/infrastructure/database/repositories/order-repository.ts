import { getDb } from '../connection.js';
import { NotFoundError } from '../../../shared/errors/index.js';

export interface OrderRow {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  business_id: string | null;
  business_name: string;
  items: any;
  total_usd: number | string;
  waybill_number: string | null;
  carrier: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface OrderFilterOptions {
  search?: string;
  status?: string;
  userId?: string;
  businessId?: string;
  carrier?: string;
  page?: number;
  limit?: number;
}

export interface CreateOrderDTO {
  id?: string;
  order_number: string;
  user_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address?: string | null;
  business_id?: string | null;
  business_name: string;
  items?: any;
  total_usd: number;
  waybill_number?: string | null;
  carrier?: string | null;
  status?: string;
}

export class OrderRepository {
  async create(data: CreateOrderDTO): Promise<OrderRow> {
    const db = getDb();
    const [row] = await db('orders')
      .insert({
        ...(data.id ? { id: data.id } : {}),
        order_number: data.order_number,
        user_id: data.user_id || null,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_address: data.customer_address || null,
        business_id: data.business_id || null,
        business_name: data.business_name,
        items: JSON.stringify(data.items || []),
        total_usd: data.total_usd,
        waybill_number: data.waybill_number || null,
        carrier: data.carrier || 'Swift Transit',
        status: data.status || 'Processing',
      })
      .returning('*');

    return row as OrderRow;
  }

  async findById(id: string): Promise<OrderRow | null> {
    const db = getDb();
    const row = await db('orders').where({ id }).first();
    return (row as OrderRow) || null;
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderRow | null> {
    const db = getDb();
    const row = await db('orders')
      .whereILike('order_number', orderNumber.trim())
      .first();
    return (row as OrderRow) || null;
  }

  async findOrders(options: OrderFilterOptions = {}): Promise<{
    orders: OrderRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = getDb();
    const { search, status, userId, businessId, carrier, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    let query = db('orders');

    if (userId) {
      query = query.where('user_id', userId);
    }

    if (businessId) {
      query = query.where('business_id', businessId);
    }

    if (carrier && carrier !== 'all') {
      query = query.whereILike('carrier', `%${carrier}%`);
    }

    if (status && status !== 'all') {
      query = query.where('status', status);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.where((builder) => {
        builder
          .whereILike('order_number', term)
          .orWhereILike('customer_name', term)
          .orWhereILike('customer_phone', term)
          .orWhereILike('business_name', term)
          .orWhereILike('waybill_number', term);
      });
    }

    const countQuery = query.clone().clearSelect().count('* as total');
    const [{ total }] = (await countQuery) as { total: string | number }[];
    const totalCount = Number(total);

    const rows = await query
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      orders: rows as OrderRow[],
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  }

  async update(id: string, data: Partial<CreateOrderDTO>): Promise<OrderRow> {
    const db = getDb();
    const updatePayload: any = { ...data, updated_at: db.fn.now() };
    if (data.items !== undefined) {
      updatePayload.items = JSON.stringify(data.items);
    }

    const [updated] = await db('orders')
      .where({ id })
      .update(updatePayload)
      .returning('*');

    if (!updated) {
      throw new NotFoundError(`Order '${id}' was not found`);
    }

    return updated as OrderRow;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb();
    const count = await db('orders').where({ id }).del();
    return count > 0;
  }

  async getSummaryStats(): Promise<{
    totalOrders: number;
    totalAmountUsd: number;
    inTransitCount: number;
    deliveredCount: number;
  }> {
    const db = getDb();
    const totalRes = await db('orders').count('* as total');
    const sumRes = await db('orders').sum('total_usd as total_usd');
    const transitRes = await db('orders').where('status', 'In Transit').count('* as in_transit');
    const deliveredRes = await db('orders').where('status', 'Delivered').count('* as delivered');

    return {
      totalOrders: Number(totalRes[0]?.total || 0),
      totalAmountUsd: Number(sumRes[0]?.total_usd || 0),
      inTransitCount: Number(transitRes[0]?.in_transit || 0),
      deliveredCount: Number(deliveredRes[0]?.delivered || 0),
    };
  }
}

export const orderRepository = new OrderRepository();
