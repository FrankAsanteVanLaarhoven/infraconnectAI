import { useState, useEffect, useCallback } from 'react'

export interface ModelPerfEpisode {
  id: string
  shortId: string
  status: 'pending' | 'running' | 'passed' | 'failed' | 'blocked' | 'recovered'
  taskId: string
  abstractionLayer: string
  success: boolean
}

export interface ModelPerfData {
  projection: {
    loaded: boolean
    taskSuccess: number | null
    policyViolations: number | null
    autoRecovery: number | null
    abstractionLayer: string | null
  }
  episodes: ModelPerfEpisode[]
}

export function useModelPerf(options?: { pollIntervalMs?: number }) {
  const [data, setData] = useState<ModelPerfData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchModelPerf = useCallback(async () => {
    try {
      const res = await fetch('/api/model-perf')
      const json = await res.json()
      
      // Clinical Merge: Ensure structural integrity even on partial returns
      const safeData: ModelPerfData = {
        projection: {
          loaded: json?.projection?.loaded ?? false,
          taskSuccess: json?.projection?.taskSuccess ?? 0,
          policyViolations: json?.projection?.policyViolations ?? 0,
          autoRecovery: json?.projection?.autoRecovery ?? 0,
          abstractionLayer: json?.projection?.abstractionLayer ?? 'S1'
        },
        episodes: Array.isArray(json?.episodes) ? json.episodes : []
      }
      
      setData(safeData)
      setError(res.ok ? null : new Error(`API_SIGNAL_WEAK: ${res.status}`))
    } catch (e: any) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchModelPerf()
    if (options?.pollIntervalMs) {
      const ival = setInterval(fetchModelPerf, options.pollIntervalMs)
      return () => clearInterval(ival)
    }
  }, [fetchModelPerf, options?.pollIntervalMs])

  const importTraces = useCallback(async () => {
    setLoading(true)
    await fetch('/api/model-perf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'import' })
    })
    await fetchModelPerf()
  }, [fetchModelPerf])

  return { data, loading, error, refetch: fetchModelPerf, importTraces }
}
