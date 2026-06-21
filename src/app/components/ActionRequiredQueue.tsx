'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import DeadLetterRow from '@/app/components/DeadLetterRow';
import type { DLQItem } from '@/types/webhook';

const PAGE_SIZE = 10;

export default function ActionRequiredQueue({ dlqItems }: { dlqItems: DLQItem[] }) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(dlqItems.length / PAGE_SIZE);
  const pageItems = dlqItems.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="rounded-xl bg-[#0A0A0A] border border-zinc-800 shadow-sm flex flex-col">
      <div className="px-6 py-5 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between shrink-0">
        <h3 className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-zinc-400" />
          Action Required Queue
        </h3>
        {dlqItems.length > 0 && (
          <span className="text-[11px] text-zinc-500 font-medium">
            {dlqItems.length} item{dlqItems.length !== 1 ? 's' : ''}
          </span>
        )}
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
              pageItems.map((dlq: DLQItem) => (
                <DeadLetterRow key={dlq.id} dlq={dlq} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

