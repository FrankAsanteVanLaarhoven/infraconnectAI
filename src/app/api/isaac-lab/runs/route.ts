import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { isaacLabLauncher } from '@/lib/physics-fabric/isaac-lab-launcher';
import { liveCurationEngine } from '@/lib/physics-fabric/live-curation-engine';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '20');

  const where: any = {};
  if (status) where.status = status;

  const runs = await prisma.isaacLabRun.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      _count: { select: { episodes: true } },
    },
  });

  return NextResponse.json({ runs });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { sceneUsd, numEnvs = 256, domainRandomization = {}, experimentId } = body;

    if (!sceneUsd || !experimentId) {
      return NextResponse.json({ error: 'sceneUsd and experimentId are required' }, { status: 400 });
    }

    // Launch via launcher service
    const runId = await isaacLabLauncher.launchRun({
      sceneUsd,
      numEnvs,
      domainRandomization,
      experimentId,
    });

    // Start live monitoring
    setTimeout(() => {
      // In production: poll Isaac Lab logs or use WebSocket from container
      console.log(`[IsaacLab] Monitoring started for run ${runId}`);
    }, 5000);

    return NextResponse.json({ success: true, runId });
  } catch (error: any) {
    console.error('Failed to launch Isaac Lab run:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
