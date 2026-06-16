import prisma from '@/lib/prisma';
import ReplayButton from '@/app/components/ReplayButton';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import WebhookSimulator from '@/app/components/WebhookSimulator';
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
    <main className="min-h-screen font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 space-y-12">
        
        {/* Hero Section / Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 mb-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">Secured by HMAC-SHA256</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 dark:from-white dark:via-indigo-400 dark:to-white">
              Webhook Orchestrator
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl">
              Reliable, asynchronous event delivery infrastructure with exponential backoff and dead-letter queueing.
            </p>
          </div>
          <div className="flex items-center gap-4 pb-2">
            <ThemeToggle />
            <div className="flex items-center gap-3 px-5 py-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">System Operational</span>
            </div>
          </div>
        </header>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative group rounded-[2rem] bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.1)] transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
              <CheckCircle2 className="w-40 h-40 text-indigo-500" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                  <Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-base font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Delivered Webhooks</h2>
              </div>
              <div className="flex items-end gap-4">
                <span className="text-7xl font-bold tracking-tighter text-slate-900 dark:text-white">{successCount.toLocaleString()}</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium mb-2.5 flex items-center gap-1.5 text-lg">
                  <Activity className="w-5 h-5" /> Real-time
                </span>
              </div>
            </div>
          </div>

          <div className="relative group rounded-[2rem] bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(225,29,72,0.08)] transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent"></div>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
              <XCircle className="w-40 h-40 text-rose-500" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-100 dark:border-rose-500/20">
                  <Server className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
                <h2 className="text-base font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Dead Letter Queue</h2>
              </div>
              <div className="flex items-end gap-4">
                <span className="text-7xl font-bold tracking-tighter text-slate-900 dark:text-white">{failedCount.toLocaleString()}</span>
                <span className="text-rose-600 dark:text-rose-400 font-medium mb-2.5 flex items-center gap-1.5 text-lg">
                  <XCircle className="w-5 h-5" /> Failed
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid: Simulator + DLQ Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Simulator (Left Column) */}
          <div className="lg:col-span-1">
            <WebhookSimulator />
          </div>

          {/* DLQ Table (Right Columns) */}
          <section className="lg:col-span-2 relative rounded-[2rem] bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-400/20 to-transparent"></div>
            <div className="px-10 py-8 border-b border-slate-200/60 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-100 dark:border-amber-500/20">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                </div>
                Dead Letters Requiring Action
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-base text-left">
                <thead className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-50/30 dark:bg-slate-950/10 backdrop-blur-sm">
                  <tr>
                    <th scope="col" className="px-10 py-6 font-medium">Job ID</th>
                    <th scope="col" className="px-10 py-6 font-medium">Target URL</th>
                    <th scope="col" className="px-10 py-6 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {recentDLQ.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-10 py-32 text-center text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col items-center justify-center">
                          <CheckCircle2 className="w-16 h-16 mb-6 text-slate-300 dark:text-slate-700" />
                          <p className="text-xl font-medium text-slate-900 dark:text-slate-200">Dead letter queue is completely empty.</p>
                          <p className="text-base mt-2">All systems are operating perfectly.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentDLQ.map((dlq) => (
                      <tr key={dlq.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="px-10 py-8 font-mono text-sm text-slate-500 dark:text-slate-400">
                          {dlq.jobId}
                          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{dlq.failedAt.toLocaleString()}</div>
                        </td>
                        <td className="px-10 py-8 text-slate-900 dark:text-slate-200 font-medium max-w-[12rem] truncate" title={dlq.targetUrl}>
                          {dlq.targetUrl}
                          <div className="text-rose-600 dark:text-rose-400 font-mono text-xs truncate mt-1" title={dlq.errorReason}>
                            {dlq.errorReason}
                          </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
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
      </div>
    </main>
  );
}
