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
      if (!res.ok) throw new Error(`/api/health returned HTTP ${res.status}`)
      const raw = await res.json()
      const parsed = parseHealthProjection(raw)
      if (!parsed) throw new Error('Response shape mismatch on /api/health')
      setData(parsed)
      setLastUpdated(new Date())
      setError(null)
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
