// src/components/dashboard/VLAMissionControl.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, ShieldAlert, Activity, FlaskConical, Cpu,
  CheckCircle2, AlertTriangle, XCircle, TrendingUp,
  TrendingDown, Minus, RefreshCw, Clock, Zap
} from 'lucide-react'
import { GlassPanel, GlassCard } from '@/components/glass/GlassPanel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { MissionControlData, ConstraintStatus, SimRealMetric } from '@/lib/vla/types'

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusPill({ status }: { status: ConstraintStatus['status'] }) {
  const map = {
    active:       { color: 'text-foreground border-border/40 bg-foreground/5',  icon: CheckCircle2, label: 'Active'      },
    violated:     { color: 'text-muted-foreground border-border/40 bg-background/50',        icon: XCircle,      label: 'Violated'    },
    under_review: { color: 'text-muted-foreground border-border/40 bg-foreground/5', icon: AlertTriangle, label: 'Review'  },
    deprecated:   { color: 'text-muted-foreground/50 border-border/20 bg-transparent',     icon: Minus,        label: 'Deprecated'  },
  }
  const cfg = map[status]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border font-mono tracking-widest uppercase ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  )
}

function TrendIcon({ trend }: { trend: SimRealMetric['trend'] }) {
  if (trend === 'improving') return <TrendingUp className="w-3.5 h-3.5 text-foreground" />
  if (trend === 'degrading') return <TrendingDown className="w-3.5 h-3.5 text-muted-foreground" />
  return <Minus className="w-3.5 h-3.5 text-muted-foreground/50" />
}

function HealthGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{label}</span>
        <span className={`text-sm font-bold font-mono ${color}`}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-border/20 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            pct > 75 ? 'bg-foreground' : pct > 50 ? 'bg-muted-foreground' : 'bg-muted-foreground/50'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// ─── Domain badge colours ─────────────────────────────────────────────────────
const DOMAIN_COLORS: Record<string, string> = {
  navigation:  'border-border/40 text-muted-foreground bg-foreground/5',
  manipulation:'border-border/40 text-muted-foreground bg-foreground/5',
  perception:  'border-border/40 text-muted-foreground bg-foreground/5',
  system:      'border-border/40 text-muted-foreground bg-foreground/5',
}

// ─── Main component ───────────────────────────────────────────────────────────
export function VLAMissionControl() {
  const [data, setData] = useState<MissionControlData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState<'constraints' | 'experiments' | 'transfer'>('constraints')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/vla-dashboard')
      const json = await res.json()
      setData(json)
      setLastRefresh(new Date())
    } catch { /* silently fail, keep stale data */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-refresh every 60s
  useEffect(() => {
    const t = setInterval(load, 60_000)
    return () => clearInterval(t)
  }, [load])

  if (!data && loading) return (
    <GlassPanel glow>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-foreground" />
        <span className="text-xs font-semibold uppercase tracking-widest text-foreground">VLA Mission Control</span>
      </div>
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm font-mono tracking-widest uppercase">
        <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Loading VLA systems...
      </div>
    </GlassPanel>
  )

  if (!data) return null
  const { constraints, recentRuns, simRealMetrics, systemHealth: sh } = data

  const hardConstraints = constraints.filter(c => c.severity === 'hard')
  const atRisk = constraints.filter(c => c.violationCount > 3)

  return (
    <GlassPanel glow>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-foreground" />
        <span className="text-xs font-semibold uppercase tracking-widest text-foreground">VLA Mission Control</span>
      </div>
      <div className="space-y-5">

        {/* ── System Health Row ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Deployment readiness */}
          <GlassCard level="L2" className="p-3 space-y-2" glow>
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Deployment Gate</p>
            <div className="flex items-center gap-2">
              {sh.hardConstraintsAtRisk === 0 && sh.totalViolations24h === 0 && sh.deadlineCertified ? (
                <><CheckCircle2 className="w-5 h-5 text-foreground" /><span className="text-foreground tracking-widest font-bold text-sm">READY</span></>
              ) : (
                <><ShieldAlert className="w-5 h-5 text-muted-foreground" /><span className="text-muted-foreground tracking-widest font-bold text-sm">BLOCKED</span></>
              )}
            </div>
            <div className="text-xs space-y-0.5 font-mono opacity-80">
              <div className={sh.deadlineCertified ? 'text-foreground' : 'text-muted-foreground'}>
                {sh.deadlineCertified ? '✓' : '✗'} Deadline certified
              </div>
              <div className={sh.hardConstraintsAtRisk === 0 ? 'text-foreground' : 'text-muted-foreground'}>
                {sh.hardConstraintsAtRisk === 0 ? '✓' : '✗'} No hard constraints at risk
              </div>
              <div className={sh.totalViolations24h === 0 ? 'text-foreground' : 'text-muted-foreground/70'}>
                {sh.totalViolations24h === 0 ? '✓' : '!'} {sh.totalViolations24h} violations (24h)
              </div>
            </div>
          </GlassCard>

          {/* Health metrics */}
          <GlassCard level="L1" className="p-3 space-y-2.5 bg-background/20 backdrop-blur-md border-border/10">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">System Signals</p>
            <HealthGauge value={sh.constraintCoverage} label="Coverage" color="text-foreground" />
            <HealthGauge value={sh.transferReadiness} label="Sim→Real" color="text-muted-foreground" />
            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-mono mt-2 pt-2 border-t border-border/10 text-muted-foreground/60">
              <span>{sh.activeConstraints} active</span>
              {sh.lastCertDate && (
                <span>
                  Cert: {new Date(sh.lastCertDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </GlassCard>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex gap-1 border-b border-white/10 pb-0">
          {(['constraints', 'experiments', 'transfer'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'constraints' && <><Shield className="w-3 h-3 inline mr-1" />Constraints</>}
              {tab === 'experiments' && <><FlaskConical className="w-3 h-3 inline mr-1" />Runs</>}
              {tab === 'transfer'    && <><Activity className="w-3 h-3 inline mr-1" />Sim→Real</>}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 pb-1">
            {loading && <RefreshCw className="w-3 h-3 text-muted-foreground animate-spin" />}
            <button onClick={load} className="text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-muted-foreground/60 font-mono tracking-widest uppercase">
              {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">

          {/* CONSTRAINTS TAB */}
          {activeTab === 'constraints' && (
            <motion.div
              key="constraints"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-2 max-h-64 overflow-y-auto pr-1"
            >
              {atRisk.length > 0 && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                  {atRisk.length} hard constraint{atRisk.length > 1 ? 's' : ''} at risk ({'>'}3 violations)
                </div>
              )}
              {constraints.map((c) => (
                <GlassCard key={c.id} level={c.severity === 'hard' ? 'L2' : 'L1'} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium tracking-wide text-foreground truncate">
                          {c.displayName}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase tracking-widest px-1.5 py-0 rounded-md ${DOMAIN_COLORS[c.domain]}`}
                        >
                          {c.domain}
                        </Badge>
                        {c.severity === 'hard' && (
                          <Badge variant="outline" className="text-[10px] uppercase tracking-widest px-1.5 py-0 rounded-md border-border/40 text-muted-foreground bg-foreground/5">
                            hard
                          </Badge>
                        )}
                      </div>
                      <code className="text-[11px] text-muted-foreground font-mono block mb-2 px-1.5 py-0.5 rounded-md bg-foreground/5 border border-border/20 w-fit">
                        {c.formalSpec}
                      </code>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground/60 font-mono uppercase tracking-widest">
                        <span>threshold: {c.threshold} {c.unit}</span>
                        {c.violationCount > 0 && (
                          <span className={c.violationCount > 3 ? 'text-foreground opacity-80' : 'text-muted-foreground'}>
                            {c.violationCount} violation{c.violationCount > 1 ? 's' : ''}
                          </span>
                        )}
                        {c.lastTestedAt ? (
                          <span>tested: {new Date(c.lastTestedAt).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-muted-foreground">UNTESTED</span>
                        )}
                      </div>
                    </div>
                    <StatusPill status={c.status} />
                  </div>
                </GlassCard>
              ))}
              {constraints.length === 0 && (
                <p className="text-center text-gray-600 text-sm py-8 font-mono">
                  No constraints registered. Run /constraint-audit to initialise.
                </p>
              )}
            </motion.div>
          )}

          {/* EXPERIMENTS TAB */}
          {activeTab === 'experiments' && (
            <motion.div
              key="experiments"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-2 max-h-64 overflow-y-auto pr-1"
            >
              {recentRuns.map((run) => (
                <GlassCard key={run.id} level="L1" className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-foreground font-medium">
                          {run.runId}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase tracking-widest px-1.5 py-0 rounded-md border-border/40 text-muted-foreground bg-foreground/5`}
                        >
                          {run.environment}
                        </Badge>
                        <span className="text-xs text-muted-foreground/60 font-mono border-l border-border/40 pl-2">{run.scenario}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="text-center bg-foreground/5 py-1.5 rounded-md border border-border/20">
                          <div className={`text-xs font-bold tracking-wider font-mono ${
                            (run.successRate ?? 0) > 0.8 ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {run.successRate != null ? `${Math.round(run.successRate * 100)}%` : '—'}
                          </div>
                          <div className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-mono mt-0.5">success</div>
                        </div>
                        <div className="text-center bg-foreground/5 py-1.5 rounded-md border border-border/20">
                          <div className={`text-xs font-bold tracking-wider font-mono ${
                            (run.avgDeadlineMs ?? 0) < 160 ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {run.avgDeadlineMs != null ? `${Math.round(run.avgDeadlineMs)}ms` : '—'}
                          </div>
                          <div className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-mono mt-0.5">deadline</div>
                        </div>
                        <div className="text-center bg-foreground/5 py-1.5 rounded-md border border-border/20">
                          <div className={`text-xs font-bold tracking-wider font-mono ${
                            run.totalViolations === 0 ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {run.totalViolations}
                          </div>
                          <div className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-mono mt-0.5">violations</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-widest ${
                        run.status === 'completed' ? 'border-border/40 text-foreground bg-foreground/5'
                        : run.status === 'running'  ? 'border-border/40 text-muted-foreground bg-foreground/5'
                        : run.status === 'failed'   ? 'border-border/40 text-muted-foreground/50 bg-foreground/5'
                        : 'border-border/40 text-muted-foreground/30 bg-transparent'
                      }`}>
                        {run.status}
                      </span>
                      {run.constraintsSatisfied
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-foreground" />
                        : <XCircle className="w-3.5 h-3.5 text-muted-foreground/50" />
                      }
                    </div>
                  </div>
                </GlassCard>
              ))}
              {recentRuns.length === 0 && (
                <p className="text-center text-gray-600 text-sm py-8 font-mono">
                  No experiment runs recorded yet.
                </p>
              )}
            </motion.div>
          )}

          {/* SIM→REAL TAB */}
          {activeTab === 'transfer' && (
            <motion.div
              key="transfer"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-2 max-h-64 overflow-y-auto pr-1"
            >
              {simRealMetrics.map((m) => {
                const acceptPct = m.count > 0 ? Math.round((m.acceptable / m.count) * 100) : 0
                return (
                  <GlassCard key={m.metric} level="L1" className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendIcon trend={m.trend} />
                        <span className="text-xs font-mono uppercase tracking-widest text-foreground">
                          {m.metric.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className={`text-xs font-mono font-bold ${
                        acceptPct >= 80 ? 'text-foreground'
                        : 'text-muted-foreground'
                      }`}>
                        {acceptPct}% acceptable
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-border/20 overflow-hidden mb-3">
                      <motion.div
                        className={`h-full rounded-full ${
                          acceptPct >= 80 ? 'bg-foreground'
                          : acceptPct >= 50 ? 'bg-muted-foreground'
                          : 'bg-muted-foreground/50'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${acceptPct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground/60 font-mono uppercase tracking-widest">
                      <span>avg δ: {m.avgDelta.toFixed(3)}</span>
                      <span>{m.acceptable}/{m.count} runs</span>
                      <span className={
                        m.trend === 'improving' ? 'text-foreground'
                        : m.trend === 'degrading' ? 'text-muted-foreground/80'
                        : 'text-muted-foreground/40'
                      }>
                        {m.trend}
                      </span>
                    </div>
                  </GlassCard>
                )
              })}
              {simRealMetrics.length === 0 && (
                <p className="text-center text-gray-600 text-sm py-8 font-mono">
                  No sim-to-real data yet. Run paired sim + real experiments.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── VLA Skill quick-launch ── */}
        <div className="border-t border-border/10 pt-4 pb-1">
          <p className="text-[10px] text-muted-foreground/50 font-mono uppercase tracking-widest mb-3">VLA Skills Quick-Launch</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { skill: 'vla-safety-verification', label: 'Safety Verify', color: 'border-border/40 hover:bg-foreground/5 text-muted-foreground hover:text-foreground' },
              { skill: 'sim-to-real-validation',  label: 'Sim→Real',      color: 'border-border/40 hover:bg-foreground/5 text-muted-foreground hover:text-foreground' },
              { skill: 'constraint-audit',         label: 'Constraint Audit', color: 'border-border/40 hover:bg-foreground/5 text-muted-foreground hover:text-foreground' },
              { skill: 'deadline-certification',   label: 'Deadline Cert', color: 'border-border/40 hover:bg-foreground/5 text-muted-foreground hover:text-foreground' },
            ].map(({ skill, label, color }) => (
              <Button
                key={skill}
                variant="outline"
                size="sm"
                className={`text-xs font-mono border bg-transparent transition-colors ${color}`}
                onClick={() => {
                  // Dispatch to IntentBar — opens skill runner with this VLA skill pre-selected
                  window.dispatchEvent(new CustomEvent('memdevos:run-skill', { detail: { skill } }))
                }}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

      </div>
    </GlassPanel>
  )
}
