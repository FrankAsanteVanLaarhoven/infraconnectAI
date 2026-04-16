/**
 * INFRA-SIGHT Topology Engine
 * 
 * Manages the "Digital Twin" of the global neural infrastructure.
 * Calculates mesh health, cluster resilience, and self-healing pathing.
 */

export interface MeshNode {
  id: string;
  type: 'HARDWARE' | 'AI' | 'CONNECTOR' | 'CLUSTER';
  label: string;
  status: 'ONLINE' | 'DEGRADED' | 'HEALING' | 'OFFLINE';
  metrics: {
    latency: number; // ms
    throughput: number; // Gbps
    stability?: number; // SVR-based (0-1)
  };
}

export interface MeshEdge {
  id: string;
  source: string;
  target: string;
  intensity: number; // 0-1
  animated: boolean;
}

export function calculateClusterResilience(nodes: MeshNode[]): number {
  if (nodes.length === 0) return 0;
  const onlineWeight = nodes.filter(n => n.status === 'ONLINE').length / nodes.length;
  const avgStability = nodes.reduce((acc, n) => acc + (n.metrics.stability || 1), 0) / nodes.length;
  return onlineWeight * avgStability;
}

export function getSelfHealingPath(nodes: MeshNode[], sourceId: string, targetId: string): string[] {
  // Simple heuristic: Avoid OFFLINE or HEALING nodes
  const viableNodes = nodes.filter(n => n.status !== 'OFFLINE' && n.status !== 'HEALING');
  return viableNodes.map(n => n.id);
}
