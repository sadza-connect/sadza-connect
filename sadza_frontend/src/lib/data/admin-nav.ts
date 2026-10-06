import {
  LayoutDashboard,
  Building2,
  ShoppingBag,
  Briefcase,
  Zap,
  Users,
  Settings,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

export const ADMIN_NAV: AdminNavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Verification Queue',
    href: '/admin/businesses',
    icon: FileCheck,
    badge: '3 Pending',
  },
  {
    label: 'Marketplace Listings',
    href: '/admin/marketplace',
    icon: ShoppingBag,
  },
  {
    label: 'Jobs Board',
    href: '/admin/jobs',
    icon: Briefcase,
  },
  {
    label: 'Utility Settlements',
    href: '/admin/bill-payments',
    icon: Zap,
  },
  {
    label: 'Platform Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];
