'use client';

import { useState } from 'react';
import { Send, Loader2, Terminal } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { emitJobAdded } from '@/utils/jobEvents';

export default function WebhookSimulator() {
  const [targetUrl, setTargetUrl] = useState('https://jsonplaceholder.typicode.com/posts');
  const [payloadStr, setPayloadStr] = useState('{\n  "event": "test_ping",\n  "timestamp": "' + new Date().toISOString() + '"\n}');
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');

  const handleFireWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // 1. Validate JSON
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(payloadStr);
    } catch {
      setStatus('idle');
      toast.error('Invalid JSON payload. Please check your syntax.');
      return;
    }

    if (!targetUrl.startsWith('http')) {
      setStatus('idle');
      toast.error('Target URL must start with http:// or https://');
      return;
    }

    // 2. Fire Request
    try {
      const res = await fetch('/api/simulator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetUrl,
          payload: parsedPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to queue webhook');
      }

      setStatus('idle');
      toast.success(`Job queued with ID: ${data.jobId}`);
      
      // Dispatch event to show the job in the real-time Processing Queue
      emitJobAdded(data.jobId, targetUrl, parsedPayload);
      
    } catch (err: unknown) {
      const error = err as Error;
      setStatus('idle');
      toast.error(error.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-400" />
          <h2 className="text-xs font-medium text-zinc-300 uppercase tracking-widest">Developer Console</h2>
        </div>
      </div>

      {/* Console Form Content */}
      <div className="p-6 flex-1 flex flex-col">
        <motion.form layout onSubmit={handleFireWebhook} className="space-y-6 flex flex-col h-full">
          <div>
            <label htmlFor="targetUrl" className="block text-[10px] font-medium text-zinc-500 mb-2 uppercase tracking-widest">
              Target URL
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">POST</span>
              <input
                id="targetUrl"
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full pl-14 pr-4 py-3 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 outline-none transition-all duration-200 ease-in-out font-mono text-xs placeholder-zinc-700"
                placeholder="https://your-api.com/webhooks"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <label htmlFor="payload" className="block text-[10px] font-medium text-zinc-500 mb-2 uppercase tracking-widest">
              JSON Payload
            </label>
            <textarea
              id="payload"
              required
              value={payloadStr}
              onChange={(e) => setPayloadStr(e.target.value)}
              className="w-full h-full min-h-[160px] px-4 py-4 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 font-mono text-xs focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 outline-none transition-all duration-200 ease-in-out resize-none leading-relaxed"
              spellCheck="false"
            />
          </div>


          
          <motion.div layout className="pt-2 shrink-0 mt-auto">
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={status === 'loading'}
              className={clsx(
                "w-full flex items-center justify-center gap-2 px-6 py-3 font-medium text-black rounded-lg transition-all duration-200 ease-in-out border border-transparent",
                "bg-white hover:bg-zinc-200 active:scale-[0.99]",
                "disabled:opacity-50 disabled:pointer-events-none disabled:bg-zinc-800 disabled:text-zinc-500"
              )}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Queueing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Fire Webhook Event</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}
