'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useMemoryStore } from '@/store/memory-store';
import { GlassPanel } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';
import { motion, useSpring, useTransform, useMotionValue, animate } from 'framer-motion';
import { LEVEL_LABELS, PLANE_LABELS, SKILL_LABELS } from '@/lib/memory/types';
import type { MemoryLevel, MemoryPlane, SkillName, MemoryNode } from '@/lib/memory/types';
import {
  Cpu, Database, Shield, Layers, ArrowUpCircle, TrendingUp,
  Zap, FileText, Globe, Archive, Activity, CircleDot,
  GitBranch, ClipboardCheck, Rocket, PenTool, FlaskConical,
  Eye, Ship, AlertTriangle, Radio, ChevronRight,
  BookOpen, Clock
} from 'lucide-react';
import { RevenueIntelligencePanel } from '@/components/revenue/RevenueIntelligencePanel';

/* ── Plane icons & colors ──────────────────────────────────────── */

const PLANE_ICONS: Record<MemoryPlane, React.ComponentType<{ className?: string }>> = {
  execution: Cpu,
  memory: Database,
  governance: Shield,
};

const PLANE_COLOR_CLASS: Record<MemoryPlane, string> = {
  execution: 'text-execution',
  memory: 'text-matrix',
  governance: 'text-governance',
};

const PLANE_BG_CLASS: Record<MemoryPlane, string> = {
  execution: 'bg-execution/15',
  memory: 'bg-matrix/15',
  governance: 'bg-governance/15',
};

/* ── Level icons ───────────────────────────────────────────────── */

const LEVEL_ICONS: Record<MemoryLevel, React.ComponentType<{ className?: string }>> = {
  L0: Archive,
  L1: FileText,
  L2: Globe,
};

/* ── Pipeline step config ──────────────────────────────────────── */

const PIPELINE_STEPS: { skill: SkillName; icon: React.ComponentType<{ className?: string }> }[] = [
  { skill: 'spec',   icon: PenTool },
  { skill: 'plan',   icon: ClipboardCheck },
  { skill: 'build',  icon: GitBranch },
  { skill: 'test',   icon: FlaskConical },
  { skill: 'review', icon: Eye },
  { skill: 'ship',   icon: Rocket },
];

/* ── Animated counter hook ─────────────────────────────────────── */

function useAnimatedCounter(target: number, duration = 800) {
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(motionVal, target, {
      duration: duration / 1000,
      ease: [0.16, 1, 0.3, 1],
    });
    const unsub = rounded.on('change', (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [target, duration, motionVal, rounded]);

  return display;
}

/* ── Mini ring sparkline ───────────────────────────────────────── */

function MiniRingSparkline({ value, size = 36 }: { value: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const animated = useAnimatedCounter(Math.round(value * 100), 1000);
  const offset = circ * (1 - value);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="health-ring">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={3} className="health-ring-track" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={3}
          strokeLinecap="round"
          className="health-ring-fill"
          stroke="var(--matrix)"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <span className="absolute text-[9px] font-medium tabular-nums text-foreground">
        {animated}
      </span>
    </div>
  );
}

/* ── Animated stat card ────────────────────────────────────────── */

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  delay = 0,
  children,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  delay?: number;
  children?: React.ReactNode;
}) {
  const numVal = typeof value === 'number' ? value : parseInt(value, 10);
  const safeNum = Number.isNaN(numVal) ? 0 : numVal;
  const animatedNum = useAnimatedCounter(safeNum, 900);
  const animated = Number.isNaN(numVal) ? String(value) : animatedNum;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass-subtle rounded-xl p-3 sm:p-4 hover:glass-hover transition-all duration-300 group"
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
          <Icon className={cn('w-3.5 h-3.5', iconColor)} />
        </div>
        <span className="text-[9px] text-premium text-muted-foreground tracking-widest uppercase leading-none">
          {label}
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-xl sm:text-2xl font-semibold tabular-nums tracking-tight">
          {animated}
        </span>
        {children}
      </div>
      {sub && <div className="text-mono-xs text-muted-foreground/60 mt-0.5">{sub}</div>}
    </motion.div>
  );
}

/* ── Plane card ────────────────────────────────────────────────── */

function PlaneCard({
  plane,
  nodes,
  avgHealth,
  delay,
  onClick,
}: {
  plane: MemoryPlane;
  nodes: MemoryNode[];
  avgHealth: number;
  delay: number;
  onClick: () => void;
}) {
  const Icon = PLANE_ICONS[plane];
  const count = nodes.length;

  const topCategories = useMemo(() => {
    const freq: Record<string, number> = {};
    nodes.forEach((n) => {
      freq[n.category] = (freq[n.category] ?? 0) + 1;
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);
  }, [nodes]);

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-subtle rounded-xl p-4 hover:glass-hover transition-all duration-300 text-left w-full group"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', PLANE_BG_CLASS[plane])}>
          <Icon className={cn('w-4 h-4', PLANE_COLOR_CLASS[plane])} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold">{PLANE_LABELS[plane]}</div>
          <div className="text-mono-xs text-muted-foreground/50">{count} nodes</div>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
      </div>

      {/* Health bar */}
      {avgHealth > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-mono-xs text-muted-foreground/50">Avg Health</span>
            <span className="text-mono-xs tabular-nums" style={{ color: `var(--${plane}-color)` }}>
              {(avgHealth * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-glass-border overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `var(--${plane}-color)` }}
              initial={{ width: 0 }}
              animate={{ width: `${avgHealth * 100}%` }}
              transition={{ duration: 0.8, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      )}

      {/* Top categories */}
      {topCategories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {topCategories.map((cat) => (
            <span
              key={cat}
              className="text-[9px] px-1.5 py-0.5 rounded-md bg-glass-border/50 text-muted-foreground/70"
            >
              {cat}
            </span>
          ))}
        </div>
      )}
    </motion.button>
  );
}

/* ── Strata bar with animated counter ──────────────────────────── */

function StrataBar({
  level,
  count,
  maxCount,
  delay = 0,
  onClick,
}: {
  level: MemoryLevel;
  count: number;
  maxCount: number;
  delay?: number;
  onClick?: () => void;
}) {
  const Icon = LEVEL_ICONS[level];
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  const animated = useAnimatedCounter(count, 700);

  return (
    <motion.button
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="space-y-1.5 text-left w-full group"
      style={{ transformOrigin: 'left' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-glass-border/30 group-hover:bg-glass-border/60 transition-colors">
            <Icon className={cn('w-3 h-3', `text-${level.toLowerCase()}`)} />
          </div>
          <span className="text-xs font-medium">{LEVEL_LABELS[level]}</span>
          <span className="text-mono-xs text-muted-foreground/50">{level}</span>
        </div>
        <motion.span
          className="text-sm font-semibold tabular-nums text-foreground"
          key={count}
          initial={{ opacity: 0.5, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {animated}
        </motion.span>
      </div>
      <div className="h-2.5 rounded-full bg-glass-border overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full relative', `bg-${level.toLowerCase()}`)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Shimmer effect on bar */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{ animation: 'shimmer 3s ease-in-out infinite', backgroundSize: '200% 100%' }}
            />
          </div>
        </motion.div>
      </div>
      <div className="text-[9px] text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
        {level === 'L0' && 'Raw artifacts · scratch space'}
        {level === 'L1' && 'Structured wiki · reviewed knowledge'}
        {level === 'L2' && 'Canonical · validated & shipped'}
      </div>
    </motion.button>
  );
}

/* ── Pipeline step ─────────────────────────────────────────────── */

function PipelineStep({
  skill,
  icon: Icon,
  lastRun,
  delay,
  onClick,
}: {
  skill: SkillName;
  icon: React.ComponentType<{ className?: string }>;
  lastRun: { status: string; createdAt: string } | null;
  delay: number;
  onClick: () => void;
}) {
  const statusColor =
    lastRun?.status === 'completed' ? 'bg-matrix' :
    lastRun?.status === 'running' ? 'bg-execution' :
    lastRun?.status === 'failed' ? 'bg-destructive' :
    'bg-muted-foreground/30';

  const statusPulse =
    lastRun?.status === 'running' ? 'animate-pulse' : '';

  const timeAgo = useMemo(() => {
    if (!lastRun?.createdAt) return 'never';
    const diff = Date.now() - new Date(lastRun.createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }, [lastRun?.createdAt]);

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 group relative z-10"
    >
      <div className="relative">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
          'bg-glass-border/30 group-hover:bg-matrix/15 group-hover:shadow-[0_0_12px_var(--matrix-glow)]'
        )}>
          <Icon className="w-4 h-4 text-muted-foreground/70 group-hover:text-matrix transition-colors" />
        </div>
        <span className={cn(
          'absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background',
          statusColor, statusPulse
        )} />
      </div>
      <span className="text-[9px] font-medium text-muted-foreground/70 group-hover:text-foreground transition-colors whitespace-nowrap">
        {SKILL_LABELS[skill]}
      </span>
      <span className="text-mono-xs text-muted-foreground/40">{timeAgo}</span>
    </motion.button>
  );
}

/* ══════════════════════════════════════════════════════════════════
   OverviewPanel — Mission Control & Agent Lifecycle Summary
   ══════════════════════════════════════════════════════════════════ */

export function OverviewPanel() {
  const { nodes, skillRuns, policies, openPanel, setActiveSkill } = useMemoryStore();
  
  const [dashboard, setDashboard] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);

  const loadProjections = useCallback(async () => {
    try {
      const [dashRes, healthRes] = await Promise.all([
        fetch('/api/projections/dashboard'),
        fetch('/api/health')
      ]);
      if (dashRes.ok) setDashboard(await dashRes.json());
      if (healthRes.ok) setHealth(await healthRes.json());
    } catch {}
  }, []);

  useEffect(() => {
    loadProjections();
    const id = setInterval(loadProjections, 15000);
    return () => clearInterval(id);
  }, [loadProjections]);

  /* ── Derived data ──────────────────────────────────────────── */
  const l0Count = dashboard?.scratchItems ?? 0;
  const l1Count = dashboard?.wikiEntries ?? 0;
  const l2Count = dashboard?.canonicalKnowledge ?? 0;
  const maxLevelCount = Math.max(l0Count, l1Count, l2Count, 1);
  const completedRuns = dashboard?.completedSkills ?? 0;
  const totalConflicts = dashboard?.activeConflicts ?? 0;
  const activePolicies = policies.filter((p) => p.active).length;

  const planeNodes = useMemo(() => ({
    execution: nodes.filter((n) => n.plane === 'execution'),
    memory: nodes.filter((n) => n.plane === 'memory'),
    governance: nodes.filter((n) => n.plane === 'governance'),
  }), [nodes]);

  const totalNodes = dashboard?.totalNodes ?? 0;

  const lastRunsBySkill = useMemo(() => {
    const map: Record<SkillName, { status: string; createdAt: string } | null> = {
      spec: null, plan: null, build: null, test: null, review: null, ship: null,
    };
    skillRuns.forEach((r) => {
      if (!map[r.skill] || new Date(r.createdAt) > new Date(map[r.skill]!.createdAt)) {
        map[r.skill] = { status: r.status, createdAt: r.createdAt };
      }
    });
    return map;
  }, [skillRuns]);

  const recentDecisions = useMemo(() => {
    return nodes
      .filter((n) => n.category === 'decisions' || n.category === 'projects')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);
  }, [nodes]);

  const healthScore = health?.health ?? 0;

  /* ── Live datetime ─────────────────────────────────────────── */
  const [datetime, setDatetime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setDatetime(
        now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase() +
        '  ' +
        now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' UTC'
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Handlers ──────────────────────────────────────────────── */
  const handlePlaneClick = useCallback(
    (plane: string) => {
      openPanel('explorer');
    },
    [openPanel]
  );

  const handleLevelClick = useCallback(
    (level: MemoryLevel) => {
      openPanel('explorer');
    },
    [openPanel]
  );

  const handlePipelineStepClick = useCallback(
    (skill: SkillName) => {
      openPanel('skills');
      setActiveSkill(skill);
    },
    [openPanel, setActiveSkill]
  );

  return (
    <GlassPanel variant="strong" glow className="space-y-6">
      {/* ═══ Hero Section ═══ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-mono-xs text-premium text-matrix/60 tracking-[0.2em]">
            InfraConnect
          </span>
          <span className="text-mono-xs text-muted-foreground/40">{datetime}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-matrix/10 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5 text-matrix" />
          </div>
          <div className="space-y-1">
            <h2 className="display-md text-gradient-matrix">Memory DevOps</h2>
            {/* Animated gradient underline */}
            <div className="h-[2px] w-32 rounded-full overflow-hidden bg-glass-border">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--matrix-dim), var(--matrix), var(--matrix-dim))' }}
                initial={{ width: '0%', opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-mono-xs text-premium text-muted-foreground tracking-widest uppercase">
            Industrial Agent Lifecycle
          </span>
          <span className="text-muted-foreground/30">·</span>
          <span className="text-mono-xs text-muted-foreground/50">Future DevOps Mission Control</span>
        </div>
      </div>

      {/* ═══ Stats Grid (2×2 mobile → 2×4 desktop) ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <StatCard
          label="Total Nodes"
          value={totalNodes}
          sub="across all planes"
          icon={Database}
          iconBg="bg-l1/15"
          iconColor="text-l1"
          delay={0.05}
        />
        <StatCard
          label="Completed Skills"
          value={completedRuns}
          sub="skill runs"
          icon={Activity}
          iconBg="bg-matrix/15"
          iconColor="text-matrix"
          delay={0.1}
        />
        <StatCard
          label="Canonical Knowledge"
          value={l2Count}
          sub="L2 shipped knowledge"
          icon={Globe}
          iconBg="bg-l2/15"
          iconColor="text-l2"
          delay={0.15}
        />
        <StatCard
          label="Health Score"
          value={health ? `${Math.round(healthScore * 100)}` : '—'}
          sub="overall system"
          icon={TrendingUp}
          iconBg="bg-matrix/15"
          iconColor="text-matrix"
          delay={0.2}
        >
          {health && <MiniRingSparkline value={healthScore} size={38} />}
        </StatCard>
        <StatCard
          label="Scratch Items"
          value={l0Count}
          sub="L0 raw artifacts"
          icon={Archive}
          iconBg="bg-l0/15"
          iconColor="text-l0"
          delay={0.25}
        />
        <StatCard
          label="Wiki Entries"
          value={l1Count}
          sub="L1 structured"
          icon={BookOpen}
          iconBg="bg-matrix/15"
          iconColor="text-matrix"
          delay={0.3}
        />
        <StatCard
          label="Active Conflicts"
          value={totalConflicts}
          sub={totalConflicts > 0 ? 'needs resolution' : 'no issues'}
          icon={AlertTriangle}
          iconBg={totalConflicts > 0 ? 'bg-destructive/15' : 'bg-matrix/15'}
          iconColor={totalConflicts > 0 ? 'text-destructive' : 'text-matrix'}
          delay={0.35}
        />
        <StatCard
          label="Agent Bus"
          value="—"
          sub="message bus status"
          icon={Radio}
          iconBg="bg-matrix/15"
          iconColor="text-matrix"
          delay={0.4}
        >
          <span className={cn(
            'text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ml-auto',
            dashboard?.busStatus === 'live' ? 'bg-matrix/15 text-matrix status-indicator-live' : 'bg-destructive/15 text-destructive'
          )}>
            {dashboard?.busStatus?.toUpperCase() ?? 'OFFLINE'}
          </span>
        </StatCard>
      </div>
      
      {/* ═══ Revenue Intelligence ═══ */}
      <RevenueIntelligencePanel />

      {/* ═══ Three Planes Visualization ═══ */}
      <div className="space-y-3">
        <h3 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase">
          Three Planes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {(['execution', 'memory', 'governance'] as MemoryPlane[]).map((plane, i) => (
            <PlaneCard
              key={plane}
              plane={plane}
              nodes={planeNodes[plane]}
              avgHealth={health?.byPlane?.[plane]?.avgHealth ?? 0}
              delay={0.3 + i * 0.07}
              onClick={() => handlePlaneClick(plane)}
            />
          ))}
        </div>
      </div>

      {/* ═══ Memory Strata ═══ */}
      <div className="space-y-3">
        <h3 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase">
          Memory Strata
        </h3>
        <div className="space-y-3">
          <StrataBar level="L0" count={l0Count} maxCount={maxLevelCount} delay={0.5} onClick={() => handleLevelClick('L0')} />

          {/* Promotion arrow L0 → L1 */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="flex flex-col items-center gap-0.5"
            >
              <ArrowUpCircle className="w-4 h-4 text-muted-foreground/25" />
              <span className="text-[8px] text-muted-foreground/30 font-mono">PROMOTE</span>
            </motion.div>
          </div>

          <StrataBar level="L1" count={l1Count} maxCount={maxLevelCount} delay={0.6} onClick={() => handleLevelClick('L1')} />

          {/* Promotion arrow L1 → L2 */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.4 }}
              className="flex flex-col items-center gap-0.5"
            >
              <ArrowUpCircle className="w-4 h-4 text-muted-foreground/25" />
              <span className="text-[8px] text-muted-foreground/30 font-mono">REVIEW & PROMOTE</span>
            </motion.div>
          </div>

          <StrataBar level="L2" count={l2Count} maxCount={maxLevelCount} delay={0.7} onClick={() => handleLevelClick('L2')} />
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

      {/* ═══ Agent Lifecycle Pipeline ═══ */}
      <div className="space-y-3">
        <h3 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase">
          Agent Lifecycle Pipeline
        </h3>
        <div className="glass-subtle rounded-xl p-4">
          <div className="flex items-center justify-between relative">
            {/* Animated dashed connecting line */}
            <div className="absolute top-5 left-5 right-5 h-px border-t border-dashed border-glass-border z-0" />

            {PIPELINE_STEPS.map((step, i) => (
              <PipelineStep
                key={step.skill}
                skill={step.skill}
                icon={step.icon}
                lastRun={lastRunsBySkill[step.skill]}
                delay={0.8 + i * 0.06}
                onClick={() => handlePipelineStepClick(step.skill)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Active Context Card ═══ */}
      <div className="glass-frost rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-execution" />
          <span className="text-xs font-semibold">Agent Lifecycle Management</span>
          <span className="text-mono-xs text-muted-foreground/50 ml-auto">Mission Command Center</span>
        </div>

        {/* Key metrics row */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 rounded-lg bg-glass-border/20">
            <div className="text-sm font-semibold tabular-nums">{l0Count}</div>
            <div className="text-[8px] text-muted-foreground/50 font-mono">L0</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-glass-border/20">
            <div className="text-sm font-semibold tabular-nums">{l1Count}</div>
            <div className="text-[8px] text-muted-foreground/50 font-mono">L1</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-glass-border/20">
            <div className="text-sm font-semibold tabular-nums">{l2Count}</div>
            <div className="text-[8px] text-muted-foreground/50 font-mono">L2</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-glass-border/20">
            <div className="text-sm font-semibold tabular-nums">{activePolicies}</div>
            <div className="text-[8px] text-muted-foreground/50 font-mono">POLICIES</div>
          </div>
        </div>

        {/* Recent Decisions */}
        {recentDecisions.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <CircleDot className="w-3 h-3 text-muted-foreground/40" />
              <span className="text-[9px] text-premium text-muted-foreground/60 tracking-widest uppercase">
                Recent Decisions
              </span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {recentDecisions.map((node) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2 p-1.5 rounded-md hover:bg-glass-border/20 transition-colors group"
                >
                  <span className={cn(
                    'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                    `bg-${node.level.toLowerCase()}`
                  )} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium truncate">{node.title}</div>
                    <div className="text-mono-xs text-muted-foreground/40 flex items-center gap-1.5">
                      <span>{node.category}</span>
                      <span>·</span>
                      <Clock className="w-2.5 h-2.5" />
                      <span>{new Date(node.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {recentDecisions.length === 0 && (
          <p className="text-xs text-muted-foreground/50 italic">
            No recent decisions recorded yet.
          </p>
        )}
      </div>
    </GlassPanel>
  );
}
