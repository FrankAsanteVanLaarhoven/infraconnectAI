"use client";

import React from "react";

export function MissionPanel({ mission, battery }: any) {
  if (!mission) return (
      <div className="p-4 text-[10px] text-slate-500 font-mono tracking-widest uppercase">
          AWAITING MISSION INSTRUCTIONS...
      </div>
  );

  return (
    <div className="p-4 text-[10px] font-mono space-y-4 tracking-widest">

      <div className="text-cyan-400 font-black mb-4">
        MISSION: {mission.goal || "Autonomous RRT Array Execution"}
      </div>

      {/* Constraints Vector Analysis */}
      <div>
        <div className="text-slate-600 mb-2 uppercase font-bold">RUNTIME CONSTRAINTS</div>
        {mission.constraints?.map((c: any, i: number) => (
          <div key={i} className="text-amber-500">
            - {c.type}: {c.value}
          </div>
        ))}
      </div>

      {/* Logic Steps (DAG representation) */}
      <div>
        <div className="text-slate-600 mb-2 uppercase font-bold">EXECUTION BLOCK</div>
        {mission.steps?.map((s: any) => (
          <div key={s.id} className="text-slate-300">
            {s.status === "done" && <span className="text-emerald-500 mr-2">[✓]</span>}
            {s.status === "running" && <span className="text-cyan-500 mr-2 animate-pulse">[→]</span>}
            {s.status === "pending" && <span className="text-slate-600 mr-2">[ ]</span>}
            {s.action}
          </div>
        ))}
      </div>

      {/* Live Constraint Enforcement Breach Feedback */}
      {battery && battery < 30 && (
        <div className="mt-4 pt-4 border-t border-red-900/30 text-red-500 font-black animate-pulse bg-red-500/10 p-2 rounded">
          ⚠ MISSION ABORT // BATTERY CONSTRAINT VIOLATED
        </div>
      )}

    </div>
  );
}
