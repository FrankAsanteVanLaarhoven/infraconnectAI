import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { MLOpsTracker } from '@/lib/mlops/wandb';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === 'logSwarmActivity') {
      const { agentId, status, progress, data } = body;
      await MLOpsTracker.logSwarmActivity(agentId, status, progress, data || {});
      return NextResponse.json({ success: true, message: 'Swarm logged' });
    }

    // Default: assumption is ML Experiment tracking
    const { modelName, runTag, hyperparameters, rewardCurves, svrRate } = body;
    
    // We queue directly to db instead of via MLOpsTracker to maintain GET compatibility
    const experiment = await db.mL_Experiment.create({
      data: {
        modelName,
        runTag,
        hyperparameters,
        rewardCurves,
        svrRate
      }
    });

    return NextResponse.json({ success: true, experimentId: experiment.id });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const experiments = await db.mL_Experiment.findMany({
      orderBy: { completedAt: 'desc' },
      take: 15
    });
    return NextResponse.json({ success: true, experiments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
