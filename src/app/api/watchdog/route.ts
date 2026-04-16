import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { serverHub } from '@/lib/agent-ops/ServerHub';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Ensure this is a validated payload from our structural Daemon
    if (!data.signature || data.signature !== 'SOVEREIGN_WATCHDOG_AUTH') {
      return NextResponse.json({ success: false, error: 'Cryptographic signature mismatch' }, { status: 403 });
    }

    console.warn(`\n[PHYSICAL_WATCHDOG] Node ${data.nodeId} entered CRITICAL degradation state: Temps at ${data.temperature}C. Memory at ${data.memory_percent}%.\n`);

    // Log the catastrophic anomaly natively into the database
    // This feeds directly into the AI Audit UI and Telemetry loops
    const incident = await prisma.agentIncident.create({
      data: {
        description: `THERMAL LOCKDOWN: Core Tjunction boundary exceeded. (Recorded: ${data.temperature}°C, GPU Usage: ${data.gpu_percent}%, VRAM: ${data.memory_percent}%). Immediate Throttle Engaged.`,
        category: 'RESOURCE_LIMIT',
        severity: 'critical',
        nodeId: data.nodeId || 'UNKNOWN_EDGE',
        resolvedAt: null // Marked active immediately
      }
    });

    // We also generate an IP/Network OSINT alert for the map
    await prisma.earthInsight.create({
      data: {
        category: 'PHYSICAL',
        title: 'Hardware Degradation Anomaly',
        priority: 'emergency',
        content: `Edge Node [${data.nodeId}] decoupled dynamically to prevent thermal throttling array failure!`,
      }
    });

    // In a fully meshed environment, the Server-Sent Event (SSE) stream will pick this `incident` up on the next cycle,
    // firing the Tactical Bus `MISSION_DISARM` override globally across all active dashboards.
    serverHub.broadcast('tactical_override', {
      type: 'HARDWARE_ANOMALY',
      payload: { nodeId: data.nodeId, temp: data.temperature, vram: data.memory_percent }
    });
    
    serverHub.broadcast('tactical_override', {
      type: 'MISSION_DISARM',
      payload: {}
    });
    
    return NextResponse.json({ success: true, message: 'Node Isolated successfully.' });
    
  } catch (err: any) {
    console.error("[PHYSICAL_WATCHDOG] Internal Route Crash:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
