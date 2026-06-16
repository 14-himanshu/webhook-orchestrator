'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID() // Ensure uniqueness for simulator testing
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
          <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Webhook Simulator</h2>
      </div>

      <form onSubmit={handleFireWebhook} className="space-y-6">
        <div>
          <label htmlFor="targetUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Target URL
          </label>
          <input
            id="targetUrl"
            type="url"
            required
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            placeholder="https://your-api.com/webhooks"
          />
        </div>

        <div>
          <label htmlFor="payload" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            JSON Payload
          </label>
          <textarea
            id="payload"
            required
            rows={5}
            value={payloadStr}
            onChange={(e) => setPayloadStr(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow resize-none"
          />
        </div>

        {status === 'error' && (
          <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-xl">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p>{message}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className={clsx(
            "w-full flex items-center justify-center gap-2 px-6 py-3.5 font-semibold text-white rounded-xl transition-all shadow-sm",
            "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]",
            "disabled:opacity-70 disabled:pointer-events-none"
          )}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Queueing Webhook...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Fire Webhook
            </>
          )}
        </button>
      </form>
    </div>
  );
}
