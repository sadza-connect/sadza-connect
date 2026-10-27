'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Plus, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  // Hide on admin portal or full screen modals if needed
  if (pathname?.startsWith('/dashboard/admin')) {
    return null;
  }

  const profileHref = isAuthenticated
    ? user?.role === 'business_owner'
      ? '/dashboard/business'
      : user?.role === 'admin'
      ? '/dashboard/admin'
      : '/dashboard/user'
    : '/login';

  const listHref = isAuthenticated && user?.role === 'business_owner'
    ? '/dashboard/business?tab=products'
    : '/signup?type=business';

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Explore',
      href: '/businesses',
      icon: Compass,
      isActive: pathname.startsWith('/businesses'),
    },
    {
      label: 'List',
      href: listHref,
      icon: Plus,
      isSpecial: true,
      isActive: false,
    },
    {
      label: 'Market',
      href: '/marketplace',
      icon: ShoppingBag,
      isActive: pathname.startsWith('/marketplace'),
    },
    {
      label: isAuthenticated ? 'Account' : 'Profile',
      href: profileHref,
      icon: User,
      isActive: pathname.startsWith('/dashboard') || pathname === '/login' || pathname === '/signup',
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          if (item.isSpecial) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group -mt-5 flex flex-col items-center focus:outline-none"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-600 group-hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/35 border-3 border-white dark:border-slate-900 transition-all duration-200 active:scale-95">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
                item.isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
