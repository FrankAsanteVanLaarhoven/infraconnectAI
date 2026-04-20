import { useTimelineStore } from "@/stores/timelineStore";
import { publish } from "@/lib/core/bus";

/**
 * Absolute OS Time Travel array. Iterates physical arrays locally natively resolving abstract tracking logically flawlessly.
 */
export function replayTo(pointer: number) {
  const { events } = useTimelineStore.getState();

  // Reset standard physical arrays structurally globally preventing artifacting seamlessly
  publish("system.calibration_run", { __is_replay: true });

  for (let i = 0; i <= pointer; i++) {
    // Crucial: Injection of __is_replay prevents recursive loop logging identically!
    publish(events[i].type, { ...events[i], __is_replay: true });
  }
}
