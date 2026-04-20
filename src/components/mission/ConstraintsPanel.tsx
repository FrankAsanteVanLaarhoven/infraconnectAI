import React from "react";
import { publish } from "@/lib/core/bus";

const constraints = [
  { key: "battery_min", label: "Min Battery %", default: "20" },
  { key: "no_go_zones", label: "Restricted Zones", default: "A, B, C" },
  { key: "collision_radius", label: "Safety Radius (m)", default: "1.5" },
];

export default function ConstraintsPanel() {
  const submitConstraints = () => {
    publish("mission.execute", {
      type: "EXECUTE_PARAMS",
      constraints: constraints,
    });
  };

  return (
    <div className="space-y-4 text-xs h-full flex flex-col justify-between">
      <div>
          <h2 className="text-[#4CC9F0] uppercase tracking-widest font-bold mb-4 border-b border-[#4CC9F0]/20 pb-2">Mission Constraints</h2>
          {constraints.map((c) => (
            <div key={c.key} className="mb-4">
              <label className="text-white/60 uppercase text-[10px] tracking-wider mb-1 block">{c.label}</label>
              <input 
                 className="w-full bg-[#0B0F12] border border-[#1A1F24] p-2 text-white/90 rounded focus:border-[#4CC9F0]/50 transition-colors" 
                 defaultValue={c.default} 
              />
            </div>
          ))}
      </div>
      
      <button 
        onClick={submitConstraints}
        className="w-full bg-[#4CC9F0]/10 hover:bg-[#4CC9F0]/20 text-[#4CC9F0] border border-[#4CC9F0]/30 transition-all p-3 text-xs uppercase tracking-widest"
      >
        Lock Plan
      </button>
    </div>
  );
}
