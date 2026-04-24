import { NextResponse } from 'next/server';
import { isaacLabManager } from '@/lib/physics-fabric/isaac-lab-manager';

/**
 * Isaac Lab Run Pause/Resume API
 * POST — Pause or resume a running Isaac Lab run
 */

export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const body = await request.json();
    const { action, reason } = body;

    if (action === 'pause') {
      await isaacLabManager.pauseRun(runId, reason || 'Manual pause from operator');
      return NextResponse.json({ success: true, status: 'PAUSED_FOR_DATA_ISSUE' });
    }

    if (action === 'resume') {
      await isaacLabManager.resumeRun(runId);
      return NextResponse.json({ success: true, status: 'RUNNING' });
    }

    if (action === 'complete') {
      await isaacLabManager.completeRun(runId);
      return NextResponse.json({ success: true, status: 'COMPLETED' });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use: pause, resume, or complete' },
      { status: 400 }
    );
  } catch (e: any) {
    console.error('[API] Isaac Lab pause error:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
