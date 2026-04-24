import { subscribe } from "@/lib/core/bus";
import { useTimelineStore } from "@/stores/timelineStore";

// The absolute OS logging vector mapping telemetry visually across constraints completely flawlessly identically
subscribe("*", (event: any) => {
  // Absolute prevention mechanism preventing recursive logging when Scrubbing Replays natively occur flawlessly.
  if (event.__is_replay) return;
  
  // Filter completely noise payloads seamlessly preserving RAM bounds natively locally cleanly.
  if (["reasoning.generated", "robot.commands"].includes(event.type)) return;

  useTimelineStore.getState().addEvent("SYS", {
    ...event,
    timestamp: Date.now(),
  });
});
