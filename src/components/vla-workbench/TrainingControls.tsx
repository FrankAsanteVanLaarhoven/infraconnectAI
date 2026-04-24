'use client';

import { motion } from 'framer-motion';

/**
 * TrainingControls — Top-bar training action controls.
 * Start/Pause/Refresh controls for the VLA Workbench.
 */

interface TrainingControlsProps {
  onRefresh: () => void;
  isRunning?: boolean;
}

export default function TrainingControls({ onRefresh, isRunning }: TrainingControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onRefresh}
        className="px-3 py-1.5 rounded-sm bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white/50 hover:bg-white/10 hover:text-white/80 transition-all"
      >
        ↻ Refresh
      </button>

      {isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-800 border border-slate-700"
        >
          <div className="h-1.5 w-1.5 rounded-sm bg-slate-800" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Live</span>
        </motion.div>
      )}
    </div>
  );
}
