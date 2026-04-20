import { subscribe } from "@/lib/core/bus";

const buffer: any[] = [];

/**
 * Limit-constrained PyTorch scaling wrapper mapping memory allocations tracking perfectly.
 */
export function storeExperience(exp: any) {
  buffer.push(exp);

  if (buffer.length > 1000) buffer.shift();
}

subscribe("task.completed", (event) => {
    storeExperience({
      state: event.context,
      action: event.bid,
      reward: event.reward
    });
});
