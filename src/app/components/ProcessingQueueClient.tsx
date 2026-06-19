'use client';

import { useState, useEffect } from 'react';
import { Activity, Clock } from 'lucide-react';
import { jobEventEmitter, JobEventDetail } from '@/utils/jobEvents';
import JobRow from './JobRow';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export interface OptimisticJob {
  id: string;
  url: string;
  body: Record<string, unknown> | null;
  status: 'processing' | 'completed' | 'failed';
  attemptsMade: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProcessingQueueClient({ initialJobs }: { initialJobs: any[] }) {
  const router = useRouter();
  
  // Transform initial server jobs into our optimistic shape
  const [jobs, setJobs] = useState<OptimisticJob[]>(
    initialJobs.map(j => ({
      id: j.id,
      url: j.data?.url || j.url,
      body: j.data?.body || j.body,
      status: 'processing',
      attemptsMade: j.attemptsMade || 0
    }))
  );

  useEffect(() => {
    // Merge new initialJobs from server on refresh
    // eslint-disable-next-line
    setJobs(prev => {
      const newJobs = [...prev];
      for (const j of initialJobs) {
        if (!newJobs.find(x => x.id === j.id)) {
          newJobs.push({
            id: j.id,
            url: j.data?.url || j.url,
            body: j.data?.body || j.body,
            status: 'processing',
            attemptsMade: j.attemptsMade || 0
          });
        }
      }
      return newJobs;
    });
  }, [initialJobs]);

  useEffect(() => {
    const handleJobAdded = (e: Event) => {
      const customEvent = e as CustomEvent<JobEventDetail>;
      const newJob = customEvent.detail;
      setJobs(prev => {
        if (prev.find(j => j.id === newJob.id)) return prev;
        return [{ id: newJob.id, url: newJob.url, body: newJob.body, status: 'processing', attemptsMade: 0 }, ...prev];
      });
    };

    jobEventEmitter.addEventListener('job_added', handleJobAdded);
    return () => jobEventEmitter.removeEventListener('job_added', handleJobAdded);
  }, []);

  // Polling logic for jobs that are currently 'processing'
  useEffect(() => {
    const processingJobs = jobs.filter(j => j.status === 'processing');
    if (processingJobs.length === 0) return;

    const interval = setInterval(async () => {
      for (const job of processingJobs) {
        try {
          const res = await fetch(`/api/job-status?id=${job.id}`);
          if (!res.ok) continue;
          const data = await res.json();

          if (data.status === 'completed' || data.status === 'failed') {
            setJobs(prev => prev.map(j => 
              j.id === job.id ? { ...j, status: data.status } : j
            ));

            if (data.status === 'completed') {
              toast.success(`Job ${job.id} successfully delivered!`);
            } else {
              toast.error(`Job ${job.id} failed: ${data.errorReason || 'Unknown error'}`);
            }

            // Clean up the job after showing the status for 2.5 seconds
            setTimeout(() => {
              setJobs(prev => prev.filter(j => j.id !== job.id));
              router.refresh(); // Sync the rest of the page (like metrics and DLQ table)
            }, 2500);
          }
        } catch (err) {
          console.error('Failed to poll job status:', err);
        }
      }
    }, 1000); // Poll every 1s

    return () => clearInterval(interval);
  }, [jobs, router]);

  return (
    <div className="rounded-xl bg-[#0A0A0A] border border-zinc-800 shadow-sm flex flex-col">
      <div className="px-6 py-5 border-b border-zinc-800 bg-zinc-900/50 flex items-center shrink-0">
        <h3 className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-400" />
          Processing Queue
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-4">Job ID</th>
              <th scope="col" className="px-6 py-4">Target URL</th>
              <th scope="col" className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-zinc-500">
                  <div className="flex flex-col items-center justify-center">
                    <Activity className="w-5 h-5 text-zinc-600 mb-3" />
                    <p className="text-sm font-medium text-zinc-400">No active jobs</p>
                    <p className="text-[11px] mt-1 text-zinc-600">The processing queue is empty.</p>
                  </div>
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <JobRow 
                  key={job.id} 
                  job={{
                    id: job.id,
                    attemptsMade: job.attemptsMade,
                    data: { url: job.url, body: job.body }
                  }}
                  visualStatus={job.status}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
