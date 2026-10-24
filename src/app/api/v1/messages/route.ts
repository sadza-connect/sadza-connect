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
import { AuthorizationError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';

const createMessageSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().email('Please provide a valid email address'),
  phone: z.string().max(50).optional().nullable(),
  topic: z.string().min(2, 'Inquiry topic is required').max(100),
  message: z.string().min(5, 'Message must be at least 5 characters'),
});

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const body = await parseAndValidateBody(req, createMessageSchema);

    const message = await contactMessageRepository.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      topic: body.topic,
      message: body.message,
      status: 'New',
      priority: 'Normal',
    });

    return jsonResponse(
      {
        message: 'Your inquiry has been successfully submitted to Sadza Connect support.',
        inquiry: message,
      },
      requestId,
      201
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const caller = await getAuthenticatedUser(req, true);
    if (!caller || caller.role !== 'admin') {
      throw new AuthorizationError('Administrative privileges required');
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const result = await contactMessageRepository.findMessages({
      status,
      priority,
      search,
      page,
      limit,
    });

    return jsonResponse(result, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
