'use server';

import prisma from '@/lib/prisma';
import { webhookQueue } from '@/queue/config';
import { revalidatePath } from 'next/cache';

export async function replayWebhook(dlqId: string) {
  try {
    const dlqRecord = await prisma.deadLetterQueue.findUnique({
      where: { id: dlqId },
    });

    if (!dlqRecord) {
      throw new Error('DLQ record not found');
    }

    // Re-queue the job in BullMQ
    await webhookQueue.add('deliver-webhook', {
      url: dlqRecord.targetUrl,
      body: dlqRecord.payload,
    });

    // Delete it from DLQ since it's back in the queue
    await prisma.deadLetterQueue.delete({
      where: { id: dlqId },
    });

    // Refresh the dashboard data
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Replay failed:', error);
    return { success: false, error: 'Failed to replay webhook' };
  }
}
