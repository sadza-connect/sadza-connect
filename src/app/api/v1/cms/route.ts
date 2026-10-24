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

const updateCmsSchema = z.object({
  hero_headline: z.string().optional(),
  hero_subtitle: z.string().optional(),
  home_slides: z.array(z.any()).optional(),
  why_reasons: z.array(z.any()).optional(),
  process_steps: z.array(z.any()).optional(),
  about_headline: z.string().optional(),
  about_mission: z.string().optional().nullable(),
  about_vision: z.string().optional().nullable(),
  core_values: z.array(z.any()).optional(),
  support_email: z.string().email().optional(),
  support_phone: z.string().optional(),
  support_whatsapp: z.string().optional(),
  hq_address: z.string().optional(),
  harare_address: z.string().optional(),
  operating_hours: z.string().optional(),
  extra_config: z.record(z.any()).optional(),
});

function formatCmsResponse(settings: any) {
  const extra = settings.extra_config || {};
  return {
    home: {
      announcement: {
        text: extra.announcement_text ?? 'Official Launch: 30-Day Free Directory Onboarding for Zimbabwean Enterprises',
        enabled: extra.announcement_enabled !== false,
        link: extra.announcement_link ?? '/auth/register?role=business',
      },
      hero: {
        headline: settings.hero_headline,
        subtitle: settings.hero_subtitle,
        ctaLabel: extra.hero_cta_label ?? 'Explore Verified Directory',
      },
      slides: settings.home_slides || [],
      whyReasons: settings.why_reasons || [],
      processSteps: settings.process_steps || [],
    },
    about: {
      headline: settings.about_headline,
      mission: settings.about_mission,
      vision: settings.about_vision,
      coreValues: settings.core_values || [],
    },
    contact: {
      supportEmail: settings.support_email,
      supportPhone: settings.support_phone,
      supportWhatsApp: settings.support_whatsapp,
      hqAddress: settings.hq_address,
      harareAddress: settings.harare_address,
      operatingHours: settings.operating_hours,
    },
    raw: settings,
  };
}

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const settings = await settingsRepository.getSettings();
    const cms = formatCmsResponse(settings);
    return jsonResponse(cms, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function PATCH(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const caller = await getAuthenticatedUser(req, true);
    if (!caller || caller.role !== 'admin') {
      throw new AuthorizationError('Administrative privileges required');
    }

    const body = await parseAndValidateBody(req, updateCmsSchema);
    const updated = await settingsRepository.updateSettings(body);
    const cms = formatCmsResponse(updated);

    return jsonResponse(
      {
        message: 'Site CMS content successfully saved and synchronized across live pages.',
        cms,
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
