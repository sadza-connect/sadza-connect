import { getDb } from '../connection.js';
import { NotFoundError } from '../../../shared/errors/index.js';

export interface BillPaymentRow {
  id: string;
  user_id: string | null;
  biller: string;
  account_number: string;
  meter_number: string | null;
  amount_usd: number | string;
  amount_zig: number | string | null;
  currency: string;
  token: string | null;
  units_kwh: number | string | null;
  payment_method: string;
  payment_reference: string;
  status: string;
  customer_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillFilterOptions {
  search?: string;
  biller?: string;
  status?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface CreateBillDTO {
  id?: string;
  user_id?: string | null;
  biller: string;
  account_number: string;
  meter_number?: string | null;
  amount_usd: number;
  amount_zig?: number | null;
  currency?: string;
  token?: string | null;
  units_kwh?: number | null;
  payment_method: string;
  payment_reference: string;
  status?: string;
  customer_name?: string | null;
}

export class BillRepository {
  async create(data: CreateBillDTO): Promise<BillPaymentRow> {
    const db = getDb();
    const [row] = await db('bill_payments')
      .insert({
        ...(data.id ? { id: data.id } : {}),
        user_id: data.user_id || null,
        biller: data.biller,
        account_number: data.account_number,
        meter_number: data.meter_number || null,
        amount_usd: data.amount_usd,
        amount_zig: data.amount_zig ?? null,
        currency: data.currency || 'USD',
        token: data.token || null,
        units_kwh: data.units_kwh ?? null,
        payment_method: data.payment_method,
        payment_reference: data.payment_reference,
        status: data.status || 'Completed',
        customer_name: data.customer_name || null,
      })
      .returning('*');

    return row as BillPaymentRow;
  }

  async findById(id: string): Promise<BillPaymentRow | null> {
    const db = getDb();
    const row = await db('bill_payments').where({ id }).first();
    return (row as BillPaymentRow) || null;
  }

  async findByReference(reference: string): Promise<BillPaymentRow | null> {
    const db = getDb();
    const row = await db('bill_payments').where({ payment_reference: reference }).first();
    return (row as BillPaymentRow) || null;
  }

  async findBillPayments(options: BillFilterOptions = {}): Promise<{
    bills: BillPaymentRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = getDb();
    const {
      search,
      biller,
      status,
      userId,
      page = 1,
      limit = 20,
    } = options;

    const offset = (page - 1) * limit;

    let query = db('bill_payments');

    if (userId) {
      query = query.where('user_id', userId);
    }

    if (biller) {
      query = query.whereILike('biller', `%${biller}%`);
    }

    if (status) {
      query = query.where('status', status);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.where((builder) => {
        builder
          .whereILike('payment_reference', term)
          .orWhereILike('account_number', term)
          .orWhereILike('meter_number', term)
          .orWhereILike('biller', term)
          .orWhereILike('customer_name', term)
          .orWhereILike('token', term);
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
      bills: rows as BillPaymentRow[],
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  }

  async getSummaryStats(): Promise<{
    totalReceipts: number;
    totalAmountUsd: number;
    totalZesaTokens: number;
  }> {
    const db = getDb();
    const countRes = await db('bill_payments').count('* as total');
    const sumRes = await db('bill_payments').sum('amount_usd as total_usd');
    const zesaRes = await db('bill_payments')
      .whereILike('biller', '%zesa%')
      .count('* as zesa_total');

    return {
      totalReceipts: Number(countRes[0]?.total || 0),
      totalAmountUsd: Number(sumRes[0]?.total_usd || 0),
      totalZesaTokens: Number(zesaRes[0]?.zesa_total || 0),
    };
  }
}

export const billRepository = new BillRepository();
