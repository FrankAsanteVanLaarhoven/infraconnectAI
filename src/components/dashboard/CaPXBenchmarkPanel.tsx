import { useState } from 'react'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { Target, BarChart2, ShieldAlert, GitMerge, FileCode, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { useCaPX } from '@/lib/hooks/useCaPX'

export function CaPXBenchmarkPanel() {
  const { data, loading, importTraces } = useCaPX({ pollIntervalMs: 10000 })
  const hasImported = data?.projection?.loaded ?? false
  const isImporting = loading

  const handleImportTraces = async () => {
    await importTraces()
    toast.success("CaP-X Traces imported and aligned with NemoClaw")
  }

  return (
    <GlassPanel glow className="col-span-full xl:col-span-2 flex flex-col pt-5">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2 text-foreground">
          <Target className="w-4 h-4 text-foreground" />
          CaP-X Validation Substrate
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-[#76b900] animate-pulse">Ablation Mode Active</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        
        {/* Metric Overlay */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-foreground/5 p-3 rounded border border-border/10 text-center">
            <span className="text-xl font-mono text-foreground font-light mb-1 block">{hasImported ? `${((data?.projection.taskSuccess || 0) * 100).toFixed(1)}%` : 'N/A'}</span>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Task Success</span>
          </div>
          <div className="bg-foreground/5 p-3 rounded border border-border/10 text-center">
            <span className={hasImported ? "text-xl font-mono text-green-400 font-light mb-1 block" : "text-xl font-mono text-foreground font-light mb-1 block"}>{hasImported ? `${((data?.projection.policyViolations || 0) * 100).toFixed(1)}%` : 'N/A'}</span>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Policy Violations</span>
          </div>
          <div className="bg-foreground/5 p-3 rounded border border-border/10 text-center">
            <span className="text-xl font-mono text-foreground font-light mb-1 block">{hasImported ? `${((data?.projection.autoRecovery || 0) * 100).toFixed(1)}%` : 'N/A'}</span>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Auto-Recovery</span>
          </div>
          <div className="bg-foreground/5 p-3 rounded border border-border/10 text-center">
            <span className="text-xl font-mono text-foreground font-light mb-1 block">{hasImported ? (data?.projection.abstractionLayer || 'S4') : 'N/A'}</span>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Abstraction Layer</span>
          </div>
        </div>

        {/* Episode Viewer & Traces */}
        <div className="bg-foreground/5 p-4 rounded border border-border/10">
          <h4 className="text-[10px] uppercase tracking-widest text-foreground font-mono mb-3 border-b border-border/20 pb-2 flex items-center justify-between">
            <span>Episode Viewer / Traces</span>
            <span className="text-muted-foreground">{hasImported ? '100+ Manipulation Tasks' : 'No Datasets Loaded'}</span>
          </h4>
          
          <div className="space-y-2">
            {!hasImported ? (
              <div className="text-xs text-muted-foreground font-mono text-center py-4">Awaiting trace import to generate visualisations.</div>
            ) : (
             <>
               {data?.episodes?.slice(0, 10).map(ep => {
                 const isPass = ep.status === 'passed'
                 const isRecov = ep.status === 'recovered'
                 const isBlock = ep.status === 'blocked' || ep.status === 'failed'
                 
                 const color = isPass ? 'text-[#76b900]' : isRecov ? 'text-blue-400' : 'text-orange-400'
                 const Icon = isPass ? CheckCircle2 : isRecov ? RotateCcw : ShieldAlert

                 return (
                   <div key={ep.id} className={`flex items-center justify-between bg-black/20 p-2 rounded text-xs gap-3 font-mono ${isBlock ? 'border border-orange-500/30' : ''}`}>
                     <Icon className={`w-4 h-4 ${color}`} />
                     <div className="flex-1 truncate">Task: <span className="text-foreground">{ep.taskId}</span></div>
                     <div className="text-[9px] px-2 py-1 bg-foreground/10 rounded">{ep.abstractionLayer}</div>
                     <div className={`${color} font-bold w-16 text-right uppercase text-[10px]`}>{ep.status}</div>
                   </div>
                 )
               })}
             </>
            )}
          </div>
        </div>

        {/* Abstraction Ladder */}
        <div className="grid grid-cols-2 gap-4">
           {/* Architecture Stratification */}
          <div className="bg-foreground/5 p-4 rounded border border-border/10 flex flex-col justify-center">
            <h4 className="text-[10px] uppercase tracking-widest text-foreground font-mono mb-2 pb-2">Architecture Stack</h4>
            <ul className="text-xs space-y-2 text-muted-foreground font-mono">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"/> PersonaPlex &mdash; Teaming loop</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"/> MEMDEVOS &mdash; Governance layer</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#76b900]"/> NemoClaw &mdash; Secure runtime</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white"/> CaP-Agent &mdash; Substrate code</li>
            </ul>
          </div>
          <button onClick={handleImportTraces} disabled={isImporting || hasImported} className="hover:bg-foreground/10 disabled:opacity-50 transition-colors bg-foreground/5 p-4 rounded border border-border/10 flex flex-col justify-center text-center items-center">
            <GitMerge className={`w-6 h-6 mx-auto mb-2 text-muted-foreground ${isImporting ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-mono tracking-widest text-foreground uppercase block mb-1">
                {hasImported ? 'Dataset Active' : isImporting ? 'Ingesting...' : 'Import Traces'}
            </span>
            <p className="text-[10px] text-muted-foreground">Import CaP-X zero-shot execution logs for gap analysis & reality transfer.</p>
          </button>
        </div>

      </div>
    </GlassPanel>
  )
}
