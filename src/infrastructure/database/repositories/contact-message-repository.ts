import { getDb } from '../connection.js';
import { NotFoundError } from '../../../shared/errors/index.js';

export interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  topic: string;
  message: string;
  status: string;
  priority: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageFilterOptions {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateContactMessageDTO {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  topic: string;
  message: string;
  status?: string;
  priority?: string;
  admin_notes?: string | null;
}

export interface UpdateContactMessageDTO {
  status?: string;
  priority?: string;
  admin_notes?: string | null;
}

export class ContactMessageRepository {
  async findMessages(filters: ContactMessageFilterOptions = {}): Promise<{
    messages: ContactMessageRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = getDb();
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 50));
    const offset = (page - 1) * limit;

    let query = db('contact_messages').select('*');

    if (filters.status && filters.status !== 'all') {
      query = query.where('status', filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      query = query.where('priority', filters.priority);
    }

    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      query = query.where((q) => {
        q.whereILike('name', term)
          .orWhereILike('email', term)
          .orWhereILike('phone', term)
          .orWhereILike('topic', term)
          .orWhereILike('message', term);
      });
    }

    const countResult = await query
      .clone()
      .clearSelect()
      .count('id as total')
      .first();

    const total = countResult ? parseInt(String(countResult.total), 10) : 0;

    const messages: ContactMessageRow[] = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findById(id: string): Promise<ContactMessageRow | null> {
    const db = getDb();
    const row = await db('contact_messages').where('id', id).first();
    return row || null;
  }

  async create(data: CreateContactMessageDTO): Promise<ContactMessageRow> {
    const db = getDb();
    const insertData: any = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone ? data.phone.trim() : null,
      topic: data.topic.trim(),
      message: data.message.trim(),
      status: data.status || 'New',
      priority: data.priority || 'Normal',
      admin_notes: data.admin_notes || null,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    };

    if (data.id) {
      insertData.id = data.id;
    }

    const [created] = await db('contact_messages').insert(insertData).returning('*');
    return created;
  }

  async update(id: string, data: UpdateContactMessageDTO): Promise<ContactMessageRow> {
    const db = getDb();
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError(`Contact message '${id}' was not found`);
    }

    const updateData: any = {
      updated_at: db.fn.now(),
    };

    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.admin_notes !== undefined) updateData.admin_notes = data.admin_notes;

    const [updated] = await db('contact_messages')
      .where('id', existing.id)
      .update(updateData)
      .returning('*');

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb();
    const count = await db('contact_messages').where('id', id).delete();
    return count > 0;
  }
}

export const contactMessageRepository = new ContactMessageRepository();
