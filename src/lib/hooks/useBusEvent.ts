// src/lib/hooks/useBusEvent.ts
// React hook — subscribe to typed bus events inside components

import { useEffect } from 'react'
import { bus } from '@/lib/events/bus'
import type { InfraConnectEventName, InfraConnectEventMap } from '@/lib/events/bus'

export function useBusEvent<K extends InfraConnectEventName>(
  name: K,
  handler: (detail: InfraConnectEventMap[K]) => void,
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    return bus.on(name, handler)
  }, deps)
}
