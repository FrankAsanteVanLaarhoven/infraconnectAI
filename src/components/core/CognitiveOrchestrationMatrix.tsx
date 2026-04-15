// src/components/core/CognitiveOrchestrationMatrix.tsx
'use client'

import { useState } from 'react'
import { GlassPanel, GlassCard } from '@/components/glass/GlassPanel'
import { 
  RefreshCw, Activity, UserCog, UploadCloud, 
  RadioTower, ExternalLink, BookOpen, 
  ShieldCheck, Database, Zap, FileText 
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useMemoryStore } from '@/store/memory-store'
import { motion, AnimatePresence } from 'framer-motion'

export function CognitiveOrchestrationMatrix() {
  const [activePath, setActivePath] = useState<'wiki' | 'canon' | 'scratch'>('scratch')
  const [governanceStage, setGovernanceStage] = useState<'review' | 'ship' | 'release'>('review')
  const [isPromoting, setIsPromoting] = useState(false)
  const addNode = useMemoryStore(s => s.addNode)

  const paths = [
    { id: 'wiki', label: 'Wiki/Projects', icon: BookOpen, desc: 'Project-level documentation and context.' },
    { id: 'canon', label: 'Canon/Standards', icon: ShieldCheck, desc: 'Official enterprise patterns and release records.' },
    { id: 'scratch', label: 'Scratch/WIP', icon: FileText, desc: 'Working memory for active agent tasks.' }
  ]

  const handlePromoteMemory = async () => {
    setIsPromoting(true)
    // Simulating the Governance Promotion Loop: Scratch -> Review -> Ship -> Release -> Canon
    toast.message(`Governance Cycle Initiated`, { 
      description: `Promoting [${activePath.toUpperCase()}] context to ${governanceStage.toUpperCase()} state...` 
    })
    
    setTimeout(() => {
      if (governanceStage === 'review') setGovernanceStage('ship')
      else if (governanceStage === 'ship') setGovernanceStage('release')
      else setGovernanceStage('review')
      
      setIsPromoting(false)
      toast.success(`Context promoted to ${governanceStage.toUpperCase()}`)
    }, 1500)
  }

  return (
    <GlassPanel glow className="col-span-full xl:col-span-1 flex flex-col pt-5">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2 text-foreground">
          <Database className="w-4 h-4 text-foreground" />
          Cognitive Orchestration
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-[#76b900] animate-pulse">Memory Contract: Live</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        
        {/* Memory Contract Path Select */}
        <div className="grid grid-cols-3 gap-1">
          {paths.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePath(p.id as any)}
              className={`p-2 border rounded transition-all flex flex-col items-center gap-1 ${
                activePath === p.id 
                ? 'bg-foreground/10 border-foreground/40 text-foreground' 
                : 'bg-transparent border-border/10 text-muted-foreground hover:bg-foreground/5'
              }`}
            >
              <p.icon className="w-3.5 h-3.5" />
              <span className="text-[8px] uppercase tracking-widest font-bold">{p.id}</span>
            </button>
          ))}
        </div>

        {/* Intelligence Path Context */}
        <GlassCard level="L1" className="p-3 bg-black/40">
          <div className="flex items-center gap-2 mb-2">
            <RadioTower className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">Active Knowledge Lens</span>
          </div>
          <p className="text-[10px] text-foreground font-mono leading-relaxed">
            {paths.find(p => p.id === activePath)?.desc}
          </p>
          <div className="mt-3 text-[9px] text-muted-foreground/60 font-mono flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#76b900] animate-ping" />
            SYNC: {activePath}/* {"->"} NemoClaw/Substrate
          </div>
        </GlassCard>
        
        {/* Governance Workflow Component */}
        <div className="bg-foreground/5 border border-border/10 rounded-md p-4 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-foreground">Governance Flow</span>
            <Badge variant="outline" className="text-[8px] bg-foreground/10 text-foreground uppercase tracking-widest">
              {governanceStage}
            </Badge>
          </div>

          <div className="flex items-center gap-1 h-1.5 bg-border/10 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${
              governanceStage === 'review' ? 'w-1/3 bg-muted-foreground' : 
              governanceStage === 'ship' ? 'w-2/3 bg-foreground' : 'w-full bg-[#76b900]'
            }`} />
          </div>

          <div className="grid grid-cols-3 text-[8px] uppercase tracking-tighter text-muted-foreground/50 font-mono text-center">
            <span className={governanceStage === 'review' ? 'text-foreground font-bold' : ''}>Review</span>
            <span className={governanceStage === 'ship' ? 'text-foreground font-bold' : ''}>Ship</span>
            <span className={governanceStage === 'release' ? 'text-foreground font-bold' : ''}>Release</span>
          </div>
        </div>

        {/* Promotion Trigger */}
        <div className="bg-foreground/5 p-4 rounded-lg border border-border/10 flex flex-col gap-3">
          <p className="text-[9px] text-muted-foreground/60 leading-relaxed font-mono uppercase">
            Release validated knowledge as canonical, creating official records for model re-training and agent alignment.
          </p>
          <button
            onClick={handlePromoteMemory}
            disabled={isPromoting}
            className="group bg-foreground text-background font-mono uppercase tracking-widest text-[10px] py-2.5 rounded flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {isPromoting ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <>
                Promote Context <Zap className="w-3 h-3 group-hover:fill-current" />
              </>
            )}
          </button>
        </div>

      </div>
    </GlassPanel>
  )
}
