import { NextRequest } from 'next/server';
import { jsonResponse } from '@/shared/utils/route-handler';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();
  return jsonResponse(
    {
      name: 'Sadza Connect Unified API',
      version: '1.0.0',
      description: "Zimbabwe's Commercial Super-App & Authentication Service",
      status: 'operational',
      health: '/api/v1/health',
      auth: '/api/v1/auth',
    },
    requestId,
  );
}
