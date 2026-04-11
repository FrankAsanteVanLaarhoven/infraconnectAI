// src/lib/events/bus.ts
// Typed in-browser event bus — replaces all raw window.dispatchEvent calls

export type MemdevosEventMap = {
  // Skill execution
  'memdevos:run-skill':       { skill: string; agentId?: string; personaId?: string; input?: Record<string, unknown> }
  // Memory
  'memdevos:promote-node':    { nodeId: string; actor?: string }
  'memdevos:archive-node':    { nodeId: string }
  'memdevos:ingest':          { title: string; content: string; type?: string; tags?: string[] }
  // Persona
  'memdevos:switch-persona':  { slug: string }
  // Navigation / panel
  'memdevos:open-panel':      { panel: string }
  'memdevos:close-panel':     { panel: string }
  'memdevos:toggle-panel':    { panel: string }
  // CaP-X
  'memdevos:run-benchmark':   { runTag: string; agentId: string; agentType: string }
  // Governance
  'memdevos:run-cycle':       Record<string, never>
  // Toast / notification
  'memdevos:toast':           { message: string; type: 'info' | 'success' | 'warn' | 'error'; durationMs?: number }
  // Agent bus relay
  'memdevos:bus-message':     { topic: string; payload: unknown; sender: string }
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
