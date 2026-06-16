'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, Terminal } from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function WebhookSimulator() {
  const router = useRouter();
  
  const [targetUrl, setTargetUrl] = useState('https://httpstat.us/500');
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
    <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden relative shadow-sm h-full flex flex-col">
      {/* Console Header */}
      <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">Developer Console</h2>
        </div>
        <div className="flex gap-1.5 opacity-60">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
        </div>
      </div>

      {/* Console Form Content */}
      <div className="p-6 flex-1 flex flex-col">
        <form onSubmit={handleFireWebhook} className="space-y-6 flex flex-col h-full">
          <div>
            <label htmlFor="targetUrl" className="block text-[10px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">
              Target URL
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm">POST</span>
              <input
                id="targetUrl"
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full pl-14 pr-4 py-3 rounded-lg border border-white/5 bg-black/20 text-zinc-200 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all duration-200 ease-in-out font-mono text-xs placeholder-zinc-700"
                placeholder="https://your-api.com/webhooks"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <label htmlFor="payload" className="block text-[10px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">
              JSON Payload
            </label>
            <textarea
              id="payload"
              required
              value={payloadStr}
              onChange={(e) => setPayloadStr(e.target.value)}
              className="w-full h-full min-h-[160px] px-4 py-4 rounded-lg border border-white/5 bg-black/20 text-emerald-400/90 font-mono text-xs focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all duration-200 ease-in-out resize-none leading-relaxed"
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
                className="flex items-start gap-3 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg shrink-0"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed font-mono text-[11px]">{message}</p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="flex items-start gap-3 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg shrink-0"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed font-mono text-[11px]">{message}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="pt-2 shrink-0 mt-auto">
            <button
              type="submit"
              disabled={status === 'loading'}
              className={clsx(
                "w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white rounded-lg transition-all duration-200 ease-in-out border border-indigo-500/50",
                "bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99]",
                "disabled:opacity-50 disabled:pointer-events-none"
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
