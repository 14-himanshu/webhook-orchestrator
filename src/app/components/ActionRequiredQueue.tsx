'use client';

import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import DeadLetterRow from '@/app/components/DeadLetterRow';

export default function ActionRequiredQueue({ dlqItems }: { dlqItems: any[] }) {
  return (
    <div className="rounded-xl bg-[#0A0A0A] border border-zinc-800 shadow-sm flex flex-col">
      <div className="px-6 py-5 border-b border-zinc-800 bg-zinc-900/50 flex items-center shrink-0">
        <h3 className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-zinc-400" />
          Action Required Queue
        </h3>
      </div>
      <div className="overflow-x-auto overflow-y-auto max-h-[400px] flex flex-col justify-between" data-lenis-prevent>
        <table className="w-full text-left">
          <thead className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-4">Job ID</th>
              <th scope="col" className="px-6 py-4">Target URL</th>
              <th scope="col" className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {dlqItems.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-16 text-center text-zinc-500">
                  <div className="flex flex-col items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-zinc-600 mb-3" />
                    <p className="text-sm font-medium text-zinc-400">Queue is clear</p>
                    <p className="text-[11px] mt-1 text-zinc-600">No failed webhooks require attention.</p>
                  </div>
                </td>
              </tr>
            ) : (
              dlqItems.map((dlq: any, index: number) => (
                <DeadLetterRow key={dlq.id} dlq={dlq} index={index} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
