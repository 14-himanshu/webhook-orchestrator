'use client';

import { useState } from 'react';
import { RefreshCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { emitJobAdded } from '@/utils/jobEvents';

interface ReplayButtonProps {
  dlqId: string;
}

export default function ReplayButton({ dlqId }: ReplayButtonProps) {
  const [isReplaying, setIsReplaying] = useState(false);

  const handleReplay = async () => {
    setIsReplaying(true);
    try {
      const res = await fetch('/api/dlq/replay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dlqId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to replay job');
      }

      const data = await res.json();

      toast.success(`Job ${data.jobId} queued for replay`);

      // Dispatch event to show the job in the real-time Processing Queue
      emitJobAdded(data.jobId, data.url, data.body);
      setIsReplaying(false);
    } catch (error) {
      console.error('Error replaying job:', error);
      toast.error('Failed to replay job. Please check the console.');
      setIsReplaying(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleReplay}
      disabled={isReplaying}
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md border transition-all",
        "bg-[#09090b] border-white/10 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10",
        "disabled:opacity-50 disabled:pointer-events-none"
      )}
    >
      {isReplaying ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <RefreshCcw className="w-3.5 h-3.5" />
      )}
      {isReplaying ? 'Replaying...' : 'Replay'}
    </motion.button>
  );
}
