// src/app/dashboard/page.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'

// Core Mission Control Engines
import { AgentOperationsCenter as AgentOpsPanel } from '@/components/core/AgentOperationsCenter'
import { ModelPerformanceMatrix as ModelPerfPanel } from '@/components/core/ModelPerformanceMatrix'
import { OTAPipelinePanel } from '@/components/dashboard/OTAPipelinePanel'
import { SimToRealPipeline } from '@/components/dashboard/SimToRealPipeline'
import { CognitiveOrchestrationMatrix as CognitivePanel } from '@/components/core/CognitiveOrchestrationMatrix'

// Supplementary Panels
import { HealthPanel }         from '@/components/dashboard/HealthPanel'
import { MemoryExplorer }      from '@/components/dashboard/MemoryExplorer'
import { SkillLifecycle as SkillPanel } from '@/components/skills/SkillLifecycle'
import { GovernancePanel }     from '@/components/governance/GovernancePanel'
import { CompliancePanel }     from '@/components/governance/CompliancePanel'
import { AgentBusPanel }       from '@/components/agentbus/AgentBusPanel'
import { ActivityPanel as ActivityLog } from '@/components/dashboard/ActivityPanel'
import { SearchPanel as HybridSearch } from '@/components/search/SearchPanel'
import { IntelligenceGlobe }   from '@/components/dashboard/IntelligenceGlobe'
import { NeuralTopology }      from '@/components/dashboard/NeuralTopology'
import { NemoClawPanel }       from '@/components/dashboard/NemoClawPanel'
import { FleetObservatory }    from '@/components/dashboard/FleetObservatory'
// Nexus Intelligence Hubs
import { MaritimeIntelligenceHub } from '@/components/nexus/MaritimeIntelligenceHub'
import { EconomicThreatRadar }    from '@/components/nexus/EconomicThreatRadar'
import { SwarmOrchestrator }       from '@/components/nexus/SwarmOrchestrator'
import { AssetIntelligenceHub }    from '@/components/nexus/AssetIntelligenceHub'
import { EnergySectorLens }        from '@/components/nexus/EnergySectorLens'
import { LegalIntelligenceHub }    from '@/components/nexus/LegalIntelligenceHub'
import { StrategicReportView }     from '@/components/nexus/StrategicReportView'
import { ValidationReport }        from '@/components/nexus/ValidationReport'
import { StrategicNexusHub }       from '@/components/nexus/StrategicNexusHub'

import { EphemeralZone }       from '@/components/dashboard/EphemeralZone'
import TrustPanel            from '@/components/operator/TrustPanel'
import { useActivityBridge } from '@/lib/hooks/useActivityBridge'

// UI Components
import { IntentBar }           from '@/components/ui/IntentBar'
import { ToastContainer }      from '@/components/ui/ToastContainer'
import { InfraConnectLogo }    from '@/components/ui/InfraConnectLogo'
import { NexusUplinkBeacon }   from '@/components/ui/NexusUplinkBeacon'

// Hooks
import { useHealth }           from '@/lib/hooks/useHealth'
import { useCognitiveCore }    from '@/lib/hooks/useCognitiveCore'
import { useBusEvent }         from '@/lib/hooks/useBusEvent'

// ── Panel registry ────────────────────────────────────────────────────────────

type PanelId =
  | 'health' | 'memory' | 'skills' | 'governance'
  | 'bus'    | 'log'    | 'search' | 'agent-ops'
  | 'cognitive'| 'nemoclaw' | 'model-perf' | 'ota' | 'sim2real' | 'fleet' | 'trust' | 'compliance' | 'atlas' | 'topology'
  | 'maritime' | 'economic' | 'swarm' | 'asset' | 'energy' | 'legal' | 'strategic-report' | 'validation-report' | 'nexus-core'

const PANEL_KEYS: Record<string, PanelId> = {
  '1': 'health', '2': 'memory',   '3': 'skills',     '4': 'governance',
  '5': 'bus',    '6': 'log',      '7': 'search',     '8': 'agent-ops',
  '9': 'cognitive','0': 'nemoclaw', '-': 'model-perf', '_': 'ota', '+': 'sim2real', '=': 'fleet', 'p': 'trust', 'c': 'compliance', 'A': 'atlas', 'N': 'topology',
  'm': 'maritime', 'e': 'economic', 's': 'swarm', 'b': 'asset', 'g': 'energy', 'l': 'legal', 'r': 'strategic-report', 'v': 'validation-report', 'x': 'nexus-core',
}

const DEFAULT_PANELS: PanelId[] = ['health', 'memory', 'skills', 'bus', 'agent-ops', 'model-perf', 'cognitive', 'fleet']

const panelMotion = {
  initial:   { opacity: 0, scale: 0.98, y: 12 },
  animate:   { opacity: 1, scale: 1,    y: 0 },
  exit:      { opacity: 0, scale: 0.98, y: 12 },
  transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
}

// ── Status bar ────────────────────────────────────────────────────────────────

function StatusBar({
  health,
  nodes,
  runs,
  activeCognitive,
  activePanels,
  isAuthorized,
}: {
  health:          number | null
  nodes:           number | null
  runs:            number | null
  activeCognitive: string | null
  activePanels:    number
  isAuthorized:    boolean
}) {
  const pulseColor = health == null ? 'bg-slate-600' : health >= 80 ? 'bg-cyan-500' : 'bg-red-500'

  return (
    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 px-1 tracking-[0.15em] uppercase opacity-70 hover:opacity-100 transition-opacity">
      <span className="flex items-center gap-2 text-slate-400">
        <span className={`w-1.5 h-1.5 rounded-full ${pulseColor} animate-pulse shadow-[0_0_8px_currentColor]`} />
        Secure Mission Link
      </span>
      <span>Knowledge Nodes <span className="text-foreground font-bold">{nodes ?? '—'}</span></span>
      <span>Agent Cycles <span className="text-foreground font-bold">{runs  ?? '—'}</span></span>
      <span>Active Viewports <span className="text-foreground font-bold">{activePanels}</span></span>
      {activeCognitive && (
        <span className="hidden md:inline">Intelligence Context <span className="text-cyan-400 font-bold">{activeCognitive}</span></span>
      )}
      
      {/* SOTA NEXUS UPLINK (GATED) */}
      <NexusUplinkBeacon isAuthorized={isAuthorized} className="ml-4" />

      <span className="ml-auto text-slate-700 font-bold border border-slate-800/40 px-2 py-0.5 rounded bg-black/50 tracking-widest">INFRA-SIGHT OS // 1.0.0</span>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [activePanels, setActivePanels] = useState<Set<PanelId>>(new Set(DEFAULT_PANELS))

  const { data: session } = useSession()
  const { data: healthData }             = useHealth({ pollIntervalMs: 15_000 })
  const { active: activeCognitive }      = useCognitiveCore()

  const nodeCount = healthData?.memory?.totalNodes ?? null
  const runCount  = healthData?.skills?.totalRuns ?? null
  
  const isAuthorized = session?.user?.role === 'superadmin' || (session?.user as any)?.role === 'admin'

  const togglePanel = useCallback((id: PanelId) => {
    setActivePanels(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const openPanel  = useCallback((id: PanelId) => setActivePanels(prev => new Set([...prev, id])), [])
  const closePanel = useCallback((id: PanelId) => setActivePanels(prev => { const n = new Set(prev); n.delete(id); return n }), [])
  
  // Real-time Event Bridging
  useActivityBridge()

  // Event Orchestration
  useBusEvent('infraconnect:open-panel',   ({ panel }) => openPanel(panel as PanelId),   [openPanel])
  useBusEvent('infraconnect:close-panel',  ({ panel }) => closePanel(panel as PanelId),  [closePanel])
  useBusEvent('infraconnect:toggle-panel', ({ panel }) => togglePanel(panel as PanelId), [togglePanel])

  // Tactical Keybindings
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return
      const id = PANEL_KEYS[e.key]
      if (id) togglePanel(id)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [togglePanel])

  return (
    <div className="min-h-screen bg-[#020202] text-gray-100 flex flex-col selection:bg-cyan-500/30">

      {/* ── Mission Control Header ── */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-40 shadow-2xl">
        <div className="flex items-center pl-2 gap-2 h-full w-[200px] md:w-[260px] shrink-0 overflow-hidden">
          <InfraConnectLogo variant="flat" size="sm" />
        </div>

        <div className="flex-1">
          <IntentBar
            activeAgentId="command-agent-01"
            activePersonaId={activeCognitive?.slug || 'alpha-prime'}
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pl-4 border-l border-white/5">
          {(Object.entries(PANEL_KEYS) as [string, PanelId][]).map(([key, id]) => (
            <button
              key={id}
              onClick={() => togglePanel(id)}
              title={`Toggle ${id.replace('-', ' ')} (${key})`}
              className={`w-7 h-7 rounded-lg text-[9px] font-black font-mono transition-all border shadow-sm ${
                activePanels.has(id)
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-cyan-500/10'
                  : 'bg-transparent border-white/5 text-slate-600 hover:text-slate-400 hover:border-white/10'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </header>

      {/* ── Intelligence Grid ── */}
      <main className="flex-1 p-4 overflow-x-hidden overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-min max-w-[1800px] mx-auto">
          <AnimatePresence mode="popLayout">
            {activePanels.has('atlas') && (
              <motion.div key="atlas" layout {...panelMotion} className="lg:col-span-2 xl:col-span-2">
                <IntelligenceGlobe />
              </motion.div>
            )}

            {activePanels.has('topology') && (
              <motion.div key="topology" layout {...panelMotion} className="lg:col-span-2 xl:col-span-2">
                <NeuralTopology />
              </motion.div>
            )}

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

            {/* Core Mission Engines */}
            {activePanels.has('agent-ops') && (
              <motion.div key="agent-ops" layout {...panelMotion} className="lg:col-span-2">
                <AgentOpsPanel />
              </motion.div>
            )}

            {activePanels.has('cognitive') && (
              <motion.div key="cognitive" layout {...panelMotion}>
                <CognitivePanel />
              </motion.div>
            )}

            {activePanels.has('model-perf') && (
              <motion.div key="model-perf" layout {...panelMotion} className="lg:col-span-2">
                <ModelPerfPanel />
              </motion.div>
            )}

            {activePanels.has('ota') && (
              <motion.div key="ota" layout {...panelMotion}>
                <OTAPipelinePanel />
              </motion.div>
            )}

            {activePanels.has('sim2real') && (
              <motion.div key="sim2real" layout {...panelMotion} className="lg:col-span-2">
                <SimToRealPipeline />
              </motion.div>
            )}

            {/* Tactical Peripherals */}
            {activePanels.has('governance') && (
              <motion.div key="governance" layout {...panelMotion}>
                <GovernancePanel />
              </motion.div>
            )}

            {activePanels.has('compliance') && (
              <motion.div key="compliance" layout {...panelMotion}>
                <CompliancePanel />
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

            {activePanels.has('nemoclaw') && (
              <motion.div key="nemoclaw" layout {...panelMotion}>
                <NemoClawPanel />
              </motion.div>
            )}

            {activePanels.has('fleet') && (
              <motion.div key="fleet" layout {...panelMotion}>
                <FleetObservatory />
              </motion.div>
            )}

            {activePanels.has('trust') && (
              <motion.div key="trust" layout {...panelMotion}>
                <TrustPanel isEmbedded />
              </motion.div>
            )}

            {/* Strategic Nexus Hubs */}
            {activePanels.has('maritime') && (
              <motion.div key="maritime" layout {...panelMotion} className="lg:col-span-2">
                <MaritimeIntelligenceHub isEmbedded />
              </motion.div>
            )}

            {activePanels.has('economic') && (
              <motion.div key="economic" layout {...panelMotion}>
                <EconomicThreatRadar isEmbedded />
              </motion.div>
            )}

            {activePanels.has('swarm') && (
              <motion.div key="swarm" layout {...panelMotion} className="lg:col-span-2">
                <SwarmOrchestrator />
              </motion.div>
            )}

            {activePanels.has('asset') && (
              <motion.div key="asset" layout {...panelMotion}>
                <AssetIntelligenceHub />
              </motion.div>
            )}

            {activePanels.has('energy') && (
              <motion.div key="energy" layout {...panelMotion}>
                <EnergySectorLens />
              </motion.div>
            )}

            {activePanels.has('legal') && (
              <motion.div key="legal" layout {...panelMotion}>
                <LegalIntelligenceHub />
              </motion.div>
            )}

            {activePanels.has('strategic-report') && (
              <motion.div key="strategic-report" layout {...panelMotion} className="lg:col-span-2">
                <StrategicReportView />
              </motion.div>
            )}

            {activePanels.has('validation-report') && (
              <motion.div key="validation-report" layout {...panelMotion}>
                <ValidationReport />
              </motion.div>
            )}

            {activePanels.has('nexus-core') && (
              <motion.div key="nexus-core" layout {...panelMotion} className="lg:col-span-2">
                <StrategicNexusHub />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ── Status Telemetry ── */}
      <footer className="px-4 py-2 border-t border-white/5 bg-[#050505]/90 backdrop-blur-xl sticky bottom-0 z-40">
        <StatusBar
          health={healthData?.health ?? null}
          nodes={nodeCount}
          runs={runCount}
          activeCognitive={activeCognitive?.slug ?? null}
          activePanels={activePanels.size}
          isAuthorized={isAuthorized}
        />
      </footer>

      <ToastContainer />
      <EphemeralZone />
    </div>
  )
}
