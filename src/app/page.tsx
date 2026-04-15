"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Server, Activity, ShieldAlert, Zap, Lock, Database, CheckCircle2, Volume2, VolumeX, Mail, Fingerprint, Terminal, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { MatrixRain } from "@/components/ui/matrix-rain";
import { InfraConnectLogo } from "@/components/ui/InfraConnectLogo";
import { spatial } from "@/lib/spatialAudio";
import { haptic } from "@/lib/haptics";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function MiniDashboardPreview({ act }: { act: number }) {
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [rowsSynced, setRowsSynced] = useState(0);
  
  useEffect(() => {
    if (act >= 3) {
      setTimeout(() => setAnomalyCount(6), 1500);
      setTimeout(() => setAnomalyCount(13), 2000);
      
      const interval = setInterval(() => {
        setRowsSynced(prev => Math.min(prev + Math.floor(Math.random() * 5000), 102492));
      }, 200);
      return () => clearInterval(interval);
    }
  }, [act]);

  return (
    <div className="relative w-full max-w-4xl mx-auto border border-slate-800 bg-[#0a0b0c] text-white rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
      {act >= 3 && act < 6 && (
        <motion.div 
          className="absolute inset-0 w-full h-[2px] bg-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.8)] z-50 pointer-events-none"
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
        />
      )}
      <div className="bg-[#050505] p-3 border-b border-slate-800 flex justify-between items-center px-6">
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full ${act >= 3 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-slate-700'}`} />
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-300">Live Sandbox</span>
        </div>
        <div className="flex gap-4 text-[9px] font-mono uppercase tracking-widest text-slate-500">
          <span>Connections: {act >= 3 ? '3' : '0'}</span>
          <span className={act >= 3 ? "text-blue-400" : ""}>Tunnel: {act >= 3 ? 'Active' : 'Standby'}</span>
        </div>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono relative">
        <AnimatePresence mode="wait">
          {act === 3 && (
            <motion.div key="act3-hud" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute top-4 right-4 z-40 bg-black/80 backdrop-blur border border-blue-500/50 p-3 rounded">
              <div className="text-[10px] text-blue-400 uppercase tracking-widest flex flex-col gap-1">
                <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>SYSTEM ANALYSING...</motion.span>
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>PATTERN DETECTED</motion.span>
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4 }} className="text-white">OPTIMISING ROUTES</motion.span>
              </div>
            </motion.div>
          )}

          {act === 4 && (
            <motion.div key="act4-hud" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute top-4 right-4 z-40 bg-[#050505]/95 backdrop-blur border border-red-500/50 p-4 rounded shadow-[0_0_30px_rgba(239,68,68,0.2)]">
               <div className="flex items-center gap-2 mb-2 border-b border-red-900/50 pb-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                 <span className="text-red-500 font-mono text-[10px] font-bold tracking-[0.2em] uppercase">AI OPERATOR ACTIVE</span>
               </div>
               <div className="text-[10px] text-slate-300 uppercase tracking-widest flex flex-col gap-2 mt-2">
                 <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex justify-between items-center gap-4">
                   <span>Memory Governance</span> <Badge variant="outline" className="border-red-900 text-red-400 bg-red-900/10 text-[8px]">ENGAGED</Badge>
                 </motion.div>
                 <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.0 }} className="flex justify-between items-center gap-4">
                   <span>Constraint Layer</span> <Badge variant="outline" className="border-blue-900 text-blue-400 bg-blue-900/10 text-[8px]">VERIFIED</Badge>
                 </motion.div>
                 <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 3.5 }} className="flex justify-between items-center gap-4">
                   <span>Violations</span> <span className="text-green-400 font-bold">0 DETECTED</span>
                 </motion.div>
               </div>
            </motion.div>
          )}

          {act === 5 && (
            <motion.div key="act5-hud" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
               <div className="bg-[#050505] border border-green-500/40 p-8 rounded-xl shadow-[0_0_50px_rgba(34,197,94,0.15)] flex flex-col items-center text-center max-w-sm w-full">
                  <ShieldAlert className="w-12 h-12 text-slate-600 mb-4" />
                  <motion.div className="text-xs uppercase tracking-widest text-slate-400 mb-4" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>Generating Decision Trace...</motion.div>
                  <div className="w-full space-y-3">
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ delay: 2 }} className="bg-slate-900 p-3 rounded text-[11px] text-green-400 font-bold border border-green-900/50">CONFIDENCE: 98.4%</motion.div>
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ delay: 4 }} className="bg-slate-900 p-3 rounded text-[11px] text-slate-300 border border-slate-800">AUDIT LOG SEALED</motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 5.5, type: "spring" }} className="flex items-center justify-center gap-2 text-white font-bold text-lg mt-4 border-t border-white/10 pt-4">VERIFIED <CheckCircle2 className="w-5 h-5 text-green-500" /></motion.div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="col-span-2 space-y-4">
          <div className="flex justify-between items-center text-xs uppercase tracking-widest text-slate-500 mb-2">
            <span>Live Telemetry</span>
            <span className={`flex items-center gap-1 ${act >= 3 ? 'text-blue-500' : 'text-slate-600'}`}><Zap className="w-3 h-3" /> Syncing</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="bg-black border border-slate-800 p-3 rounded flex justify-between items-center">
              <span className="text-slate-400">Anomaly Detections</span>
              <span className={act >= 3 ? "text-red-400 font-bold" : "text-slate-600"}>{anomalyCount}</span>
            </div>
            <div className="bg-black border border-slate-800 p-3 rounded flex justify-between items-center">
              <span className="text-slate-400">Rows Synchronized</span>
              <span className={act >= 3 ? "text-white font-bold" : "text-slate-600"}>{rowsSynced.toLocaleString()}</span>
            </div>
            <div className="bg-black border border-slate-800 p-3 rounded flex justify-between items-center">
              <span className="text-slate-400">Routing Engines</span>
              <span className={act >= 3 ? "text-green-500" : "text-slate-600"}>{act >= 3 ? 'Stable' : 'Offline'}</span>
            </div>
          </div>
        </div>
        
        <div className="border border-slate-800 bg-black rounded p-4 flex flex-col justify-start">
           <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">Bound Origins</span>
           <div className={`space-y-3 text-xs transition-opacity duration-1000 ${act >= 3 ? 'opacity-100' : 'opacity-30'}`}>
             <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
               <Database className="w-3 h-3 text-blue-500"/> Postgres 
               {act >= 3 && <motion.span initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1}} className="ml-auto text-[9px] text-green-500">✓</motion.span>}
             </div>
             <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
               <Server className="w-3 h-3 text-purple-500"/> Application Logs
               {act >= 3 && <motion.span initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2}} className="ml-auto text-[9px] text-green-500">✓</motion.span>}
             </div>
             <div className="flex items-center gap-2">
               <Lock className="w-3 h-3 text-green-500"/> E2E Encrypted
               {act >= 3 && <motion.span initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.5}} className="ml-auto text-[9px] text-green-500">✓</motion.span>}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [act, setAct] = useState(0);
  const [isAccessHovered, setIsAccessHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [contactState, setContactState] = useState({ email: '', department: 'hello', intent: '' });
  const [emailStatus, setEmailStatus] = useState<'idle'|'sending'|'sent'>('idle');

  useEffect(() => {
    spatial.load("master", "/epic-soundtrack.mp3");
    spatial.load("boot", "/audio/sfx/system-boot.mp3");
    spatial.load("stream", "/audio/sfx/data-stream.mp3");
    spatial.load("alert", "/audio/sfx/anomaly-alert.mp3");
    spatial.load("hover", "/audio/sfx/ui-hover.mp3");
    spatial.load("lock", "/audio/sfx/trust-lock.mp3");
    spatial.load("success", "/audio/sfx/success-hit.mp3");
    spatial.load("impact", "/audio/sfx/final-impact.mp3");
  }, []);

  useEffect(() => {
    if (act === 0) {
      const t = setTimeout(() => setAct(1), 2000);
      return () => clearTimeout(t);
    }
  }, [act]);

  const handleInitiate = () => {
    if (act !== 1) return;
    setAct(2); 
    
    // START SOTA AUDIO AND HAPTIC SYNC
    spatial.play("master", 0, 0.6);
    spatial.play("boot", 0, 0.4);
    haptic(10);
    
    setTimeout(() => {
       setAct(3);
       spatial.play("stream", 0.7, 0.2);
       haptic([10, 20]);
    }, 6000); 

    setTimeout(() => {
       spatial.play("alert", -0.7, 0.6);
       haptic([10, 30, 10]);
    }, 8000);
    
    setTimeout(() => {
       setAct(4);
    }, 16000); 

    setTimeout(() => {
       setAct(5);
       spatial.play("hover", 0, 0.3);
    }, 29000); 

    setTimeout(() => {
       spatial.play("success", 0, 0.6);
       haptic(20);
    }, 31000);

    setTimeout(() => {
       spatial.play("lock", 0, 0.8);
       haptic([15, 20, 30]);
    }, 33000);
    
    setTimeout(() => {
       setAct(6);
       spatial.play("impact", 0, 1.0);
       haptic(40);
    }, 44000); 
  };

  const handleToggleAudio = () => {
    spatial.globalMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  const sendEnterpriseRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus('sending');
    try {
      const res = await fetch('/api/contact', { method: 'POST', body: JSON.stringify(contactState) });
      if (!res.ok) throw new Error("Payload delivery rejected");
      setEmailStatus('sent');
      setTimeout(() => setEmailStatus('idle'), 3000);
    } catch {
      setEmailStatus('idle');
    }
  };

  const activeMedia = "/trailer-assets/scene_1_demo.webp";

  return (
    <div className="min-h-screen bg-[#050505] text-[#f8fafc] selection:bg-slate-700/50 relative overflow-hidden flex flex-col font-mono">
      <MatrixRain className="opacity-30 mix-blend-screen" color="#475569" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,#050505_100%)] opacity-90" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <AnimatePresence>
        {act < 6 && (
          <motion.nav 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 1 }}
            className="relative z-50 flex items-center justify-between p-6 md:px-12 backdrop-blur-none border-b border-white/5 bg-[#050505]/40"
          >
            <div className="flex items-center gap-3 w-64 md:w-80 pt-1">
              <InfraConnectLogo variant="hero" />
            </div>

            {/* SOTA EPHEMERAL ACCESS CORNER */}
            <div 
              className="relative pr-6 flex items-center h-full"
              onMouseEnter={() => setIsAccessHovered(true)}
              onMouseLeave={() => setIsAccessHovered(false)}
            >
              <AnimatePresence mode="wait">
                {!isAccessHovered ? (
                  <motion.div
                    key="trigger"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.4, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-full border border-cyan-500/20 flex items-center justify-center bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors">
                      <Fingerprint className="w-4 h-4 text-cyan-500/50 animate-pulse" />
                    </div>
                    <span className="text-[9px] font-black text-slate-700 tracking-[0.3em] uppercase hidden md:block">Neural_Access</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="controls"
                    initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: 10, filter: "blur(10px)" }}
                    className="flex items-center gap-6 bg-black/40 backdrop-blur-3xl border border-white/5 p-1.5 pl-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                  >
                    <button onClick={handleToggleAudio} className="text-slate-500 hover:text-white transition-colors p-2" title="Toggle Soundscape">
                       {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>

                    <div className="h-6 w-px bg-white/5 mx-1" />

                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="group relative px-4 py-2 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-all overflow-hidden flex items-center gap-2.5">
                          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,#f59e0b_1px,#f59e0b_2px)]" />
                          <Mail className="w-3.5 h-3.5 text-amber-500/60" />
                          <span className="text-[10px] font-black uppercase text-amber-400/80 tracking-[0.2em]">Deployment</span>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#050505] border border-slate-800 text-white font-mono rounded-none sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-sm font-bold uppercase tracking-widest border-b border-slate-800 pb-2 text-amber-500">Tier_Authorization</DialogTitle>
                          <DialogDescription className="text-[10px] uppercase text-slate-500 tracking-widest pt-2">
                             Establish a secure connection with a specific operational tier.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={sendEnterpriseRequest} className="flex flex-col gap-4 mt-2">
                          <div>
                            <label className="text-[10px] uppercase text-slate-400 tracking-widest mb-1 block">Authentication Identifier</label>
                            <input required type="email" placeholder="EXECUTIVE@DOMAIN.COM" className="w-full bg-black border border-slate-800 p-2 text-xs uppercase focus:border-amber-500 outline-none" value={contactState.email} onChange={e => setContactState({...contactState, email: e.target.value})} />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase text-slate-400 tracking-widest mb-1 block">Routing Designation</label>
                            <select className="w-full bg-black border border-slate-800 p-2 text-xs uppercase focus:border-amber-500 outline-none text-slate-300" value={contactState.department} onChange={e => setContactState({...contactState, department: e.target.value})}>
                               <option value="hello">General (hello@)</option>
                               <option value="frank">Executive (frank@)</option>
                               <option value="security">Compliance (security@)</option>
                               <option value="support">Technical (support@)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase text-slate-400 tracking-widest mb-1 block">Secure Payload</label>
                            <textarea required placeholder="ENTER DEPLOYMENT REQUIREMENTS..." className="w-full bg-black border border-slate-800 p-2 text-xs uppercase focus:border-amber-500 outline-none min-h-[100px]" value={contactState.intent} onChange={e => setContactState({...contactState, intent: e.target.value})} />
                          </div>
                          <Button type="submit" disabled={emailStatus==='sending'} className={`text-white rounded-none uppercase text-xs tracking-widest transition-colors duration-500 ${emailStatus === 'sending' ? 'bg-amber-600' : emailStatus === 'sent' ? 'bg-green-600' : 'bg-amber-800 hover:bg-amber-700'}`}>
                             {emailStatus === 'sending' ? 'TRANSMITTING...' : emailStatus === 'sent' ? 'SECURED' : 'DISPATCH PAYLOAD'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <button 
                          className="group relative px-6 py-2 border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all flex items-center gap-3"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.25em]">Elevate</span>
                          <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-cyan-500 animate-pulse border border-black" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#050505] border border-slate-800 text-white font-mono rounded-none sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-sm font-bold uppercase tracking-widest border-b border-slate-800 pb-2 text-cyan-500">Security Verification</DialogTitle>
                          <DialogDescription className="text-[10px] uppercase text-slate-500 tracking-widest pt-2">
                             Access to Elevate requires manual review and approval by the governance committee.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={sendEnterpriseRequest} className="flex flex-col gap-4 mt-2">
                          <div>
                            <label className="text-[10px] uppercase text-slate-400 tracking-widest mb-1 block">Corporate Email</label>
                            <input required type="email" placeholder="EXECUTIVE@DOMAIN.COM" className="w-full bg-black border border-slate-800 p-2 text-xs uppercase focus:border-cyan-500 outline-none" value={contactState.email} onChange={e => setContactState({...contactState, email: e.target.value})} />
                          </div>
                          <Button type="submit" disabled={emailStatus==='sending'} className={`text-white rounded-none uppercase text-xs tracking-widest transition-colors duration-500 ${emailStatus === 'sending' ? 'bg-cyan-600' : emailStatus === 'sent' ? 'bg-green-600' : 'bg-cyan-800 hover:bg-cyan-700'}`}>
                             {emailStatus === 'sending' ? 'VERIFYING...' : emailStatus === 'sent' ? 'PENDING REVIEW' : 'REQUEST ELEVATION'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <button 
                          className="px-6 py-2 bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2.5"
                        >
                          <Terminal className="w-3 h-3 opacity-50" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sandbox</span>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#050505] border border-slate-800 text-white font-mono rounded-none sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-sm font-bold uppercase tracking-widest border-b border-slate-800 pb-2 text-slate-400">Sandbox Waitlist</DialogTitle>
                          <DialogDescription className="text-[10px] uppercase text-slate-500 tracking-widest pt-2">
                             The interactive sandbox is not currently open to the public. Join the waitlist.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={sendEnterpriseRequest} className="flex flex-col gap-4 mt-2">
                          <div>
                            <label className="text-[10px] uppercase text-slate-400 tracking-widest mb-1 block">Work Email</label>
                            <input required type="email" placeholder="YOUR@DOMAIN.COM" className="w-full bg-black border border-slate-800 p-2 text-xs uppercase focus:border-slate-500 outline-none" value={contactState.email} onChange={e => setContactState({...contactState, email: e.target.value})} />
                          </div>
                          <Button type="submit" disabled={emailStatus==='sending'} className={`text-white rounded-none uppercase text-xs tracking-widest transition-colors duration-500 ${emailStatus === 'sending' ? 'bg-slate-600' : emailStatus === 'sent' ? 'bg-green-600' : 'bg-slate-800 hover:bg-slate-700'}`}>
                             {emailStatus === 'sending' ? 'TRANSMITTING...' : emailStatus === 'sent' ? 'SECURED ON WAITLIST' : 'JOIN WAITLIST'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {act >= 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 3 }} className={`fixed inset-0 z-0 pointer-events-none bg-[#050505] transition-all duration-[3000ms] ${act >= 6 ? 'opacity-0 blur-md' : 'opacity-40 blur-[2px]'}`}>
            <motion.div initial={false} animate={{ scale: [1.0, 1.05], x: ['0%', '-2%'], y: ['0%', '-1%'] }} transition={{ duration: 25, ease: "linear", repeat: Infinity, repeatType: "reverse" }} className="w-full h-[120vh] absolute -top-[10%] left-0 origin-center">
                <img src={activeMedia} className="w-full h-full object-cover" alt="SOTA System Trailer" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-32 text-center w-full h-full">
        <AnimatePresence mode="wait">
          {act <= 2 && (
            <motion.div key="hero-text" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }} transition={{ duration: 1, ease: "easeOut" }} className="w-full max-w-5xl mx-auto space-y-6 flex flex-col items-center">
              <Badge variant="outline" className="border-slate-800 text-slate-400 bg-black/40 px-3 py-1 rounded-none text-[10px] uppercase tracking-widest mb-4">
                <Activity className="w-3 h-3 mr-2 inline-block animate-pulse text-slate-300" />
                Infrastructure Online
              </Badge>
              
              <div className="w-full flex items-center justify-center -mt-4 mb-2">
                {act === 0 ? (
                   <h1 className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] text-3xl md:text-[5rem] tracking-tight font-bold">INFRASTRUCTURE ONLINE</h1>
                ) : (
                   <motion.h1 initial={{ scale: 0.95, opacity: 0, filter: 'blur(10px)' }} animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 1.5, type: 'spring' }} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] text-4xl leading-tight md:text-[5rem] tracking-tight font-extrabold max-w-[1200px]">
                     Autonomous Infrastructure Control
                   </motion.h1>
                )}
              </div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: act >= 1 ? 1 : 0 }} transition={{ duration: 1 }} className="mt-8 text-lg font-mono text-slate-400 max-w-2xl mx-auto leading-relaxed pl-4 pb-4">
                 <span className="text-white font-bold block mb-2">Observe. Decide. Act.</span>
                 Without APIs. Without exposure.
              </motion.p>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: act >= 1 ? 1 : 0 }} transition={{ duration: 1, delay: 0.5 }} className="flex flex-col sm:flex-row items-center justify-center pt-8 w-full max-w-xs mx-auto relative z-20">
                  <Button onClick={handleInitiate} disabled={act !== 1} size="lg" className={`w-full h-14 rounded-none text-[12px] uppercase tracking-widest font-black transition-all duration-700 ${act === 1 ? 'bg-white text-black hover:bg-slate-300 shadow-[0_0_30px_rgba(255,255,255,0.3)]' : 'bg-green-600 text-white shadow-[0_0_40px_rgba(34,197,94,0.4)] cursor-default'}`}>
                    {act === 1 ? 'INITIATE' : 'AUTHORISED'}
                  </Button>
              </motion.div>
              
              {act === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-mono mt-8 animate-pulse">CONNECTING TO SYSTEMS…</motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {act >= 2 && act < 6 && (
            <motion.div key="demo-container" initial={{ opacity: 0, y: 100, scale: 0.9, filter: 'blur(20px)' }} animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }} transition={{ duration: 1.8, delay: act === 2 ? 1 : 0, ease: [0.16, 1, 0.3, 1] }} className="w-full absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-20">
               <motion.div className="w-full px-4" animate={{ scale: act >= 4 ? 0.95 : 1, y: act >= 4 ? -40 : 0 }} transition={{ duration: 2 }}>
                 <MiniDashboardPreview act={act} />
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {act === 6 && (
            <motion.div key="final-close" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2 }} className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-[#020202]/90 backdrop-blur-sm">
               <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="text-2xl md:text-4xl text-white font-bold tracking-tight mb-12">
                  Your infrastructure is now autonomous.
               </motion.p>
               
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }}>
                 <Dialog>
                   <DialogTrigger asChild>
                     <Button className="h-14 px-12 bg-white text-black hover:bg-slate-200 rounded-none text-xs uppercase tracking-[0.2em] font-black shadow-[0_0_30px_rgba(255,255,255,0.2)]">Request Access</Button>
                   </DialogTrigger>
                   <DialogContent className="bg-[#050505] border border-slate-800 text-white font-mono rounded-none sm:max-w-md">
                     <DialogHeader>
                       <DialogTitle className="text-sm font-bold uppercase tracking-widest border-b border-slate-800 pb-2">Central Routing</DialogTitle>
                       <DialogDescription className="text-[10px] uppercase text-slate-500 tracking-widest pt-2">Establish a secure connection.</DialogDescription>
                     </DialogHeader>
                     <form onSubmit={sendEnterpriseRequest} className="flex flex-col gap-4 mt-2">
                       <div><label className="text-[10px] uppercase text-slate-400">Authentication</label><input required type="email" placeholder="EXECUTIVE@DOMAIN.COM" className="w-full bg-black border border-slate-800 p-2 text-xs" value={contactState.email} onChange={e => setContactState({...contactState, email: e.target.value})} /></div>
                       <div><label className="text-[10px] uppercase text-slate-400">Routing Designation</label><select className="w-full bg-black border border-slate-800 p-2 text-xs" value={contactState.department} onChange={e => setContactState({...contactState, department: e.target.value})}><option value="hello">General (hello@)</option><option value="frank">Executive (frank@)</option><option value="security">Compliance (security@)</option><option value="support">Technical (support@)</option></select></div>
                       <div><label className="text-[10px] uppercase text-slate-400">Secure Payload</label><textarea required placeholder="ENTER REQUIREMENTS..." className="w-full bg-black border border-slate-800 p-2 text-xs min-h-[100px]" value={contactState.intent} onChange={e => setContactState({...contactState, intent: e.target.value})} /></div>
                       <Button type="submit" disabled={emailStatus==='sending'} className={`text-white rounded-none uppercase text-xs transition-colors duration-500 ${emailStatus === 'sending' ? 'bg-amber-600 hover:bg-amber-700' : emailStatus === 'sent' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                         {emailStatus === 'sending' ? 'TRANSMITTING...' : emailStatus === 'sent' ? 'SECURED' : 'DISPATCH PAYLOAD'}
                       </Button>
                     </form>
                   </DialogContent>
                 </Dialog>
               </motion.div>
               
               <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4 }} className="mt-6 text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                  Private deployment for qualified teams only.
               </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* SOTA FOOTER */}
      <footer className="relative z-10 w-full px-12 py-8 mt-auto border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-black text-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          <span>© 2026 INFRACONNECT // INFRA-SYNC SYNDICATE</span>
        </div>
        <div className="flex items-center gap-6 text-slate-900">
           <span className="hover:text-cyan-500/40 cursor-pointer transition-colors">Operational_Clearance</span>
           <span className="hover:text-cyan-500/40 cursor-pointer transition-colors">Data_Latency_Matrix</span>
        </div>
      </footer>
    </div>
  );
}
