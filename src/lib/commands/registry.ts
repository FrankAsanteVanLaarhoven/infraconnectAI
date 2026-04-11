// src/lib/commands/registry.ts
// Every slash-command the IntentBar can dispatch

import { bus } from '@/lib/events/bus'

export interface Command {
  id:          string
  trigger:     string          // slash prefix, e.g. '/run'
  label:       string
  description: string
  args?:       string          // e.g. '<skill-id>'
  category:    'skill' | 'memory' | 'persona' | 'bench' | 'panel' | 'governance'
  execute:     (args: string, context: CommandContext) => void | Promise<void>
}

export interface CommandContext {
  activeAgentId:  string
  activePersonaId: string | null
}

export const COMMAND_REGISTRY: Command[] = [
  // ── Skill commands ──────────────────────────────────────────────────────
  {
    id: 'run-skill',
    trigger: '/run',
    label: 'Run skill',
    description: 'Execute a skill via NemoClaw',
    args: '<skill-id>',
    category: 'skill',
    execute(args, ctx) {
      const skill = args.trim()
      if (!skill) { bus.emit('memdevos:toast', { message: 'Usage: /run <skill-id>', type: 'warn' }); return }
      bus.emit('memdevos:run-skill', { skill, agentId: ctx.activeAgentId, personaId: ctx.activePersonaId ?? undefined })
      bus.emit('memdevos:toast', { message: `Running skill: ${skill}`, type: 'info' })
    },
  },
  // ── Memory commands ─────────────────────────────────────────────────────
  {
    id: 'ingest',
    trigger: '/ingest',
    label: 'Ingest memory',
    description: 'Create a new L0 memory node',
    args: '<title> | tent>',
    category: 'memory',
    execute(args) {
      const [title, ...rest] = args.split('|')
      const content = rest.join('|').trim()
      if (!title || !content) {
        bus.emit('memdevos:toast', { message: 'Usage: /ingest <title> | tent>', type: 'warn' })
        return
      }
      bus.emit('memdevos:ingest', { title: title.trim(), content })
      bus.emit('memdevos:toast', { message: `Ingesting: "${title.trim()}"`, type: 'info' })
    },
  },
  {
    id: 'promote',
    trigger: '/promote',
    label: 'Promote node',
    description: 'Promote a memory node to next stratum',
    args: '<node-id>',
    category: 'memory',
    execute(args) {
      const nodeId = args.trim()
      if (!nodeId) { bus.emit('memdevos:toast', { message: 'Usage: /promote <node-id>', type: 'warn' }); return }
      bus.emit('memdevos:promote-node', { nodeId, actor: 'human' })
      bus.emit('memdevos:toast', { message: `Promoting node: ${nodeId}`, type: 'info' })
    },
  },
  // ── Persona commands ────────────────────────────────────────────────────
  {
    id: 'persona',
    trigger: '/persona',
    label: 'Switch persona',
    description: 'Switch active PersonaPlex persona',
    args: '<slug>',
    category: 'persona',
    execute(args) {
      const slug = args.trim()
      if (!slug) { bus.emit('memdevos:toast', { message: 'Usage: /persona <slug>', type: 'warn' }); return }
      bus.emit('memdevos:switch-persona', { slug })
      bus.emit('memdevos:toast', { message: `Switching persona → ${slug}`, type: 'info' })
    },
  },
  // ── Benchmark commands ──────────────────────────────────────────────────
  {
    id: 'bench',
    trigger: '/bench',
    label: 'Run CaP-X benchmark',
    description: 'Start a CaP-X benchmark run',
    args: '[run-tag]',
    category: 'bench',
    execute(args, ctx) {
      const runTag = args.trim() || `capx-${Date.now()}`
      bus.emit('memdevos:run-benchmark', { runTag, agentId: ctx.activeAgentId, agentType: 'nemoclaw' })
      bus.emit('memdevos:toast', { message: `Benchmark started: ${runTag}`, type: 'info' })
    },
  },
  // ── Panel commands ──────────────────────────────────────────────────────
  {
    id: 'panel-open',
    trigger: '/panel',
    label: 'Open panel',
    description: 'Open a dashboard panel by name',
    args: '<panel-name>',
    category: 'panel',
    execute(args) {
      const panel = args.trim()
      if (!panel) { bus.emit('memdevos:toast', { message: 'Usage: /panel <name>', type: 'warn' }); return }
      bus.emit('memdevos:open-panel', { panel })
    },
  },
  // ── Governance commands ─────────────────────────────────────────────────
  {
    id: 'cycle',
    trigger: '/cycle',
    label: 'Run governance cycle',
    description: 'Trigger immediate governance cycle',
    args: '',
    category: 'governance',
    execute() {
      bus.emit('memdevos:run-cycle', {})
      bus.emit('memdevos:toast', { message: 'Governance cycle triggered', type: 'info' })
    },
  },
  {
    id: 'spec',
    trigger: '/spec',
    label: 'Run /spec skill',
    description: 'Shortcut for /run spec',
    args: '',
    category: 'skill',
    execute(_, ctx) {
      bus.emit('memdevos:run-skill', { skill: 'spec', agentId: ctx.activeAgentId })
      bus.emit('memdevos:toast', { message: 'Running /spec', type: 'info' })
    },
  },
  {
    id: 'plan',
    trigger: '/plan',
    label: 'Run /plan skill',
    description: 'Shortcut for /run plan',
    args: '',
    category: 'skill',
    execute(_, ctx) {
      bus.emit('memdevos:run-skill', { skill: 'plan', agentId: ctx.activeAgentId })
      bus.emit('memdevos:toast', { message: 'Running /plan', type: 'info' })
    },
  },
  {
    id: 'test',
    trigger: '/test',
    label: 'Run /test skill',
    description: 'Shortcut for /run test',
    args: '',
    category: 'skill',
    execute(_, ctx) {
      bus.emit('memdevos:run-skill', { skill: 'test', agentId: ctx.activeAgentId })
      bus.emit('memdevos:toast', { message: 'Running /test', type: 'info' })
    },
  },
]

// Lookup by trigger prefix
export function resolveCommand(input: string): { command: Command; args: string } | null {
  const trimmed = input.trim()
  for (const cmd of COMMAND_REGISTRY) {
    if (trimmed.startsWith(cmd.trigger)) {
      const args = trimmed.slice(cmd.trigger.length).trim()
      return { command: cmd, args }
    }
  }
  return null
}

// Autocomplete suggestions for the IntentBar
export function suggestCommands(partial: string): Command[] {
  const lower = partial.toLowerCase()
  return COMMAND_REGISTRY.filter(
    cmd =>
      cmd.trigger.startsWith(lower) ||
      cmd.label.toLowerCase().includes(lower) ||
      cmd.description.toLowerCase().includes(lower)
  ).slice(0, 6)
}

// Group by category for palette display
export function groupedCommands(): Record<Command['category'], Command[]> {
  const groups: Record<Command['category'], Command[]> = {
    skill: [], memory: [], persona: [], bench: [], panel: [], governance: [],
  }
  for (const cmd of COMMAND_REGISTRY) groups[cmd.category].push(cmd)
  return groups
}
