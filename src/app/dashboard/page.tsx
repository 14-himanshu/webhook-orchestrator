import prisma from '@/lib/prisma';

import WebhookSimulator from '@/app/components/WebhookSimulator';
import BackgroundGrid from '@/app/components/BackgroundGrid';
import SpotlightCard from '@/app/components/SpotlightCard';
import NumberTicker from '@/app/components/NumberTicker';
import ProcessingQueueClient from '@/app/components/ProcessingQueueClient';
import ActionRequiredQueue from '@/app/components/ActionRequiredQueue';
import TrafficChart from '@/app/components/TrafficChart';
import { ShieldCheck, Activity, XCircle, Database, Server, Settings, Webhook } from 'lucide-react';
import * as motion from 'framer-motion/client';
import { webhookQueue } from '@/queue/config';
import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';

import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function Dashboard() {
  const { userId, orgId } = await auth();
  
  if (!userId) {
    return null; // Handled by middleware redirect
  }
  const tenantId = orgId || userId;

  const successCount = await prisma.event.count({
    where: { tenantId, status: 'completed' }
  });
  const failedCount = await prisma.event.count({
    where: { tenantId, status: 'failed' }
  });
  
  const rawRecentDLQ = await prisma.event.findMany({
    where: { tenantId, status: 'failed' },
    take: 100,
    orderBy: { updatedAt: 'desc' },
    include: { attempts: { orderBy: { attemptNumber: 'desc' }, take: 1 } }
  });

  const recentDLQ = rawRecentDLQ.map(event => ({
    id: event.id,
    jobId: event.jobId,
    targetUrl: event.targetUrl,
    payload: event.payload,
    failedAt: event.updatedAt,
    errorReason: event.attempts[0]?.errorReason || 'Unknown error',
    tenantId: event.tenantId,
  }));

  // Fetch jobs that are currently pending, active, or waiting for a retry (delayed)
  const allProcessingJobs = await webhookQueue.getJobs(['active', 'waiting', 'delayed']);
  const rawProcessingJobs = allProcessingJobs.filter(job => (job.data.tenantId || job.data.userId) === tenantId);

  // Serialize complex BullMQ Job instances into plain JSON objects for the Client Component
  const processingJobs = rawProcessingJobs.map(job => ({
    id: job.id,
    url: job.data.url,
    body: job.data.body,
    attemptsMade: job.attemptsMade || 0
  }));

  // --- TRAFFIC CHART AGGREGATION ---
  // eslint-disable-next-line react-hooks/purity
  const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentSuccessLogs = await prisma.event.findMany({
    where: { tenantId, status: 'completed', updatedAt: { gte: sixtyMinutesAgo } },
    select: { updatedAt: true }
  });
  const recentFailureLogs = await prisma.event.findMany({
    where: { tenantId, status: 'failed', updatedAt: { gte: sixtyMinutesAgo } },
    select: { updatedAt: true }
  });

  const chartBuckets = Array.from({ length: 6 }).map((_, i) => {
    // eslint-disable-next-line react-hooks/purity
    const startOfInterval = new Date(Date.now() - (5 - i) * 10 * 60 * 1000);
    const label = startOfInterval.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return { time: label, success: 0, failed: 0, startMs: startOfInterval.getTime() };
  });

  recentSuccessLogs.forEach(log => {
    const ms = log.updatedAt.getTime();
    const bucket = chartBuckets.find(b => ms >= b.startMs && ms < b.startMs + 10 * 60 * 1000);
    if (bucket) bucket.success += 1;
  });

  recentFailureLogs.forEach(log => {
    const ms = log.updatedAt.getTime();
    const bucket = chartBuckets.find(b => ms >= b.startMs && ms < b.startMs + 10 * 60 * 1000);
    if (bucket) bucket.failed += 1;
  });

  const liveChartData = chartBuckets.map(({ time, success, failed }) => ({ time, success, failed }));


  return (
    <main className="min-h-screen flex flex-col font-sans selection:bg-indigo-500/30 relative text-zinc-300">
      <BackgroundGrid />
      
      <div className="max-w-[85rem] w-full mx-auto px-6 sm:px-8 py-12 space-y-8 relative z-10">
        
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Webhook className="w-5 h-5 text-indigo-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
                Webhook Orchestrator
              </h1>
            </div>
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
            <div className="flex items-center gap-4">
              <Link href="/settings" className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </Link>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 border border-zinc-800"
                  }
                }}
              />
            </div>
          </div>
        </motion.header>

        {/* Top Section: Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/history" className="block group">
            <SpotlightCard delay={0.05} glowColor="rgba(99, 102, 241, 0.08)">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                  <Database className="w-4 h-4 text-zinc-300" />
                </div>
                <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Total Delivered</h2>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-medium tracking-tight text-white">
                  <NumberTicker value={successCount} />
                </span>
                <span className="text-zinc-500 font-medium flex items-center gap-1 text-xs uppercase tracking-wider group-hover:text-indigo-400 transition-colors">
                  <Activity className="w-3.5 h-3.5" /> View History →
                </span>
              </div>
            </SpotlightCard>
          </Link>

          <SpotlightCard delay={0.1} glowColor="rgba(244, 63, 94, 0.08)">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                <Server className="w-4 h-4 text-zinc-300" />
              </div>
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Dead Letters</h2>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-medium tracking-tight text-white tabular-nums">
                <NumberTicker value={failedCount} />
              </span>
              <span className="text-zinc-500 font-medium flex items-center gap-1 text-xs uppercase tracking-wider">
                <XCircle className="w-3.5 h-3.5" /> Failed
              </span>
            </div>
          </SpotlightCard>
        </section>

        {/* Analytics Section */}
        <section>
          <TrafficChart data={liveChartData} />
        </section>

        {/* Bottom Section: Bento Box Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (1/3 Width): Developer Console */}
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="lg:col-span-1 lg:sticky lg:top-8 self-start"
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
            
            {/* Processing Queue (Real-time Client Component) */}
            <ProcessingQueueClient initialJobs={processingJobs} />

            {/* Action Required Queue (Paginated Client Component) */}
            <ActionRequiredQueue dlqItems={recentDLQ} />

          </motion.div>
          
        </section>
      </div>
    </main>
  );
}
