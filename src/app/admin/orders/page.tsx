'use client';

import { AdminComingSoon } from '@/components/admin/AdminComingSoon';

export default function AdminOrdersPage() {
  return (
    <AdminComingSoon
      title="In-App Orders & Cart Settlement"
      category="Commercial Transactions"
      description="In Sadza Connect V1, customer ordering and wholesale quotes operate directly via WhatsApp with zero middleman commissions. The centralized escrow and cart settlement ledger will be activated in Phase 2."
      plannedFeatures={[
        'Direct multi-vendor unified cart checkout',
        'Escrow protection for high-value commercial shipments',
        'Integrated ZimSwitch & EcoCash automated disbursement',
        'Waybill tracking and courier API integrations',
      ]}
    />
  );
}
