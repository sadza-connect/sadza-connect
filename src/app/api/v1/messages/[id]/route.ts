import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { contactMessageRepository } from '@/infrastructure/database/repositories/contact-message-repository';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { AuthorizationError, NotFoundError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const updateMessageSchema = z.object({
  status: z.enum(['New', 'In Progress', 'Resolved']).optional(),
  priority: z.enum(['Low', 'Normal', 'High']).optional(),
  admin_notes: z.string().optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();
  const { id } = await Promise.resolve(params);

  try {
    const caller = await getAuthenticatedUser(req, true);
    if (!caller || caller.role !== 'admin') {
      throw new AuthorizationError('Administrative privileges required');
    }

    const data = await parseAndValidateBody(req, updateMessageSchema);

    const updated = await contactMessageRepository.update(id, {
      status: data.status,
      priority: data.priority,
      admin_notes: data.admin_notes,
    });

    return jsonResponse(
      {
        message: 'Message status updated successfully',
        inquiry: updated,
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();
  const { id } = await Promise.resolve(params);

  try {
    const caller = await getAuthenticatedUser(req, true);
    if (!caller || caller.role !== 'admin') {
      throw new AuthorizationError('Administrative privileges required');
    }

    const deleted = await contactMessageRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Message with ID ${id} not found`);
    }

    return jsonResponse(
      {
        message: 'Message deleted successfully',
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
