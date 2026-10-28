import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { contactMessageRepository } from '@/infrastructure/database/repositories/contact-message-repository';
import { emailService } from '@/infrastructure/messaging/email-service';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { AuthorizationError, NotFoundError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const replySchema = z.object({
  reply: z.string().min(1, 'Reply message cannot be empty'),
});

export async function POST(
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

    const body = await parseAndValidateBody(req, replySchema);

    const message = await contactMessageRepository.findById(id);
    if (!message) {
      throw new NotFoundError(`Message with ID ${id} not found`);
    }

    // 1. Dispatch official email reply to client
    await emailService.sendContactReplyEmail(message.email, {
      recipientName: message.name,
      topic: message.topic,
      replyMessage: body.reply,
    });

    // 2. Mark message as Resolved and record notes
    const updatedNotes = message.admin_notes
      ? `${message.admin_notes}\n[Reply on ${new Date().toISOString()}]: ${body.reply}`
      : `[Reply on ${new Date().toISOString()}]: ${body.reply}`;

    const updated = await contactMessageRepository.update(id, {
      status: 'Resolved',
      admin_notes: updatedNotes,
    });

    return jsonResponse(
      {
        message: `Reply successfully dispatched to ${message.name} (${message.email}) and ticket resolved.`,
        inquiry: updated,
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
