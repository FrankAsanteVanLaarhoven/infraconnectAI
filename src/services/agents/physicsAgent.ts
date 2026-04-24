import { db } from '@/lib/db';
import { streamProducer } from '@/infrastructure/redis/producer';
import { liveCurationEngine } from '@/lib/physics-fabric/live-curation-engine';
import type { PhysicsTelemetryEvent } from '@/domain/events';

/**
 * Physics Agent — Phase 1 Detection for Isaac Lab Runs
 * 
 * Deterministic + rule-based agent that monitors Isaac Lab simulation runs
 * in real time. Evaluates physics telemetry batches and triggers:
 * - Auto-pause when physicsScore < 0.65 or dataQualityScore < 0.55
 * - Auto-pruning of individual bad episodes
 * - Escalation to LiveCurationEngine for batch processing
 */

const PHYSICS_AGENT_THRESHOLDS = {
  PHYSICS_PAUSE: 0.65,       // Pause run if avg physics score drops below
  DATA_QUALITY_PAUSE: 0.55,  // Pause run if avg data quality drops below
  EPISODE_PRUNE: 0.50,       // Auto-prune individual episodes below this
  BATCH_SIZE: 8,             // Process in batches of N episodes
} as const;

// Accumulate telemetry events into batches per run
const pendingBatches = new Map<string, PhysicsTelemetryEvent[]>();

/**
 * Ingest a single physics telemetry event.
 * Accumulates into batches and triggers evaluation when batch is full.
 */
export async function physicsAgent(telemetry: PhysicsTelemetryEvent) {
  const { runId } = telemetry;

  // Accumulate into batch
  if (!pendingBatches.has(runId)) {
    pendingBatches.set(runId, []);
  }
  const batch = pendingBatches.get(runId)!;
  batch.push(telemetry);

  // Process when batch is full
  if (batch.length >= PHYSICS_AGENT_THRESHOLDS.BATCH_SIZE) {
    pendingBatches.set(runId, []); // Clear batch
    await processBatch(runId, batch);
  }
}

/**
 * Force-flush any pending episodes for a run (e.g. on run completion).
 */
export async function flushPhysicsBatch(runId: string) {
  const batch = pendingBatches.get(runId);
  if (batch && batch.length > 0) {
    pendingBatches.set(runId, []);
    await processBatch(runId, batch);
  }
}

async function processBatch(runId: string, batch: PhysicsTelemetryEvent[]) {
  console.log(`[PHYSICS_AGENT] Processing batch of ${batch.length} episodes for run ${runId}`);

  // Convert telemetry to curation engine format
  const episodes = batch.map(t => ({
    episodeIndex: t.episodeIndex,
    modelLoss: t.modelLoss,
    physicsRealism: t.physicsRealism,
    sensorFidelity: t.sensorFidelity,
    languageGrounding: t.languageGrounding,
    actionSuccess: t.actionSuccess,
  }));

  // Delegate to LiveCurationEngine for detailed evaluation
  await liveCurationEngine.processBatch(runId, episodes);

  // Check run-level health after batch processing
  const run = await db.isaacLabRun.findUnique({ where: { id: runId } });
  if (!run || run.status !== 'RUNNING') return;

  // Run-level physics degradation check
  if (run.physicsScoreAvg > 0 && run.physicsScoreAvg < PHYSICS_AGENT_THRESHOLDS.PHYSICS_PAUSE) {
    await streamProducer.publish("stream:agent.actions", {
      agent: "physics-agent",
      decision: `PHYSICS_DEGRADATION_ALERT`,
      reason: `Run physics avg ${run.physicsScoreAvg.toFixed(2)} below threshold ${PHYSICS_AGENT_THRESHOLDS.PHYSICS_PAUSE}`,
      target: runId,
      timestamp: Date.now(),
    });
  }

  // Run-level data quality check
  if (run.dataQualityScoreAvg > 0 && run.dataQualityScoreAvg < PHYSICS_AGENT_THRESHOLDS.DATA_QUALITY_PAUSE) {
    await streamProducer.publish("stream:agent.actions", {
      agent: "physics-agent",
      decision: `DATA_QUALITY_ALERT`,
      reason: `Run data quality avg ${run.dataQualityScoreAvg.toFixed(2)} below threshold ${PHYSICS_AGENT_THRESHOLDS.DATA_QUALITY_PAUSE}`,
      target: runId,
      timestamp: Date.now(),
    });
  }
}
