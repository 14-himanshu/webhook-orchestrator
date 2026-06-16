import prisma from '@/lib/prisma';
import ReplayButton from '@/app/components/ReplayButton';
import WebhookSimulator from '@/app/components/WebhookSimulator';
import BackgroundGrid from '@/app/components/BackgroundGrid';
import { ShieldCheck, Activity, CheckCircle2, XCircle, AlertCircle, Database, Server, Radio } from 'lucide-react';
import * as motion from 'framer-motion/client';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const successCount = await prisma.webhookLog.count();
  const failedCount = await prisma.deadLetterQueue.count();
  const recentDLQ = await prisma.deadLetterQueue.findMany({
    take: 10,
    orderBy: { failedAt: 'desc' },
  });

  return (
    <main className="min-h-screen font-sans selection:bg-indigo-500/30 relative text-slate-300">
      <BackgroundGrid />
      
      <div className="max-w-[85rem] mx-auto px-6 sm:px-8 py-10 space-y-10">
        
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] font-bold text-indigo-400 tracking-widest uppercase">Secured by HMAC-SHA256</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Webhook Orchestrator
            </h1>
            <p className="text-slate-400 text-base max-w-xl font-medium">
              Enterprise event delivery infrastructure. Decoupled, idempotent, resilient.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-[#09090b] rounded-lg border border-white/10">
              <div className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400/60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </div>
              <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase flex items-center gap-1.5">
                System Operational
              </span>
            </div>
          </div>
        </motion.header>

        {/* Metrics Row */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, delay: 0.05 }}
            className="rounded-xl bg-[#000000] border border-white/10 p-6 flex flex-col justify-between"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <Database className="w-4 h-4 text-indigo-400" />
              </div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Delivered</h2>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold tracking-tight text-white">{successCount.toLocaleString()}</span>
              <span className="text-indigo-400 font-semibold flex items-center gap-1 text-xs uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5" /> Live
              </span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, delay: 0.1 }}
            className="rounded-xl bg-[#000000] border border-white/10 p-6 flex flex-col justify-between"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                <Server className="w-4 h-4 text-rose-400" />
              </div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dead Letters</h2>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold tracking-tight text-white">{failedCount.toLocaleString()}</span>
              <span className="text-rose-400 font-semibold flex items-center gap-1 text-xs uppercase tracking-wider">
                <XCircle className="w-3.5 h-3.5" /> Failed
              </span>
            </div>
          </motion.div>
        </section>

        {/* DLQ Table Row (Full Width) */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, delay: 0.15 }}
          className="rounded-xl bg-[#000000] border border-white/10 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-white/10 bg-[#09090b] flex items-center">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Action Required Queue
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 bg-[#040404]">
                <tr>
                  <th scope="col" className="px-6 py-3">Job ID</th>
                  <th scope="col" className="px-6 py-3">Target URL</th>
                  <th scope="col" className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentDLQ.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-3" />
                        <p className="text-sm font-bold text-slate-200">Queue is clear</p>
                        <p className="text-xs mt-1 text-slate-500">No failed webhooks require attention.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentDLQ.map((dlq, index) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15, delay: 0.2 + (index * 0.02) }}
                      key={dlq.id} 
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-[13px] text-slate-400">
                        {dlq.jobId}
                        <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{dlq.failedAt.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-200 font-mono text-[13px] max-w-[20rem] truncate" title={dlq.targetUrl}>
                        {dlq.targetUrl}
                        <div className="text-rose-400 text-[11px] truncate mt-1 font-sans font-medium" title={dlq.errorReason}>
                          {dlq.errorReason}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ReplayButton dlqId={dlq.id} />
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Simulator Row (Full Width) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, delay: 0.2 }}
        >
          <WebhookSimulator />
        </motion.div>

      </div>
    </main>
  );
}
