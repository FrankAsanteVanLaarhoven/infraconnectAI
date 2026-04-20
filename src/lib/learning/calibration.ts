import { publish, subscribe } from "@/lib/core/bus";
import { storeExperience } from "@/lib/learning/store";

export type Run = {
  id: string;
  source: "sim" | "real";
  pos: [number, number, number];
  time: number;
  energy: number;
};

// Compute rigid cartesean math gaps measuring exact physical drift
function distance(posA: [number, number, number], posB: [number, number, number]) {
  const dx = posA[0] - posB[0];
  const dy = posA[1] - posB[1];
  const dz = posA[2] - posB[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Calculate the sim -> real deviation limits natively
export function computeGap(sim: Run, real: Run) {
  return {
    position_error: distance(sim.pos, real.pos),
    time_error: sim.time - real.time,
    energy_diff: sim.energy - real.energy,
  };
}

// Subordinate autonomous loop pushing raw RL metrics seamlessly into buffer logic
subscribe("system.calibration_run", (event: any) => {
    const { sim, real } = event;
    const gap = computeGap(sim, real);
    
    // Announce to local cognitive buses natively bridging adjustments
    publish("learning.gap", { gap, context: event.context });
    
    // Explicitly lodge memory states natively into PyTorch offline tracking buffers seamlessly
    storeExperience({
        type: "sim_real_gap",
        content: gap
    });
});
