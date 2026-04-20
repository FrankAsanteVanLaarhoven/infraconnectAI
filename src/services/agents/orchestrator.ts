import { TelemetryEvent } from '@/domain/events';
import { anomalyAgent } from './anomalyAgent';
import { recoveryAgent } from './recoveryAgent';

/**
 * Global Multi-Agent Orchestrator
 * Pipeline controlling sequential event routing across intelligence models.
 */
export async function orchestrator(telemetry: TelemetryEvent) {
   
   // Pipeline Phase 1: Detection
   const detectionResult = await anomalyAgent(telemetry);

   // Pipeline Phase 2: Action & Defense
   if (detectionResult.hasAnomaly) {
       console.log(`[ORCHESTRATOR] Node ${telemetry.robot_id} flagged. Routing to Recovery Agent.`);
       await recoveryAgent(telemetry, detectionResult.reasoningContext);
   } else {
       // Optional Phase: Optimization Agent could be wired here for healthy metrics
   }
}
