/**
 * Universal Infrastructure Event Schema
 * 
 * The single source of truth for all events crossing the real-time spine
 * from the backend physical system to the frontend React layer.
 */

export type InfraEvent =
  | { type: "NODE_CONNECTED"; nodeId: string; timestamp: string }
  | { type: "TELEMETRY"; temp: number; load: number; status: string; collisionRate?: number }
  | { type: "DEPLOY_STARTED"; version: string; targetRole: string }
  | { type: "DEPLOY_COMPLETE"; version: string; hash: string }
  | { type: "ANOMALY_DETECTED"; severity: number; details: string }
  | { type: "TRUST_LOCK"; hash: string; signature: string };

/**
 * Lightweight Global Broadcaster (Memory-based implementation for Next.js API Routes)
 * In a real scaled environment, this bridges to Redis Pub/Sub.
 */
type Listener = (event: InfraEvent) => void;

class GlobalEventBus {
  private static instance: GlobalEventBus;
  private listeners: Set<Listener> = new Set();
  
  // Cache the last few events so new connections get immediate context
  public lastEvents: InfraEvent[] = [];

  static getInstance() {
    // Next.js dev server reloads can clear singletons if not mounted globally. 
    // Attaching to global allows persistence across edge/lambda soft-reloads where possible.
    if (!(global as any)._infraEventBus) {
      (global as any)._infraEventBus = new GlobalEventBus();
    }
    return (global as any)._infraEventBus;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  broadcast(event: InfraEvent) {
    this.lastEvents.push(event);
    if (this.lastEvents.length > 50) this.lastEvents.shift();
    
    this.listeners.forEach(l => l(event));
  }
}

export const eventBus = GlobalEventBus.getInstance();
