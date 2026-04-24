import { db } from '@/lib/db';
import { streamProducer } from '@/infrastructure/redis/producer';

/**
 * Isaac Lab Runtime Manager
 * 
 * Manages the lifecycle of Isaac Lab simulation runs:
 * - Launch runs via Docker exec or K8s Job
 * - Pause/Resume for data quality issues
 * - Track status and aggregate metrics
 * 
 * In production, this interfaces with NVIDIA Isaac Lab via Docker API or K8s CRD.
 * In development, it manages DB state and emits simulated physics telemetry.
 */

export interface IsaacLabConfig {
  sceneUsd: string;
  domainRandomization: {
    lighting: boolean;
    textures: boolean;
    physics: boolean;
    cameraJitter: boolean;
    objectScale: [number, number]; // [min, max] scale range
  };
  numEnvs: number;
  experimentId: string;
}

export interface IsaacRunState {
  id: string;
  status: string;
  totalEpisodes: number;
  physicsScoreAvg: number;
  dataQualityScoreAvg: number;
  highLossCount: number;
  prunedCount: number;
}

class IsaacLabManager {
  private static instance: IsaacLabManager;
  private activeRunTimers: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): IsaacLabManager {
    if (!IsaacLabManager.instance) {
      IsaacLabManager.instance = new IsaacLabManager();
    }
    return IsaacLabManager.instance;
  }

  /**
   * Launch a new Isaac Lab simulation run.
   * Creates DB record and starts the simulation container/process.
   */
  async launchRun(config: IsaacLabConfig): Promise<IsaacRunState> {
    const run = await db.isaacLabRun.create({
      data: {
        experimentId: config.experimentId,
        sceneUsd: config.sceneUsd,
        domainRandomization: config.domainRandomization as any,
        numEnvs: config.numEnvs,
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    console.log(`[ISAAC_LAB] Run ${run.id} launched | Scene: ${config.sceneUsd} | Envs: ${config.numEnvs}`);

    // Emit launch event to Redis for dashboard
    await streamProducer.publish("stream:agent.actions", {
      agent: "isaac-lab-manager",
      decision: `LAUNCH_RUN: ${run.id}`,
      reason: `Isaac Lab simulation started with ${config.numEnvs} parallel environments`,
      target: config.sceneUsd,
      timestamp: Date.now(),
    });

    // In production: Docker exec / K8s Job launch goes here
    // docker run --gpus all -v ${sceneUsd}:/scene nvcr.io/nvidia/isaac-lab:latest ...
    // For now, start a simulated episode generator
    this.startEpisodeSimulator(run.id, config.numEnvs);

    return {
      id: run.id,
      status: 'RUNNING',
      totalEpisodes: 0,
      physicsScoreAvg: 0,
      dataQualityScoreAvg: 0,
      highLossCount: 0,
      prunedCount: 0,
    };
  }

  /**
   * Pause a running Isaac Lab run (e.g. due to data quality issues).
   */
  async pauseRun(runId: string, reason: string): Promise<void> {
    const timer = this.activeRunTimers.get(runId);
    if (timer) {
      clearInterval(timer);
      this.activeRunTimers.delete(runId);
    }

    await db.isaacLabRun.update({
      where: { id: runId },
      data: { status: 'PAUSED_FOR_DATA_ISSUE' },
    });

    await streamProducer.publish("stream:agent.actions", {
      agent: "isaac-lab-manager",
      decision: `PAUSE_RUN: ${runId}`,
      reason,
      target: runId,
      timestamp: Date.now(),
    });

    console.log(`[ISAAC_LAB] Run ${runId} PAUSED: ${reason}`);
  }

  /**
   * Resume a paused Isaac Lab run.
   */
  async resumeRun(runId: string): Promise<void> {
    const run = await db.isaacLabRun.findUnique({ where: { id: runId } });
    if (!run) throw new Error(`Run ${runId} not found`);

    await db.isaacLabRun.update({
      where: { id: runId },
      data: { status: 'RUNNING' },
    });

    this.startEpisodeSimulator(runId, run.numEnvs);

    await streamProducer.publish("stream:agent.actions", {
      agent: "isaac-lab-manager",
      decision: `RESUME_RUN: ${runId}`,
      reason: "Run resumed after review",
      target: runId,
      timestamp: Date.now(),
    });

    console.log(`[ISAAC_LAB] Run ${runId} RESUMED`);
  }

  /**
   * Complete a run (all episodes finished).
   */
  async completeRun(runId: string): Promise<void> {
    const timer = this.activeRunTimers.get(runId);
    if (timer) {
      clearInterval(timer);
      this.activeRunTimers.delete(runId);
    }

    await db.isaacLabRun.update({
      where: { id: runId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    console.log(`[ISAAC_LAB] Run ${runId} COMPLETED`);
  }

  /**
   * Get the current state of a run.
   */
  async getRunStatus(runId: string): Promise<IsaacRunState | null> {
    const run = await db.isaacLabRun.findUnique({ where: { id: runId } });
    if (!run) return null;

    return {
      id: run.id,
      status: run.status,
      totalEpisodes: run.totalEpisodes,
      physicsScoreAvg: run.physicsScoreAvg,
      dataQualityScoreAvg: run.dataQualityScoreAvg,
      highLossCount: run.highLossCount,
      prunedCount: run.prunedCount,
    };
  }

  /**
   * List all runs with optional status filter.
   */
  async listRuns(status?: string) {
    const where = status ? { status: status as any } : {};
    return db.isaacLabRun.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { episodes: true, curationEvents: true } } },
    });
  }

  /**
   * Simulated episode generator for development.
   * In production, this is replaced by real Isaac Lab telemetry ingestion.
   */
  private startEpisodeSimulator(runId: string, numEnvs: number) {
    let episodeCounter = 0;

    const timer = setInterval(async () => {
      try {
        const run = await db.isaacLabRun.findUnique({ where: { id: runId } });
        if (!run || run.status !== 'RUNNING') {
          clearInterval(timer);
          this.activeRunTimers.delete(runId);
          return;
        }

        // Generate a batch of simulated episodes
        const batchSize = Math.min(numEnvs, 4);
        for (let i = 0; i < batchSize; i++) {
          episodeCounter++;

          const physicsRealism = 0.5 + Math.random() * 0.5;
          const sensorFidelity = 0.55 + Math.random() * 0.45;
          const languageGrounding = 0.4 + Math.random() * 0.6;
          const actionSuccess = Math.random() > 0.15 ? 0.6 + Math.random() * 0.4 : Math.random() * 0.3;
          const modelLoss = 0.2 + Math.random() * 3.0;

          // Emit physics telemetry to Redis stream
          await streamProducer.publish("stream:physics.telemetry", {
            runId,
            episodeIndex: episodeCounter,
            physicsRealism,
            sensorFidelity,
            languageGrounding,
            actionSuccess,
            modelLoss,
            timestamp: Date.now(),
          });
        }

        // Update total episodes count
        await db.isaacLabRun.update({
          where: { id: runId },
          data: { totalEpisodes: episodeCounter },
        });
      } catch (e) {
        console.error(`[ISAAC_LAB] Episode simulator error for run ${runId}:`, e);
      }
    }, 5000); // Generate batch every 5 seconds

    this.activeRunTimers.set(runId, timer);
  }
}

// HMR-safe global singleton
declare global {
  var _isaacLabManager: IsaacLabManager | undefined;
}

export const isaacLabManager = global._isaacLabManager || IsaacLabManager.getInstance();

if (process.env.NODE_ENV !== 'production') {
  global._isaacLabManager = isaacLabManager;
}
