import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { webhookQueue } from '@/queue/config';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'default_secret_key_for_testing';

export async function POST(request: Request) {
  try {
    const { dlqId } = await request.json();

    if (!dlqId) {
      return NextResponse.json({ error: 'dlqId is required' }, { status: 400 });
    }

    // Fetch the DLQ record
    const dlqRecord = await prisma.deadLetterQueue.findUnique({
      where: { id: dlqId },
    });

    if (!dlqRecord) {
      return NextResponse.json({ error: 'DLQ record not found' }, { status: 404 });
    }

    // Prepare payload with replay idempotency flags
    let payload = dlqRecord.payload;
    if (typeof payload === 'object' && payload !== null && !Array.isArray(payload)) {
      payload = {
        ...payload as object,
        _is_replay: true,
        _original_failed_at: dlqRecord.failedAt.toISOString(),
      };
    }

    // Generate a fresh signature for the modified payload
    const payloadString = JSON.stringify(payload);
    const outgoingSignature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(payloadString).digest('hex');

    // Re-queue the job in BullMQ
    await webhookQueue.add('deliver-webhook', {
      url: dlqRecord.targetUrl,
      body: payload,
      signature: outgoingSignature,
    });

    // Delete the record from DLQ
    await prisma.deadLetterQueue.delete({
      where: { id: dlqId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Replay API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
