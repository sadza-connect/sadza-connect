import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { settingsRepository } from '@/infrastructure/database/repositories/settings-repository';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { AuthorizationError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const updateSettingsSchema = z.object({
  usd_to_zig_rate: z.number().positive().optional(),
  monthly_subscription_price_usd: z.number().positive().optional(),
  sponsored_advert_price_usd: z.number().positive().optional(),
  free_grace_period_days: z.number().int().nonnegative().optional(),
  support_whatsapp: z.string().optional(),
  support_phone: z.string().optional(),
  support_email: z.string().email().optional(),
  hq_address: z.string().optional(),
  harare_address: z.string().optional(),
  operating_hours: z.string().optional(),
  tier_starter_name: z.string().optional(),
  tier_starter_limit: z.number().int().positive().optional(),
  tier_starter_price_usd: z.number().nonnegative().optional(),
  tier_growth_name: z.string().optional(),
  tier_growth_limit: z.number().int().positive().optional(),
  tier_growth_price_usd: z.number().nonnegative().optional(),
  tier_enterprise_name: z.string().optional(),
  tier_enterprise_limit: z.number().int().positive().optional(),
  tier_enterprise_price_usd: z.number().nonnegative().optional(),
  extra_config: z.record(z.any()).optional(),
});

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const settings = await settingsRepository.getSettings();
    return jsonResponse({ settings }, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function PUT(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const user = await getAuthenticatedUser(req, true);
    if (!user || user.role !== 'admin') {
      throw new AuthorizationError('Only platform administrators can modify system settings');
    }

    const validatedData = await parseAndValidateBody(req, updateSettingsSchema);
    const updated = await settingsRepository.updateSettings(validatedData);

    return jsonResponse(
      {
        settings: updated,
        message: 'Platform settings updated successfully',
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
