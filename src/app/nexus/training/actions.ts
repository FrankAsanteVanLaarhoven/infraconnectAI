"use server";

import { MLOpsTracker } from "@/lib/mlops/wandb";

export async function logTrainingRun(payload: {
  domain: string;
  model: string;
  hyperparams: Record<string, any>;
  curves: { episode: number; reward: number; loss: number }[];
  finalSvrRate: number;
}) {
  const runTag = `FT-${payload.domain.toUpperCase()}-${Math.floor(Date.now() / 1000)}`;

  // Pipe directly to our SQLite DB which the wandb_sync.py reads from
  await MLOpsTracker.logExperiment(
    payload.model,
    runTag,
    payload.hyperparams,
    payload.curves,
    payload.finalSvrRate
  );

  return { success: true, runTag };
}
