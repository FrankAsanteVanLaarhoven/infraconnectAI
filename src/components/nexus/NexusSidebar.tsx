"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Globe, 
  Ship, 
  Shield, 
  Terminal, 
  Activity, 
  Zap, 
  Cpu, 
  Database,
  Satellite,
  Target,
  ThermometerSun
} from 'lucide-react';

const NEXUS_ROUTES = [
  { path: '/nexus', label: 'Strategic Core', icon: Globe },
  { path: '/nexus/control-plane', label: 'Control Plane', icon: Terminal },
  { path: '/nexus/maritime', label: 'Maritime', icon: Ship },
  { path: '/nexus/fleet', label: 'Fleet Operations', icon: Activity },
  { path: '/nexus/space', label: 'Orbital Intel', icon: Satellite },
  { path: '/nexus/environment', label: 'Environment', icon: ThermometerSun },
  { path: '/nexus/integration', label: 'Integration', icon: Database },
  { path: '/nexus/simulation', label: 'Simulation', icon: Cpu },
  { path: '/nexus/training', label: 'Training', icon: Target },
  { path: '/nexus/security', label: 'Security', icon: Shield },
];

export function NexusSidebar() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      className="h-full bg-black/80 backdrop-blur-3xl border-r border-white/5 flex flex-col z-[100] transition-all duration-300 relative shrink-0"
      initial={{ width: 64 }}
      animate={{ width: isHovered ? 240 : 64 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-20 border-b border-white/5 flex items-center px-4 overflow-hidden shrink-0">
        <Zap className="w-6 h-6 text-cyan-500 shrink-0" />
        <AnimatePresence>
          {isHovered && (
            <motion.span 
              key="nexus-hub-label"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-4 font-black uppercase tracking-[0.2em] text-white whitespace-nowrap text-xs"
            >
              Nexus Hub
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 py-6 overflow-y-auto custom-scrollbar flex flex-col gap-2 px-2">
        {NEXUS_ROUTES.map((route) => {
          const isActive = pathname === route.path;
          return (
            <Link key={route.path} href={route.path}>
              <div 
                className={`flex items-center px-3 py-3 rounded-sm cursor-pointer transition-all duration-300 ${
                  isActive 
                    ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400' 
                    : 'border border-transparent text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <route.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-cyan-400' : ''}`} />
                {isHovered && (
                  <span className={`ml-4 text-[10px] uppercase tracking-widest font-bold whitespace-nowrap ${isActive ? 'text-cyan-400' : ''}`}>
                    {route.label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="h-16 border-t border-white/5 flex items-center px-4 shrink-0">
        <div className={`w-2 h-2 rounded-sm ${isHovered ? 'bg-slate-800 ' : 'bg-cyan-500 '}  shrink-0`} />
        {isHovered && (
          <div className="ml-4 flex flex-col">
            <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">System Status</span>
            <span className="text-[9px] text-slate-300 uppercase font-bold tracking-widest">Optimal</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
