"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert } from 'lucide-react';

interface IntelligenceVaultGuardProps {
  children: React.ReactNode;
  requiredSector: string;
  currentSector: string;
  title?: string;
}

export function IntelligenceVaultGuard({ 
  children, 
  requiredSector, 
  currentSector,
  title = "Restricted Intelligence Module"
}: IntelligenceVaultGuardProps) {
  const isAuthorized = currentSector === 'GOVERNMENT' || currentSector === requiredSector;

  if (isAuthorized) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full group">
      {/* The Actual Content (Blurred) */}
      <div className="w-full h-full blur-md grayscale opacity-40 pointer-events-none select-none overflow-hidden">
        {children}
      </div>

      {/* The Vault Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 text-center"
      >
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full animate-pulse" />
          <Lock className="w-12 h-12 text-red-500 relative z-10" />
        </div>
        
        <h3 className="text-red-500 font-black tracking-widest uppercase text-sm mb-1">Access Denied</h3>
        <p className="text-slate-400 text-[10px] uppercase tracking-tighter mb-4 max-w-[200px]">
          Target module requires <span className="text-white font-bold">{requiredSector}</span> clearance level.
        </p>

        <div className="flex flex-col gap-2 w-full max-w-[180px]">
           <button className="py-2 px-4 bg-red-900/20 hover:bg-red-900/40 border border-red-500/50 rounded text-[9px] text-red-200 transition-all uppercase font-mono">
              Request Authorization
           </button>
           <div className="flex items-center justify-center gap-2 py-1 opacity-50">
              <ShieldAlert className="w-3 h-3 text-red-500" />
              <span className="text-[8px] text-slate-500 uppercase tracking-widest">Policy ID: SEC-403-NX</span>
           </div>
        </div>
      </motion.div>

      {/* SOTA Blueprint Lines (Decorative) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 border-2 border-dashed border-red-900/30 m-2 rounded-lg" />
    </div>
  );
}
