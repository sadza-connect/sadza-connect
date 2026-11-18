import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { getDb } from '@/infrastructure/database/connection';
import { emailService } from '@/infrastructure/messaging/email-service';
import { notificationRepository } from '@/infrastructure/database/repositories/notification-repository';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { AuthorizationError, ValidationError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const broadcastSchema = z.object({
  subject: z.string().min(2, 'Email subject is required').max(200),
  eyebrow: z.string().max(120).optional(),
  htmlBody: z.string().min(5, 'Email body is required'),
  segment: z.enum(['all', 'businesses', 'corporate', 'customers']).default('all'),
  directEmail: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const caller = await getAuthenticatedUser(req, true);
    if (!caller || caller.role !== 'admin') {
      throw new AuthorizationError('Administrative privileges required to dispatch broadcasts');
    }

    const body = await parseAndValidateBody(req, broadcastSchema);
    const db = getDb();

    let query = db('users')
      .where({ status: 'active' })
      .whereNull('deleted_at')
      .select('id', 'email', 'role', 'account_type');

    if (body.directEmail) {
      query = query.whereRaw('LOWER(email) = ?', [body.directEmail.trim().toLowerCase()]);
    } else if (body.segment === 'businesses') {
      query = query.where({ role: 'merchant' });
    } else if (body.segment === 'corporate') {
      query = query.where({ account_type: 'business' });
    } else if (body.segment === 'customers') {
      query = query.where({ role: 'customer' });
    }

    const recipients: Array<{ id: string; email: string }> = await query;
    if (recipients.length === 0) {
      throw new ValidationError('No active recipient accounts matched the selected segment.');
    }

    const plainSnippet = body.htmlBody
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180);

    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        await emailService.sendBroadcastEmail(recipient.email, {
          subject: body.subject,
          eyebrow: body.eyebrow,
          htmlBody: body.htmlBody,
        });
        await notificationRepository.createSafely({
          userId: recipient.id,
          title: body.subject,
          message: plainSnippet,
          category: 'system',
          severity: 'info',
        });
        sent++;
      } catch {
        failed++;
      }
    }

    return jsonResponse(
      {
        message: `Broadcast dispatched to ${sent} of ${recipients.length} account(s).`,
        total: recipients.length,
        sent,
        failed,
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
