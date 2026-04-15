"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface NexusUplinkBeaconProps {
  isAuthorized: boolean;
  className?: string;
}

export function NexusUplinkBeacon({ isAuthorized, className }: NexusUplinkBeaconProps) {
  const router = useRouter();

  const handleUplink = () => {
    if (!isAuthorized) return;
    router.push('/nexus');
  };

  return (
    <motion.button
      onClick={handleUplink}
      whileHover={isAuthorized ? { scale: 1.05 } : {}}
      whileTap={isAuthorized ? { scale: 0.95 } : {}}
      className={cn(
        "relative flex items-center gap-3 px-4 py-1.5 rounded-lg border font-mono transition-all duration-500",
        isAuthorized 
          ? "bg-cyan-950/20 border-cyan-500/40 text-cyan-400 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.1)] group"
          : "bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed",
        className
      )}
    >
      {/* Pulse Effect for Authorized */}
      {isAuthorized && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-cyan-500/5 pointer-events-none"
          animate={{
            boxShadow: [
              "0 0 0px 0px rgba(6, 182, 212, 0)",
              "0 0 10px 2px rgba(6, 182, 212, 0.2)",
              "0 0 0px 0px rgba(6, 182, 212, 0)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      <div className="relative flex items-center justify-center">
        {isAuthorized ? (
          <ShieldCheck className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
        ) : (
          <Lock className="w-3.5 h-3.5 opacity-40" />
        )}
      </div>

      <div className="flex flex-col items-start leading-none uppercase">
        <span className="text-[9px] font-black tracking-[0.2em]">Nexus_Uplink</span>
        <span className={cn(
          "text-[7px] font-bold tracking-widest mt-0.5",
          isAuthorized ? "text-cyan-500/60" : "text-slate-700"
        )}>
          {isAuthorized ? "Authorized // L5" : "Access_Restricted"}
        </span>
      </div>

      {isAuthorized && (
        <div className="ml-2">
          <Zap className="w-3 h-3 text-cyan-500/30 group-hover:text-cyan-400 transition-colors" />
        </div>
      )}

      {/* Industrial Scanlines */}
      <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden opacity-5">
        <div className="w-full h-full bg-[repeating-linear-gradient(0deg,white,white_1px,transparent_1px,transparent_2px)]" />
      </div>
    </motion.button>
  );
}
