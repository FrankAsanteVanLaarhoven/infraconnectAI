import { streamProducer } from '@/infrastructure/redis/producer';
import { TelemetryEvent } from '@/domain/events';
import { generateReasoning } from './reasoningLLM';

/**
 * Phase 2 Recovery Agent
 * Handles stabilization deployment and deep LLM context enrichment.
 */
export async function recoveryAgent(telemetry: TelemetryEvent, reasoningContext: string[]) {
   const action = "REDUCE_LOAD_AND_ISOLATE";

   // 1. Force the physical command down the control layer
   await streamProducer.publish("stream:robot.commands", {
       command_id: `rec-sync-${Date.now()}`,
       robot_id: telemetry.robot_id,
       action: action,
       parameters: { force_override: true, priority: "CRITICAL" },
       issued_by: "agent/recovery",
       timestamp: Date.now()
   });

   // 2. Wrap the deterministic checks with the contextual LLM Engine
   // This makes the UI feel like an intelligent entity explaining itself
   const explanation = await generateReasoning(telemetry, action);

   // 3. Emit the full context block out to the Executive Dashboard
   await streamProducer.publish("stream:agent.actions", {
       agent: "recovery-agent",
       decision: action,
       reasonContext: reasoningContext, 
       explanation: explanation, // LLM output
       robot_id: telemetry.robot_id,
       timestamp: Date.now()
   });
}
