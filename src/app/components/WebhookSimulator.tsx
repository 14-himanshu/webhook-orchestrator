'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, Terminal, X, Play } from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function WebhookSimulator() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
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
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs uppercase tracking-widest transition-all duration-200 ease-in-out border border-indigo-500/50 shadow-sm active:scale-[0.98]"
      >
        <Play className="w-3.5 h-3.5" />
        Test Webhook
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-sm"
            />

            {/* Slide-out Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#000000] border-l border-white/10 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-white/10 bg-[#09090b] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">Developer Console</h2>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-md text-zinc-500 hover:bg-white/5 hover:text-zinc-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6">
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
                        className="w-full pl-16 pr-4 py-3 rounded-lg border border-white/5 bg-black/20 text-zinc-200 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all duration-200 ease-in-out font-mono text-[13px] placeholder-zinc-700"
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
                      className="w-full h-full min-h-[250px] px-4 py-4 rounded-lg border border-white/5 bg-black/20 text-emerald-400/90 font-mono text-[13px] focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all duration-200 ease-in-out resize-none leading-relaxed"
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
                        <p className="leading-relaxed font-mono text-xs">{message}</p>
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
                        <p className="leading-relaxed font-mono text-xs">{message}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="pt-2 shrink-0">
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
