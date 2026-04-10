'use client';

import { useMemoryStore } from '@/store/memory-store';
import { GlassPanel } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { MemoryLevel, MemoryPlane } from '@/lib/memory/types';
import { LEVEL_LABELS, PLANE_LABELS } from '@/lib/memory/types';
import { Activity, AlertTriangle, CheckCircle2, Clock, TrendingUp, XCircle } from 'lucide-react';

function HealthRing({ score, size = 120, strokeWidth = 6, label }: {
  score: number;
  size?: number;
  strokeWidth?: number;
  label: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - score * circumference;

  const color = score >= 0.8
    ? 'var(--matrix)'
    : score >= 0.5
      ? 'oklch(0.75 0.18 85)'
      : 'var(--destructive)';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="health-ring">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={strokeWidth} className="health-ring-track"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
        <text
          x={size / 2} y={size / 2}
          textAnchor="middle" dominantBaseline="central"
          className="fill-foreground"
          style={{ fontSize: size * 0.22, fontWeight: 600, fontFamily: 'var(--font-geist-mono)' }}
        >
          {(score * 100).toFixed(0)}%
        </text>
      </svg>
      <span className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase">
        {label}
      </span>
    </div>
  );
}

function MetricBar({ label, value, max = 1, invert = false, icon: Icon }: {
  label: string;
  value: number;
  max?: number;
  invert?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const good = invert ? value <= 0.3 : value >= 0.7;
  const color = good ? 'var(--matrix)' : value >= 0.5 ? 'oklch(0.75 0.18 85)' : 'var(--destructive)';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          {Icon && <Icon className="w-3 h-3" />}
          {label}
        </span>
        <span className="text-mono-xs text-foreground tabular-nums">{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-glass-border overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

export function HealthPanel() {
  const { health, nodes } = useMemoryStore();

  if (!health) {
    return (
      <GlassPanel variant="strong" className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <Activity className="w-8 h-8 text-matrix/40 mx-auto animate-breathe" />
          <p className="text-xs text-muted-foreground">Computing health metrics...</p>
        </div>
      </GlassPanel>
    );
  }

  const levels: MemoryLevel[] = ['L0', 'L1', 'L2'];
  const planes: MemoryPlane[] = ['execution', 'memory', 'governance'];

  return (
    <GlassPanel variant="strong" className="h-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight">Memory Health</h3>
        <span className="text-mono-xs text-muted-foreground">{health.nodeCount} nodes</span>
      </div>

      {/* Main ring */}
      <div className="flex justify-center">
        <HealthRing score={health.overall} size={130} strokeWidth={7} label="Overall" />
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        <MetricBar label="Coverage" value={health.coverage} icon={CheckCircle2} />
        <MetricBar label="Conflict Density" value={health.conflictDensity} invert icon={AlertTriangle} />
        <MetricBar label="Staleness" value={health.staleness} invert icon={Clock} />
        <MetricBar label="Redundancy" value={health.redundancy} invert icon={XCircle} />
      </div>

      {/* By Level */}
      <div className="space-y-2">
        <h4 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase">
          By Memory Level
        </h4>
        <div className="space-y-2">
          {levels.map((level, i) => (
            <motion.div
              key={level}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="flex items-center gap-3"
            >
              <span className={cn('w-2 h-2 rounded-full shrink-0', `level-dot-${level.toLowerCase()}`)} />
              <span className="text-xs text-muted-foreground flex-1">{LEVEL_LABELS[level]}</span>
              <span className="text-mono-xs text-foreground tabular-nums">{health.byLevel[level]?.count ?? 0}</span>
              <div className="w-16 h-1 rounded-full bg-glass-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(health.byLevel[level]?.avgHealth ?? 0) * 100}%`,
                    background: `var(--${level.toLowerCase()}-color)`,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* By Plane */}
      <div className="space-y-2">
        <h4 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase">
          By Plane
        </h4>
        <div className="space-y-2">
          {planes.map((plane, i) => (
            <motion.div
              key={plane}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="flex items-center gap-3"
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{
                background: `var(--${plane}-color)`,
                boxShadow: `0 0 6px var(--${plane}-color)`,
              }} />
              <span className="text-xs text-muted-foreground flex-1">{PLANE_LABELS[plane]}</span>
              <span className="text-mono-xs text-foreground tabular-nums">{health.byPlane[plane]?.count ?? 0}</span>
              <div className="w-16 h-1 rounded-full bg-glass-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(health.byPlane[plane]?.avgHealth ?? 0) * 100}%`,
                    background: `var(--${plane}-color)`,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
