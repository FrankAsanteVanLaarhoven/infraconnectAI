// src/lib/hooks/useNemoClaw.ts

import { useState, useEffect, useCallback } from 'react'
import type { AgentProjection, SessionProjection, NemoClawRunResult } from '@/lib/projections/nemoclaw'

interface UseNemoClawReturn {
  agents:   AgentProjection[]
  sessions: SessionProjection[]
  loading:  boolean
  error:    string | null
  runSkill: (params: {
    skillId:           string
    agentId:           string
    personaId?:        string
    input?:            Record<string, unknown>
    constraintContext?: Record<string, unknown>
    taskSummary?:      string
  }) => Promise<NemoClawRunResult | null>
  refetch: () => void
}

export function useNemoClaw(): UseNemoClawReturn {
  const [agents,   setAgents]   = useState<AgentProjection[]>([])
  const [sessions, setSessions] = useState<SessionProjection[]>([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const [aRes, sRes] = await Promise.all([
        fetch('/api/nemoclaw/agents', { headers: { 'Authorization': 'Bearer enc_dev', 'x-iam-clearance': 'L5-GodMode' } }),
        fetch('/api/nemoclaw/sessions?limit=10', { headers: { 'Authorization': 'Bearer enc_dev', 'x-iam-clearance': 'L5-GodMode' } }),
      ])
      if (!aRes.ok || !sRes.ok) throw new Error('NemoClaw API error')
      const [aJson, sJson] = await Promise.all([aRes.json(), sRes.json()])
      setAgents(aJson.agents   ?? [])
      setSessions(sJson.sessions ?? [])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const runSkill = useCallback(async (params: {
    skillId: string
    agentId: string
    personaId?: string
    input?: Record<string, unknown>
    constraintContext?: Record<string, unknown>
    taskSummary?: string
  }): Promise<NemoClawRunResult | null> => {
    try {
      const res = await fetch('/api/nemoclaw/run', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer enc_dev',
          'x-iam-clearance': 'L5-GodMode'
        },
        body: JSON.stringify(params),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const result: NemoClawRunResult = await res.json()
      // Refresh sessions after run
      refetch()
      return result
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Run failed')
      return null
    }
  }, [refetch])

  return { agents, sessions, loading, error, runSkill, refetch }
}
