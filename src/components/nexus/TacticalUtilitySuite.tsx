"use client";

import React, { useState, useEffect } from 'react';
import { Clock, CloudSun, Calculator, Calendar, DollarSign, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/components/providers/LocalizationProvider';

export function TacticalUtilitySuite() {
  const { t } = useTranslation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 font-mono">
      {/* WORLD CLOCK */}
      <div className="bg-black/40 border border-slate-800 p-4 rounded flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] text-cyan-500 uppercase tracking-widest font-bold">
          <Clock className="w-3 h-3" />
          {t('widget.clock')}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500">LONDON</span>
            <span className="text-sm font-bold text-white">{time.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour12: false })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500">NEW YORK</span>
            <span className="text-sm font-bold text-slate-300">{time.toLocaleTimeString('en-GB', { timeZone: 'America/New_York', hour12: false })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500">TOKYO</span>
            <span className="text-sm font-bold text-slate-300">{time.toLocaleTimeString('en-GB', { timeZone: 'Asia/Tokyo', hour12: false })}</span>
          </div>
        </div>
      </div>

      {/* MISSION WEATHER (Simulated) */}
      <div className="bg-black/40 border border-slate-800 p-4 rounded flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] text-amber-500 uppercase tracking-widest font-bold">
          <CloudSun className="w-3 h-3" />
          {t('widget.weather')}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-black text-white">18°C</span>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase">{t('weather.partly_cloudy')}</span>
            <span className="text-[9px] text-slate-600 tracking-tighter italic">{t('weather.last_refreshed')}: T+00:45</span>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1 mt-2">
          {['M', 'T', 'W', 'T', 'F'].map((d, i) => (
            <div key={`weather-day-${i}`} className="flex flex-col items-center">
              <span className="text-[8px] text-slate-600">{d}</span>
              <span className="text-[10px] text-slate-300">{16 + i}°</span>
            </div>
          ))}
        </div>
      </div>

      {/* CURRENCY MATRIX */}
      <div className="bg-black/40 border border-slate-800 p-4 rounded flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] text-emerald-500 uppercase tracking-widest font-bold">
          <DollarSign className="w-3 h-3" />
          {t('widget.currency')}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="text-[10px] text-slate-500">USD/EUR</span>
            <span className="text-[11px] font-bold text-white">0.9341</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <span className="text-[10px] text-slate-500">GBP/USD</span>
            <span className="text-[11px] font-bold text-white">1.2505</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500">BTC/USD</span>
            <span className="text-[11px] font-black text-cyan-400">64,281.0</span>
          </div>
        </div>
      </div>

      {/* NEURAL CALCULATOR */}
      <div className="bg-black/40 border border-slate-800 p-4 rounded flex flex-col gap-2 col-span-1 md:col-span-2">
        <div className="flex items-center gap-2 text-[10px] text-indigo-500 uppercase tracking-widest font-bold">
          <Calculator className="w-3 h-3" />
          {t('widget.calculator')}
        </div>
        <div className="flex flex-col gap-2">
          <div className="bg-black/80 border border-slate-800 p-2 text-right text-lg font-bold text-white tracking-widest h-10 flex items-center justify-end">
            0.00
          </div>
          <div className="grid grid-cols-4 gap-2">
             {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].map((key, i) => (
               <button key={`calc-key-${key}-${i}`} className="bg-slate-900/50 hover:bg-slate-800 border border-white/5 p-2 text-[10px] font-bold transition-all">
                 {key}
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* OP_CALENDAR */}
      <div className="bg-black/40 border border-slate-800 p-4 rounded flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] text-purple-500 uppercase tracking-widest font-bold">
          <Calendar className="w-3 h-3" />
          {t('widget.calendar')}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['S','M','T','W','T','F','S'].map((d, i) => <span key={`cal-head-${d}-${i}`} className="text-[8px] text-slate-600 font-bold">{d}</span>)}
          {Array.from({length: 31}).map((_, i) => (
            <span key={`cal-day-${i}`} className={`text-[9px] p-1 ${i+1 === 14 ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/50' : 'text-slate-500'}`}>
              {i+1}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
