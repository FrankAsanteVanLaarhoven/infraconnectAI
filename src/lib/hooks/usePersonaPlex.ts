// src/lib/hooks/usePersonaPlex.ts

import { useState, useEffect, useCallback } from 'react'
import type { PersonaListProjection, PersonaProfileProjection } from '@/lib/projections/personaplex'

interface UsePersonaPlexReturn {
  profiles:      PersonaProfileProjection[]
  active:        PersonaListProjection['active']
  loading:       boolean
  error:         string | null
  switchPersona: (slug: string) => Promise<void>
  refetch:       () => void
}

export function usePersonaPlex(): UsePersonaPlexReturn {
  const [profiles, setProfiles] = useState<PersonaProfileProjection[]>([])
  const [active,   setActive]   = useState<PersonaListProjection['active']>(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/personaplex')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: PersonaListProjection = await res.json()
      setProfiles(json.profiles ?? [])
      setActive(json.active ?? null)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const switchPersona = useCallback(async (slug: string) => {
    try {
      const res = await fetch('/api/personaplex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'switch', slug }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Switch failed')
    }
  }, [refetch])

  return { profiles, active, loading, error, switchPersona, refetch }
}
