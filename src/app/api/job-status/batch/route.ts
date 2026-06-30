import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tenantId = orgId || userId;

    const { ids } = await request.json() as { ids?: string[] };
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ results: {} });
    }

    // Limit to 100 to prevent abuse
    const queryIds = ids.slice(0, 100);
    const results: Record<string, { status: string; errorReason?: string }> = {};

    // Batch query postgres for all events
    const events = await prisma.event.findMany({
      where: { jobId: { in: queryIds }, tenantId },
      select: { jobId: true, status: true, attempts: { orderBy: { attemptNumber: 'desc' }, take: 1, select: { errorReason: true } } }
    });

    for (const event of events) {
      results[event.jobId] = { 
        status: event.status, 
        errorReason: event.attempts[0]?.errorReason || undefined 
      };
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Batch Job Status API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
