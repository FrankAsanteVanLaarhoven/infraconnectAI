// src/components/dashboard/NemoClawPanel.tsx
'use client'
// Modified component path to match codebase structure
import { GlassPanel } from '@/components/glass/GlassPanel'
import { Bot, Shield, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useNemoClaw } from '@/lib/hooks/useNemoClaw'
import { bus } from '@/lib/events/bus'

const STATUS_COLOR: Record<string, string> = {
  idle:       'text-gray-400',
  running:    'text-slate-300',
  paused:     'text-yellow-400',
  terminated: 'text-gray-600',
  error:      'text-red-400',
}

const OUTCOME_ICON: Record<string, any> = {
  success:            <CheckCircle className="w-3 h-3 text-slate-300" />,
  failed:             <XCircle     className="w-3 h-3 text-red-400"   />,
  abandoned:          <Clock       className="w-3 h-3 text-gray-500"  />,
  blocked_by_policy:  <Shield      className="w-3 h-3 text-yellow-400"/>,
}

export function NemoClawPanel() {
  const { agents, sessions, loading, error, runSkill } = useNemoClaw()

  return (
    <GlassPanel>
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-4 h-4 text-slate-300" />
        <h3 className="text-sm font-semibold tracking-tight">NemoClaw</h3>
      </div>
      
      {error && (
        <div className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/20 rounded p-2 mb-2">
          ⚠ {error}
        </div>
      )}

      {/* Agents */}
      <div className="mb-3">
        <p className="text-xs font-mono text-gray-600 uppercase tracking-wider mb-1">
          Active Agents ({agents.length})
        </p>
        <div className="space-y-1">
          {agents.map(a => (
            <div key={a.id} className="flex items-center gap-2 text-xs font-mono">
              <span className={STATUS_COLOR[a.status] || 'text-gray-500'}>●</span>
              <span className="text-gray-300">{a.name}</span>
              <span className="text-gray-600 ml-auto">{a.status}</span>
            </div>
          ))}
          {agents.length === 0 && !loading && (
            <div className="text-gray-600 text-xs font-mono">No active agents</div>
          )}
        </div>
      </div>

      {/* Sessions */}
      <div>
        <p className="text-xs font-mono text-gray-600 uppercase tracking-wider mb-1">
          Recent Sessions ({sessions.length})
        </p>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          {sessions.map(s => (
            <div key={s.id} className="flex items-center gap-2 p-1.5 rounded bg-white/5 text-xs font-mono">
              {(OUTCOME_ICON as any)[(s as any).outcome] || <Clock className="w-3 h-3 text-gray-500" />}
              <span className="text-gray-300 truncate flex-1">{s.taskSummary || s.id}</span>
              <span className="text-gray-500 ml-auto">{new Date((s as any).createdAt).toLocaleTimeString()}</span>
            </div>
          ))}
          {sessions.length === 0 && !loading && (
            <div className="text-gray-600 text-xs font-mono">No recent sessions</div>
          )}
        </div>
      </div>
    </GlassPanel>
  )
}
