'use client';

import { useState } from 'react';
import { replayWebhook } from '@/app/actions';

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
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700 hover:border-zinc-600"
    >
      {isReplaying ? (
        <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )}
      {isReplaying ? 'Replaying...' : 'Replay'}
    </button>
  );
}
