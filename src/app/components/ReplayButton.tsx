'use client';

import { useState } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ReplayButton({ dlqId }: { dlqId: string }) {
  const [isReplaying, setIsReplaying] = useState(false);
  const router = useRouter();

  const handleReplay = async () => {
    setIsReplaying(true);
    
    try {
      const res = await fetch('/api/dlq/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dlqId }),
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to replay webhook');
      }
      
      // Refresh the current route to update the server components (DLQ table)
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsReplaying(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleReplay}
      disabled={isReplaying}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] border",
        "bg-[#1a1a1f] border-white/10 text-slate-300 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/10",
        "disabled:opacity-50 disabled:pointer-events-none"
      )}
    >
      {isReplaying ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
      ) : (
        <RotateCcw className="w-3.5 h-3.5" />
      )}
      {isReplaying ? 'Replaying...' : 'Replay'}
    </motion.button>
  );
}
