import { useState, useEffect, useCallback } from 'react'

export interface CaPXEpisode {
  id: string
  shortId: string
  status: 'pending' | 'running' | 'passed' | 'failed' | 'blocked' | 'recovered'
  taskId: string
  abstractionLayer: string
  success: boolean
}

export interface CaPXData {
  projection: {
    loaded: boolean
    taskSuccess: number | null
    policyViolations: number | null
    autoRecovery: number | null
    abstractionLayer: string | null
  }
  episodes: CaPXEpisode[]
}

export function useCaPX(options?: { pollIntervalMs?: number }) {
  const [data, setData] = useState<CaPXData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCaPX = useCallback(async () => {
    try {
      const res = await fetch('/api/capx')
      if (!res.ok) throw new Error('API Error')
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (e: any) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCaPX()
    if (options?.pollIntervalMs) {
      const ival = setInterval(fetchCaPX, options.pollIntervalMs)
      return () => clearInterval(ival)
    }
  }, [fetchCaPX, options?.pollIntervalMs])

  const importTraces = useCallback(async () => {
    setLoading(true)
    await fetch('/api/capx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'import' })
    })
    await fetchCaPX()
  }, [fetchCaPX])

  return { data, loading, error, refetch: fetchCaPX, importTraces }
}
