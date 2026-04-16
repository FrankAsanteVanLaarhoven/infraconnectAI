import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateSafetyBenchmark } from "@/lib/fleet/safetyKernel";

export async function GET() {
  try {
    const fleetNodes = await db.fleetNode.findMany({
      where: { status: { not: 'offline' } }
    });

    // 1. Map fleet nodes to Blueprint Nodes
    const nodes = fleetNodes.map((node, i) => {
      const stability = calculateSafetyBenchmark(node);
      const isHub = node.alias.toLowerCase().includes('hub') || node.alias.toLowerCase().includes('station');
      
      return {
        id: node.id,
        type: isHub ? 'connector' : 'hardware',
        position: { x: 100 + (i * 350), y: isHub ? 150 : 400 },
        data: { 
          label: node.alias, 
          robotId: node.robotId,
          status: node.status,
          svr: stability.svr,
          dmr: stability.dmr
        }
      };
    });

    // 2. Generate implicit Edges (Mesh Connectivity)
    // Connecting all hardware nodes to the nearest "Station" or "Hub"
    const stations = nodes.filter(n => n.type === 'connector');
    const hardwares = nodes.filter(n => n.type === 'hardware');
    
    const edges = hardwares.map(h => {
       const nearestHub = stations[0] || { id: 'hub-fallback' };
       return {
          id: `edge-${h.id}-${nearestHub.id}`,
          source: h.id,
          target: nearestHub.id,
          animated: true,
          style: { stroke: '#22d3ee', strokeWidth: 2, opacity: 0.6 }
       };
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      nodes,
      edges
    });
  } catch (error) {
    console.error("[API_BLUEPRINT_ERROR]", error);
    return NextResponse.json({ nodes: [], edges: [] });
  }
}
