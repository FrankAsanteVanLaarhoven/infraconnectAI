'use client'

import { useState, useEffect } from 'react'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { Terminal, Send, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { bus } from '@/lib/events/bus'

export function OTAPipelinePanel() {
  const [deployments, setDeployments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [targetTier, setTargetTier] = useState('EDGE')
  const [triggering, setTriggering] = useState(false)

  const fetchPipelines = async () => {
    try {
      const res = await fetch('/api/ota')
      const data = await res.json()
      if (data.success) {
        setDeployments(data.deployments)
      }
    } catch {
      toast.error('Failed to connect to OTA Deployment Engine')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPipelines()
  }, [])

  const triggerDeploy = async (e: React.FormEvent) => {
    e.preventDefault()
    setTriggering(true)

    // Simulate an actual OTA payload generated from the CI system
    const fakePayload = {
      version: `vla-os-${Math.floor(Math.random() * 1000)}.whl`,
      storageUri: `s3://zerogate-models/vla-os-staging.whl`,
      targetTier,
      manifestData: { arch: "arm64", hardware: "Jetson Orin NX" },
      checksum: "sha256-abc123mock"
    }

    try {
      const res = await fetch('/api/ota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fakePayload)
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`OTA Pipeline triggered for ${data.targetedNodes} nodes!`)
        fetchPipelines() // Refresh immediately
      } else {
        toast.error(`Deploy failed: ${data.error}`)
      }
    } catch (err) {
      toast.error('Network Error during OTA dispatch.')
    } finally {
      setTriggering(false)
    }
  }

  return (
    <GlassPanel glow className="col-span-full xl:col-span-1 flex flex-col pt-5 min-h-[400px]">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2 text-orange-400">
          <Terminal className="w-4 h-4 text-orange-500" />
          OTA CI/CD Pipeline
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-slate-500">Fleet Rollout Engine</span>
      </div>

      <div className="flex-1 space-y-4">
        
        {/* Trigger form */}
        <form onSubmit={triggerDeploy} className="bg-black/40 p-4 rounded-lg border border-orange-500/20 shadow-inner flex flex-col gap-3">
           <h4 className="text-[10px] uppercase tracking-widest text-orange-300 font-mono mb-1">Trigger Fleet Rollout</h4>
           <div className="flex items-center gap-2">
             <select 
               value={targetTier} 
               onChange={e => setTargetTier(e.target.value)}
               className="bg-orange-950/30 text-orange-400 text-xs font-mono uppercase tracking-widest border border-orange-500/30 rounded p-2 focus:outline-none flex-1"
             >
               <option value="EDGE">Edge Nodes (Jetson)</option>
               <option value="SIM">Simulators (L0)</option>
               <option value="CLOUD">Cloud Arbiters</option>
             </select>
             <button 
               type="submit" 
               disabled={triggering}
               className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 p-2 rounded transition-colors disabled:opacity-50"
             >
               <Send className={`w-4 h-4 ${triggering ? 'animate-pulse' : ''}`} />
             </button>
           </div>
        </form>

        {/* History */}
        <div className="flex-1 overflow-y-auto space-y-2 max-h-[200px]">
          {loading ? (
             <div className="flex items-center justify-center p-6"><Activity className="w-6 h-6 text-orange-500/30 animate-spin" /></div>
          ) : deployments.length === 0 ? (
             <div className="text-[10px] text-center uppercase tracking-widest text-slate-600 font-mono py-8 border border-dashed border-slate-800 rounded">No Active Deployments</div>
          ) : (
             <AnimatePresence>
                {deployments.map((dep, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    key={dep.id} 
                    className="p-3 bg-black/60 rounded-lg border-l-2 border-orange-500 flex flex-col gap-1 border-y border-r border-orange-500/10"
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase">
                       <span className="text-orange-400 break-all">{dep.payload?.version}</span>
                       <span className={dep.status === 'completed' ? 'text-green-500' : 'text-orange-500'}>{dep.status}</span>
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                       <span>{dep.targetTier} Tier</span>
                       <span>{(dep.agentSuccessIds?.length || 0)} Successful</span>
                    </div>
                  </motion.div>
                ))}
             </AnimatePresence>
          )}
        </div>

      </div>
    </GlassPanel>
  )
}
