'use client';

import { useState } from 'react';
import { Users, Shield, CheckCircle2, UserCheck, Search } from 'lucide-react';

interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'Super Admin' | 'Merchant' | 'Customer';
  province: string;
  status: 'Active' | 'Suspended';
}

const SAMPLE_USERS: UserAccount[] = [
  {
    id: 'usr-1',
    fullName: 'Ugwoke Levi',
    email: 'admin@sadzaconnect.co.zw',
    phone: '+263771000001',
    role: 'Super Admin',
    province: 'Harare Metropolitan',
    status: 'Active',
  },
  {
    id: 'usr-2',
    fullName: 'Tinowonga Ngozi',
    email: 'director@africdominion.co.zw',
    phone: '+263772000002',
    role: 'Super Admin',
    province: 'Midlands Province',
    status: 'Active',
  },
  {
    id: 'usr-3',
    fullName: 'Farai Gava',
    email: 'gavas@restaurant.co.zw',
    phone: '+263772123456',
    role: 'Merchant',
    province: 'Harare Metropolitan',
    status: 'Active',
  },
  {
    id: 'usr-4',
    fullName: 'Simba Nyathi',
    email: 'sales@midlandssolar.co.zw',
    phone: '+263712987654',
    role: 'Merchant',
    province: 'Midlands Province',
    status: 'Active',
  },
  {
    id: 'usr-5',
    fullName: 'Tinashe Sibanda',
    email: 'tinashe.shopper@gmail.com',
    phone: '+263773112233',
    role: 'Customer',
    province: 'Bulawayo Metropolitan',
    status: 'Active',
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAccount[]>(SAMPLE_USERS);
  const [search, setSearch] = useState('');

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink-950 dark:text-white">
          Platform Users & Permissions
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1">
          Role-based access control for Super Admins, Merchants, and Shoppers across Zimbabwe.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-950 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="text-xs text-ink-500">
          Total Registered Users: <span className="font-bold text-ink-900 dark:text-white">{users.length}</span>
        </div>
      </div>

      <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ink-50 dark:bg-ink-950/70 border-b border-ink-100 dark:border-ink-800 text-ink-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Province</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-ink-50/50 dark:hover:bg-ink-950/50">
                  <td className="px-6 py-4 font-bold text-ink-950 dark:text-white">
                    {user.fullName}
                  </td>
                  <td className="px-6 py-4 text-ink-600 dark:text-ink-300">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 font-mono text-ink-600 dark:text-ink-400">
                    {user.phone}
                  </td>
                  <td className="px-6 py-4 text-ink-600 dark:text-ink-300">
                    {user.province}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        user.role === 'Super Admin'
                          ? 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : user.role === 'Merchant'
                          ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                          : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 text-brand-600 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
