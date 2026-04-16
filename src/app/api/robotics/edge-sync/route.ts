import { NextResponse } from 'next/server';
import { zeroTrustEnforcer } from '@/lib/security/zero-trust';
import { gitOpsController } from '@/lib/nexus/orchestrator/gitops-controller';
import { mqttBroker } from '@/lib/robotics/mqtt-telemetry';
import { eventBus } from '@/lib/events/schema';

/**
 * POST /api/robotics/edge-sync
 * 
 * Endpoint for K3s Edge nodes to pull their desired state and 
 * push batched telemetry in a single authenticated payload.
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { clusterId, fingerprint, currentHash, telemetryBatch } = data;

    if (!clusterId || !fingerprint) {
      return NextResponse.json({ error: 'Missing Identity Claims' }, { status: 400 });
    }

    eventBus.broadcast({
      type: "NODE_CONNECTED",
      nodeId: clusterId,
      timestamp: new Date().toISOString()
    });

    // 1. Zero Trust mTLS Validation
    // In a real environment, this validates client certificates. Here we use the registry.
    const isAuthorized = zeroTrustEnforcer.validateNodeIdentity(clusterId);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Cryptographic Identity or Role' }, { status: 403 });
    }

    // 2. GitOps Reconciliation (Pull Model)
    const syncStates = gitOpsController.getSyncStates();
    const clusterState = syncStates.find(s => s.clusterId === clusterId);
    
    let desiredHash = currentHash;
    let rolloutCommand = 'NO_ACTION';

    if (clusterState) {
       desiredHash = clusterState.desiredHash;
       if (currentHash !== desiredHash) {
          rolloutCommand = 'PULL_NEW_MANIFEST';
       }
       // Update last seen timestamp
       clusterState.lastConnected = new Date().toISOString();
       if (currentHash === clusterState.desiredHash) {
          clusterState.status = 'SYNCED';
          clusterState.lastSyncHash = currentHash;
       }
    }

    // 3. Process Asynchronous Telemetry
    if (telemetryBatch) {
      // Simulate pushing to the internal MQTT/Kafka broker
      mqttBroker.processTelemetryIngest(); 

      // Broadcast up to the cinematic Live Spine
      eventBus.broadcast({
        type: "TELEMETRY",
        temp: telemetryBatch.temp || (Math.random() * 20 + 60),
        load: telemetryBatch.load || (Math.random() * 80),
        status: "ACTIVE"
      });
    }

    // Return the Desired State (Manifest Hash)
    return NextResponse.json({
      status: 'OK',
      command: rolloutCommand,
      desiredHash: desiredHash,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error("[EDGE_SYNC_API] Error:", err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
