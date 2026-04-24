"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  TrendingUp, 
  Target, 
  ArrowRight, 
  Activity, 
  Lock, 
  Zap, 
  Calculator,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MatrixRain } from "@/components/ui/matrix-rain";
import { InfraConnectLogo } from '@/components/ui/InfraConnectLogo';

export default function DealPortalPage({ params }: { params: { id: string } }) {
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [onboarding, setOnboarding] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDeal() {
      try {
        const res = await fetch(`/api/deals/${params.id}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setDeal(data);
        if (data.status === 'closed') {
           setOnboarding("RETRIEVING_ONBOARDING_DATA...");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDeal();
  }, [params.id]);

  const handleFinalize = async () => {
    setIsClosing(true);
    try {
      const res = await fetch(`/api/deals/${params.id}/close`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setOnboarding(data.onboardingBrief);
        setDeal({ ...deal, status: 'closed' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsClosing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
       <MatrixRain className="opacity-10" color="#3b82f6" />
       <div className="w-16 h-16 border-t-2 border-blue-500 rounded-sm animate-spin" />
       <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em]">Synchronizing Deal Intelligence...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center space-y-6">
       <Lock className="w-12 h-12 text-red-500 opacity-50" />
       <div className="space-y-2">
          <h1 className="text-xl font-black text-white uppercase tracking-tighter">Access Denied // Authentication Required</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest">{error}</p>
       </div>
       <Button onClick={() => window.location.href = '/'} variant="outline" className="rounded-none text-[10px] uppercase font-black tracking-widest">Return to Base</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-[#f8fafc] font-mono relative overflow-x-hidden">
      <MatrixRain className="opacity-10 mix-blend-screen" color="#3b82f6" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.05)_0%,#050505_100%)]" />

      {/* Hero Header */}
      <nav className="relative z-50 w-full flex items-center justify-between p-8 md:px-12">
        <InfraConnectLogo variant="flat" size="sm" />
        <div className="flex items-center gap-4">
           <span className="w-2 h-2 rounded-sm bg-slate-800" />
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Confidential Proposal // {new Date(deal.updatedAt).toLocaleDateString()}</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-20 space-y-24">
         
         {/* Welcome Section */}
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="space-y-6 text-center"
         >
            <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/5 px-4 py-1.5 rounded-sm text-[10px] uppercase font-black tracking-widest text-blue-400 mb-4">
               Strategic Executive Proposal
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase text-white tracking-widest leading-none">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">{deal.company}</span>
            </h1>
            <p className="text-slate-500 max-w-2xl mx-auto uppercase tracking-[0.4em] text-xs font-bold">
               Future-Proofing Your Industrial Ecosystem
            </p>
         </motion.div>

         {/* ROI Magnitude Section */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
               <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                     <Calculator className="w-6 h-6 text-blue-500" /> Financial Destination
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed uppercase tracking-wider">
                     Our analysis indicates a massive efficiency corridor for your engineering teams. By sharding inference across your industrial edge, we unlock £{deal.roi.totalAnnualImpact.toLocaleString()} in annual magnitude.
                  </p>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-sm space-y-2">
                     <p className="text-[10px] text-slate-500 uppercase font-black">Annual Impact</p>
                     <p className="text-3xl font-black text-white">£{(deal.roi.totalAnnualImpact / 1000).toFixed(0)}k</p>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-sm space-y-2">
                     <p className="text-[10px] text-slate-500 uppercase font-black">Payback Tier</p>
                     <p className="text-3xl font-black text-slate-300">{deal.roi.paybackMonths.toFixed(1)}m</p>
                  </div>
               </div>
            </div>

            <div className="bg-blue-600/5 border border-blue-500/20 p-12 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -translate-y-32 translate-x-32" />
                <div className="relative z-10 space-y-6">
                   <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">Projected 3-Year ROI</p>
                   <h4 className="text-8xl font-black text-white tracking-tighter">{(deal.roi.threeYearROI * 100).toFixed(0)}%</h4>
                   <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Verified Infrastructure Value Acquisition</p>
                </div>
            </div>
         </div>

         {/* Strategic Thesis */}
         <div className="space-y-12">
            <div className="flex items-center gap-6">
               <div className="h-px bg-white/10 flex-1" />
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.5em]">Executive Strategic Brief</h3>
               <div className="h-px bg-white/10 flex-1" />
            </div>

            <div className="bg-white/5 border border-white/10 p-12 rounded-none relative">
               <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
               </div>
               <div className="prose prose-invert max-w-none text-slate-400 font-mono text-sm leading-8 whitespace-pre-wrap">
                  {deal.strategicBrief || "Our strategic synthesis for this deal is currently being finalized. Please check back in a few moments."}
               </div>
            </div>
         </div>

         {/* Call to Action or Victory View */}
         <AnimatePresence mode="wait">
            {deal.status === 'closed' ? (
               <motion.div 
                 key="victory"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="pt-20 space-y-12"
               >
                  <div className="flex flex-col items-center gap-6">
                     <div className="w-24 h-24 rounded-sm bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                        <Lock className="w-10 h-10 text-slate-300" />
                     </div>
                     <div className="text-center space-y-2">
                        <h3 className="text-4xl font-black text-white uppercase tracking-widest">Protocol Secured</h3>
                        <p className="text-slate-300 text-xs font-black uppercase tracking-[0.3em]">Neural Grid Membership: ACTIVE</p>
                     </div>
                  </div>

                  <div className="bg-slate-800 border border-slate-700 p-12 rounded-none max-w-3xl mx-auto backdrop-blur-xl">
                      <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                         <Activity className="w-3 h-3" /> Initializing Executive Onboarding
                      </p>
                      <div className="prose prose-invert max-w-none text-slate-300 font-mono text-xs leading-8 whitespace-pre-wrap opacity-80">
                         {onboarding || "Allocating secure resources..."}
                      </div>
                  </div>

                  <div className="flex justify-center gap-6">
                     <Button onClick={() => window.print()} variant="outline" className="border-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest px-8">Download Briefing</Button>
                     <Button onClick={() => window.location.href = '/dashboard/briefing'} className="bg-slate-800 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-8">Access Portal</Button>
                  </div>
               </motion.div>
            ) : (
               <motion.div 
                 key="cta"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="pt-20 text-center space-y-12"
               >
                  <div className="flex flex-col items-center gap-4">
                     <h3 className="text-3xl font-black text-white uppercase tracking-widest">Secure Your Deployment Slot</h3>
                     <p className="text-slate-500 text-xs uppercase tracking-widest">Phase 1 Integration: Q2 2026</p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                     <Button 
                       disabled={isClosing}
                       onClick={handleFinalize}
                       className="bg-white text-black hover:bg-slate-200 px-12 py-8 text-[12px] font-black uppercase tracking-[0.2em] rounded-none group"
                     >
                        {isClosing ? 'SECURING...' : 'Finalize Agreement'} <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-2 transition-transform" />
                     </Button>
                     <Button variant="outline" className="border-slate-800 text-slate-400 px-12 py-8 text-[12px] font-black uppercase tracking-[0.2em] rounded-none flex gap-4">
                        <Calendar className="w-5 h-5" /> Schedule Verification
                     </Button>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

      </main>

      <footer className="p-12 text-center border-t border-white/5 bg-black/40">
         <div className="flex items-center justify-center gap-8 mb-8 grayscale opacity-30">
            <ShieldCheck className="w-6 h-6" />
            <Activity className="w-6 h-6" />
            <Target className="w-6 h-6" />
         </div>
         <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest">InfraConnectAI // Autonomous Governance // All Rights Reserved 2026</p>
      </footer>
    </div>
  );
}
