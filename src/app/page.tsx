import prisma from '@/lib/prisma';
import ReplayButton from '@/app/components/ReplayButton';
import { ShieldCheck, Activity, CheckCircle2, XCircle, AlertCircle, Database, Server } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const successCount = await prisma.webhookLog.count();
  const failedCount = await prisma.deadLetterQueue.count();
  const recentDLQ = await prisma.deadLetterQueue.findMany({
    take: 10,
    orderBy: { failedAt: 'desc' },
  });

  return (
    <main className="min-h-screen text-zinc-300 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        
        {/* Top Navbar / Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/[0.08]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Orchestrator</h1>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <p className="text-sm font-medium text-zinc-400 tracking-wide uppercase">Secured by HMAC-SHA256</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-semibold text-zinc-200">System Operational</span>
          </div>
        </header>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative group rounded-3xl bg-white/[0.02] border border-white/[0.05] p-8 overflow-hidden hover:bg-white/[0.04] transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-500">
              <CheckCircle2 className="w-32 h-32 text-indigo-400" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                  <Database className="w-5 h-5 text-indigo-400" />
                </div>
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Delivered Webhooks</h2>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-6xl font-bold tracking-tighter text-white">{successCount.toLocaleString()}</span>
                <span className="text-indigo-400 font-medium mb-1.5 flex items-center gap-1">
                  <Activity className="w-4 h-4" /> Real-time
                </span>
              </div>
            </div>
          </div>

          <div className="relative group rounded-3xl bg-white/[0.02] border border-white/[0.05] p-8 overflow-hidden hover:bg-white/[0.04] transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-500">
              <XCircle className="w-32 h-32 text-rose-400" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                  <Server className="w-5 h-5 text-rose-400" />
                </div>
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Dead Letter Queue</h2>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-6xl font-bold tracking-tighter text-white">{failedCount.toLocaleString()}</span>
                <span className="text-rose-400 font-medium mb-1.5 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Failed
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* DLQ Table */}
        <section className="rounded-3xl bg-black/20 backdrop-blur-xl border border-white/[0.08] overflow-hidden shadow-2xl">
          <div className="px-8 py-6 border-b border-white/[0.05] flex justify-between items-center bg-white/[0.02]">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Dead Letters Requiring Action
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase tracking-widest bg-black/40">
                <tr>
                  <th scope="col" className="px-8 py-5 font-medium">Job ID</th>
                  <th scope="col" className="px-8 py-5 font-medium">Target URL</th>
                  <th scope="col" className="px-8 py-5 font-medium">Reason</th>
                  <th scope="col" className="px-8 py-5 font-medium text-right">Failed At</th>
                  <th scope="col" className="px-8 py-5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {recentDLQ.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 mb-4 text-zinc-700" />
                        <p className="text-lg">Dead letter queue is completely empty.</p>
                        <p className="text-sm text-zinc-600 mt-1">All systems are operating perfectly.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentDLQ.map((dlq) => (
                    <tr key={dlq.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6 font-mono text-xs text-zinc-400">
                        {dlq.jobId}
                      </td>
                      <td className="px-8 py-6 text-zinc-200 font-medium max-w-xs truncate" title={dlq.targetUrl}>
                        {dlq.targetUrl}
                      </td>
                      <td className="px-8 py-6 text-rose-400 font-mono text-xs max-w-sm truncate" title={dlq.errorReason}>
                        <span className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded-md">
                          {dlq.errorReason}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right text-zinc-500 whitespace-nowrap text-xs">
                        {dlq.failedAt.toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end opacity-50 group-hover:opacity-100 transition-opacity">
                          <ReplayButton dlqId={dlq.id} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
