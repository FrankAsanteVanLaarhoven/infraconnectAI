// src/app/page.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Panels
import { HealthPanel }         from '@/components/dashboard/HealthPanel'
import { MemoryExplorer }      from '@/components/dashboard/MemoryExplorer'
import { SkillLifecycle as SkillPanel } from '@/components/skills/SkillLifecycle'
import { GovernancePanel }     from '@/components/governance/GovernancePanel'
import { AgentBusPanel }       from '@/components/agentbus/AgentBusPanel'
import { ActivityPanel as ActivityLog } from '@/components/dashboard/ActivityPanel'
import { SearchPanel as HybridSearch } from '@/components/search/SearchPanel'
import { VLAMissionControl }   from '@/components/dashboard/VLAMissionControl'
import { PersonaPlexDuplex as PersonaPlexPanel } from '@/components/dashboard/PersonaPlexDuplex'
import { NemoClawPanel }       from '@/components/dashboard/NemoClawPanel'
import { CaPXBenchmarkPanel as CaPXPanel } from '@/components/dashboard/CaPXBenchmarkPanel'

// UI
import { IntentBar }           from '@/components/ui/IntentBar'
import { ToastContainer }      from '@/components/ui/ToastContainer'

// Hooks
import { useHealth }           from '@/lib/hooks/useHealth'
import { usePersonaPlex }      from '@/lib/hooks/usePersonaPlex'
import { useBusEvent }         from '@/lib/hooks/useBusEvent'
import { bus }                 from '@/lib/events/bus'

// ── Panel registry ────────────────────────────────────────────────────────────

type PanelId =
  | 'health' | 'memory' | 'skills' | 'governance'
  | 'bus'    | 'log'    | 'search' | 'vla'
  | 'persona'| 'nemoclaw' | 'capx'

const PANEL_KEYS: Record<string, PanelId> = {
  '1': 'health', '2': 'memory',   '3': 'skills',    '4': 'governance',
  '5': 'bus',    '6': 'log',      '7': 'search',    '8': 'vla',
  '9': 'persona','0': 'nemoclaw', '-': 'capx',
}

const DEFAULT_PANELS: PanelId[] = ['health', 'memory', 'skills', 'bus', 'vla', 'capx', 'persona']

const panelMotion = {
  initial:   { opacity: 0, scale: 0.97, y: 8 },
  animate:   { opacity: 1, scale: 1,    y: 0 },
  exit:      { opacity: 0, scale: 0.97, y: 8 },
  transition: { duration: 0.18, ease: 'easeOut' as const },
}

// ── Status bar ────────────────────────────────────────────────────────────────

function StatusBar({
  health,
  nodes,
  runs,
  activePersona,
  activePanels,
}: {
  health:        number | null
  nodes:         number | null
  runs:          number | null
  activePersona: string | null
  activePanels:  number
}) {
  const color = health == null ? 'text-gray-600'
    : health >= 80 ? 'text-green-400'
    : health >= 50 ? 'text-yellow-400'
    : 'text-red-400'

  return (
    <div className="flex items-center gap-4 text-xs font-mono text-gray-600 px-1">
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        LIVE
      </span>
      <span>NODES <span className="text-gray-400">{nodes ?? '—'}</span></span>
      <span>RUNS  <span className="text-gray-400">{runs  ?? '—'}</span></span>
      <span>PANELS <span className="text-gray-400">{activePanels}</span></span>
      <span>HEALTH <span className={color}>{health ?? '—'}%</span></span>
      {activePersona && (
        <span>PERSONA <span className="text-purple-400">{activePersona}</span></span>
      )}
      <span className="ml-auto text-gray-700">MEMDEVOS</span>
      <span className="text-gray-700" suppressHydrationWarning>{new Date().toLocaleTimeString()}</span>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [activePanels, setActivePanels] = useState<Set<PanelId>>(new Set(DEFAULT_PANELS))

  const { data: healthData }             = useHealth({ pollIntervalMs: 15_000 })
  const { active: activePersona }        = usePersonaPlex()

  const nodeCount = healthData?.memory?.totalNodes ?? null
  const runCount  = healthData?.skills?.totalRuns ?? null

  // Panel toggle helpers
  const togglePanel = useCallback((id: PanelId) => {
    setActivePanels(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const openPanel  = useCallback((id: PanelId) => {
    setActivePanels(prev => new Set([...prev, id]))
  }, [])

  const closePanel = useCallback((id: PanelId) => {
    setActivePanels(prev => { const n = new Set(prev); n.delete(id); return n })
  }, [])

  // Bus → panel open/close/toggle
  useBusEvent('memdevos:open-panel',   ({ panel }) => openPanel(panel as PanelId),   [openPanel])
  useBusEvent('memdevos:close-panel',  ({ panel }) => closePanel(panel as PanelId),  [closePanel])
  useBusEvent('memdevos:toggle-panel', ({ panel }) => togglePanel(panel as PanelId), [togglePanel])

  // Keyboard shortcuts (1–9, 0, -)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return
      const id = PANEL_KEYS[e.key]
      if (id) togglePanel(id)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [togglePanel])

  // Agent context (uses first idle agent from health or defaults)
  const activeAgentId   = 'agent-default'
  const activePersonaId = activePersona?.personaId ?? null

  return (
    <div className="min-h-screen bg-[#08090a] text-gray-100 flex flex-col">

      {/* ── Top bar ── */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-white/6 bg-[#0a0b0c]/80 backdrop-blur-sm sticky top-0 z-40">
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
            <span className="text-xs font-bold text-black">M</span>
          </div>
          <span className="text-sm font-mono font-semibold text-gray-200">MEMDEVOS</span>
        </div>

        {/* IntentBar — full width */}
        <div className="flex-1">
          <IntentBar
            activeAgentId={activeAgentId}
            activePersonaId={activePersonaId}
          />
        </div>

        {/* Panel toggles */}
        <div className="flex items-center gap-1 shrink-0">
          {(Object.entries(PANEL_KEYS) as [string, PanelId][]).map(([key, id]) => (
            <button
              key={id}
              onClick={() => togglePanel(id)}
              title={`Toggle ${id} (${key})`}
              className={`w-6 h-6 rounded text-xs font-mono transition-colors border ${
                activePanels.has(id)
                  ? 'bg-white/10 border-white/20 text-gray-200'
                  : 'bg-transparent border-white/8 text-gray-700 hover:text-gray-500'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </header>

      {/* ── Panel grid ── */}
      <main className="flex-1 p-3 overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 auto-rows-min">
          <AnimatePresence mode="popLayout">

            {activePanels.has('health') && (
              <motion.div key="health" layout {...panelMotion}>
                <HealthPanel />
              </motion.div>
            )}

            {activePanels.has('memory') && (
              <motion.div key="memory" layout {...panelMotion} className="lg:col-span-2">
                <MemoryExplorer />
              </motion.div>
            )}

            {activePanels.has('skills') && (
              <motion.div key="skills" layout {...panelMotion}>
                <SkillPanel />
              </motion.div>
            )}

            {activePanels.has('governance') && (
              <motion.div key="governance" layout {...panelMotion}>
                <GovernancePanel />
              </motion.div>
            )}

            {activePanels.has('bus') && (
              <motion.div key="bus" layout {...panelMotion}>
                <AgentBusPanel />
              </motion.div>
            )}

            {activePanels.has('log') && (
              <motion.div key="log" layout {...panelMotion}>
                <ActivityLog />
              </motion.div>
            )}

            {activePanels.has('search') && (
              <motion.div key="search" layout {...panelMotion}>
                <HybridSearch />
              </motion.div>
            )}

            {activePanels.has('vla') && (
              <motion.div key="vla" layout {...panelMotion} className="lg:col-span-2">
                <VLAMissionControl />
              </motion.div>
            )}

            {activePanels.has('persona') && (
              <motion.div key="persona" layout {...panelMotion}>
                <PersonaPlexPanel onClose={() => togglePanel('persona')} />
              </motion.div>
            )}

            {activePanels.has('nemoclaw') && (
              <motion.div key="nemoclaw" layout {...panelMotion}>
                <NemoClawPanel />
              </motion.div>
            )}

            {activePanels.has('capx') && (
              <motion.div key="capx" layout {...panelMotion} className="lg:col-span-2">
                <CaPXPanel />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ── Status bar ── */}
      <footer className="px-4 py-1.5 border-t border-white/6 bg-[#0a0b0c]/80 backdrop-blur-sm sticky bottom-0 z-40">
        <StatusBar
          health={healthData?.health ?? null}
          nodes={nodeCount}
          runs={runCount}
          activePersona={activePersona?.slug ?? null}
          activePanels={activePanels.size}
        />
      </footer>

      {/* ── Toast overlay ── */}
      <ToastContainer />
    </div>
  )
}
