'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Activity, Cpu, Zap, Radio } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [step, setStep] = useState(0); // 0: Init, 1: Identity, 2: Access
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ── Cinematic Initialization Sequence ──
  useEffect(() => {
    const sequence = [
      { delay: 1500, next: 1 }, // Scanning for Identity Matrix...
      { delay: 3000, next: 2 }, // Establishing Secure Handshake...
    ];
    
    let timer: NodeJS.Timeout;
    if (step < 2) {
      timer = setTimeout(() => setStep(step + 1), sequence[step].delay);
    }
    return () => clearTimeout(timer);
  }, [step]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // In a real SOTA app, we'd use the credentials provider
    // For this demo, we'll simulate a successful handshake
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden font-mono text-slate-300">
      
      {/* ── Background Identity Matrix ── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1)_0%,transparent_70%)]" />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div 
            key="init"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-10 flex flex-col items-center gap-6"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border border-cyan-500/30 animate-ping absolute inset-0" />
              <div className="w-16 h-16 rounded-full border-2 border-cyan-500 flex items-center justify-center bg-cyan-500/10">
                <Shield className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <h2 className="text-xs font-black uppercase tracking-[0.6em] text-cyan-500">Initializing Sovereignty Link</h2>
              <div className="flex gap-1 justify-center">
                 {[...Array(5)].map((_, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ scaleY: 0.2 }}
                     animate={{ scaleY: [0.2, 1, 0.2] }}
                     transition={{ repeat: Infinity, delay: i * 0.1, duration: 0.5 }}
                     className="w-1 h-3 bg-cyan-500/50 rounded-full"
                   />
                 ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div 
            key="id"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="z-10 flex flex-col items-center gap-4"
          >
            <Activity className="w-12 h-12 text-cyan-500 animate-pulse" />
            <div className="text-center">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Nexus ID Located</span>
               <div className="mt-1 font-bold text-cyan-400 tracking-widest uppercase">ID-MATRIX // ALPHA-GEN</div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-10 w-full max-w-sm"
          >
            <div className="glass-panel p-8 space-y-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              
              <div className="space-y-2 text-center">
                <h1 className="text-xl font-black italic tracking-tighter text-white uppercase">InfraConnect Entry</h1>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Authorized Personnel Only</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 pl-1">Identity Secret</label>
                      <div className="relative">
                         <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                         <input 
                           type="password"
                           placeholder="••••••••••••"
                           className="w-full bg-black/50 border border-white/5 rounded-lg py-2.5 pl-9 pr-3 text-xs focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none transition-all placeholder:text-slate-800"
                           required
                         />
                      </div>
                   </div>
                </div>

                <div className="pt-2">
                   <button 
                     type="submit"
                     disabled={loading}
                     className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-[11px] rounded-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
                   >
                     {loading ? (
                        <>
                          <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          Establishing Handshake
                        </>
                     ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          Initialize Session
                        </>
                     )}
                     <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                   </button>
                </div>
              </form>

              <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-widest text-slate-600">
                 <span className="flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-green-500" />
                    Secure Uplink ACTIVE
                 </span>
                 <span className="hover:text-cyan-500 cursor-pointer transition-colors">Emergency Overrule</span>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col items-center gap-4 text-[10px] uppercase font-black tracking-[0.2em] text-cyan-500/20">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-px bg-current" />
                  <span>Sovereignty Protocol V4</span>
                  <div className="w-8 h-px bg-current" />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tactical Scan Arcs ── */}
      <div className="absolute inset-0 pointer-events-none z-20">
         <div className="absolute top-12 left-12 w-32 h-32 border-t border-l border-cyan-500/20 rounded-tl-3xl" />
         <div className="absolute top-12 right-12 w-32 h-32 border-t border-r border-cyan-500/20 rounded-tr-3xl" />
         <div className="absolute bottom-12 left-12 w-32 h-32 border-b border-l border-cyan-500/20 rounded-bl-3xl" />
         <div className="absolute bottom-12 right-12 w-32 h-32 border-b border-r border-cyan-500/20 rounded-br-3xl" />
      </div>
    </div>
  );
}
