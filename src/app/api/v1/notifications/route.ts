import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { notificationRepository } from '@/infrastructure/database/repositories/notification-repository';
import { AuthorizationError } from '@/shared/errors/AppError';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createNotificationSchema = z.object({
  userId: z.string().uuid().optional(),
  title: z.string().min(2).max(200),
  message: z.string().min(2),
  category: z.enum(['subscription', 'order', 'utility', 'job', 'system']).default('system'),
  actionUrl: z.string().max(255).optional(),
  actionLabel: z.string().max(100).optional(),
  severity: z.enum(['info', 'success', 'warning', 'urgent']).default('info'),
});

const patchAllSchema = z.object({
  action: z.enum(['mark_all_read']),
});

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const user = await getAuthenticatedUser(req, false);
    if (!user) {
      return jsonResponse(
        {
          notifications: [],
          total: 0,
          unreadCount: 0,
          authenticated: false,
        },
        requestId,
        200
      );
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const result = await notificationRepository.findForUser(user.id, {
      category,
      unreadOnly,
      limit,
      offset,
    });

    return jsonResponse(
      {
        ...result,
        authenticated: true,
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const user = await getAuthenticatedUser(req, true);
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    const body = await parseAndValidateBody(req, createNotificationSchema);
    const targetUserId = body.userId || user.id;

    if (targetUserId !== user.id && user.role !== 'admin') {
      throw new AuthorizationError('Only platform administrators can send notifications to other users');
    }

    const notification = await notificationRepository.create({
      userId: targetUserId,
      title: body.title,
      message: body.message,
      category: body.category ?? 'system',
      actionUrl: body.actionUrl,
      actionLabel: body.actionLabel,
      severity: body.severity ?? 'info',
    });

    return jsonResponse(
      {
        notification,
        message: 'Notification created.',
      },
      requestId,
      201
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function PATCH(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const user = await getAuthenticatedUser(req, true);
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    await parseAndValidateBody(req, patchAllSchema);
    const updatedCount = await notificationRepository.markAllAsRead(user.id);

    return jsonResponse(
      {
        updatedCount,
        message: 'All notifications marked as read.',
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function DELETE(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const user = await getAuthenticatedUser(req, true);
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    const deletedCount = await notificationRepository.clearAllForUser(user.id);
    return jsonResponse(
      {
        deletedCount,
        message: 'All notifications cleared.',
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
