'use client';

import { useState } from 'react';
import ClientDate from './ClientDate';
import ReplayButton from './ReplayButton';
import PayloadModal from './PayloadModal';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DeadLetterRow({ dlq, index }: { dlq: any; index: number }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <tr 
        className="hover:bg-white/[0.02] transition-colors duration-200 ease-in-out group cursor-pointer"
        onClick={() => setIsModalOpen(true)}
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
        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
          <ReplayButton dlqId={dlq.id} />
        </td>
      </tr>
      
      <PayloadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={dlq} 
        type="dlq" 
      />
    </>
  );
}
