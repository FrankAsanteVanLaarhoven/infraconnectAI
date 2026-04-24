import React from 'react';
import { X, CheckCircle, BrainCircuit, PlayCircle } from 'lucide-react';

const ACADEMY_MANIFEST = [
  {
    module: "AI Large Model Development",
    progress: 100,
    lessons: ["Register a model service", "Configuring API-KEY", "Introduction to Dify", "Basic Dify Features", "Deploy the RAG knowledge base", "AI large model development", "RAG knowledge base...", "AI agent workflow", "Custom wake-up responses", "Core module testing..."]
  },
  {
    module: "LiDAR & SLAM Course",
    progress: 100,
    lessons: ["Lidar introduction", "Dual Lidar fusion", "Lidar obstacle avoidance", "Lidar tracking", "Lidar guard", "Gmapping-SLAM mapping", "Cartographer-SLAM mapping", "Slam_toolbox mapping", "Navigation2 single-point", "Navigation2 multi-point", "RTAB-Map mapping", "APP mapping navigation"]
  },
  {
    module: "MoveIt2 Simulation",
    progress: 100,
    lessons: ["MoveIT2 configuration", "MoveIT2 simulation", "Random movement", "Forward kinematics", "Inverse kinematics", "Cartesian path"]
  },
  {
    module: "Robotic Arm and 3D Gripping",
    progress: 100,
    lessons: ["Robotic arm solution", "Machine code ID sorting", "Sorting height anomalies", "Tracking and gripping", "Color block sorting", "Wood block shape sorting", "KCF tracking and gripping", "Mediapipe gesture ID", "Desktop tracking", "3D tracking machine"]
  },
  {
    module: "Depth Camera & Visual LLM",
    progress: 100,
    lessons: ["Dabai DCW2 camera", "Depth pseudo-color", "Depth camera distance", "Wood block volume", "Mediapipe gesture rec.", "Edge detection"]
  }
];

export function AcademyPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-8">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-sm w-full max-w-4xl h-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden relative pointer-events-auto">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <BrainCircuit className="text-slate-300 h-6 w-6" />
            <div>
              <h2 className="text-white font-semibold">Autonomous Academy Knowledge Base</h2>
              <p className="text-white/50 text-[10px] font-mono mt-1">
                SYSTEM VERIFICATION: LLM BASE SUCCESSFULLY INGESTED ALL TRAINING PROTOCOLS
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-sm text-white/50 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
           <div className="grid grid-cols-2 gap-6">
              {ACADEMY_MANIFEST.map((course, idx) => (
                 <div key={idx} className="bg-black/50 border border-slate-700 rounded-sm p-4">
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                       <h3 className="text-slate-300 font-medium font-mono text-sm flex items-center gap-2">
                           <PlayCircle className="h-4 w-4" />
                           {course.module}
                       </h3>
                       <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded">INGESTED</span>
                    </div>
                    
                    <div className="space-y-2">
                       {course.lessons.map((lesson, lIdx) => (
                           <div key={lIdx} className="flex items-center gap-2 text-xs text-white/60 hover:text-cyan-400 transition-colors cursor-pointer p-1 hover:bg-white/5 rounded">
                               <CheckCircle className="h-3 w-3 text-slate-300" />
                               <span className="font-mono">{lIdx + 1}. {lesson}</span>
                           </div>
                       ))}
                    </div>
                 </div>
              ))}
           </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-black border-t border-white/10 flex justify-between items-center font-mono text-[10px] text-white/40">
           <span>PLATFORM LEARNING ENGINE ACTIVE</span>
           <span>TOTAL MODULES: {ACADEMY_MANIFEST.reduce((acc, curr) => acc + curr.lessons.length, 0)} SYNTHESIZED BY AGENT</span>
        </div>
      </div>
    </div>
  );
}
