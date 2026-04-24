"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Activity, 
  Zap, 
  Radio, 
  Layers,
  Box,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { rosBridge, ROSTopic, ROSNode } from '@/lib/robotics/ros-bridge';
import { useLiveEvents } from '@/lib/hooks/useLiveEvents';

export function RoboticsStackVisualizer() {
  const [data, setData] = useState(rosBridge.pulse());

  // Bind to the Live Event Spine
  useLiveEvents((event) => {
    if (event.type === 'TELEMETRY' || event.type === 'NODE_CONNECTED') {
      // In a real flow, you extract specific temps/loads.
      // Here we pulse the backend visualizer strictly when a push arrives.
      setData({...rosBridge.pulse()});
    }
  });

  return (
    <div className="w-full h-full bg-[#050505] border border-white/5 rounded-3xl p-6 flex flex-col font-mono relative overflow-hidden group">
       <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.4)_0%,transparent_100%)]" />
       
       {/* Robotics Header */}
       <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4 relative z-10">
          <div className="flex items-center gap-3">
             <Cpu className="w-4 h-4 text-slate-300" />
             <h3 className="text-[10px] font-black text-white uppercase tracking-widest">ROS Robotics Stack</h3>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-sm bg-slate-800" />
             <span className="text-[8px] text-slate-300 font-black uppercase tracking-widest">Node_Master: ONLINE</span>
          </div>
       </div>

       {/* Nodes & Topics Grid */}
       <div className="flex-1 grid grid-cols-2 gap-4 min-h-0 relative z-10">
          
          {/* Active ROS Nodes */}
          <div className="space-y-3">
             <span className="text-[8px] text-slate-700 font-black uppercase tracking-widest block mb-2">Distributed Nodes</span>
             {data.nodes.map(node => (
                <div key={node.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-sm flex items-center justify-between group/node hover:border-slate-700 transition-all">
                   <div className="flex items-center gap-3">
                      <Box className={`w-3.5 h-3.5 ${node.status === 'ACTIVE' ? 'text-slate-300' : 'text-slate-600'}`} />
                      <div>
                         <div className="text-[9px] text-white font-black uppercase tracking-tighter">{node.id}</div>
                         <div className="text-[7px] text-slate-700 font-bold uppercase">{node.namespace}</div>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-[10px] text-white font-bold">{node.load}%</div>
                      <div className="text-[7px] text-slate-800 uppercase font-black">Load</div>
                   </div>
                </div>
             ))}
          </div>

          {/* Active Topics */}
          <div className="space-y-3">
             <span className="text-[8px] text-slate-700 font-black uppercase tracking-widest block mb-2">Telemetry Topics</span>
             {data.topics.map(topic => (
                <div key={topic.name} className="p-3 bg-white/[0.02] border border-white/5 rounded-sm space-y-2 group/topic hover:border-indigo-500/30 transition-all">
                   <div className="flex justify-between items-start">
                      <span className="text-[9px] text-slate-400 font-black tracking-tighter truncate w-32">{topic.name}</span>
                      <span className={`text-[7px] font-black px-1.5 py-0.5 rounded ${
                         topic.status === 'PUBLISHING' ? 'bg-slate-800 text-slate-300' : 'bg-red-950 text-red-500'
                      }`}>{topic.status}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[7px] text-slate-800 uppercase font-black">{topic.type}</span>
                      <span className="text-[8px] text-indigo-400 font-black">{topic.frequency.toFixed(0)}Hz</span>
                   </div>
                </div>
             ))}
          </div>

       </div>

       {/* Command Interlock */}
       <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <Terminal className="w-3 h-3 text-slate-700" />
                <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">ROS_Bridge_v2.4</span>
             </div>
          </div>
          <button className="flex items-center gap-2 text-[8px] text-slate-300 font-black uppercase tracking-widest hover:translate-x-1 transition-all">
             Open Telemetry Hub <ChevronRight className="w-3 h-3" />
          </button>
       </div>
    </div>
  );
}
