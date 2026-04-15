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
      if (!skill) { bus.emit('infraconnect:toast', { message: 'Usage: /run <skill-id>', type: 'warn' }); return }
      bus.emit('infraconnect:run-skill', { skill, agentId: ctx.activeAgentId, personaId: ctx.activePersonaId ?? undefined })
      bus.emit('infraconnect:toast', { message: `Running skill: ${skill}`, type: 'info' })
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
        bus.emit('infraconnect:toast', { message: 'Usage: /ingest <title> | tent>', type: 'warn' })
        return
      }
      bus.emit('infraconnect:ingest', { title: title.trim(), content })
      bus.emit('infraconnect:toast', { message: `Ingesting: "${title.trim()}"`, type: 'info' })
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
      if (!nodeId) { bus.emit('infraconnect:toast', { message: 'Usage: /promote <node-id>', type: 'warn' }); return }
      bus.emit('infraconnect:promote-node', { nodeId, actor: 'human' })
      bus.emit('infraconnect:toast', { message: `Promoting node: ${nodeId}`, type: 'info' })
    },
  },
  // ── Persona commands ────────────────────────────────────────────────────
  {
    id: 'persona',
    trigger: '/persona',
    label: 'Switch persona',
    description: 'Switch active Cognitive Core persona',
    args: '<slug>',
    category: 'persona',
    execute(args) {
      const slug = args.trim()
      if (!slug) { bus.emit('infraconnect:toast', { message: 'Usage: /persona <slug>', type: 'warn' }); return }
      bus.emit('infraconnect:switch-persona', { slug })
      bus.emit('infraconnect:toast', { message: `Switching persona → ${slug}`, type: 'info' })
    },
  },
  // ── Benchmark commands ──────────────────────────────────────────────────
  {
    id: 'bench',
    trigger: '/bench',
    label: 'Run Validation Standard benchmark',
    description: 'Start an Industrial Standard validation run',
    args: '[run-tag]',
    category: 'bench',
    execute(args, ctx) {
      const runTag = args.trim() || `validation-${Date.now()}`
      bus.emit('infraconnect:run-benchmark', { runTag, agentId: ctx.activeAgentId, agentType: 'nemoclaw' })
      bus.emit('infraconnect:toast', { message: `Benchmark started: ${runTag}`, type: 'info' })
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
      if (!panel) { bus.emit('infraconnect:toast', { message: 'Usage: /panel <name>', type: 'warn' }); return }
      bus.emit('infraconnect:open-panel', { panel })
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
      bus.emit('infraconnect:run-cycle', {})
      bus.emit('infraconnect:toast', { message: 'Governance cycle triggered', type: 'info' })
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
      bus.emit('infraconnect:run-skill', { skill: 'spec', agentId: ctx.activeAgentId })
      bus.emit('infraconnect:toast', { message: 'Running /spec', type: 'info' })
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
      bus.emit('infraconnect:run-skill', { skill: 'plan', agentId: ctx.activeAgentId })
      bus.emit('infraconnect:toast', { message: 'Running /plan', type: 'info' })
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
      bus.emit('infraconnect:run-skill', { skill: 'test', agentId: ctx.activeAgentId })
      bus.emit('infraconnect:toast', { message: 'Running /test', type: 'info' })
    },
  },
  {
    id: 'hud-toggle',
    trigger: '/hud',
    label: 'Toggle Neural HUD',
    description: 'Activate tactical operator overlay',
    args: '',
    category: 'panel',
    execute() {
      // We'll use the event bus to toggle HUD since we might not want to import the store here
      bus.emit('infraconnect:toggle-panel', { panel: 'hud' })
    },
  },
  {
    id: 'atlas-toggle',
    trigger: '/atlas',
    label: 'Toggle Intelligence Atlas',
    description: 'Switch to 3D sub-orbital infrastructure view',
    args: '',
    category: 'panel',
    execute() {
      bus.emit('infraconnect:toggle-panel', { panel: 'atlas' })
    },
  },
  {
    id: 'topology-toggle',
    trigger: '/topology',
    label: 'Toggle Neural Topology',
    description: 'Visualize logical infrastructure graph',
    args: '',
    category: 'panel',
    execute() {
      bus.emit('infraconnect:toggle-panel', { panel: 'topology' })
    },
  },
  {
    id: 'ota-toggle',
    trigger: '/ota',
    label: 'Toggle CI/CD Pipeline',
    description: 'Trigger edge fleet software rollouts',
    args: '',
    category: 'panel',
    execute() {
      bus.emit('infraconnect:toggle-panel', { panel: 'ota' })
    },
  },
  {
    id: 'mlops-toggle',
    trigger: '/mlops',
    label: 'Toggle MLOps Studio',
    description: 'Track simulation and safety violation rates',
    args: '',
    category: 'panel',
    execute() {
      bus.emit('infraconnect:toggle-panel', { panel: 'model-perf' })
    },
  },
  {
    id: 'sim2real-toggle',
    trigger: '/sim2real',
    label: 'Toggle Sim-to-Real Cascade',
    description: 'Autonomous L0 to Live Fleet deployment',
    args: '',
    category: 'panel',
    execute() {
      bus.emit('infraconnect:toggle-panel', { panel: 'sim2real' })
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
