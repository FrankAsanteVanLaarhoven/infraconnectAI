import { db } from "@/lib/db";

export async function buildContext(userId: string) {
  // Production-Ready CORE DB Ingestion
  
  // 1. Fetch connected systems / fleet nodes
  const rawFleetNodes = await db.fleetNode.findMany({
    take: 5,
    orderBy: { lastSeen: 'desc' },
  });

  const fleetNodes = rawFleetNodes.map(node => ({
    ...node,
    memoryBytes: node.memoryBytes.toString(),
  }));

  // 2. Fetch logged anomalies/warnings (logs)
  const rawAnomalies = await db.anomaly.findMany({
    where: { resolved: false },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { node: true }
  });

  const anomalies = rawAnomalies.map(a => ({
    ...a,
    node: a.node ? { ...a.node, memoryBytes: a.node.memoryBytes.toString() } : null
  }));

  // 3. Fetch active projects or standard specs (representing active intelligence deals/nodes)
  const memoryNodes = await db.memoryNode.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' }
  });

  return {
    systems: fleetNodes.length > 0 ? fleetNodes : [{ id: "postgres-main", status: "connected", memoryBytes: "0", alias: "Primary DB" }],
    anomalies,
    activeNodes: memoryNodes
  };
}
