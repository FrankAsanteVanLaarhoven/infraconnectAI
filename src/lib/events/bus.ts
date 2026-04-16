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
  | { type: 'MISSION_DISARM'; payload: {} }
  | { type: 'MISSION_PIVOT'; payload: { sector: string; reason: string } }
  | { type: 'MISSION_PURGE'; payload: { bufferId: string } };

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

export type MemdevosEventMap = {
  'infraconnect:open-panel': { panel: string };
  'infraconnect:close-panel': { panel: string };
  'infraconnect:toggle-panel': { panel: string };
  'infraconnect:toast': { title?: string, message?: string, type?: string, description?: string };
  [key: string]: any;
};

export type MemdevosEventName = keyof MemdevosEventMap;

class UIEventBus {
  on<K extends MemdevosEventName>(name: K, handler: (detail: MemdevosEventMap[K]) => void) {
    if (typeof window === 'undefined') return () => {};
    const fn = (e: any) => handler(e.detail);
    window.addEventListener(name as string, fn);
    return () => window.removeEventListener(name as string, fn);
  }

  emit<K extends MemdevosEventName>(name: K, detail?: MemdevosEventMap[K]) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(name as string, { detail }));
    }
  }
}

export const bus = new UIEventBus();
