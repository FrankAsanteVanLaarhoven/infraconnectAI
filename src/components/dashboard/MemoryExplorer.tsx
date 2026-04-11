// src/components/dashboard/MemoryExplorer.tsx
'use client'
import React, { useState, useCallback } from 'react'
// Adjusted import based on existing HealthPanel.tsx since ui/GlassPanel usually aligns with glass/GlassPanel
import { GlassPanel } from '@/components/glass/GlassPanel'
import { Database, ArrowUp, Archive, Search, RefreshCw, AlertTriangle } from 'lucide-react'
import { useMemory } from '@/lib/hooks/useMemory'
import type { MemoryNodeProjection } from '@/lib/projections/memory'

const STRATUM_COLOR: Record<string, string> = {
  L0: 'text-gray-400 border-gray-600',
  L1: 'text-blue-400 border-blue-600',
  L2: 'text-green-400 border-green-600',
}
const STATUS_COLOR: Record<string, string> = {
  scratch:  'text-gray-500',
  wiki:     'text-blue-400',
  canon:    'text-green-400',
  archived: 'text-gray-600',
}

function NodeRow({
  node,
  onPromote,
  onArchive,
}: {
  node:      MemoryNodeProjection
  onPromote: (id: string) => Promise<void>
  onArchive: (id: string) => Promise<void>
}) {
  const [promoting, setPromoting] = useState(false)
  const [blocked,   setBlocked]   = useState<string | null>(null)

  const handlePromote = async () => {
    setPromoting(true)
    setBlocked(null)
    // useMemory.promote returns { blocked, reason }
    // but here we use the passed callback which already handles this
    await onPromote(node.id)
    setPromoting(false)
  }

  return (
    <div className="group flex items-start gap-2 p-2 rounded-lg hover:bg-white/3 transition-colors border border-transparent hover:border-white/8">
      {/* Stratum badge */}
      <span className={`text-xs font-mono px-1.5 py-0.5 rounded border mt-0.5 shrink-0 ${STRATUM_COLOR[node.stratum]}`}>
        {node.stratum}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-200 truncate">{node.title}</span>
          <span className={`text-xs font-mono ${STATUS_COLOR[node.status]}`}>{node.status}</span>
          {(node._count?.conflicts ?? 0) > 0 && (
            <AlertTriangle className="w-3 h-3 text-yellow-500 shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-600 truncate mt-0.5">{node.content}</p>
        <div className="flex gap-2 mt-0.5">
          {node.tags.slice(0, 3).map(t => (
            <span key={t} className="text-xs text-gray-700 font-mono">#{t}</span>
          ))}
        </div>
      </div>

      {/* Actions — visible on hover */}
      {node.status !== 'archived' && node.stratum !== 'L2' && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={handlePromote}
            disabled={promoting}
            title="Promote to next stratum"
            className="p-1 rounded hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-40"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            onClick={() => onArchive(node.id)}
            title="Archive"
            className="p-1 rounded hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors"
          >
            <Archive className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}

export function MemoryExplorer() {
  const [stratum, setStratum] = useState<'L0' | 'L1' | 'L2' | undefined>()
  const [q,       setQ]       = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [promoteError, setPromoteError] = useState<string | null>(null)

  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  
  // Debounce search
  const handleSearch = useCallback((val: string) => {
    setQ(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setDebouncedQ(val), 300)
  }, [])

  const { data, loading, error, refetch, promote, archive } = useMemory({
    stratum,
    q: debouncedQ || undefined,
  })

  const handlePromote = useCallback(async (id: string) => {
    const result = await promote(id)
    if (result.blocked) setPromoteError(`Blocked: ${result.reason}`)
    else setPromoteError(null)
  }, [promote])

  const handleArchive = useCallback(async (id: string) => {
    await archive(id)
  }, [archive])

  return (
    <GlassPanel>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold tracking-tight">Memory Explorer</h3>
        </div>
        <button 
          onClick={refetch} 
          className="text-gray-600 hover:text-gray-400 transition-colors"
          title="Refresh memory data"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stratum tabs + strata counts */}
      <div className="flex items-center gap-1 mb-2">
        {(['ALL', 'L0', 'L1', 'L2'] as const).map(s => {
          const isAll = s === 'ALL'
          const active = isAll ? !stratum : stratum === s
          const count = isAll
            ? data?.total
            : data?.strata[s as 'L0' | 'L1' | 'L2']
          return (
            <button
              key={s}
              onClick={() => setStratum(isAll ? undefined : s as 'L0' | 'L1' | 'L2')}
              className={`px-2 py-0.5 rounded text-xs font-mono transition-colors border ${
                active
                  ? 'border-blue-500/60 bg-blue-500/10 text-blue-300'
                  : 'border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20'
              }`}
            >
              {s}{count != null ? ` (${count})` : ''}
            </button>
          )
        })}
        {(data?.unresolvedConflicts ?? 0) > 0 && (
          <span className="ml-auto text-xs font-mono text-yellow-500 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {data!.unresolvedConflicts} conflict{data!.unresolvedConflicts !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-2">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
        <input
          value={q}
          onChange={e => handleSearch(e.target.value)}
          placeholder="BM25 + semantic search..."
          className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-white/3 border border-white/10
                     text-xs font-mono text-gray-300 placeholder:text-gray-600
                     focus:outline-none focus:border-blue-500/40 transition-colors"
        />
      </div>

      {/* Policy block banner */}
      {promoteError && (
        <div className="mb-2 text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/20 rounded p-2 flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          {promoteError}
          <button onClick={() => setPromoteError(null)} className="ml-auto text-gray-600 hover:text-gray-400">✕</button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/20 rounded p-2 mb-2">
          ⚠ {error}
        </div>
      )}

      {/* Node list */}
      <div className="space-y-0.5 max-h-80 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {loading && !data && (
          <div className="text-xs text-gray-600 font-mono text-center py-4">Loading...</div>
        )}
        {data?.nodes.length === 0 && !loading && (
          <div className="text-xs text-gray-600 font-mono text-center py-4">
            No nodes{q ? ` matching "${q}"` : ''}{stratum ? ` in ${stratum}` : ''}
          </div>
        )}
        {data?.nodes.map(node => (
          <NodeRow
            key={node.id}
            node={node}
            onPromote={handlePromote}
            onArchive={handleArchive}
          />
        ))}
      </div>

      {/* Pagination footer */}
      {data && data.total > data.pageSize && (
        <div className="text-xs text-gray-600 font-mono text-center pt-2 border-t border-white/5 mt-2">
          Showing {data.nodes.length} of {data.total} nodes
        </div>
      )}
    </GlassPanel>
  )
}
