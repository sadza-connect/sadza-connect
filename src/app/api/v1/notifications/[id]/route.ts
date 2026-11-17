import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import {
  jsonResponse,
  errorResponse,
} from '@/shared/utils/route-handler';
import { notificationRepository } from '@/infrastructure/database/repositories/notification-repository';
import { AuthorizationError, NotFoundError } from '@/shared/errors/AppError';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const user = await getAuthenticatedUser(req, true);
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    const { id } = await params;
    const updated = await notificationRepository.markAsRead(id, user.id);
    if (!updated) {
      throw new NotFoundError('Notification not found');
    }

    return jsonResponse(
      {
        notification: updated,
        message: 'Notification marked as read.',
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const user = await getAuthenticatedUser(req, true);
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    const { id } = await params;
    const deleted = await notificationRepository.deleteForUser(id, user.id);
    if (!deleted) {
      throw new NotFoundError('Notification not found');
    }

    return jsonResponse(
      {
        success: true,
        message: 'Notification deleted.',
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
