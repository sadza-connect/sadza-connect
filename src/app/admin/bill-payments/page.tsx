'use client';

import { useState } from 'react';
import { Zap, CheckCircle2, Search, ArrowDownRight } from 'lucide-react';

interface SettlementLog {
  id: string;
  reference: string;
  type: 'ZESA Electricity' | 'Harare Water' | 'Bulawayo Water' | 'DStv Zimbabwe';
  amountUsd: number;
  amountZig: number;
  rail: 'EcoCash USD' | 'InnBucks' | 'Zipit' | 'EcoCash ZiG';
  targetAccount: string;
  status: 'Settled' | 'Processing';
  timestamp: string;
}

const SAMPLE_LOGS: SettlementLog[] = [
  {
    id: 'log-1',
    reference: 'ZETDC-99210-A',
    type: 'ZESA Electricity',
    amountUsd: 20.0,
    amountZig: 550.0,
    rail: 'EcoCash USD',
    targetAccount: 'Meter #37148920194',
    status: 'Settled',
    timestamp: '10 mins ago',
  },
  {
    id: 'log-2',
    reference: 'ZETDC-99211-B',
    type: 'ZESA Electricity',
    amountUsd: 50.0,
    amountZig: 1375.0,
    rail: 'InnBucks',
    targetAccount: 'Meter #04128919920',
    status: 'Settled',
    timestamp: '25 mins ago',
  },
  {
    id: 'log-3',
    reference: 'WTR-77201-H',
    type: 'Harare Water',
    amountUsd: 15.0,
    amountZig: 412.5,
    rail: 'Zipit',
    targetAccount: 'Council ACC-883921',
    status: 'Settled',
    timestamp: '1 hour ago',
  },
  {
    id: 'log-4',
    reference: 'DSTV-44109-M',
    type: 'DStv Zimbabwe',
    amountUsd: 39.0,
    amountZig: 1072.5,
    rail: 'EcoCash USD',
    targetAccount: 'Smartcard #1029384756',
    status: 'Settled',
    timestamp: '2 hours ago',
  },
];

export default function AdminBillPaymentsPage() {
  const [logs] = useState<SettlementLog[]>(SAMPLE_LOGS);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink-950 dark:text-white">
          Utility Settlement Ledger & Reconciliation
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1">
          Audit trail for ZESA tokens generated, municipal water rates, and MultiChoice DStv payments.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800">
          <div className="text-xs font-bold text-ink-500">24h Settlement Volume</div>
          <div className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">$1,245.00</div>
          <div className="text-[11px] text-ink-400">≈ 34,237.50 ZiG</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800">
          <div className="text-xs font-bold text-ink-500">ZESA Tokens Issued</div>
          <div className="text-2xl font-black text-gold-600 dark:text-gold-400 mt-1">84 Tokens</div>
          <div className="text-[11px] text-brand-600">100% Delivery Rate</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800">
          <div className="text-xs font-bold text-ink-500">Active Payment Rails</div>
          <div className="text-2xl font-black text-ink-950 dark:text-white mt-1">4 Rails</div>
          <div className="text-[11px] text-brand-600">EcoCash, InnBucks, Zipit</div>
        </div>
      </div>

      <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ink-50 dark:bg-ink-950/70 border-b border-ink-100 dark:border-ink-800 text-ink-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Transaction Ref</th>
                <th className="px-6 py-4">Service Type</th>
                <th className="px-6 py-4">Account / Meter</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Settlement Rail</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-ink-50/50 dark:hover:bg-ink-950/50">
                  <td className="px-6 py-4 font-mono font-bold text-ink-950 dark:text-white">
                    {log.reference}
                  </td>
                  <td className="px-6 py-4 font-semibold text-ink-800 dark:text-ink-200">
                    {log.type}
                  </td>
                  <td className="px-6 py-4 text-ink-600 dark:text-ink-400 font-mono">
                    {log.targetAccount}
                  </td>
                  <td className="px-6 py-4 font-bold text-brand-700 dark:text-brand-400">
                    ${log.amountUsd.toFixed(2)}{' '}
                    <span className="text-[11px] text-gold-600 font-normal">
                      ({log.amountZig.toFixed(0)} ZiG)
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-md bg-ink-100 dark:bg-ink-800 font-semibold text-ink-700 dark:text-ink-300">
                      {log.rail}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-brand-600 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-ink-400 font-mono">
                    {log.timestamp}
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
