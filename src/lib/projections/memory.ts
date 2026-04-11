// src/lib/projections/memory.ts

export interface MemoryNodeProjection {
  id: string
  title: string
  content: string
  type: string
  stratum: 'L0' | 'L1' | 'L2'
  status: 'scratch' | 'wiki' | 'canon' | 'archived'
  tags: string[]
  source: string | null
  promotedAt: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    conflicts: number
    embeddings: number
  }
}

export interface ConflictProjection {
  id: string
  nodeId: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
  resolvedAt: string | null
  createdAt: string
  node?: Pick<MemoryNodeProjection, 'id' | 'title' | 'stratum'>
}

export interface MemoryListProjection {
  nodes: MemoryNodeProjection[]
  total: number
  page: number
  pageSize: number
  strata: {
    L0: number
    L1: number
    L2: number
  }
  unresolvedConflicts: number
}

export function parseMemoryListProjection(raw: unknown): MemoryListProjection | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (!Array.isArray(r.nodes)) return null
  return raw as MemoryListProjection
}
