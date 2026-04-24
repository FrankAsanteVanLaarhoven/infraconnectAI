/**
 * Tactical Command Bus
 * 
 * Orchestrates zero-latency mission commands:
 * - ARM / DISARM (Mission Interlock)
 * - PIVOT (Sector Realignment)
 * - PURGE (Ephemeral Cleanup)
 */

export type TacticalCommand = 
  | { type: 'MISSION_ARM'; payload: { level: 'GREEN' | 'YELLOW' | 'RED' } }
  | { type: 'MISSION_DISARM'; payload: Record<string, never> }
  | { type: 'MISSION_PIVOT'; payload: { sector: string; reason: string } }
  | { type: 'MISSION_PURGE'; payload: { bufferId: string } }
  | { type: 'HARDWARE_ANOMALY'; payload: { nodeId: string; temp: number; vram: number; error?: string } }
  | { type: 'SWARM_GOVERNANCE_LOCKDOWN'; payload: { toxicModels: string } };

class TacticalBus {
  private static instance: TacticalBus;
  private listeners: Map<string, ((cmd: TacticalCommand) => void)[]> = new Map();

  static getInstance() {
    if (!TacticalBus.instance) TacticalBus.instance = new TacticalBus();
    return TacticalBus.instance;
  }

  // Client-side dispatch via CustomEvent for UI reactivity
  dispatch(command: TacticalCommand) {
    console.log(`[TACTICAL_BUS] Dispatching: ${command.type}`, command.payload);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('infraconnect:tactical-command', { detail: command }));
      
      // Asynchronously bridge critical commands to the Kafka control plane
      fetch('/api/ingest', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            topic: 'fleet.commands',
            eventType: command.type,
            payload: command.payload
         })
      }).catch(err => console.warn('[TACTICAL_BUS] Failed to bridge event to Kafka', err));
    }

    // Notify registered JS listeners
    const group = this.listeners.get(command.type) || [];
    group.forEach(listener => listener(command));
  }

  subscribe(type: TacticalCommand['type'], listener: (cmd: TacticalCommand) => void) {
    const group = this.listeners.get(type) || [];
    group.push(listener);
    this.listeners.set(type, group);
    return () => {
      const g = this.listeners.get(type) || [];
      this.listeners.set(type, g.filter(l => l !== listener));
    };
  }
}

export const tacticalBus = TacticalBus.getInstance();

export type InfraConnectEventMap = {
  'infraconnect:open-panel': { panel: string };
  'infraconnect:close-panel': { panel: string };
  'infraconnect:toggle-panel': { panel: string };
  'infraconnect:toast': { title?: string, message?: string, type?: string, description?: string };
  [key: string]: any;
};

export type InfraConnectEventName = keyof InfraConnectEventMap;

class UIEventBus {
  on<K extends InfraConnectEventName>(name: K, handler: (detail: InfraConnectEventMap[K]) => void) {
    if (typeof window === 'undefined') return () => {};
    const fn = (e: any) => handler(e.detail);
    window.addEventListener(name as string, fn);
    return () => window.removeEventListener(name as string, fn);
  }

  emit<K extends InfraConnectEventName>(name: K, detail?: InfraConnectEventMap[K]) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(name as string, { detail }));
    }
  }
}

export const bus = new UIEventBus();

// Core Logical Subscriptions for Control Architecture
// (Legacy bindings disconnected organically to avoid build static trace explosions)
import { onTasksCreated } from "./handlers/taskAllocator";
import { collectExperience } from "@/lib/learning/collector";

bus.on("tasks.created" as any, onTasksCreated as any);
bus.on("tasks.announced" as any, async (task: any) => {
    // Simulated robotic endpoints calculating learned bids natively and emitting independent calculations
    const mockState = { id: "yahboom-m3-pro", position: [-2,0,1] as [number,number,number], battery: 94, status: "idle" as const };
    const bid = { robot_id: mockState.id, task_id: task.id, bid: 10 };
    bus.emit("robots.bid" as any, bid);
});
bus.on("robots.bid" as any, (bid: any) => { console.log("Task Awarded to", bid); });

// The Deep RL Feedback Loop
bus.on("task.completed" as any, (event: any) => {
    collectExperience(event);
});


