'use client';

import { AdminComingSoon } from '@/components/admin/AdminComingSoon';

export default function AdminContentPage() {
  return (
    <AdminComingSoon
      title="Dynamic Page Content & Editorial CMS"
      category="Content Management"
      description="Public static pages, platform FAQs, and legal compliance terms are managed via code configuration in V1. A visual drag-and-drop editorial CMS will be introduced in Phase 2."
      plannedFeatures={[
        'Visual rich-text editor for news and blog articles',
        'Dynamic announcement banner scheduling & geo-targeting',
        'Automated multi-language localization (English, Shona, Ndebele)',
        'SEO metadata editor and OpenGraph image previewer',
      ]}
    />
  );
}
