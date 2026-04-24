import React from 'react';
import { RobotState, Constraint, Mission } from '../../../lib/agents/Planner';
import { BrainCircuit, Battery, ShieldAlert, Target } from 'lucide-react';

export const AgentPanel: React.FC<{
  robotState: RobotState;
  mission: Mission | null;
  onStartMission: () => void;
}> = ({ robotState, mission, onStartMission }) => {
  return (
    <div className="flex flex-col h-full w-[380px] bg-[#0B0F12] border-r border-[#1A1F24]">
      <div className="px-4 py-3 border-b border-[#1A1F24] flex items-center gap-2">
        <BrainCircuit className="w-4 h-4 text-[#4CC9F0]" />
        <span className="text-[10px] uppercase font-black text-gray-200 tracking-widest">
          🧠 AGENT PANEL
        </span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        
        {/* Robot State Sector */}
        <div className="space-y-3">
          <div className="text-[9px] uppercase font-black text-gray-500 tracking-widest">
            STATE TELEMETRY
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#050607] border border-[#1A1F24] rounded-md p-2 flex flex-col gap-1">
              <span className="text-[8px] uppercase font-black text-gray-500">Battery</span>
              <div className="flex items-center gap-2">
                <Battery className={`w-3 h-3 ${robotState.battery > 50 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`} />
                <span className="text-[11px] font-mono text-white">{robotState.battery}%</span>
              </div>
            </div>
            
            <div className="bg-[#050607] border border-[#1A1F24] rounded-md p-2 flex flex-col gap-1">
              <span className="text-[8px] uppercase font-black text-gray-500">Zone</span>
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3 text-[#4CC9F0]" />
                <span className="text-[11px] font-mono text-white">{robotState.zone}</span>
              </div>
            </div>
            
            <div className="bg-[#050607] border border-[#1A1F24] rounded-md p-2 flex col-span-2 justify-between items-center">
              <span className="text-[8px] uppercase font-black text-gray-500">Status</span>
              <span className={`text-[10px] uppercase font-black tracking-widest ${
                robotState.status === 'idle' ? 'text-gray-400' :
                robotState.status === 'error' ? 'text-[#EF4444] ' :
                'text-[#4CC9F0]'
              }`}>
                {robotState.status}
              </span>
            </div>
          </div>
        </div>

        {/* Mission Constraints Sector */}
        <div className="space-y-3">
          <div className="text-[9px] uppercase font-black text-gray-500 tracking-widest">
            ACTIVE MISSION
          </div>
          {mission ? (
            <div className="bg-[#050607] border border-[#1A1F24] rounded-md p-3 space-y-3">
              <div className="text-[11px] text-[#4CC9F0] font-black uppercase">{mission.goal}</div>
              
              <div className="space-y-1">
                <span className="text-[8px] uppercase font-black text-gray-500">Constraints</span>
                {mission.constraints.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-[9px] bg-[#0B0F12] border border-[#1A1F24] px-2 py-1 rounded">
                    <span className="text-gray-400 capitalize">{c.type}</span>
                    <span className="text-white font-mono">{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 bg-[#050607] border border-[#1A1F24] border-dashed rounded-md gap-3">
              <span className="text-[10px] text-gray-500 font-mono tracking-widest">AWAITING TASKING</span>
              <button 
                onClick={onStartMission}
                className="px-4 py-1.5 bg-[#4CC9F0]/10 border border-[#4CC9F0]/30 text-[#4CC9F0] text-[9px] font-black uppercase tracking-widest rounded hover:bg-[#4CC9F0]/20 transition-all"
              >
                Simulate Goal
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
