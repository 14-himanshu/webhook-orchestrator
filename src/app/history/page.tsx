import prisma from '@/lib/prisma';
import BackgroundGrid from '@/app/components/BackgroundGrid';
import { CheckCircle2, ArrowLeft, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import ClientDate from '@/app/components/ClientDate';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) return null;

  const params = await searchParams;
  const page = Math.max(0, parseInt(params.page || '0', 10));

  const [logs, total] = await Promise.all([
    prisma.webhookLog.findMany({
      where: { userId },
      orderBy: { deliveredAt: 'desc' },
      skip: page * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.webhookLog.count({ where: { userId } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="min-h-screen font-sans selection:bg-indigo-500/30 relative text-zinc-300">
      <BackgroundGrid />

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 relative z-10">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0A0A0A] rounded-xl border border-zinc-800 shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white">
                  Delivery History
                </h1>
                <p className="text-zinc-400 font-medium text-sm mt-0.5">
                  {total.toLocaleString()} successful webhook{total !== 1 ? 's' : ''} delivered
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Table */}
        <div className="rounded-xl bg-[#0A0A0A] border border-zinc-800 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest border-b border-zinc-800 bg-zinc-900">
              <tr>
                <th scope="col" className="px-6 py-4">Job ID</th>
                <th scope="col" className="px-6 py-4">Target URL</th>
                <th scope="col" className="px-6 py-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Delivered At
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-zinc-600 mb-3" />
                      <p className="text-sm font-medium text-zinc-400">No deliveries yet</p>
                      <p className="text-[11px] mt-1 text-zinc-600">Successfully delivered webhooks will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                    <td className="px-6 py-4 font-mono text-[13px] text-zinc-400">
                      {log.jobId}
                    </td>
                    <td className="px-6 py-4 max-w-[28rem]">
                      <a
                        href={log.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1.5 font-mono text-[13px] text-zinc-200 hover:text-indigo-400 transition-colors truncate"
                        title={log.targetUrl}
                      >
                        <span className="truncate">{log.targetUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-zinc-400 whitespace-nowrap">
                      <ClientDate date={log.deliveredAt} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
                Page {page + 1} of {totalPages} &mdash; {total} total
              </span>
              <div className="flex items-center gap-2">
                {page > 0 && (
                  <Link
                    href={`/history?page=${page - 1}`}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages - 1 && (
                  <Link
                    href={`/history?page=${page + 1}`}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
