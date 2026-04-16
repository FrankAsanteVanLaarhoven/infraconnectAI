/**
 * InfraConnect Sovereign Client SDK
 * 
 * A lightweight, event-driven bridge for enterprise partners.
 * Integrated directly into partner dashboards to receive real-time tactical events.
 */

export interface InfraconnectEvent {
  id: string;
  category: 'SECURITY' | 'TACTICAL' | 'REVENUE' | 'GOVERNANCE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  timestamp: string;
}

export class InfraconnectClient {
  private socket: WebSocket | null = null;
  private listeners: Map<string, ((event: InfraconnectEvent) => void)[]> = new Map();
  private apiKey: string;
  private endpoint: string;

  constructor(apiKey: string, endpoint: string = 'wss://api.infraconnect.ai/uplink') {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
  }

  async connect() {
    console.log(`[INFRA-SDK] Initializing Sovereign Uplink via API_KEY: ${this.apiKey.slice(0, 8)}...`);
    
    // In a real implementation, we would establish a secure WebSocket connection
    // For this simulation, we'll use a mocked event emitter
    this.simulateConnection();
  }

  private simulateConnection() {
    this.socket = { readyState: 1 } as any;
    console.log("[INFRA-SDK] Uplink Synchronized. Listening for Tactical Pulses.");
  }

  on(category: string | 'ALL', callback: (event: InfraconnectEvent) => void) {
    const list = this.listeners.get(category) || [];
    list.push(callback);
    this.listeners.set(category, list);
  }

  /**
   * Internal dispatcher for simulated events
   */
  emit(event: InfraconnectEvent) {
    const listeners = [
      ...(this.listeners.get('ALL') || []),
      ...(this.listeners.get(event.category) || [])
    ];
    listeners.forEach(cb => cb(event));
  }
}

// Global drop-in initializer
export function initInfraconnect(apiKey: string) {
  const client = new InfraconnectClient(apiKey);
  client.connect();
  return client;
}
