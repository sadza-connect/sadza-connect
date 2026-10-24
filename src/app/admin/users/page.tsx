'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Users,
  Send,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Building,
  ShoppingBag,
  Sparkles,
  Check,
  Eye,
  Plus,
  UserPlus,
  ShieldAlert,
  ShieldX,
  Key,
  RefreshCw,
  Loader2,
  Trash2,
} from 'lucide-react';
import {
  AdminPageHeader,
  Panel,
  StatCard,
  IconButton,
  AdminBadge,
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  SearchInput,
  FilterSelect,
  Toolbar,
  ResultCount,
  EmptyState,
  TableSkeleton,
  AdminModal,
  AdminPasswordConfirmationModal,
  ModalBody,
  ModalSection,
  ModalGrid,
  ModalFooter,
} from '@/components/admin/AdminUI';
import { useToast } from '@/components/providers/ToastProvider';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  source: string;
  role: 'Customer' | 'Business Owner' | 'Corporate Client' | 'Admin';
  status: 'Active' | 'Suspended';
  ordersCount: number;
  totalSpent: number;
  joinedDate: string;
}

interface BroadcastTemplate {
  id: string;
  category: string;
  name: string;
  description: string;
  eyebrow: string;
  defaultSubject: string;
  defaultContentHtml: string;
}

const BROADCAST_TEMPLATES: BroadcastTemplate[] = [
  {
    id: 'grace_expiry_reminder',
    category: 'Billing & Subscriptions',
    name: '30-Day Grace Period & $10/mo Renewal',
    description: 'Notify business owners whose 30-day complimentary trial is concluding to renew at $10/month.',
    eyebrow: 'Business Directory Renewal',
    defaultSubject: 'Action Required: Keep Your Sadza Connect Verified Storefront Active ($10/mo)',
    defaultContentHtml: `
      <h2 style="margin-top:0;color:#0a1018;">Keep Your Verified Storefront Live Across All 10 Provinces</h2>
      <p>Dear Business Partner,</p>
      <p>Your complimentary <strong>30-day onboarding grace period</strong> on Sadza Connect is approaching its conclusion. During this period, your storefront, product catalogue, and direct WhatsApp enquiry links have been visible to corporate procurement officers and retail buyers nationwide.</p>
      <p>To maintain uninterrupted visibility and retain your <strong>CR14 / ZIMRA Verified Badge</strong>, please complete your <strong>$10.00 USD / month</strong> standard directory subscription via EcoCash, InnBucks, or Visa/Mastercard.</p>
      <p><strong>Need homepage spotlight visibility?</strong> Upgrade to a <strong>$20.00 USD / month Sponsored Advert</strong> to pin your promotion in the Top 6 slots on the Sadza Connect homepage.</p>
    `,
  },
  {
    id: 'new_verified_suppliers',
    category: 'Marketplace Digest',
    name: 'New Verified Suppliers & Bulk Stock Arrival',
    description: 'Announce newly verified solar, agricultural, and construction suppliers to registered buyers.',
    eyebrow: 'Marketplace Supply Update',
    defaultSubject: 'New ZIMRA-Verified Suppliers & Wholesale Inventory Now Live on Sadza Connect',
    defaultContentHtml: `
      <h2 style="margin-top:0;color:#0a1018;">Fresh Wholesale & Retail Stock Across Zimbabwe</h2>
      <p>Hello,</p>
      <p>We have onboarded 18 newly verified manufacturers, agro-dealers, and solar engineering suppliers in <strong>Harare, Bulawayo, Mutare, and Gweru</strong> this week.</p>
      <ul>
        <li><strong>Solar & Power Backup:</strong> 5kVA–10kVA Hybrid Inverters & LiFePO4 Battery Stacks in stock.</li>
        <li><strong>Agro-Processing & Milling:</strong> Grade-A Maize Meal, Stockfeeds, and Irrigation Kits.</li>
        <li><strong>Building Materials:</strong> PPC Surebuild Cement, IBR Chromadek Roofing, and Structural Timber.</li>
      </ul>
      <p>Compare verified prices and order with inter-provincial waybill tracking directly on Sadza Connect.</p>
    `,
  },
  {
    id: 'sponsored_adverts_promo',
    category: 'Advertising Campaign',
    name: 'Homepage Top-6 Sponsored Slot Availability',
    description: 'Invite verified businesses to reserve a $20/mo homepage featured banner slot.',
    eyebrow: 'Sponsored Placement ($20/mo)',
    defaultSubject: 'Boost Your Sales: Reserve a Top-6 Homepage Sponsored Slot on Sadza Connect',
    defaultContentHtml: `
      <h2 style="margin-top:0;color:#0a1018;">Capture High-Intent Buyers on the Sadza Connect Homepage</h2>
      <p>Dear Verified Merchant,</p>
      <p>Our analytics show that businesses featured in the <strong>Homepage Top-6 Sponsored Adverts</strong> receive up to <strong>4.8x more direct WhatsApp enquiries and quote requests</strong>.</p>
      <p>For only <strong>$20.00 USD / month</strong>, your campaign receives:</p>
      <ul>
        <li>Priority placement on the Sadza Connect Homepage & Dedicated Adverts Hub</li>
        <li>Custom promotional offer badge (e.g., "15% Off Bulk Orders")</li>
        <li>Direct click-to-WhatsApp and storefront deep-linking</li>
      </ul>
    `,
  },
  {
    id: 'zesa_utility_announcement',
    category: 'Utility & Biller Update',
    name: 'Instant ZESA Tokens & Municipal Rates Update',
    description: 'Inform customers about instant ZESA prepaid token vending and zero-downtime settlement.',
    eyebrow: 'Instant Bill Payments',
    defaultSubject: 'Zero-Queue ZESA Prepaid Tokens, Nyaradzo & Council Rates on Sadza Connect',
    defaultContentHtml: `
      <h2 style="margin-top:0;color:#0a1018;">Buy ZESA Tokens & Settle Utility Bills in Under 5 Seconds</h2>
      <p>Dear Valued User,</p>
      <p>Skip the queues and power your home or business premises effortlessly. Our direct ZETDC prepaid vending gateway is operating at 99.98% uptime with instant 20-digit token generation via SMS and printable QR receipt.</p>
      <p>Pay seamlessly using <strong>EcoCash USD/ZiG, InnBucks, OneMoney, or ZimSwitch</strong>.</p>
    `,
  },
  {
    id: 'careers_hiring_digest',
    category: 'Careers & Recruitment',
    name: 'Weekly Zimbabwe Executive & Technical Jobs Digest',
    description: 'Share top verified vacancies from Zimbabwean employers with job seekers.',
    eyebrow: 'Verified Careers Board',
    defaultSubject: 'New Verified Careers & Technical Vacancies Across Zimbabwe This Week',
    defaultContentHtml: `
      <h2 style="margin-top:0;color:#0a1018;">Explore Verified Career Opportunities in Zimbabwe</h2>
      <p>Hello,</p>
      <p>Top CR14-verified companies on Sadza Connect are actively recruiting across Engineering, Agronomy, Finance, and Logistics.</p>
      <p>Ensure your <strong>Candidate CV Profile</strong> is updated in your Personal Dashboard so hiring managers can fast-track your application and schedule interviews directly.</p>
    `,
  },
];

const INITIAL_USERS: UserRecord[] = [];


export default function AdminUsersPage() {
  const { toast } = useToast();
  const [usersList, setUsersList] = useState<UserRecord[]>(INITIAL_USERS);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // New user state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newRole, setNewRole] = useState<UserRecord['role']>('Customer');

  // Loading states
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Broadcast Form State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(BROADCAST_TEMPLATES[0].id);
  const [emailSubject, setEmailSubject] = useState(BROADCAST_TEMPLATES[0].defaultSubject);
  const [emailEyebrow, setEmailEyebrow] = useState(BROADCAST_TEMPLATES[0].eyebrow);
  const [emailBody, setEmailBody] = useState(BROADCAST_TEMPLATES[0].defaultContentHtml.trim());
  const [targetAudience, setTargetAudience] = useState<'all' | 'businesses' | 'corporate' | 'customers'>('all');
  const [previewMode, setPreviewMode] = useState(false);

  // Helper for auth headers
  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sadza_access_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  // Fetch users from database
  const fetchUsersFromDb = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      const res = await fetch('/api/v1/users?limit=100', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return;
      const json = await res.json();
      if (json.data?.users && Array.isArray(json.data.users)) {
        const mapped: UserRecord[] = json.data.users.map((u: any) => ({
          id: u.id,
          name: u.full_name || 'Unnamed User',
          email: u.email,
          phone: u.phone_number || '',
          organization: u.business_name || (u.role === 'admin' ? 'Sadza Connect Operations HQ' : 'Individual Account'),
          source: u.role === 'admin' ? 'Internal Executive Console' : (u.business_name ? 'Business Directory' : 'Public Sign-Up'),
          role: u.role === 'admin' ? 'Admin' : (u.role === 'merchant' ? 'Business Owner' : 'Customer'),
          status: u.status === 'suspended' ? 'Suspended' : 'Active',
          ordersCount: 0,
          totalSpent: 0,
          joinedDate: u.created_at
            ? new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Recent',
        }));
        setUsersList(mapped);
      }
    } catch (err) {
      console.warn('Could not fetch live users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchUsersFromDb();
  }, [fetchUsersFromDb]);

  const stats = useMemo(() => {
    const total = usersList.length;
    const businesses = usersList.filter((u) => u.role === 'Business Owner').length;
    const corporate = usersList.filter((u) => u.role === 'Corporate Client' || u.ordersCount >= 5).length;
    const staff = usersList.filter((u) => u.role === 'Admin').length;
    return { total, businesses, corporate, staff };
  }, [usersList]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return usersList.filter((u) => {
      const matchesQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.organization.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [usersList, query, roleFilter]);

  function handleSelectTemplate(tpl: BroadcastTemplate) {
    setSelectedTemplateId(tpl.id);
    setEmailSubject(tpl.defaultSubject);
    setEmailEyebrow(tpl.eyebrow);
    setEmailBody(tpl.defaultContentHtml.trim());
  }

  function handleSendBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide both subject and email content.',
        variant: 'error',
      });
      return;
    }

    toast({
      title: 'Broadcast Campaign Dispatched!',
      description: `Delivered "${emailSubject}" to segment "${targetAudience.toUpperCase()}".`,
      variant: 'success',
    });
    setBroadcastOpen(false);
  }

  function openDirectBroadcast(user: UserRecord) {
    setEmailSubject(`Sadza Connect Executive Notice — ${user.organization}`);
    setEmailEyebrow('Direct Account Notice');
    setEmailBody(
      `<p>Dear ${user.name},</p><p>We are reaching out from Sadza Connect Operations regarding your account (${user.organization}).</p>`
    );
    setTargetAudience('all');
    setBroadcastOpen(true);
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;
    if (!newPassword.trim() || newPassword.length < 8) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 8 characters long.',
        variant: 'error',
      });
      return;
    }

    const roleMap: Record<UserRecord['role'], 'admin' | 'merchant' | 'customer'> = {
      'Admin': 'admin',
      'Business Owner': 'merchant',
      'Corporate Client': 'customer',
      'Customer': 'customer',
    };

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fullName: newName.trim(),
          email: newEmail.trim().toLowerCase(),
          password: newPassword.trim(),
          role: roleMap[newRole],
          phoneNumber: newPhone.trim() || undefined,
          businessName: newOrg.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'Failed to create user account');
      }

      toast({
        title: newRole === 'Admin' ? 'Administrator Created' : 'User Account Created',
        description: `${newName} has been successfully provisioned as ${newRole}.`,
        variant: 'success',
      });

      setCreateOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewPhone('');
      setNewOrg('');
      await fetchUsersFromDb();
    } catch (err: any) {
      toast({
        title: 'Failed to Create Account',
        description: err.message || 'An error occurred while provisioning the account.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateRole(userId: string, newDbRole: 'admin' | 'merchant' | 'customer') {
    try {
      setActionLoadingId(userId);
      const res = await fetch(`/api/v1/users/${userId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newDbRole }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to update account role');
      }

      toast({
        title: 'Role Updated',
        description: `Account role successfully updated to ${newDbRole.toUpperCase()}.`,
        variant: 'success',
      });

      await fetchUsersFromDb();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                role: newDbRole === 'admin' ? 'Admin' : newDbRole === 'merchant' ? 'Business Owner' : 'Customer',
              }
            : null
        );
      }
    } catch (err: any) {
      toast({
        title: 'Role Update Failed',
        description: err.message || 'Could not update role.',
        variant: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleUpdateStatus(userId: string, newStatus: 'active' | 'suspended') {
    try {
      setActionLoadingId(userId);
      const res = await fetch(`/api/v1/users/${userId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to update status');
      }

      toast({
        title: 'Status Updated',
        description: `Account status is now marked as ${newStatus.toUpperCase()}.`,
        variant: 'success',
      });

      await fetchUsersFromDb();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus === 'active' ? 'Active' : 'Suspended',
              }
            : null
        );
      }
    } catch (err: any) {
      toast({
        title: 'Status Update Failed',
        description: err.message || 'Could not update status.',
        variant: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  }

  // Security Re-Authentication Modal State
  const [securityModal, setSecurityModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    actionType: 'danger' | 'warning';
    onConfirmAction: () => Promise<void>;
  }>({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Authorize',
    actionType: 'danger',
    onConfirmAction: async () => {},
  });

  const requestSecurityAuth = (
    title: string,
    description: string,
    confirmLabel: string,
    actionType: 'danger' | 'warning',
    action: () => Promise<void>
  ) => {
    setSecurityModal({
      open: true,
      title,
      description,
      confirmLabel,
      actionType,
      onConfirmAction: action,
    });
  };

  async function handleVerifyAndExecute(password: string) {
    const res = await fetch('/api/v1/auth/verify-password', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ password }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || json.message || 'Invalid administrator credentials');
    }
    await securityModal.onConfirmAction();
  }

  function promptSuspendUser(user: UserRecord) {
    requestSecurityAuth(
      `Suspend Account: ${user.name}`,
      `You are about to suspend ${user.name} (${user.email}). The user will immediately be barred from logging in, managing listings, and accessing storefront services.`,
      'Suspend Account',
      'danger',
      () => handleUpdateStatus(user.id, 'suspended')
    );
  }

  function promptReactivateUser(user: UserRecord) {
    requestSecurityAuth(
      `Reactivate Account: ${user.name}`,
      `You are about to restore full access for ${user.name} (${user.email}).`,
      'Reactivate Account',
      'warning',
      () => handleUpdateStatus(user.id, 'active')
    );
  }

  function promptPromoteAdmin(user: UserRecord) {
    requestSecurityAuth(
      `Elevate to Super Administrator: ${user.name}`,
      `CRITICAL SECURITY ACTION: You are granting FULL Administrative privileges to ${user.name} (${user.email}). This user will have unrestricted access to manage platform content, billing, user accounts, and databases.`,
      'Authorize Admin Role',
      'danger',
      () => handleUpdateRole(user.id, 'admin')
    );
  }

  function promptDemoteAdmin(user: UserRecord) {
    requestSecurityAuth(
      `Demote Administrator: ${user.name}`,
      `You are removing administrator privileges from ${user.name} (${user.email}).`,
      'Demote Role',
      'warning',
      () => handleUpdateRole(user.id, 'merchant')
    );
  }

  function promptDeleteUser(user: UserRecord) {
    requestSecurityAuth(
      `Permanently Delete User Account: ${user.name}`,
      `PERMANENT DELETION: You are about to delete ${user.name} (${user.email}). This account will be removed, and all associated businesses and listings will be deactivated. This action cannot be undone.`,
      'Delete Account Permanently',
      'danger',
      async () => {
        try {
          setActionLoadingId(user.id);
          const res = await fetch(`/api/v1/users/${user.id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
          const json = await res.json();
          if (!res.ok) {
            throw new Error(json.error?.message || json.message || 'Failed to delete user account');
          }
          toast({
            title: 'Account Deleted',
            description: `User account for ${user.name} has been deleted.`,
            variant: 'success',
          });
          setSelectedUser(null);
          await fetchUsersFromDb();
        } catch (err: any) {
          toast({
            title: 'Account Deletion Failed',
            description: err.message || 'Could not delete user account.',
            variant: 'error',
          });
        } finally {
          setActionLoadingId(null);
        }
      }
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Registered Users & Broadcast Suite"
        description="Manage verified business owners, corporate buyers, personal accounts, and launch segmented email broadcast campaigns with 5 pre-built Zimbabwe commercial templates."
      >
        <div className="flex flex-wrap items-center gap-2">
          <AdminButton
            variant="outline"
            onClick={() => fetchUsersFromDb()}
            disabled={isLoadingUsers}
            title="Reload users list"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingUsers ? 'animate-spin' : ''}`} />
            Refresh
          </AdminButton>
          <AdminButton variant="outline" onClick={() => setCreateOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Add User Account
          </AdminButton>
          <AdminButton onClick={() => setBroadcastOpen(true)}>
            <Send className="h-4 w-4" /> New Email Broadcast
          </AdminButton>
        </div>
      </AdminPageHeader>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Registered Users"
          value={stats.total}
          hint="All authenticated profiles"
          icon={Users}
        />
        <StatCard
          label="Business Owners"
          value={stats.businesses}
          hint="Directory & marketplace merchants"
          icon={Building}
        />
        <StatCard
          label="Corporate Buyers"
          value={stats.corporate}
          hint="High-volume procurement accounts"
          icon={ShieldCheck}
        />
        <StatCard
          label="Administrators"
          value={stats.staff}
          hint="Executive operations staff"
          icon={ShoppingBag}
        />
      </div>

      {/* Directory Table Panel */}
      <Panel>
        <Toolbar>
          <SearchInput
            value={query}
            onChange={(val) => setQuery(val)}
            placeholder="Search users by name, email, phone, organization..."
          />
          <FilterSelect
            value={roleFilter}
            onChange={(val) => setRoleFilter(val)}
            label="Filter by role"
          >
            <option value="all">All Roles</option>
            <option value="Business Owner">Business Owner</option>
            <option value="Corporate Client">Corporate Client</option>
            <option value="Customer">Customer / Buyer</option>
            <option value="Admin">Administrator</option>
          </FilterSelect>
          <ResultCount shown={filtered.length} total={usersList.length} noun="user" />
        </Toolbar>

        {isLoadingUsers ? (
          <TableSkeleton columns={6} rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="Try changing your search query or role filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium sm:px-6">User / Contact</th>
                  <th className="px-4 py-3 font-medium">Organization / Scope</th>
                  <th className="px-4 py-3 font-medium">Role & Status</th>
                  <th className="px-4 py-3 font-medium">Orders & Volume</th>
                  <th className="px-4 py-3 font-medium">Registered Date</th>
                  <th className="px-5 py-3 text-right font-medium sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-4 sm:px-6 whitespace-nowrap">
                      <p className="font-semibold text-slate-950">{user.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                      {user.phone && <p className="text-[0.7rem] text-slate-400">{user.phone}</p>}
                    </td>
                    <td className="px-4 py-4 text-slate-700 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        {user.organization}
                      </span>
                      <span className="text-[0.7rem] text-slate-400 block mt-0.5">{user.source}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-1">
                        <AdminBadge
                          tone={
                            user.role === 'Admin'
                              ? 'brand'
                              : user.role === 'Business Owner'
                              ? 'info'
                              : user.role === 'Corporate Client'
                              ? 'success'
                              : 'neutral'
                          }
                        >
                          {user.role}
                        </AdminBadge>
                        {user.status === 'Suspended' ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <ShieldAlert className="h-3 w-3 text-rose-600" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[0.68rem] text-emerald-700 font-medium">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
                        <ShoppingBag className="h-3 w-3 text-[#1e57eb]" />
                        {user.ordersCount} {user.ordersCount === 1 ? 'order' : 'orders'}
                      </span>
                      {user.totalSpent > 0 && (
                        <p className="text-[0.7rem] font-semibold text-slate-500 mt-0.5">
                          ${user.totalSpent.toLocaleString()} USD
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {user.joinedDate}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap sm:px-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <IconButton
                          icon={Eye}
                          label="View Account Details"
                          onClick={() => setSelectedUser(user)}
                        />
                        <button
                          type="button"
                          onClick={() => openDirectBroadcast(user)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#1e57eb]/25 bg-[#eef4ff] px-2.5 py-1 text-xs font-semibold text-[#1e57eb] hover:bg-[#dce8ff] transition"
                          title="Send Direct Email"
                        >
                          <Mail className="h-3 w-3" />
                          <span>Email</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* User Details Modal */}
      <AdminModal
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        size="md"
        title={`User Profile: ${selectedUser?.name ?? ''}`}
        description="Detailed view of registered account credentials, organization, and historical engagement."
      >
        {selectedUser && (
          <div className="flex flex-col flex-1 min-h-0">
            <ModalBody>
              {selectedUser.status === 'Suspended' && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-900 flex items-start gap-2.5">
                  <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">This account is currently SUSPENDED.</p>
                    <p className="mt-0.5 text-rose-700">The user cannot access storefront portals, manage inventories, or upload listings.</p>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Account Role
                  </span>
                  <AdminBadge tone="brand">{selectedUser.role}</AdminBadge>
                </div>
                <p className="text-lg font-bold text-slate-950">{selectedUser.name}</p>
                <p className="text-xs text-slate-600 font-mono break-all">{selectedUser.email}</p>
                {selectedUser.phone && <p className="text-xs text-slate-600">{selectedUser.phone}</p>}
                <p className="text-xs font-medium text-slate-700 pt-1">
                  Organization: <span className="font-bold">{selectedUser.organization}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-400 uppercase font-semibold block">Total Orders</span>
                  <span className="text-base font-bold text-slate-950 mt-1 block">
                    {selectedUser.ordersCount}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-400 uppercase font-semibold block">Total Volume</span>
                  <span className="text-base font-bold text-emerald-700 mt-1 block">
                    ${selectedUser.totalSpent.toLocaleString()} USD
                  </span>
                </div>
              </div>

              {/* Administrative Access & Role Elevation Controls */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[0.7rem] uppercase tracking-wider text-slate-500 font-bold">
                    Access & Role Controls (Password Protected)
                  </span>
                  {actionLoadingId === selectedUser.id && (
                    <span className="text-xs text-[#1e57eb] flex items-center gap-1 font-medium">
                      <Loader2 className="h-3 w-3 animate-spin" /> Updating...
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {selectedUser.role !== 'Admin' ? (
                    <button
                      type="button"
                      disabled={actionLoadingId === selectedUser.id}
                      onClick={() => promptPromoteAdmin(selectedUser)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#1e57eb] bg-[#1e57eb] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1947c2] transition disabled:opacity-50 cursor-pointer"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Promote to Admin
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={actionLoadingId === selectedUser.id}
                      onClick={() => promptDemoteAdmin(selectedUser)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition disabled:opacity-50 cursor-pointer"
                    >
                      <ShieldX className="h-3.5 w-3.5" />
                      Demote to Merchant
                    </button>
                  )}

                  {selectedUser.status === 'Active' ? (
                    <button
                      type="button"
                      disabled={actionLoadingId === selectedUser.id}
                      onClick={() => promptSuspendUser(selectedUser)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition disabled:opacity-50 cursor-pointer"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Suspend Account
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={actionLoadingId === selectedUser.id}
                      onClick={() => promptReactivateUser(selectedUser)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Reactivate Account
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={actionLoadingId === selectedUser.id}
                    onClick={() => promptDeleteUser(selectedUser)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50 cursor-pointer ml-auto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Account
                  </button>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <AdminButton variant="outline" onClick={() => setSelectedUser(null)}>
                Close
              </AdminButton>
              <AdminButton
                onClick={() => {
                  const u = selectedUser;
                  setSelectedUser(null);
                  openDirectBroadcast(u);
                }}
              >
                <Send className="h-4 w-4" /> Message User
              </AdminButton>
            </ModalFooter>
          </div>
        )}
      </AdminModal>

      {/* Create User Modal */}
      <AdminModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        size="md"
        title="Provision New Account"
        description="Create a verified Business Owner, Corporate Client, Customer, or Admin account."
      >
        <form onSubmit={handleCreateUser} className="flex flex-col flex-1 min-h-0">
          <ModalBody>
            <AdminInput
              label="Full Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Chipo Mutasa"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminInput
                label="Email Address"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="chipo@company.co.zw"
                required
              />
              <AdminInput
                label="Phone / WhatsApp"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+263 77 200 0000"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminInput
                label="Organization / Company"
                value={newOrg}
                onChange={(e) => setNewOrg(e.target.value)}
                placeholder="e.g. Midlands Agro Supplies"
              />
              <AdminSelect
                label="Account Role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRecord['role'])}
              >
                <option value="Customer">Customer / Buyer</option>
                <option value="Business Owner">Business Owner</option>
                <option value="Corporate Client">Corporate Client</option>
                <option value="Admin">Administrator</option>
              </AdminSelect>
            </div>
            <AdminInput
              label="Initial Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters (e.g. AdminPass2026!)"
              hint="Required for initial login. Minimum 8 characters."
              required
            />
          </ModalBody>

          <ModalFooter>
            <AdminButton type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={isSubmitting}>
              Cancel
            </AdminButton>
            <AdminButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Provisioning...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Account
                </>
              )}
            </AdminButton>
          </ModalFooter>
        </form>
      </AdminModal>

      {/* Broadcast Email Modal with 5 Pre-Built Templates */}
      <AdminModal
        open={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        size="xl"
        title="Email Broadcast Campaign Suite"
        description="Select from 5 pre-built Zimbabwe commercial templates or customize your subject and HTML body for segmented delivery."
      >
        <form onSubmit={handleSendBroadcast} className="flex flex-col flex-1 min-h-0">
          <ModalBody className="space-y-6">
            {/* 5 Template Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs uppercase tracking-wider font-bold text-[#1e57eb] flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Select 1 of 5 Pre-Built Commercial Message Templates:
                </label>
                <span className="text-xs text-slate-400">Click to auto-populate</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {BROADCAST_TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1e57eb] bg-[#eef4ff]/90 shadow-xs ring-2 ring-[#1e57eb]/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#1e57eb]">
                          {tpl.category}
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-[#1e57eb] shrink-0" />}
                      </div>
                      <p className="text-xs font-bold text-slate-950 mt-1 line-clamp-1">
                        {tpl.name}
                      </p>
                      <p className="text-[0.7rem] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {tpl.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Audience Segment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminSelect
                label="Target Audience Segment"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
              >
                <option value="all">All Registered Accounts ({stats.total})</option>
                <option value="businesses">Verified Business Owners Only ({stats.businesses})</option>
                <option value="corporate">Corporate & Institutional Buyers ({stats.corporate})</option>
                <option value="customers">Personal Buyers & Job Seekers</option>
              </AdminSelect>

              <AdminInput
                label="Header Eyebrow Badge"
                value={emailEyebrow}
                onChange={(e) => setEmailEyebrow(e.target.value)}
                placeholder="e.g. Business Directory Renewal"
                required
              />
            </div>

            {/* Subject Line */}
            <AdminInput
              label="Email Subject Line"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Enter attention-grabbing subject line..."
              required
            />

            {/* Message HTML Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Email Message Content (HTML Supported)
                </label>
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="text-xs text-[#1e57eb] hover:underline font-semibold cursor-pointer"
                >
                  {previewMode ? 'Edit HTML Code' : 'Live HTML Preview'}
                </button>
              </div>

              {previewMode ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-inner overflow-y-auto max-h-[340px] space-y-3">
                  <span className="inline-block rounded-full bg-[#eef4ff] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1e57eb]">
                    {emailEyebrow}
                  </span>
                  <div
                    className="prose prose-slate max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{ __html: emailBody }}
                  />
                </div>
              ) : (
                <AdminTextarea
                  rows={8}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Enter rich HTML message..."
                  required
                />
              )}
            </div>
          </ModalBody>

          <ModalFooter>
            <p className="hidden sm:block text-xs text-slate-500 mr-auto">
              Dispatched with official Sadza Connect executive branding.
            </p>
            <AdminButton type="button" variant="outline" onClick={() => setBroadcastOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit">
              <Send className="h-4 w-4" /> Dispatch Broadcast Email
            </AdminButton>
          </ModalFooter>
        </form>
      </AdminModal>

      {/* Security Re-Authentication Confirmation Modal */}
      <AdminPasswordConfirmationModal
        open={securityModal.open}
        onClose={() => setSecurityModal((prev) => ({ ...prev, open: false }))}
        title={securityModal.title}
        description={securityModal.description}
        confirmLabel={securityModal.confirmLabel}
        actionType={securityModal.actionType}
        onConfirm={handleVerifyAndExecute}
      />
    </div>
  );
}
