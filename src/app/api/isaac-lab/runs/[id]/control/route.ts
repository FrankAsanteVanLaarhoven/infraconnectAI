import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { streamProducer as redisProducer } from '@/infrastructure/redis/producer';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { action } = await request.json();
    const validActions = ['pause', 'resume', 'stop'];

    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    const run = await prisma.isaacLabRun.findUnique({
      where: { id: params.id },
    });

    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    let newStatus: string;

    switch (action) {
      case 'pause':
        newStatus = 'PAUSED_FOR_DATA_ISSUE';
        break;
      case 'resume':
        newStatus = 'RUNNING';
        break;
      case 'stop':
        newStatus = 'ARCHIVED';
        break;
      default:
        newStatus = run.status;
    }

    const updatedRun = await prisma.isaacLabRun.update({
      where: { id: params.id },
      data: {
        status: newStatus as any,
        ...(action === 'stop' && { completedAt: new Date() }),
      },
    });

    // Broadcast control action
    await redisProducer.publish('stream:agent.actions', {
      agent: 'isaac-control',
      decision: action,
      reason: `Run ${action} requested by user`,
      target: params.id,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      run: updatedRun,
      message: `Run ${action} successful`,
    });
  } catch (error: any) {
    console.error('Control action failed:', error);
    return NextResponse.json(
      { error: 'Failed to execute control action' },
      { status: 500 }
    );
  }
}
