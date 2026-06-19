'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import PayloadModal from './PayloadModal';
import clsx from 'clsx';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function JobRow({ job, visualStatus = 'processing' }: { job: any, visualStatus?: 'processing' | 'completed' | 'failed' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <tr 
        className={clsx(
          "transition-all duration-500 ease-in-out group cursor-pointer",
          visualStatus === 'processing' && "hover:bg-white/[0.02]",
          visualStatus === 'completed' && "bg-emerald-500/10",
          visualStatus === 'failed' && "bg-rose-500/10"
        )}
        onClick={() => setIsModalOpen(true)}
      >
        <td className="px-6 py-4 font-mono text-[13px] text-zinc-400">
          {job.id}
          {visualStatus === 'processing' && (
            <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">
              Attempt {job.attemptsMade}
            </div>
          )}
        </td>
        <td className={clsx(
          "px-6 py-4 font-mono text-[13px] max-w-[16rem] truncate transition-colors duration-500",
          visualStatus === 'processing' ? "text-zinc-200" : (visualStatus === 'completed' ? "text-emerald-300" : "text-rose-300")
        )} title={job.data.url}>
          {job.data.url}
        </td>
        <td className="px-6 py-4 text-right">
          <div className={clsx(
            "inline-flex items-center justify-end gap-2 px-3 py-1.5 rounded-full text-[10px] font-medium tracking-widest uppercase transition-all duration-500",
            visualStatus === 'processing' && "text-zinc-300 bg-zinc-800 border border-zinc-700",
            visualStatus === 'completed' && "text-emerald-300 bg-emerald-500/20 border border-emerald-500/30",
            visualStatus === 'failed' && "text-rose-300 bg-rose-500/20 border border-rose-500/30"
          )}>
            {visualStatus === 'processing' && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />}
            {visualStatus === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            {visualStatus === 'failed' && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
            {visualStatus === 'processing' ? 'Processing' : (visualStatus === 'completed' ? 'Success' : 'Failed')}
          </div>
        </td>
      </tr>

      <PayloadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={job} 
        type="job" 
      />
    </>
  );
}
