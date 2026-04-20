import { NextResponse } from 'next/server';
import { streamProducer } from '@/infrastructure/redis/producer';
import { constructMissionDAG } from '@/services/agents/missionPlanner';
import { planMission, AgentEngine } from '@/lib/agents/Planner';

export async function POST(req: Request) {
  try {
    const { overrideTopic, ...payload } = await req.json();
    
    // Mission Planner Branch - If the UI triggers a '!' agent pipeline
    if (payload.agent === "ux-orchestrator") {
        await constructMissionDAG(payload.decision);
        return NextResponse.json({ ok: true, status: `Ignited Mission Planner DAG` });
    }

    if (payload.agent === "mission-planner" && payload.constraints) {
        // Resolve mission natively using the strict physical A* algorithms mapped 
        const missionResult = await planMission("Execute constraints", payload.constraints);
        
        // Spawn asynchronous physically bound state engine logically matching
        const engine = new AgentEngine(
            { battery: 100, zone: "Hangar", status: "idle", position: [0, 0, 0] },
            () => {}, // Local state binding discard
            (msg) => console.log(`[AGENT_ENGINE] ${msg}`),
            async (actionPayload) => {
               // Stream path directly into redis sockets automatically tracking
               await streamProducer.publish("stream:robot.commands", actionPayload);
               
               // Synchronously pass via stream:tasks for tacticalScene bounds seamlessly natively
               await streamProducer.publish("stream:tasks", {
                   robot_id: actionPayload.robot_id,
                   task_id: `mission-${Date.now()}`,
                   path: actionPayload.path
               });
            }
        );
        
        // Kick off silently avoiding blocking
        engine.runMission(missionResult).catch(e => console.error(e));
        
        return NextResponse.json({ ok: true, status: `Dispatched Intelligence Engine` });
    }

    // Publish directly to the Redis control plane
    const targetStream = overrideTopic || "stream:robot.commands";
    await streamProducer.publish(targetStream, payload);
    
    return NextResponse.json({ ok: true, status: `Dispatched to ${targetStream}` });
  } catch (err) {
    console.error('[API_COMMAND] Failed', err);
    return NextResponse.json({ ok: false, error: 'Failed to route command' }, { status: 500 });
  }
}

