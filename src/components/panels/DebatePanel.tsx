"use client";

import { useEffect, useState } from "react";
import { subscribe } from "@/lib/core/bus";

export default function DebatePanel() {
  const [debate, setDebate] = useState<any>(null);

  useEffect(() => {
    const unbind = subscribe("debate.resolved", setDebate);
    const unbindReset = subscribe("mission.execute", () => setDebate(null));
    return () => {
        unbind();
        unbindReset();
    };
  }, []);

  if (!debate) return null;

  return (
    <div className="absolute left-6 top-20 w-80 bg-black/90 border border-yellow/40 p-3 text-xs z-40 shadow-glow">
      <div className="text-yellow mb-4 font-bold tracking-widest uppercase flex items-center gap-2">
         <span>🧠</span> AGENT DEBATE
      </div>

      <div className="space-y-3">
          {debate.bids.map((b: any, i: number) => (
            <div key={i} className="mb-2 border-b border-[var(--border)] pb-3 last:border-0">
              <div className="text-cyan uppercase tracking-widest font-mono text-[10px] mb-1">{b.robot_id}</div>
              <div className="text-white/60 leading-relaxed max-w-[90%]">{b.reasoning.summary}</div>
            </div>
          ))}
      </div>

      <div className="text-green mt-4 border-t border-[var(--border)] pt-2 font-mono uppercase tracking-widest">
        Winner: {debate.winner.robot_id}
      </div>
    </div>
  );
}
