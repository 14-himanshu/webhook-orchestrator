'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ClientDate from './ClientDate';
import ReplayButton from './ReplayButton';
import PayloadModal from './PayloadModal';
import type { DLQItem } from '@/types/webhook';

export default function DeadLetterRow({ dlq }: { dlq: DLQItem }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/dlq?id=${dlq.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success(`DLQ item dismissed.`);
      setIsVisible(false);
      setTimeout(() => router.refresh(), 300);
    } catch {
      toast.error('Failed to delete DLQ item.');
      setIsDeleting(false);
    }
  };

  if (!isVisible) return null;


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
          <div className="flex items-center justify-end gap-2">
            <ReplayButton dlqId={dlq.id} />
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              title="Dismiss permanently"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md border transition-all bg-[#09090b] border-white/10 text-zinc-500 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
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
