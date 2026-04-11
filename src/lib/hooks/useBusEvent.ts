// src/lib/hooks/useBusEvent.ts
// React hook — subscribe to typed bus events inside components

import { useEffect } from 'react'
import { bus } from '@/lib/events/bus'
import type { MemdevosEventName, MemdevosEventMap } from '@/lib/events/bus'

export function useBusEvent<K extends MemdevosEventName>(
  name: K,
  handler: (detail: MemdevosEventMap[K]) => void,
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    return bus.on(name, handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
