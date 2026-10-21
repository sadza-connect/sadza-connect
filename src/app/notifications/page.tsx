'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  Check,
  Trash2,
  Zap,
  CreditCard,
  Truck,
  Briefcase,
  Layers,
  ChevronRight,
  Filter,
  CheckCheck,
} from 'lucide-react';
import {
  PlatformNotification,
  DEFAULT_NOTIFICATIONS,
  loadStoredNotifications,
  saveStoredNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from '@/data/notificationsStore';
import { useToast } from '@/components/providers/ToastProvider';

type FilterCategory = 'all' | 'subscription' | 'utility' | 'order' | 'job' | 'system';

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<PlatformNotification[]>(DEFAULT_NOTIFICATIONS);
  const [filter, setFilter] = useState<FilterCategory>('all');

  const refreshList = () => {
    const list = loadStoredNotifications();
    setNotifications(list);
  };

  useEffect(() => {
    refreshList();
    const handleUpdate = () => refreshList();
    window.addEventListener('sadza-notifications-updated', handleUpdate);
    return () => window.removeEventListener('sadza-notifications-updated', handleUpdate);
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter((n) => n.category === filter);
  }, [notifications, filter]);

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    refreshList();
    toast({ title: 'All notifications marked as read', variant: 'success' });
  };

  const handleClearAll = () => {
    clearAllNotifications();
    refreshList();
    toast({ title: 'Notification inbox cleared', variant: 'info' });
  };

  const handleMarkSingleRead = (id: string) => {
    markNotificationAsRead(id);
    refreshList();
  };

  const handleDeleteSingle = (id: string) => {
    deleteNotification(id);
    refreshList();
    toast({ title: 'Notification removed', variant: 'info' });
  };

  const getCategoryIcon = (category: PlatformNotification['category']) => {
    switch (category) {
      case 'subscription':
        return <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'utility':
        return <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'order':
        return <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'job':
        return <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'system':
      default:
        return <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getCategoryBadgeClass = (category: PlatformNotification['category']) => {
    switch (category) {
      case 'subscription':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40';
      case 'utility':
        return 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40';
      case 'order':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40';
      case 'job':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/40';
      case 'system':
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 dark:text-white font-medium">Notifications & Activity</span>
          </nav>

          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#1e57eb] dark:text-blue-400 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Notifications
                  </h1>
                  {unreadCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1e57eb] text-white">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time updates on your directory subscriptions, utility receipts, and order waybills.
                </p>
              </div>
            </div>

            {/* Global Actions */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-[#1e57eb]" />
                  <span>Mark All Read</span>
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
            {[
              { id: 'all', label: 'All', count: notifications.length },
              {
                id: 'subscription',
                label: 'Subscriptions',
                count: notifications.filter((n) => n.category === 'subscription').length,
              },
              {
                id: 'utility',
                label: 'ZESA & Utilities',
                count: notifications.filter((n) => n.category === 'utility').length,
              },
              {
                id: 'order',
                label: 'Orders & Waybills',
                count: notifications.filter((n) => n.category === 'order').length,
              },
              {
                id: 'job',
                label: 'Job Applicants',
                count: notifications.filter((n) => n.category === 'job').length,
              },
              {
                id: 'system',
                label: 'Platform Alerts',
                count: notifications.filter((n) => n.category === 'system').length,
              },
            ].map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id as FilterCategory)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#1e57eb] text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Notifications Feed */}
          {filteredNotifications.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No Notifications Found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {filter === 'all'
                  ? "You're all caught up! When invoices, ZESA tokens, or order updates are generated, they will appear here."
                  : `No activity recorded in the ${filter} category yet.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((item) => {
                const isUnread = !item.read;
                return (
                  <div
                    key={item.id}
                    className={`group relative rounded-2xl border transition p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                      isUnread
                        ? 'bg-blue-50/20 dark:bg-blue-950/15 border-blue-200 dark:border-blue-900/60 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Unread dot indicator */}
                    {isUnread && (
                      <span className="absolute top-4 left-2 sm:left-3 w-2 h-2 rounded-full bg-[#1e57eb] animate-pulse" />
                    )}

                    <div className="flex items-start gap-3.5 pl-3 sm:pl-4">
                      {/* Category Badge Icon */}
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {getCategoryIcon(item.category)}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeClass(
                              item.category
                            )}`}
                          >
                            {item.category}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {item.timestamp}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {item.title}
                        </h3>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                          {item.message}
                        </p>

                        {/* Action CTA Button */}
                        {item.actionUrl && item.actionLabel && (
                          <div className="pt-2">
                            <Link
                              href={item.actionUrl}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1e57eb] hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
                            >
                              <span>{item.actionLabel}</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right action controls */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 flex-shrink-0">
                      {isUnread && (
                        <button
                          type="button"
                          onClick={() => handleMarkSingleRead(item.id)}
                          className="text-xs text-[#1e57eb] dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark read</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteSingle(item.id)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Dismiss notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
