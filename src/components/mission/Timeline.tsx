"use client";

import { useTimelineStore } from "@/stores/timelineStore";
import { replayTo } from "@/lib/timeline/replay";

export default function Timeline() {
  const { events, pointer, setPointer } = useTimelineStore();

  return (
    <div className="w-full h-full bg-black px-8 py-4 flex flex-col justify-center">
      
      <div className="flex justify-between text-[10px] text-white/60 font-mono uppercase tracking-widest mb-3">
          <span>{pointer > 0 ? `Active Execution Trace` : `Execution Timeline Replay`}</span>
          <span className="text-cyan">{events[pointer]?.type || "Awaiting Telemetry..."}</span>
      </div>

      <input
        type="range"
        min={0}
        max={Math.max(0, events.length - 1)}
        value={pointer}
        onChange={(e) => {
           const p = Number(e.target.value);
           setPointer(p);
           replayTo(p);
        }}
        className="w-full h-1 bg-panel border-y border-[var(--border)] appearance-none rounded-sm cursor-pointer hover:bg-[var(--border)] transition-all accent-cyan"
      />
    </div>
  );
}
