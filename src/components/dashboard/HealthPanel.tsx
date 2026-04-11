'use client'
import { useEffect, useState, useCallback } from 'react'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { Activity, Database, Cpu, Bot, Layers, FlaskConical } from 'lucide-react'
import type { HealthProjection } from '@/lib/projections/health'
import { parseHealthProjection } from '@/lib/projections/health'

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreBar({ value, label, color = 'bg-green-500' }: {
  value: number    // 0-100
  label: string
  color?: string
}) {
  const pct = Math.min(100, Math.max(0, value))
  const barColor = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-gray-400">{label}</span>
        <span className={pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}>
          {pct}%
        </span>
      </div>
      <div className="h-1 w-full rounded bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded transition-all duration-700 ${barColor}`}
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw = await res.json()
      const parsed = parseHealthProjection(raw)
      if (!parsed) throw new Error('Unexpected response shape from /api/health')
      setData(parsed)
      setLastFetch(new Date())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-semibold tracking-tight">System Health</h3>
        </div>
        <button
          onClick={load}
          className="text-xs text-gray-600 hover:text-gray-400 font-mono transition-colors"
        >
          {lastFetch ? lastFetch.toLocaleTimeString() : 'loading...'}
        </button>
      </div>
      {error && (
        <div className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/20 rounded p-2 mb-3">
          ⚠ {error}
        </div>
      )}

      {/* Overall score */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`text-4xl font-mono font-bold ${overallColor}`}>
          {data?.health ?? '--'}
        </div>
        <div>
          <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">Overall Health</div>
          <div className="text-xs text-gray-600 font-mono">
            {data?.status ?? 'connecting...'}
          </div>
        </div>
      </div>

      {data && (
        <>
          {/* Health bars */}
          <div className="space-y-2 mb-4">
            <ScoreBar value={data.memory.memHealth}    label="Memory Governance" />
            <ScoreBar value={data.skills.skillHealth}  label="Skill Execution" />
            <ScoreBar value={data.vla.constraintHealth} label="VLA Constraints" />
            <ScoreBar value={data.vla.robotHealth}     label="Robot Performance" />
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
              label="CaP-X"
              value={data.capx.latestPassRate != null
                ? `${(data.capx.latestPassRate * 100).toFixed(1)}%`
                : 'no run'}
              sub={data.capx.latestRunTag?.slice(0, 18) ?? '—'}
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
              {data.personaplex.activePersonaDisplay ?? 'no persona'}
            </div>
            {data.vla.hardConstraintViolations24h > 0 && (
              <>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-1 text-xs font-mono text-red-400">
                  <FlaskConical className="w-3 h-3" />
                  {data.vla.hardConstraintViolations24h} hard violation{data.vla.hardConstraintViolations24h !== 1 ? 's' : ''} (24h)
                </div>
              </>
            )}
          </div>
        </>
      )}
    </GlassPanel>
  )
}
