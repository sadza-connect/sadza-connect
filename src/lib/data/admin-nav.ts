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
}

export const ADMIN_NAV: AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Page Content', href: '/admin/content', icon: LayoutTemplate },
  { label: 'Businesses & KYC', href: '/admin/businesses', icon: FileCheck, badge: 4 },
  { label: 'Products', href: '/admin/marketplace', icon: Package },
  { label: 'Sponsored Adverts', href: '/admin/adverts', icon: Megaphone, badge: '$20' },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag, badge: 3 },
  { label: 'Careers & Jobs', href: '/admin/jobs', icon: Briefcase, badge: 3 },
  { label: 'Receipts & Billing', href: '/admin/bill-payments', icon: ReceiptText },
  { label: 'ID Cards', href: '/admin/id-cards', icon: IdCard },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare, badge: 3 },
  { label: 'Users & Broadcasts', href: '/admin/users', icon: Users },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];
