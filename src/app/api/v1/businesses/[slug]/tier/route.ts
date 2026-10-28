import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { businessRepository } from '@/infrastructure/database/repositories/business-repository';
import { settingsRepository } from '@/infrastructure/database/repositories/settings-repository';
import { invoiceRepository } from '@/infrastructure/database/repositories/invoice-repository';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from '@/shared/errors/AppError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const upgradeTierSchema = z.object({
  tier: z.enum(['starter', 'growth', 'enterprise']),
  payment_method: z.string().min(2, 'Payment method is required'),
  reference: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { slug } = await params;
    const user = await getAuthenticatedUser(req, true);
    if (!user) {
      throw new AuthorizationError('Authentication required to upgrade storefront tier');
    }

    const business = await businessRepository.findBySlug(slug);
    if (!business) {
      throw new NotFoundError(`Business listing '${slug}' was not found`);
    }

    const isAdmin = user.role === 'admin';
    const isOwner = business.user_id === user.id;

    if (!isAdmin && !isOwner) {
      throw new AuthorizationError('You do not have permission to manage this business storefront');
    }

    const body = await parseAndValidateBody(req, upgradeTierSchema);
    const settings = await settingsRepository.getSettings();

    let tierName = settings.tier_starter_name || 'Starter Storefront';
    let quotaLimit = settings.tier_starter_limit ?? 25;
    let priceUsd = Number(settings.tier_starter_price_usd) || 15.0;

    if (body.tier === 'growth') {
      tierName = settings.tier_growth_name || 'Growth Storefront';
      quotaLimit = settings.tier_growth_limit ?? 100;
      priceUsd = Number(settings.tier_growth_price_usd) || 25.0;
    } else if (body.tier === 'enterprise') {
      tierName = settings.tier_enterprise_name || 'Enterprise Wholesaler';
      quotaLimit = settings.tier_enterprise_limit ?? 300;
      priceUsd = Number(settings.tier_enterprise_price_usd) || 50.0;
    }

    // Update business product limit and catalog tier
    const updated = await businessRepository.update(business.id, {
      catalog_tier: body.tier,
      product_limit: quotaLimit,
      subscription_status: 'Paid Subscriber',
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Create an official invoice record for payment tracking
    const startDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const invoice = await invoiceRepository.create({
      business_id: business.id,
      business_name: business.name,
      plan_type: `Storefront Tier Upgrade: ${tierName} (${quotaLimit} Products)`,
      amount_usd: priceUsd,
      payment_method: body.payment_method,
      period_covered: `${startDate} – ${endDate}`,
      status: 'Paid',
    });

    return jsonResponse(
      {
        message: `Storefront tier successfully upgraded to ${tierName}! Your catalog quota is now ${quotaLimit} products.`,
        business: updated,
        invoice,
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
