import type { UtilityReceipt } from '@/data/platformStore';

export function mapDbBillToReceipt(bill: any): UtilityReceipt {
  const dateStr = bill.created_at
    ? new Date(bill.created_at).toLocaleDateString('en-GB')
    : 'Just now';

  let serviceName: UtilityReceipt['service'] = 'ZESA Prepaid Token';
  const billerLower = (bill.biller || '').toLowerCase();
  if (billerLower.includes('water')) {
    serviceName = 'Municipal Water';
  } else if (billerLower.includes('dstv')) {
    serviceName = 'DStv Subscription';
  }

  const accountOrMeter = bill.meter_number || bill.account_number || '';
  const tokenOrConf = bill.token || bill.payment_reference || 'CONFIRMED';
  const unitsOrPkg = bill.units_kwh
    ? `${Number(bill.units_kwh).toFixed(1)} kWh`
    : billerLower.includes('water')
    ? 'Municipal Settlement'
    : 'Active Subscription';

  return {
    id: String(bill.id),
    reference: bill.payment_reference || `REC-${String(bill.id).slice(0, 8)}`,
    service: serviceName,
    accountOrMeter,
    customerPhone: bill.customer_phone || bill.phone_number || '+263772000000',
    currency: (bill.currency as 'USD' | 'ZiG') || 'USD',
    amount: Number(bill.currency === 'ZiG' && bill.amount_zig ? bill.amount_zig : bill.amount_usd) || 0,
    tokenOrConfirmation: tokenOrConf,
    unitsOrPackage: unitsOrPkg,
    date: dateStr,
    status: (bill.status as any) || 'Completed',
  };
}
