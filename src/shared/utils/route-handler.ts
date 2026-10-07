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

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message:
          env.NODE_ENV === 'development'
            ? errorObj.message
            : 'Internal server error',
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    },
    {
      status: 500,
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
      throw new ValidationError('Validation failed', { fields: fieldErrors });
    }
    return result.data;
  }

  return body as T;
}
