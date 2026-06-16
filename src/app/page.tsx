import prisma from '@/lib/prisma';
import ReplayButton from '@/app/components/ReplayButton';
import WebhookSimulator from '@/app/components/WebhookSimulator';
import BackgroundGrid from '@/app/components/BackgroundGrid';
import AnimatedCounter from '@/app/components/AnimatedCounter';
import AutoRefresh from '@/app/components/AutoRefresh';
import ClientDate from '@/app/components/ClientDate';
import { ShieldCheck, Activity, CheckCircle2, XCircle, AlertCircle, Database, Server, Loader2, Clock } from 'lucide-react';
import * as motion from 'framer-motion/client';
import { webhookQueue } from '@/queue/config';
import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function Dashboard() {
  const { userId } = auth();
  
  if (!userId) {
    return null; // Handled by middleware redirect
  }

  const successCount = await prisma.webhookLog.count({
    where: { userId }
  });
  const failedCount = await prisma.deadLetterQueue.count({
    where: { userId }
  });
  const recentDLQ = await prisma.deadLetterQueue.findMany({
    where: { userId },
    take: 10,
    orderBy: { failedAt: 'desc' },
  });

  // Fetch jobs that are currently pending, active, or waiting for a retry (delayed)
  const allProcessingJobs = await webhookQueue.getJobs(['active', 'waiting', 'delayed']);
  const processingJobs = allProcessingJobs.filter(job => job.data.userId === userId);

  return (
    <main className="min-h-screen font-sans selection:bg-indigo-500/30 relative text-zinc-300">
      <BackgroundGrid />
      <AutoRefresh interval={2000} />
      
      <div className="max-w-[85rem] mx-auto px-6 sm:px-8 py-12 space-y-8 relative z-10">
        
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/30 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[11px] font-medium text-zinc-400 tracking-wide">Secured by HMAC-SHA256</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
              Webhook Orchestrator
            </h1>
            <p className="text-zinc-400 text-base max-w-xl font-medium">
              Enterprise event delivery infrastructure. Decoupled, idempotent, resilient.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-zinc-800 bg-[#0A0A0A]">
              <div className="relative flex h-2 w-2 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-zinc-400/50"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-zinc-400"></span>
              </div>
              <span className="text-xs font-medium text-zinc-300 tracking-wide flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-zinc-500" />
                System Active
              </span>
            </div>
            <div className="flex items-center justify-center border border-zinc-800 bg-[#0A0A0A] rounded-full p-1 w-8 h-8">
              <UserButton 
                appearance={{ elements: { userButtonAvatarBox: "w-6 h-6" } }}
                afterSignOutUrl="/"
              />
            </div>
          </div>
        </motion.header>

        {/* Top Section: Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="rounded-xl bg-[#0A0A0A] border border-zinc-800 p-8 flex flex-col justify-between hover:border-zinc-700 transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                <Database className="w-4 h-4 text-zinc-300" />
              </div>
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Total Delivered</h2>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-medium tracking-tight text-white">
                {successCount.toLocaleString()}
              </span>
              <span className="text-zinc-500 font-medium flex items-center gap-1 text-xs uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5" /> Live
              </span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-xl bg-[#0A0A0A] border border-zinc-800 p-8 flex flex-col justify-between hover:border-zinc-700 transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                <Server className="w-4 h-4 text-zinc-300" />
              </div>
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Dead Letters</h2>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-medium tracking-tight text-white tabular-nums">
                {failedCount.toLocaleString()}
              </span>
              <span className="text-zinc-500 font-medium flex items-center gap-1 text-xs uppercase tracking-wider">
                <XCircle className="w-3.5 h-3.5" /> Failed
              </span>
            </div>
          </motion.div>
        </section>

        {/* Bottom Section: Bento Box Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (1/3 Width): Developer Console */}
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="lg:col-span-1"
          >
            <WebhookSimulator />
          </motion.div>

          {/* Right Column (2/3 Width): Processing Queue & DLQ Table */}
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            
            {/* Processing Queue */}
            <div className="rounded-xl bg-[#0A0A0A] border border-zinc-800 overflow-hidden shadow-sm flex flex-col flex-1 min-h-[300px]">
              <div className="px-6 py-5 border-b border-zinc-800 bg-zinc-900/50 flex items-center shrink-0">
                <h3 className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  Processing Queue
                </h3>
              </div>
              <div className="overflow-auto flex-1 max-h-[350px]">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-6 py-4">Job ID</th>
                      <th scope="col" className="px-6 py-4">Target URL</th>
                      <th scope="col" className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {processingJobs.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-16 text-center text-zinc-500">
                          <div className="flex flex-col items-center justify-center">
                            <Activity className="w-5 h-5 text-zinc-600 mb-3" />
                            <p className="text-sm font-medium text-zinc-400">No active jobs</p>
                            <p className="text-[11px] mt-1 text-zinc-600">The processing queue is empty.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      processingJobs.map((job, index) => (
                        <motion.tr 
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ 
                            opacity: { duration: 0.2, delay: index * 0.05 },
                            layout: { type: "spring", stiffness: 300, damping: 30 }
                          }}
                          key={job.id} 
                          className="hover:bg-white/[0.02] transition-colors duration-200 ease-in-out group"
                        >
                          <td className="px-6 py-4 font-mono text-[13px] text-zinc-400">
                            {job.id}
                            <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">
                              Attempt {job.attemptsMade}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-zinc-200 font-mono text-[13px] max-w-[16rem] truncate" title={job.data.url}>
                            {job.data.url}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center justify-end gap-2 text-zinc-300 bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-full text-[10px] font-medium tracking-widest uppercase">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                              Processing
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Required Queue */}
            <div className="rounded-xl bg-[#0A0A0A] border border-zinc-800 overflow-hidden shadow-sm flex flex-col flex-1 min-h-[300px]">
              <div className="px-6 py-5 border-b border-zinc-800 bg-zinc-900/50 flex items-center shrink-0">
                <h3 className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-zinc-400" />
                  Action Required Queue
                </h3>
              </div>
              <div className="overflow-auto flex-1 max-h-[350px]">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-6 py-4">Job ID</th>
                      <th scope="col" className="px-6 py-4">Target URL</th>
                      <th scope="col" className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {recentDLQ.length === 0 ? (
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
                      recentDLQ.map((dlq: any, index: number) => (
                        <motion.tr 
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ 
                            opacity: { duration: 0.2, delay: 0.2 + (index * 0.05) },
                            layout: { type: "spring", stiffness: 300, damping: 30 }
                          }}
                          key={dlq.id} 
                          className="hover:bg-white/[0.02] transition-colors duration-200 ease-in-out group"
                        >
                          <td className="px-6 py-4 font-mono text-[13px] text-zinc-400">
                            {dlq.jobId}
                            <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">
                              <ClientDate date={dlq.failedAt} />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-zinc-200 font-mono text-[13px] max-w-[16rem] truncate" title={dlq.targetUrl}>
                            {dlq.targetUrl}
                            <div className="text-rose-400/80 text-[11px] truncate mt-1 font-sans font-medium" title={dlq.errorReason}>
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
            </div>

          </motion.div>
          
        </section>
      </div>
    </main>
  );
}
