import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get('runId');
  const limit = parseInt(searchParams.get('limit') || '48');

  if (!runId) {
    return NextResponse.json({ error: 'runId is required' }, { status: 400 });
  }

  const episodes = await prisma.physicsEpisode.findMany({
    where: { runId },
    orderBy: { episodeIndex: 'desc' },
    take: limit,
  });

  return NextResponse.json({ episodes });
}
