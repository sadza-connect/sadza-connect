import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import type { ZodSchema } from 'zod';
import { AppError, ValidationError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';
import { env } from '../../config/env.js';

export interface RouteContext<TBody = unknown> {
  req: NextRequest;
  body: TBody;
  requestId: string;
  clientIp: string;
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

export function jsonResponse<T>(
  data: T,
  requestId: string,
  statusCode = 200,
  extraHeaders?: Record<string, string>,
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    },
    {
      status: statusCode,
      headers: {
        'x-request-id': requestId,
        ...extraHeaders,
      },
    },
  );
}

export function errorResponse(
  err: unknown,
  requestId: string,
): NextResponse {
  if (err instanceof AppError) {
    logger.warn(
      {
        code: err.code,
        statusCode: err.statusCode,
        requestId,
        details: err.details,
      },
      err.message,
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          ...(err.details && { details: err.details }),
        },
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: err.statusCode,
        headers: {
          'x-request-id': requestId,
        },
      },
    );
  }

  const errorObj = err instanceof Error ? err : new Error(String(err));
  logger.error(
    {
      err: errorObj,
      requestId,
    },
    'Unhandled internal error in API Route Handler',
  );

  let clientMessage = 'An unexpected server error occurred. Please try again in a few moments.';
  let clientCode = 'INTERNAL_ERROR';
  let statusCode = 500;

  if (errorObj.message) {
    const raw = errorObj.message.toLowerCase();

    // Transient database socket and connection resets
    if (
      raw.includes('econnreset') ||
      raw.includes('read econnreset') ||
      raw.includes('write econnreset') ||
      raw.includes('57p01') ||
      raw.includes('connection terminated') ||
      raw.includes('client was closed') ||
      raw.includes('socket hang up') ||
      raw.includes('broken pipe')
    ) {
      clientMessage =
        'Database connection was temporarily interrupted. Please try again in a moment.';
      clientCode = 'DATABASE_CONNECTION_ERROR';
      statusCode = 503;
    } else if (
      raw.includes('eai_again') ||
      raw.includes('getaddrinfo') ||
      raw.includes('etimedout') ||
      raw.includes('econnrefused') ||
      raw.includes('enotfound')
    ) {
      clientMessage =
        'Unable to establish secure connection. Please check your internet connection and try again.';
      clientCode = 'NETWORK_ERROR';
      statusCode = 503;
    } else if (
      raw.includes('select ') ||
      raw.includes('insert into') ||
      raw.includes('update ') ||
      raw.includes('delete from') ||
      raw.includes('relation ') ||
      raw.includes('column ') ||
      raw.includes('syntax error') ||
      raw.includes('supabase') ||
      raw.includes('postgres') ||
      raw.includes('knex') ||
      raw.includes('pooler')
    ) {
      // Never expose raw SQL queries or database schemas to users or client apps
      clientMessage =
        'Database service is temporarily unavailable. Please try again in a few moments.';
      clientCode = 'DATABASE_ERROR';
      statusCode = 503;
    } else if (
      raw.includes('duplicate key') ||
      raw.includes('unique constraint') ||
      raw.includes('already exists')
    ) {
      clientMessage =
        'A record with these details already exists. Please check your information.';
      clientCode = 'CONFLICT';
      statusCode = 409;
    } else if (env.NODE_ENV === 'development' && !raw.includes('select ') && !raw.includes('users')) {
      clientMessage = errorObj.message;
    }
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: clientCode,
        message: clientMessage,
        ...(env.NODE_ENV === 'development' && { devOriginalMessage: errorObj.message }),
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    },
    {
      status: statusCode,
      headers: {
        'x-request-id': requestId,
      },
    },
  );
}

export async function parseAndValidateBody<T>(
  req: NextRequest,
  schema?: ZodSchema<T>,
): Promise<T> {
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    // If empty or non-JSON body provided
    body = {};
  }

  if (schema) {
    const result = schema.safeParse(body);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const firstIssue = result.error.issues[0]?.message || 'Validation failed';
      throw new ValidationError(firstIssue, { fields: fieldErrors });
    }
    return result.data;
  }

  return body as T;
}
