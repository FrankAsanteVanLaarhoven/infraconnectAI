'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  label: string;
  type: 'prompt' | 'system' | 'result';
  hasDot: boolean;
  status?: 'complete' | 'busy' | 'error' | 'stable';
}

// Mock timeline data to represent chat/prompt history
const MOCK_EVENTS: TimelineEvent[] = Array.from({ length: 40 }).map((_, i) => {
  // Randomly assign some events to have dots (like significant prompts)
  const isSignificant = i % 4 === 2;
  
  // Assign random statuses for demonstration
  let status: TimelineEvent['status'] = 'stable';
  if (isSignificant) {
    if (i % 3 === 0) status = 'error';
    else if (i % 3 === 1) status = 'busy';
    else status = 'complete';
  }

  return {
    id: `event-${i}`,
    label: isSignificant ? `Executed tactical command sequence #${i} [${status?.toUpperCase()}]` : `System tick ${i}`,
    type: isSignificant ? 'prompt' : 'system',
    hasDot: isSignificant,
    status: isSignificant ? status : undefined,
  };
});

// Override specific ones to match the screenshot vibe
MOCK_EVENTS[15].label = "a significant strategic advancement for InfraConnect...";
MOCK_EVENTS[15].hasDot = true;
MOCK_EVENTS[15].status = 'stable';

import { usePathname } from 'next/navigation';

export function ProjectTimeline() {
  const pathname = usePathname();
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  if (pathname === '/' || pathname === '/theatre' || pathname === '/live-demo' || pathname?.startsWith('/docs')) {
    return null;
  }

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] flex flex-col items-center gap-1.5 font-mono">
      {/* Up Arrow */}
      <button className="text-slate-600 hover:text-slate-300 transition-colors mb-2">
        <ChevronUp className="w-4 h-4" />
      </button>

      {/* Timeline Track */}
      <div className="flex flex-col items-center gap-[6px] relative">
        {MOCK_EVENTS.map((event) => {
          // Determine dot color based on status
          let dotColor = "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] group-hover:bg-blue-400"; // stable/default
          if (event.status === 'complete') dotColor = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:bg-emerald-400";
          if (event.status === 'busy') dotColor = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] group-hover:bg-amber-400";
          if (event.status === 'error') dotColor = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] group-hover:bg-red-400";

          return (
            <div
              key={event.id}
              className="relative flex items-center justify-center w-6 h-1 group cursor-pointer"
              onMouseEnter={() => setHoveredEvent(event.id)}
              onMouseLeave={() => setHoveredEvent(null)}
            >
              {/* The dash or dot */}
              {event.hasDot ? (
                <div className={`w-1.5 h-1.5 rounded-none transition-all group-hover:scale-150 ${dotColor}`} />
              ) : (
                <div className="w-2.5 h-[1px] bg-slate-700 group-hover:bg-slate-500 transition-colors" />
              )}

            {/* Tooltip */}
            <AnimatePresence>
              {hoveredEvent === event.id && event.hasDot && (
                <motion.div
                  initial={{ opacity: 0, x: 10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 5, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-8 top-1/2 -translate-y-1/2 w-max max-w-[280px] bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded-sm shadow-2xl z-[110]"
                >
                  <p className="text-xs text-slate-300 leading-relaxed font-sans font-light tracking-wide">
                    {event.label}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          );
        })}
      </div>

      {/* Down Arrow */}
      <button className="text-slate-600 hover:text-slate-300 transition-colors mt-2">
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
}
