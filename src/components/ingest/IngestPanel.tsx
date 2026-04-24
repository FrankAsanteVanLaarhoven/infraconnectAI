'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Cpu, BookOpen, Globe, FlaskConical, FileCode2, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { GlassPanel, GlassCard } from '@/components/glass/GlassPanel'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useMemoryStore } from '@/store/memory-store'

type SourceType = 'paper' | 'ros2_log' | 'sim_telemetry' | 'meeting_note' | 'url' | 'generic'

interface IngestResult {
  rawNodeId: string
  wikiNodeId: string
  extracted: string
  conflictIds: string[]
  conflictCount: number
}

const SOURCE_TYPES: { type: SourceType; label: string; icon: any; color: string; placeholder: string }[] = [
  { type: 'paper', label: 'Research Paper', icon: BookOpen, color: 'text-blue-400', placeholder: 'Paste paper abstract or full text...' },
  { type: 'sim_telemetry', label: 'Sim Telemetry', icon: FlaskConical, color: 'text-slate-300', placeholder: 'Paste Isaac Sim run log or metrics JSON...' },
  { type: 'ros2_log', label: 'ROS2 Log', icon: Cpu, color: 'text-yellow-400', placeholder: 'Paste ROS2 topic list, bag summary, or error output...' },
  { type: 'meeting_note', label: 'Meeting Note', icon: FileText, color: 'text-slate-400', placeholder: 'Paste supervision meeting notes or transcript...' },
  { type: 'url', label: 'Web Article', icon: Globe, color: 'text-cyan-400', placeholder: 'Paste article text (use Obsidian Web Clipper for best results)...' },
  { type: 'generic', label: 'Generic Doc', icon: FileCode2, color: 'text-gray-400', placeholder: 'Paste any document content...' },
]

export function IngestPanel() {
  const [selectedType, setSelectedType] = useState<SourceType>('paper')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<IngestResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { fetchNodes } = useMemoryStore() as any

  const activeType = SOURCE_TYPES.find((t) => t.type === selectedType)!

  async function handleIngest() {
    if (!title.trim() || !content.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title,
          type: selectedType,
          url: url || undefined,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ingest failed')
      setResult(data)
      await fetchNodes()
      setTitle('')
      setContent('')
      setUrl('')
      setTags('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ingest failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassPanel title="Memory Ingest" {...{icon: <Upload className="w-4 h-4" />, glow: true} as any}>
      <div className="space-y-4">
        {/* Source type selector */}
        <div className="grid grid-cols-3 gap-2">
          {SOURCE_TYPES.map(({ type, label, icon: Icon, color }) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex flex-col items-center gap-1 p-2 rounded-sm border transition-all text-xs ${
                selectedType === type
                  ? 'border-white/40 bg-white/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <Icon {...{className: `w-5 h-5 ${color}`} as any} />
              {label}

            </button>
          ))}
        </div>

        <Input
          placeholder="Title (e.g. Navigation Paper 2026)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        {selectedType === 'url' && (
          <Input
            placeholder="URL (optional)"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        )}
        
        <Input
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <Textarea
          placeholder={activeType.placeholder}
          className="min-h-[150px] font-mono text-xs text-white bg-black/40 border-white/10 placeholder:text-white/30"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <Button 
          className="w-full bg-blue-600 hover:bg-blue-500 text-white" 
          onClick={handleIngest}
          disabled={loading || !title.trim() || !content.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
            </>
          ) : (
            'Ingest to Memory'
          )}
        </Button>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-sm border border-red-500/30 bg-red-500/10">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <GlassCard className="p-4 space-y-3 mt-4" glow>
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Successfully Ingested
                </div>
                
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="text-gray-300 border-white/20">
                    L0 Scratch: {result.rawNodeId.slice(0, 8)}
                  </Badge>
                  <Badge variant="outline" className="text-slate-400 border-slate-800">
                    L1 Wiki: {result.wikiNodeId.slice(0, 8)}
                  </Badge>
                  {result.conflictCount > 0 && (
                    <Badge variant="destructive" className="bg-red-500 text-white">
                      {result.conflictCount} Conflicts Detected
                    </Badge>
                  )}
                </div>

                <div className="max-h-40 overflow-y-auto rounded bg-black/60 p-2 text-xs font-mono text-gray-300">
                  <pre className="whitespace-pre-wrap">{result.extracted}</pre>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassPanel>
  )
}
