"use client";

import { useEffect, useState } from "react";
import { subscribe } from "@/lib/core/bus";

export default function ROIPanel() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const unbind = subscribe("mission.score.updated", setData);
    const unbindReset = subscribe("mission.execute", () => setData(null));
    return () => {
        unbind();
        unbindReset();
    };
  }, []);

  if (!data) return null;

  return (
    <div className="absolute right-6 top-20 w-64 bg-black/90 border border-green/40 p-3 text-xs z-40 shadow-glow animate-fadeIn">
      <div className="text-green font-bold tracking-widest uppercase mb-4 text-sm flex items-center gap-2">
         <span>💰</span> MISSION ROI
      </div>

      <div className="space-y-3 font-mono text-white/80 border-b border-[var(--border)] pb-4 mb-4">
          <div className="flex justify-between">
              <span className="text-white/40">Efficiency Output:</span>
              <span className="text-green">{data.efficiency}%</span>
          </div>
          <div className="flex justify-between">
              <span className="text-white/40">Temporal Savings:</span>
              <span className="text-cyan">{data.time_saved}%</span>
          </div>
          <div className="flex justify-between">
              <span className="text-white/40">Energy Offset:</span>
              <span className="text-yellow">{data.energy_saved}%</span>
          </div>
      </div>

      <div className="mt-2 text-white flex justify-between items-center bg-green/10 border border-green/30 p-2 font-mono">
          <span className="uppercase tracking-widest text-[10px] text-white/60">Estimated Cost Yield</span>
          <span>£{data.cost_estimate}</span>
      </div>
    </div>
  );
}
