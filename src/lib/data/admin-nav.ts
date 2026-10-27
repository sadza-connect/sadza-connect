import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  BarChart3,
  LayoutTemplate,
  FileCheck,
  Package,
  Megaphone,
  ShoppingBag,
  Briefcase,
  ReceiptText,
  IdCard,
  MessageSquare,
  Users,
  Settings,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  comingSoon?: boolean;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Businesses & KYC', href: '/admin/businesses', icon: FileCheck },
  { label: 'Marketplace Stock', href: '/admin/marketplace', icon: Package },
  { label: 'Sponsored Adverts', href: '/admin/adverts', icon: Megaphone },
  { label: 'Careers & Jobs', href: '/admin/jobs', icon: Briefcase },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Users & Accounts', href: '/admin/users', icon: Users },
  { label: 'System Settings', href: '/admin/settings', icon: Settings },
  // Phase 2 Modules (On Hold)
  { label: 'Orders & Escrow', href: '/admin/orders', icon: ShoppingBag, comingSoon: true },
  { label: 'Bill Payments (ZESA)', href: '/admin/bill-payments', icon: ReceiptText, comingSoon: true },
  { label: 'ID Cards', href: '/admin/id-cards', icon: IdCard, comingSoon: true },
  { label: 'Messages & Chat', href: '/admin/messages', icon: MessageSquare, comingSoon: true },
  { label: 'Editorial CMS', href: '/admin/content', icon: LayoutTemplate, comingSoon: true },
];
