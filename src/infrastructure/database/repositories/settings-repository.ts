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

    return {
      ...row,
      usd_to_zig_rate: parseFloat(row.usd_to_zig_rate?.toString() || '26.5'),
      monthly_subscription_price_usd: parseFloat(row.monthly_subscription_price_usd?.toString() || '10.0'),
      sponsored_advert_price_usd: parseFloat(row.sponsored_advert_price_usd?.toString() || '20.0'),
      free_grace_period_days: parseInt(row.free_grace_period_days?.toString() || '30', 10),
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

    return {
      ...updated,
      usd_to_zig_rate: parseFloat(updated.usd_to_zig_rate?.toString() || '26.5'),
      monthly_subscription_price_usd: parseFloat(updated.monthly_subscription_price_usd?.toString() || '10.0'),
      sponsored_advert_price_usd: parseFloat(updated.sponsored_advert_price_usd?.toString() || '20.0'),
      free_grace_period_days: parseInt(updated.free_grace_period_days?.toString() || '30', 10),
      extra_config: updated.extra_config || {},
    };
  }
}

export const settingsRepository = new SettingsRepository();
