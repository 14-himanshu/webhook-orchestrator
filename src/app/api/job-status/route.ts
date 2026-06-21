import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { auth } from '@clerk/nextjs/server';

const STATUS_CACHE_TTL = 5; // seconds

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

    // Check Redis cache first — avoids hitting Postgres on every 1s poll tick
    const cacheKey = `job-status:${jobId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    // Check if it completed successfully
    const successLog = await prisma.webhookLog.findFirst({
      where: { jobId },
    });

    if (successLog) {
      if (successLog.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const result = { status: 'completed' };
      // Cache terminal states longer — they won't change
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 60);
      return NextResponse.json(result);
    }

    // Check if it permanently failed
    const dlqLog = await prisma.deadLetterQueue.findFirst({
      where: { jobId },
    });

    if (dlqLog) {
      if (dlqLog.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const result = { status: 'failed', errorReason: dlqLog.errorReason };
      // Cache terminal states longer — they won't change
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 60);
      return NextResponse.json(result);
    }

    // Still processing — cache briefly so rapid polls don't all hit Postgres
    const result = { status: 'processing' };
    await redis.set(cacheKey, JSON.stringify(result), 'EX', STATUS_CACHE_TTL);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Job Status API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

