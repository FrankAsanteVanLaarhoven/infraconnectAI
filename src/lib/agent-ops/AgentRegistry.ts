import type { WebSocket } from 'ws'
import { EventEmitter } from 'events'

class AgentRegistry extends EventEmitter {
  private connections = new Map<string, WebSocket>()

  registerAgent(agentId: string, socket: WebSocket) {
    console.log(`[AgentRegistry] Registering agent: ${agentId}`)
    this.connections.set(agentId, socket)
    this.emit('connected', agentId)
  }

  unregisterAgent(agentId: string) {
    console.log(`[AgentRegistry] Unregistering agent: ${agentId}`)
    this.connections.delete(agentId)
    this.emit('disconnected', agentId)
  }

  getAgentSocket(agentId: string): WebSocket | undefined {
    return this.connections.get(agentId)
  }

  getAllActiveAgentIds(): string[] {
    return Array.from(this.connections.keys())
  }

  isOpen(agentId: string): boolean {
    const socket = this.connections.get(agentId)
    return socket?.readyState === 1 // OPEN
  }

  /**
   * Dispatches a message to a specific agent.
   */
  async dispatch(agentId: string, type: string, data: any): Promise<boolean> {
    const socket = this.connections.get(agentId)
    if (!socket || socket.readyState !== 1) {
      console.warn(`[AgentRegistry] Cannot dispatch to ${agentId}: Not connected`)
      return false
    }

    socket.send(JSON.stringify({ type, data }))
    return true
  }
}

export const agentRegistry = new AgentRegistry()
