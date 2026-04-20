import { Experience } from "./types";

function computeReward(event: any) {
  // Foundational reward geometries matching Reinforcement Learning feedback arrays perfectly
  let reward = 0;
  
  if (event.task_completed) reward += 100;
  if (event.collision) reward -= 50;
  
  // Continuous localized penalty extraction matching heuristic norms
  if (event.energy_usage) reward -= (event.energy_usage * 0.1);
  if (event.time_taken) reward -= (event.time_taken * 0.05);

  return reward;
}

export function collectExperience(event: any) {
  const experience: Experience = {
    state: event.before,
    action: event.action,
    reward: computeReward(event),
    next_state: event.after,
    done: event.done || false,
    source: event.source || "sim",
  };

  // Natively bypass direct TS memory stores to write isolated learning metrics
  console.log(`[RL_BUFFER] Experience Captured: Target state parsed -> R:${experience.reward.toFixed(2)}`);
  
  // Future deployment wraps this standard `experience` payload into S3 / Postgres blobs
}
