import { getDb } from '../connection.js';
import { NotFoundError } from '../../../shared/errors/index.js';

export interface IdCardRow {
  id: string;
  card_number: string;
  business_id: string | null;
  business_name: string;
  member_name: string;
  member_role: string;
  national_id: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  status: 'Active' | 'Suspended' | 'Expired';
  qr_code_payload: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface IdCardFilterOptions {
  search?: string;
  status?: string;
  businessId?: string;
  page?: number;
  limit?: number;
}

export interface CreateIdCardDTO {
  id?: string;
  card_number: string;
  business_id?: string | null;
  business_name: string;
  member_name: string;
  member_role: string;
  national_id?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  status?: 'Active' | 'Suspended' | 'Expired';
  qr_code_payload?: string | null;
  photo_url?: string | null;
}

export class IdCardRepository {
  async create(data: CreateIdCardDTO): Promise<IdCardRow> {
    const db = getDb();
    const [row] = await db('id_cards')
      .insert({
        ...(data.id ? { id: data.id } : {}),
        card_number: data.card_number,
        business_id: data.business_id || null,
        business_name: data.business_name,
        member_name: data.member_name,
        member_role: data.member_role,
        national_id: data.national_id || null,
        issue_date: data.issue_date || db.raw('CURRENT_DATE'),
        expiry_date: data.expiry_date || db.raw("CURRENT_DATE + INTERVAL '2 years'"),
        status: data.status || 'Active',
        qr_code_payload: data.qr_code_payload || `https://sadzaconnect.co.zw/verify-id/${data.card_number}`,
        photo_url: data.photo_url || null,
      })
      .returning('*');

    return row as IdCardRow;
  }

  async findById(id: string): Promise<IdCardRow | null> {
    const db = getDb();
    const row = await db('id_cards').where({ id }).first();
    return (row as IdCardRow) || null;
  }

  async findByCardNumber(cardNumber: string): Promise<IdCardRow | null> {
    const db = getDb();
    const row = await db('id_cards')
      .whereILike('card_number', cardNumber.trim())
      .first();
    return (row as IdCardRow) || null;
  }

  async findCards(options: IdCardFilterOptions = {}): Promise<{
    cards: IdCardRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = getDb();
    const { search, status, businessId, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    let query = db('id_cards');

    if (businessId) {
      query = query.where('business_id', businessId);
    }

    if (status && status !== 'all') {
      query = query.where('status', status);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.where((builder) => {
        builder
          .whereILike('card_number', term)
          .orWhereILike('member_name', term)
          .orWhereILike('business_name', term)
          .orWhereILike('member_role', term)
          .orWhereILike('national_id', term);
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
      cards: rows as IdCardRow[],
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  }

  async update(id: string, data: Partial<CreateIdCardDTO>): Promise<IdCardRow> {
    const db = getDb();
    const [updated] = await db('id_cards')
      .where({ id })
      .update({
        ...data,
        updated_at: db.fn.now(),
      })
      .returning('*');

    if (!updated) {
      throw new NotFoundError(`ID Card '${id}' was not found`);
    }

    return updated as IdCardRow;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb();
    const count = await db('id_cards').where({ id }).del();
    return count > 0;
  }

  async getSummaryStats(): Promise<{
    totalCards: number;
    activeCards: number;
    suspendedCards: number;
  }> {
    const db = getDb();
    const totalRes = await db('id_cards').count('* as total');
    const activeRes = await db('id_cards').where('status', 'Active').count('* as active');
    const suspendedRes = await db('id_cards').where('status', 'Suspended').count('* as suspended');

    return {
      totalCards: Number(totalRes[0]?.total || 0),
      activeCards: Number(activeRes[0]?.active || 0),
      suspendedCards: Number(suspendedRes[0]?.suspended || 0),
    };
  }
}

export const idCardRepository = new IdCardRepository();
