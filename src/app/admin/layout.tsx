import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: 'Sadza Connect — Admin Console',
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
