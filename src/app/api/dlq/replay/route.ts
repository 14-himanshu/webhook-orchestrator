import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { webhookQueue } from '@/queue/config';

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

    // Re-queue the job in BullMQ
    await webhookQueue.add('deliver-webhook', {
      url: dlqRecord.targetUrl,
      body: dlqRecord.payload,
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
