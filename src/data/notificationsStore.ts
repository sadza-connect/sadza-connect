export interface PlatformNotification {
  id: string;
  title: string;
  message: string;
  category: 'subscription' | 'order' | 'utility' | 'job' | 'system';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  severity: 'info' | 'success' | 'warning' | 'urgent';
}

export const DEFAULT_NOTIFICATIONS: PlatformNotification[] = [
  {
    id: 'notif-1',
    title: 'Grace Period Expiration Warning',
    message:
      'Your complimentary 30-day Free Registration Grace Period expires in 4 days. Upgrade to maintain your verified badge and directory rank.',
    category: 'subscription',
    timestamp: '15 mins ago',
    read: false,
    actionUrl: '/checkout?plan=listing',
    actionLabel: 'Renew Membership ($10/mo)',
    severity: 'warning',
  },
  {
    id: 'notif-2',
    title: 'ZESA Prepaid Token Generated',
    message:
      'Token 4829-1029-4820-1940 credited for meter 04192049102 (54.2 kWh) via EcoCash USD ($15.00). Official receipt ready.',
    category: 'utility',
    timestamp: '2 hours ago',
    read: false,
    actionUrl: '/dashboard/user',
    actionLabel: 'View Meter Receipt',
    severity: 'success',
  },
  {
    id: 'notif-3',
    title: 'New Job Candidate Application',
    message:
      'Tinashe Sibanda submitted an application with CV for "Solar Technical Sales & Installation Engineer".',
    category: 'job',
    timestamp: '5 hours ago',
    read: false,
    actionUrl: '/dashboard/business',
    actionLabel: 'Review Candidate',
    severity: 'info',
  },
  {
    id: 'notif-4',
    title: 'Commercial Tax Invoice Settled',
    message:
      'Invoice SC-INV-2026-084 for Monthly Business Listing ($10/mo) marked as Paid via EcoCash. Period active through 31 Oct 2026.',
    category: 'subscription',
    timestamp: 'Yesterday',
    read: true,
    actionUrl: '/dashboard/business',
    actionLabel: 'Download Tax Invoice',
    severity: 'success',
  },
  {
    id: 'notif-5',
    title: 'Swift Cargo Waybill Dispatched',
    message:
      'Batanai Building Supplies dispatched 100x PPC Cement bags. Consignment in transit with Swift Transit (Waybill: SWF-84910).',
    category: 'order',
    timestamp: '2 days ago',
    read: true,
    actionUrl: '/dashboard/user',
    actionLabel: 'Track Delivery',
    severity: 'info',
  },
  {
    id: 'notif-6',
    title: 'National Platform Update v2.4 Live',
    message:
      'Enhanced WhatsApp RFQ enquiry routing and dual-currency Zimbabwe Gold (ZiG) conversion rates now active nationwide.',
    category: 'system',
    timestamp: '3 days ago',
    read: true,
    actionUrl: '/',
    actionLabel: 'Explore Features',
    severity: 'info',
  },
];

import { getClientAccessToken } from '@/shared/utils/api-client';

const NOTIFICATIONS_STORAGE_KEY = 'sadza_notifications_v1';

function getAuthHeaders(): Record<string, string> {
  const token = getClientAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function loadStoredNotifications(): PlatformNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveStoredNotifications(list: PlatformNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('sadza-notifications-updated'));
  } catch {
    // ignore
  }
}

export async function syncNotificationsFromApi(): Promise<{
  notifications: PlatformNotification[];
  unreadCount: number;
  authenticated: boolean;
}> {
  if (typeof window === 'undefined') {
    return { notifications: [], unreadCount: 0, authenticated: false };
  }
  try {
    const res = await fetch('/api/v1/notifications?limit=50', {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const cached = loadStoredNotifications();
      return {
        notifications: cached,
        unreadCount: cached.filter((n) => !n.read).length,
        authenticated: false,
      };
    }
    const json = await res.json();
    const payload = json.data || json;
    const list: PlatformNotification[] = Array.isArray(payload?.notifications)
      ? payload.notifications
      : [];
    const authenticated = Boolean(payload?.authenticated);
    const unreadCount = typeof payload?.unreadCount === 'number'
      ? payload.unreadCount
      : list.filter((n) => !n.read).length;

    saveStoredNotifications(list);
    return { notifications: list, unreadCount, authenticated };
  } catch (err) {
    console.warn('[NotificationsStore] Failed to sync from API:', err);
    const cached = loadStoredNotifications();
    return {
      notifications: cached,
      unreadCount: cached.filter((n) => !n.read).length,
      authenticated: false,
    };
  }
}

export function markNotificationAsRead(id: string): void {
  const current = loadStoredNotifications();
  const updated = current.map((item) => (item.id === id ? { ...item, read: true } : item));
  saveStoredNotifications(updated);

  if (typeof window !== 'undefined') {
    fetch(`/api/v1/notifications/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
    }).catch((err) => console.warn('[NotificationsStore] API mark read failed:', err));
  }
}

export function markAllNotificationsAsRead(): void {
  const current = loadStoredNotifications();
  const updated = current.map((item) => ({ ...item, read: true }));
  saveStoredNotifications(updated);

  if (typeof window !== 'undefined') {
    fetch('/api/v1/notifications', {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ action: 'mark_all_read' }),
    }).catch((err) => console.warn('[NotificationsStore] API mark all read failed:', err));
  }
}

export function deleteNotification(id: string): void {
  const current = loadStoredNotifications();
  const updated = current.filter((item) => item.id !== id);
  saveStoredNotifications(updated);

  if (typeof window !== 'undefined') {
    fetch(`/api/v1/notifications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    }).catch((err) => console.warn('[NotificationsStore] API delete failed:', err));
  }
}

export function clearAllNotifications(): void {
  saveStoredNotifications([]);

  if (typeof window !== 'undefined') {
    fetch('/api/v1/notifications', {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    }).catch((err) => console.warn('[NotificationsStore] API clear all failed:', err));
  }
}
