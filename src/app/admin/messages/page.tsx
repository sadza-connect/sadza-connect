'use client';

import { AdminComingSoon } from '@/components/admin/AdminComingSoon';

export default function AdminMessagesPage() {
  return (
    <AdminComingSoon
      title="In-App Real-Time Messaging & Support"
      category="Communications & Support"
      description="In Sadza Connect V1, customer and merchant negotiations take place directly on WhatsApp. The built-in web socket chat and support ticketing system will be launched in Phase 2."
      plannedFeatures={[
        'Direct browser-to-browser buyer and vendor chat',
        'Official WhatsApp Business Cloud API sync',
        'Automated support ticketing and dispute arbitration',
        'Multi-agent administrative dispatch console',
      ]}
    />
  );
}
