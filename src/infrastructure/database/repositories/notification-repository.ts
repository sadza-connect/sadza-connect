import { getDb } from '../connection.js';
import { randomUUID } from 'node:crypto';
import type { PlatformNotification } from '@/data/notificationsStore';

export interface NotificationRow {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  category: string;
  action_url: string | null;
  action_label: string | null;
  severity: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationDTO {
  userId: string;
  title: string;
  message: string;
  category: PlatformNotification['category'];
  actionUrl?: string;
  actionLabel?: string;
  severity?: PlatformNotification['severity'];
}

function formatRelativeTimestamp(isoDate: string | Date): string {
  const created = new Date(isoDate).getTime();
  if (Number.isNaN(created)) return 'Recently';
  const diffMs = Math.max(0, Date.now() - created);
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(created).toLocaleDateString('en-ZW', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function mapRowToNotification(
  row: NotificationRow
): PlatformNotification & { userId?: string | null; createdAt?: string } {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    category: (row.category as PlatformNotification['category']) || 'system',
    timestamp: formatRelativeTimestamp(row.created_at),
    createdAt: row.created_at,
    read: Boolean(row.is_read),
    actionUrl: row.action_url || undefined,
    actionLabel: row.action_label || undefined,
    severity: (row.severity as PlatformNotification['severity']) || 'info',
  };
}

export class NotificationRepository {
  private get db() {
    return getDb();
  }

  async findForUser(
    userId: string,
    options: { category?: string; unreadOnly?: boolean; limit?: number; offset?: number } = {}
  ): Promise<{
    notifications: (PlatformNotification & { userId?: string | null; createdAt?: string })[];
    total: number;
    unreadCount: number;
  }> {
    const { category, unreadOnly = false, limit = 50, offset = 0 } = options;

    let query = this.db('notifications').where('user_id', userId);
    if (category && category !== 'all') {
      query = query.where('category', category);
    }
    if (unreadOnly) {
      query = query.where('is_read', false);
    }

    const [countRes, unreadRes, rows] = await Promise.all([
      query.clone().count<{ count: string | number }[]>('id as count'),
      this.db('notifications')
        .where({ user_id: userId, is_read: false })
        .count<{ count: string | number }[]>('id as count'),
      query.clone().orderBy('created_at', 'desc').limit(limit).offset(offset),
    ]);

    return {
      notifications: rows.map(mapRowToNotification),
      total: Number(countRes[0]?.count || 0),
      unreadCount: Number(unreadRes[0]?.count || 0),
    };
  }

  async findById(id: string): Promise<(PlatformNotification & { userId?: string | null }) | null> {
    const row = await this.db('notifications').where('id', id).first();
    if (!row) return null;
    return mapRowToNotification(row);
  }

  async create(dto: CreateNotificationDTO): Promise<PlatformNotification & { userId?: string | null }> {
    const now = new Date().toISOString();
    const [row] = await this.db('notifications')
      .insert({
        id: randomUUID(),
        user_id: dto.userId,
        title: dto.title.slice(0, 200),
        message: dto.message,
        category: dto.category,
        action_url: dto.actionUrl ? dto.actionUrl.slice(0, 255) : null,
        action_label: dto.actionLabel ? dto.actionLabel.slice(0, 100) : null,
        severity: dto.severity || 'info',
        is_read: false,
        created_at: now,
        updated_at: now,
      })
      .returning('*');

    return mapRowToNotification(row);
  }

  /**
   * Non-throwing helper for emitting notifications from transactional workflows
   * (orders, ZESA bills, KYC verification, job applications).
   */
  async createSafely(dto: CreateNotificationDTO): Promise<void> {
    if (!dto.userId) return;
    try {
      await this.create(dto);
    } catch (err) {
      console.warn('[NotificationRepository] Failed to emit notification:', err);
    }
  }

  /**
   * Emits a notification to a registered user looked up by email address.
   */
  async createForEmailSafely(
    email: string | null | undefined,
    dto: Omit<CreateNotificationDTO, 'userId'>
  ): Promise<void> {
    if (!email || !email.trim()) return;
    try {
      const user = await this.db('users')
        .whereRaw('LOWER(email) = ?', [email.trim().toLowerCase()])
        .select('id')
        .first();
      if (user?.id) {
        await this.create({ ...dto, userId: user.id });
      }
    } catch (err) {
      console.warn('[NotificationRepository] Failed to emit email-targeted notification:', err);
    }
  }

  /**
   * Broadcasts an administrative alert notification to all active admin accounts.
   */
  async notifyAdminsSafely(dto: Omit<CreateNotificationDTO, 'userId'>): Promise<void> {
    try {
      const admins = await this.db('users').where({ role: 'admin' }).select('id');
      if (!admins || admins.length === 0) return;

      const now = new Date().toISOString();
      await this.db('notifications').insert(
        admins.map((admin: { id: string }) => ({
          id: randomUUID(),
          user_id: admin.id,
          title: dto.title.slice(0, 200),
          message: dto.message,
          category: dto.category,
          action_url: dto.actionUrl ? dto.actionUrl.slice(0, 255) : null,
          action_label: dto.actionLabel ? dto.actionLabel.slice(0, 100) : null,
          severity: dto.severity || 'info',
          is_read: false,
          created_at: now,
          updated_at: now,
        }))
      );
    } catch (err) {
      console.warn('[NotificationRepository] Failed to notify admins:', err);
    }
  }

  async markAsRead(id: string, userId: string): Promise<PlatformNotification | null> {
    const [row] = await this.db('notifications')
      .where({ id, user_id: userId })
      .update({
        is_read: true,
        updated_at: new Date().toISOString(),
      })
      .returning('*');

    return row ? mapRowToNotification(row) : null;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const count = await this.db('notifications')
      .where({ user_id: userId, is_read: false })
      .update({
        is_read: true,
        updated_at: new Date().toISOString(),
      });
    return count;
  }

  async deleteForUser(id: string, userId: string): Promise<boolean> {
    const deleted = await this.db('notifications').where({ id, user_id: userId }).del();
    return deleted > 0;
  }

  async clearAllForUser(userId: string): Promise<number> {
    return this.db('notifications').where({ user_id: userId }).del();
  }
}

export const notificationRepository = new NotificationRepository();
