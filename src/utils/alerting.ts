interface AlertDetails {
  jobId: string;
  targetUrl: string;
  errorReason: string;
}

export async function sendCriticalAlert(details: AlertDetails): Promise<void> {
  try {
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    const discordUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!slackUrl && !discordUrl) {
      console.warn('No alerting webhook URL configured. Skipping critical alert.');
      return;
    }

    const message = `🚨 *CRITICAL: Webhook Delivery Failed Permanently*\n\n*Job ID:* ${details.jobId}\n*Target:* ${details.targetUrl}\n*Reason:* ${details.errorReason}\n\n_It has been moved to the Dead Letter Queue._`;

    if (slackUrl) {
      await fetch(slackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });
    }

    if (discordUrl) {
      await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });
    }
  } catch (error) {
    // Fail gracefully: we don't want alerting failures to crash the main worker
    console.error('Failed to send critical alert:', error);
  }
}
