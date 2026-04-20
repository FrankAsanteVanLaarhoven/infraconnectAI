import { TimelineEvent } from "./store/useTimelineStore";

/**
 * Replays localized history back over the true Redis stream.
 * This guarantees UI identicality because the DOM updates off the Websockets purely.
 */
export async function replayTimeline(events: TimelineEvent[]) {
  console.log(`[REPLAY] Igniting replay of ${events.length} historical events.`);
  
  for (let i = 0; i < events.length; i++) {
    const current = events[i];
    const next = events[i + 1];

    // Blast the old event back out to Redis for exact pipeline parity
    fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overrideTopic: current.type, ...current.data })
    }).catch(err => console.error("Replay Sync Error", err));

    // Force deterministic delays to mirror history
    if (next) {
      const delay = Math.min(next.ts - current.ts, 2000); // cap max dead-air at 2s
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}
