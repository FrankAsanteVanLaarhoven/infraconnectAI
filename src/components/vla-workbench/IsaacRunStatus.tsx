'use client';

import { motion } from 'framer-motion';

/**
 * IsaacRunStatus — Live run status header with animated gauges.
 * Shows: Physics Score, Data Quality, Training Progress
 */

interface IsaacRunStatusProps {
  run: {
    id: string;
    status: string;
    totalEpisodes: number;
    physicsScoreAvg: number;
    dataQualityScoreAvg: number;
    highLossCount: number;
    prunedCount: number;
    numEnvs: number;
    sceneUsd: string;
  } | null;
  onPause: () => void;
  onResume: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  RUNNING:               { bg: 'bg-slate-800', text: 'text-slate-300', glow: 'shadow-emerald-500/30' },
  QUEUED:                { bg: 'bg-blue-500/20',    text: 'text-blue-400',    glow: 'shadow-blue-500/30' },
  PAUSED_FOR_DATA_ISSUE: { bg: 'bg-amber-500/20',  text: 'text-amber-400',   glow: 'shadow-amber-500/30' },
  PAUSED_FOR_PHYSICS:    { bg: 'bg-orange-500/20',  text: 'text-orange-400',  glow: 'shadow-orange-500/30' },
  COMPLETED:             { bg: 'bg-cyan-500/20',    text: 'text-cyan-400',    glow: 'shadow-cyan-500/30' },
  FAILED_PHYSICS:        { bg: 'bg-red-500/20',     text: 'text-red-400',     glow: 'shadow-red-500/30' },
  ARCHIVED:              { bg: 'bg-gray-500/20',    text: 'text-gray-400',    glow: 'shadow-gray-500/30' },
};

function GaugeRing({ value, label, color, size = 80 }: { value: number; label: string; color: string; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(value, 1));

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
          <motion.circle
            cx={size/2} cy={size/2} r={radius}
            fill="none" stroke={color} strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white/90">{(value * 100).toFixed(0)}%</span>
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-white/50">{label}</span>
    </div>
  );
}

export default function IsaacRunStatus({ run, onPause, onResume }: IsaacRunStatusProps) {
  if (!run) {
    return (
      <div className="rounded-none border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 text-center">
        <p className="text-white/40 text-sm">No Isaac Lab run selected. Launch one from the controls below.</p>
      </div>
    );
  }

  const statusStyle = STATUS_COLORS[run.status] || STATUS_COLORS.QUEUED;
  const isPaused = run.status.startsWith('PAUSED');
  const isRunning = run.status === 'RUNNING';
  const pruneRatio = run.totalEpisodes > 0 ? run.prunedCount / run.totalEpisodes : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-none border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 shadow-lg ${statusStyle.glow}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`h-2.5 w-2.5 rounded-sm ${statusStyle.bg} ${isRunning ? '' : ''}`}>
            <div className={`h-2.5 w-2.5 rounded-sm ${statusStyle.bg.replace('/20', '/60')}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/90">Run {run.id.slice(-8).toUpperCase()}</h3>
            <p className="text-[10px] text-white/40 font-mono">{run.sceneUsd}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${statusStyle.bg} ${statusStyle.text}`}>
            {run.status.replace(/_/g, ' ')}
          </span>

          {isRunning && (
            <button
              onClick={onPause}
              className="px-3 py-1 rounded-sm bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-500/30 transition-colors"
            >
              Pause
            </button>
          )}
          {isPaused && (
            <button
              onClick={onResume}
              className="px-3 py-1 rounded-sm bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
            >
              Resume
            </button>
          )}
        </div>
      </div>

      {/* Gauges */}
      <div className="flex items-center justify-around">
        <GaugeRing value={run.physicsScoreAvg} label="Physics" color="#06b6d4" />
        <GaugeRing value={run.dataQualityScoreAvg} label="Data Quality" color="#a78bfa" />
        <GaugeRing value={1 - pruneRatio} label="Retention" color={pruneRatio > 0.2 ? '#f59e0b' : '#22c55e'} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/5">
        {[
          { label: 'Episodes', value: run.totalEpisodes },
          { label: 'Envs', value: run.numEnvs },
          { label: 'High Loss', value: run.highLossCount },
          { label: 'Pruned', value: run.prunedCount },
        ].map(stat => (
          <div key={stat.label} className="text-center">
            <p className="text-lg font-bold text-white/90">{stat.value}</p>
            <p className="text-[9px] uppercase tracking-wider text-white/40">{stat.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
