// src/components/core/AgentOperationsCenter.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, ShieldAlert, Activity, Binary, Lock,
  CheckCircle2, AlertTriangle, XCircle, TrendingUp,
  Minus, RefreshCw, Users
} from 'lucide-react'
import { GlassPanel, GlassCard } from '@/components/glass/GlassPanel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { MissionControlData, VerificationGate, ParallelTask } from '@/lib/agent-ops/types'

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusPill({ status }: { status: VerificationGate['status'] }) {
  const map = {
    passed:          { color: 'text-foreground border-border/40 bg-foreground/5',  icon: CheckCircle2, label: 'Passed'      },
    failed:          { color: 'text-muted-foreground border-border/40 bg-background/50',        icon: XCircle,      label: 'Failed'    },
    review_required: { color: 'text-muted-foreground border-border/40 bg-foreground/5', icon: AlertTriangle, label: 'Review'  },
    pending:         { color: 'text-muted-foreground/50 border-border/20 bg-transparent',     icon: Minus,        label: 'Pending'  },
  }
  const cfg = map[status] || map.pending;
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] border font-mono tracking-widest uppercase ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  )
}

function TaskStatusPill({ status, signOff }: { status: ParallelTask['status'], signOff: boolean }) {
  const color = status === 'completed' && signOff ? 'text-foreground' : 'text-muted-foreground'
  return (
    <div className="flex flex-col items-end gap-1">
      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-widest bg-foreground/5 border-border/40 ${color}`}>
        {status}
      </span>
      {signOff ? (
        <Badge variant="outline" className="text-[8px] bg-foreground/10 text-foreground border-foreground/30">SICN-OFF</Badge>
      ) : (
        <Badge variant="outline" className="text-[8px] opacity-40">WAITING</Badge>
      )}
    </div>
  )
}

function HealthGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{label}</span>
        <span className={`text-xs font-bold font-mono ${color}`}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-sm bg-border/20 overflow-hidden">
        <motion.div
            className={`h-full rounded-sm ${
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

// ─── Main component ───────────────────────────────────────────────────────────
export function AgentOperationsCenter() {
  const [data, setData] = useState<MissionControlData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'tasks' | 'gates' | 'telemetry'>('tasks')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/agent-ops')
      if (!res.ok) throw new Error('SIGNAL_WEAK')
      const json = await res.json()
      setData(json)
    } catch { 
      // Silent fail - error state handled by UI guards
    } finally { 
      setLoading(false) 
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading && !data) {
    return (
      <GlassPanel glow>
        <div className="flex items-center justify-center h-64 text-muted-foreground text-[10px] font-mono tracking-widest uppercase">
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Establishing Mission Link...
        </div>
      </GlassPanel>
    )
  }

  // Clinical Guard for missing data streams
  if (!data) return null;
  const { verificationGates = [], activeTasks = [], buildTelemetry = [], systemHealth: sh } = data;

  if (!sh) {
    return (
       <GlassPanel glow>
         <div className="flex items-center justify-center h-64 text-muted-foreground text-[10px] font-mono tracking-widest uppercase">
           <ShieldAlert className="w-4 h-4 mr-2" /> Signal Drift Detected // Standby
         </div>
       </GlassPanel>
    );
  }

  return (
    <GlassPanel glow>
      <div className="flex items-center gap-2 mb-4">
        <Binary className="w-4 h-4 text-foreground" />
        <span className="text-xs font-semibold uppercase tracking-widest text-foreground">Agent Operations Center</span>
      </div>
      
      <div className="space-y-5">
        {/* Readiness Row */}
        <div className="grid grid-cols-2 gap-3">
          <GlassCard level="L2" className="p-3 space-y-2" glow>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Governance Gate</p>
            <div className="flex items-center gap-2">
              {(Number(sh?.operationalReadiness) ?? 0) > 0.8 && (sh?.criticalGatesAtRisk ?? 0) === 0 ? (
                <><CheckCircle2 className="w-5 h-5 text-foreground" /><span className="text-foreground tracking-widest font-bold text-sm uppercase">Secure</span></>
              ) : (
                <><Lock className="w-5 h-5 text-muted-foreground" /><span className="text-muted-foreground tracking-widest font-bold text-sm uppercase">Locked</span></>
              )}
            </div>
            <div className="text-[10px] space-y-0.5 font-mono opacity-80 uppercase tracking-tighter">
              <div className={sh?.deadlineCertified ? 'text-foreground' : 'text-muted-foreground'}>
                {sh?.deadlineCertified ? '✓' : '✗'} Deadline Certified
              </div>
              <div className={(sh?.criticalGatesAtRisk ?? 0) === 0 ? 'text-foreground' : 'text-muted-foreground'}>
                {(sh?.criticalGatesAtRisk ?? 0) === 0 ? '✓' : '✗'} 0 Critical Flags
              </div>
              <div className="text-muted-foreground/70">
                ! {sh?.totalViolations24h ?? 0} Incidents (24h)
              </div>
            </div>
          </GlassCard>

          <GlassCard level="L1" className="p-3 space-y-2.5 bg-background/20 backdrop-blur-md border-border/10">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">Sync Signals</p>
            <HealthGauge value={sh?.gateCoverage ?? 0} label="Gate Coverage" color="text-foreground" />
            <HealthGauge value={Number(sh?.operationalReadiness ?? 0)} label="Operational Read" color="text-muted-foreground" />
            <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-mono mt-2 pt-2 border-t border-border/10 text-muted-foreground/60">
              <span>{sh?.activeAgents ?? 0} Agents Active</span>
              {sh?.lastCertDate && <span>Cert: {new Date(sh.lastCertDate).toLocaleDateString()}</span>}
            </div>
          </GlassCard>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/5 pb-0">
          {(['tasks', 'gates', 'telemetry'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 pb-1 pr-1">
            <button onClick={load} className="text-muted-foreground hover:text-foreground">
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Intelligence Views */}
        <AnimatePresence mode="wait">
          {activeTab === 'tasks' && (
            <motion.div key="tasks" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {(activeTasks || []).map((t) => (
                <GlassCard key={t.id} level="L2" className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium tracking-tight text-foreground truncate uppercase">{t.role}</span>
                        <Badge variant="outline" className="text-[9px] bg-foreground/5">{t.status}</Badge>
                      </div>
                      <div className="h-1 bg-border/20 rounded-sm overflow-hidden mb-2 max-w-[100px]">
                        <motion.div className="h-full bg-foreground" initial={{ width: 0 }} animate={{ width: `${t.progress}%` }} />
                      </div>
                    </div>
                    <TaskStatusPill status={t.status} signOff={t.humanSignOff} />
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          )}

          {activeTab === 'gates' && (
            <motion.div key="gates" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {(verificationGates || []).map((gate) => (
                <GlassCard key={gate.id} level="L1" className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 text-xs font-bold uppercase">{gate.displayName}</div>
                    <StatusPill status={gate.status} />
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          )}

          {activeTab === 'telemetry' && (
            <motion.div key="telemetry" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {(buildTelemetry || []).map((m) => (
                <GlassCard key={m.metric} level="L1" className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-foreground">{m.metric}</span>
                    <span className="text-[10px] font-mono font-bold">{m.value}{m.unit}</span>
                  </div>
                  <div className="text-[8px] uppercase tracking-widest text-muted-foreground mt-1">
                    Trend: {m.trend} <TrendingUp className="w-2 h-2 inline" />
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Governance Controls */}
        <div className="border-t border-border/10 pt-4">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Execute /ship', skill: 'ship' },
              { label: 'Execute /release', skill: 'release' }
            ].map(({ label, skill }) => (
              <Button
                key={skill}
                variant="outline"
                size="sm"
                className="text-[10px] font-mono border bg-transparent opacity-80 hover:opacity-100 uppercase"
                onClick={() => window.dispatchEvent(new CustomEvent('infraconnect:run-skill', { detail: { skill } }))}
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
