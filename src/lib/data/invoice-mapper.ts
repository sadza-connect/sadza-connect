import type { BusinessSubscriptionInvoice } from '@/data/platformStore';

export function mapDbInvoiceToSubscriptionInvoice(inv: any): BusinessSubscriptionInvoice {
  const dateFormatted = inv.created_at
    ? new Date(inv.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Recently Generated';

  return {
    id: String(inv.id),
    invoiceNumber: inv.invoice_number,
    businessId: inv.business_id || '',
    businessName: inv.business_name || 'Commercial Client',
    planType: inv.plan_type || 'Monthly Business Listing ($10/mo)',
    amountUsd: Number(inv.amount_usd || 0),
    paymentMethod: (inv.payment_method as any) || 'EcoCash USD',
    date: dateFormatted,
    periodCovered: inv.period_covered || `${dateFormatted} – 30 Days`,
    status: (inv.status as any) || 'Paid',
  };
}
