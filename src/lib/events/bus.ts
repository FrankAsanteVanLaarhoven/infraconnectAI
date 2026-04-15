// src/lib/events/bus.ts
// Typed in-browser event bus — replaces all raw window.dispatchEvent calls

export type MemdevosEventMap = {
  // Skill execution
  'infraconnect:run-skill':       { skill: string; agentId?: string; personaId?: string; input?: Record<string, unknown> }
  // Memory
  'infraconnect:promote-node':    { nodeId: string; actor?: string }
  'infraconnect:archive-node':    { nodeId: string }
  'infraconnect:ingest':          { title: string; content: string; type?: string; tags?: string[] }
  // Persona
  'infraconnect:switch-persona':  { slug: string }
  // Navigation / panel
  'infraconnect:open-panel':      { panel: string }
  'infraconnect:close-panel':     { panel: string }
  'infraconnect:toggle-panel':    { panel: string }
  // Industrial Standard Validation
  'infraconnect:run-benchmark':   { runTag: string; agentId: string; agentType: string }
  // Governance
  'infraconnect:run-cycle':       Record<string, never>
  // Toast / notification
  'infraconnect:toast':           { message: string; type: 'info' | 'success' | 'warn' | 'error'; durationMs?: number }
  // Agent bus relay
  'infraconnect:bus-message':     { topic: string; payload: unknown; sender: string }
  // Ephemeral UI
  'infraconnect:generate-ephemeral-ui': { query: string }
  'infraconnect:render-ephemeral-ui':   { layout: any }
}

export type MemdevosEventName = keyof MemdevosEventMap

class TypedEventBus {
  emit<K extends MemdevosEventName>(name: K, detail: MemdevosEventMap[K]): void {
    window.dispatchEvent(new CustomEvent(name, { detail, bubbles: false }))
  }

  on<K extends MemdevosEventName>(
    name: K,
    handler: (detail: MemdevosEventMap[K]) => void,
    options?: AddEventListenerOptions
  ): () => void {
    const listener = (e: Event) => handler((e as CustomEvent).detail)
    window.addEventListener(name, listener, options)
    return () => window.removeEventListener(name, listener)
  }

  once<K extends MemdevosEventName>(
    name: K,
    handler: (detail: MemdevosEventMap[K]) => void
  ): void {
    this.on(name, handler, { once: true })
  }
}

// Singleton — import { bus } everywhere, never instantiate directly
export const bus = new TypedEventBus()
