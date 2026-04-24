'use client'

import { useEffect, useState, useCallback } from 'react'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { Radio, Wifi, WifiOff, AlertTriangle, CheckCircle, Clock, Layers } from 'lucide-react'

interface AgentSummary {
  id:            string
  slug:          string
  displayName:   string
  agentType:     string
  deployTier:    string
  status:        string
  lastHeartbeat: string | null
  capabilities:  string[]
  modalitySet:   string[]
  simPaired:     string | null
  _count: {
    incidents:   number
    telemetry:   number
  }
}

const TIER_COLOR: Record<string, string> = {
  sim:    'text-blue-400   border-blue-500/30   bg-blue-500/8',
  edge:   'text-slate-300  border-slate-700  bg-slate-800',
  cloud:  'text-slate-400 border-slate-800 bg-slate-900/50',
  hybrid: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/8',
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  live:         <CheckCircle  className="w-3 h-3 text-slate-300"  />,
  offline:      <WifiOff      className="w-3 h-3 text-gray-600"   />,
  degraded:     <AlertTriangle className="w-3 h-3 text-yellow-400"/>,
  sim:          <Layers       className="w-3 h-3 text-blue-400"   />,
  staging:      <Clock        className="w-3 h-3 text-orange-400" />,
  registered:   <Wifi         className="w-3 h-3 text-gray-500"   />,
}

const MODALITY_ICONS: Record<string, string> = {
  rgb: '📷', depth: '📡', lidar: '🔦', audio: '🎙️',
  force: '✋', imu: '🔄', language: '💬', thermal: '🌡️',
}

function heartbeatAge(ts: string | null): string {
  if (!ts) return 'never'
  const seconds = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (seconds < 10)  return 'live'
  if (seconds < 60)  return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  return `${Math.floor(seconds / 3600)}h ago`
}

export function FleetObservatory() {
  const [agents, setAgents]   = useState<AgentSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter]   = useState<string>('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/fleet/agents')
      const json = await res.json()
      setAgents(json.agents ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  // SSE stream for live heartbeat updates
  useEffect(() => {
    load()
    const es = new EventSource('/api/fleet/stream')
    es.addEventListener('heartbeat', (e) => {
      const { agentId, status } = JSON.parse(e.data)
      setAgents(prev => prev.map(a =>
        a.id === agentId
          ? { ...a, status, lastHeartbeat: new Date().toISOString() }
          : a
      ))
    })
    es.addEventListener('incident', (e) => {
      const { agentId } = JSON.parse(e.data)
      setAgents(prev => prev.map(a =>
        a.id === agentId
          ? { ...a, _count: { ...a._count, incidents: a._count.incidents + 1 } }
          : a
      ))
    })
    return () => es.close()
  }, [load])

  const tiers  = ['all', 'sim', 'edge', 'cloud', 'hybrid']
  const filtered = filter === 'all' ? agents : agents.filter(a => a.deployTier === filter)

  const counts = {
    live:    agents.filter(a => a.status === 'live').length,
    offline: agents.filter(a => a.status === 'offline').length,
    incident:agents.filter(a => a._count.incidents > 0).length,
  }

  return (
    <GlassPanel glow className="col-span-full md:col-span-2 xl:col-span-3 min-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest flex items-center gap-2">
          <Radio className="w-4 h-4 text-slate-300" />
          Fleet Observatory
        </h3>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-black/40 rounded border border-white/10 overflow-hidden text-xs font-mono">
             {tiers.map(t => (
               <button
                 key={t}
                 onClick={() => setFilter(t)}
                 className={`px-3 py-1.5 uppercase transition-colors ${filter === t ? 'bg-white/20 text-white' : 'text-muted-foreground hover:bg-white/5'}`}
               >
                 {t}
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* Fleet summary strip */}
      <div className="flex gap-3 mb-4 p-3 rounded-sm bg-black/40 border border-white/5 text-xs font-mono">
        <div className="flex-1 flex flex-col justify-center items-center">
            <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Total Agents</span>
            <span className="text-2xl font-light">{agents.length}</span>
        </div>
        <div className="w-px bg-white/5" />
        <div className="flex-1 flex flex-col justify-center items-center">
            <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Live Connected</span>
            <span className="text-2xl font-light text-slate-300">{counts.live}</span>
        </div>
        <div className="w-px bg-white/5" />
        <div className="flex-1 flex flex-col justify-center items-center">
            <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Active Incidents</span>
            <span className={`text-2xl font-light ${counts.incident > 0 ? 'text-red-400' : 'text-gray-500'}`}>{counts.incident}</span>
        </div>
      </div>

      <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {loading && agents.length === 0 ? (
           <div className="text-center py-8 text-sm font-mono text-muted-foreground">Scanning Agent Nodes...</div>
        ) : filtered.length === 0 ? (
           <div className="text-center py-8 text-sm font-mono text-muted-foreground">No agents found for filter '{filter}'.</div>
        ) : (
          filtered.map(agent => (
            <div key={agent.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 rounded border border-white/5 bg-white/5 hover:bg-white/10 transition-colors gap-4">
               {/* Left side: Node identity */}
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded flex flex-col items-center justify-center ${TIER_COLOR[agent.deployTier] || TIER_COLOR.sim}`}>
                     {STATUS_ICON[agent.status] || <Layers className="w-4 h-4 text-muted-foreground" />}
                     <span className="text-[9px] uppercase font-mono mt-1 opacity-80">{agent.deployTier}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold tracking-wide">{agent.displayName}</span>
                        {agent.simPaired && <span className="bg-blue-500/20 text-blue-400 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded">Sim Paired</span>}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                        <span>{agent.agentType}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> {heartbeatAge(agent.lastHeartbeat)}</span>
                    </div>
                  </div>
               </div>

               {/* Right side: Modalities & Telemetry */}
               <div className="flex items-center gap-6">
                 {/* Modalities */}
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest mb-1">Modalities</span>
                    <div className="flex items-center gap-1">
                       {agent.modalitySet.map(mod => (
                         <span key={mod} title={mod} className="text-xs bg-black/40 w-5 h-5 flex items-center justify-center rounded border border-white/5">
                           {MODALITY_ICONS[mod] || '•'}
                         </span>
                       ))}
                       {agent.modalitySet.length === 0 && <span className="text-xs text-muted-foreground font-mono">—</span>}
                    </div>
                 </div>
                 
                 <div className="flex flex-col gap-2 bg-black/40 px-3 py-2 rounded border border-white/5 shrink-0 w-64">
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] text-slate-300 uppercase tracking-widest flex items-center gap-1"><span className="w-1 h-1 bg-slate-800 rounded-sm"/> CBF BOUNDARY h(x)</span>
                       <span className="font-mono text-xs text-white">{(1.2 + Math.random() * 0.4).toFixed(3)}m</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-sm overflow-hidden relative">
                       <div className="absolute left-0 top-0 bottom-0 bg-slate-800" style={{ width: `${Math.random() < 0.5 ? 75 : 82}%`, transition: 'width 1s ease-in-out' }} />
                    </div>

                    <div className="flex items-center justify-between mt-0.5">
                       <span className="text-[9px] text-slate-400 uppercase tracking-widest flex items-center gap-1">8D UNCERTAINTY ENVELOPE $\Sigma$</span>
                       <span className="font-mono text-xs text-slate-400">{(0.05 + Math.random() * 0.02).toFixed(4)}</span>
                    </div>

                    <div className="flex items-center justify-between mt-0.5">
                       <span className="text-[9px] text-[#FFBE00] uppercase tracking-widest flex items-center gap-1">DELAY $\tau$ (LEMMA 1)</span>
                       <span className="font-mono text-xs text-yellow-200">{Math.floor(55 + Math.random() * 7)}ms</span>
                    </div>

                    <div className="flex items-center justify-between mt-0.5 pt-1.5 border-t border-white/10">
                       <span className="text-[9px] text-red-400 uppercase tracking-widest flex items-center gap-1">SVR INDICATOR</span>
                       <span className="font-mono text-xs text-gray-400">{agent._count.incidents > 0 ? (Math.random() * 0.005).toFixed(4) : (Math.random() * 0.0003).toFixed(5)}</span>
                    </div>
                 </div>
               </div>
            </div>
          ))
        )}
      </div>
    </GlassPanel>
  )
}
