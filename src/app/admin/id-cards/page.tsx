'use client';

import { AdminComingSoon } from '@/components/admin/AdminComingSoon';

export default function AdminIdCardsPage() {
  return (
    <AdminComingSoon
      title="National ID & Corporate Identity Cards"
      category="Citizen & Enterprise Identity"
      description="The digital identification card issuance module is on hold for V1 while we focus on verified enterprise onboarding and marketplace trade. This module will launch in Phase 2."
      plannedFeatures={[
        'Digital QR-verifiable Zimbabwean National ID verification',
        'Corporate staff badges & physical PVC print templates',
        'Cryptographic barcode authenticity checks',
        'Batch export to standard printable card layouts',
      ]}
    />
  );
}
