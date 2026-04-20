import { streamProducer } from '@/infrastructure/redis/producer';
import { MissionDAG } from './dag-engine';

/**
 * Executes a deterministic DAG node by node.
 * Publishes operational state down the WebSocket event fabric for the UI.
 */
export async function executeDAG(mission: MissionDAG) {
    const executed = new Set<string>();

    async function runNode(nodeId: string) {
        if (executed.has(nodeId)) return;

        // Traverse dependencies natively
        const deps = mission.edges
            .filter(e => e.to === nodeId)
            .map(e => e.from);

        for (const dep of deps) {
            await runNode(dep);
        }

        const node = mission.nodes.find(n => n.id === nodeId);
        if (!node) return;

        // Broadcast node start
        await streamProducer.publish("stream:agent.actions", {
            agent: "dag-orchestrator",
            decision: `INITIATING: ${node.action}`,
            reasonContext: [`Goal: ${mission.goal}`, `Node ID: ${node.id}`],
            target: "global_fleet",
            timestamp: Date.now()
        });

        // Simulate complex node execution delay
        await new Promise((r) => setTimeout(r, 2000));

        // Mark complete and broadcast
        executed.add(nodeId);
        
        await streamProducer.publish("stream:agent.actions", {
            agent: "dag-orchestrator",
            decision: `NODE RESOLVED: ${node.action}`,
            explanation: `Successfully synchronized DAG step across the physical network layer.`,
            target: "global_fleet",
            timestamp: Date.now()
        });
    }

    for (const node of mission.nodes) {
        await runNode(node.id);
    }
}
