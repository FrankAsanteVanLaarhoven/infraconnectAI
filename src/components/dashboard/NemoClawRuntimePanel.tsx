import { useState, useMemo } from 'react'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { Shield, ShieldAlert, Cpu, Activity, Ban, CheckCircle2 } from 'lucide-react'
import { useMemoryStore } from '@/store/memory-store'

export function NemoClawRuntimePanel() {
  const [activePolicy, setActivePolicy] = useState('L2-STRICT')
  const { activityLog } = useMemoryStore()

  const nemoLogs = useMemo(() => {
    return activityLog.filter(log => log.action === 'nemoclaw_block' || log.action === 'nemoclaw_exec').slice(0, 5)
  }, [activityLog])

  const permittedCount = useMemo(() => activityLog.filter(l => l.action === 'nemoclaw_exec').length, [activityLog])
  const blockedCount = useMemo(() => activityLog.filter(l => l.action === 'nemoclaw_block').length, [activityLog])
  
  return (
    <GlassPanel glow className="col-span-full xl:col-span-1 flex flex-col pt-5">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2 text-foreground">
          <Shield className="w-4 h-4 text-foreground" />
          NemoClaw Runtime
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-matrix animate-pulse">Enforcing</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {/* Policy Profile */}
        <div className="flex items-center justify-between bg-foreground/5 p-3 rounded border border-border/10">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-muted-foreground">Current Profile</span>
            <span className="text-sm text-foreground font-mono font-medium">{activePolicy}</span>
          </div>
          <select 
            className="bg-black/40 border border-border/20 text-xs text-foreground p-1 rounded font-mono focus:outline-none"
            value={activePolicy}
            onChange={(e) => setActivePolicy(e.target.value)}
          >
            <option value="L2-STRICT">L2-STRICT (Local Only)</option>
            <option value="L1-AUDIT">L1-AUDIT (Mixed Route)</option>
            <option value="L0-DEV">L0-DEV (Bypass)</option>
          </select>
        </div>
        
        {/* Live Execution Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-foreground/5 border border-border/10 rounded-md p-3 flex flex-col justify-center items-center text-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">Permitted</span>
            <span className="text-sm font-medium text-foreground">{permittedCount}</span>
          </div>
          <div className="bg-foreground/5 border border-orange-500/20 rounded-md p-3 flex flex-col justify-center items-center text-center gap-2">
            <Ban className="w-5 h-5 text-orange-500" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">Blocked</span>
            <span className="text-sm font-medium text-foreground">{blockedCount}</span>
          </div>
        </div>

        {/* Action Traces (Execution Plane) */}
        <div className="bg-foreground/5 p-3 rounded border border-border/10 mt-4 space-y-2">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono border-b border-border/10 pb-1 mb-2">Live Intercepts</div>
          
          {nemoLogs.length > 0 ? nemoLogs.map(log => (
            <div key={log.id} className={`flex items-center justify-between p-2 rounded text-[10px] font-mono gap-3 ${log.action === 'nemoclaw_block' ? 'bg-black/20 border border-orange-500/20' : 'bg-black/20'}`}>
              {log.action === 'nemoclaw_block' ? <ShieldAlert className="w-3 h-3 text-orange-500" /> : <Activity className="w-3 h-3 text-blue-400" />}
              <div className="flex flex-col flex-1 truncate">
                <span className="text-foreground truncate">{log.target}</span>
                <span className={log.action === 'nemoclaw_block' ? 'text-orange-500/80 truncate' : 'text-muted-foreground/50 truncate'}>{log.detail}</span>
              </div>
              <span className={log.action === 'nemoclaw_block' ? 'text-orange-500 font-bold' : 'text-green-500'}>
                {log.action === 'nemoclaw_block' ? 'DENY' : 'PASS'}
              </span>
            </div>
          )) : (
            <div className="text-xs text-muted-foreground/50 italic text-center py-2">No active intercepts recorded...</div>
          )}
        </div>
      </div>
    </GlassPanel>
  )
}
