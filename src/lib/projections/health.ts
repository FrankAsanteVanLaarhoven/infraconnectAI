// src/lib/projections/health.ts
// Projection shape for GET /api/health

export interface HealthProjection {
  status: 'ok' | 'degraded' | 'critical'
  timestamp: string
  health: number

  memory: {
    totalNodes: number
    l2CanonNodes: number
    conflicts: number
    unresolvedConflicts: number
    memHealth: number
  }

  skills: {
    totalRuns: number
    passedRuns: number
    successRate: number
    skillHealth: number
  }

  nemoclaw: {
    activeAgents: number
  }

  personaplex: {
    activePersona: string | null
    activePersonaDisplay: string | null
  }

  capx: {
    latestRunTag: string | null
    latestPassRate: number | null
  }

  vla: {
    hardConstraintViolations24h: number
    avgRecentSuccessRate: number
    constraintHealth: number
    robotHealth: number
  }
}

export function parseHealthProjection(raw: unknown): HealthProjection | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (r.status !== 'ok' && r.status !== 'degraded' && r.status !== 'critical') return null
  if (typeof r.health !== 'number') return null
  return raw as HealthProjection
}
