import { getDb } from '../connection.js';
import { NotFoundError } from '../../../shared/errors/index.js';

export interface InvoiceRow {
  id: string;
  invoice_number: string;
  business_id: string | null;
  business_name: string;
  plan_type: string;
  amount_usd: number | string;
  payment_method: string;
  period_covered: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceFilterOptions {
  businessId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateInvoiceDTO {
  id?: string;
  invoice_number?: string;
  business_id?: string | null;
  business_name: string;
  plan_type: string;
  amount_usd: number;
  payment_method: string;
  period_covered?: string | null;
  status?: string;
}

export interface UpdateInvoiceDTO {
  status?: string;
  payment_method?: string;
  period_covered?: string | null;
}

export class InvoiceRepository {
  private generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `SC-INV-${year}-${randomSuffix}`;
  }

  async findInvoices(filters: InvoiceFilterOptions = {}): Promise<{
    invoices: InvoiceRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = getDb();
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 20));
    const offset = (page - 1) * limit;

    let query = db('invoices').select('invoices.*');

    if (filters.businessId) {
      query = query.where('invoices.business_id', filters.businessId);
    }

    if (filters.status && filters.status !== 'all') {
      query = query.where('invoices.status', filters.status);
    }

    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      query = query.where((q) => {
        q.whereILike('invoices.invoice_number', term)
          .orWhereILike('invoices.business_name', term)
          .orWhereILike('invoices.plan_type', term);
      });
    }

    const countResult = await query
      .clone()
      .clearSelect()
      .count('invoices.id as total')
      .first();

    const total = countResult ? parseInt(String(countResult.total), 10) : 0;

    const invoices: InvoiceRow[] = await query
      .orderBy('invoices.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findById(id: string): Promise<InvoiceRow | null> {
    const db = getDb();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      return this.findByInvoiceNumber(id);
    }
    const inv = await db('invoices').where('id', id).first();
    return inv || null;
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<InvoiceRow | null> {
    const db = getDb();
    const inv = await db('invoices').where('invoice_number', invoiceNumber).first();
    return inv || null;
  }

  async create(data: CreateInvoiceDTO): Promise<InvoiceRow> {
    const db = getDb();
    const invoiceNumber = data.invoice_number || this.generateInvoiceNumber();

    const insertData: any = {
      invoice_number: invoiceNumber,
      business_id: data.business_id || null,
      business_name: data.business_name,
      plan_type: data.plan_type,
      amount_usd: data.amount_usd,
      payment_method: data.payment_method,
      period_covered: data.period_covered || null,
      status: data.status || 'Paid',
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    };

    if (data.id) {
      insertData.id = data.id;
    }

    const [created] = await db('invoices').insert(insertData).returning('*');
    return created;
  }

  async update(id: string, data: UpdateInvoiceDTO): Promise<InvoiceRow> {
    const db = getDb();
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError(`Invoice '${id}' was not found`);
    }

    const updateData: any = {
      updated_at: db.fn.now(),
    };

    if (data.status !== undefined) updateData.status = data.status;
    if (data.payment_method !== undefined) updateData.payment_method = data.payment_method;
    if (data.period_covered !== undefined) updateData.period_covered = data.period_covered;

    const [updated] = await db('invoices')
      .where('id', existing.id)
      .update(updateData)
      .returning('*');

    return updated;
  }
}

export const invoiceRepository = new InvoiceRepository();
