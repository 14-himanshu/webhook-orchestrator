import prisma from '@/lib/prisma';

interface AlertDetails {
  jobId: string;
  targetUrl: string;
  errorReason: string;
  userId?: string;
}

export async function sendCriticalAlert(details: AlertDetails): Promise<void> {
  try {
    let slackUrl = process.env.SLACK_WEBHOOK_URL;
    let discordUrl = process.env.DISCORD_WEBHOOK_URL;

    if (details.userId && details.userId !== 'anonymous') {
      const settings = await prisma.userSettings.findUnique({ where: { userId: details.userId } });
      if (settings?.slackUrl) slackUrl = settings.slackUrl;
      if (settings?.discordUrl) discordUrl = settings.discordUrl;
    }

    if (!slackUrl && !discordUrl) {
      console.warn('No alerting webhook URL configured. Skipping critical alert.');
      return;
    }

    const message = `🚨 *CRITICAL: Webhook Delivery Failed Permanently*\n\n*Job ID:* ${details.jobId}\n*Target:* ${details.targetUrl}\n*Reason:* ${details.errorReason}\n\n_It has been moved to the Dead Letter Queue._`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const promises = [];

    if (slackUrl) {
      promises.push(
        fetch(slackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message }),
          signal: controller.signal,
        }).catch(e => console.error('Slack alert failed:', e))
      );
    }

    if (discordUrl) {
      promises.push(
        fetch(discordUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: message }),
          signal: controller.signal,
        }).catch(e => console.error('Discord alert failed:', e))
      );
    }

    await Promise.all(promises);
    clearTimeout(timeoutId);
  } catch (error) {
    // Fail gracefully: we don't want alerting failures to crash the main worker
    console.error('Failed to send critical alert:', error);
  }
}
