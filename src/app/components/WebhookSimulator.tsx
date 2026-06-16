'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, Terminal } from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function WebhookSimulator() {
  const router = useRouter();
  
  const [targetUrl, setTargetUrl] = useState('https://jsonplaceholder.typicode.com/posts');
  const [payloadStr, setPayloadStr] = useState('{\n  "event": "test_ping",\n  "timestamp": "' + new Date().toISOString() + '"\n}');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFireWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    // 1. Validate JSON
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(payloadStr);
    } catch (err) {
      setStatus('error');
      setMessage('Invalid JSON payload. Please check your syntax.');
      return;
    }

    if (!targetUrl.startsWith('http')) {
      setStatus('error');
      setMessage('Target URL must start with http:// or https://');
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

      setStatus('success');
      setMessage(`Success! Job queued with ID: ${data.jobId}`);
      
      // Refresh the page data in the background to update the DLQ table if necessary
      setTimeout(() => router.refresh(), 1000);
      
      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An unexpected error occurred.');
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
        <form onSubmit={handleFireWebhook} className="space-y-6 flex flex-col h-full">
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

          <AnimatePresence mode="popLayout">
            {status === 'error' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="flex items-start gap-3 text-sm text-zinc-300 bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg shrink-0"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                <p className="leading-relaxed font-mono text-[11px]">{message}</p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="flex items-start gap-3 text-sm text-zinc-300 bg-zinc-800/50 border border-zinc-700 p-4 rounded-lg shrink-0"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-zinc-400" />
                <p className="leading-relaxed font-mono text-[11px]">{message}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="pt-2 shrink-0 mt-auto">
            <button
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
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
