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
  edge:   'text-green-400  border-green-500/30  bg-green-500/8',
  cloud:  'text-purple-400 border-purple-500/30 bg-purple-500/8',
  hybrid: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/8',
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  live:         <CheckCircle  className="w-3 h-3 text-green-400"  />,
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
          <Radio className="w-4 h-4 text-green-400" />
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
      <div className="flex gap-3 mb-4 p-3 rounded-lg bg-black/40 border border-white/5 text-xs font-mono">
        <div className="flex-1 flex flex-col justify-center items-center">
            <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Total Agents</span>
            <span className="text-2xl font-light">{agents.length}</span>
        </div>
        <div className="w-px bg-white/5" />
        <div className="flex-1 flex flex-col justify-center items-center">
            <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Live Connected</span>
            <span className="text-2xl font-light text-green-400">{counts.live}</span>
        </div>
        <div className="w-px bg-white/5" />
        <div className="flex-1 flex flex-col justify-center items-center">
            <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Active Incidents</span>
            <span className={`text-2xl font-light ${counts.incident > 0 ? 'text-red-400' : 'text-gray-500'}`}>{counts.incident}</span>
        </div>
      </div>

      <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {loading && agents.length === 0 ? (
           <div className="text-center py-8 text-sm font-mono text-muted-foreground animate-pulse">Scanning Agent Nodes...</div>
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
                 
                 <div className="bg-black/40 px-3 py-1.5 rounded flex items-center gap-4 text-xs font-mono border border-white/5 shrink-0">
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] text-muted-foreground uppercase opacity-70">Telemetry</span>
                        <span className="font-medium">{agent._count.telemetry}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] text-muted-foreground uppercase opacity-70">Incidents</span>
                        <span className={`font-medium ${agent._count.incidents > 0 ? 'text-red-400' : 'text-gray-500'}`}>{agent._count.incidents}</span>
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
