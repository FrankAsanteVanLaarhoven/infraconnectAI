// src/components/ui/IntentBar.tsx
'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Search, Command, X } from 'lucide-react'
import { resolveCommand, suggestCommands } from '@/lib/commands/registry'
import type { Command as Cmd } from '@/lib/commands/registry'
import { bus } from '@/lib/events/bus'
import { useBusEvent } from '@/lib/hooks/useBusEvent'

const CATEGORY_COLOR: Record<string, string> = {
  skill:      'text-green-400',
  memory:     'text-blue-400',
  persona:    'text-purple-400',
  bench:      'text-yellow-400',
  panel:      'text-gray-400',
  governance: 'text-orange-400',
}

interface IntentBarProps {
  activeAgentId:   string
  activePersonaId: string | null
}

export function IntentBar({ activeAgentId, activePersonaId }: IntentBarProps) {
  const [value,       setValue]       = useState('')
  const [suggestions, setSuggestions] = useState<Cmd[]>([])
  const [selected,    setSelected]    = useState(-1)
  const [status,      setStatus]      = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: ⌘K to focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur()
        setValue('')
        setSuggestions([])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Listen for external skill run requests (e.g. from VLAMissionControl buttons)
  useBusEvent('memdevos:run-skill', async ({ skill, agentId, personaId, input }) => {
    setStatus(`Running skill: ${skill}...`)
    try {
      const res = await fetch('/api/nemoclaw/run', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer enc_dev',
          'x-iam-clearance': 'L5-GodMode'
        },
        body: JSON.stringify({
          skillId:     skill,
          agentId:     agentId ?? activeAgentId,
          personaId:   personaId ?? activePersonaId,
          input,
          taskSummary: `IntentBar: ${skill}`,
        }),
      })
      const data = await res.json()
      if (data.blocked) {
        bus.emit('memdevos:toast', { message: `Blocked by policy: ${data.reason}`, type: 'warn' })
        setStatus(`Blocked: ${data.reason}`)
      } else {
        bus.emit('memdevos:toast', { message: `Skill ${skill} completed`, type: 'success' })
        setStatus(null)
      }
    } catch {
      bus.emit('memdevos:toast', { message: `Skill ${skill} failed`, type: 'error' })
      setStatus(null)
    }
  }, [activeAgentId, activePersonaId])

  // Listen for ingest events
  useBusEvent('memdevos:ingest', async ({ title, content, type, tags }) => {
    setStatus(`Ingesting: "${title}"...`)
    await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, type, tags }),
    })
    bus.emit('memdevos:toast', { message: `Ingested: "${title}"`, type: 'success' })
    setStatus(null)
  }, [])

  // Listen for persona switch events
  useBusEvent('memdevos:switch-persona', async ({ slug }) => {
    await fetch('/api/personaplex', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'switch', slug }),
    })
    bus.emit('memdevos:toast', { message: `Persona → ${slug}`, type: 'success' })
  }, [])

  // Listen for benchmark events
  useBusEvent('memdevos:run-benchmark', async ({ runTag, agentId, agentType }) => {
    setStatus(`Running benchmark: ${runTag}...`)
    const res = await fetch('/api/capx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'run', runTag, model: 'gpt-4o', agentId, agentType, environment: 'cap-gym' }),
    })
    const data = await res.json()
    bus.emit('memdevos:toast', {
      message: `Benchmark done: ${(data.passRate * 100).toFixed(1)}% pass rate`,
      type: 'success',
    })
    setStatus(null)
  }, [])

  // Listen for governance cycle events
  useBusEvent('memdevos:run-cycle', async () => {
    setStatus('Running governance cycle...')
    await fetch('/api/governance/cycle', { method: 'POST' })
    bus.emit('memdevos:toast', { message: 'Governance cycle complete', type: 'success' })
    setStatus(null)
  }, [])

  const handleChange = useCallback((val: string) => {
    setValue(val)
    setSelected(-1)
    if (val.startsWith('/')) {
      setSuggestions(suggestCommands(val))
    } else {
      setSuggestions([])
    }
  }, [])

  const execute = useCallback((input: string) => {
    const resolved = resolveCommand(input)
    if (resolved) {
      resolved.command.execute(resolved.args, { activeAgentId, activePersonaId })
    } else if (input.trim()) {
      // Free-text: treat as a natural-language intent (emit for future LLM routing)
      bus.emit('memdevos:toast', { message: `Intent: "${input.trim()}"`, type: 'info' })
    }
    setValue('')
    setSuggestions([])
    setSelected(-1)
    inputRef.current?.blur()
  }, [activeAgentId, activePersonaId])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(s => Math.min(s + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(s => Math.max(s - 1, -1))
    } else if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault()
      const idx = selected >= 0 ? selected : 0
      setValue(suggestions[idx].trigger + ' ')
      setSuggestions([])
      setSelected(-1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selected >= 0 && suggestions[selected]) {
        setValue(suggestions[selected].trigger + ' ')
        setSuggestions([])
        setSelected(-1)
      } else {
        execute(value)
      }
    }
  }, [suggestions, selected, value, execute])

  return (
    <div className="relative w-full">
      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/3 border border-white/10
                      rounded-xl focus-within:border-white/25 transition-colors">
        <Search className="w-3.5 h-3.5 text-gray-600 shrink-0" />
        <input
          ref={inputRef}
          value={value}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="State your intent — /spec, /plan, /run <skill>, describe what you need..."
          className="flex-1 bg-transparent text-xs font-mono text-gray-300
                     placeholder:text-gray-600 focus:outline-none"
        />
        {status && (
          <span className="text-xs font-mono text-yellow-500 animate-pulse shrink-0">{status}</span>
        )}
        {value && (
          <button
            aria-label="Clear input"
            onClick={() => { setValue(''); setSuggestions([]) }}
            className="text-gray-700 hover:text-gray-500 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        <div className="flex items-center gap-1 text-gray-700 shrink-0">
          <Command className="w-3 h-3" />
          <span className="text-xs font-mono">K</span>
        </div>
      </div>

      {/* Suggestion dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50
                        bg-[#0e1012] border border-white/10 rounded-xl overflow-hidden
                        shadow-2xl shadow-black/60">
          {suggestions.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => { setValue(cmd.trigger + ' '); setSuggestions([]); inputRef.current?.focus() }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors
                         ${i === selected ? 'bg-white/8' : 'hover:bg-white/4'}`}
            >
              <span className={`text-xs font-mono font-medium w-20 shrink-0 ${CATEGORY_COLOR[cmd.category]}`}>
                {cmd.trigger}
              </span>
              <span className="text-xs text-gray-300 font-mono">{cmd.label}</span>
              {cmd.args && (
                <span className="text-xs text-gray-600 font-mono ml-auto">{cmd.args}</span>
              )}
            </button>
          ))}
          <div className="px-3 py-1.5 border-t border-white/5 flex items-center gap-2">
            <span className="text-xs text-gray-700 font-mono">↑↓ navigate</span>
            <span className="text-xs text-gray-700 font-mono">Tab complete</span>
            <span className="text-xs text-gray-700 font-mono">Enter execute</span>
          </div>
        </div>
      )}
    </div>
  )
}
