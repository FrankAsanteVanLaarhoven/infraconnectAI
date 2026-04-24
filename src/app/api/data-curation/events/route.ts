import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { streamProducer as redisProducer } from '@/infrastructure/redis/producer';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get('runId');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!runId) {
    return NextResponse.json({ error: 'runId is required' }, { status: 400 });
  }

  const events = await prisma.dataCurationEvent.findMany({
    where: { runId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({ events });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { runId, episodeIds, action, reason, confidence = 0.9 } = body;

    if (!runId || !episodeIds || !action || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Record the event
    const event = await prisma.dataCurationEvent.create({
      data: {
        runId,
        episodeIds,
        action,
        reason,
        confidence,
        agent: 'Human',
      },
    });

    // If pruning, update episodes
    if (action === 'PRUNE') {
      await prisma.physicsEpisode.updateMany({
        where: {
          runId,
          episodeIndex: { in: episodeIds.map(Number) },
        },
        data: { isPruned: true, pruneReason: reason },
      });
    }

    // Broadcast to all connected clients
    await redisProducer.publish('stream:physics.curation', {
      runId,
      decisions: (Array.isArray(event.episodeIds) ? event.episodeIds : JSON.parse(event.episodeIds as any)).map((idx: any) => ({
        episodeIndex: Number(idx),
        action: event.action as any,
        reason: event.reason,
        confidence: event.confidence,
      })),
      timestamp: Date.now()
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error('Curation event error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
