import { useEffect, useRef } from 'react'
import { useMemoryStore } from '@/store/memory-store'
import { useFleetStream } from '@/lib/hooks/useFleetStream'

export function useActivityBridge() {
  const addActivity = useMemoryStore(s => s.addActivity)
  const { lastHeartbeat, lastTelemetry, lastIncident, events } = useFleetStream()
  
  // Track last processed IDs to avoid double-logging if SSE re-emits
  const processedRef = useRef<Set<string>>(new Set())

  // Handle Incidents (Highest Priority)
  useEffect(() => {
    if (lastIncident) {
      addActivity({
        id: crypto.randomUUID(),
        action: 'incident',
        target: lastIncident.agentId,
        detail: `SAFETY VIOLATION DETECTED: ${lastIncident.category || 'High Risk'}`,
        metadata: lastIncident,
        createdAt: new Date().toISOString()
      })
    }
  }, [lastIncident, addActivity])

  // Handle Skill Reports
  useEffect(() => {
    const lastEvent = events[0]
    if (lastEvent?.type === 'skill_report') {
      const { data } = lastEvent
      addActivity({
        id: crypto.randomUUID(),
        action: 'skill',
        target: data.agentId,
        detail: `Skill Execution: ${data.skillId || 'Remote Action'} ${data.status.toUpperCase()}`,
        metadata: data,
        createdAt: new Date().toISOString()
      })
    }
  }, [events, addActivity])

  // Handle Capability Sync
  useEffect(() => {
    const lastEvent = events.find(e => e.type === 'heartbeat' && e.data.status === 'live')
    if (lastEvent) {
      addActivity({
        id: crypto.randomUUID(),
        action: 'sync',
        target: lastEvent.data.agentId,
        detail: `Neural Link Established: Synchronizing capability manifest`,
        metadata: lastEvent.data,
        createdAt: new Date().toISOString()
      })
    }
  }, [events, addActivity])
}
