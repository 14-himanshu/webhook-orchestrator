'use client';

import { useState } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

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
    <button
      onClick={handleReplay}
      disabled={isReplaying}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-sm",
        "border border-white/10 bg-white/5 text-zinc-300",
        "hover:bg-white/10 hover:text-white hover:border-white/20",
        "active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
      )}
    >
      {isReplaying ? (
        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
      ) : (
        <RotateCcw className="w-4 h-4" />
      )}
      {isReplaying ? 'Replaying...' : 'Replay'}
    </button>
  );
}
