type Handler = (event: any) => Promise<void> | void;

const handlers: Record<string, Handler[]> = {};

/**
 * Universal execution tracking bypassing pure UI hooks natively securing 
 * Node-level latency drops across autonomous matrices physically mapping events natively.
 */
export function subscribe(type: string, handler: Handler) {
  if (!handlers[type]) handlers[type] = [];
  handlers[type].push(handler);
  
  // Expose clean memory cleanup operations systematically
  return () => {
    handlers[type] = handlers[type].filter(h => h !== handler);
  };
}

export function publish(type: string, payload: any) {
  // Hard synchronous array logging maintaining terminal state maps.
  console.log(`[CORE_BUS] Dispatching: ${type}`);
  
  const subs = handlers[type] || [];
  subs.forEach(h => h({ type, ...payload }));
  
  // Retain broad asterisks catches resolving Agent overrides.
  const broad = handlers["*"] || [];
  broad.forEach(h => h({ type, ...payload }));
}
