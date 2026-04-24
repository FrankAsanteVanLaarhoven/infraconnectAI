"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Info, MapPin, Zap, AlertTriangle } from 'lucide-react';

interface GroundTruthCardProps {
  attacker: { name: string; flag: string };
  target: { name: string; flag: string };
  date: string;
  category: string;
  verified: boolean;
  title: string;
  description: string;
  image?: string;
  className?: string;
}

export function GroundTruthCard({ 
  attacker, 
  target, 
  date, 
  category, 
  verified, 
  title, 
  description, 
  image,
  className = "" 
}: GroundTruthCardProps) {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`w-72 bg-black/80 backdrop-blur-xl border border-slate-700/50 rounded-sm overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col font-mono select-none pointer-events-auto ${className}`}
    >
      {/* Header: Attacker -> Target (DRAG HANDLE) */}
      <div className="drag-handle bg-slate-900/60 p-2 flex items-center justify-between border-b border-slate-800 cursor-move">
         <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded text-[9px] font-black border border-slate-700 pointer-events-none">
            <span className="text-slate-500 uppercase tracking-tighter">SOURCE</span>
            <span className="text-white">{attacker.flag}</span>
            <span className="text-white uppercase">{attacker.name}</span>
            <span className="text-cyan-500 ml-1">→</span>
         </div>
         <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black pointer-events-none">
            <span className="text-slate-500 uppercase tracking-tighter">AFFECTED</span>
            <span className="text-white">{target.flag}</span>
            <span className="text-white uppercase">{target.name}</span>
         </div>
      </div>

      {/* Meta Bar */}
      <div className="flex items-center gap-1 p-2 bg-slate-950/40 border-b border-slate-800">
         <div className="bg-cyan-900/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded text-[8px] font-bold">APPROX</div>
         <div className="bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">{date}</div>
         <div className="bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">{category}</div>
         {verified && (
           <div className="bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-1">
             VERIFIED
           </div>
         )}
      </div>

      {/* Content Area */}
      <div className="p-3">
         <div className="flex items-center gap-1 mb-1">
            <div className="bg-cyan-950/30 text-cyan-400 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight">GEO-OSINT</div>
            <div className="bg-amber-950/30 text-amber-500 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight">APPROX SEQ</div>
         </div>
         
         <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-tight leading-tight">
            {title}
         </h4>
         <p className="text-[10px] text-slate-400 leading-tight mb-3">
            {description}
         </p>

         {/* Image/Media Container */}
         <div className="relative aspect-video bg-slate-900 rounded-sm overflow-hidden border border-slate-800 group">
            {image ? (
              <img src={image} alt="OSINT evidence" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                 <MapPin className="w-6 h-6 text-slate-800" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                 <span className="absolute bottom-2 left-2 text-[8px] text-cyan-500/60 font-black uppercase">Sensor Array Active</span>
              </div>
            )}
            
            {/* Visual Scan Effect */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-500/50 animate-scan-line pointer-events-none" />
         </div>
      </div>

      <style jsx global>{`
         @keyframes scan-line {
            0% { top: 0% }
            100% { top: 100% }
         }
         .animate-scan-line {
            animation: scan-line 3s linear infinite;
         }
      `}</style>
    </motion.div>
  );
}
