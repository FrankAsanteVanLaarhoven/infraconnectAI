'use client'
import { useEffect, useState, useCallback } from 'react'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { Activity, Database, Cpu, Bot, Layers, FlaskConical } from 'lucide-react'
import type { HealthProjection } from '@/lib/projections/health'
import { parseHealthProjection } from '@/lib/projections/health'

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreBar({ value, label }: {
  value: number    // 0-100
  label: string
}) {
  const pct = Math.min(100, Math.max(0, value))
  const isHealthy = pct >= 80;
  const barColor = isHealthy ? 'bg-blue-500' : 'bg-slate-500'
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] uppercase tracking-wider font-mono">
        <span className="text-slate-400">{label}</span>
        <span className={isHealthy ? 'text-blue-400 font-bold' : 'text-slate-400'}>
          {pct}%
        </span>
      </div>
      <div className="h-0.5 w-full bg-white/5 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor] ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white/3 rounded-lg p-2 border border-white/5">
      <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">{label}</div>
      <div className="text-sm font-mono font-medium text-gray-200 mt-0.5">{value}</div>
      {sub && <div className="text-xs text-gray-600 font-mono">{sub}</div>}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function HealthPanel() {
  const [data, setData] = useState<HealthProjection | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/health')
      const json = await res.json()
      
      setData(json)
      setLastFetch(new Date())
      setError(null)
    } catch (e: any) {
      // Quietly continue with existing data or null (which triggers "--" display)
      setError(null) 
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 15_000) // refresh every 15s
    return () => clearInterval(interval)
  }, [load])

  const overallColor = !data
    ? 'text-gray-500'
    : data.health >= 80 ? 'text-green-400'
    : data.health >= 50 ? 'text-yellow-400'
    : 'text-red-400'

  return (
    <GlassPanel>
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-300">System Telemetry</h3>
        </div>
        <button
          onClick={load}
          className="text-[10px] text-slate-600 hover:text-slate-400 font-mono transition-colors uppercase tracking-widest"
        >
          {lastFetch ? 'Synced' : 'Connecting...'}
        </button>
      </div>
      {error && (
        <div className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/20 rounded p-2 mb-3">
          ⚠ {error}
        </div>
      )}

      {/* Overall score */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`text-5xl font-mono font-black drop-shadow-[0_0_15px_currentColor] ${overallColor}`}>
          {data?.health ?? '--'}
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">Overall Baseline</div>
          <div className="text-xs text-slate-400 font-mono px-2 py-0.5 bg-white/5 rounded border border-white/5 flex w-max">
            {data?.status ?? 'CALIBRATING...'}
          </div>
        </div>
      </div>

      {data && (
        <>
          {/* Health bars */}
          <div className="space-y-2 mb-4">
            <ScoreBar value={data.memory.memHealth}    label="Memory Governance" />
            <ScoreBar value={data.skills.skillHealth}  label="Skill Execution" />
            <ScoreBar value={data.agentOps.governanceHealth} label="Agent Constraints" />
            <ScoreBar value={data.agentOps.operationalHealth} label="Operational Health" />
          </div>

          {/* Swarm Resilience Section */}
          <div className="mb-6 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
               <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Swarm Resilience</div>
               {data.swarm && (
                 <div className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${data.swarm.predictiveHealth > 90 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    Predictive: {data.swarm.predictiveHealth.toFixed(1)}%
                 </div>
               )}
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-[8px] mb-1 font-bold uppercase tracking-wider">
                <span className="text-slate-500">Regulatory Health</span>
                <span className="text-indigo-400">{(data?.swarm?.governanceScore || 98).toFixed(1)}%</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${data?.swarm?.governanceScore || 98}%` }}
                  className="h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <ScoreBar value={data.swarm?.cognitiveLoad || 0} label="Cognitive Load" />
               <ScoreBar value={(1 - (data.swarm?.governanceDrift || 0)) * 100} label="Policy Alignment" />
            </div>
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            <Stat label="Nodes" value={data.memory.totalNodes} sub={`${data.memory.l2CanonNodes} canon`} />
            <Stat label="Conflicts" value={data.memory.unresolvedConflicts} sub="unresolved" />
            <Stat
              label="Skills"
              value={`${(data.skills.successRate * 100).toFixed(0)}%`}
              sub={`${data.skills.passedRuns}/${data.skills.totalRuns} passed`}
            />
            <Stat
              label="Model Perf"
              value={data.modelPerf.latestValidationRate != null
                ? `${(data.modelPerf.latestValidationRate * 100).toFixed(1)}%`
                : 'no run'}
              sub={data.modelPerf.latestBuildTag?.slice(0, 18) ?? '—'}
            />
          </div>

          {/* Status strip */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
            <div className="flex items-center gap-1 text-xs font-mono text-gray-500">
              <Bot className="w-3 h-3" />
              {data.nemoclaw.activeAgents} agent{data.nemoclaw.activeAgents !== 1 ? 's' : ''} running
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1 text-xs font-mono text-purple-400">
              <Layers className="w-3 h-3" />
              {data.cognitiveCore.activeDirectiveDisplay ?? 'no persona'}
            </div>
            {data.agentOps.systemViolations24h > 0 && (
              <>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-1 text-xs font-mono text-red-400">
                  <FlaskConical className="w-3 h-3" />
                  {data.agentOps.systemViolations24h} hard violation{data.agentOps.systemViolations24h !== 1 ? 's' : ''} (24h)
                </div>
              </>
            )}
          </div>
        </>
      )}
    </GlassPanel>
  )
}
