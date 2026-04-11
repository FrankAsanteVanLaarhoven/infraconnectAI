import { useState } from 'react'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { Mic, Activity, UserCog, UploadCloud, RadioTower, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useMemoryStore } from '@/store/memory-store'
import { PersonaPlexDuplex } from './PersonaPlexDuplex'

export function PersonaPlexIntegration() {
  const [activeRole, setActiveRole] = useState('commander')
  const [isPiping, setIsPiping] = useState(false)
  const [isDuplexOpen, setIsDuplexOpen] = useState(false)
  const addNode = useMemoryStore(s => s.addNode)

  const roles = [
    { id: 'commander', label: 'Mission Commander', desc: 'Concise, action-biased updates' },
    { id: 'auditor', label: 'Safety Auditor', desc: 'Conservative, cites constraints' },
    { id: 'researcher', label: 'Research Copilot', desc: 'Exploratory, compares experiments' },
    { id: 'executive', label: 'Executive Assistant', desc: 'Personalized, tracks preferences' }
  ]

  const handleSimulateTranscript = async () => {
    setIsPiping(true)
    const transcriptId = crypto.randomUUID()
    toast.success(`Capturing PersonaPlex duplex buffer to L0 Memory...`)
    
    // Simulating the PersonaPlex interaction distilling directives to L0
    setTimeout(async () => {
      try {
        await fetch('/api/memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Voice Session: ${activeRole.toUpperCase()} Directive`,
            content: `Operator transcribed input during ${activeRole} mode.\n\n"Hold execution of the ur5e baseline script and prioritize latency over payload capacity for the next batch test."`,
            level: 'L0',
            plane: 'execution',
            category: 'telemetry',
            status: 'scratch',
            tags: ['personaplex', 'voice-interaction', activeRole],
          })
        });

        // Update the client state directly to reflect immediate effect
        addNode({
            id: transcriptId,
            title: `Voice Session: ${activeRole.toUpperCase()} Directive`,
            content: `Operator transcribed input during ${activeRole} mode.\n\n"Hold execution of the ur5e baseline script and prioritize latency over payload capacity for the next batch test."`,
            level: 'L0',
            plane: 'execution',
            category: 'telemetry',
            status: 'scratch',
            parentId: null,
            tags: ['personaplex', 'voice-interaction', activeRole],
            healthScore: 1.0,
            conflictCount: 0,
            referenceCount: 0,
            lastValidated: null,
            expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        })
        toast.message(`Pipeline complete`, { description: `Voice directive injected into execution plane as node ${transcriptId.slice(0,6)}...`})
      } catch (err) {
        toast.error('L0 Ingest Failed')
      } finally {
        setIsPiping(false)
      }
    }, 1500)
  }

  return (
    <GlassPanel glow className="col-span-full xl:col-span-1 flex flex-col pt-5">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2 text-foreground">
          <Mic className="w-4 h-4 text-foreground" />
          PersonaPlex Layer
        </h3>
        {isPiping ? (
          <span className="text-[10px] uppercase tracking-widest text-[#76b900] animate-pulse">Piping to L0</span>
        ) : (
          <span className="text-[10px] uppercase tracking-widest text-matrix animate-pulse">Listening</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Interaction Role Config */}
        <div className="flex flex-col gap-2 bg-foreground/5 p-3 rounded border border-border/10">
          <div className="flex items-center gap-2 mb-1">
            <UserCog className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">Operator Role Model</span>
          </div>
          <select 
            className="bg-black/40 border border-border/20 text-xs text-foreground p-2 rounded font-mono focus:outline-none w-full"
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value)}
          >
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
          <div className="text-[10px] text-muted-foreground/70 italic px-1 mt-1">
            {roles.find(r => r.id === activeRole)?.desc}
          </div>
        </div>
        
        {/* Connection & Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-foreground/5 border border-border/10 rounded-md p-3 flex flex-col justify-center items-center text-center gap-2">
            <RadioTower className="w-5 h-5 text-green-500" />
            <span className="text-xs font-medium text-foreground">Duplex Active</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">ws://localhost:8998</span>
          </div>
          <button 
            disabled={isPiping}
            onClick={handleSimulateTranscript}
            className="hover:bg-foreground/10 transition-colors bg-foreground/5 border border-border/10 rounded-md p-3 flex flex-col justify-center items-center text-center gap-2"
          >
            <UploadCloud className={`w-5 h-5 ${isPiping ? 'text-[#76b900] animate-pulse' : 'text-muted-foreground'}`} />
            <span className="text-xs font-medium text-foreground">Pipe Directives</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">Push to L0</span>
          </button>
        </div>

        {/* Server Link */}
        <div className="bg-foreground/5 p-4 rounded-lg border border-border/10 flex flex-col gap-3">
          <p className="text-[10px] text-muted-foreground/70 leading-relaxed font-mono">
            Launch the high-fidelity conversational console to engage natural language overrides.
          </p>
          <button
            onClick={() => setIsDuplexOpen(true)}
            className="bg-foreground text-background font-mono uppercase tracking-widest text-[10px] py-2 rounded flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors"
          >
            Open Web Duplex <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
      {isDuplexOpen && <PersonaPlexDuplex onClose={() => setIsDuplexOpen(false)} />}
    </GlassPanel>
  )
}
