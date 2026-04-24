"use client";

import { Bot, Activity, Pause, Play, TerminalSquare } from "lucide-react";

export function AgentManager() {
  const agents = [
    { id: "agt-001", name: "DataAnnotation Extractor", status: "idle", uptime: "0h 0m" },
    { id: "agt-002", name: "ROS2 Telemetry Node", status: "running", uptime: "4h 12m" },
    { id: "agt-003", name: "IsaacSim Evaluator", status: "offline", uptime: "-" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#050505] border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0a0b0c] border-b border-slate-800 shrink-0">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Agent Swarm</span>
        <div className="px-1.5 py-0.5 bg-slate-800 text-slate-300 text-[9px] rounded-sm font-mono">
          {agents.length} Nodes
        </div>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {agents.map((agent) => (
          <div key={agent.id} className="p-3 bg-[#0a0b0c] border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bot className={`w-4 h-4 ${agent.status === 'running' ? 'text-emerald-500' : agent.status === 'idle' ? 'text-amber-500' : 'text-slate-600'}`} />
                <span className="text-xs font-mono font-bold text-slate-200 truncate max-w-[120px]">{agent.name}</span>
              </div>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-emerald-400 transition-colors">
                  <Play className="w-3 h-3" />
                </button>
                <button className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-amber-400 transition-colors">
                  <Pause className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-slate-500">
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {agent.status}
              </div>
              <div className="flex items-center gap-1">
                <TerminalSquare className="w-3 h-3" />
                UP: {agent.uptime}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
