import { db } from '../db';

/**
 * Weights & Biases (W&B) Telemetry Queue
 * 
 * Instead of relying on a Node.js W&B wrapper which can be unstable,
 * we write ML Telemetry into our high-speed Prisma/SQLite instance,
 * which is then natively synced via our Python daemon `wandb_sync.py`.
 */
export class MLOpsTracker {
  
  /**
   * Log an ML model training curve or validation run.
   */
  static async logExperiment(
    modelName: string, 
    runTag: string, 
    hyperparams: Record<string, any>, 
    curves: { episode: number, reward: number, loss: number }[],
    svrRate: number
  ) {
    try {
      await db.mL_Experiment.create({
        data: {
          modelName,
          runTag,
          hyperparameters: JSON.stringify(hyperparams),
          rewardCurves: JSON.stringify(curves),
          svrRate
        }
      });
      console.log(`[MLOps] Queued experiment ${modelName}-${runTag} for W&B Sync.`);
    } catch (e) {
      console.error("[MLOps] Failed to queue experiment:", e);
    }
  }

  /**
   * Log Swarm / Agent behavior telemetry.
   */
  static async logSwarmActivity(
    agentId: string, 
    status: string, 
    progress: number, 
    payload: Record<string, any>
  ) {
    try {
      // In a production setup this might write to AgentTelemetry or a similar DB table.
      await db.agentTelemetry.create({
        data: {
          agentId: agentId,
          deployTier: 'SWARM_LAYER',
          modality: 'status_transition',
          tick: BigInt(Date.now()),
          payload: JSON.stringify({ status, progress, ...payload }),
          latencyMs: 0
        }
      });
      console.log(`[MLOps] Queued Swarm activity for Agent ${agentId} into W&B Telemetry.`);
    } catch (e) {
      console.error("[MLOps] Failed to queue Agent Activity:", e);
    }
  }

}
