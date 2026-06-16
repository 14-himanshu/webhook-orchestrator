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
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 space-y-8">
        
        {/* Hero Section / Header */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-400 tracking-wide uppercase">Secured by HMAC-SHA256</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Webhook Orchestrator
            </h1>
            <p className="text-slate-400 text-lg max-w-xl font-light">
              Enterprise-grade event delivery infrastructure. Decoupled, idempotent, and resilient against downtime.
            </p>
          </div>
          <div className="flex items-center gap-4 pb-2">
            
            {/* Redesigned System Operational Badge */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 px-4 py-2 bg-white/[0.02] backdrop-blur-md rounded-full border border-white/[0.05]"
            >
              <div className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-emerald-400/60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              </div>
              <span className="text-xs font-medium text-emerald-400 tracking-widest uppercase flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                System Operational
              </span>
            </motion.div>

          </div>
        </motion.header>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative group rounded-2xl bg-[#0d0d12] border border-white/[0.05] p-8 overflow-hidden shadow-lg hover:border-indigo-500/30 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
              <CheckCircle2 className="w-40 h-40 text-indigo-500" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                  <Database className="w-5 h-5 text-indigo-400" />
                </div>
                <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest">Delivered Webhooks</h2>
              </div>
              <div className="flex items-end gap-4">
                <span className="text-5xl font-bold tracking-tight text-white">{successCount.toLocaleString()}</span>
                <span className="text-indigo-400 font-medium mb-1.5 flex items-center gap-1.5 text-sm">
                  <Activity className="w-4 h-4" /> Live
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative group rounded-2xl bg-[#0d0d12] border border-white/[0.05] p-8 overflow-hidden shadow-lg hover:border-rose-500/30 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
              <XCircle className="w-40 h-40 text-rose-500" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
                  <Server className="w-5 h-5 text-rose-400" />
                </div>
                <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest">Dead Letter Queue</h2>
              </div>
              <div className="flex items-end gap-4">
                <span className="text-5xl font-bold tracking-tight text-white">{failedCount.toLocaleString()}</span>
                <span className="text-rose-400 font-medium mb-1.5 flex items-center gap-1.5 text-sm">
                  <XCircle className="w-4 h-4" /> Failed
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Main Content Grid: Simulator + DLQ Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Simulator (Left Column) */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <WebhookSimulator />
          </motion.div>

          {/* DLQ Table (Right Columns) */}
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="lg:col-span-2 relative rounded-2xl bg-[#0d0d12] border border-white/[0.05] overflow-hidden shadow-lg"
          >
            <div className="px-6 py-4 border-b border-white/[0.05] bg-white/[0.02] flex items-center">
              <h3 className="text-sm font-medium text-slate-200 flex items-center gap-3 tracking-wide">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                </div>
                Action Required
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-white/[0.02]">
                  <tr>
                    <th scope="col" className="px-6 py-4">Job ID</th>
                    <th scope="col" className="px-6 py-4">Target URL</th>
                    <th scope="col" className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {recentDLQ.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-24 text-center text-slate-400">
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center justify-center"
                        >
                          <div className="p-3 bg-emerald-500/10 rounded-full mb-4">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                          </div>
                          <p className="text-base font-medium text-slate-200">Queue is clear</p>
                          <p className="text-sm mt-1 text-slate-500">No failed webhooks require attention.</p>
                        </motion.div>
                      </td>
                    </tr>
                  ) : (
                    recentDLQ.map((dlq, index) => (
                      <motion.tr 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + (index * 0.05) }}
                        key={dlq.id} 
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-6 py-5 font-mono text-sm text-slate-400">
                          {dlq.jobId}
                          <div className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">{dlq.failedAt.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-5 text-slate-200 font-medium max-w-[12rem] truncate" title={dlq.targetUrl}>
                          {dlq.targetUrl}
                          <div className="text-rose-400 font-mono text-xs truncate mt-1" title={dlq.errorReason}>
                            {dlq.errorReason}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                            <ReplayButton dlqId={dlq.id} />
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
