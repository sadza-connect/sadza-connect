import { NextRequest, NextResponse } from 'next/server';
import { pingDb } from '@/infrastructure/database/connection';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();
  const dbOk = await pingDb();
  const status = dbOk ? 'healthy' : 'degraded';

  return NextResponse.json(
    {
      success: dbOk,
      data: {
        status,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: dbOk ? 'connected' : 'disconnected',
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    },
    {
      status: dbOk ? 200 : 503,
      headers: {
        'x-request-id': requestId,
      },
    },
  );
}
