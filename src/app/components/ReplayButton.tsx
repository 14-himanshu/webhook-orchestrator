'use client';

import { useState } from 'react';
import { replayWebhook } from '@/app/actions';
import { RotateCcw, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function ReplayButton({ dlqId }: { dlqId: string }) {
  const [isReplaying, setIsReplaying] = useState(false);

  const handleReplay = async () => {
    setIsReplaying(true);
    const result = await replayWebhook(dlqId);
    if (!result.success) {
      alert('Failed to replay webhook');
    }
    setIsReplaying(false);
  };

  return (
    <button
      onClick={handleReplay}
      disabled={isReplaying}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-sm",
        "border border-zinc-700 bg-zinc-800/50 text-zinc-300",
        "hover:bg-zinc-700 hover:text-white hover:border-zinc-500",
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
