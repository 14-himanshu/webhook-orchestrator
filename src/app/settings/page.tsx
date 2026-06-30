import prisma from '@/lib/prisma';
import BackgroundGrid from '@/app/components/BackgroundGrid';
import { Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

async function saveSettings(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  'use server';
  try {
    const { userId, orgId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };
    const tenantId = orgId || userId;

    const slackUrl = (formData.get('slackUrl') as string) || '';
    const discordUrl = (formData.get('discordUrl') as string) || '';
    const maxRetries = parseInt(formData.get('maxRetries') as string, 10) || 3;
    const webhookSecret = (formData.get('webhookSecret') as string) || '';

    await prisma.tenantSettings.upsert({
      where: { tenantId },
      update: { slackUrl, discordUrl, maxRetries, webhookSecret },
      create: { tenantId, slackUrl, discordUrl, maxRetries, webhookSecret },
    });

    return { success: true };
  } catch (err) {
    console.error('Settings save error:', err);
    return { success: false, error: 'Failed to save. Please try again.' };
  }
}

export default async function SettingsPage() {
  const { userId, orgId } = await auth();

  if (!userId) {
    return null;
  }
  const tenantId = orgId || userId;

  const settings = await prisma.tenantSettings.findUnique({
    where: { tenantId },
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

        <SettingsForm
          defaultValues={{
            slackUrl: settings.slackUrl || '',
            discordUrl: settings.discordUrl || '',
            maxRetries: settings.maxRetries,
            webhookSecret: settings.webhookSecret || '',
          }}
          saveAction={saveSettings}
        />
      </div>
    </main>
  );
}

