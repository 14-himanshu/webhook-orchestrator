import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { webhookQueue } from '@/queue/config';
import crypto from 'crypto';

const DEFAULT_WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'default_secret_key_for_testing';

export async function POST(request: Request) {
  try {
    const { dlqId } = await request.json();

    if (!dlqId) {
      return NextResponse.json({ error: 'dlqId is required' }, { status: 400 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the DLQ record
    const dlqRecord = await prisma.deadLetterQueue.findUnique({
      where: { id: dlqId },
    });

    if (!dlqRecord) {
      return NextResponse.json({ error: 'DLQ record not found' }, { status: 404 });
    }

    if (dlqRecord.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch the user's per-tenant secret so the replayed signature matches
    // what ingestWebhook() will verify against. Without this, users with a
    // custom webhookSecret would always get a 401 on replay.
    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    const activeSecret = settings?.webhookSecret || DEFAULT_WEBHOOK_SECRET;

    // Prepare payload with replay idempotency flags
    let payload = dlqRecord.payload;
    if (typeof payload === 'object' && payload !== null && !Array.isArray(payload)) {
      payload = {
        ...payload as object,
        _is_replay: true,
        _original_failed_at: dlqRecord.failedAt.toISOString(),
      };
    }

    // Generate a fresh signature using the user's active secret
    const payloadString = JSON.stringify(payload);
    const outgoingSignature = crypto
      .createHmac('sha256', activeSecret)
      .update(payloadString)
      .digest('hex');

    // Re-queue the job in BullMQ
    const job = await webhookQueue.add('deliver-webhook', {
      url: dlqRecord.targetUrl,
      body: payload,
      signature: outgoingSignature,
      userId: userId,
    });

    // Delete the record from DLQ only after successfully re-queuing
    await prisma.deadLetterQueue.delete({
      where: { id: dlqId },
    });

    return NextResponse.json({ success: true, jobId: job.id, url: dlqRecord.targetUrl, body: payload });
  } catch (error) {
    console.error('Replay API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

