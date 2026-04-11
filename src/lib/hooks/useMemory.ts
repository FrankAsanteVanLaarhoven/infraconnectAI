// src/lib/hooks/useMemory.ts

import { useState, useEffect, useCallback } from 'react'
import type { MemoryListProjection, MemoryNodeProjection } from '@/lib/projections/memory'
import { parseMemoryListProjection } from '@/lib/projections/memory'

interface UseMemoryOptions {
  stratum?:  'L0' | 'L1' | 'L2'
  status?:   string
  q?:        string
  page?:     number
  pageSize?: number
  enabled?:  boolean
}

interface UseMemoryReturn {
  data:    MemoryListProjection | null
  loading: boolean
  error:   string | null
  refetch: () => void
  promote: (nodeId: string) => Promise<{ blocked: boolean; reason: string | null }>
  archive: (nodeId: string) => Promise<void>
  ingest:  (payload: { title: string; content: string; type?: string; tags?: string[] }) => Promise<MemoryNodeProjection | null>
}

export function useMemory(opts: UseMemoryOptions = {}): UseMemoryReturn {
  const { stratum, status, q, page = 1, pageSize = 20, enabled = true } = opts
  const [data,    setData]    = useState<MemoryListProjection | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const buildUrl = useCallback(() => {
    const p = new URLSearchParams()
    if (stratum)  p.set('stratum',  stratum)
    if (status)   p.set('status',   status)
    if (q)        p.set('q',        q)
    p.set('page',     String(page))
    p.set('pageSize', String(pageSize))
    return `/api/memory?${p.toString()}`
  }, [stratum, status, q, page, pageSize])

  const refetch = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    try {
      const res = await fetch(buildUrl())
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw = await res.json()
      const parsed = parseMemoryListProjection(raw)
      if (!parsed) throw new Error('Response shape mismatch on /api/memory')
      setData(parsed)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [buildUrl, enabled])

  useEffect(() => { refetch() }, [refetch])

  const promote = useCallback(async (nodeId: string) => {
    const res = await fetch(`/api/memory/${nodeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'promote', actor: 'human' }),
    })
    const json = await res.json()
    if (!json.blocked) refetch()
    return { blocked: json.blocked ?? false, reason: json.reason ?? null }
  }, [refetch])

  const archive = useCallback(async (nodeId: string) => {
    await fetch(`/api/memory/${nodeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'archive', actor: 'human' }),
    })
    refetch()
  }, [refetch])

  const ingest = useCallback(async (payload: {
    title: string
    content: string
    type?: string
    tags?: string[]
  }): Promise<MemoryNodeProjection | null> => {
    try {
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      refetch()
      return json.node ?? null
    } catch {
      return null
    }
  }, [refetch])

  return { data, loading, error, refetch, promote, archive, ingest }
}
