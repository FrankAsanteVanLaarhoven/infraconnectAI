"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Globe, 
    Zap, 
    Activity, 
    Shield, 
    Filter, 
    Target,
    Layers,
    Share2,
    Eye,
    TrendingUp,
    AlertTriangle,
    ChevronDown,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
    CognitiveProxy, 
    INITIAL_PROXIES, 
    DISRUPTOR_SEEDS, 
    simulateSocialEvolution 
} from '@/lib/nexus/emulation';

export function StrategicRehearsalNexus() {
    const [proxies, setProxies] = useState<CognitiveProxy[]>(INITIAL_PROXIES);
    const [activeDisruptor, setActiveDisruptor] = useState<string | null>(null);
    const [convergence, setConvergence] = useState(0.92);
    const [simCycle, setSimCycle] = useState(1);
    const [isSimulating, setIsSimulating] = useState(true);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Particle Cloud Simulation (Agent Visualization)
    useEffect(() => {
        if (!canvasRef.current || !isSimulating) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrame: number;
        const particles = proxies.map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 1.5 + 0.5
        }));

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach((p, i) => {
                const proxy = proxies[i];
                p.x += p.vx * (activeDisruptor ? 3 : 1);
                p.y += p.vy * (activeDisruptor ? 3 : 1);

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = activeDisruptor ? '#f87171' : '#6366f1';
                ctx.globalAlpha = 0.5 + proxy.sentiment * 0.5;
                ctx.fill();

                // Draw connection lines to nearby particles (SOTA benchmark look)
                particles.forEach((other, oi) => {
                    const dx = p.x - other.x;
                    const dy = p.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 40) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.strokeStyle = activeDisruptor ? '#fecaca' : '#c7d2fe';
                        ctx.globalAlpha = 0.05 * (1 - dist / 40);
                        ctx.stroke();
                    }
                });
            });

            animationFrame = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrame);
    }, [proxies, activeDisruptor, isSimulating]);

    // Social Evolution Simulation Loop
    useEffect(() => {
        const interval = setInterval(() => {
            setProxies(prev => simulateSocialEvolution(prev, activeDisruptor || undefined));
            setSimCycle(s => s + 1);
            setConvergence(prev => Math.max(0.6, Math.min(0.98, prev + (Math.random() - 0.5) * 0.02)));
        }, 2000);
        return () => clearInterval(interval);
    }, [activeDisruptor]);

    const injectDisruptor = (id: string) => {
        setActiveDisruptor(id);
        setTimeout(() => setActiveDisruptor(null), 8000);
    };

    return (
        <div className="w-full h-full bg-[#050505] border border-slate-900 rounded-3xl p-8 flex flex-col font-mono relative overflow-hidden group shadow-[0_0_100px_rgba(0,0,0,0.8)]">
            {/* Master Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                        <Share2 className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Strategic Rehearsal Nexus</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Simulated Reality Engine // SOTA 2035</p>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] text-slate-600 uppercase font-black">Convergence Rate</span>
                        <span className="text-xl font-black text-white tracking-widest">{(convergence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-px h-8 bg-white/5" />
                    <Button 
                        onClick={() => setIsSimulating(!isSimulating)}
                        className={`text-[9px] font-black uppercase px-4 py-6 border transition-all ${
                            isSimulating ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:text-white' : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                    >
                        {isSimulating ? 'Live Emulation' : 'Emulation Paused'}
                    </Button>
                </div>
            </div>

            {/* Main Simulation Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-0 relative z-10">
                
                {/* Disruptor Control Panel */}
                <div className="flex flex-col gap-6 order-2 lg:order-1">
                    <div className="space-y-4">
                        <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest border-b border-white/5 pb-2 block">Inject Disruptor Seed</span>
                        {DISRUPTOR_SEEDS.map((seed) => (
                            <motion.div 
                                key={seed.id}
                                whileHover={{ x: 4 }}
                                onClick={() => injectDisruptor(seed.id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                    activeDisruptor === seed.id 
                                    ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                                    : 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-900 border-white/5'
                                }`}
                            >
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-white uppercase">{seed.label}</span>
                                    <span className="text-[7px] text-slate-500 font-bold uppercase mt-0.5">{seed.type}</span>
                                </div>
                                <Zap className={`w-3.5 h-3.5 ${activeDisruptor === seed.id ? 'text-red-400 animate-pulse' : 'text-slate-700'}`} />
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex-1 bg-slate-900/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                        <span className="text-[9px] text-slate-600 uppercase font-black border-b border-white/5 pb-2 block underline underline-offset-4">Outcome Convergence</span>
                        <div className="space-y-3">
                            {[
                                { outcome: 'Alpha: Market Stability', prob: 0.12, color: 'bg-indigo-500' },
                                { outcome: 'Beta: Systemic Drift', prob: 0.78, color: 'bg-red-500' },
                                { outcome: 'Gamma: Emergent Recovery', prob: 0.10, color: 'bg-emerald-500' }
                            ].map((res, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-[8px] font-bold text-slate-400">
                                        <span>{res.outcome}</span>
                                        <span>{(res.prob * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-0.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${res.prob * 100}%` }} className={`h-full ${res.color}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Particle Cloud Viewport */}
                <div className="lg:col-span-3 bg-black border border-white/5 rounded-3xl relative overflow-hidden order-1 lg:order-2">
                    <canvas 
                        ref={canvasRef} 
                        className="w-full h-full"
                        width={1200}
                        height={800}
                    />
                    
                    {/* Overlay Diagnostics */}
                    <div className="absolute top-6 left-6 flex flex-col gap-4 pointer-events-none">
                        <div className="flex items-center gap-2 bg-black/80 border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md">
                            <Eye className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.2em]">Parallel World #0352</span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/80 border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md">
                            <Activity className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[9px] text-slate-500 font-bold uppercase">Prediction Swarm Agents: {proxies.length}</span>
                        </div>
                    </div>


                    <div className="absolute bottom-6 right-6 flex items-center gap-4">
                        <div className="bg-black/60 border border-white/10 p-4 rounded-xl backdrop-blur-md max-w-[240px]">
                            <p className="text-[9px] text-slate-400 leading-relaxed font-mono italic">
                                "The social evolution cycle is accelerating. Predicted systemic shift in T-minus {Math.floor(Math.random() * 60) + 120} cycles."
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <TrendingUp className="w-3 h-3 text-emerald-400" />
                                <span className="text-[7px] text-emerald-400 font-black uppercase tracking-widest">Emergent Signal Detected</span>
                            </div>
                        </div>
                    </div>

                    {/* Active Disruptor Alert overlay */}
                    <AnimatePresence>
                        {activeDisruptor && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            >
                                <div className="bg-red-500/10 border border-red-500/40 p-12 rounded-[4rem] backdrop-blur-sm flex flex-col items-center gap-4">
                                    <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
                                    <div className="text-center">
                                        <h3 className="text-xl font-black text-white uppercase tracking-[0.4em]">Propagating Disruptor</h3>
                                        <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-2">{DISRUPTOR_SEEDS.find(s => s.id === activeDisruptor)?.label}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Background Data Matrix (SOTA look) */}
            <div className="absolute inset-x-0 bottom-0 h-1/4 pointer-events-none opacity-[0.03] overflow-hidden grayscale">
                <motion.div 
                    animate={{ x: [-1000, 1000] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="text-[10px] whitespace-nowrap text-indigo-500 font-mono"
                >
                    {Array.from({ length: 20 }).map(() => "SIMULATED_REALITY_REHEARSAL_CYCLE_").join("")}
                </motion.div>
            </div>
        </div>
    );
}
