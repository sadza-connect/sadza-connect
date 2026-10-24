import { getDb } from '../connection.js';

export interface PlatformSettingsRow {
  id: string;
  usd_to_zig_rate: number | string;
  monthly_subscription_price_usd: number | string;
  sponsored_advert_price_usd: number | string;
  free_grace_period_days: number;
  support_whatsapp: string;
  support_phone: string;
  support_email: string;
  hq_address: string;
  harare_address: string;
  operating_hours: string;
  hero_headline?: string;
  hero_subtitle?: string;
  home_slides?: any[];
  why_reasons?: any[];
  process_steps?: any[];
  about_headline?: string;
  about_mission?: string | null;
  about_vision?: string | null;
  core_values?: any[];
  tier_starter_name?: string;
  tier_starter_limit?: number;
  tier_starter_price_usd?: number | string;
  tier_growth_name?: string;
  tier_growth_limit?: number;
  tier_growth_price_usd?: number | string;
  tier_enterprise_name?: string;
  tier_enterprise_limit?: number;
  tier_enterprise_price_usd?: number | string;
  extra_config?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UpdatePlatformSettingsDTO {
  usd_to_zig_rate?: number;
  monthly_subscription_price_usd?: number;
  sponsored_advert_price_usd?: number;
  free_grace_period_days?: number;
  support_whatsapp?: string;
  support_phone?: string;
  support_email?: string;
  hq_address?: string;
  harare_address?: string;
  operating_hours?: string;
  hero_headline?: string;
  hero_subtitle?: string;
  home_slides?: any[];
  why_reasons?: any[];
  process_steps?: any[];
  about_headline?: string;
  about_mission?: string | null;
  about_vision?: string | null;
  core_values?: any[];
  tier_starter_name?: string;
  tier_starter_limit?: number;
  tier_starter_price_usd?: number;
  tier_growth_name?: string;
  tier_growth_limit?: number;
  tier_growth_price_usd?: number;
  tier_enterprise_name?: string;
  tier_enterprise_limit?: number;
  tier_enterprise_price_usd?: number;
  extra_config?: Record<string, any>;
}

export class SettingsRepository {
  async getSettings(): Promise<PlatformSettingsRow> {
    const db = getDb();
    let row = await db('platform_settings').first();

    if (!row) {
      const [inserted] = await db('platform_settings')
        .insert({
          usd_to_zig_rate: 26.5,
          monthly_subscription_price_usd: 10.0,
          sponsored_advert_price_usd: 20.0,
          free_grace_period_days: 30,
          support_whatsapp: '263771000000',
          support_phone: '+263 77 100 0000',
          support_email: 'support@sadzaconnect.co.zw',
          hq_address: 'Africdominion House, 5th Street, Central Business District, Midlands',
          harare_address: 'Eastlea Commercial Park, Samora Machel Avenue, Harare',
          operating_hours: 'Monday – Friday: 08:00 – 17:00 CAT • Saturday: 08:00 – 13:00 CAT',
          extra_config: JSON.stringify({}),
        })
        .returning('*');
      row = inserted;
    }

    if (typeof row.extra_config === 'string') {
      try {
        row.extra_config = JSON.parse(row.extra_config);
      } catch {
        row.extra_config = {};
      }
    }

    const parseJsonArray = (val: any) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    return {
      ...row,
      usd_to_zig_rate: parseFloat(row.usd_to_zig_rate?.toString() || '26.5'),
      monthly_subscription_price_usd: parseFloat(row.monthly_subscription_price_usd?.toString() || '10.0'),
      sponsored_advert_price_usd: parseFloat(row.sponsored_advert_price_usd?.toString() || '20.0'),
      free_grace_period_days: parseInt(row.free_grace_period_days?.toString() || '30', 10),
      hero_headline: row.hero_headline || 'Connecting Zimbabwean Businesses, Customers & Everyday Trade',
      hero_subtitle: row.hero_subtitle || 'Discover verified local suppliers, shop marketplace items, find job vacancies, and recharge utility tokens across Harare, Bulawayo, Mutare, Gweru, and all 10 provinces.',
      home_slides: parseJsonArray(row.home_slides),
      why_reasons: parseJsonArray(row.why_reasons),
      process_steps: parseJsonArray(row.process_steps),
      about_headline: row.about_headline || 'Zimbabwe’s Unified Digital Commercial Infrastructure',
      about_mission: row.about_mission || 'Eliminating counterfeit supply risk and fragmented directories by providing a single, transparent, CR14-verified commercial network with predictable $10/month business subscriptions.',
      about_vision: row.about_vision || 'To be Zimbabwe’s most trusted digital commercial infrastructure, connecting every verified enterprise, supplier, and household across all 10 provinces and the global Diaspora.',
      core_values: parseJsonArray(row.core_values),
      tier_starter_name: row.tier_starter_name || 'Starter Storefront',
      tier_starter_limit: parseInt(row.tier_starter_limit?.toString() || '25', 10),
      tier_starter_price_usd: parseFloat(row.tier_starter_price_usd?.toString() || '15.0'),
      tier_growth_name: row.tier_growth_name || 'Growth Storefront',
      tier_growth_limit: parseInt(row.tier_growth_limit?.toString() || '100', 10),
      tier_growth_price_usd: parseFloat(row.tier_growth_price_usd?.toString() || '25.0'),
      tier_enterprise_name: row.tier_enterprise_name || 'Enterprise Wholesaler',
      tier_enterprise_limit: parseInt(row.tier_enterprise_limit?.toString() || '300', 10),
      tier_enterprise_price_usd: parseFloat(row.tier_enterprise_price_usd?.toString() || '50.0'),
      extra_config: row.extra_config || {},
    };
  }

  async updateSettings(data: UpdatePlatformSettingsDTO): Promise<PlatformSettingsRow> {
    const db = getDb();
    const current = await this.getSettings();

    const mergedExtraConfig = {
      ...(current.extra_config || {}),
      ...(data.extra_config || {}),
    };

    const updatePayload: Record<string, any> = {
      updated_at: db.fn.now(),
      extra_config: JSON.stringify(mergedExtraConfig),
    };

    if (data.usd_to_zig_rate !== undefined) updatePayload.usd_to_zig_rate = data.usd_to_zig_rate;
    if (data.monthly_subscription_price_usd !== undefined)
      updatePayload.monthly_subscription_price_usd = data.monthly_subscription_price_usd;
    if (data.sponsored_advert_price_usd !== undefined)
      updatePayload.sponsored_advert_price_usd = data.sponsored_advert_price_usd;
    if (data.free_grace_period_days !== undefined)
      updatePayload.free_grace_period_days = data.free_grace_period_days;
    if (data.support_whatsapp !== undefined) updatePayload.support_whatsapp = data.support_whatsapp;
    if (data.support_phone !== undefined) updatePayload.support_phone = data.support_phone;
    if (data.support_email !== undefined) updatePayload.support_email = data.support_email;
    if (data.hq_address !== undefined) updatePayload.hq_address = data.hq_address;
    if (data.harare_address !== undefined) updatePayload.harare_address = data.harare_address;
    if (data.operating_hours !== undefined) updatePayload.operating_hours = data.operating_hours;

    if (data.hero_headline !== undefined) updatePayload.hero_headline = data.hero_headline;
    if (data.hero_subtitle !== undefined) updatePayload.hero_subtitle = data.hero_subtitle;
    if (data.home_slides !== undefined) updatePayload.home_slides = JSON.stringify(data.home_slides);
    if (data.why_reasons !== undefined) updatePayload.why_reasons = JSON.stringify(data.why_reasons);
    if (data.process_steps !== undefined) updatePayload.process_steps = JSON.stringify(data.process_steps);
    if (data.about_headline !== undefined) updatePayload.about_headline = data.about_headline;
    if (data.about_mission !== undefined) updatePayload.about_mission = data.about_mission;
    if (data.about_vision !== undefined) updatePayload.about_vision = data.about_vision;
    if (data.core_values !== undefined) updatePayload.core_values = JSON.stringify(data.core_values);
    if (data.tier_starter_name !== undefined) updatePayload.tier_starter_name = data.tier_starter_name;
    if (data.tier_starter_limit !== undefined) updatePayload.tier_starter_limit = data.tier_starter_limit;
    if (data.tier_starter_price_usd !== undefined) updatePayload.tier_starter_price_usd = data.tier_starter_price_usd;
    if (data.tier_growth_name !== undefined) updatePayload.tier_growth_name = data.tier_growth_name;
    if (data.tier_growth_limit !== undefined) updatePayload.tier_growth_limit = data.tier_growth_limit;
    if (data.tier_growth_price_usd !== undefined) updatePayload.tier_growth_price_usd = data.tier_growth_price_usd;
    if (data.tier_enterprise_name !== undefined) updatePayload.tier_enterprise_name = data.tier_enterprise_name;
    if (data.tier_enterprise_limit !== undefined) updatePayload.tier_enterprise_limit = data.tier_enterprise_limit;
    if (data.tier_enterprise_price_usd !== undefined) updatePayload.tier_enterprise_price_usd = data.tier_enterprise_price_usd;

    const [updated] = await db('platform_settings')
      .where('id', current.id)
      .update(updatePayload)
      .returning('*');

    if (typeof updated.extra_config === 'string') {
      try {
        updated.extra_config = JSON.parse(updated.extra_config);
      } catch {
        updated.extra_config = {};
      }
    }

    const parseJsonArray = (val: any) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    return {
      ...updated,
      usd_to_zig_rate: parseFloat(updated.usd_to_zig_rate?.toString() || '26.5'),
      monthly_subscription_price_usd: parseFloat(updated.monthly_subscription_price_usd?.toString() || '10.0'),
      sponsored_advert_price_usd: parseFloat(updated.sponsored_advert_price_usd?.toString() || '20.0'),
      free_grace_period_days: parseInt(updated.free_grace_period_days?.toString() || '30', 10),
      hero_headline: updated.hero_headline || 'Connecting Zimbabwean Businesses, Customers & Everyday Trade',
      hero_subtitle: updated.hero_subtitle || 'Discover verified local suppliers, shop marketplace items, find job vacancies, and recharge utility tokens across Harare, Bulawayo, Mutare, Gweru, and all 10 provinces.',
      home_slides: parseJsonArray(updated.home_slides),
      why_reasons: parseJsonArray(updated.why_reasons),
      process_steps: parseJsonArray(updated.process_steps),
      about_headline: updated.about_headline || 'Zimbabwe’s Unified Digital Commercial Infrastructure',
      about_mission: updated.about_mission || 'Eliminating counterfeit supply risk and fragmented directories by providing a single, transparent, CR14-verified commercial network with predictable $10/month business subscriptions.',
      about_vision: updated.about_vision || 'To be Zimbabwe’s most trusted digital commercial infrastructure, connecting every verified enterprise, supplier, and household across all 10 provinces and the global Diaspora.',
      core_values: parseJsonArray(updated.core_values),
      tier_starter_name: updated.tier_starter_name || 'Starter Storefront',
      tier_starter_limit: parseInt(updated.tier_starter_limit?.toString() || '25', 10),
      tier_starter_price_usd: parseFloat(updated.tier_starter_price_usd?.toString() || '15.0'),
      tier_growth_name: updated.tier_growth_name || 'Growth Storefront',
      tier_growth_limit: parseInt(updated.tier_growth_limit?.toString() || '100', 10),
      tier_growth_price_usd: parseFloat(updated.tier_growth_price_usd?.toString() || '25.0'),
      tier_enterprise_name: updated.tier_enterprise_name || 'Enterprise Wholesaler',
      tier_enterprise_limit: parseInt(updated.tier_enterprise_limit?.toString() || '300', 10),
      tier_enterprise_price_usd: parseFloat(updated.tier_enterprise_price_usd?.toString() || '50.0'),
      extra_config: updated.extra_config || {},
    };
  }
}

export const settingsRepository = new SettingsRepository();
