"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, TrendingUp, Zap, Clock, ShieldCheck, ArrowRight, Activity, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InteractiveROICalc() {
  const [teamSize, setTeamSize] = useState(20);
  const [avgSalary, setAvgSalary] = useState(85000);
  const [showCapture, setShowCapture] = useState(false);
  const [email, setEmail] = useState("");

  const metrics = useMemo(() => {
    // Logic mirrored from roiEngine.ts
    const hourlyRate = avgSalary / 2000;
    const efficiencyGain = 0.25; // 25% avg.
    
    const annualVelocityValue = teamSize * 2000 * hourlyRate * efficiencyGain;
    const infraSavings = annualVelocityValue * 0.15;
    const riskReductionValue = (teamSize > 50 ? 40000 : 10000); // Heuristic

    const totalAnnualImpact = annualVelocityValue + infraSavings + riskReductionValue;
    const fiveYearImpact = totalAnnualImpact * 5;

    return {
      annualVelocityValue,
      infraSavings,
      totalAnnualImpact,
      fiveYearImpact
    };
  }, [teamSize, avgSalary]);

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await fetch('/api/lead', {
            method: 'POST',
            body: JSON.stringify({
                email,
                companySize: teamSize > 100 ? 'enterprise' : 'mid-market',
                message: `ROI Calculator User: TeamSize=${teamSize}, Salary=${avgSalary}, Impact=£${metrics.totalAnnualImpact.toFixed(0)}`
            })
        });
        alert("Strategic Analysis Saved. We will reach out shortly.");
    } catch {}
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-12 relative">
       <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full" />
       
       <div className="relative glass-subtle border border-blue-500/20 rounded-2xl overflow-hidden flex flex-col md:flex-row h-full font-mono">
          
          {/* Controls Panel */}
          <div className="w-full md:w-1/2 p-8 space-y-8 bg-slate-900/40 border-r border-white/5">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                   <Calculator className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Magnitude Calculator</h3>
             </div>

             <div className="space-y-6">
                <div className="space-y-3">
                   <div className="flex justify-between text-[10px] uppercase font-black">
                      <span className="text-slate-500 flex items-center gap-2"><Users className="w-3 h-3"/> Team Size</span>
                      <span className="text-white">{teamSize} Engineers</span>
                   </div>
                   <input 
                     type="range" min="5" max="500" step="5"
                     value={teamSize} 
                     onChange={(e) => setTeamSize(Number(e.target.value))}
                     className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                   />
                </div>

                <div className="space-y-3">
                   <div className="flex justify-between text-[10px] uppercase font-black">
                      <span className="text-slate-500 flex items-center gap-2">£ Avg. Salary</span>
                      <span className="text-white">£{(avgSalary/1000).toFixed(0)}k</span>
                   </div>
                   <input 
                     type="range" min="40000" max="250000" step="5000"
                     value={avgSalary} 
                     onChange={(e) => setAvgSalary(Number(e.target.value))}
                     className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                   />
                </div>
             </div>

             <div className="pt-8 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-3 text-[9px] text-slate-500 uppercase font-black">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" /> Security Risk Avoidance Integrated
                </div>
                <div className="flex items-center gap-3 text-[9px] text-slate-500 uppercase font-black">
                   <TrendingUp className="w-4 h-4 text-blue-500" /> Efficiency Gain: 25% (Min)
                </div>
             </div>
          </div>

          {/* Results Panel */}
          <div className="w-full md:w-1/2 p-8 bg-blue-950/10 flex flex-col justify-between">
             <AnimatePresence mode="wait">
                {!showCapture ? (
                   <motion.div 
                     key="results"
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 1.05 }}
                     className="space-y-8"
                   >
                      <div className="space-y-2">
                         <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">Projected Annual Magnitude</p>
                         <h4 className="text-5xl font-black text-white tracking-tighter">£{metrics.totalAnnualImpact.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
                         <p className="text-[9px] text-slate-500 uppercase font-bold italic tracking-widest">Calculated using InfraConnect Efficiency Metrics</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-8">
                         <div className="space-y-1">
                            <p className="text-[10px] text-slate-500 uppercase font-black">Velocity Gain</p>
                            <p className="text-sm font-black text-white">£{(metrics.annualVelocityValue / 1000).toFixed(0)}k</p>
                         </div>
                         <div className="text-right space-y-1">
                            <p className="text-[10px] text-slate-500 uppercase font-black">5-Year Impact</p>
                            <p className="text-sm font-black text-blue-400">£{(metrics.fiveYearImpact / 1000000).toFixed(1)}M</p>
                         </div>
                      </div>

                      <Button 
                        onClick={() => setShowCapture(true)}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase py-6 rounded-none flex gap-3 shadow-[0_0_30px_rgba(37,99,235,0.3)]"
                      >
                         Secure this analysis <ArrowRight className="w-4 h-4" />
                      </Button>
                   </motion.div>
                ) : (
                   <motion.div 
                     key="capture"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="space-y-6"
                   >
                      <div className="space-y-2">
                         <h4 className="text-xl font-black text-white uppercase tracking-tight">Lock in your ROI</h4>
                         <p className="text-xs text-slate-500 uppercase tracking-widest leading-relaxed">Enter your professional email to receive the full strategic ecosystem brief.</p>
                      </div>
                      <form onSubmit={handleCapture} className="space-y-4">
                         <input 
                           required type="email" placeholder="YOUR@COMPANY.COM"
                           value={email} onChange={(e) => setEmail(e.target.value)}
                           className="w-full h-12 bg-black border border-slate-800 p-4 text-xs font-black text-white uppercase outline-none focus:border-blue-500 transition-colors"
                         />
                         <Button className="w-full bg-white text-black hover:bg-slate-200 text-[10px] font-black uppercase py-4 rounded-none">
                            Generate Full Strategy
                         </Button>
                         <button 
                           type="button" onClick={() => setShowCapture(false)}
                           className="w-full text-[9px] text-slate-600 font-bold uppercase hover:text-slate-400 transition-colors"
                         >
                            Back to results
                         </button>
                      </form>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>
       </div>
    </div>
  );
}
