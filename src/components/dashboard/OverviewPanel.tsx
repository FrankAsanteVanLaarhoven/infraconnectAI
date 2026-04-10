'use client';

import { useMemoryStore } from '@/store/memory-store';
import { GlassPanel } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LEVEL_LABELS, PLANE_LABELS, SKILL_LABELS } from '@/lib/memory/types';
import type { MemoryLevel, MemoryPlane } from '@/lib/memory/types';
import {
  Cpu, Database, Shield, Layers, ArrowUpCircle, TrendingUp,
  Zap, FileText, Globe, Archive, Activity
} from 'lucide-react';

const PLANE_ICONS: Record<MemoryPlane, React.ComponentType<{ className?: string }>> = {
  execution: Cpu,
  memory: Database,
  governance: Shield,
};

const LEVEL_ICONS: Record<MemoryLevel, React.ComponentType<{ className?: string }>> = {
  L0: Archive,
  L1: FileText,
  L2: Globe,
};

function StatCard({ label, value, sub, icon: Icon, color, delay = 0 }: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass-subtle rounded-xl p-4 hover:glass-hover transition-all duration-300 group"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', color)}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase">
          {label}
        </span>
      </div>
      <div className="text-2xl font-semibold tabular-nums tracking-tight">{value}</div>
      {sub && <div className="text-mono-xs text-muted-foreground/60 mt-0.5">{sub}</div>}
    </motion.div>
  );
}

function StrataBar({ level, count, maxCount, delay = 0 }: {
  level: MemoryLevel;
  count: number;
  maxCount: number;
  delay?: number;
}) {
  const Icon = LEVEL_ICONS[level];
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-3.5 h-3.5', `text-${level.toLowerCase()}`)} />
          <span className="text-xs font-medium">{LEVEL_LABELS[level]}</span>
          <span className="text-mono-xs text-muted-foreground/50">{level}</span>
        </div>
        <span className="text-mono-xs text-foreground tabular-nums">{count}</span>
      </div>
      <div className="h-2 rounded-full bg-glass-border overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', `bg-${level.toLowerCase()}`)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  );
}

export function OverviewPanel() {
  const { nodes, health, skillRuns } = useMemoryStore();

  const l0Count = nodes.filter(n => n.level === 'L0').length;
  const l1Count = nodes.filter(n => n.level === 'L1').length;
  const l2Count = nodes.filter(n => n.level === 'L2').length;
  const maxLevelCount = Math.max(l0Count, l1Count, l2Count, 1);

  const completedRuns = skillRuns.filter(r => r.status === 'completed').length;
  const failedRuns = skillRuns.filter(r => r.status === 'failed').length;
  const runningRuns = skillRuns.filter(r => r.status === 'running').length;

  return (
    <GlassPanel variant="strong" glow className="space-y-6">
      {/* Hero */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-matrix/15 flex items-center justify-center">
            <Layers className="w-5 h-5 text-matrix" />
          </div>
          <div>
            <h2 className="display-md">Memory DevOps</h2>
            <p className="text-xs text-muted-foreground">
              Memory managed like code — spec&apos;d, tested, reviewed, versioned &amp; shipped
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-mono-xs text-premium text-matrix/60 tracking-widest uppercase">
            VLA Development Lifecycle
          </span>
          <span className="text-muted-foreground/30">·</span>
          <span className="text-mono-xs text-muted-foreground/50">Autonomous Systems</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Nodes" value={nodes.length} sub="across all planes" icon={Database} color="bg-l1/15 text-l1" delay={0.05} />
        <StatCard label="Completed" value={completedRuns} sub="skill runs" icon={Activity} color="bg-matrix/15 text-matrix" delay={0.1} />
        <StatCard label="Canonical" value={l2Count} sub="shipped knowledge" icon={Globe} color="bg-l2/15 text-l2" delay={0.15} />
        <StatCard label="Health" value={health ? `${(health.overall * 100).toFixed(0)}%` : '—'} sub="overall score" icon={TrendingUp} color="bg-matrix/15 text-matrix" delay={0.2} />
      </div>

      {/* Three Planes */}
      <div className="space-y-3">
        <h3 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase">
          Three Planes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['execution', 'memory', 'governance'] as MemoryPlane[]).map((plane, i) => {
            const Icon = PLANE_ICONS[plane];
            const count = nodes.filter(n => n.plane === plane).length;
            const avgHealth = health?.byPlane[plane]?.avgHealth ?? 0;
            return (
              <motion.div
                key={plane}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                className="glass-subtle rounded-lg p-3 hover:glass-hover transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn('w-4 h-4')} style={{ color: `var(--${plane}-color)` }} />
                  <span className="text-xs font-medium">{PLANE_LABELS[plane]}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-xl font-semibold tabular-nums">{count}</span>
                  {avgHealth > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-1.5 rounded-full bg-glass-border overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${avgHealth * 100}%`,
                            background: `var(--${plane}-color)`,
                          }}
                        />
                      </div>
                      <span className="text-mono-xs text-muted-foreground/50">{(avgHealth * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Memory Strata */}
      <div className="space-y-3">
        <h3 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase">
          Memory Strata
        </h3>
        <div className="space-y-3">
          <StrataBar level="L0" count={l0Count} maxCount={maxLevelCount} delay={0.4} />
          <StrataBar level="L1" count={l1Count} maxCount={maxLevelCount} delay={0.45} />
          <StrataBar level="L2" count={l2Count} maxCount={maxLevelCount} delay={0.5} />
        </div>
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground/50">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-l0" /> Raw artifacts
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-l1" /> Structured wiki
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-l2" /> Canonical
          </span>
        </div>
      </div>

      {/* VLA Context */}
      <div className="glass-subtle rounded-lg p-4 border border-glass-border">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3.5 h-3.5 text-execution" />
          <span className="text-xs font-semibold">Active Context</span>
          <span className="text-mono-xs text-muted-foreground/50 ml-auto">VLA Development</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Vision-Language-Action model lifecycle for autonomous systems. This workspace manages
          specifications, safety standards, testing protocols, and deployment checklists for
          VLA agents operating in real-world robotics environments.
        </p>
      </div>
    </GlassPanel>
  );
}
