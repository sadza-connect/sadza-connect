import { getDb } from '../connection.js';
import { NotFoundError } from '../../../shared/errors/index.js';
import { businessRepository } from './business-repository.js';

export interface ModerationReportRow {
  id: string;
  business_id: string | null;
  listing_title: string;
  listing_category: string;
  listing_image: string | null;
  reason: string;
  complaint_details: string;
  reporter_type: string;
  reporter_name: string | null;
  reporter_email: string | null;
  reporter_phone: string | null;
  status: string; // 'Under review' | 'Dismissed' | 'Suspended' | 'Hidden'
  admin_notes: string | null;
  enforcement_action: string | null;
  created_at: string;
  updated_at: string;
}

export interface ModerationFilterOptions {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class ModerationRepository {
  async findReports(filters: ModerationFilterOptions = {}): Promise<{
    reports: ModerationReportRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = getDb();
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 50));
    const offset = (page - 1) * limit;

    let query = db('moderation_reports').select('*');

    if (filters.status && filters.status !== 'all') {
      query = query.where('status', filters.status);
    }

    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      query = query.where((q) => {
        q.whereILike('listing_title', term)
          .orWhereILike('reason', term)
          .orWhereILike('complaint_details', term)
          .orWhereILike('reporter_name', term)
          .orWhereILike('reporter_email', term);
      });
    }

    const countResult = await query
      .clone()
      .clearSelect()
      .count('id as total')
      .first();

    const total = countResult ? parseInt(String(countResult.total), 10) : 0;

    const reports: ModerationReportRow[] = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      reports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findById(id: string): Promise<ModerationReportRow | null> {
    const db = getDb();
    const row = await db('moderation_reports').where({ id }).first();
    return row || null;
  }

  async applyEnforcement(
    id: string,
    action: 'dismiss' | 'hide' | 'suspend',
    adminNotes?: string
  ): Promise<ModerationReportRow> {
    const db = getDb();
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError(`Moderation report '${id}' was not found`);
    }

    let status = 'Under review';
    let enforcementAction = 'None';

    if (action === 'dismiss') {
      status = 'Dismissed';
      enforcementAction = 'Dismissed';
    } else if (action === 'hide') {
      status = 'Hidden';
      enforcementAction = 'Hidden';
    } else if (action === 'suspend') {
      status = 'Suspended';
      enforcementAction = 'Suspended';

      // If tied to a business, suspend that business in database
      if (existing.business_id) {
        try {
          await businessRepository.update(existing.business_id, {
            verification_status: 'Suspended',
            is_verified: false,
            subscription_status: 'Suspended',
          });
        } catch (err) {
          console.warn(`Failed to suspend associated business ${existing.business_id}:`, err);
        }
      }
    }

    const [updated] = await db('moderation_reports')
      .where({ id })
      .update({
        status,
        enforcement_action: enforcementAction,
        admin_notes: adminNotes || existing.admin_notes,
        updated_at: db.fn.now(),
      })
      .returning('*');

    return updated;
  }
}

export const moderationRepository = new ModerationRepository();
