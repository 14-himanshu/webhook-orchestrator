import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { auth } from '@clerk/nextjs/server';

const STATUS_CACHE_TTL = 5; // seconds

export async function GET(request: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tenantId = orgId || userId;

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

    const event = await prisma.event.findUnique({
      where: { jobId },
      select: { tenantId: true, status: true, attempts: { orderBy: { attemptNumber: 'desc' }, take: 1, select: { errorReason: true } } }
    });

    if (!event) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (event.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result: { status: string; errorReason?: string } = { status: event.status };
    if (event.status === 'failed') {
      result.errorReason = event.attempts[0]?.errorReason || 'Unknown error';
    }

    // Cache terminal states longer, processing states briefly
    const ttl = event.status === 'processing' ? STATUS_CACHE_TTL : 60;
    await redis.set(cacheKey, JSON.stringify(result), 'EX', ttl);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Job Status API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

