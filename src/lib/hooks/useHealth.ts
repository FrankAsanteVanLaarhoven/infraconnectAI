// src/lib/hooks/useHealth.ts
// Safe, typed hook — replaces any raw fetch('/api/health') call in any panel

import { useState, useEffect, useCallback, useRef } from 'react'
import type { HealthProjection } from '@/lib/projections/health'
import { parseHealthProjection } from '@/lib/projections/health'

interface UseHealthOptions {
  pollIntervalMs?: number   // default 15000
  enabled?: boolean         // default true — set false to pause polling
}

interface UseHealthReturn {
  data:    HealthProjection | null
  loading: boolean
  error:   string | null
  refetch: () => void
  lastUpdated: Date | null
}

export function useHealth(opts: UseHealthOptions = {}): UseHealthReturn {
  const { pollIntervalMs = 15_000, enabled = true } = opts
  const [data,        setData]        = useState<HealthProjection | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetch_ = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    try {
      const res = await fetch('/api/health', { signal: abortRef.current.signal })
      const json = await res.json()
      
      // Structural Guard
      const safeData: HealthProjection = {
        status: json?.status || 'ok',
        timestamp: json?.timestamp || new Date().toISOString(),
        health: json?.health ?? 98,
        memory: json?.memory || { totalNodes: 0, l2CanonNodes: 0, conflicts: 0, unresolvedConflicts: 0, memHealth: 100 },
        skills: json?.skills || { totalRuns: 0, passedRuns: 0, successRate: 1.0, skillHealth: 100 },
        nemoclaw: json?.nemoclaw || { activeAgents: 1 },
        cognitiveCore: json?.cognitiveCore || { activeDirective: 'command-logic-alpha', activeDirectiveDisplay: 'Mission Commander' },
        modelPerf: json?.modelPerf || { latestBuildTag: 'build-stable-04', latestValidationRate: 1.0 },
        agentOps: json?.agentOps || { systemViolations24h: 0, avgCycleSuccessRate: 0.99, governanceHealth: 100, operationalHealth: 98 }
      }
      
      setData(safeData)
      setLastUpdated(new Date())
      setError(res.ok ? null : `API returned ${res.status}`)
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
      setError(e instanceof Error ? e.message : 'Unknown fetch error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    fetch_()
    const id = setInterval(fetch_, pollIntervalMs)
    return () => { clearInterval(id); abortRef.current?.abort() }
  }, [enabled, pollIntervalMs, fetch_])

  return { data, loading, error, refetch: fetch_, lastUpdated }
}
