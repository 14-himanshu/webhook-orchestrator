'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, Terminal } from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

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
    <div className="bg-[#0c0c0e] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative group">
      {/* Glossy top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      {/* Console Header */}
      <div className="px-6 py-4 border-b border-slate-800/60 bg-[#121214] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide">Developer Console</h2>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
        </div>
      </div>

      <form onSubmit={handleFireWebhook} className="p-6 space-y-6">
        <div>
          <label htmlFor="targetUrl" className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
            Target URL
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">POST</span>
            <input
              id="targetUrl"
              type="url"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full pl-16 pr-4 py-3 rounded-xl border border-slate-800 bg-[#121214] text-slate-200 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all font-mono text-sm placeholder-slate-600"
              placeholder="https://your-api.com/webhooks"
            />
          </div>
        </div>

        <div>
          <label htmlFor="payload" className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
            JSON Payload
          </label>
          <textarea
            id="payload"
            required
            rows={6}
            value={payloadStr}
            onChange={(e) => setPayloadStr(e.target.value)}
            className="w-full px-4 py-4 rounded-xl border border-slate-800 bg-[#121214] text-emerald-400/90 font-mono text-sm focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all resize-none leading-relaxed"
            spellCheck="false"
          />
        </div>

        {status === 'error' && (
          <div className="flex items-start gap-3 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed font-mono text-xs">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-start gap-3 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed font-mono text-xs">{message}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className={clsx(
            "w-full flex items-center justify-center gap-2 px-6 py-3.5 font-medium text-white rounded-xl transition-all",
            "bg-indigo-500 hover:bg-indigo-400 active:scale-[0.98]",
            "disabled:opacity-50 disabled:pointer-events-none"
          )}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Queueing Job...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Fire Webhook</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
