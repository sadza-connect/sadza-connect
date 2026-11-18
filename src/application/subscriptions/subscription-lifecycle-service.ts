import { getDb } from '../../infrastructure/database/connection.js';
import { notificationRepository } from '../../infrastructure/database/repositories/notification-repository.js';
import { emailService } from '../../infrastructure/messaging/email-service.js';
import { logger } from '../../shared/logging/logger.js';

const DAY_MS = 24 * 60 * 60 * 1000;
/** Reminder bands, in days before expiry. */
export const REMINDER_BANDS = [7, 3, 1] as const;
const ACTIVE_STATUSES = ['Month 1 Grace Period', 'Paid Subscriber'];

interface SubscriptionRow {
  id: string;
  name: string;
  user_id: string | null;
  email: string | null;
  subscription_status: string;
  subscription_expires_at: Date | string;
  subscription_reminder_days: number | null;
  subscription_reminder_for: Date | string | null;
}

export interface SubscriptionRunSummary {
  expired: number;
  reminded: number;
  failed: number;
}

export class SubscriptionLifecycleService {
  /**
   * Expires overdue subscriptions and sends 7/3/1-day renewal reminders.
   * Safe to run repeatedly: each reminder band is sent once per expiry date.
   */
  async run(now: Date = new Date()): Promise<SubscriptionRunSummary> {
    const summary: SubscriptionRunSummary = { expired: 0, reminded: 0, failed: 0 };
    const db = getDb();

    const baseQuery = () =>
      db('businesses as b')
        .leftJoin('users as u', 'u.id', 'b.user_id')
        .whereIn('b.subscription_status', ACTIVE_STATUSES)
        .whereNotNull('b.subscription_expires_at')
        .select(
          'b.id',
          'b.name',
          'b.user_id',
          'u.email',
          'b.subscription_status',
          'b.subscription_expires_at',
          'b.subscription_reminder_days',
          'b.subscription_reminder_for',
        );

    // 1) Expire everything that is past its end date
    const overdue: SubscriptionRow[] = await baseQuery().where('b.subscription_expires_at', '<=', now);
    for (const biz of overdue) {
      try {
        await db('businesses')
          .where({ id: biz.id })
          .update({ subscription_status: 'Expired', updated_at: db.fn.now() });
        summary.expired++;

        const wasTrial = biz.subscription_status === 'Month 1 Grace Period';
        await this.notify(biz, {
          title: wasTrial ? 'Free Month Ended' : 'Subscription Expired',
          message: wasTrial
            ? `The free month for "${biz.name}" has ended. Upgrade to keep your listings and contact details visible.`
            : `The subscription for "${biz.name}" has expired. Renew now to restore your listings and contact details.`,
          severity: 'urgent',
          actionLabel: wasTrial ? 'Upgrade Now' : 'Renew Now',
        });
      } catch (err) {
        summary.failed++;
        logger.error({ err, businessId: biz.id }, '[SUBSCRIPTIONS] Failed to expire business');
      }
    }

    // 2) Send reminders for those expiring within the largest band
    const horizon = new Date(now.getTime() + REMINDER_BANDS[0] * DAY_MS);
    const upcoming: SubscriptionRow[] = await baseQuery()
      .where('b.subscription_expires_at', '>', now)
      .where('b.subscription_expires_at', '<=', horizon);

    for (const biz of upcoming) {
      try {
        const expiresAt = new Date(biz.subscription_expires_at);
        const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / DAY_MS);
        const band = Math.min(...REMINDER_BANDS.filter((b) => daysLeft <= b));
        if (!Number.isFinite(band)) continue;

        const sameExpiry =
          biz.subscription_reminder_for != null &&
          new Date(biz.subscription_reminder_for).getTime() === expiresAt.getTime();
        const alreadySent =
          sameExpiry && biz.subscription_reminder_days != null && biz.subscription_reminder_days <= band;
        if (alreadySent) continue;

        const wasTrial = biz.subscription_status === 'Month 1 Grace Period';
        const when = daysLeft <= 1 ? 'tomorrow' : `in ${daysLeft} days`;
        await this.notify(biz, {
          title: wasTrial ? 'Free Month Ending Soon' : 'Subscription Expiring Soon',
          message: wasTrial
            ? `The free month for "${biz.name}" ends ${when}. Upgrade to keep your listings visible.`
            : `The subscription for "${biz.name}" expires ${when}. Renew to avoid losing visibility.`,
          severity: band === 1 ? 'urgent' : 'warning',
          actionLabel: wasTrial ? 'Upgrade Now' : 'Renew Now',
        });

        await db('businesses')
          .where({ id: biz.id })
          .update({
            subscription_reminder_days: band,
            subscription_reminder_for: expiresAt,
          });
        summary.reminded++;
      } catch (err) {
        summary.failed++;
        logger.error({ err, businessId: biz.id }, '[SUBSCRIPTIONS] Failed to send reminder');
      }
    }

    logger.info(summary, '[SUBSCRIPTIONS] Daily lifecycle run complete');
    return summary;
  }

  private async notify(
    biz: SubscriptionRow,
    payload: { title: string; message: string; severity: 'warning' | 'urgent'; actionLabel: string },
  ): Promise<void> {
    if (biz.user_id) {
      await notificationRepository.createSafely({
        userId: biz.user_id,
        title: payload.title,
        message: payload.message,
        category: 'subscription',
        severity: payload.severity,
        actionUrl: '/pricing',
        actionLabel: payload.actionLabel,
      });
    }

    if (biz.email) {
      try {
        await emailService.sendSubscriptionNoticeEmail(biz.email, {
          businessName: biz.name,
          title: payload.title,
          message: payload.message,
          actionLabel: payload.actionLabel,
        });
      } catch (err) {
        // Email failure must never block the lifecycle update
        logger.warn({ err, businessId: biz.id }, '[SUBSCRIPTIONS] Notice email failed');
      }
    }
  }
}

export const subscriptionLifecycleService = new SubscriptionLifecycleService();
