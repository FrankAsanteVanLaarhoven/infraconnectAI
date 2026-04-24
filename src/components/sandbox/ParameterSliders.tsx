"use client";

import { useState } from "react";
import { SlidersHorizontal, Activity, Cpu, Zap } from "lucide-react";

interface SliderConfig {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  icon: any;
  color: string;
}

const DEFAULT_SLIDERS: SliderConfig[] = [
  { id: "aggression", label: "Aggression Matrix", min: 0, max: 100, step: 1, defaultValue: 65, icon: Zap, color: "text-amber-500" },
  { id: "inference", label: "Inference Threshold", min: 0.1, max: 1.0, step: 0.05, defaultValue: 0.85, icon: Cpu, color: "text-cyan-500" },
  { id: "velocity", label: "Motor Velocity", min: 0, max: 500, step: 10, defaultValue: 250, icon: Activity, color: "text-emerald-500" },
];

export function ParameterSliders() {
  const [values, setValues] = useState<Record<string, number>>(
    DEFAULT_SLIDERS.reduce((acc, slider) => ({ ...acc, [slider.id]: slider.defaultValue }), {})
  );

  const handleChange = (id: string, value: number) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    // In the future: emit to websocket to live-update agents/ROS
    // window.dispatchEvent(new CustomEvent('telemetry:update', { detail: { [id]: value } }));
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 bg-black/60 border-b border-slate-800">
        <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
        <span className="text-[11px] uppercase tracking-widest font-black text-slate-200">Telemetry Tuning</span>
      </div>

      {/* Sliders Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        {DEFAULT_SLIDERS.map((slider) => {
          const Icon = slider.icon;
          const val = values[slider.id];
          const percentage = ((val - slider.min) / (slider.max - slider.min)) * 100;

          return (
            <div key={slider.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${slider.color}`} />
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">{slider.label}</span>
                </div>
                <span className="text-xs font-bold font-mono text-white bg-slate-800/80 px-2 py-0.5 rounded-sm">
                  {val.toFixed(slider.step < 1 ? 2 : 0)}
                </span>
              </div>
              
              {/* Custom Track and Thumb */}
              <div className="relative w-full h-1.5 bg-slate-800 rounded-full">
                <div 
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-75 ${slider.color.replace('text-', 'bg-')}`}
                  style={{ width: `${percentage}%` }}
                />
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={val}
                  onChange={(e) => handleChange(slider.id, parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {/* Thumb Visualizer */}
                <div 
                  className={`absolute top-1/2 -mt-2 w-4 h-4 bg-white border-2 border-slate-900 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)] pointer-events-none`}
                  style={{ left: `calc(${percentage}% - 8px)` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
