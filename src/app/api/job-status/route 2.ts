import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');
    
    if (!jobId) {
      return NextResponse.json({ error: 'Missing job ID' }, { status: 400 });
    }

    // Check if it completed successfully
    const successLog = await prisma.webhookLog.findFirst({
      where: { jobId },
    });

    if (successLog) {
      // Ensure the user owns this log
      if (successLog.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.json({ status: 'completed' });
    }

    // Check if it permanently failed
    const dlqLog = await prisma.deadLetterQueue.findFirst({
      where: { jobId },
    });

    if (dlqLog) {
      if (dlqLog.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.json({ status: 'failed', errorReason: dlqLog.errorReason });
    }

    // If it's not in Postgres, it means it's either currently processing, waiting,
    // or just hasn't hit the DB yet. We return 'processing'.
    return NextResponse.json({ status: 'processing' });
  } catch (error) {
    console.error('Job Status API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
