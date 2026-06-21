'use client';

import { useTransition } from 'react';
import { Save, Bell, Key, RefreshCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsFormProps {
  defaultValues: {
    slackUrl: string;
    discordUrl: string;
    maxRetries: number;
    webhookSecret: string;
  };
  saveAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export default function SettingsForm({ defaultValues, saveAction }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveAction(formData);
      if (result.success) {
        toast.success('Configuration saved successfully.');
      } else {
        toast.error(result.error || 'Failed to save configuration.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Alerting Section */}
      <section className="bg-[#0A0A0A] border border-zinc-800 rounded-xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
          <Bell className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-200">Critical Alerting</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-widest">Slack Webhook URL</label>
            <input
              type="url"
              name="slackUrl"
              defaultValue={defaultValues.slackUrl}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-widest">Discord Webhook URL</label>
            <input
              type="url"
              name="discordUrl"
              defaultValue={defaultValues.discordUrl}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono"
            />
          </div>
        </div>
      </section>

      {/* Delivery Policy Section */}
      <section className="bg-[#0A0A0A] border border-zinc-800 rounded-xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
          <RefreshCcw className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-200">Delivery Policy</h2>
        </div>

        <div className="space-y-2 max-w-sm">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-widest">Max Retries</label>
          <input
            type="number"
            name="maxRetries"
            min="1"
            max="20"
            defaultValue={defaultValues.maxRetries}
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono"
          />
          <p className="text-[11px] text-zinc-500">Number of attempts with exponential backoff before sending to Dead Letters.</p>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-[#0A0A0A] border border-zinc-800 rounded-xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
          <Key className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-200">Security</h2>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-widest">HMAC Webhook Secret</label>
          <input
            type="password"
            name="webhookSecret"
            defaultValue={defaultValues.webhookSecret}
            placeholder="Leave blank to use default server secret..."
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono"
          />
          <p className="text-[11px] text-zinc-500">Used to sign outgoing payloads with `x-webhook-signature`.</p>
        </div>
      </section>

      {/* Actions */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-semibold rounded-lg hover:bg-zinc-200 transition-colors active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Configuration
            </>
          )}
        </button>
      </div>
    </form>
  );
}
