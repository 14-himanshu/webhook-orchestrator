import prisma from '@/lib/prisma';
import ReplayButton from '@/app/components/ReplayButton';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const successCount = await prisma.webhookLog.count();
  const failedCount = await prisma.deadLetterQueue.count();
  const recentDLQ = await prisma.deadLetterQueue.findMany({
    take: 10,
    orderBy: { failedAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Webhook Orchestrator</h1>
            <p className="text-zinc-400 mt-1">Real-time monitoring and Dead Letter Queue management.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 rounded-full border border-zinc-800 shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-emerald-400">System Status: Online</span>
          </div>
        </header>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm hover:border-zinc-700 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Successful Deliveries</h2>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-white">{successCount.toLocaleString()}</span>
              <span className="text-sm text-emerald-400 font-medium">webhooks</span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm hover:border-zinc-700 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Dead Letter Queue (DLQ)</h2>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-white">{failedCount.toLocaleString()}</span>
              <span className="text-sm text-rose-400 font-medium">permanently failed</span>
            </div>
          </div>
        </section>

        {/* DLQ Table */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
            <h3 className="text-lg font-medium text-white">Recent Dead Letters</h3>
            <span className="text-xs text-zinc-500 font-mono">Showing up to 10 entries</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/50 border-b border-zinc-800">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium tracking-wider">Job ID</th>
                  <th scope="col" className="px-6 py-4 font-medium tracking-wider">Target URL</th>
                  <th scope="col" className="px-6 py-4 font-medium tracking-wider">Error Reason</th>
                  <th scope="col" className="px-6 py-4 font-medium tracking-wider text-right">Failed At</th>
                  <th scope="col" className="px-6 py-4 font-medium tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {recentDLQ.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-8 h-8 mb-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <p>Dead letter queue is empty. System is operating perfectly.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentDLQ.map((dlq) => (
                    <tr key={dlq.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-zinc-300">
                        {dlq.jobId}
                      </td>
                      <td className="px-6 py-4 text-zinc-300 max-w-xs truncate" title={dlq.targetUrl}>
                        {dlq.targetUrl}
                      </td>
                      <td className="px-6 py-4 text-rose-400 font-mono text-xs max-w-sm truncate" title={dlq.errorReason}>
                        {dlq.errorReason}
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-400 whitespace-nowrap">
                        {dlq.failedAt.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end">
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
