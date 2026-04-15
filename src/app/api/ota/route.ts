import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { 
      version, storageUri, manifestData, targetTier, checksum, 
      pipelineStage = 'REAL_FLEET', 
      hardwareTarget = 'UNITREE_G1', 
      autoPromote = false 
    } = await req.json();

    // 1. Register the OTA Payload (or find existing)
    let payload = await db.oTA_Payload.findUnique({ where: { version } });
    if (!payload) {
      payload = await db.oTA_Payload.create({
        data: { version, storageUri, manifestData, checksum }
      });
    }

    // 2. Mock Agent Resolution
    const activeAgents = await db.agentRegistration.findMany({
      where: { deployTier: targetTier, status: 'active' },
      select: { id: true }
    });
    
    // 3. Register the Deployment Job
    const deployment = await db.oTA_Deployment.create({
      data: {
        payloadId: payload.id,
        targetTier,
        status: 'pending',
        pipelineStage,
        hardwareTarget,
        autoPromote,
        agentSuccessIds: activeAgents.map(a => a.id), // Assume success for demo
        agentFailedIds: [],
        triggeredBy: 'system:nexus:sim2real'
      }
    });

    // 4. Cascade Logic for Sim-to-Real Autonomous Transfer
    const cascadeDeployments = [deployment];

    if (autoPromote && pipelineStage === 'SIM_L0_BASELINE') {
      // Simulate autonomous transition to SIM_L1 after successful pass
      const l1Deployment = await db.oTA_Deployment.create({
        data: {
          payloadId: payload.id,
          targetTier: 'SIM',
          status: 'pending',
          pipelineStage: 'SIM_L1_HIL',
          hardwareTarget,
          autoPromote: true,
          agentSuccessIds: activeAgents.map(a => a.id),
          agentFailedIds: [],
          triggeredBy: 'nexus:autonomous-cascade'
        }
      });
      cascadeDeployments.push(l1Deployment);

      // Simulate autonomous transition to REAL UNITREE G1
      const realDeployment = await db.oTA_Deployment.create({
        data: {
          payloadId: payload.id,
          targetTier: 'EDGE',
          status: 'pending',
          pipelineStage: 'REAL_FLEET',
          hardwareTarget,
          autoPromote: false,
          agentSuccessIds: [],
          agentFailedIds: [],
          triggeredBy: 'nexus:autonomous-cascade:final'
        }
      });
      cascadeDeployments.push(realDeployment);
    }

    return NextResponse.json({ 
      success: true, 
      initialDeploymentId: deployment.id, 
      totalCascades: cascadeDeployments.length 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const deployments = await db.oTA_Deployment.findMany({
      include: { payload: true },
      orderBy: { startedAt: 'desc' },
      take: 20
    });
    return NextResponse.json({ success: true, deployments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
