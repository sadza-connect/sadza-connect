'use client';

import { AdminComingSoon } from '@/components/admin/AdminComingSoon';

export default function AdminBillPaymentsPage() {
  return (
    <AdminComingSoon
      title="ZESA & Utilities Billing Settlement"
      category="Utility & Bill Payments"
      description="The automatic ZESA prepaid token generation and municipal water billing reconciliation module is currently on hold. Direct enterprise listings and commercial supplies take priority for the V1 rollout."
      plannedFeatures={[
        'Automated 20-digit ZESA prepaid electricity token dispense',
        'ZETDC & Municipal utility API gateway integration',
        'Real-time EcoCash, OneMoney & ZiG settlement ledger',
        'Automated customer SMS & WhatsApp receipt delivery',
      ]}
    />
  );
}
