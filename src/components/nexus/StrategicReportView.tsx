"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, TrendingUp, Cpu, Database, Users, Settings, Zap, ChevronLeft, ChevronRight, BarChart4, Factory, Brain } from 'lucide-react';
import { FIVE_FACTORS } from '@/lib/nexus/swarm';
import { useTranslation } from '@/components/providers/LocalizationProvider';

export function StrategicReportView() {
  const { t, isRtl } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'cover',
      title: t('swarm.productivity_mandate'),
      subtitle: t('swarm.transforming_enterprise'),
      footer: t('swarm.csuite_footer'),
      content: (
        <div className="space-y-6">
           <div className={`border-l-4 ${isRtl ? 'border-r-4 border-l-0 pr-6 pl-0' : 'pl-6 pr-0'} border-indigo-500 py-4 bg-indigo-500/5`}>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{t('report.exec_summary_title')}</h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                 {t('swarm.exec_desc')}
              </p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
                 <p className="text-3xl font-black text-red-500 mb-2">{t('report.sales_at_risk')}</p>
                 <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t('swarm.global_sales_risk')}</p>
                 <p className="text-xs text-slate-400 mt-4 leading-relaxed line-clamp-3">
                    {t('report.sales_risk_desc')}
                 </p>
              </div>
              <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
                 <p className="text-3xl font-black text-indigo-400 mb-2">{t('report.adoption_surge_val')}</p>
                 <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t('swarm.adoption_surge')}</p>
                 <p className="text-xs text-slate-400 mt-4 leading-relaxed line-clamp-3">
                    {t('report.adoption_desc')}
                 </p>
              </div>
           </div>
        </div>
      )
    },
    {
      id: 'factors',
      title: t('swarm.separating_leaders'),
      subtitle: t('swarm.blueprint_ai'),
      footer: t('swarm.csuite_footer'),
      content: (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
           {FIVE_FACTORS.map((f) => (
              <div key={f.id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl flex flex-col items-center text-center group hover:border-indigo-500/40 transition-all">
                 <div className="text-3xl font-black text-slate-800 group-hover:text-indigo-500/50 transition-colors mb-4">{f.id}</div>
                 <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    {f.id === '01' && <Database className="w-5 h-5" />}
                    {f.id === '02' && <Settings className="w-5 h-5" />}
                    {f.id === '03' && <Users className="w-5 h-5" />}
                    {f.id === '04' && <ShieldCheck className="w-5 h-5" />}
                    {f.id === '05' && <BarChart4 className="w-5 h-5" />}
                 </div>
                 <h4 className="text-[11px] font-black text-white uppercase mb-3 leading-tight h-10">{t(`swarm.factor.${f.id}.title`) !== `swarm.factor.${f.id}.title` ? t(`swarm.factor.${f.id}.title`) : f.title}</h4>
                 <p className="text-[10px] text-slate-500 leading-tight">{t(`swarm.factor.${f.id}.desc`) !== `swarm.factor.${f.id}.desc` ? t(`swarm.factor.${f.id}.desc`) : f.desc}</p>
              </div>
           ))}
           <div className={`col-span-1 md:col-span-5 mt-12 bg-indigo-500/5 border border-indigo-500/20 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center ${isRtl ? 'md:flex-row-reverse' : ''}`}>
              <div>
                 <p className="text-xl font-black text-indigo-400 mb-1">{t('report.people_process_stat')}</p>
                 <p className="text-xs text-slate-400 uppercase font-bold">{t('report.people_process_desc')}</p>
              </div>
              <p className={`text-[10px] text-slate-600 font-mono tracking-tighter uppercase max-w-md ${isRtl ? 'text-left' : 'text-right'} mt-4 md:mt-0`}>
                 {t('report.blueprint_remark')}
              </p>
           </div>
        </div>
      )
    },
    {
      id: 'challenges',
      title: t('swarm.structural_inefficiencies'),
      subtitle: t('swarm.fragmented_data'),
      footer: t('swarm.csuite_footer'),
      content: (
        <div className="space-y-8 mt-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                 <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-500" /> {t('swarm.data_crisis')}
                 </h4>
                 <p className="text-xs text-slate-400 leading-relaxed">
                    {t('swarm.crisis_desc')}
                 </p>
                 <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                    <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-1">{t('swarm.opportunity_cost')}</p>
                    <p className="text-[10px] text-slate-400">{t('swarm.cost_desc')}</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-500" /> {t('swarm.predictive_shift')}
                 </h4>
                 <div className="grid grid-cols-1 gap-3">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                       <span className="text-[9px] text-slate-500 uppercase font-black">{t('swarm.iot_health')}</span>
                       <p className="text-lg font-black text-emerald-500">{t('report.predictive_accuracy')}</p>
                       <p className="text-[8px] text-slate-600 mt-1 uppercase">{t('swarm.vibration_signatures')}</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                       <span className="text-[9px] text-slate-500 uppercase font-black">{t('swarm.demand_prediction')}</span>
                       <p className="text-lg font-black text-cyan-500">{t('report.demand_gain')}</p>
                       <p className="text-[8px] text-slate-600 mt-1 uppercase">{t('swarm.weather_social')}</p>
                    </div>
                 </div>
              </div>
           </div>
           <div className="border-t border-slate-900 pt-6">
              <p className="text-[9px] text-slate-600 font-mono tracking-widest uppercase">
                 {t('swarm.inventory_opt')}
              </p>
           </div>
        </div>
      )
    },
    {
      id: 'case-studies',
      title: t('report.real_world_use_cases'),
      subtitle: t('report.tangible_outcomes'),
      footer: t('swarm.csuite_footer'),
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
           <div className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                    <Cpu className="w-6 h-6 text-emerald-500" />
                 </div>
                 <h3 className="text-lg font-black text-white uppercase tracking-tight">{t('report.digital_twin_title')}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                 {t('report.digital_twin_desc')}
              </p>
              <div className={`p-6 bg-emerald-500/5 ${isRtl ? 'border-r-4' : 'border-l-4'} border-emerald-500 rounded-xl`}>
                 <p className="text-2xl font-black text-white mb-1">{t('report.unilever_savings')}</p>
                 <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-4">{t('report.unilever_label')}</p>
                 <p className="text-[10px] text-slate-400 leading-tight">
                    {t('report.unilever_desc')}
                 </p>
              </div>
           </div>
           
           <div className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                    <Factory className="w-6 h-6 text-amber-500" />
                 </div>
                 <h3 className="text-lg font-black text-white uppercase tracking-tight">{t('report.robotics_title')}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                 {t('report.robotics_desc')}
              </p>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                    <p className="text-xl font-black text-amber-500 mb-1">{t('report.ups_savings')}</p>
                    <p className="text-[8px] text-slate-500 uppercase font-black">{t('report.ups_label')}</p>
                    <div className="mt-2 text-[9px] text-slate-400">{t('report.ups_desc')}</div>
                 </div>
                 <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                    <p className="text-xl font-black text-white mb-1">{t('report.defect_rate')}</p>
                    <p className="text-[8px] text-slate-500 uppercase font-black">{t('report.defect_label')}</p>
                    <div className="mt-2 text-[9px] text-slate-400">{t('report.defect_desc')}</div>
                 </div>
              </div>
           </div>
        </div>
      )
    }
  ];

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col font-sans select-none overflow-hidden relative" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Cinematic Sidebar Accent */}
      <div className={`absolute ${isRtl ? 'right-0' : 'left-0'} top-0 w-1 h-full bg-indigo-500/50 shadow-[0_0_20px_#6366f1]`} />

      {/* Header Bar */}
      <div className="p-10 pb-0 flex justify-between items-start z-10">
         <div className="space-y-1">
            <motion.h1 
               key={slides[currentSlide].title}
               initial={{ y: -20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="text-4xl font-black text-white tracking-tight uppercase"
            >
               {slides[currentSlide].title}
            </motion.h1>
            <p className="text-slate-500 font-mono text-[10px] tracking-[0.3em] uppercase">{slides[currentSlide].subtitle}</p>
         </div>
         <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-700 font-black">{t('report.header_remark')}</span>
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-10 flex flex-col justify-center">
         <AnimatePresence mode="wait">
            <motion.div 
               key={currentSlide}
               initial={{ x: isRtl ? -20 : 20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               exit={{ x: isRtl ? 20 : -20, opacity: 0 }}
               className="h-full pt-10"
            >
               {slides[currentSlide].content}
            </motion.div>
         </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="p-10 pt-0 flex justify-between items-center z-10">
         <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              className="p-3 rounded-full border border-slate-800 text-slate-500 hover:text-white hover:border-indigo-500/50 transition-all"
            >
               <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
            <div className="flex gap-2">
               {slides.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all ${currentSlide === i ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-800'}`} 
                  />
               ))}
            </div>
            <button 
              onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
              className="p-3 rounded-full border border-slate-800 text-slate-500 hover:text-white hover:border-indigo-500/50 transition-all"
            >
               <ChevronRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
         </div>
         
         <div className={isRtl ? 'text-left' : 'text-right'}>
            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{slides[currentSlide].footer || t('report.default_footer')}</p>
            <p className="text-[8px] text-slate-700 mt-1 uppercase font-bold">{t('report.platform_name')}</p>
         </div>
      </div>

      {/* Background Decorative Pattern */}
      <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} bottom-0 p-10 opacity-5 pointer-events-none`}>
         <Brain className="w-96 h-96 text-indigo-500 text-slate-900" />
      </div>
    </div>
  );
}
