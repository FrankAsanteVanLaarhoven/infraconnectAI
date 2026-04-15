import { EventEmitter } from 'events'

/**
 * ServerHub is a singleton EventEmitter that lives in the server process.
 * It bridges events from the WebSocket agents to the SSE (Server-Sent Events) stream.
 */
class ServerHub extends EventEmitter {
  constructor() {
    super()
    this.setMaxListeners(100)
    console.log('[ServerHub] Initialized')
  }

  broadcast(event: string, data: any) {
    this.emit('message', { event, data })
  }
}

// In Next.js, we need to ensure this is a true singleton across HMR
// during development.
const globalWithHub = global as typeof globalThis & {
  __server_hub?: ServerHub
}

export const serverHub = globalWithHub.__server_hub || new ServerHub()

if (process.env.NODE_ENV !== 'production') {
  globalWithHub.__server_hub = serverHub
}
