'use client'

import { useState, useEffect } from 'react'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { Terminal, Send, Server, Cpu, Database, Activity, GitCommit, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export function SimToRealPipeline() {
  const [deployments, setDeployments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [targetTier, setTargetTier] = useState('SIM_L0')
  const [hardwareTarget, setHardwareTarget] = useState('UNITREE_G1')
  const [autoPromote, setAutoPromote] = useState(true)
  const [triggering, setTriggering] = useState(false)

  const fetchPipelines = async () => {
    try {
      const res = await fetch('/api/ota')
      const data = await res.json()
      if (data.success) {
        setDeployments(data.deployments)
      }
    } catch {
      toast.error('Failed to connect to Deployment Engine')
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
      version: `vla-policy-${Math.floor(Math.random() * 1000)}.onnx`,
      storageUri: `s3://zerogate-models/vla-policy-staging.onnx`,
      targetTier,
      pipelineStage: targetTier === 'SIM_L0' ? 'SIM_L0_BASELINE' : 'REAL_FLEET',
      hardwareTarget,
      autoPromote,
      manifestData: { arch: "arm64", framework: "PyTorch" },
      checksum: "sha256-mock"
    }

    try {
      const res = await fetch('/api/ota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fakePayload)
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Pipeline triggered! Cascaded across ${data.totalCascades} stages.`)
        fetchPipelines() // Refresh immediately
      } else {
        toast.error(`Deploy failed: ${data.error}`)
      }
    } catch (err) {
      toast.error('Network Error during dispatch.')
    } finally {
      setTriggering(false)
    }
  }

  const getStageIcon = (stage: string) => {
    if (stage === 'SIM_L0_BASELINE') return <Database className="w-4 h-4 text-cyan-400" />
    if (stage === 'SIM_L1_HIL') return <Server className="w-4 h-4 text-orange-400" />
    return <Cpu className="w-4 h-4 text-green-400" /> // REAL_FLEET
  }

  return (
    <GlassPanel glow className="col-span-full flex flex-col pt-5 min-h-[400px]">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2 text-indigo-400">
          <GitCommit className="w-4 h-4 text-indigo-500" />
          Autonomous Sim-to-Real Cascade
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-slate-500 flex items-center gap-1"><Activity className="w-3 h-3 text-green-500" /> Governance Validated</span>
      </div>

      <div className="flex gap-4 mb-4">
        {/* Trigger form */}
        <form onSubmit={triggerDeploy} className="w-1/3 bg-black/40 p-4 rounded-lg border border-indigo-500/20 flex flex-col gap-3">
           <h4 className="text-[10px] uppercase tracking-widest text-indigo-300 font-mono mb-2">Configure Cascade</h4>
           
           <label className="text-[9px] uppercase tracking-widest text-slate-400">Hardware Profile</label>
           <select 
             value={hardwareTarget} 
             onChange={e => setHardwareTarget(e.target.value)}
             className="bg-indigo-950/30 text-indigo-400 text-xs font-mono uppercase tracking-widest border border-indigo-500/30 rounded p-2 focus:outline-none"
           >
             <option value="UNITREE_G1">Unitree G1 (Bipedal)</option>
             <option value="QUAD_GENERIC">Generic Quadruped</option>
             <option value="WHEELED">Wheeled Chassis</option>
           </select>

           <label className="text-[9px] uppercase tracking-widest text-slate-400 mt-2">Target Baseline</label>
           <select 
             value={targetTier} 
             onChange={e => setTargetTier(e.target.value)}
             className="bg-indigo-950/30 text-indigo-400 text-xs font-mono uppercase tracking-widest border border-indigo-500/30 rounded p-2 focus:outline-none"
           >
             <option value="SIM_L0">SIM: L0 (Isaac Sim)</option>
             <option value="EDGE">REAL: Hardware Direct</option>
           </select>

           <label className="flex items-center gap-2 mt-2 cursor-pointer group">
              <input type="checkbox" checked={autoPromote} onChange={e => setAutoPromote(e.target.checked)} className="accent-indigo-500" />
              <span className="text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-indigo-300">Autonomous SVR Promotion</span>
           </label>

           <button 
             type="submit" 
             disabled={triggering}
             className="mt-auto bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 p-2 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] font-bold"
           >
             <Send className={`w-3 h-3 ${triggering ? 'animate-pulse' : ''}`} /> Initialize Cascade
           </button>
        </form>

        {/* History / Stages */}
        <div className="flex-1 bg-black/60 p-4 rounded-lg border border-indigo-500/10 overflow-hidden flex flex-col">
          <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-mono mb-4 border-b border-indigo-500/10 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-2"><Terminal className="w-3 h-3 text-indigo-500" /> deploy/cascade/status</span>
          </h4>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-indigo-900/50">
            {loading ? (
               <div className="flex items-center justify-center h-full"><Activity className="w-6 h-6 text-indigo-500/30 animate-spin" /></div>
            ) : deployments.length === 0 ? (
               <div className="text-[10px] text-center uppercase tracking-widest text-slate-600 font-mono py-8 border border-dashed border-slate-800 rounded">No Active Cascades</div>
            ) : (
               <AnimatePresence>
                  {deployments.map((dep, i) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                      key={dep.id} 
                      className="p-3 bg-indigo-950/20 rounded border border-indigo-500/10 flex items-center gap-4"
                    >
                      <div className="p-2 bg-black/40 rounded shadow-inner">
                         {getStageIcon(dep.pipelineStage)}
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase mb-1">
                           <span className="text-indigo-300 font-bold">{dep.pipelineStage.replace('_', ' ')}</span>
                           <span className="text-slate-500">{dep.hardwareTarget}</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-mono whitespace-nowrap">
                           <span className="text-slate-400 truncate w-32">{dep.payload?.version}</span>
                           <span className={dep.status === 'completed' ? 'text-green-500 flex items-center gap-1' : 'text-orange-500 flex items-center gap-1'}>
                             {dep.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                             {dep.status}
                           </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
               </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </GlassPanel>
  )
}
