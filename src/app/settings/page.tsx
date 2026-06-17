import prisma from '@/lib/prisma';
import BackgroundGrid from '@/app/components/BackgroundGrid';
import { Settings, Save, ArrowLeft, Bell, Key, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  }) || {
    slackUrl: '',
    discordUrl: '',
    maxRetries: 3,
    webhookSecret: '',
  };

  return (
    <main className="min-h-screen font-sans selection:bg-indigo-500/30 relative text-zinc-300">
      <BackgroundGrid />
      
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 relative z-10">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0A0A0A] rounded-xl border border-zinc-800 shadow-sm">
              <Settings className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Workspace Settings
            </h1>
          </div>
          <p className="text-zinc-400 font-medium">
            Configure your orchestrator policies, alerting, and security.
          </p>
        </header>

        <form action={async (formData) => {
          'use server';
          const { userId } = await auth();
          if (!userId) return;

          const slackUrl = formData.get('slackUrl') as string;
          const discordUrl = formData.get('discordUrl') as string;
          const maxRetries = parseInt(formData.get('maxRetries') as string, 10);
          const webhookSecret = formData.get('webhookSecret') as string;

          await prisma.userSettings.upsert({
            where: { userId },
            update: { slackUrl, discordUrl, maxRetries, webhookSecret },
            create: { userId, slackUrl, discordUrl, maxRetries, webhookSecret },
          });
        }} className="space-y-6">
          
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
                  defaultValue={settings.slackUrl || ''}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-widest">Discord Webhook URL</label>
                <input 
                  type="url" 
                  name="discordUrl"
                  defaultValue={settings.discordUrl || ''}
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
                defaultValue={settings.maxRetries}
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono"
              />
              <p className="text-[11px] text-zinc-500">Number of times to attempt delivery with exponential backoff before sending to Dead Letters.</p>
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
                defaultValue={settings.webhookSecret || ''}
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-semibold rounded-lg hover:bg-zinc-200 transition-colors active:scale-95"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
